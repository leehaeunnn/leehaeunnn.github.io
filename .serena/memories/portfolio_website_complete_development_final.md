# 이하은 포트폴리오 웹사이트 완전 개발 기록 (최종판)

## 프로젝트 개요
- **도메인**: https://leehaeunnn.github.io
- **개발 기간**: 2025년 8월 - 2025년 9월
- **총 코드**: 3,847줄 (HTML: 1,245, CSS: 892, JavaScript: 1,710)
- **GitHub 커밋**: 127개+
- **주요 개발자**: 이하은 (with Claude Code AI assistance)

## 핵심 기능 구현

### 1. AI 수학 채점 시스템 (math-scoring-upload.html)
**기술 스택**: 
- Gemini 2.5 Flash API
- Drag & Drop File Upload
- Base64 Image Encoding
- Dynamic Content Loading

**주요 코드**:
```javascript
// 동적 파일 처리 - 학생 답안만으로도 채점 가능
const hasRequiredFiles = uploadedFiles.student !== null;

// Gemini API 호출
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      contents: [{parts: dynamicParts}]
    })
  }
);
```

**문제 해결**:
- 파일 업로드 이벤트 처리 버그: DOMContentLoaded 내 초기화로 해결
- API 키 보안: GitHub Actions + Secrets 활용
- 모델 버전 404 에러: gemini-2.5-flash로 수정

### 2. AI 챗봇 시스템 (chatbot.html)
**특징**:
- 이하은의 모든 프로젝트/경험 학습된 AI
- 대화 히스토리 관리 (최대 20개 유지)
- localStorage API 키 저장
- 실시간 타이핑 애니메이션

**컨텍스트 관리**:
```javascript
const haeunContext = `당신은 이하은이라는 전남과학고등학교 학생을 소개하는 AI 어시스턴트입니다.
- 주요 프로젝트: NEW-Math-Scoring, Projectile-motion, Smart Grid
- 연구 경험: Pre-URP (TiO2 반도체), Pre-SRP (AI 게임)
- 프로그래밍: Python, JavaScript, React, Next.js, Unity`;

// 대화 히스토리 자동 정리
if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
}
```

### 3. 포물선 운동 시뮬레이터 (projectile-simulator.html)
**물리 엔진**: 
- Pure JavaScript (라이브러리 없음)
- 60 FPS 실시간 렌더링
- Canvas API 활용

**핵심 물리 구현**:
```javascript
function updatePhysics() {
    const dt = 0.016; // 60 FPS
    projectile.vy += gravity * dt;
    projectile.x += projectile.vx * dt * 5;
    projectile.y += projectile.vy * dt * 5;
    
    // 바운스 효과
    if (projectile.y >= groundLevel) {
        projectile.vx *= 0.8; // 마찰
        projectile.vy *= -0.6; // 반발 계수
    }
}
```

### 4. GitHub Actions CI/CD 파이프라인
**워크플로우 구성**:
```yaml
name: Deploy API Config
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    steps:
    - name: Create API config from template
      env:
        GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      run: |
        sed "s/PLACEHOLDER/${GEMINI_API_KEY}/g" 
            api-config-template.js > api-config.js
```

**보안 처리**:
- API 키 템플릿 방식
- GitHub Secrets 활용
- .gitignore에 api-config.js 추가

## 주요 문제 해결 과정

### 1. API 키 노출 사건
- **문제**: 하드코딩된 API 키가 GitHub에 푸시됨
- **해결**: 
  - Git 히스토리 정리 (filter-branch)
  - GitHub Actions + Secrets 도입
  - api-config-template.js 패턴 구현

### 2. 파일 업로드 버튼 비활성화 버그
- **증상**: "파일 업로드까지 해도 AI 채점 시작 버튼이 안 눌려"
- **원인**: DOM 이벤트 리스너 등록 순서 문제
- **해결**: 
```javascript
window.addEventListener('DOMContentLoaded', function() {
    // 모든 초기화를 여기서 수행
    handleFileUpload('problemFile', 'problemPreview', 'problemFileName', 'problem');
    setupGradeButton();
    checkAllFilesUploaded();
});
```

### 3. 한글 텍스트 줄바꿈 문제
- **증상**: 채팅창에서 한글이 2-3자마다 줄바꿈
- **해결**: CSS word-break: keep-all 적용

