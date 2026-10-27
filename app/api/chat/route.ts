import { NextResponse } from "next/server";
import { z } from "zod";
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 503 });

  try {
    await ensureSchema();
    const db = getDb();
    const [conversation] = await db`SELECT id FROM conversations
      WHERE id = ${parsed.data.conversationId} AND user_id = ${userId} LIMIT 1`;
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const history = await db`SELECT role, content FROM messages
      WHERE conversation_id = ${parsed.data.conversationId} ORDER BY created_at DESC LIMIT 20`;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: [
                "You are Nova, a capable, warm, and dependable general-purpose AI assistant.",
                "Help with the user's actual request, including explanations, brainstorming, writing and editing, dialogue, study help, analysis, and programming in any common language.",
                "Adapt the depth and tone to the request. Be direct, useful, and honest; ask a brief clarifying question only when essential.",
                "Format answers in readable GitHub-flavored Markdown. Use headings and lists when they improve clarity. Put code in fenced blocks with the correct language identifier, explain important assumptions, and do not wrap an entire answer in a code fence.",
                "For letters and dialogue, provide polished, natural text in the requested voice. For technical answers, give correct, practical steps and mention relevant limitations.",
                "Use web search when current facts or external sources would materially improve the answer. Never invent citations, quotations, or search results.",
              ].join(" "),
            }],
          },
          contents: [
            ...history.reverse().map((entry) => ({
              role: entry.role === "assistant" ? "model" : "user",
              parts: [{ text: String(entry.content) }],
            })),
            { role: "user", parts: [{ text: parsed.data.message }] },
          ],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(60000),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      let providerStatus: string | undefined;
      try {
        const providerError: unknown = JSON.parse(errorText);
        if (
          typeof providerError === "object" &&
          providerError !== null &&
          "error" in providerError &&
          typeof providerError.error === "object" &&
          providerError.error !== null &&
          "status" in providerError.error &&
          typeof providerError.error.status === "string"
        ) {
          providerStatus = providerError.error.status;
        }
      } catch {
        // Providers may return a non-JSON error body.
      }

      if (response.status === 429 || providerStatus === "RESOURCE_EXHAUSTED") {
        console.warn("Gemini project quota is exhausted.", { status: response.status, providerStatus });
        return NextResponse.json(
          {
            error:
              "Gemini API quota is exhausted for this project. Check your usage and billing at ai.google.dev/rate-limit, then try again. Your message has been kept so you can retry.",
          },
          {
            status: 429,
            headers: response.headers.has("retry-after")
              ? { "Retry-After": response.headers.get("retry-after") || "" }
              : undefined,
          },
        );
      }

      console.error("Gemini request failed:", response.status, providerStatus || "unknown provider error");
      return NextResponse.json({ error: "Gemini could not answer right now. Please try again." }, { status: 502 });
    }
    const result = await response.json();
    const candidate = result.candidates?.[0];
    const answer = candidate?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (!answer) return NextResponse.json({ error: "Gemini returned an empty response. Please try again." }, { status: 502 });
    const sources = (candidate?.groundingMetadata?.groundingChunks || [])
      .map((chunk: { web?: { uri?: string; title?: string } }) => chunk.web)
      .filter((web: { uri?: string } | undefined): web is { uri: string; title?: string } => Boolean(web?.uri))
      .map((web: { uri: string; title?: string }) => ({ url: web.uri, title: web.title || web.uri }));
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
    console.error("Chat request failed:", error);
    return NextResponse.json({ error: "The chat request failed. Please try again." }, { status: 500 });
  }
}
