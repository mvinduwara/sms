import cron from "node-cron";
import { getDb } from "../db/client.js";
import { dispatchMessage } from "./smsProvider.js";

export function startScheduler(): void {
  cron.schedule("*/30 * * * * *", async () => {
    const db = getDb();
    const now = new Date().toISOString();

    const due = db
      .prepare(
        `SELECT id FROM messages
         WHERE status = 'queued'
           AND scheduled_at IS NOT NULL
           AND scheduled_at <= ?
         LIMIT 50`
      )
      .all(now) as { id: string }[];

    if (due.length === 0) return;

    console.log(`[SCHEDULER] Dispatching ${due.length} scheduled message(s)`);

    for (const { id } of due) {
      dispatchMessage(id).catch((err) =>
        console.error(`[SCHEDULER] Failed to dispatch ${id}:`, err)
      );
    }
  });

  console.log("[SCHEDULER] Started — checking every 30s");
}