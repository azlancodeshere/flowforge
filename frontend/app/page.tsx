"use client";

import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import CurrentYear from "./components/CurrentYear";

const features = [
  {
    icon: "⌘",
    title: "Visual Workflow Builder",
    description:
      "Build complex workflows with an intuitive drag-and-drop interface.",
  },
  {
    icon: "◇",
    title: "Pre-built Templates",
    description:
      "Get started quickly with ready-made workflow templates.",
  },
  {
    icon: "↗",
    title: "App Integrations",
    description:
      "Connect your favorite tools and automate repetitive tasks.",
  },
  {
    icon: "▥",
    title: "Execution History",
    description:
      "Track workflow runs, inspect results, and troubleshoot errors.",
  },
];

const benefits = [
  {
    icon: "ϟ",
    title: "Drag & Drop Builder",
    description: "Create workflows visually",
  },
  {
    icon: "↗",
    title: "App Integrations",
    description: "Connect your favorite tools",
  },
  {
    icon: "◷",
    title: "Save Time",
    description: "Automate repetitive tasks",
  },
  {
    icon: "♢",
    title: "Secure & Reliable",
    description: "Keep your workflows organized",
  },
];

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500 text-xs text-emerald-600">
      ✓
    </span>
  );
}





function WorkflowPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="absolute -inset-8 rounded-[45px] bg-gradient-to-br from-violet-200/70 via-blue-100/60 to-indigo-200/70 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-indigo-900/10 sm:p-3">
        <div className="flex min-h-[390px] overflow-hidden rounded-xl border border-slate-100 sm:min-h-[430px]">
          <aside className="hidden w-[145px] shrink-0 border-r border-slate-100 bg-white p-3 sm:block">
            <div className="mb-8 flex items-center gap-2 font-bold tracking-tight text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                F
              </span>
              <span className="text-sm">FlowForge</span>
            </div>

            {["Dashboard", "Workflows", "Templates", "Executions", "Integrations", "Settings"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`mb-2 rounded-lg px-2 py-2 text-[11px] ${
                    index === 1
                      ? "bg-indigo-50 font-semibold text-indigo-700"
                      : "text-slate-500"
                  }`}
                >
                  <span className="mr-2">
                    {["⌂", "▦", "◇", "◷", "⌘", "⚙"][index]}
                  </span>
                  {item}
                </div>
              ),
            )}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-4 sm:px-4">
              <div>
                <p className="text-xs font-semibold text-slate-900 sm:text-sm">
                  Student Marks Workflow
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Last edited just now
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600">
                  Save
                </button>
                <button className="rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white shadow-md shadow-indigo-200">
                  ▶ Run
                </button>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-50/80 p-3 sm:p-5">
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "17px 17px",
                }}
              />

              <div className="relative flex w-full max-w-[430px] flex-col items-center">
                <div className="z-10 flex w-44 items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-lg shadow-slate-200/60 sm:w-48">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-xl text-emerald-700">
                    ▶
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Manual Trigger
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Starts the workflow
                    </p>
                  </div>
                </div>

                <div className="relative h-12 w-px bg-slate-300">
                  <span className="absolute -bottom-1 -left-[3px] h-2 w-2 rounded-full bg-indigo-500" />
                </div>

                <div className="z-10 flex w-44 items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 shadow-lg shadow-slate-200/60 sm:w-48">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-xl text-indigo-700">
                    ◈
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Condition
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Marks ≥ 40?
                    </p>
                  </div>
                </div>

                <div className="relative h-12 w-full max-w-[320px]">
                  <div className="absolute left-1/2 top-0 h-5 w-px bg-slate-300" />
                  <div className="absolute left-[18%] right-[18%] top-5 h-px bg-slate-300" />
                  <div className="absolute left-[18%] top-5 h-7 w-px bg-emerald-400" />
                  <div className="absolute right-[18%] top-5 h-7 w-px bg-rose-400" />
                  <span className="absolute left-[18%] top-2 -translate-x-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                    Yes
                  </span>
                  <span className="absolute right-[18%] top-2 translate-x-1/2 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-semibold text-rose-700">
                    No
                  </span>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white p-2 shadow-md sm:gap-3 sm:p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg text-blue-600">
                      ♧
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                        Send Email
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        Success email
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2 rounded-xl border border-rose-100 bg-white p-2 shadow-md sm:gap-3 sm:p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-lg text-rose-600">
                      ▣
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-800 sm:text-xs">
                        Send Message
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        Failure message
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-2 top-3 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:right-4">
                {["+", "−", "⛶"].map((item) => (
                  <span
                    key={item}
                    className="flex h-8 w-8 items-center justify-center border-b border-slate-100 text-sm text-slate-500 last:border-0"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {

  const {isAuthenticated,isLoading} = useAuth()


  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">



        <Navbar/>



      </header>

      <section className="relative isolate">
        <div className="pointer-events-none absolute -right-32 -top-16 -z-10 h-[540px] w-[650px] rounded-full bg-gradient-to-br from-violet-200/70 via-blue-100/70 to-indigo-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-40 -z-10 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-10 lg:pb-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/90 px-4 py-2 text-xs font-semibold text-indigo-700 sm:text-sm">
              <span className="text-base">✧</span>
              Build. Automate. Scale.
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-[64px]">
              Build Powerful{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Workflows
              </span>{" "}
              Without Code
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              FlowForge helps you automate tasks, connect your favorite apps,
              and build custom workflows with a simple visual interface. Save
              time and focus on what matters.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Get Started Free
                <span className="text-lg">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-7 py-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-500 text-[9px] text-indigo-600">
                  ▶
                </span>
                See How It Works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-slate-600 sm:text-sm">
              {["No credit card required", "Easy to use", "Start for free"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckIcon />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <WorkflowPreview />
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-7 px-5 py-9 sm:px-8 md:grid-cols-4 lg:px-10">
          {benefits.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-50 text-2xl font-semibold text-indigo-600">
                {item.icon}
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 sm:text-sm">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-slate-50/70 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Everything you need
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Everything You Need to Automate
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              From simple automations to complex workflows, FlowForge helps you
              build smarter processes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-50 text-2xl font-semibold text-indigo-600 transition group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Simple by design
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              From idea to automation in three steps
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Create a workflow visually, define your rules, and run it when
              you need it. No complicated setup required.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                number: "01",
                title: "Choose a trigger",
                description: "Start with a manual trigger or a workflow event.",
              },
              {
                number: "02",
                title: "Set your conditions",
                description: "Define the rules that decide what happens next.",
              },
              {
                number: "03",
                title: "Run your workflow",
                description: "Execute your flow and review its results.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-extrabold text-indigo-600">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Make work flow
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to build your first workflow?
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
              Start creating smarter workflows and spend less time on
              repetitive tasks.
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/dashboard" : "login"}
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            Get Started Free <span>→</span>
          </Link>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-100 bg-white px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                  F
                </span>
                FlowForge
              </Link>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Build, connect, and automate your workflows with one visual
                workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              <a href="#features" className="hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-600">How it works</a>
              <Link href="/login" className="hover:text-indigo-600">Sign in</Link>
              <Link href="/register" className="hover:text-indigo-600">Sign up</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © <CurrentYear /> FlowForge. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}
