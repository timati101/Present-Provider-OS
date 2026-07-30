import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useCallback } from "react";
import { sql } from "~/db";
import { ProgressBar } from "~/components/ProgressBar";
import { StreakCounter } from "~/components/StreakCounter";

/* ── Types ─────────────────────────────────────────────────── */

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string | null;
  duration_days: number;
}

interface EnrolledChallenge extends Challenge {
  enrolledAt: string;
  checkinDates: string[];
}

/* ── Category config ────────────────────────────────────────── */

const categoryConfig: Record<string, { badge: string; label: string }> = {
  Ritual: { badge: "bg-[#0f1d36] text-amber-400", label: "Ritual" },
  Family: { badge: "bg-rose-600 text-white", label: "Family" },
  Tech: { badge: "bg-sky-600 text-white", label: "Tech" },
  Mindset: { badge: "bg-purple-600 text-white", label: "Mindset" },
  Finances: { badge: "bg-blue-600 text-white", label: "Finances" },
  Work: { badge: "bg-amber-500 text-white", label: "Work" },
};

function getCategoryConfig(cat: string | null) {
  return (
    categoryConfig[cat ?? ""] ?? {
      badge: "bg-gray-500 text-white",
      label: cat ?? "General",
    }
  );
}

/* ── localStorage helpers ──────────────────────────────────── */

const STORAGE_KEY = "pp_enrolled_challenges";

function loadEnrolled(): EnrolledChallenge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEnrolled(challenges: EnrolledChallenge[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
}

/* ── Date helpers ───────────────────────────────────────────── */

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** Calculate the current streak: consecutive days from today backwards */
function calcStreak(checkinDates: string[]): number {
  if (checkinDates.length === 0) return 0;
  const sorted = [...checkinDates].sort().reverse();
  const today = todayStr();

  // Must have checked in today or yesterday for a living streak
  const latest = sorted[0];
  if (latest !== today && latest !== yesterdayStr()) return 0;

  let streak = latest === today ? 1 : 0;
  for (let i = latest === today ? 1 : 0; i < sorted.length; i++) {
    const expected = daysBeforeToday(streak + (latest === today ? 0 : 1));
    if (sorted[i] === expected) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function daysBeforeToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/* ── Server loader ─────────────────────────────────────────── */

const getChallenges = createServerFn({ method: "GET" }).handler(async (): Promise<Challenge[]> => {
  const db = sql();
  const rows = await db`
    SELECT * FROM challenges
    ORDER BY category, duration_days
  `;
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    description: String(r.description ?? ""),
    category: r.category ? String(r.category) : null,
    duration_days: Number(r.duration_days),
  }));
});

/* ── Route ─────────────────────────────────────────────────── */

export const Route = createFileRoute("/challenges")({
  loader: () => getChallenges(),
  component: ChallengesPage,
});

/* ── Category icon ─────────────────────────────────────────── */

function CategoryIcon({ category }: { category: string | null }) {
  const cls = "h-5 w-5";
  switch (category) {
    case "Ritual":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
      );
    case "Family":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      );
    case "Tech":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      );
    case "Mindset":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
    case "Finances":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Work":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

/* ── Page ──────────────────────────────────────────────────── */

