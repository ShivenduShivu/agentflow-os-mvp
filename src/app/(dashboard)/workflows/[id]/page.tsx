"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function WorkflowDetailPage() {
  const params = useParams()
  const [workflow, setWorkflow] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", params.id)
        .single()

      setWorkflow(data)
    }

    load()
  }, [params.id])

  if (!workflow) return <div>Loading workflow...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Workflow Detail
      </h1>

      <div className="p-4 bg-white rounded shadow space-y-2">
        <div>ID: {workflow.id}</div>
        <div>Status: {workflow.status}</div>
        <div>Created: {workflow.created_at}</div>
      </div>
    </div>
  )
}