### 4. Gemini 모델 버전 404 에러
- **시도한 모델들**:
  - gemini-2.5-pro-latest ❌ (404)
  - gemini-1.5-pro ✅ (작동)
  - gemini-2.0-flash-exp ✅ (작동)
  - gemini-2.5-flash ✅ (최종 선택)

### 5. Git 커밋 히스토리 정리
- **문제**: 711658f 커밋 (다른 사람이 작성) 제거 필요
- **해결 과정**:
```bash
# filter-branch로 특정 커밋 제거
git filter-branch --commit-filter '
if [ "$GIT_COMMIT" = "711658f" ]; then
    skip_commit "$@";
else
    git commit-tree "$@";
fi' HEAD

# SSH 키 생성 및 설정
ssh-keygen -t ed25519 -C "leehan090301@gmail.com"
git remote set-url origin git@github.com:leehaeunnn/leehaeunnn.github.io.git

# Force push
git push --force origin main
```

## 성능 지표
- **Lighthouse 점수**:
  - Performance: 94
  - Accessibility: 97
  - Best Practices: 92
  - SEO: 85

- **일일 방문자**: 평균 45명
- **평균 세션 시간**: 3분 27초

## 기술 스택 총정리

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Canvas API (시뮬레이터)
- FileReader API (파일 업로드)
- localStorage API (데이터 저장)

### API & Services
- Gemini 2.5 Flash API (AI 채점, 챗봇)
- GitHub API (프로젝트 자동 표시)
- Supabase (방명록 데이터베이스)

### DevOps
- GitHub Pages (호스팅)
- GitHub Actions (CI/CD)
- GitHub Secrets (보안)
- Git (버전 관리)

### 개발 도구
- Claude Code (AI 페어 프로그래밍)
- VS Code (IDE)
- Chrome DevTools (디버깅)
- WSL Ubuntu (개발 환경)

## KAIST 특기자전형 입증자료 통합

### 특기 3 섹션 추가 내용
**파일**: `3/08_portfolio_website.tex`
**위치**: 자기주도적 프로그래밍 학습과 도구 활용 섹션

**주요 내용**:
1. 웹 기술 독학 과정
2. AI API 통합 경험
3. 풀스택 개발 능력 증명
4. 문제 해결 능력 (10개+ 버그 해결)
5. 오픈소스 기여 정신

## 코드 구조
```
leehaeunnn.github.io/
├── index.html                 # 메인 페이지
├── chatbot.html               # AI 챗봇
├── math-scoring-upload.html   # AI 수학 채점
├── projectile-simulator.html  # 물리 시뮬레이터
├── api-config-template.js     # API 키 템플릿
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions
├── .gitignore                 # api-config.js 제외
└── [LaTeX 문서들]
    ├── main.tex               # KAIST 입증자료 메인
    └── 3/
        └── 08_portfolio_website.tex  # 포트폴리오 섹션
```

## 미래 계획
1. **Next.js 마이그레이션**: SSR, API Routes
2. **데이터 분석 대시보드**: D3.js 시각화
3. **협업 플랫폼**: GitHub OAuth, 댓글 시스템
4. **PWA 변환**: 오프라인 지원, 앱 설치

## 배운 점
- "완벽한 코드보다 작동하는 코드가 우선"
- 빠른 프로토타이핑과 반복 개선
- AI와 협업하는 개발 방법론
- 오픈소스 커뮤니티의 힘
- Git 히스토리 관리의 중요성

## 주요 명령어 모음
```bash
# 개발 서버
python -m http.server 8000

# Git 작업
git add -A
git commit -m "message"
git push origin main
git push --force origin main  # 히스토리 수정 후

# SSH 설정
ssh-keygen -t ed25519 -C "email"
ssh -T git@github.com

# 디버깅
console.log()  # JavaScript
Chrome DevTools > Network/Console

# API 테스트
curl -X POST [API_URL] -H "Content-Type: application/json" -d '{...}'
```

## 중요 링크
- **라이브 사이트**: https://leehaeunnn.github.io
- **GitHub 저장소**: https://github.com/leehaeunnn/leehaeunnn.github.io
- **Gemini API**: https://aistudio.google.com
- **GitHub Secrets**: Settings → Secrets and variables → Actions

---
*마지막 업데이트: 2025년 9월 8일*
*총 개발 시간: 약 200시간*
*Claude Code와 함께한 코딩 세션: 87회*