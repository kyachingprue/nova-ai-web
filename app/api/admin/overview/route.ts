import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const db = getDb();
    const [stats] = await db`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS "totalUsers",
        (SELECT COUNT(*) FROM users WHERE role = 'admin')::int AS "adminUsers",
        (SELECT COUNT(*) FROM conversations)::int AS "totalConversations",
        (SELECT COUNT(*) FROM messages WHERE role = 'user')::int AS "totalMessages",
        (SELECT COUNT(*) FROM messages WHERE role = 'user' AND created_at >= date_trunc('day', NOW()))::int AS "messagesToday",
        (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', NOW()))::int AS "newUsersThisMonth",
        (SELECT COUNT(DISTINCT c.user_id) FROM conversations c
          JOIN messages m ON m.conversation_id = c.id
          WHERE m.created_at >= NOW() - INTERVAL '30 days')::int AS "activeUsers30Days"
    `;
    const recentUsers = await db`SELECT id, first_name AS "firstName", last_name AS "lastName",
      email, image_url AS "imageUrl", role, plan, created_at AS "createdAt"
      FROM users ORDER BY created_at DESC LIMIT 8`;

    return NextResponse.json({
      stats: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value)])),
      recentUsers,
    });
  } catch (error) {
    console.error("Admin overview failed:", error);
    return NextResponse.json({ error: "Unable to load the admin overview." }, { status: 500 });
  }
}
