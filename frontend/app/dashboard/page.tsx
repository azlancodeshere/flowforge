"use client"

import Link from "next/link";
import Navbar from "../components/Navbar";

const stats = [
  {
    title: "Total Workflows",
    value: "0",
    description: "Workflows created so far",
    icon: "◇",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Active Workflows",
    value: "0",
    description: "Ready to run",
    icon: "↗",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Executions",
    value: "0",
    description: "Workflow runs completed",
    icon: "◷",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Failed Executions",
    value: "0",
    description: "Runs that need attention",
    icon: "⚠",
    color: "bg-rose-50 text-rose-600",
  },
];

const quickActions = [
  {
    title: "Manual Trigger",
    description: "Start a workflow whenever you need it.",
    icon: "▶",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Condition",
    description: "Make decisions using your own rules.",
    icon: "◇",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Action",
    description: "Define what happens at each step.",
    icon: "↗",
    color: "bg-blue-100 text-blue-700",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
       <Navbar/>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              YOUR WORKSPACE
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Manage your workflows and automate your everyday tasks.
            </p>
          </div>

          <Link
            href="/workflows/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            <span className="text-lg">+</span>
            Create Workflow
          </Link>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {stat.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Your Workflows</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create and manage your automations.
                </p>
              </div>
              <Link
                href="/workflows/new"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + New workflow
              </Link>
            </div>

            <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
                ◇
              </div>
              <h3 className="mt-5 text-lg font-bold">
                Your workspace is ready
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You haven&apos;t created any workflows yet. Start with your
                first automation and build from there.
              </p>
              <Link
                href="/workflows/new"
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create your first workflow
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Quick Start</h2>
              <p className="mt-1 text-sm text-slate-500">
                Learn the building blocks of a workflow.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {quickActions.map((action, index) => (
                <div key={action.title} className="flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${action.color}`}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {index + 1}. {action.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                Ready to build?
              </p>
              <h3 className="mt-2 text-lg font-bold">
                Turn repetitive tasks into workflows.
              </h3>
              <Link
                href="/workflows/new"
                className="mt-4 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Start Building →
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © 2026 FlowForge. Build smarter workflows.
        </footer>
      </div>
    </main>
  );
}
