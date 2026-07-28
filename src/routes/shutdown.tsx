import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { useAuth } from "../components/AuthContext";

/* ── Types & constants ─────────────────────────────────── */

interface StepData {
  number: number;
  title: string;
  instruction: string;
  hasInputs?: boolean;
}

const RITUAL_STEPS: StepData[] = [
  {
    number: 1,
    title: "Close all open browser tabs",
    instruction:
      "Every tab. Every window. Close them all and start fresh tomorrow.",
  },
  {
    number: 2,
    title: "Clear your physical desk",
    instruction:
      "Put everything in its place — notebooks, pens, coffee cups. A clear desk signals a clear mind.",
  },
  {
    number: 3,
    title: "Review today's accomplishments",
    instruction:
      "Write down what you got done today. Not what you didn't — what you did.",
  },
  {
    number: 4,
    title: "Identify what's still open",
    instruction:
      "Note any unfinished items so your brain can let them go until tomorrow.",
  },
  {
    number: 5,
    title: "Set tomorrow's top 3 priorities",
    instruction:
      "Write down the three most important things you'll tackle first.",
    hasInputs: true,
  },
  {
    number: 6,
    title: "Block tomorrow's calendar for deep work",
    instruction:
      "Reserve at least one 90-minute block of uninterrupted focus time.",
  },
  {
    number: 7,
    title: "Turn off work notifications",
    instruction:
      "Slack, email push, Teams — silence them all until tomorrow morning.",
  },
  {
    number: 8,
    title: "Physically leave your workspace",
    instruction:
      "Close the door, walk away, or cover your laptop. Your workspace is now closed.",
  },
  {
    number: 9,
    title: "Take 3 deep breaths",
    instruction:
      "In through your nose for 4 counts. Hold for 4. Out through your mouth for 6. Transition your body out of work mode.",
  },
  {
    number: 10,
    title: 'Say out loud: "Work is closed. I am present."',
    instruction: "Speak it into existence. Your workday is officially over.",
  },
];

const STORAGE_KEY = "pp-shutdown-date";
const FOCUS_STORAGE_KEY = "pp-shutdown-focus";
const REFLECTION_STORAGE_KEY = "pp-shutdown-reflection";
const STREAK_KEY = "shutdown-streak";
const FAMILY_FORWARD_KEY = "shutdown-family-forward";

interface StreakData {
  streak: number;
  lastDate: string;
  completedToday: boolean;
  completionTime: string;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTimeString(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        streak: typeof parsed.streak === "number" ? parsed.streak : 0,
        lastDate: typeof parsed.lastDate === "string" ? parsed.lastDate : "",
        completedToday: !!parsed.completedToday,
        completionTime:
          typeof parsed.completionTime === "string" ? parsed.completionTime : "",
      };
    }
  } catch {
    /* corrupt data — reset */
  }
  return { streak: 0, lastDate: "", completedToday: false, completionTime: "" };
}

function saveStreakData(data: StreakData): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

/* ── Animated checkmark icon ───────────────────────────── */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Confetti particles ────────────────────────────────── */

