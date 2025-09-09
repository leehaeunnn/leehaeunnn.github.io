# 수학 문제 자동 채점 시스템

이 프로젝트는 학생들이 제출한 수학 문제 풀이를 자동으로 채점하는 웹 애플리케이션입니다.

## 기능

- 학교급, 학년별 수학 문제 관리
- 문제와 학생 답안 업로드 및 관리
- 학생 풀이 단계별 자동 채점
- 채점 결과 확인 및 피드백 제공

## 설치 및 실행 방법

### 필요 조건

- Node.js (v14 이상)
- npm 또는 yarn
- MongoDB

### 설치

1. 저장소 복제
```
git clone [repository-url]
cd math-scoring-system
```

2. 의존성 설치
```
npm install
# 또는
yarn install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수를 설정합니다:
```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. 개발 서버 실행
```
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 기술 스택

- Frontend: React.js (Next.js)
- Backend: Node.js + Express.js (Next.js API 라우트)
- 데이터베이스: MongoDB
- 스타일링: Tailwind CSS 