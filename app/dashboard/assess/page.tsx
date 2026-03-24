"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Cpu, CheckCircle, Circle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
  { key: "data_analysis", name: "Data Analyst", icon: "DA", color: "bg-blue-500", borderColor: "border-blue-500/40", textColor: "text-blue-400", desc: "Analyzing borrower profile & computing metrics..." },
  { key: "lenient_case", name: "Lenient Analyst", icon: "LA", color: "bg-green-500", borderColor: "border-green-500/40", textColor: "text-green-400", desc: "Building the case FOR approval..." },
  { key: "cautious_case", name: "Cautious Analyst", icon: "CA", color: "bg-orange-500", borderColor: "border-orange-500/40", textColor: "text-orange-400", desc: "Identifying risks and caution signals..." },
  { key: "risk_assessment", name: "Risk Manager", icon: "RM", color: "bg-purple-500", borderColor: "border-purple-500/40", textColor: "text-purple-400", desc: "Synthesizing debate, assigning credit tier..." },
  { key: "final_decision", name: "Credit Judge", icon: "CJ", color: "bg-emerald-600", borderColor: "border-emerald-500/40", textColor: "text-emerald-400", desc: "Making FINAL credit decision..." },
];

interface Borrower {
  id: number;
  name: string;
  employment_type: string;
  monthly_income: number;
  loan_amount: number;
}

interface Assessment {
  assessment_id: number;
  data_analysis: string;
  lenient_case: string;
  cautious_case: string;
  risk_assessment: string;
  final_decision: string;
  credit_tier: string;
  default_probability: number;
  recommendation: string;
}

export default function AssessPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [running, setRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<number>(-1);
  const [result, setResult] = useState<Assessment | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.getBorrowers().then((data) => {
      setBorrowers(data);
      if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  const selectedBorrower = borrowers.find((b) => b.id === selectedId);

  const runAssessment = async () => {
    if (!selectedId) return;
    setRunning(true);
    setResult(null);
    setCurrentAgent(0);
    setExpanded({});

    // Simulate agent progress while waiting for the full pipeline
    const agentTimer = setInterval(() => {
      setCurrentAgent((prev) => {
        if (prev < AGENTS.length - 1) return prev + 1;
        clearInterval(agentTimer);
        return prev;
      });
    }, 4000);

    try {
      const data = await api.runAssessment(Number(selectedId));
      clearInterval(agentTimer);
      setCurrentAgent(AGENTS.length);
      setResult(data);
      toast.success(`Assessment complete: ${data.recommendation}`);
    } catch {
      clearInterval(agentTimer);
      toast.error("Assessment failed");
    } finally {
      setRunning(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Assessment Engine</h1>
        <p className="text-gray-400 text-sm mt-1">Run the 5-agent adversarial credit assessment pipeline</p>
      </div>

      {/* Selector Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Select Borrower</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — ₹{Number(b.monthly_income).toLocaleString()}/mo | Loan: ₹{Number(b.loan_amount).toLocaleString()}
              </option>
            ))}
          </select>
          <button
            onClick={runAssessment}
            disabled={running || !selectedId}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold rounded-lg transition-colors"
          >
            <Zap size={16} />
            {running ? "Running Pipeline..." : "Run 5-Agent Assessment"}
          </button>
        </div>
        {selectedBorrower && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg capitalize">{selectedBorrower.employment_type?.replace("_", " ")}</span>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg">₹{Number(selectedBorrower.monthly_income).toLocaleString()}/mo</span>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg">Loan: ₹{Number(selectedBorrower.loan_amount).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Agent Pipeline Visual */}
      {(running || result) && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-5">Agent Pipeline</h3>
          <div className="space-y-3">
            {AGENTS.map((agent, i) => {
              const isDone = currentAgent > i || !running;
              const isActive = currentAgent === i && running;
              const isPending = currentAgent < i && running;
              return (
                <div key={i} className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-all",
                  isDone && result ? agent.borderColor + " bg-gray-800/40" :
                  isActive ? agent.borderColor + " bg-gray-800/60" :
                  "border-gray-800 opacity-40"
                )}>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", agent.color)}>
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-medium text-sm", isActive ? agent.textColor : isDone && result ? "text-white" : "text-gray-500")}>
                      {agent.name}
                    </div>
                    <div className="text-gray-500 text-xs">{isActive ? agent.desc : isDone && result ? "Complete" : "Waiting..."}</div>
                  </div>
                  <div>
                    {isActive ? (
                      <Cpu size={18} className={cn("animate-spin", agent.textColor)} />
                    ) : isDone && result ? (
                      <CheckCircle size={18} className="text-emerald-400" />
                    ) : (
                      <Circle size={18} className="text-gray-700" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Final Decision Banner */}
          <div className={cn(
            "rounded-xl p-6 border",
            result.recommendation === "APPROVE" ? "bg-emerald-900/20 border-emerald-500/40" :
            result.recommendation === "REJECT" ? "bg-red-900/20 border-red-500/40" :
            "bg-amber-900/20 border-amber-500/40"
          )}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Final Credit Decision</div>
                <div className={cn(
                  "text-4xl font-black",
                  result.recommendation === "APPROVE" ? "text-emerald-400" :
                  result.recommendation === "REJECT" ? "text-red-400" :
                  "text-amber-400"
                )}>
                  {result.recommendation}
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Credit Tier</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    result.credit_tier === "A" ? "text-emerald-400" :
                    result.credit_tier === "B" ? "text-blue-400" :
                    result.credit_tier === "C" ? "text-amber-400" :
                    result.credit_tier === "D" ? "text-orange-400" :
                    "text-red-400"
                  )}>
                    Tier {result.credit_tier}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Default Probability</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    result.default_probability < 0.2 ? "text-emerald-400" :
                    result.default_probability < 0.5 ? "text-amber-400" :
                    "text-red-400"
                  )}>
                    {(Number(result.default_probability) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Outputs */}
          {AGENTS.map((agent) => {
            const content = result[agent.key as keyof Assessment] as string;
            const isOpen = expanded[agent.key];
            return (
              <div key={agent.key} className={cn("rounded-xl border overflow-hidden", agent.borderColor)}>
                <button
                  onClick={() => toggleExpand(agent.key)}
                  className="w-full flex items-center justify-between p-4 bg-gray-900/60 hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", agent.color)}>
                      {agent.icon}
                    </span>
                    <span className={cn("font-medium", agent.textColor)}>{agent.name}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-gray-900/30 border-t border-gray-800/50">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
