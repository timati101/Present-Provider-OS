import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";

/* ── Types ───────────────────────────────────────────────── */

type Category = "Wins" | "Questions" | "Accountability" | "Tips";
type Filter = "All" | Category;

interface Post {
  id: string;
  author: string;
  category: Category;
  content: string;
  createdAt: number; // unix ms
  liked: boolean;
}

interface ComposerState {
  name: string;
  category: Category | "";
  content: string;
  errors: { name?: string; category?: string; content?: string };
  submitted: boolean;
}

/* ── Seed posts ──────────────────────────────────────────── */

function createSeedPosts(): Post[] {
  const now = Date.now();
  const hour = 3600_000;
  const day = 86_400_000;

  return [
    {
      id: "seed-1",
      author: "Marcus D.",
      category: "Wins",
      content:
        'Just completed my first full week of the shutdown ritual. My wife noticed the difference. \u2018You\u2019re actually here,\u2019 she said. That hit hard.',
      createdAt: now - hour * 3,
      liked: false,
    },
    {
      id: "seed-2",
      author: "James K.",
      category: "Questions",
      content:
        "Question for the group: how do you handle it when work emergencies bleed past shutdown time? I had a server outage yesterday and it wrecked our family dinner.",
      createdAt: now - hour * 8,
      liked: false,
    },
    {
      id: "seed-3",
      author: "David R.",
      category: "Accountability",
      content:
        "Day 14 of the 30-day Family Dinner Challenge. My 7-year-old asked if we could \u2018keep doing this after the challenge.\u2019 That\u2019s why we do this, dads.",
      createdAt: now - day,
      liked: false,
    },
    {
      id: "seed-4",
      author: "Chris M.",
      category: "Tips",
      content:
        "Tip: I put my work laptop in a drawer at 5:30pm sharp. Out of sight, out of mind. Small thing, big impact.",
      createdAt: now - day - hour * 2,
      liked: false,
    },
    {
      id: "seed-5",
      author: "Anthony P.",
      category: "Wins",
      content:
        "Just mapped out my career path using the AI assistant. It suggested a lateral move I hadn\u2019t considered that would give me 5 more hours a week at home. Game changer.",
      createdAt: now - day * 2,
      liked: false,
    },
    {
      id: "seed-6",
      author: "Tom H.",
      category: "Questions",
      content:
        "Struggling with the Sunday Sync. My spouse thinks it\u2019s \u2018too corporate\u2019 for a marriage. Any reframes that worked for you?",
      createdAt: now - day * 2 - hour * 6,
      liked: false,
    },
    {
      id: "seed-7",
      author: "Robert L.",
      category: "Accountability",
      content:
        "Finished the debt avalanche module. $3,200 left on the car and we\u2019re debt-free. My kids won\u2019t remember the things we didn\u2019t buy \u2014 they\u2019ll remember I was there.",
      createdAt: now - day * 3,
      liked: false,
    },
    {
      id: "seed-8",
      author: "Michael S.",
      category: "Tips",
      content:
        "Tip for single dads: meal prep Sundays with the kids. They learn to cook, you get quality time, AND weekday dinners are handled. Triple win.",
      createdAt: now - day * 4,
      liked: false,
    },
  ];
}

/* ── localStorage helpers ────────────────────────────────── */

const POSTS_KEY = "pp-brotherhood-posts";
const LIKES_KEY = "pp-brotherhood-likes";

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Post[];
  } catch {
    return [];
  }
}

function savePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function loadLikes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function saveLikes(likes: Record<string, boolean>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

/* ── Relative time formatter ──────────────────────────────── */

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
}

/* ── Category badge config ───────────────────────────────── */

