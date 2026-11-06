
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#templates", label: "Templates" },
  { href: "/#faq", label: "FAQ" },
];

const Navbar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.username || user?.name || "User";
  const capitalizedName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4 lg:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xl font-bold text-white shadow-md shadow-indigo-200">
            F
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            FlowForge
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#features" className="transition hover:text-indigo-600">
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="transition hover:text-indigo-600"
          >
            How it Works
          </Link>
          <Link href="/#templates" className="transition hover:text-indigo-600">
            Templates
          </Link>
          <Link href="/#faq" className="transition hover:text-indigo-600">
            FAQ
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {!isLoading &&
            (isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 sm:inline-flex sm:px-4"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 sm:pl-4"
                  aria-label="Open dashboard"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white shadow-md shadow-indigo-200">
                    {capitalizedName.charAt(0)}
                  </span>

                  <span className="hidden text-left sm:block">
                    <span className="block text-xs text-slate-500">
                      Welcome back
                    </span>
                    <span className="block max-w-32 truncate text-sm font-semibold text-slate-900">
                      {capitalizedName}
                    </span>
                  </span>
                </Link>
              </>
            ) : !isLoading ? (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="hidden rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex sm:px-4"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:px-5"
                >
                  Get Started
                </Link>
              </>
            ) : null)}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-lg md:hidden">
          <div className="flex flex-col text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-2.5 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {!isLoading &&
              (isAuthenticated && user ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-indigo-50"
                >
                  Dashboard
                </Link>
              ) : !isLoading ? (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Create free account
                  </Link>
                </>
              ) : null)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
