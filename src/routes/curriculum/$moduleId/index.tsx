import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { ProgressBar } from "~/components/ProgressBar";
import { slugToTitle, titleToSlug } from "~/lib/slugs";

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
  content: string | null;
  action_steps: unknown;
  reflection_prompts: unknown;
  sort_order: number;
}

type ModuleCategory =
  | "Foundation"
  | "Work"
  | "Structure"
  | "Finances"
  | "Mindset"
  | "Career"
  | "Family"
  | "Vision";

/* ── Category styling ──────────────────────────────────────── */
const categoryConfig: Record<
  ModuleCategory,
  { label: string; badge: string; description: string }
> = {
  Foundation: {
    label: "Foundation",
    badge: "bg-[#0f1d36] text-amber-400",
    description: "Build the base. Learn to shut down work and set boundaries.",
  },
  Work: {
    label: "Work",
    badge: "bg-amber-500 text-white",
    description: "Optimize your workday so work stops when it should.",
  },
  Structure: {
    label: "Structure",
    badge: "bg-emerald-600 text-white",
    description: "Design systems and rhythms that protect family time.",
  },
  Finances: {
    label: "Finances",
    badge: "bg-blue-600 text-white",
    description: "Get out of debt and build a budget that works for your family.",
  },
  Mindset: {
    label: "Mindset",
    badge: "bg-purple-600 text-white",
    description: "Build the mental frameworks for intentional presence.",
  },
  Career: {
    label: "Career",
    badge: "bg-orange-600 text-white",
    description: "Advance your career without sacrificing what matters most.",
  },
  Family: {
    label: "Family",
    badge: "bg-rose-600 text-white",
    description: "Create traditions, playbooks, and rhythms that last.",
  },
  Vision: {
    label: "Vision",
    badge: "bg-indigo-600 text-white",
    description: "Craft a family vision statement — your compass for every decision.",
  },
};

/* ── Category icon SVGs ────────────────────────────────────── */
function CategoryIcon({ category }: { category: string }) {
  const cls = "h-8 w-8";
  switch (category) {
    case "Foundation":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      );
    case "Work":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      );
    case "Structure":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      );
    case "Finances":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Career":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      );
    case "Family":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "Vision":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
      );
  }
}

/* ── Core insights per module ──────────────────────────────── */
const coreInsights: Record<string, string> = {
  "The Turn-Off Ritual":
    "The hardest part of being present isn't wanting to be there — it's knowing how to shut the other part of your brain off first.",
  "Boundary Architecture":
    "Boundaries aren't walls that keep you from work. They're fences that protect what matters most from being trampled.",
  "Calendar Mastery":
    "If you don't put family time on the calendar first, work will gladly fill every slot.",
  "The Sunday Sync":
    "Fifteen minutes on Sunday saves fifteen arguments during the week.",
  "Tech That Serves Your Family":
    "Every notification is a tiny decision about who gets your attention. Make sure it's the right person.",
  "Rhythms of Presence":
    "Presence isn't a one-time decision — it's a rhythm you build, day by day, week by week.",
  "Debt Payoff: Snowball Method":
    "Financial peace isn't about the math — it's about momentum. Small wins create big change.",
  "Debt Payoff: Avalanche Method":
    "Every dollar of interest you avoid is a dollar that stays in your family's future.",
  "The Family Budget That Works":
    "A budget isn't a restriction — it's permission to spend without guilt on what actually matters.",
  "Career Pathing with AI":
    "Your career should serve your family's vision, not the other way around.",
  "Resume & LinkedIn Overhaul":
    "The best time to sharpen your professional presence is before you need it.",
  "Interview Prep for Busy Dads":
    "You don't need hours of prep. You need focused, efficient practice that fits your life.",
  "Crafting Your Family Vision":
    "A family without a vision drifts. A family with a vision makes every decision easier.",
  "The Dad Playbook":
    "The best traditions aren't the expensive ones — they're the ones your kids will remember 30 years from now.",
};

/* ── Data loaders ──────────────────────────────────────────── */

