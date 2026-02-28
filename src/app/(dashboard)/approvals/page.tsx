"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Workflow = {
  id: string
  status: string
  created_at: string
}

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("workflows")
      .select("*")
      .eq("status", "awaiting_approval")
      .order("created_at", { ascending: false })

    setWorkflows(data || [])
  }

  async function approve(id: string) {
    await supabase
      .from("workflows")
      .update({ status: "pending" })
      .eq("id", id)

    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Approval Queue</h1>

      <div className="bg-white rounded-xl shadow divide-y">
        {workflows.length === 0 && (
          <div className="p-6 text-gray-500">No approvals pending</div>
        )}

        {workflows.map(w => (
          <div key={w.id} className="p-6 flex justify-between items-center">
            <div>
              <div className="font-mono text-sm">{w.id}</div>
              <div className="text-xs text-gray-500">
                {new Date(w.created_at).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => approve(w.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}