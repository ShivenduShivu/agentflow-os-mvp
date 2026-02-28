"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Workflow = {
  id: string
  created_at: string
  status: string
  action: {
    name: string
  }[]
}

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selected, setSelected] = useState<Workflow | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from("workflows")
      .select(`
        id,
        created_at,
        status,
        actions!workflows_action_id_fkey (
          name
        )
      `)
      .eq("status", "awaiting_approval")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Approval load error:", error)
      return
    }

    const normalized: Workflow[] =
      (data || []).map((w: any) => ({
        id: w.id,
        created_at: w.created_at,
        status: w.status,
        action: w.actions ? [{ name: w.actions.name }] : []
      }))

    setWorkflows(normalized)
  }

  async function approve(id: string) {
    await supabase
      .from("workflows")
      .update({ status: "pending" })
      .eq("id", id)

    setWorkflows(prev => prev.filter(w => w.id !== id))
    setSelected(null)
  }

  async function reject(id: string) {
    await supabase
      .from("workflows")
      .update({ status: "rejected" })
      .eq("id", id)

    setWorkflows(prev => prev.filter(w => w.id !== id))
    setSelected(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Approval Queue</h1>

      <div className="bg-white rounded-xl shadow divide-y">
        {workflows.length === 0 && (
          <div className="p-6 text-gray-500">No approvals pending</div>
        )}

        {workflows.map(w => (
          <div
            key={w.id}
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelected(w)}
          >
            <div className="font-medium">
              {w.action?.[0]?.name || "Unnamed action"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(w.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Approval Details</h2>

          <div className="space-y-2 mb-6">
            <div><b>Action:</b> {selected.action?.[0]?.name || "Unnamed action"}</div>
            <div><b>Workflow ID:</b> {selected.id}</div>
            <div><b>Created:</b> {new Date(selected.created_at).toLocaleString()}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => approve(selected.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => reject(selected.id)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}