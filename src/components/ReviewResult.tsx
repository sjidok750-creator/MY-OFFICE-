"use client";

import { CheckCircle2, XCircle, AlertCircle, Lightbulb, Download, MapPin } from "lucide-react";
import type { ReviewResult, RuleResult } from "@/types/review";

interface ReviewResultProps {
  result: ReviewResult;
  onExport: (format: "pdf" | "md") => void;
}

function RuleItem({ rule }: { rule: RuleResult }) {
  const config = {
    pass: {
      icon: <CheckCircle2 size={16} />,
      iconClass: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      label: "통과",
      border: "border-emerald-500/10",
    },
    fail: {
      icon: <XCircle size={16} />,
      iconClass: "text-red-400",
      badge: "bg-red-500/15 text-red-400 border-red-500/25",
      label: "불일치",
      border: "border-red-500/10",
    },
    partial: {
      icon: <AlertCircle size={16} />,
      iconClass: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      label: "부분 충족",
      border: "border-amber-500/10",
    },
  }[rule.status];

  return (
    <div className={`glass-card rounded-xl p-4 border ${config.border} transition-all duration-200 hover:bg-white/[0.06]`}>
      <div className="flex items-start gap-3">
        <span className={`${config.iconClass} mt-0.5 flex-shrink-0`}>{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">{rule.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${config.badge} font-medium`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-white mt-1 font-medium">{rule.rule}</p>

          {rule.location && (
            <div className="flex items-center gap-1 mt-2">
              <MapPin size={11} className="text-slate-500" />
              <span className="text-xs text-slate-500">{rule.location}</span>
            </div>
          )}
          {rule.suggestion && (
            <div className="flex items-start gap-1.5 mt-2 bg-blue-500/8 rounded-lg px-3 py-2">
              <Lightbulb size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">{rule.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewResultView({ result, onExport }: ReviewResultProps) {
  const { summary } = result;
  const scoreColor =
    summary.score >= 80 ? "text-emerald-400" :
    summary.score >= 60 ? "text-amber-400" : "text-red-400";

  const scoreGradient =
    summary.score >= 80 ? "from-emerald-500 to-teal-500" :
    summary.score >= 60 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";

  return (
    <div className="space-y-5">
      {/* Score Card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">검토 결과</h2>
          <span className="text-xs text-slate-500">
            지침 {result.guideline.version} 기준
          </span>
        </div>

        {/* Score ring area */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - summary.score / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={summary.score >= 80 ? "#10B981" : summary.score >= 60 ? "#F59E0B" : "#EF4444"} />
                  <stop offset="100%" stopColor={summary.score >= 80 ? "#14B8A6" : summary.score >= 60 ? "#F97316" : "#F43F5E"} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${scoreColor}`}>{summary.score}</span>
              <span className="text-xs text-slate-500">점</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-3">
            {[
              { count: summary.pass, label: "통과", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { count: summary.fail, label: "불일치", color: "text-red-400", bg: "bg-red-500/10" },
              { count: summary.partial, label: "부분", color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map(({ count, label, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-bold ${color}`}>{count}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>전체 {summary.total}개 항목</span>
            <span>{summary.score}점 / 100점</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${scoreGradient} transition-all duration-1000`}
              style={{ width: `${summary.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rules */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          항목별 결과
        </h3>
        <div className="space-y-2">
          {result.rules.map((rule) => (
            <RuleItem key={rule.id} rule={rule} />
          ))}
        </div>
      </div>

      {/* Typos */}
      {result.typos.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            오타 · 오기 목록 ({result.typos.length}건)
          </h3>
          <div className="glass-card rounded-2xl divide-y divide-white/[0.05]">
            {result.typos.map((typo, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm text-red-400 font-mono line-through opacity-70">{typo.original}</span>
                <span className="text-slate-500 text-sm">→</span>
                <span className="text-sm text-emerald-400 font-mono font-medium">{typo.corrected}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={10} />
                  {typo.location}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex gap-3">
        <button
          onClick={() => onExport("pdf")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          <Download size={16} />
          PDF 내보내기
        </button>
        <button
          onClick={() => onExport("md")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-slate-300 border border-white/10 hover:bg-white/[0.04] transition-all duration-200 active:scale-[0.98]"
        >
          <Download size={16} />
          Markdown
        </button>
      </div>
    </div>
  );
}
