import { Router } from "express";
import { getDb } from "../db/client.js";
import { asyncHandler } from "../lib/utils.js";

const router = Router();

// GET /api/analytics/stats  — lightweight real-time card data
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const db = getDb();

    const row = db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status = 'failed'    THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'queued'    THEN 1 ELSE 0 END) as queued
        FROM messages`
      )
      .get() as {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      queued: number;
    };

    const finalized = (row.delivered ?? 0) + (row.failed ?? 0);
    const delivery_rate =
      finalized > 0 ? ((row.delivered ?? 0) / finalized) * 100 : 0;

    res.json({ ...row, delivery_rate });
  })
);

// GET /api/analytics  — full analytics payload
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const days = Math.min(90, Math.max(1, Number(req.query.days ?? 14)));

    // Overview
    const overview = db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status = 'failed'    THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'queued'    THEN 1 ELSE 0 END) as queued
        FROM messages
        WHERE created_at >= datetime('now', ? || ' days')`
      )
      .get(`-${days}`) as {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      queued: number;
    };

    const finalized = (overview.delivered ?? 0) + (overview.failed ?? 0);
    const delivery_rate =
      finalized > 0 ? ((overview.delivered ?? 0) / finalized) * 100 : 0;

    // Daily breakdown
    const daily = db
      .prepare(
        `SELECT
          date(created_at) as date,
          SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status = 'failed'    THEN 1 ELSE 0 END) as failed
        FROM messages
        WHERE created_at >= datetime('now', ? || ' days')
        GROUP BY date(created_at)
        ORDER BY date ASC`
      )
      .all(`-${days}`);

    // Hourly breakdown
    const hourly = db
      .prepare(
        `SELECT
          CAST(strftime('%H', created_at) AS INTEGER) as hour,
          COUNT(*) as count
        FROM messages
        WHERE created_at >= datetime('now', ? || ' days')
        GROUP BY hour
        ORDER BY hour ASC`
      )
      .all(`-${days}`);

    // Fill missing hours with 0
    const hourlyMap = new Map(
      (hourly as { hour: number; count: number }[]).map((h) => [h.hour, h.count])
    );
    const hourlyFull = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyMap.get(i) ?? 0,
    }));

    res.json({
      overview: { ...overview, delivery_rate },
      daily,
      hourly: hourlyFull,
    });
  })
);

export default router;