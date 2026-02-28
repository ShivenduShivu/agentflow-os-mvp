"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logTrace } from "@/lib/trace"

type Workflow = {
  id: string
  status: string
  created_at: string
}

export default function WorkflowDetailPage() {
  const { id } = useParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)

  useEffect(() => {
    if (!id) return

    loadWorkflow(id as string)
  }, [id])

  async function loadWorkflow(workflowId: string) {
    const { data } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .single()

    if (!data) return

    setWorkflow(data)

    // 🔒 DB-based agent lock (runs ONLY if pending)
    if (data.status === "pending") {
      startAgent(workflowId)
    }
  }

  async function startAgent(workflowId: string) {
    // mark running FIRST to prevent double start
    const { data: updated } = await supabase
      .from("workflows")
      .update({ status: "running" })
      .eq("id", workflowId)
      .eq("status", "pending") // ← critical lock
      .select()
      .single()

    // if no row updated → already started elsewhere
    if (!updated) return

    await logTrace(workflowId, "Agent started")
    await logTrace(workflowId, "Workflow running")

    setWorkflow(updated)

    setTimeout(async () => {
      await logTrace(workflowId, "Action executed")

      const { data: done } = await supabase
        .from("workflows")
        .update({ status: "completed" })
        .eq("id", workflowId)
        .select()
        .single()

      await logTrace(workflowId, "Workflow completed")

      if (done) setWorkflow(done)
    }, 2000)
  }

  if (!workflow) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Workflow Detail</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-2">
        <div><b>ID:</b> {workflow.id}</div>
        <div><b>Status:</b> {workflow.status}</div>
        <div><b>Created:</b> {workflow.created_at}</div>
      </div>
    </div>
  )
}