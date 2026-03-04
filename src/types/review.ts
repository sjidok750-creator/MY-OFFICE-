export interface GuidelineInfo {
  version: string;
  updatedAt: string;
  title: string;
  status: "loaded" | "loading" | "error";
}

export interface RuleResult {
  id: string;
  /** "overall" = 최초 종합 검토, "detail" = 세부사항 검토 */
  category: "overall" | "detail";
  rule: string;
  status: "pass" | "fail" | "partial";
  location?: string;
  suggestion?: string;
}

export interface TypoItem {
  original: string;
  corrected: string;
  location: string;
}

export interface ReviewSummary {
  total: number;
  pass: number;
  fail: number;
  partial: number;
  score: number;
}

export interface ReviewResult {
  guideline: { version: string; updatedAt: string };
  summary: ReviewSummary;
  rules: RuleResult[];
  typos: TypoItem[];
}
