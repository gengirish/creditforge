"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const DECISION_COLORS: Record<string, string> = {
  APPROVE: "#10b981",
  REJECT: "#ef4444",
  CONDITIONAL: "#f59e0b",
};

const TIER_COLORS: Record<string, string> = {
  A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#f97316", E: "#ef4444",
};

interface Stats {
  total_borrowers: number;
  total_assessments: number;
  approval_rate: number;
  decision_distribution: { recommendation: string; count: number }[];
  tier_distribution: { credit_tier: string; count: number; avg_prob: number }[];
  employment_stats: { employment_type: string; recommendation: string; count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const s = await api.getStats();
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const decisionPie = stats?.decision_distribution?.map((d) => ({
    name: d.recommendation,
    value: Number(d.count),
  })) || [];

  const tierBar = stats?.tier_distribution?.map((t) => ({
    tier: `Tier ${t.credit_tier}`,
    count: Number(t.count),
    avgProb: Number((Number(t.avg_prob) * 100).toFixed(1)),
  })) || [];

  // Employment approval rate data
  const empTypes = ["salaried", "self_employed", "business", "gig"];
  const empData = empTypes.map((emp) => {
    const rows = stats?.employment_stats?.filter((e) => e.employment_type === emp) || [];
    const total = rows.reduce((s, r) => s + Number(r.count), 0);
    const approves = rows.filter((r) => r.recommendation === "APPROVE").reduce((s, r) => s + Number(r.count), 0);
    return {
      type: emp.replace("_", " "),
      approvalRate: total > 0 ? Math.round(approves / total * 100) : 0,
      total,
    };
  });

  const CustomTooltipStyle = { background: "#111827", border: "1px solid #374151", borderRadius: "8px" };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Credit portfolio insights and agent performance metrics</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-gray-300 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Borrowers", value: stats?.total_borrowers },
          { label: "Total Assessments", value: stats?.total_assessments },
          { label: "Approval Rate", value: stats ? `${stats.approval_rate}%` : null },
          { label: "Avg Tier Prob", value: stats?.tier_distribution
            ? (() => {
                const all = stats.tier_distribution;
                const total = all.reduce((s, t) => s + Number(t.count), 0);
                const ws = all.reduce((s, t) => s + Number(t.avg_prob) * Number(t.count), 0);
                return total > 0 ? `${(ws / total * 100).toFixed(1)}%` : null;
              })()
            : null },
        ].map((c, i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{loading ? "..." : c.value ?? "--"}</div>
            <div className="text-gray-400 text-sm">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Decision Distribution Pie */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Decision Distribution</h3>
          {decisionPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={decisionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={false}>
                  {decisionPie.map((entry, i) => (
                    <Cell key={i} fill={DECISION_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CustomTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">No assessment data yet</div>
          )}
        </div>

        {/* Credit Tier Distribution */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Credit Tier Distribution</h3>
          {tierBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tierBar} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="tier" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Bar dataKey="count" name="Borrowers" radius={[4, 4, 0, 0]}>
                  {tierBar.map((entry, i) => (
                    <Cell key={i} fill={TIER_COLORS[entry.tier.replace("Tier ", "")] || "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Approval Rate by Employment */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Approval Rate by Employment Type</h3>
          {empData.some((e) => e.total > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={empData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="type" tick={{ fill: "#9ca3af", fontSize: 12 }} width={80} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v}%`, "Approval Rate"]} />
                <Bar dataKey="approvalRate" name="Approval Rate %" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">Run assessments to see data</div>
          )}
        </div>

        {/* Default Probability by Tier */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Avg Default Probability by Tier</h3>
          {tierBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tierBar} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="tier" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v}%`, "Avg Default Prob"]} />
                <Bar dataKey="avgProb" name="Avg Default %" radius={[4, 4, 0, 0]}>
                  {tierBar.map((entry, i) => (
                    <Cell key={i} fill={TIER_COLORS[entry.tier.replace("Tier ", "")] || "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Agent Architecture Info */}
      <div className="mt-6 bg-gray-900/50 border border-emerald-500/20 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Multi-Agent Architecture</h3>
        <div className="grid sm:grid-cols-5 gap-3">
          {[
            { icon: "DA", name: "Data Analyst", desc: "DTI ratio, alt-data signals", color: "bg-blue-500" },
            { icon: "LA", name: "Lenient Analyst", desc: "FOR approval thesis", color: "bg-green-500" },
            { icon: "CA", name: "Cautious Analyst", desc: "FOR caution/rejection", color: "bg-orange-500" },
            { icon: "RM", name: "Risk Manager", desc: "Tier & probability", color: "bg-purple-500" },
            { icon: "CJ", name: "Credit Judge", desc: "Final binding verdict", color: "bg-emerald-600" },
          ].map((a, i) => (
            <div key={i} className="text-center">
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm", a.color)}>
                {a.icon}
              </div>
              <div className="text-white text-xs font-medium mb-1">{a.name}</div>
              <div className="text-gray-500 text-xs">{a.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3 text-sm text-gray-400">
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-500/20">Inspired by TradingAgents</span>
          <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/20">LangGraph Orchestration</span>
          <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs border border-purple-500/20">MTech DSAI Project</span>
        </div>
      </div>
    </div>
  );
}
