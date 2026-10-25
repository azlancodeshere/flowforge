"use client"

import Link from "next/link";
import { useContext, useState } from "react";
import api from "@/lib/api";
import type { ChangeEvent, SyntheticEvent } from "react";
import { AuthContext, useAuth} from "../context/AuthContext";
import  {useRouter} from "next/navigation"


export default function LoginPage() {

    const [formData, setFormData] = useState({
        email:"", 
        password:""
    })

    const {setIsAuthenticated,setUser}= useAuth()
    const router = useRouter()



    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }


    const handleSubmit = async (e:SyntheticEvent<HTMLFormElement>) =>{
        e.preventDefault();

        try {

            const response = await api.post("/user/login", formData)

            const loggedInUser = response.data.data.user
            setUser(loggedInUser)
            setIsAuthenticated(true)

            //router.push("/")
           router.replace("/")


            
        } catch (error) {
            console.error("Login failed:", error);
            setUser(null)
            setIsAuthenticated(false)
            
        }
    }
   


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B16] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-purple-600/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold shadow-lg shadow-blue-500/20">
            F
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in to continue building smarter workflows.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0D1221]/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold">Login to FlowForge</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your account details below.
            </p>
          </div>

          <form 
          onSubmit={handleSubmit}
          className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#080B16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <span className="cursor-pointer text-xs font-medium text-blue-400 transition hover:text-blue-300">
                  Forgot password?
                </span>
              </div>

              <input
                id="password"
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-[#080B16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-white/20 bg-[#080B16] accent-blue-500"
              />

              <label
                htmlFor="remember"
                className="text-sm text-slate-400"
              >
                Remember me
              </label>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0D1221]"
            >
              Sign In
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            New to FlowForge?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 transition hover:text-slate-300"
          >
            ← Back to home
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          © 2026 FlowForge. Build smarter workflows.
        </p>
      </div>
    </main>
  );
}