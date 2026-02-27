"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [status, setStatus] = useState("Checking connection...")

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setStatus("User logged in ✅")
      } else {
        setStatus("No active session")
      }
    }

    checkSession()
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-[420px] shadow-xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-2xl font-bold">AgentFlow OS</h1>
          <p className="text-slate-600">
            Multi-Agent Enterprise Middleware
          </p>

          <div className="text-sm font-medium">
            Supabase Status:
          </div>

          <div className="p-3 rounded bg-slate-100">
            {status}
          </div>

          <Button className="w-full">
            System Initialized
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}