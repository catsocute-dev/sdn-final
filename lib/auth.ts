import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "session_token";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "fallback_secret_key_minimum_32_characters_long_for_dev_mode";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { id: string; email: string }): Promise<string> {
  return await new SignJWT({ sub: payload.id, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub === "string" && typeof payload.email === "string") {
      return { id: payload.sub, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

