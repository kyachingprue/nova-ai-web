import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/user-role";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
});

export async function GET() {
  try {
    const account = await getCurrentUser();
    if (!account) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const [profile] = await getDb()`SELECT first_name AS "firstName", last_name AS "lastName",
      email, image_url AS "imageUrl", role, plan, created_at AS "createdAt"
      FROM users WHERE id = ${account.id} LIMIT 1`;
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile load failed:", error);
    return NextResponse.json({ error: "Unable to load your profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const account = await getCurrentUser();
    if (!account) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const body: unknown = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a first and last name." }, { status: 400 });
    }

    const [profile] = await getDb()`UPDATE users SET
      first_name = ${parsed.data.firstName}, last_name = ${parsed.data.lastName}
      WHERE id = ${account.id}
      RETURNING first_name AS "firstName", last_name AS "lastName",
        email, image_url AS "imageUrl", role, plan, created_at AS "createdAt"`;
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: "Unable to save your profile." }, { status: 500 });
  }
}
