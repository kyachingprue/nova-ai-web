import { randomInt, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ensureSchema, getDb } from "@/lib/db";
import { sendVerificationCode } from "@/lib/email";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  imageUrl: z.string().url().max(2048).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const db = getDb();
    const email = parsed.data.email.toLowerCase();
    const existing = await db`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const code = String(randomInt(100000, 1000000));
    const codeHash = createHash("sha256").update(code).digest("hex");
    await db`INSERT INTO pending_verifications
      (email, first_name, last_name, password_hash, image_url, code_hash, expires_at)
      VALUES (${email}, ${parsed.data.firstName}, ${parsed.data.lastName}, ${passwordHash},
        ${parsed.data.imageUrl || null}, ${codeHash}, NOW() + INTERVAL '10 minutes')
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
        password_hash = EXCLUDED.password_hash, image_url = EXCLUDED.image_url,
        code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0`;
    await sendVerificationCode(email, code);
    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration could not be completed. Check server configuration." }, { status: 500 });
  }
}
