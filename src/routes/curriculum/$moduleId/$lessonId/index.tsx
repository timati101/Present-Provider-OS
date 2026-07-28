import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { sql } from "~/db";
import { titleToSlug } from "~/lib/slugs";
import { Checklist } from "~/components/Checklist";

/* ── Types ─────────────────────────────────────────────────── */
interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  sort_order: number;
  icon_name: string | null;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  reflection_prompts: string[];
  action_steps: string[];
  sort_order: number;
}

interface LoaderData {
  module: Module | null;
  lesson: Lesson | null;
  allLessons: { id: string; title: string; sort_order: number }[];
}

/* ── Category badge styling ────────────────────────────────── */
const categoryBadge: Record<string, string> = {
  Foundation: "bg-[#0f1d36] text-amber-400",
  Work: "bg-amber-500 text-white",
  Structure: "bg-emerald-600 text-white",
  Finances: "bg-blue-600 text-white",
  Mindset: "bg-purple-600 text-white",
  Career: "bg-orange-600 text-white",
  Family: "bg-rose-600 text-white",
  Vision: "bg-indigo-600 text-white",
};

/* ── Estimated read time ───────────────────────────────────── */
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return "".concat(String(minutes), " min read");
}

/* ── Server loader ─────────────────────────────────────────── */
const getLessonData = createServerFn({ method: "GET" })
  .handler(async ({ data }: { data: { moduleId: string; lessonId: string } }) => {
    const db = sql();

    // Look up module by slug
    const allModules = await db`SELECT * FROM modules`;
    const modRow = allModules.find(
      (r: Record<string, unknown>) =>
        titleToSlug(String(r.title)) === data.moduleId
    );

    if (!modRow) {
      return { module: null, lesson: null, allLessons: [] } as LoaderData;
    }

    const moduleId = String(modRow.id);
    const mod: Module = {
      id: moduleId,
      title: String(modRow.title),
      description: String(modRow.description ?? ""),
      category: String(modRow.category),
      sort_order: Number(modRow.sort_order),
      icon_name: modRow.icon_name ? String(modRow.icon_name) : null,
    };

    // Get all lessons for this module (for prev/next nav)
    const lessonRows = await db`
      SELECT id, title, sort_order FROM lessons
      WHERE module_id = ${moduleId}
      ORDER BY sort_order
    `;
    const allLessons = lessonRows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: String(r.title),
      sort_order: Number(r.sort_order),
    }));

    // Look up lesson by slug
    const lessonRow = allLessons.find(
      (l) => titleToSlug(l.title) === data.lessonId
    );

    if (!lessonRow) {
      return { module: mod, lesson: null, allLessons } as LoaderData;
    }

    const fullLesson = await db`
      SELECT * FROM lessons WHERE id = ${lessonRow.id} LIMIT 1
    `;

    if (fullLesson.length === 0) {
      return { module: mod, lesson: null, allLessons } as LoaderData;
    }

    const r = fullLesson[0];
    const lesson: Lesson = {
      id: String(r.id),
      module_id: String(r.module_id),
      title: String(r.title),
      content: String(r.content ?? ""),
      reflection_prompts: Array.isArray(r.reflection_prompts)
        ? (r.reflection_prompts as unknown[]).map(String)
        : [],
      action_steps: Array.isArray(r.action_steps)
        ? (r.action_steps as unknown[]).map(String)
        : [],
      sort_order: Number(r.sort_order),
    };

    return { module: mod, lesson, allLessons } as LoaderData;
  });

/* ── Route ─────────────────────────────────────────────────── */
export const Route = createFileRoute("/curriculum/$moduleId/$lessonId/")({
  loader: async ({ params }) =>
    getLessonData({ data: { moduleId: params.moduleId, lessonId: params.lessonId } }),
  component: LessonDetailPage,
});

