import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";
import { sql } from "~/db";
import { hashPassword, verifyPassword, createToken, verifyToken } from "~/db/auth";

const COOKIE_NAME = "pp_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** User shape returned to the client (never includes password_hash). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Signup input */
export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

/** Signup result */
export interface AuthResult {
  user: AuthUser;
}

/**
 * POST /api/auth/signup
 * Validate, hash password, insert into users table, set session cookie, return user.
 */
export const signup = createServerFn({ method: "POST" })
  .validator((input: unknown): SignupInput => {
    const data = input as Record<string, unknown>;
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      throw new Error("A valid email is required.");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    return {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      name: typeof data.name === "string" ? data.name.trim() : undefined,
    };
  })
  .handler(async ({ data }: { data: SignupInput }): Promise<AuthResult> => {
    const db = sql();
    const { email, password, name } = data;

    // Check existing user
    const existing = await db`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const displayName = name || email.split("@")[0];

    const [user] = await db`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${displayName})
      RETURNING id, email, name
    `;

    const token = await createToken({ userId: user.id, email: user.email });
    setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return { user: { id: user.id, email: user.email, name: user.name } };
  });

/**
 * POST /api/auth/login
 * Validate credentials, set session cookie, return user.
 */
export const login = createServerFn({ method: "POST" })
  .validator((input: unknown): { email: string; password: string } => {
    const data = input as Record<string, unknown>;
    if (!data.email || typeof data.email !== "string") {
      throw new Error("Email is required.");
    }
    if (!data.password || typeof data.password !== "string") {
      throw new Error("Password is required.");
    }
    return { email: data.email.trim().toLowerCase(), password: data.password };
  })
  .handler(
    async ({
      data,
    }: {
      data: { email: string; password: string };
    }): Promise<AuthResult> => {
      const db = sql();
      const { email, password } = data;

      const rows = await db`
        SELECT id, email, name, password_hash
        FROM users
        WHERE email = ${email}
      `;
      if (rows.length === 0) {
        throw new Error("Invalid email or password.");
      }

      const user = rows[0];
      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) {
        throw new Error("Invalid email or password.");
      }

      const token = await createToken({ userId: user.id, email: user.email });
      setCookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return { user: { id: user.id, email: user.email, name: user.name } };
    },
  );

/**
 * POST /api/auth/logout
 * Clear session cookie.
 */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { success: true };
});

/**
 * GET /api/auth/me
 * Return the current user from the session cookie.
 * Returns null if not authenticated.
 */
export const getMe = createServerFn({ method: "GET" }).handler(async (): Promise<{
  user: AuthUser | null;
}> => {
  const token = getCookie(COOKIE_NAME);
  if (!token) return { user: null };

  const payload = await verifyToken(token);
  if (!payload) return { user: null };

  const db = sql();
  const rows = await db`
    SELECT id, email, name
    FROM users
    WHERE id = ${payload.userId}
  `;
  if (rows.length === 0) return { user: null };

  const u = rows[0];
  return { user: { id: u.id, email: u.email, name: u.name } };
});
