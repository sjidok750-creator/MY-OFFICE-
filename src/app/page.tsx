"use client";

import { useState } from "react";
import {
  Sparkles,
  LayoutDashboard,
  FileSearch,
  Bell,
  Settings,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import GuidelineInfoCard from "@/components/GuidelineInfo";
import FileUploader from "@/components/FileUploader";
import ReviewResultView from "@/components/ReviewResult";
import type { GuidelineInfo, ReviewResult } from "@/types/review";

/* ── Mock data (나중에 API로 교체) ─────────────────────────── */
const MOCK_GUIDELINE: GuidelineInfo = {
  title: "업무보고서 작성 지침",
  version: "v2.3",
  updatedAt: "2026-02-28",
  status: "loaded",
};

const MOCK_RESULT: ReviewResult = {
  guideline: { version: "v2.3", updatedAt: "2026-02-28" },
  summary: { total: 10, pass: 7, fail: 2, partial: 1, score: 75 },
  rules: [
    { id: "R01", rule: "제목은 굵게 표시", status: "pass" },
    { id: "R02", rule: "날짜 표기 형식 (YYYY-MM-DD)", status: "fail", location: "3페이지 2번 항목", suggestion: "날짜를 'YYYY-MM-DD' 형식으로 수정 필요" },
    { id: "R03", rule: "서명란 포함 여부", status: "partial", location: "마지막 페이지", suggestion: "결재자 서명란이 누락되어 있습니다." },
    { id: "R04", rule: "목차 형식 준수", status: "pass" },
    { id: "R05", rule: "페이지 번호 삽입", status: "fail", location: "전체 페이지", suggestion: "각 페이지 하단에 페이지 번호를 추가하세요." },
    { id: "R06", rule: "참고문헌 표기", status: "pass" },
    { id: "R07", rule: "단위 표기 통일", status: "pass" },
    { id: "R08", rule: "약어 최초 사용 시 정의 명시", status: "pass" },
    { id: "R09", rule: "그림·표 캡션 형식", status: "pass" },
    { id: "R10", rule: "들여쓰기 2칸 규칙", status: "pass" },
  ],
  typos: [
    { original: "기술직원", corrected: "기술 직원", location: "5p 3줄" },
    { original: "관련사항", corrected: "관련 사항", location: "7p 1줄" },
  ],
};

/* ── 하단 네비게이션 ──────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "대시보드", color: "#3B82F6", active: false },
  { icon: FileSearch, label: "검토", color: "#8B5CF6", active: true },
  { icon: Bell, label: "알림", color: "#F59E0B", active: false },
  { icon: Settings, label: "설정", color: "#10B981", active: false },
];

/* ── 스탯 카드 ─────────────────────────────────────────────── */
const STATS = [
  { icon: FileSearch, label: "이번 달 검토", value: "24건", gradient: "from-blue-500 to-indigo-600", glow: "rgba(59,130,246,0.25)" },
  { icon: TrendingUp, label: "평균 점수", value: "82점", gradient: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.25)" },
  { icon: Shield, label: "통과율", value: "91%", gradient: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.25)" },
  { icon: Zap, label: "오타 탐지", value: "138건", gradient: "from-amber-500 to-orange-500", glow: "rgba(245,158,11,0.25)" },
];

/* ── 메인 ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [guideline, setGuideline] = useState<GuidelineInfo>(MOCK_GUIDELINE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setGuideline((prev) => ({ ...prev, status: "loading" }));
    await new Promise((r) => setTimeout(r, 1500));
    setGuideline({ ...MOCK_GUIDELINE, updatedAt: new Date().toISOString().split("T")[0] });
    setIsRefreshing(false);
  }

  async function handleReview() {
    if (!selectedFile) return;
    setIsReviewing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    setResult(MOCK_RESULT);
    setIsReviewing(false);
  }

  function handleExport(format: "pdf" | "md") {
    alert(`${format.toUpperCase()} 내보내기 기능은 Phase 3에서 구현됩니다.`);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10B981, transparent)" }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-12 pb-24">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}>
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">MY OFFICE</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-300">K</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4 leading-tight">
            보고서 검토
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(90deg, #3B82F6, #8B5CF6)" }}> 시스템</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI 기반 지침 준수 분석 · 오타 탐지</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {STATS.map(({ icon: Icon, label, value, gradient, glow }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-3 text-center"
              style={{ boxShadow: `0 4px 20px ${glow}` }}
            >
              <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                <Icon size={14} className="text-white" />
              </div>
              <div className="text-sm font-bold text-white">{value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {/* Guideline Card */}
        <div className="mb-4">
          <GuidelineInfoCard
            guideline={guideline}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Upload Section */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">보고서 파일</h2>
            {selectedFile && (
              <span className="text-xs text-emerald-400 font-medium">업로드 완료</span>
            )}
          </div>

          <FileUploader
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />

          {selectedFile && !isReviewing && !result && (
            <button
              onClick={handleReview}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)" }}
            >
              <Sparkles size={16} />
              AI 검토 시작
              <ChevronRight size={16} />
            </button>
          )}

          {isReviewing && (
            <div className="mt-4 rounded-xl overflow-hidden" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="shimmer h-1 w-full" />
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <div>
                  <p className="text-sm font-medium text-white">AI 검토 중...</p>
                  <p className="text-xs text-slate-400 mt-0.5">지침 항목 분석 · 오타 탐지</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && !isReviewing && (
          <ReviewResultView result={result} onExport={handleExport} />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-6 pt-2">
          <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-around"
            style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.4), 0 4px 30px rgba(0,0,0,0.3)" }}>
            {NAV_ITEMS.map(({ icon: Icon, label, color, active }) => (
              <button key={label} className="flex flex-col items-center gap-1 group">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active ? "scale-110" : "opacity-50 group-hover:opacity-75"
                  }`}
                  style={{
                    background: active ? `${color}20` : "transparent",
                    boxShadow: active ? `0 0 16px ${color}40` : "none",
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: active ? color : "#94A3B8" }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span
                  className="text-[10px] font-medium transition-colors duration-200"
                  style={{ color: active ? color : "#64748B" }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
