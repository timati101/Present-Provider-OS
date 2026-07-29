import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/family-vision")({
  component: FamilyVisionPage,
});

/* ── Types ──────────────────────────────────────────── */

type Framework = "faith" | "secular" | null;

interface VisionData {
  framework: Framework;
  values: string[];
  priorities: string[];
  customPriority: string;
  traditions: string;
  finalStatement: string;
}

const LS_KEY = "pp-family-vision";

const DEFAULT_DATA: VisionData = {
  framework: null,
  values: ["", "", ""],
  priorities: [],
  customPriority: "",
  traditions: "",
  finalStatement: "",
};

const PRIORITY_OPTIONS = [
  "Quality time together",
  "Faith / Spiritual growth",
  "Education / Learning",
  "Health / Wellness",
  "Serving others",
  "Financial wisdom",
  "Adventure / Travel",
  "Creativity / Arts",
];

/* ── Statement generators ────────────────────────────── */

function generateStatement(data: VisionData): string {
  const { framework, values, priorities, customPriority, traditions } = data;
  const cleanValues = values.filter((v) => v.trim());
  const v1 = cleanValues[0] || "love";
  const v2 = cleanValues[1] || "growth";
  const v3 = cleanValues[2] || "connection";
  const valuesStr =
    cleanValues.length > 0 ? cleanValues.join(", ").toLowerCase() : "love, growth, and connection";

  const allPriorities = [
    ...priorities,
    ...(customPriority.trim() ? [customPriority.trim()] : []),
  ];
  const prioritiesStr =
    allPriorities.length > 0
      ? allPriorities.join(", ").toLowerCase()
      : "time together and growth";

  const traditionsStr = traditions.trim() || "shared meals, stories, and everyday moments";

  if (framework === "faith") {
    return `Our family honors God by living with ${valuesStr}. We prioritize ${prioritiesStr} and build our lives around ${traditionsStr}. Our home is a place of ${v1.toLowerCase()}, ${v2.toLowerCase()}, and ${v3.toLowerCase()}.`;
  }

  return `Our family strives to live with ${valuesStr}. We prioritize ${prioritiesStr} and build our lives around ${traditionsStr}. Our home is a place of ${v1.toLowerCase()}, ${v2.toLowerCase()}, and ${v3.toLowerCase()}.`;
}

function loadSavedData(): VisionData | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_DATA, ...parsed };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveData(data: VisionData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/* ── Progress dots ──────────────────────────────────── */

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
            i === current
              ? "scale-125 bg-amber-500 shadow-md shadow-amber-200"
              : i < current
                ? "bg-amber-300"
                : "bg-gray-300"
          }`}
        />
      ))}
      <span className="ml-3 text-xs font-medium uppercase tracking-wider text-gray-400">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}

/* ── Page Content ───────────────────────────────────── */

type StepContentProps = {
  step: number;
  setStep: (s: number) => void;
  data: VisionData;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
  setData: React.Dispatch<React.SetStateAction<VisionData>>;
};

function StepContent({ step, setStep, data, updateField, setData }: StepContentProps) {
  switch (step) {
    case 0:
      return <Step0Framework setStep={setStep} updateField={updateField} />;
    case 1:
      return <Step1Values setStep={setStep} data={data} updateField={updateField} />;
    case 2:
      return <Step2Priorities setStep={setStep} data={data} updateField={updateField} />;
    case 3:
      return <Step3Traditions setStep={setStep} data={data} updateField={updateField} />;
    case 4:
      return (
        <Step4Preview
          setStep={setStep}
          data={data}
          updateField={updateField}
          onGenerate={() => {
            const statement = generateStatement(data);
            updateField("finalStatement", statement);
          }}
        />
      );
    case 5:
      return <Step5Display data={data} setStep={setStep} setData={setData} />;
    default:
      return null;
  }
}

/* ── Step 0: Welcome + Framework ────────────────────── */

function Step0Framework({
  setStep,
  updateField,
}: {
  setStep: (s: number) => void;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
}) {
  const [selected, setSelected] = useState<Framework>(null);

  const cards: { key: Framework; emoji: string; title: string; subtitle: string }[] = [
    {
      key: "faith",
      emoji: "🙏",
      title: "Faith-Based",
      subtitle: "Our family honors God by…",
    },
    {
      key: "secular",
      emoji: "🏠",
      title: "Secular",
      subtitle: "Our family strives to…",
    },
  ];

  function handleBegin() {
    if (!selected) return;
    updateField("framework", selected);
    setStep(1);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#0f1d36] sm:text-3xl">
          Craft Your Family Vision Statement
        </h2>
        <p className="mt-3 text-base leading-relaxed text-gray-500 sm:text-lg">
          A north star for your family — one sentence that captures who you are
          and where you&rsquo;re going.
        </p>
      </div>

      {/* Framework cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const isSelected = selected === card.key;
          return (
            <button
              type="button"
              key={card.key}
              onClick={() => setSelected(card.key)}
              className={`cursor-pointer rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
                isSelected
                  ? "border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-200"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm"
              }`}
            >
              <span className="text-4xl">{card.emoji}</span>
              <h3 className="mt-3 text-lg font-bold text-[#0f1d36]">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{card.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Begin button */}
      <div className="text-center">
        <button
          type="button"
          disabled={!selected}
          onClick={handleBegin}
          className={`cursor-pointer rounded-xl px-8 py-3 text-base font-semibold transition-all ${
            selected
              ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Begin
        </button>
      </div>
    </div>
  );
}

