import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { generateId, nowIso, asyncHandler } from "../lib/utils.js";

const router = Router();

const templateSchema = z.object({
  name: z.string().min(1).max(128),
  body: z.string().min(1).max(1600),
});

// GET /api/templates
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const templates = db
      .prepare("SELECT * FROM templates ORDER BY name ASC")
      .all();
    res.json(templates);
  })
);

// POST /api/templates
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, body } = templateSchema.parse(req.body);
    const db = getDb();
    const id = generateId();
    const now = nowIso();

    db.prepare(
      `INSERT INTO templates (id, name, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, name, body, now, now);

    const template = db.prepare("SELECT * FROM templates WHERE id = ?").get(id);
    res.status(201).json(template);
  })
);

// PUT /api/templates/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = templateSchema.partial().parse(req.body);
    const db = getDb();

    const existing = db
      .prepare("SELECT * FROM templates WHERE id = ?")
      .get(req.params.id);

    if (!existing) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const now = nowIso();
    const fields: string[] = ["updated_at = ?"];
    const values: unknown[] = [now];

    if (payload.name !== undefined) {
      fields.push("name = ?");
      values.push(payload.name);
    }
    if (payload.body !== undefined) {
      fields.push("body = ?");
      values.push(payload.body);
    }

    values.push(req.params.id);
    db.prepare(`UPDATE templates SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values
    );

    const updated = db.prepare("SELECT * FROM templates WHERE id = ?").get(req.params.id);
    res.json(updated);
  })
);

// DELETE /api/templates/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const result = db
      .prepare("DELETE FROM templates WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.status(204).send();
  })
);

export default router;