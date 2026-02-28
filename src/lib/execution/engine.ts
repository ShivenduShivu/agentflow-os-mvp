import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { addAudit } from "@/lib/audit"

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

export async function executeWorkflow(workflowId: string) {
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

  const start = Date.now()

  // include user_id for audit
  const { data: workflow } = await supabase
    .from("workflows")
    .select("id, user_id, action:actions(estimated_cost)")
    .eq("id", workflowId)
    .single()

  if (!workflow) return

  await supabase.from("workflows").update({ status: "running" }).eq("id", workflowId)

  await addTrace(supabase, workflowId, "Execution started")

  await sleep(rand(400, 900))
  await addTrace(supabase, workflowId, "Validating input")

  await sleep(rand(400, 900))
  await addTrace(supabase, workflowId, "Calling agent")

  await sleep(rand(400, 900))
  await addTrace(supabase, workflowId, "Processing result")

  await sleep(rand(400, 900))
  await addTrace(supabase, workflowId, "Finalizing")

  const duration = Date.now() - start

  const baseCost = workflow.action?.[0]?.estimated_cost || 0
  const cost = baseCost * (0.8 + Math.random() * 0.4)

  await supabase
    .from("workflows")
    .update({
      status: "completed",
      duration_ms: duration,
      cost_usd: cost,
    })
    .eq("id", workflowId)

  await addTrace(supabase, workflowId, "Execution completed")

  // ✅ AUDIT: execution completed
  if (workflow.user_id) {
    await addAudit(workflow.user_id, workflowId, "execution_completed")
  }
}

async function addTrace(
  supabase: any,
  workflowId: string,
  message: string
) {
  await supabase.from("workflow_traces").insert({
    workflow_id: workflowId,
    message,
    level: "info",
  })
}