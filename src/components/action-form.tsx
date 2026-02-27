"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ActionForm() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState("")

  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)

    const { error } = await supabase.from("actions").insert({
      name,
      description,
      cost_estimate: Number(cost),
    })

    setLoading(false)

    if (!error) {
      router.push("/actions")
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <label className="text-sm">Action Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm">Cost Estimate</label>
        <Input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Create Action"}
      </Button>
    </div>
  )
}