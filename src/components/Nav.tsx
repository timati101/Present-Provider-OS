import { useState } from "react";
import { useAuth } from "~/components/AuthContext";

const navLinks = [
  { href: "/curriculum", label: "Curriculum" },
  { href: "/challenges", label: "Challenges" },
  { href: "/brotherhood", label: "Brotherhood" },
  { href: "/resources", label: "Resources" },
  { href: "/shutdown", label: "Shutdown" },
  { href: "/debt-calculator", label: "Debt Calc" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-[#0f1d36]"
        >
          Present Provider
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-amber-50 hover:text-amber-700"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth section — desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {user.name || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-amber-50 hover:text-amber-700"
              >
                Login
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="cursor-pointer rounded-lg p-2 text-gray-600 transition hover:bg-amber-50 sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white pb-4 pt-2 sm:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-2.5 text-base font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-700"
            >
              {link.label}
            </a>
          ))}

          {/* Auth section — mobile */}
          <div className="mt-2 border-t border-gray-100 pt-3 px-6">
            {loading ? (
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-amber-700"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