const categoryStyles: Record<Category, { bg: string; text: string; dot: string }> = {
  Wins: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  Questions: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  Accountability: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  Tips: { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
};

const FILTERS: Filter[] = ["All", "Wins", "Questions", "Accountability", "Tips"];
const CATEGORIES: Category[] = ["Wins", "Questions", "Accountability", "Tips"];

/* ── Icons ───────────────────────────────────────────────── */

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-colors ${filled ? "fill-red-400 text-red-400" : "fill-none text-gray-400"}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Empty composer defaults ─────────────────────────────── */

function emptyComposer(): ComposerState {
  return {
    name: "",
    category: "",
    content: "",
    errors: {},
    submitted: false,
  };
}

/* ── Page component ──────────────────────────────────────── */

export const Route = createFileRoute("/brotherhood")({
  component: BrotherhoodPage,
});

function BrotherhoodPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>("All");
  const [composer, setComposer] = useState<ComposerState>(emptyComposer);
  const [hydrated, setHydrated] = useState(false);

  /* ── Hydrate from localStorage on mount ───────────────── */
  useEffect(() => {
    const savedPosts = loadPosts();
    const savedLikes = loadLikes();

    if (savedPosts.length === 0) {
      // First visit — seed
      const seeds = createSeedPosts();
      setPosts(seeds);
    } else {
      // Merge saved likes into posts
      setPosts(
        savedPosts.map((p) => ({
          ...p,
          liked: savedLikes[p.id] ?? p.liked,
        })),
      );
    }
    setLikes(savedLikes);
    setHydrated(true);
  }, []);

  /* ── Persist posts when they change ───────────────────── */
  useEffect(() => {
    if (hydrated && posts.length > 0) {
      savePosts(posts);
    }
  }, [posts, hydrated]);

  /* ── Persist likes when they change ───────────────────── */
  useEffect(() => {
    if (hydrated) {
      saveLikes(likes);
    }
  }, [likes, hydrated]);

  /* ── Filtered & sorted posts ──────────────────────────── */
  const filteredPosts = posts
    .filter((p) => filter === "All" || p.category === filter)
    .sort((a, b) => b.createdAt - a.createdAt);

  /* ── Composer: validate ───────────────────────────────── */
  const validateComposer = useCallback((): boolean => {
    const errors: ComposerState["errors"] = {};
    if (!composer.name.trim()) errors.name = "Name is required";
    if (!composer.category) errors.category = "Please choose a category";
    if (!composer.content.trim()) errors.content = "Share something first";

    setComposer((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [composer.name, composer.category, composer.content]);

  /* ── Composer: submit ─────────────────────────────────── */
  const handlePost = useCallback(() => {
    if (!validateComposer()) return;

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      author: composer.name.trim(),
      category: composer.category as Category,
      content: composer.content.trim(),
      createdAt: Date.now(),
      liked: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposer({ ...emptyComposer(), submitted: true });

    // Clear success message after 3 seconds
    setTimeout(() => {
      setComposer((prev) => ({ ...prev, submitted: false }));
    }, 3000);
  }, [composer, validateComposer]);

  /* ── Toggle like ──────────────────────────────────────── */
  const toggleLike = useCallback(
    (postId: string) => {
      setLikes((prev) => {
        const next = { ...prev, [postId]: !prev[postId] };
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, liked: !p.liked } : p)),
      );
    },
    [],
  );

  /* ── Composer field updaters ──────────────────────────── */
  const updateField = useCallback(
    (field: "name" | "category" | "content", value: string) => {
      setComposer((prev) => ({
        ...prev,
        [field]: value,
        errors: { ...prev.errors, [field]: undefined },
      }));
    },
    [],
  );

  /* ── Loading state ────────────────────────────────────── */
  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-[#faf7f2] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#faf7f2]">
      {/* ═══════════ Header ═══════════ */}
      <header className="relative overflow-hidden bg-[#0f1d36] px-6 pb-16 pt-20 text-center text-white sm:pb-20 sm:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d36] via-[#0f1d36] to-[#0f1d36]/95" />
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-2xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-5 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
            Community
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            The Brotherhood
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            A community of fathers choosing presence. Share wins, ask questions,
            keep each other accountable.
          </p>
        </div>
      </header>

      {/* ═══════════ Category Filter ═══════════ */}
      <div className="sticky top-0 z-20 border-b border-gray-200/80 bg-[#faf7f2]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`cursor-pointer flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════ Main Content ═══════════ */}
      <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* ── Post Composer ─────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <SendIcon />
            Share something with the Brotherhood...
          </h2>

          {/* Success message */}
          {composer.submitted && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                Your post has been shared!
              </p>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={composer.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-base text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
                  composer.errors.name
                    ? "border-red-300 focus:ring-red-400/30"
                    : "border-gray-300 focus:border-amber-400 focus:ring-amber-400/30"
                }`}
              />
              {composer.errors.name && (
                <p className="mt-1 text-sm text-red-500">{composer.errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = composer.category === cat;
                  const style = categoryStyles[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateField("category", cat)}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                        isSelected
                          ? `${style.bg} ${style.text} border-transparent ring-2 ring-offset-1 ${style.text.replace("text-", "ring-").replace("800", "400")}`
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {composer.errors.category && (
                <p className="mt-1 text-sm text-red-500">{composer.errors.category}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <textarea
                placeholder="What's on your mind?"
                value={composer.content}
                onChange={(e) => updateField("content", e.target.value)}
                rows={3}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-base text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
                  composer.errors.content
                    ? "border-red-300 focus:ring-red-400/30"
                    : "border-gray-300 focus:border-amber-400 focus:ring-amber-400/30"
                }`}
              />
              {composer.errors.content && (
                <p className="mt-1 text-sm text-red-500">{composer.errors.content}</p>
              )}
            </div>

            {/* Post button */}
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={!composer.name.trim() || !composer.category || !composer.content.trim()}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendIcon />
                Post
              </button>
            </div>
          </div>
        </div>

        {/* ── Feed ─────────────────────────────────────── */}
        <div className="mt-8 space-y-4">
          {filteredPosts.length === 0 ? (
            /* Empty state */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-medium text-gray-500">
                No posts yet. Be the first to share!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const style = categoryStyles[post.category];
              const liked = likes[post.id] ?? post.liked;
              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0f1d36] text-sm font-bold text-amber-400">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {post.author}
                        </p>
                        <p className="text-sm text-gray-400">
                          {relativeTime(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Category badge */}
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="mt-4 text-base leading-relaxed text-gray-700 whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Like button */}
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition hover:text-red-500 hover:bg-red-50"
                    >
                      <HeartIcon filled={liked} />
                      <span>{liked ? "Liked" : "Like"}</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
