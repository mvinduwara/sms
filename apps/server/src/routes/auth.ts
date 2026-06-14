import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../db/client.js";
import { generateId, nowIso, asyncHandler } from "../lib/utils.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "change_me_in_production";
const JWT_EXPIRES = "7d";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = loginSchema.parse(req.body);
    const db = getDb();

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as
      | { id: string; username: string; email: string; password: string }
      | undefined;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { username, email, password } = registerSchema.parse(req.body);
    const db = getDb();

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .get(username, email);

    if (existing) {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }

    const id = generateId();
    const hash = await bcrypt.hash(password, 12);

    db.prepare(
      "INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(id, username, email, hash, nowIso());

    const token = jwt.sign({ userId: id, username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
      token,
      user: { id, username, email },
    });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const db = getDb();
    const user = db
      .prepare("SELECT id, username, email, created_at FROM users WHERE id = ?")
      .get(req.userId) as
      | { id: string; username: string; email: string; created_at: string }
      | undefined;

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  })
);

export default router;