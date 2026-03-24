"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AGENTS = [
  { name: "Data Analyst", icon: "DA", color: "bg-blue-500", desc: "Computes DTI, alternative data signals" },
  { name: "Lenient Analyst", icon: "LA", color: "bg-green-500", desc: "Makes the case FOR approval" },
  { name: "Cautious Analyst", icon: "CA", color: "bg-orange-500", desc: "Argues for caution/rejection" },
  { name: "Risk Manager", icon: "RM", color: "bg-purple-500", desc: "Synthesizes risk & assigns tier" },
  { name: "Credit Judge", icon: "CJ", color: "bg-emerald-600", desc: "Final APPROVE/REJECT/CONDITIONAL" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (email === "demo@creditforge.ai" && password === "demo123") {
      toast.success("Welcome to CreditForge AI");
      router.push("/dashboard");
    } else {
      toast.error("Invalid credentials. Try demo@creditforge.ai / demo123");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left: Info Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950 border-r border-emerald-500/10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-gray-950 text-lg">CF</div>
            <span className="text-2xl font-bold text-white">CreditForge AI</span>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1 text-emerald-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MTech DSAI Research Project — IIT/NIT Standard
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              5 AI Agents.<br />
              <span className="text-emerald-400">One Credit</span><br />
              Decision.
            </h1>
            <p className="text-gray-400 text-lg max-w-md">
              Multi-agent adversarial debate for smarter NBFC lending.
              Inspired by institutional trading research architecture.
            </p>
          </div>

          {/* Agent Pipeline Visual */}
          <div className="mb-10">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-4">Agent Pipeline</p>
            <div className="flex items-center gap-1 flex-wrap">
              {AGENTS.map((agent, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-700/50 rounded-lg px-3 py-2">
                    <span className={cn("w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center", agent.color)}>
                      {agent.icon}
                    </span>
                    <span className="text-white text-xs font-medium">{agent.name}</span>
                  </div>
                  {i < AGENTS.length - 1 && (
                    <span className="text-emerald-500 text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: "85%", label: "Reduction in Default Risk" },
              { val: "10x", label: "Faster than Manual Review" },
              { val: "RBI", label: "Compliant Explainability" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">{s.val}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-600 text-sm">
          Inspired by TradingAgents (LangGraph multi-agent architecture) — adapted for Indian credit markets
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-gray-950 text-lg">CF</div>
            <span className="text-2xl font-bold text-white">CreditForge AI</span>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in</h2>
            <p className="text-gray-400 text-sm mb-8">Access the multi-agent credit assessment platform</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@creditforge.ai"
                  required
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl py-3 transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <p className="text-gray-400 text-sm font-medium mb-2">Demo credentials:</p>
              <div className="text-emerald-400 text-sm font-mono">
                <div>demo@creditforge.ai</div>
                <div>demo123</div>
              </div>
            </div>

            {/* Agent cards mobile */}
            <div className="lg:hidden mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">5-Agent Pipeline</p>
              <div className="space-y-2">
                {AGENTS.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0", a.color)}>
                      {a.icon}
                    </span>
                    <span className="text-gray-300">{a.name}</span>
                    <span className="text-gray-600 text-xs">— {a.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            CreditForge AI — BuildwithAiGiri MVP #26 | MTech DSAI Showcase
          </p>
        </div>
      </div>
    </div>
  );
}
