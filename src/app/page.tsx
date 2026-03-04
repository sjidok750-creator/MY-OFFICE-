"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Sparkles, BookOpen, Upload, FileText, X, CheckCircle2,
  FolderOpen, Loader2, FileSearch, TrendingUp, Shield, Zap,
  ChevronRight, Plus, AlertCircle, CheckCircle, Files,
} from "lucide-react";
import ReviewResultView from "@/components/ReviewResult";
import type { ReviewResult } from "@/types/review";

/* ── Constants ──────────────────────────────────────────────── */
const ALLOWED_EXT = [".docx", ".pdf", ".txt", ".md"];
const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/plain",
  "text/markdown",
];
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const GUIDELINE_FILES = [
  { id: "GL001", name: "업무보고서 작성 지침", version: "v2.3", updatedAt: "2026-02-28" },
  { id: "GL002", name: "연구보고서 작성 지침", version: "v1.5", updatedAt: "2026-01-15" },
  { id: "GL003", name: "감사보고서 작성 지침", version: "v3.1", updatedAt: "2025-12-10" },
  { id: "GL004", name: "사업계획서 작성 지침", version: "v2.0", updatedAt: "2025-11-20" },
];

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

/* ── Helpers ────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getFileGradient(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return ({
    pdf: "from-red-500 to-rose-600",
    docx: "from-blue-500 to-blue-700",
    txt: "from-slate-400 to-slate-600",
    md: "from-purple-500 to-violet-600",
  } as Record<string, string>)[ext ?? ""] ?? "from-slate-500 to-slate-600";
}

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXT.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return `${file.name}: 지원하지 않는 형식 (${ALLOWED_EXT.join(", ")})`;
  }
  if (file.size > MAX_SIZE) {
    return `${file.name}: 파일 크기 초과 (최대 100MB)`;
  }
  return null;
}

/* ── Main Component ─────────────────────────────────────────── */
export default function HomePage() {
  /* Guideline */
  const [glTab, setGlTab] = useState<"select" | "upload">("select");
  const [selectedGlId, setSelectedGlId] = useState<string | null>(null);
  const [uploadedGl, setUploadedGl] = useState<File | null>(null);
  const [isDraggingGl, setIsDraggingGl] = useState(false);
  const glInputRef = useRef<HTMLInputElement>(null);

  /* Reports */
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [isDraggingRep, setIsDraggingRep] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const repInputRef = useRef<HTMLInputElement>(null);

  /* Review */
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  /* Stats — start at 0, update after each review */
  const [stats, setStats] = useState({ reviews: 0, avgScore: 0, passRate: 0, typos: 0 });
  const historyRef = useRef<{ score: number; pass: number; total: number; typos: number }[]>([]);

  /* Derived */
  const hasGuideline = glTab === "select" ? selectedGlId !== null : uploadedGl !== null;
  const canReview = hasGuideline && reportFiles.length > 0 && !isReviewing;

  /* ── Handlers ─────────────────────────────────────────────── */
  function addReportFiles(incoming: FileList | File[]) {
    const errs: string[] = [];
    const valid: File[] = [];
    Array.from(incoming).forEach((f) => {
      const err = validateFile(f);
      if (err) {
        errs.push(err);
      } else if (!reportFiles.some((r) => r.name === f.name && r.size === f.size)) {
        valid.push(f);
      }
    });
    setFileErrors(errs);
    if (valid.length) setReportFiles((prev) => [...prev, ...valid]);
  }

  function removeReportFile(idx: number) {
    setReportFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileErrors([]);
  }

  function onRepDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingRep(false);
    addReportFiles(e.dataTransfer.files);
  }

  function onRepInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addReportFiles(e.target.files);
    e.target.value = "";
  }

  function onGlDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingGl(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const err = validateFile(file);
      if (!err) setUploadedGl(file);
    }
  }

  function onGlInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (!err) setUploadedGl(file);
    }
    e.target.value = "";
  }

  async function handleReview() {
    if (!canReview) return;
    setIsReviewing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));

    const r = MOCK_RESULT;
    setResult(r);
    setIsReviewing(false);

    /* Real-time stats update */
    historyRef.current.push({
      score: r.summary.score,
      pass: r.summary.pass,
      total: r.summary.total,
      typos: r.typos.length,
    });
    const h = historyRef.current;
    setStats({
      reviews: h.length,
      avgScore: Math.round(h.reduce((s, x) => s + x.score, 0) / h.length),
      passRate: Math.round(
        (h.reduce((s, x) => s + x.pass, 0) / h.reduce((s, x) => s + x.total, 0)) * 100
      ),
      typos: h.reduce((s, x) => s + x.typos, 0),
    });
  }

  function handleExport(format: "pdf" | "md") {
    alert(`${format.toUpperCase()} 내보내기 기능은 Phase 3에서 구현됩니다.`);
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #0B1120 0%, #0F172A 50%, #0B1120 100%)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)" }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #10B981, transparent)" }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30 border-b border-white/[0.06]"
          style={{ background: "rgba(11,17,32,0.85)", backdropFilter: "blur(20px)" }}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
              >
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">MY OFFICE</span>
                <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                  보고서 검토 시스템
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden md:inline">
                AI 기반 지침 준수 분석 · 오타 탐지
              </span>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-300">K</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Stats Bar ──────────────────────────────────────── */}
        <div
          className="border-b border-white/[0.04]"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: FileSearch,
                  label: "이번 달 검토",
                  value: stats.reviews,
                  unit: "건",
                  gradient: "from-blue-500 to-indigo-600",
                  glow: "rgba(59,130,246,0.2)",
                },
                {
                  icon: TrendingUp,
                  label: "평균 점수",
                  value: stats.avgScore,
                  unit: "점",
                  gradient: "from-violet-500 to-purple-600",
                  glow: "rgba(139,92,246,0.2)",
                },
                {
                  icon: Shield,
                  label: "통과율",
                  value: stats.passRate,
                  unit: "%",
                  gradient: "from-emerald-500 to-teal-600",
                  glow: "rgba(16,185,129,0.2)",
                },
                {
                  icon: Zap,
                  label: "오타 탐지",
                  value: stats.typos,
                  unit: "건",
                  gradient: "from-amber-500 to-orange-500",
                  glow: "rgba(245,158,11,0.2)",
                },
              ].map(({ icon: Icon, label, value, unit, gradient, glow }) => (
                <div
                  key={label}
                  className="glass-card rounded-xl p-4 flex items-center gap-3 transition-all duration-500"
                  style={{ boxShadow: `0 4px 20px ${glow}` }}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} flex-shrink-0`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white tabular-nums">
                      {value}
                      <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
                    </div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-8 items-start">

            {/* ─── Left Panel: Controls ─────────────────────── */}
            <div className="space-y-5">

              {/* Section 1: 검토 기준 */}
              <section className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                  >
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">검토 기준</h2>
                  {hasGuideline && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle size={13} />
                      선택됨
                    </span>
                  )}
                </div>

                {/* Tab toggle */}
                <div className="flex border-b border-white/[0.06]">
                  {(["select", "upload"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGlTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all duration-200 ${
                        glTab === tab
                          ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                      }`}
                    >
                      {tab === "select" ? (
                        <>
                          <FolderOpen size={13} />
                          파일에서 선택
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          직접 업로드
                        </>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {glTab === "select" ? (
                    /* File selector */
                    <div className="space-y-2">
                      {GUIDELINE_FILES.map((gl) => (
                        <button
                          key={gl.id}
                          onClick={() => setSelectedGlId(gl.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                            selectedGlId === gl.id
                              ? "border-blue-500/50 bg-blue-500/10"
                              : "border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              selectedGlId === gl.id
                                ? "bg-blue-500/20"
                                : "bg-white/[0.05]"
                            }`}
                          >
                            <BookOpen
                              size={14}
                              className={
                                selectedGlId === gl.id ? "text-blue-400" : "text-slate-400"
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{gl.name}</p>
                            <p className="text-xs text-slate-500">
                              {gl.version} · {gl.updatedAt}
                            </p>
                          </div>
                          {selectedGlId === gl.id && (
                            <CheckCircle2 size={15} className="text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Upload guideline */
                    <>
                      {uploadedGl ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileGradient(uploadedGl.name)} flex items-center justify-center flex-shrink-0`}
                          >
                            <FileText size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {uploadedGl.name}
                            </p>
                            <p className="text-xs text-slate-400">{formatBytes(uploadedGl.size)}</p>
                          </div>
                          <button
                            onClick={() => setUploadedGl(null)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => glInputRef.current?.click()}
                          onDrop={onGlDrop}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingGl(true);
                          }}
                          onDragLeave={() => setIsDraggingGl(false)}
                          className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                            isDraggingGl
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/10 hover:border-blue-500/40 hover:bg-white/[0.02]"
                          }`}
                        >
                          <input
                            ref={glInputRef}
                            type="file"
                            accept={ALLOWED_EXT.join(",")}
                            onChange={onGlInputChange}
                            className="hidden"
                          />
                          <Upload
                            size={24}
                            className={`mx-auto mb-3 ${
                              isDraggingGl ? "text-blue-400" : "text-slate-500"
                            }`}
                          />
                          <p className="text-sm font-semibold text-white">지침 파일 업로드</p>
                          <p className="text-xs text-slate-500 mt-1">
                            드래그&amp;드롭 또는 클릭 · {ALLOWED_EXT.join(" ")} · 최대 100MB
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* Section 2: 보고서 파일 */}
              <section className="glass-card rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)" }}
                  >
                    <Files size={16} className="text-white" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">보고서 파일</h2>
                  {reportFiles.length > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/25">
                      {reportFiles.length}개 선택됨
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* File list */}
                  {reportFiles.length > 0 && (
                    <div className="space-y-2">
                      {reportFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getFileGradient(file.name)} flex items-center justify-center flex-shrink-0`}
                          >
                            <FileText size={15} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeReportFile(idx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onClick={() => repInputRef.current?.click()}
                    onDrop={onRepDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingRep(true);
                    }}
                    onDragLeave={() => setIsDraggingRep(false)}
                    className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDraggingRep
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 hover:border-violet-500/40 hover:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      ref={repInputRef}
                      type="file"
                      accept={ALLOWED_EXT.join(",")}
                      multiple
                      onChange={onRepInputChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isDraggingRep ? "bg-violet-500/20" : "bg-white/[0.04]"
                        }`}
                      >
                        <Plus
                          size={22}
                          className={isDraggingRep ? "text-violet-400" : "text-slate-400"}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {reportFiles.length > 0 ? "파일 추가" : "보고서 파일 업로드"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          드래그&amp;드롭 또는 클릭 · 여러 파일 동시 업로드 가능 · 최대 100MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {fileErrors.length > 0 && (
                    <div className="space-y-1.5">
                      {fileErrors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                        >
                          <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-400">{err}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Review Button */}
              <button
                onClick={handleReview}
                disabled={!canReview}
                className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={
                  canReview
                    ? {
                        background:
                          "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
                        boxShadow: "0 8px 30px rgba(99,102,241,0.35)",
                      }
                    : { background: "rgba(255,255,255,0.06)" }
                }
              >
                {isReviewing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    AI 검토 중...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI 검토 시작
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              {/* Readiness hints */}
              {!canReview && !isReviewing && (
                <div className="space-y-1.5">
                  {!hasGuideline && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
                      검토 기준을 선택하거나 업로드해주세요
                    </p>
                  )}
                  {reportFiles.length === 0 && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
                      보고서 파일을 1개 이상 업로드해주세요
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ─── Right Panel: Results ──────────────────────── */}
            <div className="lg:sticky lg:top-24">
              {isReviewing && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="shimmer h-1 w-full" />
                  <div className="p-16 flex flex-col items-center gap-5">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        border: "1px solid rgba(59,130,246,0.2)",
                      }}
                    >
                      <Loader2 size={32} className="text-blue-400 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">AI 검토 진행 중</p>
                      <p className="text-sm text-slate-400 mt-1">
                        지침 항목 분석 · 오타 탐지 중...
                      </p>
                      {reportFiles.length > 1 && (
                        <p className="text-xs text-slate-500 mt-2">
                          {reportFiles.length}개 파일 처리 중
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {result && !isReviewing && <ReviewResultView result={result} onExport={handleExport} />}

              {!result && !isReviewing && (
                <div className="glass-card rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/[0.03]">
                    <FileSearch size={32} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-400">
                      검토 결과가 여기에 표시됩니다
                    </p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      좌측에서 검토 기준과 보고서 파일을 선택한 후
                      <br />
                      AI 검토 시작 버튼을 눌러주세요
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    {[
                      { num: "01", text: "검토 기준 선택" },
                      { num: "02", text: "보고서 업로드" },
                      { num: "03", text: "AI 검토 시작" },
                    ].map(({ num, text }) => (
                      <div key={num} className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-600">{num}</span>
                        </div>
                        <span className="text-xs text-slate-600">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