/* ── Page component ────────────────────────────────────────── */
function LessonDetailPage() {
  const data = Route.useLoaderData();
  const { moduleId, lessonId } = Route.useParams();

  // ── Client-side state ───────────────────────────────────
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [markedComplete, setMarkedComplete] = useState(false);

  const toggleStep = (index: number) => {
    const id = "step-".concat(String(index));
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReflectionChange = (index: number, value: string) => {
    setReflections((prev) => ({ ...prev, ["prompt-".concat(String(index))]: value }));
  };

  // ── 404 states ──────────────────────────────────────────
  if (!data.module) {
    return (
      <div className="min-h-screen bg-[#faf7f2] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Module Not Found</h1>
          <p className="mt-4 text-gray-500">
            The module &ldquo;{moduleId}&rdquo; doesn&apos;t exist.
          </p>
          <Link
            to="/curriculum"
            className="mt-8 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Browse Curriculum
          </Link>
        </div>
      </div>
    );
  }

  if (!data.lesson) {
    return (
      <div className="min-h-screen bg-[#faf7f2] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Lesson Not Found</h1>
          <p className="mt-4 text-gray-500">
            That lesson doesn&apos;t exist in {data.module.title}.
          </p>
          <Link
            to="/curriculum/$moduleId"
            params={{ moduleId }}
            className="mt-8 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Back to {data.module.title}
          </Link>
        </div>
      </div>
    );
  }

  const { module: mod, lesson, allLessons } = data;

  // ── Prev / Next ─────────────────────────────────────────
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // ── Parse content into paragraphs ───────────────────────
  const paragraphs = lesson.content.split("\n\n").filter(Boolean);

  // ── Build checklist items ───────────────────────────────
  const checklistItems = lesson.action_steps.map((step, i) => ({
    id: "step-".concat(String(i)),
    text: step,
  }));

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Breadcrumb bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            to="/curriculum/$moduleId"
            params={{ moduleId }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition hover:text-amber-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to {mod.title}
          </Link>
        </div>
      </div>

      {/* Lesson header */}
      <header className="bg-[#0f1d36] px-6 pb-12 pt-8 text-white sm:pb-16 sm:pt-12">
        <div className="relative mx-auto max-w-3xl">
          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className={"inline-block rounded-full px-3 py-1 text-xs font-semibold ".concat(
                  categoryBadge[mod.category] ?? "bg-gray-500 text-white"
                )}
              >
                {mod.category}
              </span>
              <span className="text-sm text-gray-300">
                Lesson {currentIndex + 1} of {allLessons.length}
              </span>
              <span className="text-sm text-gray-300">
                · {estimateReadTime(lesson.content)}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-3 text-gray-300">{mod.title}</p>
          </div>
        </div>
      </header>

      {/* Content body */}
      <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* ── Lesson content ─────────────────────────────── */}
        <section className="mb-16">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="mb-6 text-lg leading-relaxed text-gray-700"
            >
              {para}
            </p>
          ))}
        </section>

        {/* ── Divider ────────────────────────────────────── */}
        <hr className="mb-12 border-gray-200" />

        {/* ── Reflection Prompts ─────────────────────────── */}
        {lesson.reflection_prompts.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Reflection Prompts
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Take a few minutes to reflect. These answers are just for you — nobody else will see them.
            </p>
            <div className="space-y-6">
              {lesson.reflection_prompts.map((prompt, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6"
                >
                  <p className="mb-4 font-semibold text-gray-800">
                    {i + 1}. {prompt}
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Write your reflection here..."
                    value={reflections["prompt-".concat(String(i))] ?? ""}
                    onChange={(e) => handleReflectionChange(i, e.target.value)}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 placeholder-gray-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Action Steps ───────────────────────────────── */}
        {lesson.action_steps.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Action Steps
            </h2>
            <div className="space-y-4">
              {lesson.action_steps.map((step, i) => {
                const stepId = "step-".concat(String(i));
                const isDone = completedSteps.has(stepId);
                return (
                  <label
                    key={i}
                    className={"flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition ".concat(
                      isDone
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleStep(i)}
                      className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span
                      className={"text-base transition ".concat(
                        isDone ? "text-gray-400 line-through" : "text-gray-700"
                      )}
                    >
                      <span className="mr-2 font-bold text-amber-600">{i + 1}.</span>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Implementation Checklist ───────────────────── */}
        {checklistItems.length > 0 && (
          <section className="mb-16 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <Checklist
              items={checklistItems}
              onToggle={toggleStep}
              completed={completedSteps}
            />
          </section>
        )}

        {/* ── Mark Complete Button ───────────────────────── */}
        <section className="mb-16 text-center">
          {!markedComplete ? (
            <button
              onClick={() => setMarkedComplete(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f1d36] px-8 py-4 text-lg font-bold text-amber-400 transition hover:bg-[#0f1d36]/90 hover:shadow-lg active:scale-[0.98]"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark as Complete
            </button>
          ) : (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-8 w-8 animate-bounce text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-emerald-800">Lesson Complete!</h3>
              <p className="mt-2 text-emerald-600">
                Great work, Dad. One step closer to being fully present.
              </p>
              {nextLesson && (
                <Link
                  to="/curriculum/$moduleId/$lessonId"
                  params={{
                    moduleId,
                    lessonId: titleToSlug(nextLesson.title),
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  Continue to next lesson
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* ── Prev / Next navigation ──────────────────────── */}
        <nav className="flex items-center justify-between border-t border-gray-200 pt-8">
          {prevLesson ? (
            <Link
              to="/curriculum/$moduleId/$lessonId"
              params={{
                moduleId,
                lessonId: titleToSlug(prevLesson.title),
              }}
              className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-200 hover:bg-amber-50"
            >
              <svg className="h-4 w-4 text-gray-400 transition group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <div className="text-left">
                <span className="block text-xs text-gray-400">Previous</span>
                <span className="block text-gray-800 transition group-hover:text-amber-700">
                  {prevLesson.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              to="/curriculum/$moduleId/$lessonId"
              params={{
                moduleId,
                lessonId: titleToSlug(nextLesson.title),
              }}
              className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-amber-200 hover:bg-amber-50"
            >
              <div className="text-right">
                <span className="block text-xs text-gray-400">Next</span>
                <span className="block text-gray-800 transition group-hover:text-amber-700">
                  {nextLesson.title}
                </span>
              </div>
              <svg className="h-4 w-4 text-gray-400 transition group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  );
}