function ConfettiParticles() {
  const colors = [
    "bg-amber-400",
    "bg-amber-500",
    "bg-amber-300",
    "bg-yellow-400",
    "bg-orange-400",
  ];

  const particles = Array.from({ length: 30 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 2 + Math.random() * 3;
    const size = 4 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const drift = (Math.random() - 0.5) * 60;

    return (
      <div
        key={i}
        className={`absolute ${color} rounded-sm opacity-0`}
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size * 0.6}px`,
          bottom: "-8px",
          animation: `confetti-fall ${duration}s ${delay}s ease-out forwards`,
          ["--drift" as string]: `${drift}px`,
        }}
      />
    );
  });

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh) translateX(var(--drift)) rotate(720deg);
          }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {particles}
      </div>
    </>
  );
}

/* ── Breathing circle ──────────────────────────────────── */

function BreathingCircle({
  phase,
  cycle,
}: {
  phase: "inhale" | "hold" | "exhale" | null;
  cycle: number;
}) {
  const textMap: Record<string, string> = {
    inhale: "Breathe in…",
    hold: "Hold…",
    exhale: "Breathe out…",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative flex h-40 w-40 items-center justify-center">
        {/* Outer glow ring */}
        <div
          key={`outer-${phase}-${cycle}`}
          className={`absolute inset-0 rounded-full border-4 border-amber-400/50 bg-amber-100/40 ${
            phase === "inhale"
              ? "animate-breath-in"
              : phase === "exhale"
                ? "animate-breath-out"
                : phase === "hold"
                  ? "scale-100"
                  : "scale-[0.625]"
          }`}
        />
        {/* Inner core */}
        <div
          key={`inner-${phase}-${cycle}`}
          className={`h-16 w-16 rounded-full bg-amber-400/30 ${
            phase === "inhale"
              ? "animate-breath-in"
              : phase === "exhale"
                ? "animate-breath-out"
                : phase === "hold"
                  ? "scale-100"
                  : "scale-[0.5]"
          }`}
        />
      </div>
      <p
        key={`text-${phase}-${cycle}`}
        className="text-lg font-medium text-amber-700 animate-[fade-in_0.5s_ease-out]"
      >
        {phase ? textMap[phase] : ""}
      </p>
      <p className="text-xs text-gray-400 tabular-nums">
        Breath {Math.min(cycle + 1, 3)} of 3
      </p>
    </div>
  );
}

/* ── Main page component ───────────────────────────────── */

export const Route = createFileRoute("/shutdown")({
  component: ShutdownPage,
});

function ShutdownPage() {
  const { user } = useAuth();

  /* ── Core state ────────────────────────────────────── */
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [priorities, setPriorities] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [tomorrowsFocus, setTomorrowsFocus] = useState("");
  const [focusSaved, setFocusSaved] = useState(false);
  const [gratitudeReflection, setGratitudeReflection] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /* ── Streak state ──────────────────────────────────── */
  const [streakData, setStreakData] = useState<StreakData>({
    streak: 0,
    lastDate: "",
    completedToday: false,
    completionTime: "",
  });

  /* ── Breathing animation state ─────────────────────── */
  const [breathPhase, setBreathPhase] = useState<
    "inhale" | "hold" | "exhale" | null
  >(null);
  const [breathCycle, setBreathCycle] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Family forward (overlay prompt) ───────────────── */
  const [familyForward, setFamilyForward] = useState("");
  const [familyForwardSaved, setFamilyForwardSaved] = useState(false);

  const focusSectionRef = useRef<HTMLDivElement>(null);

  /* ── Load persisted state on mount ─────────────────── */
  useEffect(() => {
    const today = getToday();
    const storedDate = localStorage.getItem(STORAGE_KEY);
    const streak = loadStreakData();

    setStreakData(streak);

    if (storedDate === today || (streak.completedToday && streak.lastDate === today)) {
      setAlreadyCompleted(true);
      const savedFocus = localStorage.getItem(FOCUS_STORAGE_KEY);
      const savedReflection = localStorage.getItem(REFLECTION_STORAGE_KEY);
      const savedFamilyForward = localStorage.getItem(FAMILY_FORWARD_KEY);
      if (savedFocus) {
        setTomorrowsFocus(savedFocus);
        setFocusSaved(true);
      }
      if (savedReflection) {
        setGratitudeReflection(savedReflection);
        setReflectionSaved(true);
      }
      if (savedFamilyForward) {
        setFamilyForward(savedFamilyForward);
        setFamilyForwardSaved(true);
      }
      setCompletedSteps(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
      setCurrentStepIndex(10);
    }
    setInitialized(true);
  }, []);

  /* ── Complete current step & advance ───────────────── */
  const completeCurrentStep = useCallback(() => {
    const stepNumber = currentStepIndex + 1;
    if (stepNumber > 10 || alreadyCompleted) return;

    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNumber);
      return next;
    });
    setCurrentStepIndex((prev) => prev + 1);
  }, [currentStepIndex, alreadyCompleted]);

  /* ── Persist completion + update streak ────────────── */
  const persistCompletion = useCallback(() => {
    const today = getToday();
    const timeStr = getTimeString();
    const yesterday = getYesterday();

    localStorage.setItem(STORAGE_KEY, today);
    localStorage.setItem(FOCUS_STORAGE_KEY, tomorrowsFocus);
    localStorage.setItem(REFLECTION_STORAGE_KEY, gratitudeReflection);
    if (familyForward.trim()) {
      localStorage.setItem(FAMILY_FORWARD_KEY, familyForward.trim());
    }

    const currentStreak = loadStreakData();
    let newStreak: number;

    if (currentStreak.lastDate === today) {
      newStreak = currentStreak.streak; // already completed today, don't double-count
    } else if (currentStreak.lastDate === yesterday) {
      newStreak = currentStreak.streak + 1; // consecutive day
    } else {
      newStreak = 1; // gap — reset streak
    }

    const newData: StreakData = {
      streak: newStreak,
      lastDate: today,
      completedToday: true,
      completionTime: timeStr,
    };
    saveStreakData(newData);
    setStreakData(newData);
    setShowOverlay(true);
  }, [tomorrowsFocus, gratitudeReflection, familyForward]);

  /* ── Trigger completion when all done ──────────────── */
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      completedSteps.size === 10 &&
      focusSaved &&
      reflectionSaved &&
      !showOverlay &&
      !alreadyCompleted &&
      !hasTriggeredRef.current
    ) {
      hasTriggeredRef.current = true;
      persistCompletion();
    }
  }, [
    completedSteps.size,
    focusSaved,
    reflectionSaved,
    showOverlay,
    alreadyCompleted,
    persistCompletion,
  ]);

  /* ── Breathing animation for step 9 (index 8) ──────── */
  useEffect(() => {
    if (currentStepIndex !== 8 || alreadyCompleted) return;

    let cycles = 0;
    let cancelled = false;

    const phases: Array<"inhale" | "hold" | "exhale"> = [
      "inhale",
      "hold",
      "exhale",
    ];
    const durations: Record<"inhale" | "hold" | "exhale", number> = {
      inhale: 4000,
      hold: 4000,
      exhale: 6000,
    };

    function runCycle(phaseIdx: number) {
      if (cancelled) return;
      const phase = phases[phaseIdx];
      setBreathPhase(phase);
      setBreathCycle(cycles);

      breathTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        if (phaseIdx === 2) {
          cycles++;
          if (cycles >= 3) {
            setBreathPhase(null);
            // Small delay so user sees the last exhale settle
            setTimeout(() => {
              if (!cancelled) completeCurrentStep();
            }, 500);
            return;
          }
          runCycle(0);
        } else {
          runCycle(phaseIdx + 1);
        }
      }, durations[phase]);
    }

    runCycle(0);

    return () => {
      cancelled = true;
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, [currentStepIndex, alreadyCompleted, completeCurrentStep]);

  /* ── Scroll to focus section when all steps done ───── */
  useEffect(() => {
    if (currentStepIndex >= 10 && focusSectionRef.current) {
      focusSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStepIndex]);

  /* ── Save focus ────────────────────────────────────── */
  const saveFocus = useCallback(() => {
    if (!tomorrowsFocus.trim()) return;
    setFocusSaved(true);
    localStorage.setItem(FOCUS_STORAGE_KEY, tomorrowsFocus);
  }, [tomorrowsFocus]);

  /* ── Save reflection ───────────────────────────────── */
  const saveReflection = useCallback(() => {
    if (!gratitudeReflection.trim()) return;
    setReflectionSaved(true);
    localStorage.setItem(REFLECTION_STORAGE_KEY, gratitudeReflection);
  }, [gratitudeReflection]);

  /* ── Save family forward ───────────────────────────── */
  const saveFamilyForward = useCallback(() => {
    if (!familyForward.trim()) return;
    setFamilyForwardSaved(true);
    localStorage.setItem(FAMILY_FORWARD_KEY, familyForward.trim());
  }, [familyForward]);

  /* ── Update priority input ─────────────────────────── */
  const updatePriority = useCallback((index: number, value: string) => {
    setPriorities((prev) => {
      const next: [string, string, string] = [...prev] as [
        string,
        string,
        string,
      ];
      next[index] = value;
      return next;
    });
  }, []);

  /* ── Dismiss overlay ───────────────────────────────── */
  const dismissOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  /* ── Reset ritual ──────────────────────────────────── */
  const resetRitual = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setPriorities(["", "", ""]);
    setTomorrowsFocus("");
    setFocusSaved(false);
    setGratitudeReflection("");
    setReflectionSaved(false);
    setShowOverlay(false);
    setAlreadyCompleted(false);
    setFamilyForward("");
    setFamilyForwardSaved(false);
    setBreathPhase(null);
    setBreathCycle(0);
    hasTriggeredRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOCUS_STORAGE_KEY);
    localStorage.removeItem(REFLECTION_STORAGE_KEY);
    localStorage.removeItem(FAMILY_FORWARD_KEY);
    // NOTE: we do NOT reset the streak — that's intentional
  }, []);

  /* ── Derived state ─────────────────────────────────── */
  const completedCount = completedSteps.size;
  const allStepsDone = currentStepIndex >= 10;
  const percent = (completedCount / 10) * 100;

  /* ── ── ALREADY COMPLETED VIEW ── ──────────────────── */
  if (initialized && alreadyCompleted) {
    return (
      <div className="min-h-dvh bg-[#faf7f2]">
        {/* Header */}
        <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-16 pt-20 text-center text-white sm:pb-20 sm:pt-28">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
          <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <CheckIcon className="h-9 w-9" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              You've already shut down work today.
            </h1>
            <p className="mt-3 text-lg text-gray-300">
              Well done. Your family got the best of you today.
            </p>
            {streakData.completionTime && (
              <p className="mt-2 text-sm text-amber-400/80">
                Completed at {streakData.completionTime}
              </p>
            )}
          </div>
        </header>

        {/* Saved summary */}
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* Streak card */}
          {streakData.streak > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-2xl font-extrabold text-[#0f1d36]">
                    {streakData.streak} Day Streak
                  </p>
                  <p className="text-sm text-gray-500">
                    {streakData.streak === 1
                      ? "First day of your streak — keep it going!"
                      : "You're building something powerful."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(focusSaved || reflectionSaved) && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Recap</h2>
              {focusSaved && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                    Tomorrow's #1 Priority
                  </p>
                  <p className="mt-2 text-lg text-gray-800">{tomorrowsFocus}</p>
                </div>
              )}
              {reflectionSaved && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                    Today's Gratitude
                  </p>
                  <p className="mt-2 text-lg italic text-gray-700">
                    "{gratitudeReflection}"
                  </p>
                </div>
              )}
              {familyForward && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                    Looking Forward To
                  </p>
                  <p className="mt-2 text-lg text-gray-800">{familyForward}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={resetRitual}
            className="mt-8 cursor-pointer rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
          >
            Do it again?
          </button>
        </div>
      </div>
    );
  }

  /* ── ── MAIN RITUAL VIEW ── ────────────────────────── */
  return (
    <div className="min-h-dvh bg-[#faf7f2]">
      {/* ── Header ──────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-16 pt-20 text-center text-white sm:pb-20 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-2xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            The Turn-Off Ritual
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            The Work Shutdown Ritual
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Close the workday with intention. Open your evening with presence.
          </p>

          {/* Auth greeting */}
          {user ? (
            <p className="mt-4 text-sm text-amber-400/80">
              Welcome back, {user.name}
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              <a
                href="/login"
                className="underline underline-offset-2 transition hover:text-amber-300"
              >
                Sign in
              </a>{" "}
              to track your streaks
            </p>
          )}
        </div>
      </header>

      {/* ── Progress bar ─────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <ProgressBar
          percent={percent}
          label={`${completedCount} of 10 steps complete`}
        />
      </div>

      {/* ── Sequential ritual steps ───────────────────── */}
      <section className="mx-auto max-w-2xl px-6 py-8">
        <div className="space-y-3">
          {/* Completed steps (compact summary) */}
          {RITUAL_STEPS.filter((step) => completedSteps.has(step.number)).map(
            (step) => (
              <div
                key={`done-${step.number}`}
                className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-3 text-sm animate-[slide-down_0.3s_ease-out]"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-amber-800 line-through decoration-amber-400/50">
                  {step.title}
                </span>
              </div>
            ),
          )}

          {/* Current active step (only when not all done) */}
          {!allStepsDone && (
            <ActiveStep
              step={RITUAL_STEPS[currentStepIndex]}
              stepIndex={currentStepIndex}
              completedSteps={completedSteps}
              priorities={priorities}
              updatePriority={updatePriority}
              breathPhase={breathPhase}
              breathCycle={breathCycle}
              onComplete={completeCurrentStep}
            />
          )}
        </div>
      </section>

      {/* ── Tomorrow's Focus + Reflection (after all 10) ── */}
      {allStepsDone && (
        <div ref={focusSectionRef} className="mx-auto max-w-2xl px-6 pb-8">
          {/* Tomorrow's Focus */}
          <div className="animate-[slide-down_0.4s_ease-out] rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f1d36] text-sm font-bold text-amber-400">
                ★
              </span>
              Tomorrow's Focus
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              What's the single most important thing you'll accomplish tomorrow?
              This is your North Star.
            </p>

            {!focusSaved ? (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="My #1 priority for tomorrow is..."
                  value={tomorrowsFocus}
                  onChange={(e) => setTomorrowsFocus(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveFocus();
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-800 placeholder-gray-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
                <button
                  onClick={saveFocus}
                  disabled={!tomorrowsFocus.trim()}
                  className="cursor-pointer rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Focus
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                  Your North Star
                </p>
                <p className="mt-1 text-lg font-medium text-gray-800">
                  {tomorrowsFocus}
                </p>
                <button
                  onClick={() => setFocusSaved(false)}
                  className="mt-3 cursor-pointer text-xs font-medium text-amber-600 underline hover:text-amber-800"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Daily Reflection */}
          <div className="animate-[slide-down_0.4s_ease-out_0.1s_both] mt-6 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f1d36] text-sm font-bold text-amber-400">
                ♥
              </span>
              Daily Reflection
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              What's one thing you're grateful for from today's work?
            </p>

            {!reflectionSaved ? (
              <div className="mt-4 space-y-3">
                <textarea
                  placeholder="Today I'm grateful for..."
                  value={gratitudeReflection}
                  onChange={(e) => setGratitudeReflection(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-800 placeholder-gray-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
                <button
                  onClick={saveReflection}
                  disabled={!gratitudeReflection.trim()}
                  className="cursor-pointer rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Reflection
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                  Today's Gratitude
                </p>
                <p className="mt-1 text-lg italic text-gray-700">
                  "{gratitudeReflection}"
                </p>
                <button
                  onClick={() => setReflectionSaved(false)}
                  className="mt-3 cursor-pointer text-xs font-medium text-amber-600 underline hover:text-amber-800"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Completion overlay ───────────────────────────── */}
      {showOverlay && (
        <>
          <ConfettiParticles />
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f1d36]/95 px-6 animate-[overlay-in_0.5s_ease-out]"
            onClick={dismissOverlay}
          >
            <style>{`
              @keyframes overlay-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              @keyframes scale-in {
                0% { opacity: 0; transform: scale(0.85); }
                60% { transform: scale(1.03); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div
              className="relative w-full max-w-md text-center animate-[scale-in_0.6s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </div>

              {/* Text */}
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Work is closed.
              </h2>
              <p className="mt-2 text-xl font-semibold text-amber-400 sm:text-2xl">
                You are present.
              </p>

              {/* Streak */}
              {streakData.streak > 0 && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2">
                  <span className="text-xl">🔥</span>
                  <span className="text-lg font-bold text-amber-300">
                    {streakData.streak} Day Streak!
                  </span>
                </div>
              )}

              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                Your family is waiting.
              </p>

              {/* Optional prompt: what are you looking forward to? */}
              {!familyForwardSaved ? (
                <div
                  className="mt-6 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-400">
                    What's one thing you're looking forward to with your family
                    tonight?
                  </p>
                  <input
                    type="text"
                    placeholder="Playing catch, reading a story..."
                    value={familyForward}
                    onChange={(e) => setFamilyForward(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveFamilyForward();
                    }}
                    className="w-full rounded-xl border border-gray-600 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                  <button
                    onClick={saveFamilyForward}
                    disabled={!familyForward.trim()}
                    className="cursor-pointer rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-400/20 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Save
                  </button>
                </div>
              ) : familyForward ? (
                <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                    Looking Forward To
                  </p>
                  <p className="mt-1 text-base text-green-200">
                    {familyForward}
                  </p>
                </div>
              ) : null}

              {/* Dismiss button */}
              <button
                onClick={dismissOverlay}
                className="mt-8 cursor-pointer rounded-full border border-amber-400/40 bg-amber-400/10 px-8 py-3 text-base font-semibold text-amber-400 transition hover:bg-amber-400/20 hover:text-amber-300"
              >
                I'm ready
              </button>

              <p className="mt-4 text-xs text-gray-500">Tap anywhere to dismiss</p>
            </div>
          </div>
        </>
      )}

      {/* ── Animations ────────────────────────────────────── */}
      <style>{`
        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes breath-in {
          from { transform: scale(0.625); }
          to { transform: scale(1); }
        }
        @keyframes breath-out {
          from { transform: scale(1); }
          to { transform: scale(0.625); }
        }
        @keyframes fire-flicker {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-breath-in {
          animation: breath-in 4s linear forwards;
        }
        .animate-breath-out {
          animation: breath-out 6s linear forwards;
        }
      `}</style>
    </div>
  );
}

