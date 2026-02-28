"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Workflow = {
  id: string
  status: string
  created_at: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])

  useEffect(() => {
    loadWorkflows()
  }, [])

  async function loadWorkflows() {
    const { data } = await supabase
      .from("workflows")
      .select("*")
      .order("created_at", { ascending: false })

    setWorkflows(data || [])
  }

  function statusColor(status: string) {
    if (status === "pending") return "bg-yellow-100 text-yellow-700"
    if (status === "running") return "bg-blue-100 text-blue-700"
    if (status === "completed") return "bg-green-100 text-green-700"
    return "bg-gray-100 text-gray-600"
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Workflows</h1>

      <div className="bg-white rounded-xl shadow divide-y">
        {workflows.length === 0 && (
          <div className="p-6 text-gray-500">No workflows yet</div>
        )}

        {workflows.map((wf) => (
          <Link
            key={wf.id}
            href={`/workflows/${wf.id}`}
            className="block p-6 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-mono text-sm">{wf.id}</div>
                <div className="text-xs text-gray-500">
                  {new Date(wf.created_at).toLocaleString()}
                </div>
              </div>

              <span
                className={`px-2 py-1 rounded text-xs font-medium ${statusColor(
                  wf.status
                )}`}
              >
                {wf.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}