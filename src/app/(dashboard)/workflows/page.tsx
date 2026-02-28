"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Workflow = {
  id: string
  created_at: string
  status: string
  duration_ms: number | null
  cost_usd: number | null
  action: {
    name: string
  }[]
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])

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
      duration_ms,
      cost_usd,
      action_id,
      actions!workflows_action_id_fkey(name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Workflow list error:", error)
    return
  }

  const normalized: Workflow[] =
    (data || []).map((w: any) => ({
      id: w.id,
      created_at: w.created_at,
      status: w.status,
      duration_ms: w.duration_ms,
      cost_usd: w.cost_usd,
      action: w.actions ? [w.actions] : [],
    }))

  setWorkflows(normalized)
}

  function formatDuration(ms: number | null) {
    if (!ms) return "-"
    return (ms / 1000).toFixed(2) + "s"
  }

  function formatCost(cost: number | null) {
    if (!cost) return "-"
    return "$" + cost.toFixed(4)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Workflows</h1>

      <div className="bg-white rounded-xl shadow divide-y">
        {workflows.length === 0 && (
          <div className="p-6 text-gray-500">No workflows yet</div>
        )}

        {workflows.map(w => (
          <Link
            key={w.id}
            href={`/workflows/${w.id}`}
            className="block p-6 hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">

              {/* LEFT */}
              <div>
                <div className="font-medium">
                  {w.action?.[0]?.name || "Unnamed action"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(w.created_at).toLocaleString()}
                </div>
              </div>

              {/* RIGHT METRICS */}
              <div className="flex gap-8 text-sm">
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-medium">{w.status}</div>
                </div>

                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-medium">
                    {formatDuration(w.duration_ms)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Cost</div>
                  <div className="font-medium">
                    {formatCost(w.cost_usd)}
                  </div>
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}