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
    .select("id, action, created_at, workflow_id, user_id")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2 border-b">Action</th>
                  <th className="px-3 py-2 border-b">Workflow ID</th>
                  <th className="px-3 py-2 border-b">User</th>
                  <th className="px-3 py-2 border-b">Time</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((log) => (
                  <tr key={log.id} className="odd:bg-white even:bg-slate-50">
                    <td className="px-3 py-2 border-b">{log.action}</td>
                    <td className="px-3 py-2 border-b">{log.workflow_id}</td>
                    <td className="px-3 py-2 border-b text-sm text-gray-600">{log.user_id}</td>
                    <td className="px-3 py-2 border-b text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}