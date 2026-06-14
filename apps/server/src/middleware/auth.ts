import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../db/client.js";
import { hashApiKey } from "../lib/utils.js";
import { nowIso } from "../lib/utils.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "change_me_in_production";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Authorization header missing" });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme === "Bearer" && token) {
    // JWT path
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        username: string;
      };
      req.userId = payload.userId;
      req.username = payload.username;
      next();
      return;
    } catch {
      // Fall through to API key check
    }
  }

  // API key path — scheme is "Bearer" with sgk_ prefix, or "ApiKey"
  const rawKey = scheme === "ApiKey" ? token : token;
  if (rawKey?.startsWith("sgk_")) {
    const db = getDb();
    const keyHash = hashApiKey(rawKey);
    const apiKey = db
      .prepare(
        "SELECT id FROM api_keys WHERE key_hash = ?"
      )
      .get(keyHash) as { id: string } | undefined;

    if (apiKey) {
      db.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(
        nowIso(),
        apiKey.id
      );
      req.userId = "api";
      req.username = "api-key";
      next();
      return;
    }
  }

  res.status(401).json({ error: "Invalid or expired token" });
}