/* ── Step 1: Core Values ────────────────────────────── */

function Step1Values({
  setStep,
  data,
  updateField,
}: {
  setStep: (s: number) => void;
  data: VisionData;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
}) {
  const PLACEHOLDERS = ["e.g., Kindness", "e.g., Adventure", "e.g., Honesty"];

  function handleChange(index: number, value: string) {
    const next = [...data.values];
    next[index] = value;
    updateField("values", next);
  }

  const canProceed = data.values.filter((v) => v.trim()).length >= 1;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#0f1d36] sm:text-2xl">
          What are the 3 values that matter most to your family?
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          These are the principles that guide how you live, parent, and love.
        </p>
      </div>

      <div className="space-y-4">
        {data.values.map((val, i) => (
          <div key={i}>
            <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-amber-600">
              Value {i + 1}
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={PLACEHOLDERS[i]}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition hover:text-amber-700"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={() => setStep(2)}
          className={`cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
            canProceed
              ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Family Priorities ──────────────────────── */

function Step2Priorities({
  setStep,
  data,
  updateField,
}: {
  setStep: (s: number) => void;
  data: VisionData;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
}) {
  function togglePriority(option: string) {
    const next = data.priorities.includes(option)
      ? data.priorities.filter((p) => p !== option)
      : [...data.priorities, option];
    updateField("priorities", next);
  }

  const canProceed = data.priorities.length > 0 || data.customPriority.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#0f1d36] sm:text-2xl">
          What does your family prioritize?
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Select the areas that matter most in your household.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PRIORITY_OPTIONS.map((option) => {
          const checked = data.priorities.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                checked
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-amber-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePriority(option)}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-amber-500 accent-amber-500 focus:ring-amber-400"
              />
              <span className="text-sm font-medium text-gray-700">{option}</span>
            </label>
          );
        })}
      </div>

      {/* Custom */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wider text-amber-600">
          Other
        </label>
        <input
          type="text"
          value={data.customPriority}
          onChange={(e) => updateField("customPriority", e.target.value)}
          placeholder="e.g., Music, Gardening, Entrepreneurship…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition hover:text-amber-700"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={() => setStep(3)}
          className={`cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
            canProceed
              ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Traditions & Rhythms ───────────────────── */

function Step3Traditions({
  setStep,
  data,
  updateField,
}: {
  setStep: (s: number) => void;
  data: VisionData;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#0f1d36] sm:text-2xl">
          What traditions, rhythms, or rituals define your family?
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          The things you do regularly that make your family culture unique.
        </p>
      </div>

      <textarea
        value={data.traditions}
        onChange={(e) => updateField("traditions", e.target.value)}
        placeholder="e.g., Sunday dinners, camping trips, bedtime stories, morning prayer…"
        rows={5}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
        autoFocus
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition hover:text-amber-700"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="cursor-pointer rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.98]"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Generated Preview ──────────────────────── */

function Step4Preview({
  setStep,
  data,
  updateField,
  onGenerate,
}: {
  setStep: (s: number) => void;
  data: VisionData;
  updateField: <K extends keyof VisionData>(key: K, value: VisionData[K]) => void;
  onGenerate: () => void;
}) {
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!generated) {
      onGenerate();
      setGenerated(true);
    }
  }, [generated, onGenerate]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#0f1d36] sm:text-2xl">
          Here&rsquo;s your draft — make it yours
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          We&rsquo;ve combined your answers into a draft. Edit it until it feels
          right.
        </p>
      </div>

      <textarea
        value={data.finalStatement}
        onChange={(e) => updateField("finalStatement", e.target.value)}
        rows={6}
        className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base leading-relaxed text-gray-800 shadow-sm transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
        autoFocus
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setGenerated(false);
            setStep(3);
          }}
          className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition hover:text-amber-700"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!data.finalStatement.trim()}
          onClick={() => setStep(5)}
          className={`cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
            data.finalStatement.trim()
              ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Finish
        </button>
      </div>
    </div>
  );
}

/* ── Step 5: Final Display ──────────────────────────── */

function Step5Display({
  data,
  setStep,
  setData,
}: {
  data: VisionData;
  setStep: (s: number) => void;
  setData: React.Dispatch<React.SetStateAction<VisionData>>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.finalStatement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = data.finalStatement;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data.finalStatement]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([data.finalStatement], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-vision-statement.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data.finalStatement]);

  const handlePrint = useCallback(() => {
    const w = window.open("", "_blank");
    if (!w) {
      window.print();
      return;
    }
    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Family Vision Statement — Present Provider</title></head>
        <body style="font-family: Georgia, serif; max-width: 600px; margin: 80px auto; padding: 20px; background: #faf7f2; color: #1a1a1a;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #d97706; margin-bottom: 24px;">Our Family Vision Statement</p>
          <p style="font-size: 28px; line-height: 1.6; font-style: italic;">${data.finalStatement}</p>
          <p style="margin-top: 48px; font-size: 13px; color: #999;">Made with Present Provider</p>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  }, [data.finalStatement]);

  const handleStartOver = useCallback(() => {
    if (window.confirm("Start over? This will erase your current vision statement.")) {
      setData({ ...DEFAULT_DATA });
      setStep(0);
    }
  }, [setData, setStep]);

  return (
    <div className="space-y-8">
      {/* Statement card */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 shadow-lg sm:p-10">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
          Our Family Vision Statement
        </p>
        <p className="text-2xl leading-relaxed text-[#0f1d36] italic sm:text-3xl">
          &ldquo;{data.finalStatement}&rdquo;
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 active:scale-[0.98]"
        >
          {copied ? "✓ Copied!" : "Copy to clipboard"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 active:scale-[0.98]"
        >
          Download as text
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 active:scale-[0.98]"
        >
          Print
        </button>
      </div>

      {/* Motivational message */}
      <div className="text-center">
        <p className="text-base font-medium text-gray-600">
          This is your family&rsquo;s north star.
        </p>
        <p className="text-sm text-gray-400">Print it. Frame it. Live it.</p>
      </div>

      {/* Edit / Start over */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="cursor-pointer text-sm font-medium text-amber-600 underline underline-offset-2 transition hover:text-amber-800"
        >
          Edit your vision
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          className="cursor-pointer text-sm text-gray-400 underline underline-offset-2 transition hover:text-gray-600"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */

function FamilyVisionPage() {
  const [data, setData] = useState<VisionData>(DEFAULT_DATA);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Load on mount
  useEffect(() => {
    const saved = loadSavedData();
    if (saved && saved.finalStatement) {
      setData(saved);
      setStep(5);
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    saveData(data);
  }, [data, hydrated]);

  const updateField = useCallback(
    <K extends keyof VisionData>(key: K, value: VisionData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  if (!hydrated) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Navy header section */}
      <section className="bg-[#0f1d36] px-6 py-12 text-center sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
          Family Vision
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Your Family&rsquo;s North Star
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base">
          A clear vision brings clarity to every decision. Create a statement
          that guides your family for years to come.
        </p>
      </section>

      {/* Card section */}
      <section className="-mt-6 px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <ProgressDots current={step} total={6} />
          <StepContent
            step={step}
            setStep={setStep}
            data={data}
            updateField={updateField}
            setData={setData}
          />
        </div>
      </section>
    </main>
  );
}
