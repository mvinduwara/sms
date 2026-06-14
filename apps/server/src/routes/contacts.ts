import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { generateId, nowIso, paginate, asyncHandler } from "../lib/utils.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1).max(128),
  phone: z.string().min(7).max(32),
  group_name: z.string().max(64).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

// GET /api/contacts
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = req.query.search as string | undefined;
    const group = req.query.group as string | undefined;
    const { offset, limit: lim } = paginate(page, limit);

    let where = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (search) {
      where += " AND (name LIKE ? OR phone LIKE ?)";
      const q = `%${search}%`;
      params.push(q, q);
    }
    if (group) {
      where += " AND group_name = ?";
      params.push(group);
    }

    const total = (
      db
        .prepare(`SELECT COUNT(*) as n FROM contacts ${where}`)
        .get(...params) as { n: number }
    ).n;

    const data = db
      .prepare(
        `SELECT * FROM contacts ${where} ORDER BY name ASC LIMIT ? OFFSET ?`
      )
      .all(...params, lim, offset);

    res.json({ data, total, page, limit: lim, pages: Math.ceil(total / lim) || 1 });
  })
);

// POST /api/contacts
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = contactSchema.parse(req.body);
    const db = getDb();

    const existing = db
      .prepare("SELECT id FROM contacts WHERE phone = ?")
      .get(payload.phone);

    if (existing) {
      res.status(409).json({ error: "A contact with this phone number already exists" });
      return;
    }

    const id = generateId();
    const now = nowIso();

    db.prepare(
      `INSERT INTO contacts (id, name, phone, group_name, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      payload.name,
      payload.phone,
      payload.group_name ?? null,
      payload.notes ?? null,
      now
    );

    const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
    res.status(201).json(contact);
  })
);

// PUT /api/contacts/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = contactSchema.partial().parse(req.body);
    const db = getDb();

    const existing = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(req.params.id) as Record<string, unknown> | undefined;

    if (!existing) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (fields.length === 0) {
      res.json(existing);
      return;
    }

    values.push(req.params.id);
    db.prepare(
      `UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`
    ).run(...values);

    const updated = db.prepare("SELECT * FROM contacts WHERE id = ?").get(req.params.id);
    res.json(updated);
  })
);

// DELETE /api/contacts/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const result = db
      .prepare("DELETE FROM contacts WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    res.status(204).send();
  })
);

// GET /api/contacts/groups
router.get(
  "/groups",
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const groups = db
      .prepare(
        "SELECT group_name, COUNT(*) as count FROM contacts WHERE group_name IS NOT NULL GROUP BY group_name ORDER BY count DESC"
      )
      .all();
    res.json(groups);
  })
);

export default router;