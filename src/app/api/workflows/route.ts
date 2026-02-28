import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { executeWorkflow } from "@/lib/execution/engine"
import { addAudit } from "@/lib/audit"

export async function POST(req: Request) {
  const body = await req.json()

  const action_id = body.action_id ?? body.actionId
  const input = body.input ?? {}

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // get logged user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // fetch action for critical detection
  const { data: action } = await supabase
    .from("actions")
    .select("name, description")
    .eq("id", action_id)
    .single()

  const criticalKeywords = ["delete", "terminate", "shutdown", "remove"]

  const text = `${action?.name ?? ""} ${action?.description ?? ""}`.toLowerCase()
  const isCritical = criticalKeywords.some((k) => text.includes(k))

  const status = isCritical ? "awaiting_approval" : "pending"

  // create workflow
  const { data: workflow, error } = await supabase
    .from("workflows")
    .insert({
      action_id,
      user_id: user.id,
      status,
      input,
    })
    .select()
    .single()

  if (error || !workflow) {
    return NextResponse.json({ error: error?.message || "Failed to create workflow" }, { status: 500 })
  }

  // ✅ AUDIT: workflow created
  await addAudit(user.id, workflow.id, "workflow_created")

  // 🔥 START EXECUTION if not critical
  if (status === "pending") {
    executeWorkflow(workflow.id) // async
  }

  // return workflow directly (client expects id top-level)
  return NextResponse.json(workflow)
}