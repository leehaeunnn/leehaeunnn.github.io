# GitHub Actions API 키 설정 가이드

## 1. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사 (AIzaSy... 형식)

## 2. GitHub Secrets 설정

1. GitHub 저장소 페이지로 이동: https://github.com/leehaeunnn/leehaeunnn.github.io

2. **Settings** 탭 클릭

3. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭

4. **New repository secret** 버튼 클릭

5. 다음 정보 입력:
   - **Name**: `GEMINI_API_KEY`
   - **Secret**: 발급받은 API 키 (AIzaSy로 시작하는 키)

6. **Add secret** 클릭

## 3. GitHub Actions 활성화 확인

1. 저장소의 **Actions** 탭 클릭
2. "Deploy with API Keys" 워크플로우가 보이는지 확인
3. 만약 Actions가 비활성화되어 있다면 활성화

## 4. 자동 배포 테스트

1. 아무 파일이나 수정 후 commit & push
2. Actions 탭에서 워크플로우 실행 확인
3. 녹색 체크 표시가 나타나면 성공

## 5. 수동 배포 (선택사항)

1. Actions 탭으로 이동
2. "Deploy with API Keys" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. "Run workflow" 확인

## 보안 주의사항

⚠️ **절대 하지 말아야 할 것들:**
- API 키를 코드에 직접 입력하지 마세요
- API 키를 commit 메시지에 포함하지 마세요
- API 키를 공개 저장소에 올리지 마세요

✅ **안전한 방법:**
- GitHub Secrets 사용
- 환경 변수로 관리
- .gitignore에 민감한 파일 추가

## 문제 해결

### API 키가 작동하지 않는 경우:
1. Secrets 이름이 정확한지 확인 (`GEMINI_API_KEY`)
2. API 키가 유효한지 확인
3. Actions 로그에서 오류 메시지 확인

### Actions가 실패하는 경우:
1. Actions 탭에서 실패한 워크플로우 클릭
2. 오류 메시지 확인
3. 필요시 워크플로우 파일 수정

## 지원

문제가 있으면 Issues 탭에 문의하세요.