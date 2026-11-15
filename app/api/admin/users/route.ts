import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

const pageSize = 25;

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const searchParams = new URL(request.url).searchParams;
  const search = (searchParams.get("q") || "").trim().slice(0, 100);
  const requestedPage = Number(searchParams.get("page") || "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const query = search ? `%${search}%` : "";

  try {
    const db = getDb();
    const [count] = await db`SELECT COUNT(*)::int AS total FROM users
      WHERE ${search === ""} OR first_name ILIKE ${query} OR last_name ILIKE ${query}
        OR email ILIKE ${query}`;
    const users = await db`SELECT id, first_name AS "firstName", last_name AS "lastName",
      email, image_url AS "imageUrl", role, plan,
      subscription_status AS "subscriptionStatus", created_at AS "createdAt"
      FROM users
      WHERE ${search === ""} OR first_name ILIKE ${query} OR last_name ILIKE ${query}
        OR email ILIKE ${query}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    return NextResponse.json({
      users,
      page,
      pageSize,
      total: Number(count.total),
      pages: Math.max(1, Math.ceil(Number(count.total) / pageSize)),
    });
  } catch (error) {
    console.error("Admin user list failed:", error);
    return NextResponse.json({ error: "Unable to load users." }, { status: 500 });
  }
}
