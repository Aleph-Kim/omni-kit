# 크롬 웹 스토어 등록 순서 (OmniKit)

> 마지막 수정: 2026-11-24

1.0.0(결제, 광고 없음) 첫 등록 기준. 대시보드 화면 순서대로 어디를 눌러 무엇을 넣는지 정리. 메뉴와 칸 이름은 OmniView 등록(2026-11-19) 때 확인한 한국어 화면 기준이며 괄호 안은 영어 화면 이름

## 제출 전 남은 일

- [x] 아이콘 16, 32, 48, 128px PNG 만들고 manifest에 연결
- [x] 확장 설명(`appDesc`)에서 아직 없는 기능(전체 페이지 스크린샷) 문구 빼기
- [x] 스크린샷 2장 (1280x800), `store-assets/`에 저장
- [x] 개인정보처리방침을 구글 문서로 만들고 링크 공유(링크가 있는 모든 사용자 보기) 후 주소 채우기
- [x] 게시자 이름과 공개 연락 이메일 채우기 (둘 다 dev.aleph.kim@gmail.com)

## 준비물

- 업로드할 파일: `npm run package`로 만든 `omni-kit-1.0.0.zip`
- 스토어 아이콘: `public/icons/icon-128.png`
- 스크린샷: `store-assets/screenshot-light.png`, `store-assets/screenshot-dark.png` (1280x800)
- 개인정보처리방침 주소: 구글 문서 "OmniKit Privacy Policy"의 링크 공유 주소 (링크가 있는 모든 사용자 보기 권한, 로그인 없이 열림 확인)
  `https://docs.google.com/document/d/1-aPlBzz-Nhzss8FJsEQcar6_SAuBXZzZ44C8juDgouk/edit?usp=sharing`

## 1단계. zip 올리기

1. https://chrome.google.com/webstore/devconsole 접속
2. 오른쪽 위 **새 항목 추가 (Add new item)** 클릭
3. **파일 선택**으로 `omni-kit-1.0.0.zip` 선택 후 **업로드**

이름, 짧은 설명, 버전, 권한은 zip에서 자동으로 읽어 오므로 입력하지 않음. 짧은 설명은 `appDesc`이므로 고치려면 번역 파일을 수정하고 zip을 다시 올림

| 언어 | 이름 (`appName`, 75자 이내) | 짧은 설명 (`appDesc`, 132자 이내) |
|---|---|---|
| en | OmniKit - Everyday Browser Tools | Everyday browser tools in one place. Starts with bookmark shortcuts: open favorite bookmarks with Option or Alt+Shift and a number. |
| ko | OmniKit - 매일 쓰는 브라우저 도구 모음 | 자주 쓰는 브라우저 도구 모음입니다. 지금은 북마크 단축키를 지원해 Option(윈도우는 Alt+Shift)과 숫자로 자주 가는 북마크를 바로 엽니다. |

제출 전에 zip을 바꿔야 하면 왼쪽 메뉴 **패키지**에서 **새 패키지 업로드**로 다시 올림. 이미 입력한 내용은 유지됨

## 2단계. 스토어 등록정보 (Store listing)

### 2-1. 설명 (Description)

화면 위쪽 언어 선택 목록에서 언어를 고른 뒤 붙여 넣기, en과 ko 두 번 반복. 스토어가 마크다운을 지우므로 줄바꿈만 사용

en

```
Open your favorite bookmarks with a single keyboard shortcut.

Features
Up to 9 shortcut slots, each linked to one bookmark.
Slots you have not set follow your bookmarks bar in order, so the first bookmark on the bar opens with the first shortcut. Folders are skipped.
If the page is already open in a tab, OmniKit switches to that tab instead of opening a duplicate.
The popup shows each slot with the site icon and name, and lets you search your bookmarks to pick one.

How to use
1. Press Option+1 on Mac or Alt+Shift+1 on Windows to open the first bookmark on your bookmarks bar.
2. To link a different bookmark, click the OmniKit icon, choose a slot and search for a bookmark.
3. Shortcuts for slots 5 to 9 can be set on the Chrome shortcuts page, opened from the popup.

Privacy
Everything stays on your device. OmniKit does not send your bookmarks, tabs or any other data anywhere, and has no analytics or ads.
```

ko

```
자주 가는 북마크를 단축키 하나로 바로 엽니다.

기능
단축키 칸 최대 9개, 칸마다 북마크 하나를 연결합니다.
연결하지 않은 칸은 북마크바 순서를 따릅니다. 북마크바의 첫 번째 북마크는 첫 번째 단축키로 열립니다. 폴더는 건너뜁니다.
같은 페이지가 이미 탭에 열려 있으면 새로 열지 않고 그 탭으로 이동합니다.
팝업에서 칸마다 사이트 아이콘과 이름을 보여 주고, 북마크를 검색해 연결할 수 있습니다.

사용 방법
1. Mac은 Option+1, 윈도우는 Alt+Shift+1을 누르면 북마크바의 첫 번째 북마크가 열립니다.
2. 다른 북마크를 연결하려면 OmniKit 아이콘을 눌러 칸을 고르고 북마크를 검색합니다.
3. 5~9번 칸 단축키는 팝업에서 여는 크롬 단축키 화면에서 지정합니다.

개인정보
모든 데이터는 내 컴퓨터에만 있습니다. 북마크, 탭 등 어떤 데이터도 외부로 보내지 않으며 분석 도구나 광고가 없습니다.
```

### 2-2. 나머지 칸

