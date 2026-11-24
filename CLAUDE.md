# OmniKit

크롬을 쓸 때 필요한 기능(북마크 단축키, 전체 페이지 스크린샷 등)을 모아둔 크롬 확장. 형제 프로젝트 `../omni-view`의 구성을 기반으로 시작

## 구성

- Manifest V3, Vite + CRXJS + React 19 + Tailwind 4 + TypeScript, 테스트는 vitest
- 아이콘은 아직 없음 (OmniView 로고를 쓰지 않으려고 manifest에서 생략, 크롬 기본 아이콘 표시)
- 언어는 `public/_locales`의 en(기본)과 ko, 화면 문구는 `src/i18n.ts`의 `t()`로 `chrome.i18n` 사용

## 명령

- `npm run check`: 타입 검사, 테스트, 빌드를 차례로 실행
- `npm run package`: check 후 `dist`를 zip으로 묶음
- 크롬 확인: `chrome://extensions`에서 `dist` 폴더를 압축해제된 확장으로 로드. manifest의 기본 단축키를 바꿨다면 새로고침이 아니라 삭제 후 다시 로드해야 반영됨

## 구조

- `manifest.config.ts`: manifest 정의
- `src/background/index.ts`: 서비스 워커, 각 기능의 백그라운드 처리를 연결만 함
- `src/popup/`: 툴바 아이콘 팝업, 등록된 기능마다 제목과 Panel을 섹션으로 표시
- `src/features/index.ts`: 기능 등록 목록 (`id`, `titleKey`, `Panel`)
- `src/features/<id>/`: 기능별 코드 (`Panel.tsx`, `background.ts`, 저장 로직과 테스트)

## 기능 추가 방법

1. `src/features/<id>/`에 코드를 만들고 `src/features/index.ts`에 등록
2. 백그라운드 처리가 있으면 `src/background/index.ts`에서 연결
3. 필요한 권한은 최소로 `manifest.config.ts`에 추가
4. 새 문구는 en과 ko 양쪽에 같은 키로 추가 (`src/locales.test.ts`가 누락을 검사)

## 북마크 단축키 (`src/features/bookmark-shortcuts`)

- 9칸, 칸마다 크롬 북마크 하나를 연결하고 단축키로 새 탭에서 열기
- 연결은 북마크 id로 `chrome.storage.local`에 저장 (북마크 제목이나 주소를 고쳐도 따라감)
- 기본 단축키는 1~4번 칸만: Mac은 Option+숫자, 그 외는 Alt+Shift+숫자. 크롬이 기본 단축키를 4개까지만 허용해서 5~9번은 사용자가 `chrome://extensions/shortcuts`에서 지정
- 빈 칸, 삭제된 북마크, 열 수 없는 주소(javascript: 북마클릿 등)는 아이콘에 빨간 `!` 배지를 잠깐 표시

## 남은 일

- 북마크 단축키를 크롬에 로드해서 직접 확인하지 않음
- 전체 페이지 스크린샷 등 다른 기능은 아직 없음
- 아이콘과 스토어 등록 문서(CHROMEWEBSTORE.md)는 아직 없음
