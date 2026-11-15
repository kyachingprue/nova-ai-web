import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const requestedDays = Number(new URL(request.url).searchParams.get("days") || "30");
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const data = await getDb()`WITH days AS (
        SELECT generate_series(CURRENT_DATE - (${days} - 1), CURRENT_DATE, INTERVAL '1 day')::date AS day
      ),
      new_users AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM users
        WHERE created_at >= CURRENT_DATE - (${days} - 1) GROUP BY created_at::date
      ),
      conversations AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM conversations
        WHERE created_at >= CURRENT_DATE - (${days} - 1) GROUP BY created_at::date
      ),
      messages AS (
        SELECT created_at::date AS day, COUNT(*) AS total FROM messages
        WHERE role = 'user' AND created_at >= CURRENT_DATE - (${days} - 1) GROUP BY created_at::date
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
    const db = getDb();
    const [roleDistribution, planDistribution, audience] = await Promise.all([
      db`SELECT role AS name, COUNT(*)::int AS users FROM users GROUP BY role ORDER BY role`,
      db`SELECT plan AS name, COUNT(*)::int AS users FROM users GROUP BY plan ORDER BY plan`,
      db`SELECT
        (SELECT COUNT(*)::int FROM users) AS "totalUsers",
        (SELECT COUNT(DISTINCT c.user_id)::int FROM conversations c
          JOIN messages m ON m.conversation_id = c.id
          WHERE m.role = 'user' AND m.created_at >= CURRENT_DATE - (${days} - 1)) AS "activeUsers"`,
    ]);

    return NextResponse.json({
      rangeDays: days,
      days: data.map((row) => ({
        ...row,
        users: Number(row.users),
        conversations: Number(row.conversations),
        messages: Number(row.messages),
      })),
      roleDistribution: roleDistribution.map((row) => ({ ...row, users: Number(row.users) })),
      planDistribution: planDistribution.map((row) => ({ ...row, users: Number(row.users) })),
      totalUsers: Number(audience[0].totalUsers),
      activeUsers: Number(audience[0].activeUsers),
    });
  } catch (error) {
    console.error("Admin analytics failed:", error);
    return NextResponse.json({ error: "Unable to load analytics." }, { status: 500 });
  }
}
