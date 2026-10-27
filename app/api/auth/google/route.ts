import { NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

const schema = z.object({ idToken: z.string().min(1) });
const firebaseKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!parsed.success || !projectId) {
    return NextResponse.json({ error: "Google sign-in is not configured." }, { status: 400 });
  }
  try {
    const { payload } = await jwtVerify(parsed.data.idToken, firebaseKeys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    if (!payload.sub || typeof payload.email !== "string" || payload.email_verified !== true) {
      return NextResponse.json({ error: "A verified Google account is required." }, { status: 401 });
    }
    await ensureSchema();
    const db = getDb();
    const email = payload.email.toLowerCase();
    const firstName = typeof payload.name === "string" ? payload.name.split(" ")[0] : email.split("@")[0];
    const lastName = typeof payload.name === "string" ? payload.name.split(" ").slice(1).join(" ") : "";
    const imageUrl = typeof payload.picture === "string" ? payload.picture : null;
    const [user] = await db`INSERT INTO users (first_name, last_name, email, image_url, firebase_uid)
      VALUES (${firstName}, ${lastName}, ${email}, ${imageUrl}, ${payload.sub})
      ON CONFLICT (email) DO UPDATE SET
        firebase_uid = COALESCE(users.firebase_uid, EXCLUDED.firebase_uid),
        image_url = COALESCE(users.image_url, EXCLUDED.image_url)
      RETURNING id`;
    await createSession(String(user.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Google sign-in failed:", error);
    return NextResponse.json({ error: "Google sign-in could not be completed." }, { status: 401 });
  }
}
