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
  const [role, setRole] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)

  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selected, setSelected] = useState<Workflow | null>(null)

  useEffect(() => {
    loadRole()
  }, [])

  useEffect(() => {
    if (role === "admin") {
      load()
    }
  }, [role])

  // 🔐 load user role from DB
  async function loadRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setRole("user")
      setLoadingRole(false)
      return
    }

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    setRole(data?.role ?? "user")
    setLoadingRole(false)
  }

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

  // 🔐 approve restricted to admin
  async function approve(id: string) {
    if (role !== "admin") return

    await supabase
      .from("workflows")
      .update({ status: "pending" })
      .eq("id", id)

    setWorkflows(prev => prev.filter(w => w.id !== id))
    setSelected(null)
  }

  // 🔐 reject restricted to admin
  async function reject(id: string) {
    if (role !== "admin") return

    await supabase
      .from("workflows")
      .update({ status: "rejected" })
      .eq("id", id)

    setWorkflows(prev => prev.filter(w => w.id !== id))
    setSelected(null)
  }

  // ⏳ role loading state
  if (loadingRole) {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="max-w-6xl mx-auto">Loading...</div></div>
  }

  // 🚫 non-admin blocked
  if (role !== "admin") {
    return <div className="p-6 bg-gray-50 min-h-screen"><div className="max-w-6xl mx-auto text-red-600">Forbidden</div></div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Approval Queue</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {workflows.length === 0 && (
            <div className="p-6 text-gray-500">No approvals pending</div>
          )}

          {workflows.map(w => (
            <div
              key={w.id}
              className="p-6 hover:bg-gray-50 cursor-pointer text-gray-700"
              onClick={() => setSelected(w)}
            >
              <div className="font-medium text-gray-900">
                {w.action?.[0]?.name || "Unnamed action"}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(w.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Approval Details</h2>

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
    </div>
  )
}