| 칸 | 넣을 값 |
|---|---|
| 카테고리 (Category) | 생산성 (Productivity) |
| 언어 (Language) | 영어 (English) |
| 스토어 아이콘 (Store icon) | `public/icons/icon-128.png` 업로드 |
| 전 언어 공통 스크린샷 (Global screenshots) | `store-assets/screenshot-light.png`, `store-assets/screenshot-dark.png` 업로드 (언어별 현지화 스크린샷 칸은 비워 둠) |
| 작은 프로모션 타일, 마키 타일, YouTube, 홈페이지 URL, 지원 URL | 비워 둠 (선택 항목) |
| 성인용 콘텐츠 (Mature content) | 끔 |

스크린샷 구성 (실제 빌드한 팝업 화면에 예시 북마크를 넣어 촬영, 개인 북마크 노출 방지)

1. `screenshot-light.png`: 라이트 모드, 9칸에 아이콘과 이름, 단축키가 표시된 팝업
2. `screenshot-dark.png`: 다크 모드, 3번 칸을 펼쳐 북마크를 검색하는 팝업 (크롬 팝업 최대 높이 600px로 자름)

오른쪽 위 **임시저장 (Save draft)** 클릭

## 3단계. 개인정보 보호 (Privacy practices)

### 3-1. 전용 목적 (Single purpose)

```
OmniKit opens the user's chosen bookmarks with keyboard shortcuts.
```

### 3-2. 권한 사유 (Permission justification)

권한 이름이 적힌 칸마다 붙여 넣기. 호스트 권한과 콘텐츠 스크립트는 없어서 해당 칸도 없음

**bookmarks** 칸

```
Reads the user's bookmarks so a keyboard shortcut can open the bookmark linked to each slot, follow the order of the bookmarks bar for slots the user has not set, and let the user search bookmarks in the popup to pick one. Bookmarks are never changed.
```

**tabs** 칸

```
Reads the addresses of open tabs only when a shortcut is pressed, to switch to a tab that already shows the same page instead of opening a duplicate. This must check tabs in every window, so activeTab, which only covers the current tab after a click, cannot replace it. Tab addresses are not stored or sent anywhere.
```

**favicon** 칸

```
Shows each site's icon next to its bookmark in the popup, using the icons Chrome has already saved on the device.
```

**storage** 칸

```
Saves which bookmark the user linked to each shortcut slot in chrome.storage.local. Nothing is sent off the device.
```

### 3-3. 원격 코드 (Remote code)

나오면 **아니요, 원격 코드를 사용하지 않습니다 (No, I am not using remote code)** 선택

### 3-4. 사용자 데이터 사용 (Data usage)

스토어 정책상 기기 안에서만 처리하는 데이터도 공개 대상 (OmniView와 같은 기준)

| 항목 | 체크 | 이유 |
|---|---|---|
| 웹 기록 (Web history) | 체크 | 단축키를 누를 때 열린 탭 주소와 북마크 주소를 기기 안에서 비교 |
| 나머지 (개인 식별 정보, 건강, 금융, 인증, 개인 커뮤니케이션, 위치, 사용자 활동, 웹사이트 콘텐츠) | 체크 안 함 | 처리하지 않음 |

아래 확인 체크박스 3개(데이터 판매 금지, 목적 외 사용 금지, 신용 평가 사용 금지)는 모두 해당하므로 직접 읽고 체크. 하나라도 비면 제출 불가

### 3-5. 개인정보처리방침 (Privacy policy)

**개인정보처리방침 URL** 칸에 준비물의 링크 공유 주소 붙여 넣기. 데이터 체크 항목을 바꾸면 처리방침도 함께 고침

개인정보처리방침 본문

```
Privacy Policy for OmniKit

Last updated: November 24, 2026

What data OmniKit uses
OmniKit reads your bookmarks to open them with keyboard shortcuts and to let you search them in the popup. When you press a shortcut, it checks the addresses of your open tabs to switch to a tab that already shows the same page. It shows site icons that Chrome has already saved on your device. All of this happens on your device.

How data is stored
The only thing OmniKit saves is which bookmark you linked to each shortcut slot. This is stored on your device and is not synced or uploaded.

Data sharing
OmniKit does not send any data off your device. It does not use analytics, ads or any third-party services, and it does not share or sell data.

Data deletion
Unlink a slot in the popup to remove its saved bookmark, or remove the extension to delete all saved data.

Changes to this policy
If this policy changes, the updated version will be posted at this address with a new date.

Contact
dev.aleph.kim@gmail.com
```

오른쪽 위 **임시저장** 클릭

## 4단계. 배포 (Distribution)

| 칸 | 넣을 값 |
|---|---|
| 결제 (Payments) | 무료 (Free of charge) |
| 공개 상태 (Visibility) | 공개 (Public) |
| 배포 (Regions) | 전체 지역 (All regions) |

## 5단계. 테스트 안내 (Test instructions)

로그인이나 테스트 계정 없이 쓸 수 있어 비워 둠

## 6단계. 제출

1. 오른쪽 위 **제출하여 검토받기 (Submit for review)** 클릭
2. 확인 창에서 검토 후 자동 게시 여부 선택
3. 빠진 칸이 있으면 버튼 옆 **제출할 수 없는 이유**로 확인

## 개발자 정보

- 게시자 이름: dev.aleph.kim@gmail.com
- 연락 이메일 (스토어에 공개): dev.aleph.kim@gmail.com

## 버전 기록

| 버전 | 날짜 | 변경 | 상태 |
|---|---|---|---|
| 1.0.0 | 2026-11-24 | 북마크 단축키 첫 공개 | 준비 중 |

## 심사 참고

- 기본 단축키는 크롬 제한으로 1~4번 칸만 지정, 5~9번은 사용자가 직접 지정
- `tabs` 권한은 `activeTab`으로 대체 가능한지 물을 수 있음, 모든 창의 열린 탭을 찾아야 해서 대체 불가 (권한 사유에 포함)
