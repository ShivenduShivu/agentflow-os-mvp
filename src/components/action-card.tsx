"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

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
    const [loading, setLoading] = useState(false)

    // Risk detection
    const criticalKeywords = ["delete", "terminate", "shutdown", "remove"]
    const fullText = `${name} ${description}`.toLowerCase()
    const isCritical = criticalKeywords.some(k => fullText.includes(k))

    async function handleExecute() {
        setLoading(true)
        const { data } = await supabase.auth.getSession()

        const userId = data.session?.user.id

        if (!userId) {
            alert("Not logged in")
            setLoading(false)
            return
        }

        const res = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                actionId: id,
            }),
        })

        const workflow = await res.json()

        if (workflow.id) {
            router.push(`/workflows/${workflow.id}`)
        } else {
            alert(workflow.error || "Execution failed")
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
            {/* Header with icon and risk badge */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        ⚙️
                    </span>
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                    isCritical 
                        ? "bg-red-100 text-red-700" 
                        : "bg-green-100 text-green-700"
                }`}>
                    {isCritical ? "Critical" : "Safe"}
                </span>
            </div>

            {/* Description */}
            <div className="text-sm text-gray-600 mb-4 flex-grow">
                {description || "No description"}
            </div>

            {/* Footer with cost and button */}
            <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    ${cost.toFixed(2)}
                </span>

                <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? "Executing..." : "Execute"}
                </button>
            </div>
        </div>
    )
}