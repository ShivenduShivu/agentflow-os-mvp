"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ActionCard({
    id,
    name,
    description,
    cost,
}: {
    id: string
    name: string
    description: string
    cost: number
}) {
    const router = useRouter()

    async function handleExecute() {
        const { data } = await supabase.auth.getSession()

        const userId = data.session?.user.id

        if (!userId) {
            alert("Not logged in")
            return
        }

        const res = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",   // ⭐ CRITICAL FIX
            body: JSON.stringify({
                actionId: id,
            }),
        })

        const workflow = await res.json()

        if (workflow.id) {
            router.push(`/workflows/${workflow.id}`)
        } else {
            alert(workflow.error || "Execution failed")
        }
    }

    return (
        <Card className="hover:shadow-md transition">
            <CardContent className="p-4 space-y-3">
                <div className="font-semibold text-lg">
                    {name}
                </div>

                <div className="text-sm text-slate-600">
                    {description || "No description"}
                </div>

                <div className="text-xs text-slate-500">
                    Estimated cost: ${cost}
                </div>

                <Button onClick={handleExecute}>
                    Execute
                </Button>
            </CardContent>
        </Card>
    )
}