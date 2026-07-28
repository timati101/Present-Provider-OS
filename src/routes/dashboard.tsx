import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "~/components/AuthContext";
import { ProgressBar } from "~/components/ProgressBar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

/* ── Helpers ─────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const FATHER_QUOTES = [
  {
    text: "The most important work you will ever do will be within the walls of your own home.",
    author: "Harold B. Lee",
  },
  {
    text: "Your presence is the greatest present you can give your children.",
    author: "Unknown",
  },
  {
    text: "A father is neither an anchor to hold us back nor a sail to take us there, but a guiding light whose love shows us the way.",
    author: "Unknown",
  },
  {
    text: "It is easier to build strong children than to repair broken men.",
    author: "Frederick Douglass",
  },
  {
    text: "The heart of a father is the masterpiece of nature.",
    author: "Antoine François Prévost",
  },
];

interface DailyIntention {
  text: string;
  date: string;
}

/* ── Page component ──────────────────────────────────── */

function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* Local state — loaded from localStorage */
  const [streak, setStreak] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [intention, setIntention] = useState<DailyIntention | null>(null);
  const [editingIntention, setEditingIntention] = useState(false);
  const [intentionInput, setIntentionInput] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  /* Load persisted data on mount */
  useEffect(() => {
    // Streak (supports both legacy number and new JSON format)
    const savedStreak = localStorage.getItem("shutdown-streak");
    if (savedStreak) {
      try {
        const parsed = JSON.parse(savedStreak);
        if (typeof parsed.streak === "number") {
          setStreak(parsed.streak);
        }
      } catch {
        const n = parseInt(savedStreak, 10);
        if (!isNaN(n)) setStreak(n);
      }
    }

    // Completed lessons
    const savedLessons = localStorage.getItem("completed-lessons");
    if (savedLessons) {
      try {
        const arr = JSON.parse(savedLessons);
        if (Array.isArray(arr)) setCompletedLessons(arr);
      } catch {
        /* ignore corrupt data */
      }
    }

    // Daily intention
    const savedIntention = localStorage.getItem("daily-intention");
    if (savedIntention) {
      try {
        const parsed: DailyIntention = JSON.parse(savedIntention);
        setIntention(parsed);
        setIntentionInput(parsed.text);
      } catch {
        /* ignore corrupt data */
      }
    }

    // Random quote
    setQuoteIndex(Math.floor(Math.random() * FATHER_QUOTES.length));
  }, []);

  /* ── Loading state ────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#faf7f2]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
          <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  /* ── Redirect if not authenticated ────────────────── */
  if (!user) {
    router.navigate({ to: "/login" });
    return null;
  }

  /* ── Derived values ───────────────────────────────── */
  const greeting = getGreeting();
  const today = getFormattedDate();
  const totalLessons = 38;
  const curriculumPercent = totalLessons > 0
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0;
  const isToday = intention?.date === getTodayStr();
  const quote = FATHER_QUOTES[quoteIndex];

  /* ── Intention handlers ───────────────────────────── */
  const saveIntention = () => {
    const trimmed = intentionInput.trim();
    if (!trimmed) return;
    const newIntention: DailyIntention = { text: trimmed, date: getTodayStr() };
    setIntention(newIntention);
    localStorage.setItem("daily-intention", JSON.stringify(newIntention));
    setEditingIntention(false);
  };

  const cancelEditIntention = () => {
    setEditingIntention(false);
    setIntentionInput(intention?.text ?? "");
  };

  const startNewIntention = () => {
    setEditingIntention(true);
    setIntentionInput("");
  };

  const startEditIntention = () => {
    setEditingIntention(true);
    setIntentionInput(intention?.text ?? "");
  };

  /* ── Action cards ─────────────────────────────────── */
  const actionCards = [
    {
      icon: "🌅",
      title: "Shutdown Ritual",
      desc: "End your workday with intention",
      to: "/shutdown",
    },
    {
      icon: "📖",
      title: "Continue Curriculum",
      desc: "Pick up where you left off",
      to: "/curriculum",
    },
    {
      icon: "🔥",
      title: "Daily Challenge",
      desc: "Build the habits that matter",
      to: "/challenges",
    },
    {
      icon: "🤝",
      title: "Brotherhood",
      desc: "Connect with other dads",
      to: "/brotherhood",
    },
  ];

  /* ── Render ───────────────────────────────────────── */
  return (
    <div className="min-h-dvh bg-[#faf7f2]">
      {/* ── Section A — Welcome Header ────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-12 pt-16 sm:pb-16 sm:pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {greeting}, {user.name}
          </h1>
          <p className="mt-2 text-base text-gray-400 sm:text-lg">{today}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
            Your family operating system
          </p>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────── */}
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        {/* ── Section B — Streak & Stats Row ──────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 🔥 Current Streak */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                🔥
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Current Streak
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[#0f1d36]">{streak}</p>
            <p className="mt-1 text-sm text-gray-500">
              {streak > 0 ? "Keep it going!" : "Start your streak today"}
            </p>
          </div>

          {/* 📚 Curriculum Progress */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                📚
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Curriculum
              </span>
            </div>
            <ProgressBar
              percent={curriculumPercent}
              label={`${completedLessons.length} of ${totalLessons} lessons`}
            />
          </div>

          {/* ⏰ Today's Intention */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                ⏰
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Today&rsquo;s Intention
              </span>
            </div>

            {editingIntention ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={intentionInput}
                  onChange={(e) => setIntentionInput(e.target.value)}
                  placeholder="What matters most today?"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveIntention();
                    if (e.key === "Escape") cancelEditIntention();
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveIntention}
                    disabled={!intentionInput.trim()}
                    className="cursor-pointer rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditIntention}
                    className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : intention && isToday ? (
              <div>
                <p className="text-base font-medium italic text-gray-800">
                  &ldquo;{intention.text}&rdquo;
                </p>
                <button
                  onClick={startEditIntention}
                  className="mt-2 cursor-pointer text-xs font-medium text-amber-600 transition hover:text-amber-700"
                >
                  Edit intention
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-sm text-gray-500">
                  Set your intention for today
                </p>
                <button
                  onClick={startNewIntention}
                  className="cursor-pointer text-sm font-medium text-amber-600 transition hover:text-amber-700"
                >
                  + Add intention
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Section C — Today's Actions ──────────────── */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-600">
            Today&rsquo;s Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {actionCards.map((card) => (
              <a
                key={card.to}
                href={card.to}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl transition group-hover:bg-amber-100">
                  {card.icon}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#0f1d36] transition group-hover:text-amber-700">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {card.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Section D — Daily Wisdom ─────────────────── */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-600">
            Daily Wisdom
          </h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <blockquote className="text-base italic leading-relaxed text-gray-600 sm:text-lg">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <cite className="mt-3 block text-sm font-medium not-italic text-amber-600">
              &mdash; {quote.author}
            </cite>
          </div>
        </section>
      </div>
    </div>
  );
}
