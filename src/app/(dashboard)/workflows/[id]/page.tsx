"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logTrace } from "@/lib/trace"

type Workflow = {
  id: string
  status: string
  created_at: string
}

type Trace = {
  id: string
  message: string
  created_at: string
}

export default function WorkflowDetailPage() {
  const { id } = useParams()
  const startedRef = useRef(false)

  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])

  // Load workflow
  useEffect(() => {
    if (!id) return

    async function loadWorkflow() {
      const { data } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single()

      if (!data) return

      setWorkflow(data)

      // ✅ start agent only once per page lifecycle
      if (data.status === "pending" && !startedRef.current) {
        startedRef.current = true
        startAgent(data.id)
      }
    }

    loadWorkflow()
  }, [id])

  // Load traces (polling)
  useEffect(() => {
    if (!id) return

    async function loadTraces() {
      const { data } = await supabase
        .from("workflow_traces")
        .select("*")
        .eq("workflow_id", id)
        .order("created_at", { ascending: true })

      if (data) setTraces(data)
    }

    loadTraces()
    const interval = setInterval(loadTraces, 1000)
    return () => clearInterval(interval)
  }, [id])

  async function startAgent(workflowId: string) {
    await logTrace(workflowId, "Agent started")

    await supabase
      .from("workflows")
      .update({ status: "running" })
      .eq("id", workflowId)

    await logTrace(workflowId, "Workflow running")

    setTimeout(async () => {
      await logTrace(workflowId, "Action executed")

      await supabase
        .from("workflows")
        .update({ status: "completed" })
        .eq("id", workflowId)

      await logTrace(workflowId, "Workflow completed")

      const { data } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .single()

      if (data) setWorkflow(data)
    }, 2000)
  }

  if (!workflow) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Workflow Detail</h1>

        <div className="bg-white rounded-xl shadow p-6 space-y-2">
          <div><b>ID:</b> {workflow.id}</div>
          <div><b>Status:</b> {workflow.status}</div>
          <div><b>Created:</b> {workflow.created_at}</div>
        </div>
      </div>

      {/* Execution Timeline */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Execution Timeline</h2>

        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          {traces.map((t) => (
            <div key={t.id} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
              <div>
                <div className="text-sm font-medium">{t.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(t.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}