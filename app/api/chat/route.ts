import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSettings } from "@/lib/admin-settings";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

const schema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().trim().min(1).max(10000),
});

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in to chat." }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a message (up to 10,000 characters)." }, { status: 400 });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured on the server." }, { status: 503 });

  try {
    await ensureSchema();
    const db = getDb();
    const [conversation] = await db`SELECT id FROM conversations
      WHERE id = ${parsed.data.conversationId} AND user_id = ${userId} LIMIT 1`;
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const [account] = await db`SELECT role, plan FROM users WHERE id = ${userId} LIMIT 1`;
    if (!account) return NextResponse.json({ error: "Please sign in to chat." }, { status: 401 });
    const settings = await getAdminSettings();
    if (account.role !== "admin" && account.plan === "free") {
      const [usage] = await db`SELECT COUNT(*)::int AS total FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE c.user_id = ${userId} AND m.role = 'user'
          AND m.created_at >= date_trunc('month', NOW())`;
      if (Number(usage.total) >= settings.freeMonthlyMessageLimit) {
        return NextResponse.json(
          { error: "You reached this month's free AI message limit. Try again next month." },
          { status: 429 },
        );
      }
    }
    const history = await db`SELECT role, content FROM messages
      WHERE conversation_id = ${parsed.data.conversationId} ORDER BY created_at DESC LIMIT 20`;
    const model = settings.defaultModel;
    const webSearchEnabled = settings.webSearchEnabled;
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(process.env.APP_URL ? { "HTTP-Referer": process.env.APP_URL } : {}),
          "X-OpenRouter-Title": "Nova AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: [
                "You are Nova, a capable, warm, and dependable general-purpose AI assistant.",
                "Help with the user's actual request, including explanations, brainstorming, writing and editing, dialogue, study help, analysis, and programming in any common language.",
                "Adapt the depth and tone to the request. Be direct, useful, and honest; ask a brief clarifying question only when essential.",
                "Format answers in readable GitHub-flavored Markdown. Use headings and lists when they improve clarity. Put code in fenced blocks with the correct language identifier, explain important assumptions, and do not wrap an entire answer in a code fence.",
                "For letters and dialogue, provide polished, natural text in the requested voice. For technical answers, give correct, practical steps and mention relevant limitations.",
                webSearchEnabled
                  ? "Use web search when current facts or external sources would materially improve the answer. Cite only sources returned by web search."
                  : "Web search is not enabled. Be clear when current facts may be outdated, and never invent citations or claim to have searched the web.",
              ].join(" "),
            },
            ...history.reverse().map((entry) => ({
              role: entry.role === "assistant" ? "assistant" : "user",
              content: String(entry.content),
            })),
            { role: "user", content: parsed.data.message },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          ...(webSearchEnabled ? { plugins: [{ id: "web", max_results: 3 }] } : {}),
        }),
        signal: AbortSignal.timeout(120000),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      let providerCode: number | undefined;
      try {
        const providerError: unknown = JSON.parse(errorText);
        if (
          typeof providerError === "object" &&
          providerError !== null &&
          "error" in providerError &&
          typeof providerError.error === "object" &&
          providerError.error !== null &&
          "code" in providerError.error &&
          typeof providerError.error.code === "number"
        ) {
          providerCode = providerError.error.code;
        }
      } catch {
        // OpenRouter may return a non-JSON error body.
      }

      if (response.status === 429) {
        console.warn("OpenRouter free-model rate limit reached.", { status: response.status, providerCode });
        return NextResponse.json(
          {
            error: "OpenRouter's free-model rate limit was reached. Please wait and try again. Your draft remains in the message box.",
          },
          {
            status: 429,
            headers: response.headers.has("retry-after")
              ? { "Retry-After": response.headers.get("retry-after") || "" }
              : undefined,
          },
        );
      }

      console.error("OpenRouter request failed:", response.status, providerCode || "unknown provider error");
      if (response.status === 401) {
        return NextResponse.json({ error: "OpenRouter rejected the API key. Check OPENROUTER_API_KEY on the server." }, { status: 502 });
      }
      return NextResponse.json({ error: "OpenRouter could not answer right now. Please try again." }, { status: 502 });
    }
    const result: {
      choices?: Array<{
        message?: {
          content?: string | null;
          annotations?: Array<{
            type?: string;
            url_citation?: { url?: string; title?: string };
          }>;
        };
      }>;
    } = await response.json();
    const assistantMessage = result.choices?.[0]?.message;
    const answer = typeof assistantMessage?.content === "string" ? assistantMessage.content.trim() : "";
    if (!answer) return NextResponse.json({ error: "OpenRouter returned an empty response. Please try again." }, { status: 502 });
    const sources = (assistantMessage?.annotations || []).flatMap((annotation) => {
      const citation = annotation.url_citation;
      if (annotation.type !== "url_citation" || !citation?.url) return [];
      try {
        const url = new URL(citation.url);
        if (url.protocol !== "http:" && url.protocol !== "https:") return [];
        return [{ url: url.href, title: citation.title || url.href }];
      } catch {
        return [];
      }
    });
    await db`INSERT INTO messages (conversation_id, role, content)
      VALUES (${parsed.data.conversationId}, 'user', ${parsed.data.message})`;
    const [saved] = await db`INSERT INTO messages (conversation_id, role, content, sources)
      VALUES (${parsed.data.conversationId}, 'assistant', ${answer}, ${JSON.stringify(sources)}::jsonb)
      RETURNING id, created_at AS "createdAt"`;
    const title = parsed.data.message.replace(/\s+/g, " ").slice(0, 64);
    await db`UPDATE conversations SET
      title = CASE WHEN title = 'New conversation' THEN ${title} ELSE title END,
      updated_at = NOW() WHERE id = ${parsed.data.conversationId}`;
    return NextResponse.json({
      message: { id: saved.id, role: "assistant", content: answer, sources, createdAt: saved.createdAt },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.warn("OpenRouter request timed out.");
      return NextResponse.json(
        { error: "The free model is taking longer than expected. Please try again; your draft remains in the message box." },
        { status: 504 },
      );
    }
    console.error("Chat request failed:", error);
    return NextResponse.json({ error: "The chat request failed. Please try again." }, { status: 500 });
  }
}