const getModuleDetail = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const data = d as { moduleId: string };
    return { moduleId: data.moduleId };
  })
  .handler(async ({ data }) => {
    const db = sql();

    // Fetch all modules and match by slug in JS so the logic
    // stays in sync with titleToSlug (handles colons, ampersands, etc.)
    const moduleRows = await db`SELECT * FROM modules`;

    const matched = moduleRows.find(
      (r: Record<string, unknown>) => titleToSlug(String(r.title)) === data.moduleId,
    );

    if (!matched) {
      throw notFound();
    }

    const mod: Module = {
      id: String(matched.id),
      title: String(matched.title),
      description: String(matched.description ?? ""),
      category: String(matched.category),
      sort_order: Number(matched.sort_order),
      icon_name: matched.icon_name ? String(matched.icon_name) : null,
    };

    // Fetch lessons for this module
    const lessonRows = await db`
      SELECT * FROM lessons
      WHERE module_id = ${mod.id}
      ORDER BY sort_order
    `;

    const lessons: Lesson[] = lessonRows.map((r) => ({
      id: String(r.id),
      module_id: String(r.module_id),
      title: String(r.title),
      content: r.content ? String(r.content) : null,
      action_steps: r.action_steps,
      reflection_prompts: r.reflection_prompts,
      sort_order: Number(r.sort_order),
    }));

    return { module: mod, lessons };
  });

/* ── Route ─────────────────────────────────────────────────── */
export const Route = createFileRoute("/curriculum/$moduleId/")({
  loader: ({ params }) =>
    getModuleDetail({ data: { moduleId: params.moduleId } }),
  component: ModuleDetailPage,
});

/* ── Page component ────────────────────────────────────────── */
function ModuleDetailPage() {
  const { module: mod, lessons } = Route.useLoaderData();
  const config = categoryConfig[mod.category as ModuleCategory] ?? {
    label: mod.category,
    badge: "bg-gray-500 text-white",
    description: "",
  };
  const insight =
    coreInsights[mod.title] ??
    "Small consistent actions, repeated daily, create the life your family deserves.";

  const totalLessons = lessons.length;
  const completedLessons = 0; // placeholder until auth is wired

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-12 pt-24 text-white sm:pb-16 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <Link
            to="/curriculum"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-amber-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Curriculum
          </Link>

          {/* Category badge */}
          <span
            className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
          >
            {config.label}
          </span>

          {/* Module title */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {mod.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-300">
            {mod.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* ── Core Idea callout ──────────────────────────── */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Core Idea</h2>
              <p className="mt-2 text-base leading-relaxed text-gray-700">
                {insight}
              </p>
            </div>
          </div>
        </div>

        {/* ── Progress section ────────────────────────────── */}
        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-gray-900">Module Progress</h3>
            <span className="text-sm font-medium text-gray-500">
              {completedLessons} of {totalLessons} lessons complete
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar percent={totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0} />
          </div>
        </div>

        {/* ── Lesson list ─────────────────────────────────── */}
        <div className="mt-10">
          <h3 className="mb-5 text-lg font-bold text-gray-900">Lessons</h3>

          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-gray-900">Lessons coming soon</h4>
              <p className="mt-1 text-sm text-gray-500">
                We're crafting the lessons for this module. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <Link
                  key={lesson.id}
                  to="/curriculum/$moduleId/$lessonId"
                  params={{
                    moduleId: titleToSlug(mod.title),
                    lessonId: titleToSlug(lesson.title),
                  }}
                  className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md sm:p-5"
                >
                  {/* Lesson number */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f1d36] text-sm font-bold text-amber-400">
                    {lesson.sort_order ?? idx + 1}
                  </div>

                  {/* Title */}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-gray-400">
                      Lesson {lesson.sort_order ?? idx + 1}
                    </span>
                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                      {lesson.title}
                    </h4>
                  </div>

                  {/* Completion checkbox (placeholder) */}
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 text-gray-300 transition group-hover:border-amber-400 group-hover:text-amber-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>

                  {/* Chevron */}
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
