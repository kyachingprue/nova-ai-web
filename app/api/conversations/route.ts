import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    await ensureSchema();
    const conversations = await getDb()`SELECT id, title, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM conversations WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 100`;
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversation list failed:", error);
    return NextResponse.json({ error: "Unable to load chat history." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    await ensureSchema();
    const [conversation] = await getDb()`INSERT INTO conversations (user_id)
      VALUES (${userId}) RETURNING id, title, created_at AS "createdAt", updated_at AS "updatedAt"`;
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return NextResponse.json({ error: "Unable to start a conversation." }, { status: 500 });
  }
}
