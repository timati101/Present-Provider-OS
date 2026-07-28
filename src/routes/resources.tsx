import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { sql } from "~/db";

/* ── Types ─────────────────────────────────────────────────── */

interface Resource {
  id: string;
  title: string;
  description: string;
  module_id: string | null;
  module_title: string | null;
  file_type: "spreadsheet" | "worksheet" | "guide" | "prompt_library";
  download_url: string;
}

interface ModuleInfo {
  id: string;
  title: string;
  category: string;
}

type FileType = "all" | "spreadsheet" | "worksheet" | "guide" | "prompt_library";

/* ── Category colors (from curriculum) ──────────────────────── */

const categoryColors: Record<string, string> = {
  Foundation: "bg-[#0f1d36] text-amber-400",
  Work: "bg-amber-500 text-white",
  Structure: "bg-emerald-600 text-white",
  Finances: "bg-blue-600 text-white",
  Mindset: "bg-purple-600 text-white",
  Career: "bg-orange-600 text-white",
  Family: "bg-rose-600 text-white",
  Vision: "bg-indigo-600 text-white",
};

function getCategoryBadge(category: string): string {
  return categoryColors[category] ?? "bg-gray-500 text-white";
}

/* ── File type config ───────────────────────────────────────── */

const fileTypeConfig: Record<
  Exclude<FileType, "all">,
  { label: string; icon: string }
> = {
  spreadsheet: { label: "Spreadsheets", icon: "📊" },
  worksheet: { label: "Worksheets", icon: "📝" },
  guide: { label: "Guides", icon: "📖" },
  prompt_library: { label: "Prompt Libraries", icon: "🤖" },
};

const fileTypeFilters: { value: FileType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "spreadsheet", label: "Spreadsheets" },
  { value: "worksheet", label: "Worksheets" },
  { value: "guide", label: "Guides" },
  { value: "prompt_library", label: "Prompt Libraries" },
];

/* ── SVG icons ──────────────────────────────────────────────── */

function SpreadsheetIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zM3.75 9h16.5M9 3.75v16.5" />
    </svg>
  );
}

function WorksheetIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function PromptLibraryIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function getFileTypeIcon(fileType: string) {
  switch (fileType) {
    case "spreadsheet":
      return <SpreadsheetIcon />;
    case "worksheet":
      return <WorksheetIcon />;
    case "guide":
      return <GuideIcon />;
    case "prompt_library":
      return <PromptLibraryIcon />;
    default:
      return <WorksheetIcon />;
  }
}

/* ── Server loader ──────────────────────────────────────────── */

interface ResourceRow {
  id: string;
  title: string;
  description: string;
  module_id: string | null;
  module_title: string | null;
  module_category: string | null;
  file_type: string;
  download_url: string;
}

const getResources = createServerFn({ method: "GET" }).handler(async (): Promise<ResourceRow[]> => {
  const db = sql();
  const rows = await db`
    SELECT r.*, m.title as module_title, m.category as module_category
    FROM resources r
    LEFT JOIN modules m ON r.module_id = m.id
    ORDER BY r.file_type, r.title
  `;
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    description: String(r.description ?? ""),
    module_id: r.module_id ? String(r.module_id) : null,
    module_title: r.module_title ? String(r.module_title) : null,
    module_category: r.module_category ? String(r.module_category) : null,
    file_type: String(r.file_type),
    download_url: String(r.download_url ?? ""),
  }));
});

/* ── Route ──────────────────────────────────────────────────── */

export const Route = createFileRoute("/resources")({
  loader: () => getResources(),
  component: ResourcesPage,
});

/* ── Page component ─────────────────────────────────────────── */

function ResourcesPage() {
  const resources = Route.useLoaderData();

  const [fileTypeFilter, setFileTypeFilter] = useState<FileType>("all");
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);

  // Extract unique modules for the module filter
  const modules = useMemo(() => {
    const seen = new Map<string, { id: string; title: string; category: string }>();
    for (const r of resources) {
      if (r.module_id && r.module_title && !seen.has(r.module_id)) {
        seen.set(r.module_id, {
          id: r.module_id,
          title: r.module_title,
          category: r.module_category ?? "",
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [resources]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesType =
        fileTypeFilter === "all" || r.file_type === fileTypeFilter;
      const matchesModule =
        moduleFilter === null || r.module_id === moduleFilter;
      return matchesType && matchesModule;
    });
  }, [resources, fileTypeFilter, moduleFilter]);

  const totalCount = resources.length;
  const filteredCount = filtered.length;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-16 pt-24 text-center text-white sm:pb-20 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            Downloadable Tools
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Resources &amp; Tools
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-300">
            Spreadsheets, worksheets, guides, and prompt libraries to support every module.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {/* ── Filters ─────────────────────────────────────── */}
        <div className="mb-8 space-y-5">
          {/* File type filters */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Filter by Type
            </p>
            <div className="flex flex-wrap gap-2">
              {fileTypeFilters.map((ft) => {
                const isActive = fileTypeFilter === ft.value;
                return (
                  <button
                    key={ft.value}
                    onClick={() => setFileTypeFilter(ft.value)}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200"
                    }`}
                  >
                    {ft.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module filters */}
          {modules.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                Filter by Module
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModuleFilter(null)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                    moduleFilter === null
                      ? "bg-[#0f1d36] text-amber-400 shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All Modules
                </button>
                {modules.map((mod) => {
                  const isActive = moduleFilter === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setModuleFilter(mod.id)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition border ${
                        isActive
                          ? getCategoryBadge(mod.category) + " shadow-sm border-transparent"
                          : "bg-white text-gray-600 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      {mod.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Resource count ──────────────────────────────── */}
        <p className="mb-6 text-sm text-gray-500">
          {filteredCount === totalCount
            ? `Showing all ${totalCount} resources`
            : `Showing ${filteredCount} of ${totalCount} resources`}
        </p>

        {/* ── Resource cards grid ──────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg
                className="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No resources match your filters</h2>
            <p className="mt-2 text-gray-500">
              Try a different category or module combination.
            </p>
            <button
              onClick={() => {
                setFileTypeFilter("all");
                setModuleFilter(null);
              }}
              className="mt-4 cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((res) => {
              const ftConfig = fileTypeConfig[res.file_type as Exclude<FileType, "all">] ?? {
                label: res.file_type,
                icon: "📄",
              };

              return (
                <div
                  key={res.id}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                >
                  {/* File type icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f1d36] text-amber-400">
                    {getFileTypeIcon(res.file_type)}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-amber-700 transition-colors">
                    {res.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {res.description}
                  </p>

                  {/* Badges row */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* File type label */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      <span className="text-xs">{ftConfig.icon}</span>
                      {ftConfig.label}
                    </span>

                    {/* Module badge */}
                    {res.module_id && res.module_title && (
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryBadge(res.module_category ?? "")}`}
                      >
                        {res.module_title}
                      </span>
                    )}
                  </div>

                  {/* Spacer and download */}
                  <div className="mt-auto pt-5">
                    <a
                      href={res.download_url || "#"}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                      download={res.download_url ? true : undefined}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
