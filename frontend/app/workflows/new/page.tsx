"use client"

import Link from "next/link";
import api from "@/lib/api";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";




export default function NewWorkflowPage() {

    const [workflowname, setWorkflowname] = useState("")
    const [description, setDescription] = useState("")

    const router = useRouter();



    const handleSubmit = async (e:SyntheticEvent<HTMLFormElement>)=>{

      e.preventDefault();

      try {
        const response = await api.post("/workflows/create-workflow", {
          workflowname,
          description,
          nodes:[],
          edges:[]
        });

        console.log("Workflow created:", response.data)

        const workflowId = response.data.data._id;

        router.replace(`/workflows/${workflowId}/editor`)


      } catch (error) {

        console.log("Workflow creation failed:", error)

      }









    }








  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span>←</span> Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            WORKFLOW BUILDER
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Create Workflow
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Give your workflow a name and description to get started with
            automating your tasks.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
              ◇
            </div>

            <div>
              <h2 className="text-lg font-bold">Workflow Details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the basic information for your workflow.
              </p>
            </div>
          </div>

          <form
          onSubmit={ handleSubmit}
          className="space-y-6">
            <div>
              <label
                htmlFor="workflowname"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Workflow Name <span className="text-rose-500">*</span>
              </label>

              <input
                id="workflowname"
                name="workflowname"
                value={workflowname}
                onChange={(e)=> setWorkflowname(e.target.value)}
                type="text"
                placeholder="e.g. Student Marks Automation"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Choose a clear, descriptive name.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Describe what this workflow will do..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Briefly explain the purpose of this workflow.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Continue to Builder <span>→</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
          <span className="text-lg text-indigo-600">ⓘ</span>
          <p className="text-sm leading-6 text-slate-600">
            After creating your workflow, you can add triggers, conditions,
            and actions to define how your automation works.
          </p>
        </div>
      </div>
    </main>
  );
}
