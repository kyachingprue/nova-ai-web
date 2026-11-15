import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const data = await getDb()`WITH days AS (
        SELECT generate_series(CURRENT_DATE - 29, CURRENT_DATE, INTERVAL '1 day')::date AS day
      ),
      new_users AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM users
        WHERE created_at >= CURRENT_DATE - 29 GROUP BY created_at::date
      ),
      conversations AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM conversations
        WHERE created_at >= CURRENT_DATE - 29 GROUP BY created_at::date
      ),
      messages AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM messages
        WHERE role = 'user' AND created_at >= CURRENT_DATE - 29 GROUP BY created_at::date
      )
      SELECT to_char(days.day, 'YYYY-MM-DD') AS date,
        COALESCE(new_users.total, 0)::int AS users,
        COALESCE(conversations.total, 0)::int AS conversations,
        COALESCE(messages.total, 0)::int AS messages
      FROM days
      LEFT JOIN new_users ON new_users.day = days.day
      LEFT JOIN conversations ON conversations.day = days.day
      LEFT JOIN messages ON messages.day = days.day
      ORDER BY days.day`;

    return NextResponse.json({
      days: data.map((row) => ({
        ...row,
        users: Number(row.users),
        conversations: Number(row.conversations),
        messages: Number(row.messages),
      })),
    });
  } catch (error) {
    console.error("Admin analytics failed:", error);
    return NextResponse.json({ error: "Unable to load analytics." }, { status: 500 });
  }
}
