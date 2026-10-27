import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const parsed = paramsSchema.safeParse(await params);
    if (!parsed.success) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    await ensureSchema();
    const db = getDb();
    const [conversation] = await db`SELECT id FROM conversations WHERE id = ${parsed.data.id}
      AND user_id = ${userId} LIMIT 1`;
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const messages = await db`SELECT id, role, content, sources, created_at AS "createdAt"
      FROM messages WHERE conversation_id = ${parsed.data.id} ORDER BY created_at ASC`;
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Conversation messages failed:", error);
    return NextResponse.json({ error: "Unable to load this conversation." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const parsed = paramsSchema.safeParse(await params);
    if (!parsed.success) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
    await ensureSchema();
    const [deleted] = await getDb()`DELETE FROM conversations
      WHERE id = ${parsed.data.id} AND user_id = ${userId}
      RETURNING id`;
    if (!deleted) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ ok: true, id: deleted.id });
  } catch (error) {
    console.error("Conversation deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete this conversation." }, { status: 500 });
  }
}
