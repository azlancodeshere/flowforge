import { title } from "process";
import { Suspense } from "react";
import Navbar from "./components/Navbar";
import Link from "next/link"
import { connection } from "next/server";


const action = [
  {
    title:"Visual Builder",
    description:"Build workflows by connecting nodes visually.",
  },
  {
    title: "Smart Conditions",
     description: "Route workflows based on your own rules.",
  },
  {
    title:"Automated Actions",
    description: "Define what happens at each workflow step.",
  }, 
  {
      title: "Execution History",
    description: "Inspect workflow runs and their results.",
  }
]

async function CurrentYear(){
  await connection()
  return <>{new Date().getFullYear()} </>
}




export default function HomePage() {

  return (
    <main className="min-h-screen bg-[#080B16] text-white">
      <Navbar />

      <section className="relative flex min-h-[75vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        <div className="absolute left-1/2 top-1/3 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative z-10">
          <p className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Visual Workflow Automation
          </p>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Turn complex tasks into
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              simple workflows.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            Design workflows visually, connect triggers and actions,
            and automate repetitive tasks with FlowForge.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
             href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
            >
              Start Building Free →
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-xl border border-white/15 px-6 py-3 font-medium transition hover:bg-white/5"
            >
              Explore How It Works
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
          Why FlowForge
        </p>

        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          Everything you need to automate
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
         
         {action.map((item)=>(

          <article
          key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/40"
          >

             <h3 className="text-lg font-semibold">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {item.description}
      </p>

          </article>

         ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-white/10 px-6 py-20 text-center"
      >
        <h2 className="text-3xl font-bold">
          From idea to automation
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Choose a trigger, connect a condition, add an action,
          and run your workflow.
        </p>

        <Link
          href="/register"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
        >
          Create Your First Workflow
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-slate-500">
        © <Suspense fallback={null}><CurrentYear /></Suspense>{" "}FlowForge. Build smarter workflows.
      </footer>
    </main>
  );
}