import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

const topicMatchers: Array<{ topic: string; pattern: RegExp }> = [
  { topic: "Software & coding", pattern: /\b(code|coding|program|software|bug|api|website|app|javascript|python|database)\b/i },
  { topic: "Learning & education", pattern: /\b(learn|explain|study|school|course|math|science|history|teach|homework)\b/i },
  { topic: "Writing & communication", pattern: /\b(write|writing|email|letter|essay|grammar|rewrite|message|resume|copy)\b/i },
  { topic: "Research & current events", pattern: /\b(research|latest|news|current|compare|source|report|analysis|information)\b/i },
  { topic: "Business & careers", pattern: /\b(business|career|job|interview|marketing|sales|startup|finance|customer)\b/i },
  { topic: "Creative ideas", pattern: /\b(creative|story|design|image|poem|brainstorm|name|script|art)\b/i },
  { topic: "Planning & productivity", pattern: /\b(plan|planning|organize|schedule|productivity|goal|travel|routine|task)\b/i },
];

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const rows = await getDb()`SELECT title FROM conversations`;
    const counts = new Map<string, number>();
    for (const { title } of rows) {
      const matched = topicMatchers.find(({ pattern }) => pattern.test(String(title)));
      const topic = matched?.topic || "General questions";
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }

    const topics = [...counts.entries()]
      .map(([topic, conversations]) => ({ topic, conversations }))
      .sort((a, b) => b.conversations - a.conversations);

    return NextResponse.json({ totalConversations: rows.length, topics });
  } catch (error) {
    console.error("Admin reports failed:", error);
    return NextResponse.json({ error: "Unable to load topic reports." }, { status: 500 });
  }
}
