# 보고서 검토 앱 (Report Review App) — 계획서

**작성일:** 2026-03-04
**상태:** 초안 (Draft)

---

## 1. 프로젝트 개요

### 목적
작성된 보고서 파일을 지침(가이드라인) 파일과 자동 비교하여:
- 지침 준수 여부를 항목별로 검토
- 오타·오기·문법 오류를 탐지
- 교정 제안 및 검토 결과 리포트를 생성

### 기대 효과
- 수동 검토 시간 단축
- 누락 항목·형식 오류의 일관된 탐지
- 보고서 품질 표준화

---

## 2. 핵심 기능

| 번호 | 기능 | 설명 |
|------|------|------|
| F-01 | 파일 업로드 | 보고서 파일 + 지침 파일 업로드 (.docx, .pdf, .txt, .md) |
| F-02 | 지침 준수 검토 | AI가 지침의 각 항목을 추출하고 보고서와 대조 |
| F-03 | 오타·오기 탐지 | 맞춤법, 오탈자, 비표준 용어 감지 |
| F-04 | 검토 결과 리포트 | 항목별 Pass/Fail, 문제 위치, 교정 제안 출력 |
| F-05 | 리포트 내보내기 | 결과를 PDF 또는 Markdown 파일로 다운로드 |

---

## 3. 기술 스택

### Frontend
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **파일 업로드:** react-dropzone
- **UI 컴포넌트:** shadcn/ui

### Backend
- **Runtime:** Node.js 22 (Next.js API Routes)
- **AI 엔진:** Claude API (claude-sonnet-4-6) — 지침 준수 분석 + 오타 탐지
- **파일 파싱:**
  - `.docx` → mammoth (Word → HTML/Text)
  - `.pdf` → pdf-parse
  - `.txt` / `.md` → 직접 읽기

### 인프라 (향후)
- **배포:** Vercel (Frontend + API)
- **저장소:** 파일은 서버 메모리 처리 (업로드 파일 저장 안 함, 개인정보 보호)

---

## 4. 시스템 아키텍처

```
[사용자]
   │
   ├── 보고서 파일 업로드
   └── 지침 파일 업로드
         │
         ▼
[Next.js Frontend]
   - 파일 선택 UI
   - 검토 결과 표시
         │
         ▼
[Next.js API Route: /api/review]
   1. 파일 파싱 (mammoth / pdf-parse)
   2. 텍스트 추출
   3. Claude API 호출
         │
         ▼
[Claude API]
   - 지침 항목 추출
   - 보고서 vs 지침 비교 분석
   - 오타·오기 탐지
   - JSON 형식으로 결과 반환
         │
         ▼
[결과 화면]
   - 항목별 Check 결과
   - 오류 위치 + 교정 제안
   - 전체 점수 / 등급
   - PDF 내보내기
```

---

## 5. Claude API 프롬프트 전략

### 역할 분리 (2-pass 방식)

**Pass 1 — 지침 파싱:**
```
지침 파일에서 검토 항목을 구조화된 JSON으로 추출:
{ "rules": [{ "id": "R01", "category": "형식", "rule": "제목은 굵게 표시" }] }
```

**Pass 2 — 보고서 검토:**
```
추출된 규칙 목록과 보고서 텍스트를 함께 전달하여:
- 각 규칙별 준수 여부 (pass/fail/partial)
- 문제가 발견된 위치(문장/단락)
- 오타·오기 목록
- 교정 제안
를 JSON으로 반환
```

### 출력 형식 (JSON Schema)
```json
{
  "summary": { "total": 10, "pass": 7, "fail": 2, "partial": 1, "score": 75 },
  "rules": [
    {
      "id": "R01",
      "rule": "제목은 굵게 표시",
      "status": "fail",
      "location": "3페이지 2번 항목",
      "suggestion": "제목 텍스트에 Bold 서식 적용 필요"
    }
  ],
  "typos": [
    {
      "original": "기술직원",
      "corrected": "기술 직원",
      "location": "5페이지 3번째 줄"
    }
  ]
}
```

