import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { sql } from "~/db";
import { verifyToken } from "~/db/auth";

const COOKIE_NAME = "pp_token";

/**
 * Helper: extract userId from the session cookie, or throw.
 */
async function requireAuth(): Promise<string> {
  const token = getCookie(COOKIE_NAME);
  if (!token) throw new Error("Not authenticated");

  const payload = await verifyToken(token);
  if (!payload) throw new Error("Not authenticated");

  return payload.userId;
}

/**
 * POST — toggle lesson completion.
 * If a row exists, flip completed; otherwise INSERT with completed = true.
 */
export const toggleLessonComplete = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as Record<string, unknown>;
    if (!data.lessonId || typeof data.lessonId !== "string") {
      throw new Error("lessonId is required");
    }
    return { lessonId: data.lessonId };
  })
  .handler(
    async ({
      data,
    }: {
      data: { lessonId: string };
    }): Promise<{ completed: boolean }> => {
      const userId = await requireAuth();
      const db = sql();

      // Check if row exists
      const existing = await db`
        SELECT completed FROM user_progress
        WHERE user_id = ${userId} AND lesson_id = ${data.lessonId}
      `;

      if (existing.length > 0) {
        // Toggle
        const newCompleted = !existing[0].completed;
        await db`
          UPDATE user_progress
          SET completed = ${newCompleted},
              completed_at = CASE WHEN ${newCompleted} THEN now() ELSE null END
          WHERE user_id = ${userId} AND lesson_id = ${data.lessonId}
        `;
        return { completed: newCompleted };
      }

      // Insert new row
      await db`
        INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
        VALUES (${userId}, ${data.lessonId}, true, now())
      `;
      return { completed: true };
    },
  );

/**
 * GET — return the list of completed lesson IDs for the current user.
 */
export const getCompletedLessons = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ completedLessonIds: string[] }> => {
    const userId = await requireAuth();
    const db = sql();

    const rows = await db`
      SELECT lesson_id FROM user_progress
      WHERE user_id = ${userId} AND completed = true
    `;

    return {
      completedLessonIds: rows.map((r) => String(r.lesson_id)),
    };
  },
);
