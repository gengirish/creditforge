"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface Assessment {
  id: number;
  borrower_id: number;
  recommendation: string;
  credit_tier: string;
  default_probability: number;
  created_at: string;
  data_analysis: string;
  lenient_case: string;
  cautious_case: string;
  risk_assessment: string;
  final_decision: string;
  borrower?: {
    name: string;
    employment_type: string;
    monthly_income: number;
    loan_amount: number;
  };
}

interface Borrower {
  id: number;
  name: string;
}

const DEBATE_STEPS = [
  {
    key: "data_analysis",
    label: "Data Analyst",
    icon: "DA",
    color: "bg-blue-500",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    bgColor: "bg-blue-500/5",
    role: "Structured Data Analysis",
    desc: "Objective metrics and key risk flags",
  },
  {
    key: "lenient_case",
    label: "Lenient Analyst",
    icon: "LA",
    color: "bg-green-500",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    bgColor: "bg-green-500/5",
    role: "FOR APPROVAL",
    desc: "Arguing in favor of credit approval",
  },
  {
    key: "cautious_case",
    label: "Cautious Analyst",
    icon: "CA",
    color: "bg-red-500",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    bgColor: "bg-red-500/5",
    role: "FOR CAUTION",
    desc: "Highlighting risks and recommending caution",
  },
  {
    key: "risk_assessment",
    label: "Risk Manager",
    icon: "RM",
    color: "bg-amber-500",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    role: "RISK SYNTHESIS",
    desc: "Weighing both sides, assigning probability & tier",
  },
  {
    key: "final_decision",
    label: "Credit Judge",
    icon: "CJ",
    color: "bg-emerald-600",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    role: "FINAL VERDICT",
    desc: "Chief Credit Officer's binding decision",
  },
];

export default function DebatePage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<number | "">("");
  const [assessments, setAssessments] = useState<{ id: number; created_at: string; recommendation: string }[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | "">("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getBorrowers().then((data) => {
      setBorrowers(data);
      if (data.length > 0) setSelectedBorrowerId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedBorrowerId) return;
    api.getBorrower(Number(selectedBorrowerId)).then((data) => {
      setAssessments(data.assessments || []);
      if (data.assessments?.length > 0) {
        setSelectedAssessmentId(data.assessments[0].id);
      } else {
        setSelectedAssessmentId("");
        setAssessment(null);
      }
    });
  }, [selectedBorrowerId]);

  useEffect(() => {
    if (!selectedAssessmentId) return;
    setLoading(true);
    api.getAssessment(Number(selectedAssessmentId))
      .then(setAssessment)
      .catch(() => toast.error("Failed to load assessment"))
      .finally(() => setLoading(false));
  }, [selectedAssessmentId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Debate Viewer</h1>
        <p className="text-gray-400 text-sm mt-1">Watch the 5-agent adversarial debate unfold — explainability for every credit decision</p>
      </div>

      {/* Selector */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Select Borrower</label>
            <select
              value={selectedBorrowerId}
              onChange={(e) => setSelectedBorrowerId(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
            >
              {borrowers.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Select Assessment</label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(Number(e.target.value))}
              disabled={assessments.length === 0}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
            >
              {assessments.length === 0 && <option>No assessments yet</option>}
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.created_at).toLocaleDateString()} — {a.recommendation}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">Loading debate...</div>
      )}

      {!loading && assessment && (
        <div>
          {/* Header */}
          <div className={cn(
            "rounded-xl p-5 mb-6 border flex items-center justify-between flex-wrap gap-4",
            assessment.recommendation === "APPROVE" ? "bg-emerald-900/10 border-emerald-500/30" :
            assessment.recommendation === "REJECT" ? "bg-red-900/10 border-red-500/30" :
            "bg-amber-900/10 border-amber-500/30"
          )}>
            <div>
              <div className="text-gray-400 text-xs mb-1">Final Verdict for {assessment.borrower?.name}</div>
              <div className={cn(
                "text-2xl font-black",
                assessment.recommendation === "APPROVE" ? "text-emerald-400" :
                assessment.recommendation === "REJECT" ? "text-red-400" :
                "text-amber-400"
              )}>
                {assessment.recommendation}
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-gray-500 text-xs">Tier</div>
                <div className="text-white font-bold text-lg">{assessment.credit_tier}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Default Prob</div>
                <div className="text-white font-bold text-lg">{(Number(assessment.default_probability) * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Debate Flow */}
          <div className="space-y-4">
            {DEBATE_STEPS.map((step, i) => {
              const content = assessment[step.key as keyof Assessment] as string;
              return (
                <div key={i} className={cn("rounded-xl border overflow-hidden", step.borderColor)}>
                  <div className={cn("flex items-center gap-3 px-5 py-4 border-b", step.borderColor, step.bgColor)}>
                    <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0", step.color)}>
                      {step.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold text-sm", step.textColor)}>{step.label}</span>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", step.textColor, step.bgColor, "border", step.borderColor)}>
                          {step.role}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{step.desc}</div>
                    </div>
                    <div className="text-gray-600 text-sm font-medium">Agent {i + 1}/5</div>
                  </div>
                  <div className="p-5 bg-gray-900/40">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {content || <span className="text-gray-600">No output available</span>}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !assessment && assessments.length === 0 && selectedBorrowerId && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No assessments for this borrower yet</div>
          <a href="/dashboard/assess" className="text-emerald-400 hover:text-emerald-300 text-sm underline">
            Run an assessment first →
          </a>
        </div>
      )}
    </div>
  );
}
