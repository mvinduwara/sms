import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { getDb } from "./db/client.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startScheduler } from "./services/scheduler.js";

import authRouter from "./routes/auth.js";
import messagesRouter from "./routes/messages.js";
import contactsRouter from "./routes/contacts.js";
import templatesRouter from "./routes/templates.js";
import analyticsRouter from "./routes/analytics.js";
import settingsRouter from "./routes/settings.js";

import bcrypt from "bcryptjs";
import { generateId, nowIso } from "./lib/utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 3001);
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check (unauthenticated) ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─── Auth routes (public) ─────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ─── Protected API routes ─────────────────────────────────────────────────────
app.use("/api/messages", authMiddleware, messagesRouter);
app.use("/api/contacts", authMiddleware, contactsRouter);
app.use("/api/templates", authMiddleware, templatesRouter);
app.use("/api/analytics", authMiddleware, analyticsRouter);
app.use("/api/settings", authMiddleware, settingsRouter);

// ─── Serve frontend in production ────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../web/dist");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Seed default admin user ─────────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  const db = getDb();
  const exists = db
    .prepare("SELECT id FROM users WHERE username = 'admin'")
    .get();

  if (!exists) {
    const id = generateId();
    const hash = await bcrypt.hash("admin", 12);
    db.prepare(
      "INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, "admin", "admin@localhost", hash, nowIso());
    console.log("[SEED] Default admin user created (admin / admin)");
  }
}

// ─── Seed sample data for development ────────────────────────────────────────
function seedDemoData(): void {
  const db = getDb();

  const contactCount = (
    db.prepare("SELECT COUNT(*) as n FROM contacts").get() as { n: number }
  ).n;

  if (contactCount > 0) return;

  const contacts = [
    { name: "Alice Johnson", phone: "+14155550101", group: "VIP" },
    { name: "Bob Williams", phone: "+14155550102", group: "Customers" },
    { name: "Carol Martinez", phone: "+14155550103", group: "VIP" },
    { name: "David Brown", phone: "+14155550104", group: "Customers" },
    { name: "Eva Davis", phone: "+14155550105", group: null },
    { name: "Frank Miller", phone: "+14155550106", group: "Partners" },
  ];

  const insertContact = db.prepare(
    "INSERT INTO contacts (id, name, phone, group_name, created_at) VALUES (?, ?, ?, ?, ?)"
  );

  const templates = [
    {
      name: "Welcome Message",
      body: "Hi {{name}}, welcome aboard! We're thrilled to have you. Reply STOP to unsubscribe.",
    },
    {
      name: "Order Confirmation",
      body: "Hello {{name}}, your order has been confirmed. You'll receive tracking info shortly.",
    },
    {
      name: "Appointment Reminder",
      body: "Hi {{name}}, this is a reminder about your appointment tomorrow at 10 AM. Reply CONFIRM to confirm.",
    },
    {
      name: "OTP Code",
      body: "Your verification code is: {{code}}. Valid for 10 minutes. Do not share this code.",
    },
  ];

  const insertTemplate = db.prepare(
    "INSERT INTO templates (id, name, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  );

  const insertMessage = db.prepare(
    "INSERT INTO messages (id, to_number, body, status, provider_sid, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const statuses = ["delivered", "delivered", "delivered", "sent", "failed"] as const;

  db.transaction(() => {
    for (const c of contacts) {
      insertContact.run(generateId(), c.name, c.phone, c.group, nowIso());
    }

    for (const t of templates) {
      const now = nowIso();
      insertTemplate.run(generateId(), t.name, t.body, now, now);
    }

    // Seed 90 days of demo messages
    for (let d = 90; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const count = Math.floor(3 + Math.random() * 12);

      for (let i = 0; i < count; i++) {
        const msgDate = new Date(date);
        msgDate.setHours(Math.floor(Math.random() * 14) + 7);
        msgDate.setMinutes(Math.floor(Math.random() * 60));
        const iso = msgDate.toISOString();
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        insertMessage.run(
          generateId(),
          contact.phone,
          `Hello ${contact.name}, this is a demo message. Have a great day!`,
          status,
          status !== "failed" ? `MOCK_${Date.now()}` : null,
          status !== "failed" ? iso : null,
          iso
        );
      }
    }
  })();

  console.log("[SEED] Demo data seeded (contacts, templates, 90-day message history)");
}

async function bootstrap(): Promise<void> {
  getDb(); // Initialize DB + run migrations
  await seedAdmin();

  if (process.env.NODE_ENV !== "production") {
    seedDemoData();
  }

  startScheduler();

  app.listen(PORT, () => {
    console.log(`\n🚀 SMS Gateway server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}`);
    console.log(`   Login: admin / admin\n`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});