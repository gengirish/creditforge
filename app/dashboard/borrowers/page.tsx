"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, X, Cpu, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Borrower {
  id: number;
  name: string;
  age: number;
  employment_type: string;
  monthly_income: number;
  years_employed: number;
  loan_amount: number;
  loan_purpose: string;
  credit_history_years: number;
  existing_loans: number;
  upi_monthly_txns: number;
  gst_filing_consistency: number | null;
  utility_payment_score: number;
  recommendation?: string;
  credit_tier?: string;
  default_probability?: number;
}

const EMPLOYMENT_TYPES = ["salaried", "self_employed", "business", "gig"];

const defaultForm = {
  name: "",
  age: 30,
  employment_type: "salaried",
  monthly_income: 50000,
  years_employed: 2,
  loan_amount: 500000,
  loan_purpose: "Personal loan",
  credit_history_years: 3,
  existing_loans: 0,
  upi_monthly_txns: 20,
  gst_filing_consistency: "",
  utility_payment_score: 80,
};

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [assessing, setAssessing] = useState<number | null>(null);

  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const data = await api.getBorrowers();
      setBorrowers(data);
    } catch {
      toast.error("Failed to load borrowers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrowers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        monthly_income: Number(form.monthly_income),
        years_employed: Number(form.years_employed),
        loan_amount: Number(form.loan_amount),
        credit_history_years: Number(form.credit_history_years),
        existing_loans: Number(form.existing_loans),
        upi_monthly_txns: Number(form.upi_monthly_txns),
        gst_filing_consistency: form.gst_filing_consistency ? Number(form.gst_filing_consistency) : null,
        utility_payment_score: Number(form.utility_payment_score),
      };
      await api.createBorrower(payload);
      toast.success("Borrower added successfully");
      setShowForm(false);
      setForm(defaultForm);
      fetchBorrowers();
    } catch {
      toast.error("Failed to add borrower");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssess = async (id: number, name: string) => {
    setAssessing(id);
    toast.info(`Running 5-agent assessment for ${name}...`);
    try {
      const result = await api.runAssessment(id);
      toast.success(`Assessment complete: ${result.recommendation}`);
      fetchBorrowers();
    } catch {
      toast.error("Assessment failed");
    } finally {
      setAssessing(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Borrowers</h1>
          <p className="text-gray-400 text-sm mt-1">{borrowers.length} borrower profiles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBorrowers}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-gray-300 hover:text-white text-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-medium rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Add Borrower
          </button>
        </div>
      </div>

      {/* Add Borrower Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-white font-bold text-lg">Add New Borrower</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", field: "name", type: "text", col: 2 },
                { label: "Age", field: "age", type: "number" },
                { label: "Monthly Income (₹)", field: "monthly_income", type: "number" },
                { label: "Years Employed", field: "years_employed", type: "number" },
                { label: "Loan Amount (₹)", field: "loan_amount", type: "number" },
                { label: "Loan Purpose", field: "loan_purpose", type: "text", col: 2 },
                { label: "Credit History (Years)", field: "credit_history_years", type: "number" },
                { label: "Existing Loans", field: "existing_loans", type: "number" },
                { label: "UPI Txns/Month", field: "upi_monthly_txns", type: "number" },
                { label: "GST Consistency (%)", field: "gst_filing_consistency", type: "number" },
                { label: "Utility Score (0-100)", field: "utility_payment_score", type: "number" },
              ].map((f) => (
                <div key={f.field} className={f.col === 2 ? "col-span-2" : ""}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, unknown>)[f.field] as string}
                    onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                    required={f.field !== "gst_filing_consistency"}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-gray-400 text-sm mb-1">Employment Type</label>
                <select
                  value={form.employment_type}
                  onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-medium rounded-lg text-sm transition-colors"
                >
                  {submitting ? "Adding..." : "Add Borrower"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrowers Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Borrower</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Employment</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">Income/Mo</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">Loan Ask</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">UPI Txns</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">GST %</th>
                <th className="text-center py-3 px-4 text-gray-400 text-sm font-medium">Tier</th>
                <th className="text-center py-3 px-4 text-gray-400 text-sm font-medium">Decision</th>
                <th className="text-center py-3 px-4 text-gray-400 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : borrowers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">No borrowers yet. Add one above.</td>
                </tr>
              ) : (
                borrowers.map((b) => (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{b.name}</div>
                          <div className="text-gray-500 text-xs">Age {b.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm capitalize">{b.employment_type?.replace("_", " ")}</td>
                    <td className="py-3 px-4 text-right text-gray-300 text-sm">₹{Number(b.monthly_income).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300 text-sm">₹{Number(b.loan_amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300 text-sm">{b.upi_monthly_txns}</td>
                    <td className="py-3 px-4 text-right text-gray-300 text-sm">{b.gst_filing_consistency ?? "N/A"}</td>
                    <td className="py-3 px-4 text-center">
                      {b.credit_tier ? (
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold",
                          b.credit_tier === "A" ? "bg-emerald-500/10 text-emerald-400" :
                          b.credit_tier === "B" ? "bg-blue-500/10 text-blue-400" :
                          b.credit_tier === "C" ? "bg-amber-500/10 text-amber-400" :
                          b.credit_tier === "D" ? "bg-orange-500/10 text-orange-400" :
                          "bg-red-500/10 text-red-400"
                        )}>
                          {b.credit_tier}
                        </span>
                      ) : <span className="text-gray-600 text-xs">--</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.recommendation ? (
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold",
                          b.recommendation === "APPROVE" ? "bg-emerald-500/10 text-emerald-400" :
                          b.recommendation === "REJECT" ? "bg-red-500/10 text-red-400" :
                          "bg-amber-500/10 text-amber-400"
                        )}>
                          {b.recommendation}
                        </span>
                      ) : <span className="text-gray-600 text-xs">Pending</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAssess(b.id, b.name)}
                        disabled={assessing === b.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Cpu size={12} className={assessing === b.id ? "animate-spin" : ""} />
                        {assessing === b.id ? "Running..." : "Assess"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
