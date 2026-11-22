# 햄스터봇 자율주행 AI 프로젝트 기획서

초등학생들이 **'햄스터봇과 함께하는 자율주행 AI 모험'** 수업을 마친 뒤, 로그인 없이 자신만의 자율주행 자동차 프로젝트를 기획하고 **A4 세로형 PDF**로 저장하거나 **구글 시트**에 학급 결과물을 모아 볼 수 있는 교육용 웹 애플리케이션입니다.

## 주요 기능

- **Zero-Login 교실형 워크스페이스**: 회원가입/로그인 없이 접속 즉시 작성 가능
- **실시간 A4 기획서 미리보기**: 좌측 작성 폼 입력 내용이 우측 A4 문서에 실시간 반영
- **기술 다중 선택 및 직접 추가**: 하드웨어·센서 기술(5종)과 엔트리 AI 기술(6종) 구분 선택 + 커스텀 추가
- **A4 PDF 다운로드**: `팀명_프로젝트명_기획서.pdf` 자동 생성 및 저장
- **구글 시트 연동 (CRUD)**: Google Apps Script 웹 앱 URL 연동으로 저장·불러오기·수정·삭제 지원 (미연동 시 브라우저 `localStorage` 자동 지원)
- **학생용 원클릭 공유 링크**: 선생님이 구글 시트 URL을 연결한 뒤 `?gas=...` 공유 링크를 배포하면 학생들이 별도 설정 없이 바로 제출 가능

---

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

---

## GitHub Pages 자동 배포 방법

이 저장소에는 `.github/workflows/deploy.yml` 자동 배포 워크플로우가 포함되어 있습니다.

1. 이 프로젝트 코드를 본인의 GitHub 저장소(`main` 또는 `master` 브랜치)에 푸시합니다.
2. GitHub 저장소 상단 **[Settings] → [Pages]** 로 이동합니다.
3. **Build and deployment → Source** 를 반드시 **GitHub Actions** 로 선택합니다.
   - *주의*: `Deploy from a branch (main / root)`로 두면 React/TypeScript 원본 파일(`index.html` → `/src/main.tsx`)이 그대로 열려 **흰 화면**이 나옵니다.
4. *(선택)* 학생들이 접속하자마자 선생님의 구글 시트에 자동 연결되도록 하려면:
   - **[Settings] → [Secrets and variables] → [Actions] → [Variables]** 탭으로 이동
   - **New repository variable** 클릭
   - Name: `VITE_GAS_WEB_APP_URL`
   - Value: 배포한 Google Apps Script 웹 앱 URL (`https://script.google.com/macros/s/.../exec`)
5. **Actions** 탭에서 워크플로우가 완료되면 발급된 GitHub Pages 주소로 바로 접속할 수 있습니다.

> **참고**: 환경변수를 설정하지 않고 배포한 경우에도, 배포된 페이지의 **시트 설정(톱니바퀴)** 창에서 구글 시트 URL을 입력한 뒤 **[학생용 공유 링크 복사]** 버튼을 눌러 학생들에게 링크를 전달할 수 있습니다.

## Vercel / Netlify 배포

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **환경변수 (선택)**: `VITE_GAS_WEB_APP_URL` = Google Apps Script 웹 앱 URL
