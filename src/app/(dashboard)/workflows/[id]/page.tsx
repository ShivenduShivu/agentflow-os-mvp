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

type Trace = {
  message: string
  created_at: string
}

export default function WorkflowDetailPage() {
  const { id } = useParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [trace, setTrace] = useState<Trace[]>([])
  const [duration, setDuration] = useState<number | null>(null)
  const [cost, setCost] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    loadWorkflow(id as string)
  }, [id])

  async function loadWorkflow(workflowId: string) {
    const { data } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .maybeSingle()

    if (!data) return

    setWorkflow(data)

    if (data.status === "pending") {
      const { data: updated } = await supabase
        .from("workflows")
        .update({ status: "running" })
        .eq("id", workflowId)
        .eq("status", "pending")
        .select()
        .maybeSingle()

      if (updated) {
        startAgent(workflowId)
      }
    }

    loadTrace(workflowId)
  }

  async function loadTrace(workflowId: string) {
    const { data } = await supabase
      .from("workflow_traces")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("created_at", { ascending: true })

    const traces = data || []
    setTrace(traces)

    // 🧮 Calculate duration + cost
    const start = traces.find(t => t.message === "Agent started")
    const end = traces.find(t => t.message === "Workflow completed")

    if (start && end) {
      const startTime = new Date(start.created_at).getTime()
      const endTime = new Date(end.created_at).getTime()
      const seconds = (endTime - startTime) / 1000

      setDuration(seconds)
      setCost(seconds * 0.01)
    }
  }

  async function startAgent(workflowId: string) {
    await logTrace(workflowId, "Agent started")
    await logTrace(workflowId, "Workflow running")

    setTimeout(async () => {
      await logTrace(workflowId, "Action executed")

      await supabase
        .from("workflows")
        .update({ status: "completed" })
        .eq("id", workflowId)

      await logTrace(workflowId, "Workflow completed")

      loadWorkflow(workflowId)
    }, 2000)
  }

  if (!workflow) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Workflow Detail</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-2 mb-6">
        <div><b>ID:</b> {workflow.id}</div>
        <div><b>Status:</b> {workflow.status}</div>
        <div><b>Created:</b> {workflow.created_at}</div>

        {duration !== null && (
          <div><b>Duration:</b> {duration.toFixed(2)}s</div>
        )}

        {cost !== null && (
          <div><b>Cost:</b> ${cost.toFixed(2)}</div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Execution Timeline</h2>

      <div className="bg-white rounded-xl shadow p-6">
        {trace.length === 0 ? (
          <div className="text-gray-500">No events yet</div>
        ) : (
          <ul className="space-y-3">
            {trace.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                <div>
                  <div className="font-medium">{t.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(t.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}