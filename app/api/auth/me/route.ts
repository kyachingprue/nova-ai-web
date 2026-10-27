import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ user: null }, { status: 401 });
    await ensureSchema();
    const [user] = await getDb()`SELECT id, first_name AS "firstName", last_name AS "lastName",
      email, image_url AS "imageUrl", plan, subscription_status AS "subscriptionStatus"
      FROM users WHERE id = ${userId} LIMIT 1`;
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session lookup failed:", error);
    return NextResponse.json({ error: "Unable to load your session." }, { status: 500 });
  }
}
