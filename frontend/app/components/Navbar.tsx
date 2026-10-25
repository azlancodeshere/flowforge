import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-800 px-8 py-5 text-white">
      <Link href="/" className="text-2xl font-bold">
        FlowForge
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="rounded-lg px-5 py-2 hover:bg-slate-800"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}