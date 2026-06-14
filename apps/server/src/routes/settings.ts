import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import {
  generateId,
  nowIso,
  generateApiKey,
  asyncHandler,
} from "../lib/utils.js";

const router = Router();

const settingsSchema = z.object({
  provider: z.enum(["mock", "twilio"]).optional(),
  twilio_account_sid: z.string().optional(),
  twilio_auth_token: z.string().optional(),
  twilio_from_number: z.string().optional(),
  default_sender_id: z.string().max(11).optional(),
  rate_limit_per_second: z.coerce.number().int().min(1).max(100).optional(),
  webhook_url: z.string().url().or(z.literal("")).optional(),
});

// GET /api/settings
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const rows = db
      .prepare("SELECT key, value FROM settings")
      .all() as { key: string; value: string }[];

    const config = rows.reduce(
      (acc, r) => ({ ...acc, [r.key]: r.value }),
      {} as Record<string, string>
    );

    // Mask auth token
    if (config.twilio_auth_token) {
      config.twilio_auth_token = config.twilio_auth_token
        ? "••••••••"
        : "";
    }

    res.json(config);
  })
);

// PUT /api/settings
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const payload = settingsSchema.parse(req.body);
    const db = getDb();

    const updateSetting = db.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    );

    const updateAll = db.transaction(() => {
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) {
          updateSetting.run(key, String(value));
        }
      }
    });

    updateAll();
    res.json({ success: true });
  })
);

// GET /api/settings/api-keys
router.get(
  "/api-keys",
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const keys = db
      .prepare(
        "SELECT id, name, key_prefix, created_at, last_used_at FROM api_keys ORDER BY created_at DESC"
      )
      .all();
    res.json(keys);
  })
);

// POST /api/settings/api-keys
router.post(
  "/api-keys",
  asyncHandler(async (req, res) => {
    const { name } = z
      .object({ name: z.string().min(1).max(64) })
      .parse(req.body);

    const { raw, hash, prefix } = generateApiKey();
    const db = getDb();
    const id = generateId();
    const now = nowIso();

    db.prepare(
      `INSERT INTO api_keys (id, name, key_hash, key_prefix, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, name, hash, prefix, now);

    const apiKey = db
      .prepare(
        "SELECT id, name, key_prefix, created_at, last_used_at FROM api_keys WHERE id = ?"
      )
      .get(id);

    res.status(201).json({ key: raw, apiKey });
  })
);

// DELETE /api/settings/api-keys/:id
router.delete(
  "/api-keys/:id",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const result = db
      .prepare("DELETE FROM api_keys WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: "API key not found" });
      return;
    }

    res.status(204).send();
  })
);

export default router;