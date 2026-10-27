import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

const schema = z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code sent to your email." }, { status: 400 });
  }
  try {
    await ensureSchema();
    const db = getDb();
    const [pending] = await db`SELECT email, first_name, last_name, password_hash, image_url,
      code_hash, expires_at, attempts FROM pending_verifications
      WHERE email = ${parsed.data.email.toLowerCase()} LIMIT 1`;
    if (!pending || new Date(String(pending.expires_at)).getTime() <= Date.now()) {
      return NextResponse.json({ error: "That code has expired. Please register again." }, { status: 410 });
    }
    if (Number(pending.attempts) >= 5) {
      return NextResponse.json({ error: "Too many incorrect codes. Please register again." }, { status: 429 });
    }
    const expected = Buffer.from(String(pending.code_hash), "hex");
    const actual = Buffer.from(createHash("sha256").update(parsed.data.code).digest("hex"), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await db`UPDATE pending_verifications SET attempts = attempts + 1
        WHERE email = ${parsed.data.email.toLowerCase()} AND attempts < 5`;
      return NextResponse.json({ error: "That verification code is incorrect." }, { status: 400 });
    }
    const [user] = await db`INSERT INTO users (first_name, last_name, email, password_hash, image_url)
      VALUES (${pending.first_name}, ${pending.last_name}, ${pending.email}, ${pending.password_hash}, ${pending.image_url})
      RETURNING id`;
    await db`DELETE FROM pending_verifications WHERE email = ${parsed.data.email.toLowerCase()}`;
    await createSession(String(user.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email verification failed:", error);
    return NextResponse.json({ error: "Verification could not be completed." }, { status: 500 });
  }
}
