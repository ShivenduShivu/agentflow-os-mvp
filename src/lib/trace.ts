import { supabase } from "@/lib/supabase"

export async function logTrace(workflowId: string, message: string) {
  const { error } = await supabase
    .from("workflow_traces")
    .insert({
      workflow_id: workflowId,
      message,
    })

  if (error) {
    console.error("Trace insert error:", error)
  }
}