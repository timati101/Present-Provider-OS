import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { ProgressBar } from "~/components/ProgressBar";
import { titleToSlug } from "~/lib/slugs";

/* ── Types ─────────────────────────────────────────────────── */
interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  sort_order: number;
  icon_name: string | null;
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

/* ── Category order for display ─────────────────────────────── */
const categoryOrder: ModuleCategory[] = [
  "Foundation",
  "Work",
  "Structure",
  "Finances",
  "Mindset",
  "Career",
  "Family",
  "Vision",
];

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

/* ── Server loader ─────────────────────────────────────────── */
const getModules = createServerFn({ method: "GET" }).handler(async (): Promise<Module[]> => {
  const db = sql();
  const rows = await db`
    SELECT * FROM modules
    ORDER BY
      CASE category
        WHEN 'Foundation' THEN 1
        WHEN 'Work' THEN 2
        WHEN 'Structure' THEN 3
        WHEN 'Finances' THEN 4
        WHEN 'Mindset' THEN 5
        WHEN 'Career' THEN 6
        WHEN 'Family' THEN 7
        WHEN 'Vision' THEN 8
      END, sort_order
  `;
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    description: String(r.description ?? ""),
    category: String(r.category),
    sort_order: Number(r.sort_order),
    icon_name: r.icon_name ? String(r.icon_name) : null,
  }));
});

/* ── Route ─────────────────────────────────────────────────── */
export const Route = createFileRoute("/curriculum/")({
  loader: () => getModules(),
  component: CurriculumPage,
});

/* ── Page component ────────────────────────────────────────── */
function CurriculumPage() {
  const modules = Route.useLoaderData();

  // Group modules by category
  const grouped = new Map<string, Module[]>();
  for (const mod of modules) {
    const existing = grouped.get(mod.category) ?? [];
    existing.push(mod);
    grouped.set(mod.category, existing);
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="bg-[#0f1d36] px-6 pb-16 pt-24 text-center text-white sm:pb-20 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            14-Module Curriculum
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your Curriculum
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-300">
            14 modules. One mission: be present.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* ── Empty state ────────────────────────────────── */}
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No modules yet</h2>
            <p className="mt-2 text-gray-500">
              The curriculum is being prepared. Check back soon.
            </p>
          </div>
        ) : (
          /* ── Category sections ─────────────────────────── */
          <div className="space-y-20">
            {categoryOrder.map((cat) => {
              const catModules = grouped.get(cat);
              if (!catModules || catModules.length === 0) return null;

              const config = categoryConfig[cat] ?? {
                label: cat,
                badge: "bg-gray-500 text-white",
                description: "",
              };

              return (
                <section key={cat}>
                  {/* Category header */}
                  <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f1d36] text-amber-400">
                        <CategoryIcon category={cat} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
                          >
                            {catModules.length} {catModules.length === 1 ? "module" : "modules"}
                          </span>
                        </div>
                        {config.description && (
                          <p className="mt-1 text-sm text-gray-500">{config.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Module cards grid */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {catModules.map((mod) => (
                      <Link
                        key={mod.id}
                        to="/curriculum/$moduleId"
                        params={{ moduleId: titleToSlug(mod.title) }}
                        className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                      >
                        {/* Module header */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f1d36] text-sm font-bold text-amber-400">
                            {mod.sort_order}
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-amber-700 transition-colors">
                              {mod.title}
                            </h3>
                          </div>
                          {/* Chevron */}
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-amber-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>

                        {/* Description */}
                        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-500">
                          {mod.description}
                        </p>

                        {/* Spacer */}
                        <div className="mt-auto" />

                        {/* Progress bar — 0% until auth is wired */}
                        <ProgressBar percent={0} />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
