"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const username = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : user?.name
      ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
      : "";

  return (
    <nav className="flex items-center justify-between border-b border-white/10 bg-[#080B16] px-6 py-5 text-white sm:px-16">
      <Link href="/" className="text-2xl font-bold">
        FlowForge
      </Link>

      <div className="flex items-center gap-6">
        {!isLoading && isAuthenticated && user ? (
          <span className="text-lg font-medium">
            {username}
          </span>
        ) : !isLoading ? (
          <>
            <Link href="/login" className="text-lg">
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 text-lg transition hover:bg-blue-500"
            >
              Get Started
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}