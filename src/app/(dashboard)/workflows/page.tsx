"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
    const router = useRouter()

    useEffect(() => {
        load()

        const channel = supabase
            .channel("workflow-list")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "workflows",
                },
                () => {
                    load()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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

    function getStatusColor(status: string) {
        const colors: Record<string, string> = {
            completed: "bg-green-500",
            running: "bg-blue-500",
            pending: "bg-amber-500",
            awaiting_approval: "bg-purple-500",
            rejected: "bg-red-500",
        }
        return colors[status] || "bg-gray-500"
    }

    function getStatusChip(status: string) {
        const chips: Record<string, string> = {
            completed: "bg-green-100 text-green-700",
            running: "bg-blue-100 text-blue-700",
            pending: "bg-amber-100 text-amber-700",
            awaiting_approval: "bg-purple-100 text-purple-700",
            rejected: "bg-red-100 text-red-700",
        }
        return chips[status] || "bg-gray-100 text-gray-700"
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>

                {workflows.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
                        No workflows yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflows.map(w => (
                            <div
                                key={w.id}
                                onClick={() => router.push(`/workflows/${w.id}`)}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex items-center justify-between cursor-pointer gap-4"
                            >
                                {/* LEFT SIDE: Status bar + Title + Time */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Status Color Bar */}
                                    <div className={`w-1.5 h-12 rounded-full ${getStatusColor(w.status)}`} />

                                    {/* Title and Time */}
                                    <div className="min-w-0">
                                        <div className="font-semibold text-gray-900 truncate">
                                            {w.action?.[0]?.name || "Unnamed action"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(w.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE: Status chip + Metrics */}
                                <div className="flex items-center gap-6 text-sm">
                                    {/* Status Chip */}
                                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getStatusChip(w.status)}`}>
                                        {w.status}
                                    </span>

                                    {/* Metrics */}
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <span className="font-medium">{formatDuration(w.duration_ms)}</span>
                                        <span className="font-medium">{formatCost(w.cost_usd)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}