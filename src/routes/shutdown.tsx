import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ProgressBar } from "../components/ProgressBar";

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

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
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

/* ── Main page component ───────────────────────────────── */

export const Route = createFileRoute("/shutdown")({
  component: ShutdownPage,
});

function ShutdownPage() {
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

  const focusSectionRef = useRef<HTMLDivElement>(null);

  /* ── Load persisted state on mount ──────────────────── */
  useEffect(() => {
    const today = getToday();
    const storedDate = localStorage.getItem(STORAGE_KEY);

    if (storedDate === today) {
      setAlreadyCompleted(true);
      // Restore saved values
      const savedFocus = localStorage.getItem(FOCUS_STORAGE_KEY);
      const savedReflection = localStorage.getItem(REFLECTION_STORAGE_KEY);
      if (savedFocus) {
        setTomorrowsFocus(savedFocus);
        setFocusSaved(true);
      }
      if (savedReflection) {
        setGratitudeReflection(savedReflection);
        setReflectionSaved(true);
      }
    }
    setInitialized(true);
  }, []);

  /* ── Persist completion ─────────────────────────────── */
  const persistIfAllDone = useCallback(
    (completed: Set<number>, focusDone: boolean, reflectionDone: boolean) => {
      if (
        completed.size === 10 &&
        focusDone &&
        reflectionDone
      ) {
        const today = getToday();
        localStorage.setItem(STORAGE_KEY, today);
        localStorage.setItem(FOCUS_STORAGE_KEY, tomorrowsFocus);
        localStorage.setItem(REFLECTION_STORAGE_KEY, gratitudeReflection);
        setShowOverlay(true);
      }
    },
    [tomorrowsFocus, gratitudeReflection],
  );

  /* ── Toggle step ────────────────────────────────────── */
  const toggleStep = useCallback(
    (stepNumber: number) => {
      if (alreadyCompleted) return;
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        if (next.has(stepNumber)) {
          next.delete(stepNumber);
        } else {
          next.add(stepNumber);
        }
        persistIfAllDone(next, focusSaved, reflectionSaved);
        return next;
      });
    },
    [alreadyCompleted, focusSaved, reflectionSaved, persistIfAllDone],
  );

  /* ── Update priority input ──────────────────────────── */
  const updatePriority = useCallback((index: number, value: string) => {
    setPriorities((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  }, []);

  /* ── Save focus ─────────────────────────────────────── */
  const saveFocus = useCallback(() => {
    if (!tomorrowsFocus.trim()) return;
    setFocusSaved(true);
    localStorage.setItem(FOCUS_STORAGE_KEY, tomorrowsFocus);
    persistIfAllDone(completedSteps, true, reflectionSaved);
  }, [tomorrowsFocus, completedSteps, reflectionSaved, persistIfAllDone]);

  /* ── Save reflection ────────────────────────────────── */
  const saveReflection = useCallback(() => {
    if (!gratitudeReflection.trim()) return;
    setReflectionSaved(true);
    localStorage.setItem(REFLECTION_STORAGE_KEY, gratitudeReflection);
    persistIfAllDone(completedSteps, focusSaved, true);
  }, [gratitudeReflection, completedSteps, focusSaved, persistIfAllDone]);

  /* ── Dismiss overlay ────────────────────────────────── */
  const dismissOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  /* ── Reset ritual (for a fresh start) ───────────────── */
  const resetRitual = useCallback(() => {
    setCompletedSteps(new Set());
    setPriorities(["", "", ""]);
    setTomorrowsFocus("");
    setFocusSaved(false);
    setGratitudeReflection("");
    setReflectionSaved(false);
    setShowOverlay(false);
    setAlreadyCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOCUS_STORAGE_KEY);
    localStorage.removeItem(REFLECTION_STORAGE_KEY);
  }, []);

  /* ── Derived state ──────────────────────────────────── */
  const completedCount = completedSteps.size;
  const allStepsDone = completedCount === 10;
  const percent = (completedCount / 10) * 100;

  /* ── Scroll to focus section when all steps complete ── */
  useEffect(() => {
    if (allStepsDone && focusSectionRef.current) {
      focusSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [allStepsDone]);

  /* ── Already completed view ─────────────────────────── */
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
            <p className="mt-3 text-lg text-gray-300">Well done. Your family got the best of you today.</p>
          </div>
        </header>

        {/* Saved summary */}
        <div className="mx-auto max-w-2xl px-6 py-12">
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
            </div>
          )}

          <button
            onClick={resetRitual}
            className="mt-8 cursor-pointer rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
          >
            Start a fresh ritual
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ritual view ───────────────────────────────── */
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
        </div>
      </header>

      {/* ── Progress bar ─────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <ProgressBar
          percent={percent}
          label={`${completedCount} of 10 steps complete`}
        />
      </div>

      {/* ── Checklist ────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-6 py-8">
        <div className="space-y-3">
          {RITUAL_STEPS.map((step) => {
            const isDone = completedSteps.has(step.number);
            const isStep5 = step.number === 5;

            return (
              <div
                key={step.number}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isDone
                    ? "border-amber-300 bg-amber-50/80"
                    : "border-gray-200 bg-white hover:border-amber-200 hover:shadow-sm"
                }`}
              >
                <label className="flex cursor-pointer items-start gap-4 p-5">
                  {/* Step number badge */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-amber-500 text-white scale-100"
                        : "bg-[#0f1d36] text-amber-400 group-hover:scale-105"
                    }`}
                  >
                    {isDone ? (
                      <CheckIcon className="h-4 w-4 animate-[check-pop_0.3s_ease-out]" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-base font-semibold transition-all ${
                        isDone ? "text-amber-700 line-through decoration-amber-400/60" : "text-gray-800"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`mt-1 text-sm leading-relaxed transition-all ${
                        isDone ? "text-amber-600/60" : "text-gray-500"
                      }`}
                    >
                      {step.instruction}
                    </p>

                    {/* Step 5: priority inputs */}
                    {isStep5 && (
                      <div
                        className="mt-3 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {["First priority", "Second priority", "Third priority"].map(
                          (placeholder, i) => (
                            <input
                              key={i}
                              type="text"
                              placeholder={placeholder}
                              value={priorities[i]}
                              onChange={(e) => updatePriority(i, e.target.value)}
                              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                                isDone
                                  ? "border-amber-200 bg-white/60 text-gray-500 focus:ring-amber-300"
                                  : "border-gray-300 bg-white text-gray-800 focus:ring-amber-400/40"
                              }`}
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hidden checkbox */}
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleStep(step.number)}
                    className="sr-only"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tomorrow's Focus + Reflection (after all 10) ── */}
      {allStepsDone && (
        <div ref={focusSectionRef} className="mx-auto max-w-2xl px-6 pb-8">
          {/* Tomorrow's Focus */}
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f1d36] text-sm font-bold text-amber-400">
                ★
              </span>
              Tomorrow's Focus
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              What's the single most important thing you'll accomplish tomorrow? This is your North Star.
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
                <p className="mt-1 text-lg font-medium text-gray-800">{tomorrowsFocus}</p>
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
          <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
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
                <p className="mt-1 text-lg italic text-gray-700">"{gratitudeReflection}"</p>
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
              className="relative text-center animate-[scale-in_0.6s_ease-out]"
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
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                Your family is waiting.
              </p>

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

      {/* ── Checkmark pop-in animation ────────────────────── */}
      <style>{`
        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
