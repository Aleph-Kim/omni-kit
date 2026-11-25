# OmniKit

[English](../README.md) | **한국어** | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

크롬을 쓸 때 필요한 기능을 모아 둔 크롬 확장, 13개 언어 지원

![팝업](../store-assets/screenshot-light.png)

## 기능

### 북마크 단축키

- 단축키로 북마크 9칸을 새 탭에서 열기
- 칸마다 북마크를 직접 고르거나, 고르지 않으면 북마크바의 같은 순서 북마크 사용
- 같은 주소의 탭이 이미 열려 있으면 그 탭으로 이동
- 기본 단축키는 1번에서 4번 칸 (Mac은 Option+숫자, 그 외는 Alt+Shift+숫자), 5번에서 9번은 `chrome://extensions/shortcuts`에서 지정

### 캡처

- 선택 영역, 요소 선택, 보이는 화면, 전체 페이지 4가지 방식 (팝업과 우클릭 메뉴)
- 전체 페이지와 긴 요소는 스크롤하며 여러 장을 찍어 이어 붙임, 고정 머리글은 숨김
- 편집 화면에서 글자, 화살표, 펜, 도형, 모자이크, 흐림, 아이콘, 자르기로 꾸미기
- PNG, JPEG, WebP로 다운로드, 클립보드 복사

![편집 화면](../store-assets/screenshot-editor.png)

## 개인정보

- 외부 서버로 보내는 데이터 없음
- 찍은 그림은 이 컴퓨터의 브라우저 저장소에만 두고, 편집 탭을 닫으면 삭제
- 캡처 권한은 툴바 아이콘이나 우클릭 메뉴를 누른 탭에만 적용 (`activeTab`)

## 직접 빌드

Node.js 20.19 이상 필요

```sh
npm install
npm run build
```

1. 크롬에서 `chrome://extensions` 열기
2. 개발자 모드 켜기
3. 압축해제된 확장 프로그램을 로드합니다를 눌러 `dist` 폴더 선택

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run check` | 타입 검사, 테스트, 빌드 |
| `npm run package` | 스토어 제출용 zip 만들기 |

## 기술

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## 라이선스

[MIT](../LICENSE)

함께 쓰는 라이브러리(konva, react-konva, Lucide)의 라이선스는 [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
