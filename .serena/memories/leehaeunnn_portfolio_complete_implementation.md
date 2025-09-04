# 이하은 포트폴리오 사이트 완전 구현 기록

## 프로젝트 개요
- **저장소**: https://github.com/leehaeunnn/leehaeunnn.github.io
- **라이브 사이트**: https://leehaeunnn.github.io
- **작업 날짜**: 2025-08-28
- **주요 개발자**: 이하은 (leehaeunnn)
- **Git 설정**: 
  - Name: leehaeunnn
  - Email: leehan090301@gmail.com

## 구현된 주요 기능

### 1. AI 수학 채점 시스템 (Math Scoring System)
**URL**: https://leehaeunnn.github.io/math-scoring-upload.html

#### 기술 스택
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI API**: Google Gemini 2.5 Pro API
- **이미지 처리**: Base64 인코딩, FileReader API
- **보안**: GitHub Actions Secrets를 통한 API 키 관리

#### 핵심 기능
1. **드래그 앤 드롭 파일 업로드**
   - 3개 이미지 동시 업로드 (문제, 정답, 학생답안)
   - 파일 유효성 검사 (이미지 타입, 최대 10MB)
   - 실시간 미리보기
   - 드래그 오버 시각적 피드백

2. **Gemini API 통합**
   ```javascript
   // API 호출 구조
   const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=${apiKey}`, {
       method: 'POST',
       body: JSON.stringify({
           contents: [{
               parts: [
                   { text: "채점 요청..." },
                   { inline_data: { mime_type: "image/jpeg", data: base64 }}
               ]
           }]
       })
   });
   ```

3. **GitHub Actions 자동 배포**
   - `.github/workflows/deploy.yml` 설정
   - API 키 자동 주입 (api-config.js 생성)
   - 보안 파일 자동 정리

#### 파일 구조
```
math-scoring-upload.html - 메인 UI 및 로직
.github/workflows/deploy.yml - CI/CD 파이프라인
.gitignore - 보안 파일 제외
SETUP_API_KEYS.md - API 키 설정 가이드
```

### 2. 포물선 운동 시뮬레이터
**URL**: https://leehaeunnn.github.io/projectile-simulator.html

#### 구현 내용
- Canvas 기반 실시간 물리 시뮬레이션
- 조절 가능한 파라미터:
  - 초기 속도: 10-100 m/s
  - 발사 각도: 0-90도
  - 중력 가속도: 1-20 m/s²
  - 초기 높이: 0-50m
- 실시간 운동 정보 표시
- 궤적, 속도 벡터, 격자 표시 옵션

#### 물리 엔진 코드
```javascript
// 물리 계산 (60 FPS)
projectile.vy += gravity * dt;
projectile.x += projectile.vx * dt * 5;
projectile.y += projectile.vy * dt * 5;
trajectory.push({ x: projectile.x, y: projectile.y });
```

### 3. AI 채팅봇 시스템
**URL**: https://leehaeunnn.github.io/chatbot.html

#### 특징
- 규칙 기반 응답 시스템 (API 없음)
- 실시간 채팅 인터페이스
- 타이핑 애니메이션
- 빠른 답변 버튼
- 한글 단어 줄바꿈 문제 해결 (word-break: keep-all)

### 4. 사이트 디자인 개선
#### 변경 사항
- 헤더 패딩: 10rem → 6rem
- 섹션 간격: 4rem → 2.5rem
- 색상 스킴: 다크 모던 테마
  - Primary: #1a1a2e
  - Accent: #e94560
  - Background: #f5f5f5
- 네비게이션: 슬림화, 투명도 효과

## 기술적 해결 과제

### 1. API 키 보안 문제
**문제**: GitHub Pages는 정적 호스팅으로 환경변수 사용 불가
**해결**: GitHub Actions + Secrets 조합
```yaml
# deploy.yml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
run: |
  echo "const API_CONFIG = { GEMINI_API_KEY: '${GEMINI_API_KEY}' };" > api-config.js
```

### 2. 파일 업로드 버튼 활성화 문제
**문제**: DOMContentLoaded 이벤트 순서 문제로 파일 업로드가 인식되지 않음
**해결**: 모든 초기화 코드를 DOMContentLoaded 내부로 이동
```javascript
document.addEventListener('DOMContentLoaded', function() {
    handleFileUpload(...);
    setupGradeButton();
    checkAllFilesUploaded();
});
```

### 3. 한글 텍스트 줄바꿈 문제
**문제**: word-wrap: break-word로 인한 한글 단어 중간 줄바꿈
**해결**: CSS 속성 변경
```css
word-break: keep-all;
word-wrap: normal;
white-space: pre-wrap;
```

## 프로젝트 파일 구조
```
leehaeunnn.github.io/
├── index.html                  # 메인 페이지
├── en.html                     # 영문 페이지
├── chatbot.html                # AI 채팅봇
├── math-scoring-upload.html    # 수학 채점 시스템
├── projectile-simulator.html   # 포물선 운동 시뮬레이터
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── .gitignore                  # 보안 파일 제외
├── SETUP_API_KEYS.md          # API 설정 가이드
└── math-scoring/              # 원본 Python 프로젝트 파일
    └── projectile-motion/     # 원본 Python 비디오 분석기
```

## GitHub Actions Secrets 설정
1. 저장소 Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `GEMINI_API_KEY`
4. Value: Google AI Studio에서 발급받은 API 키

## 주요 커밋 히스토리
- "Complete site redesign and add functional math scoring upload demo"
- "Add interactive projectile motion simulator"
- "Setup GitHub Actions for secure API key deployment"
- "Add drag and drop file upload functionality"
- "Fix file upload detection and button activation issue"

## 향후 개선 사항
1. Vercel/Netlify로 마이그레이션 (서버사이드 API 키 관리)
2. 실제 백엔드 서버 구축 (Python Flask/FastAPI)
3. 데이터베이스 연동 (채점 결과 저장)
4. 사용자 인증 시스템
5. 실시간 협업 기능

## 보안 고려사항
- API 키는 절대 코드에 직접 포함하지 않음
- .gitignore로 민감한 파일 제외
- GitHub Actions Secrets 사용
- CORS 정책 준수
- 파일 업로드 크기 제한 (10MB)

## 브라우저 호환성
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 모바일 반응형 지원

## 성능 최적화
- 이미지 지연 로딩
- CSS/JS 최소화
- CDN 사용 (Font Awesome, Google Fonts)
- Canvas 애니메이션 requestAnimationFrame 사용

## 접근성
- 시맨틱 HTML5 태그 사용
- ARIA 레이블
- 키보드 네비게이션 지원
- 색상 대비 WCAG 2.1 AA 준수

이 프로젝트는 이하은 학생의 포트폴리오 사이트로, 전남과학고등학교 재학 중 개발한 다양한 프로젝트를 소개하고 실제로 체험할 수 있는 인터랙티브 웹 애플리케이션입니다.