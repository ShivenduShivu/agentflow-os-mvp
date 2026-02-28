import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Simple risk detection based on action name keywords
 */
function requiresApproval(actionName: string) {
  const riskyWords = [
    "delete",
    "remove",
    "refund",
    "terminate",
    "shutdown",
    "disable",
  ]

  const lower = actionName.toLowerCase()
  return riskyWords.some(word => lower.includes(word))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { actionId, userId } = body

    if (!actionId || !userId) {
      return NextResponse.json(
        { error: "Missing actionId or userId" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 🔎 Fetch action to inspect name
    const { data: action, error: actionError } = await supabase
      .from("actions")
      .select("id, name")
      .eq("id", actionId)
      .single()

    if (actionError || !action) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 400 }
      )
    }

    // 🧠 Policy decision
    const approvalNeeded = requiresApproval(action.name)

    // Create workflow with selective approval
    const { data, error } = await supabase
      .from("workflows")
      .insert({
        action_id: actionId,
        user_id: userId,
        status: approvalNeeded ? "awaiting_approval" : "pending",
        input: {},
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Insert failed" },
        { status: 400 }
      )
    }

    return NextResponse.json(data)

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}