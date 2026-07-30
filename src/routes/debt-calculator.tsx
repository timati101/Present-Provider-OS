import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";

export const Route = createFileRoute("/debt-calculator")({
  component: DebtCalculatorPage,
});

/* ── Types ──────────────────────────────────────────── */

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface PayoffMonth {
  month: number;
  year: number;
  debts: { id: string; name: string; balance: number; paidOff: boolean }[];
  totalInterestPaid: number;
  totalPaid: number;
}

type PayoffMethod = "snowball" | "avalanche";

const LS_DEBTS = "pp-debts";
const LS_METHOD = "pp-debt-method";
const LS_EXTRA = "pp-debt-extra";

/* ── Default starter debts ──────────────────────────── */

const DEFAULT_DEBTS: Debt[] = [
  {
    id: "1",
    name: "Credit Card",
    balance: 4500,
    interestRate: 22.99,
    minimumPayment: 135,
  },
  {
    id: "2",
    name: "Car Loan",
    balance: 12000,
    interestRate: 6.5,
    minimumPayment: 350,
  },
  {
    id: "3",
    name: "Student Loan",
    balance: 28000,
    interestRate: 4.75,
    minimumPayment: 290,
  },
];

/* ── Color palette for debt segments ────────────────── */

const DEBT_COLORS = [
  "bg-amber-500",
  "bg-[#0f1d36]",
  "bg-emerald-500",
  "bg-red-400",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-pink-400",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

/* ── Helpers ────────────────────────────────────────── */

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyCents(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/* ── Payoff calculation engine ──────────────────────── */

interface CalcResult {
  totalMonths: number;
  totalInterest: number;
  totalPrincipal: number;
  payoffDate: Date;
  months: {
    debtName: string;
    balance: number;
    monthsToPayoff: number;
    interestPaid: number;
  }[];
  milestones: { month: number; label: string }[];
}

function calculatePayoff(
  debts: Debt[],
  method: PayoffMethod,
  extraPayment: number,
): CalcResult | null {
  if (debts.length === 0) return null;

  // Deep clone debts for simulation
  const simDebts = debts.map((d) => ({
    ...d,
    balance: d.balance,
    id: d.id,
    name: d.name,
  }));

  // Sort debts by payoff order
  const sorted = [...simDebts].sort((a, b) => {
    if (method === "snowball") {
      return a.balance - b.balance;
    } else {
      return b.interestRate - a.interestRate;
    }
  });

  const totalDebt = sorted.reduce((sum, d) => sum + d.balance, 0);
  let totalInterestPaid = 0;
  let month = 0;
  const maxMonths = 600; // 50-year safety limit

  // Track individual debt payoff months
  const debtPayoffMonths: Map<string, number> = new Map();
  const debtInterestPaid: Map<string, number> = new Map();
  const debtStartBalances: Map<string, number> = new Map();

  for (const d of sorted) {
    debtStartBalances.set(d.id, d.balance);
    debtInterestPaid.set(d.id, 0);
  }

  const milestones: { month: number; label: string }[] = [];
  const halfPoint = totalDebt / 2;
  let principalPaid = 0;

  const activeDebts = sorted.filter((d) => d.balance > 0);

  while (activeDebts.length > 0 && month < maxMonths) {
    month++;

    // 1. Accrue interest on all active debts
    for (const d of activeDebts) {
      const monthlyRate = d.interestRate / 100 / 12;
      const interest = Math.round(d.balance * monthlyRate * 100) / 100;
      d.balance += interest;
      totalInterestPaid += interest;
      debtInterestPaid.set(
        d.id,
        (debtInterestPaid.get(d.id) ?? 0) + interest,
      );
    }

    // 2. Pay minimums on all debts
    for (const d of activeDebts) {
      const minPay = Math.min(d.minimumPayment, d.balance);
      d.balance = Math.round((d.balance - minPay) * 100) / 100;
    }

    // 3. Apply extra payment to the first active debt
    if (extraPayment > 0) {
      const target = activeDebts[0];
      const extraPay = Math.min(extraPayment, target.balance);
      target.balance = Math.round((target.balance - extraPay) * 100) / 100;
    }

    // 4. Check for paid-off debts
    for (let i = activeDebts.length - 1; i >= 0; i--) {
      if (activeDebts[i].balance <= 0) {
        activeDebts[i].balance = 0;
        if (!debtPayoffMonths.has(activeDebts[i].id)) {
          debtPayoffMonths.set(activeDebts[i].id, month);
        }
        activeDebts.splice(i, 1);
      }
    }

    // Track milestones
    const paidSoFar = sorted.reduce(
      (sum, d) =>
        sum +
        ((debtStartBalances.get(d.id) ?? 0) -
          Math.max(0, d.balance)),
      0,
    );
    if (milestones.length === 0 && paidSoFar >= halfPoint) {
      milestones.push({ month, label: "50% paid off!" });
    }
    if (
      activeDebts.length === 1 &&
      !milestones.find((m) => m.label.startsWith("Last"))
    ) {
      milestones.push({ month, label: "Last debt!" });
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  const monthResults = sorted.map((d) => ({
    debtName: d.name,
    balance: debtStartBalances.get(d.id) ?? 0,
    monthsToPayoff: debtPayoffMonths.get(d.id) ?? 0,
    interestPaid: Math.round((debtInterestPaid.get(d.id) ?? 0) * 100) / 100,
  }));

  return {
    totalMonths: month,
    totalInterest: Math.round(totalInterestPaid * 100) / 100,
    totalPrincipal: totalDebt,
    payoffDate,
    months: monthResults,
    milestones,
  };
}

/* ── Debt Form component ────────────────────────────── */

function DebtForm({
  onSubmit,
  initial,
  onCancel,
}: {
  onSubmit: (debt: Omit<Debt, "id">) => void;
  initial?: Debt;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [balance, setBalance] = useState(initial ? String(initial.balance) : "");
  const [interestRate, setInterestRate] = useState(
    initial ? String(initial.interestRate) : "",
  );
  const [minimumPayment, setMinimumPayment] = useState(
    initial ? String(initial.minimumPayment) : "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(balance);
    const r = parseFloat(interestRate);
    const m = parseFloat(minimumPayment);
    if (!name.trim() || isNaN(b) || b <= 0 || isNaN(r) || r < 0 || isNaN(m) || m <= 0) return;
    onSubmit({
      name: name.trim(),
      balance: Math.round(b * 100) / 100,
      interestRate: Math.round(r * 100) / 100,
      minimumPayment: Math.round(m * 100) / 100,
    });
    if (!initial) {
      setName("");
      setBalance("");
      setInterestRate("");
      setMinimumPayment("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-800">
        {initial ? "Edit Debt" : "Add Debt"}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-600">Debt name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Credit Card"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-600">Balance ($)</span>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0"
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-600">
            Interest rate (%)
          </span>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-600">
            Minimum payment ($)
          </span>
          <input
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="0"
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            required
          />
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          {initial ? "Save Changes" : "Add Debt"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Main page component ────────────────────────────── */

function DebtCalculatorPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [method, setMethod] = useState<PayoffMethod>("snowball");
  const [extraPayment, setExtraPayment] = useState(200);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [loaded, setLoaded] = useState(false);

  /* ── Load from localStorage ──────────────────────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_DEBTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDebts(parsed);
        } else {
          setDebts(DEFAULT_DEBTS);
        }
      } else {
        setDebts(DEFAULT_DEBTS);
      }
    } catch {
      setDebts(DEFAULT_DEBTS);
    }

    try {
      const savedMethod = localStorage.getItem(LS_METHOD);
      if (savedMethod === "snowball" || savedMethod === "avalanche") {
        setMethod(savedMethod);
      }
    } catch {}

    try {
      const savedExtra = localStorage.getItem(LS_EXTRA);
      if (savedExtra) {
        const val = parseFloat(savedExtra);
        if (!isNaN(val) && val >= 0) setExtraPayment(val);
      }
    } catch {}

    setLoaded(true);
  }, []);

  /* ── Save to localStorage ────────────────────────── */
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_DEBTS, JSON.stringify(debts));
  }, [debts, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_METHOD, method);
  }, [method, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_EXTRA, String(extraPayment));
  }, [extraPayment, loaded]);

  /* ── Debt CRUD ───────────────────────────────────── */
  const addDebt = useCallback(
    (d: Omit<Debt, "id">) => {
      const newDebt: Debt = { ...d, id: generateId() };
      setDebts((prev) => [...prev, newDebt]);
      setShowForm(false);
    },
    [],
  );

  const updateDebt = useCallback((updated: Debt) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
    setEditingDebt(null);
    setShowForm(false);
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const startEdit = useCallback((debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  }, []);

  const cancelForm = useCallback(() => {
    setShowForm(false);
    setEditingDebt(null);
  }, []);

  /* ── Calculate ───────────────────────────────────── */
  const result = useMemo(
    () => calculatePayoff(debts, method, extraPayment),
    [debts, method, extraPayment],
  );

  /* ── Total debt ──────────────────────────────────── */
  const totalDebt = useMemo(
    () => debts.reduce((sum, d) => sum + d.balance, 0),
    [debts],
  );

  const totalMinPayments = useMemo(
    () => debts.reduce((sum, d) => sum + d.minimumPayment, 0),
    [debts],
  );

  /* ── Determine payoff order for display ──────────── */
  const payoffOrder = useMemo(() => {
    return [...debts].sort((a, b) => {
      if (method === "snowball") return a.balance - b.balance;
      return b.interestRate - a.interestRate;
    });
  }, [debts, method]);

  /* ── Build result map for quick lookup ───────────── */
  const resultMap = useMemo(() => {
    if (!result) return new Map<string, (typeof result.months)[0]>();
    const map = new Map<string, (typeof result.months)[0]>();
    for (const r of result.months) {
      const debt = debts.find((d) => d.name === r.debtName);
      if (debt) map.set(debt.id, r);
    }
    return map;
  }, [result, debts]);

  // Savings comparison
  const savingsComparison = useMemo(() => {
    if (!result || debts.length <= 1) return null;
    const otherMethod = method === "snowball" ? "avalanche" : "snowball";
    const otherResult = calculatePayoff(debts, otherMethod, extraPayment);
    if (!otherResult) return null;
    const diff = otherResult.totalInterest - result.totalInterest;
    if (diff <= 0) return null; // Current method is not better
    return { diff, otherMethod };
  }, [debts, method, extraPayment, result]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* ── Hero header ───────────────────────────────── */}
      <section className="bg-[#0f1d36] px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Debt Payoff Calculator
          </h1>
          <p className="mt-3 text-lg text-amber-400/80">
            See your path to freedom
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* ── Debt list ─────────────────────────────────── */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Your Debts</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                + Add Debt
              </button>
            )}
          </div>

          {/* Debt form */}
          {showForm && (
            <div className="mb-6">
              <DebtForm
                onSubmit={editingDebt ? updateDebt : addDebt}
                initial={editingDebt ?? undefined}
                onCancel={cancelForm}
              />
            </div>
          )}

          {/* Debt cards */}
          {debts.length === 0 && !showForm && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-500">
                No debts added yet. Click "Add Debt" to get started.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-800">{debt.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(debt)}
                      className="cursor-pointer rounded-md p-1 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                      aria-label={`Edit ${debt.name}`}
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
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="cursor-pointer rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${debt.name}`}
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
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrencyCents(debt.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest</span>
                    <span className="text-gray-700">{debt.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min payment</span>
                    <span className="text-gray-700">
                      {formatCurrency(debt.minimumPayment)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Extra payment ──────────────────────────────── */}
        {debts.length > 0 && (
          <section className="mb-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="block">
                <span className="text-sm font-medium text-gray-600">
                  Extra monthly payment toward debt
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-800">$</span>
                  <input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setExtraPayment(isNaN(val) || val < 0 ? 0 : val);
                    }}
                    min="0"
                    step="10"
                    className="block w-full max-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-lg font-semibold text-gray-800 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  This is applied on top of all minimum payments to your target
                  debt.
                </p>
              </label>
            </div>
          </section>
        )}

        {/* ── Method toggle ──────────────────────────────── */}
        {debts.length > 1 && (
          <section className="mb-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setMethod("snowball")}
                  className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    method === "snowball"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  🏆 Snowball
                </button>
                <button
                  onClick={() => setMethod("avalanche")}
                  className={`cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    method === "avalanche"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  📊 Avalanche
                </button>
              </div>
            </div>
            <p className="mt-2 px-1 text-xs text-gray-500">
              {method === "snowball"
                ? "Pay smallest balance first — quick wins build momentum and confidence."
                : "Pay highest interest rate first — mathematically optimal, saves the most money."}
            </p>
          </section>
        )}

        {/* ── Payoff plan ────────────────────────────────── */}
        {result && (
          <section className="space-y-6">
            {/* Celebration */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
              <p className="text-2xl">🎉</p>
              <p className="mt-2 text-lg font-bold text-gray-800">
                Debt-free date:{" "}
                <span className="text-amber-600">
                  {formatDate(result.payoffDate)}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                That's {result.totalMonths} months from now — you can do this!
              </p>
            </div>

            {/* Savings comparison */}
            {savingsComparison && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
                <p className="text-sm font-medium text-emerald-800">
                  💰 You'll save{" "}
                  <strong>
                    {formatCurrencyCents(savingsComparison.diff)}
                  </strong>{" "}
                  in interest with the{" "}
                  <strong>
                    {method === "snowball" ? "Snowball" : "Avalanche"}
                  </strong>{" "}
                  method vs.{" "}
                  {savingsComparison.otherMethod.charAt(0).toUpperCase() +
                    savingsComparison.otherMethod.slice(1)}
                  .
                </p>
              </div>
            )}

            {/* Summary bar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Total Debt
                </p>
                <p className="mt-1 text-2xl font-extrabold text-gray-800">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Monthly Payment
                </p>
                <p className="mt-1 text-2xl font-extrabold text-gray-800">
                  {formatCurrency(totalMinPayments + extraPayment)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatCurrency(totalMinPayments)} min +{" "}
                  {formatCurrency(extraPayment)} extra
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Payoff Date
                </p>
                <p className="mt-1 text-2xl font-extrabold text-gray-800">
                  {formatDate(result.payoffDate)}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Total Interest
                </p>
                <p className="mt-1 text-2xl font-extrabold text-red-500">
                  {formatCurrency(result.totalInterest)}
                </p>
              </div>
            </div>

            {/* Progress visualization */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-800">
                Payoff Progress
              </h3>

              {/* Stacked bar */}
              <div className="mb-3 h-8 w-full overflow-hidden rounded-full bg-gray-100">
                {payoffOrder.map((debt, i) => {
                  const pct = totalDebt > 0 ? (debt.balance / totalDebt) * 100 : 0;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={debt.id}
                      className={`inline-block h-full transition-all duration-700 ${DEBT_COLORS[i % DEBT_COLORS.length]}`}
                      style={{ width: `${pct}%` }}
                      title={`${debt.name}: ${formatCurrency(debt.balance)}`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                {payoffOrder.map((debt, i) => {
                  const rm = resultMap.get(debt.id);
                  return (
                    <div key={debt.id} className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-sm ${DEBT_COLORS[i % DEBT_COLORS.length]}`}
                      />
                      <span className="text-xs font-medium text-gray-600">
                        {debt.name}{" "}
                        {rm && (
                          <span className="text-gray-400">
                            ({rm.monthsToPayoff} mo)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Payoff order timeline */}
              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="font-semibold text-gray-600">
                    Payoff order:
                  </span>
                  {payoffOrder.map((debt, i) => (
                    <span key={debt.id} className="flex items-center gap-1">
                      {i > 0 && (
                        <svg
                          className="h-3 w-3 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      )}
                      <span className="rounded-full bg-[#0f1d36] px-2.5 py-1 text-xs font-medium text-white">
                        {i + 1}. {debt.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Milestones */}
            {result.milestones.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-gray-800">
                  Milestones
                </h3>
                <div className="space-y-2">
                  {result.milestones.map((m, i) => {
                    const milestoneDate = new Date();
                    milestoneDate.setMonth(milestoneDate.getMonth() + m.month);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                      >
                        <span className="text-xl">
                          {m.label === "50% paid off!" ? "🔥" : "🏁"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {m.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            Month {m.month} —{" "}
                            {formatDate(milestoneDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payoff table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        #
                      </th>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Debt
                      </th>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Balance
                      </th>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        APR
                      </th>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Payoff in
                      </th>
                      <th className="px-6 py-3 font-semibold text-gray-600">
                        Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.months.map((rm, i) => (
                      <tr
                        key={rm.debtName}
                        className="transition hover:bg-amber-50/50"
                      >
                        <td className="px-6 py-3.5 font-medium text-gray-400">
                          {i + 1}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-gray-800">
                          {rm.debtName}
                        </td>
                        <td className="px-6 py-3.5 text-gray-700 tabular-nums">
                          {formatCurrencyCents(rm.balance)}
                        </td>
                        <td className="px-6 py-3.5 text-gray-600">
                          {debts.find((d) => d.name === rm.debtName)
                            ?.interestRate ?? "—"}
                          %
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            {rm.monthsToPayoff} months
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-700 tabular-nums">
                          {formatCurrencyCents(rm.interestPaid)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
