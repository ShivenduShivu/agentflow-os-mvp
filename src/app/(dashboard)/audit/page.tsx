import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function AuditPage() {
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

  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, created_at, workflow_id")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Audit Logs</h1>

      {data?.map((log) => (
        <div key={log.id} className="border rounded p-3">
          <div className="text-sm text-muted-foreground">
            {new Date(log.created_at).toLocaleString()}
          </div>
          <div className="font-medium">{log.action}</div>
          <div className="text-xs">Workflow: {log.workflow_id}</div>
        </div>
      ))}
    </div>
  )
}