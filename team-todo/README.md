# 팀 투두 (Team Todo)

실시간 팀 협업 투두 앱 — Vite + React + Tailwind CSS + Firebase Firestore

## 기능

- 링크 공유만으로 팀원 초대 (로그인 불필요)
- 닉네임 입력 후 바로 사용 (localStorage 저장)
- 할 일 추가 / 완료 체크 / 삭제
- 누가 추가했는지 이름 표시
- Firestore 실시간 동기화
- 모바일 반응형

## 시작하기

```bash
cd team-todo
cp .env.example .env
# .env에 Firebase 설정 입력

npm install
npm run dev
```

## Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 Firestore Database 생성
2. 보안 규칙 설정 (개발용):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. `.env` 파일에 Firebase config 값 입력

## 프로덕션 배포

```bash
npm run build
# dist/ 폴더를 Firebase Hosting, Vercel, Netlify 등에 배포
```