/* ── ── ACTIVE STEP COMPONENT ── ──────────────────────── */

interface ActiveStepProps {
  step: StepData;
  stepIndex: number;
  completedSteps: Set<number>;
  priorities: [string, string, string];
  updatePriority: (index: number, value: string) => void;
  breathPhase: "inhale" | "hold" | "exhale" | null;
  breathCycle: number;
  onComplete: () => void;
}

function ActiveStep({
  step,
  stepIndex,
  priorities,
  updatePriority,
  breathPhase,
  breathCycle,
  onComplete,
}: ActiveStepProps) {
  const isStep9 = step.number === 9;

  return (
    <div className="animate-[slide-down_0.35s_ease-out] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md">
      {/* Step number badge + title */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0f1d36] text-sm font-bold text-amber-400">
          {step.number}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            {step.instruction}
          </p>
        </div>
      </div>

      {/* Step 5: priority inputs */}
      {step.hasInputs && (
        <div className="mt-5 space-y-2">
          {["First priority", "Second priority", "Third priority"].map(
            (placeholder, i) => (
              <input
                key={i}
                type="text"
                placeholder={placeholder}
                value={priorities[i]}
                onChange={(e) => updatePriority(i, e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
            ),
          )}
        </div>
      )}

      {/* Step 9: breathing animation */}
      {isStep9 && (
        <BreathingCircle phase={breathPhase} cycle={breathCycle} />
      )}

      {/* Complete button (not for step 9 — it auto-completes via breathing) */}
      {!isStep9 && (
        <button
          onClick={onComplete}
          className="mt-5 cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f1d36] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a2d4a] active:scale-[0.98]"
        >
          <CheckIcon className="h-4 w-4" />
          Done — Next Step
        </button>
      )}

      {/* Step 9: subtle skip link (in case breathing doesn't work for someone) */}
      {isStep9 && (
        <button
          onClick={onComplete}
          className="mt-4 cursor-pointer w-full text-center text-xs font-medium text-gray-400 underline underline-offset-2 transition hover:text-gray-600"
        >
          Skip breathing exercise
        </button>
      )}
    </div>
  );
}
