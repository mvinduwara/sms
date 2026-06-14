import { nanoid } from "nanoid";
import { createHash } from "crypto";
import type { Request, Response, NextFunction } from "express";

export function generateId(): string {
  return nanoid(21);
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `sgk_${nanoid(40)}`;
  const hash = hashApiKey(raw);
  const prefix = raw.slice(0, 10);
  return { raw, hash, prefix };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function paginate(page: number, limit: number): { offset: number; limit: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return { offset: (safePage - 1) * safeLimit, limit: safeLimit };
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}