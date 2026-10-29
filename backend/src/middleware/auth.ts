import type { CookieOptions, NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "./error";

export const ADMIN_COOKIE_NAME = "mierag_admin";
const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const TOKEN_ISSUER = "mierag";
const TOKEN_AUDIENCE = "mierag-admin";

type AdminTokenPayload = {
  sub: string;
  email: string;
  role: "ADMIN";
};

export function adminCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE_MS,
    path: "/",
  };
}

export function clearAdminCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = adminCookieOptions();
  res.clearCookie(ADMIN_COOKIE_NAME, options);
}

export function signAdminToken(admin: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { email: admin.email, role: "ADMIN" },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "8h",
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      subject: admin.id,
    },
  );
}

function isAdminPayload(value: unknown): value is AdminTokenPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AdminTokenPayload>;
  return typeof payload.sub === "string" && payload.sub.length > 0 && payload.role === "ADMIN";
}

function readToken(req: Request): string | null {
  const cookieToken = req.cookies?.[ADMIN_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }
  return null;
}

function unauthorized(res: Response): never {
  clearAdminCookie(res);
  throw new AppError(401, "Authentication required");
}

type AdminRecord = { id: string; email: string; role: string };

async function resolveAdmin(req: Request): Promise<AdminRecord | null> {
  const token = readToken(req);
  if (!token) return null;

  let payload: unknown;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError) return null;
    throw error;
  }

  if (!isAdminPayload(payload)) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true },
  });

  if (!admin || admin.role !== "ADMIN") return null;
  return admin;
}

export async function loadOptionalAdmin(req: Request, res: Response): Promise<AdminRecord | null> {
  const token = readToken(req);
  const admin = await resolveAdmin(req);
  if (!admin && token) clearAdminCookie(res);
  return admin;
}

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const admin = await loadOptionalAdmin(req, res);
  if (!admin) unauthorized(res);
  req.admin = admin;
  next();
});
