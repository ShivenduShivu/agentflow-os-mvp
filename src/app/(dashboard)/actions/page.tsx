"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import ActionCard from "@/components/action-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"


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
        return <div className="p-6 bg-gray-50 min-h-screen"><div className="max-w-6xl mx-auto">Loading actions...</div></div>
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Actions</h1>

                    <Link href="/actions/new">
                        <Button>Create Action</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
                    {actions.length === 0 ? (
                        <div className="text-gray-500">No actions defined yet</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {actions.map((a) => (
                                <ActionCard
                                    key={a.id}
                                    id={a.id}
                                    name={a.name}
                                    description={a.description}
                                    cost={a.cost_estimate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}