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
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto">Loading actions...</div>
            </div>
        )
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

                {actions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                        No actions yet
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    )
}