function ChallengesPage() {
  const allChallenges = Route.useLoaderData();
  const [tab, setTab] = useState<"enrolled" | "available">("available");
  const [enrolled, setEnrolled] = useState<EnrolledChallenge[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setEnrolled(loadEnrolled());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever enrolled changes
  useEffect(() => {
    if (hydrated) {
      saveEnrolled(enrolled);
    }
  }, [enrolled, hydrated]);

  const enrolledIds = new Set(enrolled.map((e) => e.id));

  // Available challenges = all not in enrolled
  const availableChallenges = allChallenges.filter((c) => !enrolledIds.has(c.id));

  // Enroll in a challenge
  const handleEnroll = useCallback(
    (challenge: Challenge) => {
      setEnrolled((prev) => {
        if (prev.some((e) => e.id === challenge.id)) return prev;
        const ec: EnrolledChallenge = {
          ...challenge,
          enrolledAt: new Date().toISOString(),
          checkinDates: [],
        };
        const updated = [...prev, ec];
        saveEnrolled(updated);
        return updated;
      });
      // Auto-switch to enrolled tab
      setTab("enrolled");
    },
    [],
  );

  // Check in today
  const handleCheckIn = useCallback((challengeId: string) => {
    setEnrolled((prev) => {
      const updated = prev.map((ec) => {
        if (ec.id !== challengeId) return ec;
        const today = todayStr();
        if (ec.checkinDates.includes(today)) return ec; // already checked in today
        return { ...ec, checkinDates: [...ec.checkinDates, today] };
      });
      saveEnrolled(updated);
      return updated;
    });
  }, []);

  // Longest streak across all enrolled
  const longestStreak = enrolled.reduce((max, ec) => {
    const s = calcStreak(ec.checkinDates);
    return s > max ? s : max;
  }, 0);

  // During SSR, skip hydration guard and render fully
  const isSSR = typeof window === "undefined";

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-16 pt-24 text-center text-white sm:pb-20 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            Build Better Habits
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Challenges</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-300">
            Build habits that stick. One day at a time.
          </p>
        </div>
      </header>

      {/* ── Streak Banner ────────────────────────────────── */}
      <div className="mx-auto -mt-8 max-w-6xl px-6">
        <div className="rounded-2xl border border-amber-200/50 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Your Longest Active Streak
              </p>
              <div className="mt-1">
                <StreakCounter streak={longestStreak} label="day streak" size="lg" />
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900 tabular-nums">
                  {enrolled.length}
                </span>
                <span className="text-xs">Enrolled</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900 tabular-nums">
                  {enrolled.reduce((sum, ec) => sum + ec.checkinDates.length, 0)}
                </span>
                <span className="text-xs">Total Check-ins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* Tab buttons */}
        <div className="mb-8 flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setTab("enrolled")}
            className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === "enrolled"
                ? "bg-white text-[#0f1d36] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Enrolled
            {enrolled.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {enrolled.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("available")}
            className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              tab === "available"
                ? "bg-white text-[#0f1d36] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Available
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
              {availableChallenges.length}
            </span>
          </button>
        </div>

        {/* ── Enrolled Tab ─────────────────────────────────── */}
        {tab === "enrolled" && (
          <>
            {enrolled.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
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
                      d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">No active challenges</h2>
                <p className="mt-2 text-gray-500">
                  You haven't started any challenges yet. Pick one below!
                </p>
                <button
                  onClick={() => setTab("available")}
                  className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  Browse Challenges
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {enrolled.map((ec) => {
                  const streak = calcStreak(ec.checkinDates);
                  const catConfig = getCategoryConfig(ec.category);
                  const checkedInToday = ec.checkinDates.includes(todayStr());
                  const completedDays = ec.checkinDates.length;
                  const percent = Math.round((completedDays / ec.duration_days) * 100);

                  return (
                    <div
                      key={ec.id}
                      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                    >
                      {/* Category + duration */}
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${catConfig.badge}`}
                        >
                          <CategoryIcon category={ec.category} />
                          {catConfig.label}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          {ec.duration_days} days
                        </span>
                      </div>

                      {/* Title + desc */}
                      <h3 className="text-lg font-bold text-gray-900">{ec.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
                        {ec.description}
                      </p>

                      {/* Streak */}
                      <div className="mt-4">
                        <StreakCounter streak={streak} label="day streak" size="md" />
                      </div>

                      {/* Progress */}
                      <div className="mt-3">
                        <ProgressBar
                          percent={percent}
                          label={`${completedDays} of ${ec.duration_days} days`}
                        />
                      </div>

                      {/* Last check-in */}
                      <p className="mt-3 text-xs text-gray-400">
                        {ec.checkinDates.length > 0
                          ? `Last check-in: ${ec.checkinDates.sort().reverse()[0]}`
                          : "No check-ins yet"}
                      </p>

                      {/* Check In button */}
                      <button
                        onClick={() => handleCheckIn(ec.id)}
                        disabled={checkedInToday}
                        className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          checkedInToday
                            ? "cursor-default bg-emerald-50 text-emerald-600"
                            : "bg-amber-500 text-white hover:bg-amber-600"
                        }`}
                      >
                        {checkedInToday ? (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Checked In Today
                          </>
                        ) : (
                          "Check In Today"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Available Tab ────────────────────────────────── */}
        {tab === "available" && (
          <>
            {availableChallenges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">You're crushing it!</h2>
                <p className="mt-2 text-gray-500">
                  You're enrolled in every challenge. Check back for new challenges.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableChallenges.map((challenge) => {
                  const catConfig = getCategoryConfig(challenge.category);
                  return (
                    <div
                      key={challenge.id}
                      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                    >
                      {/* Category + duration */}
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${catConfig.badge}`}
                        >
                          <CategoryIcon category={challenge.category} />
                          {catConfig.label}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          {challenge.duration_days} days
                        </span>
                      </div>

                      {/* Title + desc */}
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                        {challenge.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
                        {challenge.description}
                      </p>

                      {/* Enroll button */}
                      <button
                        onClick={() => handleEnroll(challenge)}
                        className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f1d36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f1d36]/90"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Enroll
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
