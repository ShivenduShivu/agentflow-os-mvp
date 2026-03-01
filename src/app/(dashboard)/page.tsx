"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#6b7280"]

type Workflow = {
  id: string
  status: string
  created_at: string
  cost_usd: number | null
}

interface StatusCount {
  status: string
  value: number
}

interface DailyCount {
  date: string
  count: number
}

interface CostByStatus {
  status: string
  value: number
}

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cost: 0,
  })
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([])
  const [costByStatus, setCostByStatus] = useState<CostByStatus[]>([])

  useEffect(() => {
    async function loadWorkflows() {
      const { data, error } = await supabase
        .from("workflows")
        .select("id, status, created_at, cost_usd")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setWorkflows(data)
        computeStats(data)
        computeChartData(data)
      }

      setLoading(false)
    }

    loadWorkflows()
  }, [])

  function computeStats(data: Workflow[]) {
    const total = data.length
    const pending = data.filter(w => w.status === "awaiting_approval").length
    const completed = data.filter(w => w.status === "completed").length
    const cost = data
      .filter(w => w.status === "completed")
      .reduce((sum, w) => sum + (w.cost_usd || 0), 0)

    setStats({ total, pending, completed, cost })
  }

  function computeChartData(data: Workflow[]) {
    // Status distribution (Pie)
    const statuses = new Map<string, number>()
    data.forEach(w => {
      statuses.set(w.status, (statuses.get(w.status) || 0) + 1)
    })
    const statusData = Array.from(statuses, ([status, value]) => ({
      status,
      value,
    }))
    setStatusCounts(statusData)

    // Workflows over time (Bar)
    const dates = new Map<string, number>()
    data.forEach(w => {
      const date = new Date(w.created_at).toLocaleDateString("en-US")
      dates.set(date, (dates.get(date) || 0) + 1)
    })
    const dailyData = Array.from(dates, ([date, count]) => ({
      date,
      count,
    }))
      .reverse() // Show chronologically
    setDailyCounts(dailyData)

    // Cost distribution (Donut)
    const costs = new Map<string, number>()
    data.forEach(w => {
      if (w.cost_usd) {
        costs.set(w.status, (costs.get(w.status) || 0) + w.cost_usd)
      }
    })
    const costData = Array.from(costs, ([status, value]) => ({
      status,
      value,
    }))
    setCostByStatus(costData)
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Total Workflows</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Completed</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-gray-700">
            <div className="text-gray-500">Total Cost</div>
            <div className="text-2xl font-semibold text-gray-900">${stats.cost.toFixed(2)}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Distribution Pie */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Workflow Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.status}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workflows Over Time Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Workflows Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Distribution Donut */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Cost Distribution by Status</h3>
            <div className="h-64">
              {costByStatus.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No cost data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.status}: $${entry.value.toFixed(2)}`}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${(value || 0).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}