import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "Present Provider";
  } catch {
    return "Present Provider";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

/* ── Curriculum modules ─────────────────────────────────── */
const modules = [
  {
    number: 1,
    title: "The Turn-Off Ritual",
    description:
      "Build a repeatable end-of-day routine that tells your brain work is done — so you can be fully present at home.",
  },
  {
    number: 2,
    title: "Boundary Architecture",
    description:
      "Design the physical, digital, and mental boundaries that keep work from leaking into family time.",
  },
  {
    number: 3,
    title: "Calendar Mastery",
    description:
      "Sync Apple or Google Calendar to block family time first — then fit work into the gaps, not the other way around.",
  },
  {
    number: 4,
    title: "The Sunday Sync",
    description:
      "A weekly 15-minute ritual with your spouse or co-parent to align schedules and protect what matters.",
  },
  {
    number: 5,
    title: "Debt Payoff: Snowball Method",
    description:
      "Knock out smaller debts first for quick wins and momentum — a proven path to getting your family out of debt.",
  },
  {
    number: 6,
    title: "Debt Payoff: Avalanche Method",
    description:
      "Attack high-interest debt first to save money long-term. Includes a custom calculator to model both methods.",
  },
  {
    number: 7,
    title: "The Family Budget That Works",
    description:
      "A lightweight budgeting approach that doesn't feel like punishment — built for busy parents who hate spreadsheets.",
  },
  {
    number: 8,
    title: "Career Pathing with AI",
    description:
      "Use your AI career assistant to map promotions, lateral moves, and skill gaps — then build a 12-month plan.",
  },
  {
    number: 9,
    title: "Resume & LinkedIn Overhaul",
    description:
      "Templates and frameworks to refresh your professional presence so you're always ready for the next opportunity.",
  },
  {
    number: 10,
    title: "Interview Prep for Busy Dads",
    description:
      "A streamlined interview preparation system that fits into 20-minute pockets of time.",
  },
  {
    number: 11,
    title: "Crafting Your Family Vision",
    description:
      "Write a family vision statement that captures your values, traditions, and the legacy you want to build — faith-based or secular.",
  },
  {
    number: 12,
    title: "Rhythms of Presence",
    description:
      "Establish daily, weekly, and seasonal rhythms that keep your family vision alive year-round.",
  },
  {
    number: 13,
    title: "Tech That Serves Your Family",
    description:
      "Audit the apps, devices, and notifications competing for your attention — and redesign your tech stack around presence.",
  },
  {
    number: 14,
    title: "The Dad Playbook",
    description:
      "A living document of go-to activities, conversation starters, and traditions that strengthen your bond with each child.",
  },
];

/* ── Feature cards ──────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.547 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
        />
      </svg>
    ),
    title: "Turn-Off Ritual",
    body: "A repeatable end-of-day routine that signals to your brain: work is done. Be present without the mental clutter.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
    title: "Family Time Scheduling",
    body: "Apple & Google Calendar integration. Block family time first — then fit work into the gaps.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Debt Payoff Calculator",
    body: "Snowball & avalanche methods built in. See your debt-free date and track progress toward financial peace.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
    title: "Career Development + AI",
    body: "AI-powered career assistant, resume templates, and a 12-month growth plan — built for working parents.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    ),
    title: "Family Vision Statement",
    body: "Craft a mission for your family — faith-based or secular. A compass for decisions big and small.",
  },
];

/* ── Main component ─────────────────────────────────────── */
function Home() {
  const businessName = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-[#faf7f2] text-gray-800">
      {/* ── Hero ──────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-20 pt-24 text-center text-white sm:pb-28 sm:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        {/* subtle glow */}
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            For fathers, husbands &amp; single parents
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Turn off work.{" "}
            <span className="text-amber-400">Turn toward family.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            {businessName} is the operating system for parents who work from home
            — a step-by-step system to end the workday, reclaim your time, and be
            the provider your family actually needs: a present one.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="/signup"
              className="inline-block rounded-xl bg-amber-500 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:bg-amber-700"
            >
              Get started free
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required. Start building presence today.
          </p>
        </div>
      </header>

      {/* ── The Problem ────────────────────────────────── */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            The Problem
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Work follows you everywhere.
            <br />
            Your family gets leftovers.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            Working from home was supposed to give you <em>more</em> time with
            your family. Instead, it blurred every boundary. The laptop is always
            open. Notifications follow you to the dinner table. You're physically
            present but mentally still at work — and your kids can tell.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            You didn't sign up to be a distracted dad. You just need a system.
          </p>
        </div>
      </section>

      {/* ── What's Inside ──────────────────────────────── */}
      <section className="bg-[#faf7f2] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              What's Inside
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Five tools. One operating system.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
              Everything you need to turn off work, build a career you're proud
              of, get out of debt, and lead your family with intention.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f1d36] text-amber-400">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum Preview ─────────────────────────── */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              14-Module Curriculum
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              A step-by-step path to presence
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
              Each module builds on the last — from shutting down work to
              building a family legacy. Self-paced, practical, and built for busy
              parents.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {modules.map((m) => (
              <div
                key={m.number}
                className="flex gap-4 rounded-xl border border-gray-200 bg-[#faf7f2]/60 p-5 transition hover:border-amber-200"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0f1d36] text-sm font-bold text-amber-400">
                  {m.number}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ───────────────────────────────── */}
      <section className="bg-[#0f1d36] px-6 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Who It's For
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for the man who provides —{" "}
            <span className="text-amber-400">and wants to be present while
            he does it.</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Fathers",
                body: "You want your kids to remember you were there — not just in the house, but engaged. Present Provider gives you the system to make that happen every day.",
              },
              {
                title: "Husbands",
                body: "Your marriage deserves more than the exhausted version of you. Learn to end the workday with energy left for the person who matters most.",
              },
              {
                title: "Single Parents",
                body: "You're carrying the weight of two roles. Present Provider helps you protect the few hours you have so every minute with your kids counts.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-7 text-left backdrop-blur-sm">
                <h3 className="text-xl font-bold text-amber-400">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-300">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-gray-300">
            Especially for those who work from home. When your office is 30
            steps from your kitchen, the boundaries that protect family time
            don't build themselves. Present Provider teaches you how.
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="bg-[#faf7f2] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Be the dad they deserve.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-gray-600">
            Get early access to the Present Provider operating system. No
            commitment — just a system that works as hard as you do.
          </p>
          <div className="mt-10">
            <a
              href="/signup"
              className="inline-block rounded-xl bg-amber-500 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:bg-amber-700"
            >
              Get started free
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-semibold text-gray-900">{businessName}</p>
        <p className="mt-2 text-sm text-gray-500">
          Built with{" "}
          <a
            href="https://cto.new"
            className="underline hover:text-gray-700"
          >
            cto.new
          </a>
        </p>
      </footer>
    </div>
  );
}
