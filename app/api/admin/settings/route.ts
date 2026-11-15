import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSettings } from "@/lib/admin-settings";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/user-role";

const schema = z.object({
  defaultModel: z.string().trim().min(1).max(160),
  webSearchEnabled: z.boolean(),
  freeMonthlyMessageLimit: z.number().int().min(1).max(100000),
});

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    return NextResponse.json({ settings: await getAdminSettings() });
  } catch (error) {
    console.error("Admin settings load failed:", error);
    return NextResponse.json({ error: "Unable to load settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the model name and message limit." }, { status: 400 });
  }

  try {
    const db = getDb();
    await db`INSERT INTO app_settings (setting_key, setting_value) VALUES
      ('default_model', ${JSON.stringify(parsed.data.defaultModel)}::jsonb),
      ('web_search_enabled', ${JSON.stringify(parsed.data.webSearchEnabled)}::jsonb),
      ('free_monthly_message_limit', ${JSON.stringify(parsed.data.freeMonthlyMessageLimit)}::jsonb)
      ON CONFLICT (setting_key) DO UPDATE SET
        setting_value = EXCLUDED.setting_value, updated_at = NOW()`;
    return NextResponse.json({ settings: parsed.data });
  } catch (error) {
    console.error("Admin settings save failed:", error);
    return NextResponse.json({ error: "Unable to save settings." }, { status: 500 });
  }
}
