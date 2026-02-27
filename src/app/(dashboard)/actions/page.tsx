"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ActionCard from "@/components/action-card"

type Action = {
  id: string
  name: string
  description: string
  cost_estimate: number
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActions() {
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setActions(data)
      }

      setLoading(false)
    }

    loadActions()
  }, [])

  if (loading) {
    return <div>Loading actions...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Actions
      </h1>

      {actions.length === 0 ? (
        <div className="text-slate-500">
          No actions defined yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((a) => (
            <ActionCard
              key={a.id}
              name={a.name}
              description={a.description}
              cost={a.cost_estimate}
            />
          ))}
        </div>
      )}
    </div>
  )
}