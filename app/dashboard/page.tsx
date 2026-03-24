"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Users, FileText, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const DECISION_COLORS: Record<string, string> = {
  APPROVE: "#10b981",
  REJECT: "#ef4444",
  CONDITIONAL: "#f59e0b",
};

const TIER_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#f97316",
  E: "#ef4444",
};

interface Stats {
  total_borrowers: number;
  total_assessments: number;
  approval_rate: number;
  decision_distribution: { recommendation: string; count: number }[];
  tier_distribution: { credit_tier: string; count: number; avg_prob: number }[];
}

interface Borrower {
  id: number;
  name: string;
  employment_type: string;
  monthly_income: number;
  loan_amount: number;
  recommendation?: string;
  credit_tier?: string;
  default_probability?: number;
  created_at: string;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([api.getStats(), api.getBorrowers()]);
      setStats(s);
      setBorrowers(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pieData = stats?.decision_distribution?.map((d) => ({
    name: d.recommendation,
    value: Number(d.count),
  })) || [];

  const barData = stats?.tier_distribution?.map((t) => ({
    tier: `Tier ${t.credit_tier}`,
    count: Number(t.count),
    avgProb: Number((Number(t.avg_prob) * 100).toFixed(1)),
  })) || [];

  const recentBorrowers = borrowers.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">CreditForge AI — Multi-Agent Credit Assessment Platform</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-gray-300 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Borrowers", value: stats?.total_borrowers ?? "--", icon: Users, color: "text-blue-400" },
          { label: "Assessments Run", value: stats?.total_assessments ?? "--", icon: FileText, color: "text-emerald-400" },
          { label: "Approval Rate", value: stats ? `${stats.approval_rate}%` : "--", icon: TrendingUp, color: "text-green-400" },
          { label: "Avg Default Risk", value: stats?.tier_distribution
            ? (() => {
                const all = stats.tier_distribution;
                const totalCount = all.reduce((s, t) => s + Number(t.count), 0);
                const weightedSum = all.reduce((s, t) => s + Number(t.avg_prob) * Number(t.count), 0);
                return totalCount > 0 ? `${(weightedSum / totalCount * 100).toFixed(1)}%` : "--";
              })()
            : "--", icon: AlertTriangle, color: "text-orange-400" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{card.label}</span>
                <Icon size={18} className={card.color} />
              </div>
              <div className="text-3xl font-bold text-white">{loading ? "..." : card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Decision Pie */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Decision Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.name}: ${e.value}`}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={DECISION_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">No data yet</div>
          )}
        </div>

        {/* Tier Bar */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Credit Tier Distribution</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="tier" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }} />
                <Bar dataKey="count" name="Borrowers" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={TIER_COLORS[entry.tier.replace("Tier ", "")] || "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Recent Borrowers</h3>
        <div className="space-y-3">
          {recentBorrowers.length === 0 && !loading && (
            <div className="text-gray-500 text-center py-4">No borrowers yet</div>
          )}
          {recentBorrowers.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {b.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{b.name}</div>
                  <div className="text-gray-500 text-xs capitalize">{b.employment_type?.replace("_", " ")} · ₹{Number(b.monthly_income).toLocaleString()}/mo</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-400 text-sm">₹{Number(b.loan_amount).toLocaleString()}</div>
                {b.recommendation && (
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-bold",
                    b.recommendation === "APPROVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    b.recommendation === "REJECT" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}>
                    {b.recommendation}
                  </span>
                )}
                {b.credit_tier && (
                  <span className="text-gray-500 text-xs">Tier {b.credit_tier}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
