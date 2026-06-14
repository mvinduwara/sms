import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db/client.js";
import { generateId, nowIso, paginate, asyncHandler } from "../lib/utils.js";
import { dispatchMessage } from "../services/smsProvider.js";

const router = Router();

const sendSchema = z.object({
  to: z.string().min(7),
  body: z.string().min(1).max(1600),
  scheduled_at: z.string().datetime().optional(),
});

const bulkSchema = z.object({
  recipients: z
    .array(
      z.object({
        phone: z.string().min(7),
        name: z.string().optional(),
      })
    )
    .min(1)
    .max(5000),
  body: z.string().min(1).max(1600),
  scheduled_at: z.string().datetime().optional(),
});

// GET /api/messages
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const { offset, limit: lim } = paginate(page, limit);

    let where = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (status) {
      where += " AND m.status = ?";
      params.push(status);
    }
    if (search) {
      where += " AND (m.to_number LIKE ? OR m.body LIKE ? OR c.name LIKE ?)";
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    const total = (
      db
        .prepare(
          `SELECT COUNT(*) as n FROM messages m LEFT JOIN contacts c ON c.id = m.contact_id ${where}`
        )
        .get(...params) as { n: number }
    ).n;

    const data = db
      .prepare(
        `SELECT
          m.id, m.to_number as "to", m.body, m.status,
          m.provider_sid, m.scheduled_at, m.sent_at, m.created_at,
          c.name as contact_name
        FROM messages m
        LEFT JOIN contacts c ON c.id = m.contact_id
        ${where}
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?`
      )
      .all(...params, lim, offset);

    res.json({
      data,
      total,
      page,
      limit: lim,
      pages: Math.ceil(total / lim) || 1,
    });
  })
);

// POST /api/messages
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { to, body, scheduled_at } = sendSchema.parse(req.body);
    const db = getDb();

    // Look up contact
    const contact = db
      .prepare("SELECT id FROM contacts WHERE phone = ?")
      .get(to) as { id: string } | undefined;

    const id = generateId();
    const now = nowIso();

    db.prepare(
      `INSERT INTO messages (id, to_number, body, status, scheduled_at, created_at, contact_id)
       VALUES (?, ?, ?, 'queued', ?, ?, ?)`
    ).run(id, to, body, scheduled_at ?? null, now, contact?.id ?? null);

    const message = db
      .prepare(
        `SELECT m.id, m.to_number as "to", m.body, m.status,
          m.provider_sid, m.scheduled_at, m.sent_at, m.created_at,
          c.name as contact_name
         FROM messages m
         LEFT JOIN contacts c ON c.id = m.contact_id
         WHERE m.id = ?`
      )
      .get(id);

    // Send immediately if not scheduled
    if (!scheduled_at) {
      dispatchMessage(id).catch((err) =>
        console.error("[DISPATCH ERROR]", err)
      );
    }

    res.status(201).json(message);
  })
);

// POST /api/messages/bulk
router.post(
  "/bulk",
  asyncHandler(async (req, res) => {
    const { recipients, body, scheduled_at } = bulkSchema.parse(req.body);
    const db = getDb();
    const now = nowIso();
    const ids: string[] = [];

    const insertStmt = db.prepare(
      `INSERT INTO messages (id, to_number, body, status, scheduled_at, created_at, contact_id)
       VALUES (?, ?, ?, 'queued', ?, ?, ?)`
    );

    const lookupContact = db.prepare(
      "SELECT id FROM contacts WHERE phone = ?"
    );

    const insertMany = db.transaction(() => {
      for (const recipient of recipients) {
        const id = generateId();
        const contact = lookupContact.get(recipient.phone) as
          | { id: string }
          | undefined;

        // Interpolate {{name}} placeholder
        const interpolated = body.replace(
          /\{\{name\}\}/gi,
          recipient.name ?? ""
        );

        insertStmt.run(
          id,
          recipient.phone,
          interpolated,
          scheduled_at ?? null,
          now,
          contact?.id ?? null
        );
        ids.push(id);
      }
    });

    insertMany();

    // Dispatch non-scheduled messages
    if (!scheduled_at) {
      const rateLimitPerSec = Number(
        (
          db.prepare("SELECT value FROM settings WHERE key = 'rate_limit_per_second'").get() as {
            value: string;
          }
        )?.value ?? 10
      );
      const delayMs = 1000 / rateLimitPerSec;

      let i = 0;
      for (const id of ids) {
        setTimeout(() => {
          dispatchMessage(id).catch((err) =>
            console.error("[BULK DISPATCH ERROR]", err)
          );
        }, i * delayMs);
        i++;
      }
    }

    res.status(201).json({ queued: ids.length });
  })
);

// GET /api/messages/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const message = db
      .prepare(
        `SELECT m.id, m.to_number as "to", m.body, m.status,
          m.provider_sid, m.scheduled_at, m.sent_at, m.created_at,
          c.name as contact_name
         FROM messages m
         LEFT JOIN contacts c ON c.id = m.contact_id
         WHERE m.id = ?`
      )
      .get(req.params.id);

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json(message);
  })
);

export default router;