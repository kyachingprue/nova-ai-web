import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

export type UserRole = "user" | "admin";
export type CurrentUser = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  plan: string;
  createdAt: string;
};

export function isAdminEmail(email: string) {
  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowedEmails.includes(email.trim().toLowerCase());
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  await ensureSchema();
  const [user] = await getDb()`SELECT id, role, first_name AS "firstName",
    last_name AS "lastName", email, image_url AS "imageUrl", plan,
    created_at AS "createdAt"
    FROM users WHERE id = ${userId} LIMIT 1`;
  if (!user) return null;

  return {
    id: String(user.id),
    role: user.role === "admin" ? "admin" as const : "user" as const,
    firstName: String(user.firstName),
    lastName: String(user.lastName),
    email: String(user.email),
    imageUrl: typeof user.imageUrl === "string" ? user.imageUrl : null,
    plan: String(user.plan),
    createdAt: new Date(String(user.createdAt)).toISOString(),
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Please sign in." }, { status: 401 }),
    };
  }
  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }),
    };
  }
  return { user, response: null };
}
