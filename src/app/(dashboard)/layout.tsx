"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 space-y-4">
        <h2 className="text-xl font-bold">AgentFlow</h2>

        <nav className="space-y-2 text-sm">
          <div className="p-2 rounded bg-slate-100">
            Dashboard
          </div>
          <div className="p-2 rounded hover:bg-slate-100 cursor-pointer">
            Actions
          </div>
          <div className="p-2 rounded hover:bg-slate-100 cursor-pointer">
            Workflows
          </div>
          <div className="p-2 rounded hover:bg-slate-100 cursor-pointer">
            Approvals
          </div>
          <div className="p-2 rounded hover:bg-slate-100 cursor-pointer">
            Audit Logs
          </div>
        </nav>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}