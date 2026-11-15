import { getDb } from "@/lib/db";

export type AdminSettings = {
  defaultModel: string;
  webSearchEnabled: boolean;
  freeMonthlyMessageLimit: number;
};

export async function getAdminSettings(): Promise<AdminSettings> {
  const rows = await getDb()`SELECT setting_key, setting_value FROM app_settings
    WHERE setting_key IN ('default_model', 'web_search_enabled', 'free_monthly_message_limit')`;
  const saved = new Map(rows.map((row) => [String(row.setting_key), row.setting_value]));
  const model = saved.get("default_model");
  const webSearchEnabled = saved.get("web_search_enabled");
  const messageLimit = saved.get("free_monthly_message_limit");

  return {
    defaultModel: typeof model === "string" && model.trim()
      ? model
      : process.env.OPENROUTER_MODEL || "openrouter/free",
    webSearchEnabled: typeof webSearchEnabled === "boolean"
      ? webSearchEnabled
      : process.env.OPENROUTER_WEB_SEARCH === "true",
    freeMonthlyMessageLimit: typeof messageLimit === "number" && Number.isInteger(messageLimit) && messageLimit > 0
      ? messageLimit
      : 50,
  };
}
