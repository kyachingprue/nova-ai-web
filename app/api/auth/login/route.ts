import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  try {
    await ensureSchema();
    const db = getDb();
    const [user] = await db`SELECT id, password_hash FROM users WHERE email = ${parsed.data.email.toLowerCase()} LIMIT 1`;
    if (!user?.password_hash || !(await bcrypt.compare(parsed.data.password, String(user.password_hash)))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await createSession(String(user.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login is temporarily unavailable." }, { status: 500 });
  }
}
