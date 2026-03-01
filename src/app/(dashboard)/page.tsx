import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export default async function DashboardPage() {
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

  const { count: totalWorkflows } = await supabase
    .from("workflows")
    .select("id", { head: true, count: "exact" })

  const { count: pendingApprovals } = await supabase
    .from("workflows")
    .select("id", { head: true, count: "exact" })
    .eq("status", "awaiting_approval")

  const { data: completedData } = await supabase
    .from("workflows")
    .select("cost_usd")
    .eq("status", "completed")

  const completedCount = (completedData || []).length
  const totalCost = (completedData || []).reduce((s: number, r: any) => s + (r.cost_usd || 0), 0)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Total Workflows</div>
            <div className="text-2xl font-semibold text-gray-900">{totalWorkflows ?? 0}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-semibold text-gray-900">{pendingApprovals ?? 0}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Completed</div>
            <div className="text-2xl font-semibold text-gray-900">{completedCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Total Cost</div>
            <div className="text-2xl font-semibold text-gray-900">${totalCost.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}