---

## 6. 화면 구성

```
┌─────────────────────────────────────────────┐
│         보고서 검토 앱                       │
├─────────────────────────────────────────────┤
│  [1단계] 파일 업로드                         │
│  ┌──────────────┐  ┌──────────────┐         │
│  │  보고서 파일  │  │  지침 파일   │         │
│  │  드래그&드롭  │  │  드래그&드롭  │         │
│  └──────────────┘  └──────────────┘         │
│            [ 검토 시작 ]                     │
├─────────────────────────────────────────────┤
│  [2단계] 검토 결과                           │
│  ■ 전체 점수: 75점 / 100점                  │
│                                             │
│  ✅ R01. 제목 형식 — 통과                   │
│  ❌ R02. 날짜 표기 — 불일치 → 교정 제안     │
│  ⚠️  R03. 서명란 — 부분 충족               │
│                                             │
│  오타/오기 목록                              │
│  • "기술직원" → "기술 직원" (5p 3줄)        │
│                                             │
│  [ PDF 내보내기 ]  [ Markdown 내보내기 ]    │
└─────────────────────────────────────────────┘
```

---

## 7. 디렉터리 구조

```
MY-OFFICE-/
├── src/
│   ├── app/
│   │   ├── page.tsx                # 메인 페이지 (업로드 + 결과)
│   │   ├── layout.tsx
│   │   └── api/
│   │       └── review/
│   │           └── route.ts        # 검토 API 엔드포인트
│   ├── components/
│   │   ├── FileUploader.tsx        # 파일 업로드 UI
│   │   ├── ReviewResult.tsx        # 결과 표시 컴포넌트
│   │   ├── RuleItem.tsx            # 규칙별 결과 행
│   │   └── TypoList.tsx            # 오타 목록
│   ├── lib/
│   │   ├── file-parser.ts          # 파일 파싱 (docx/pdf/txt)
│   │   ├── claude-client.ts        # Claude API 클라이언트
│   │   └── review-prompt.ts        # 프롬프트 템플릿
│   └── types/
│       └── review.ts               # TypeScript 타입 정의
├── docs/
│   └── plan.md                     # 이 파일
├── .env.example
├── package.json
└── CLAUDE.md
```

---

## 8. 개발 단계 (Milestones)

### Phase 1 — 기본 동작 (MVP)
- [ ] Next.js 프로젝트 초기화
- [ ] 파일 업로드 UI 구현
- [ ] 파일 파싱 (txt, md 우선)
- [ ] Claude API 연동 + 기본 검토 프롬프트
- [ ] 결과 화면 구현 (텍스트 형태)

### Phase 2 — 파일 형식 확장
- [ ] .docx 파싱 (mammoth)
- [ ] .pdf 파싱 (pdf-parse)
- [ ] 결과 UI 개선 (항목별 아코디언)

### Phase 3 — 리포트 내보내기
- [ ] 결과 PDF 생성 (jsPDF 또는 Puppeteer)
- [ ] Markdown 내보내기

### Phase 4 — 품질 개선
- [ ] 검토 정확도 향상 (프롬프트 튜닝)
- [ ] 처리 속도 최적화 (스트리밍 응답)
- [ ] 에러 처리 강화

---

## 9. 환경 변수

```bash
# .env.example
ANTHROPIC_API_KEY=your-claude-api-key-here
MAX_FILE_SIZE_MB=10
```

---

## 10. 리스크 및 고려사항

| 리스크 | 대응 방안 |
|--------|-----------|
| 대용량 파일 처리 | 파일 크기 제한 (10MB), 청크 분할 처리 |
| Claude API 응답 지연 | 스트리밍 응답 + 로딩 UI |
| 민감 문서 보안 | 서버에 파일 저장 안 함, HTTPS 전송 |
| 지침 파일 형식 다양성 | 자유 형식 텍스트도 AI가 자동 파싱 |
| 비용 관리 | 토큰 사용량 모니터링, 요청당 상한선 설정 |

---

*계획서 작성: 2026-03-04*
