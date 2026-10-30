
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const displayName = user?.username || user?.name || "User";
  const capitalizedName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xl font-bold text-white shadow-md shadow-indigo-200">
            F
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            FlowForge
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <a href="/#features" className="transition hover:text-indigo-600">
            Features
          </a>
          <a href="/#how-it-works" className="transition hover:text-indigo-600">
            How it Works
          </a>
          <a href="/#templates" className="transition hover:text-indigo-600">
            Templates
          </a>
          <a href="/#faq" className="transition hover:text-indigo-600">
            FAQ
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!isLoading &&
            (isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 sm:px-4"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4"
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
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:px-5"
                >
                  Get Started
                </Link>
              </>
            ) : null)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
