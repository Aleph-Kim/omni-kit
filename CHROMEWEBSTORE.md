# 크롬 웹 스토어 등록 순서 (OmniKit)

> 마지막 수정: 2026-11-24

1.0.1(결제, 광고 없음) 첫 등록 기준. 대시보드 화면 순서대로 어디를 눌러 무엇을 넣는지 정리. 메뉴와 칸 이름은 OmniView 등록(2026-11-19) 때 확인한 한국어 화면 기준이며 괄호 안은 영어 화면 이름

## 제출 전 남은 일

- [x] 아이콘 16, 32, 48, 128px PNG 만들고 manifest에 연결
- [x] 확장 설명(`appDesc`)에서 아직 없는 기능(전체 페이지 스크린샷) 문구 빼기
- [x] 스크린샷 2장 (1280x800), `store-assets/`에 저장
- [x] 개인정보처리방침을 구글 문서로 만들고 링크 공유(링크가 있는 모든 사용자 보기) 후 주소 채우기
- [x] 게시자 이름과 공개 연락 이메일 채우기 (둘 다 dev.aleph.kim@gmail.com)

## 준비물

- 업로드할 파일: `npm run package`로 만든 `omni-kit-1.0.1.zip`
- 스토어 아이콘: `public/icons/icon-128.png`
- 스크린샷: `store-assets/screenshot-light.png`, `store-assets/screenshot-dark.png` (1280x800)
- 개인정보처리방침 주소: 구글 문서 "OmniKit Privacy Policy"의 링크 공유 주소 (링크가 있는 모든 사용자 보기 권한, 로그인 없이 열림 확인)
  `https://docs.google.com/document/d/1XemSNDAWv9wfWYxrJtoz5U8VORFr2NuJjwyqCF605Uk/edit?usp=sharing`

## 1단계. zip 올리기

1. https://chrome.google.com/webstore/devconsole 접속
2. 오른쪽 위 **새 항목 추가 (Add new item)** 클릭
3. **파일 선택**으로 `omni-kit-1.0.1.zip` 선택 후 **업로드**

이름, 짧은 설명, 버전, 권한은 zip에서 자동으로 읽어 오므로 입력하지 않음. 짧은 설명은 `appDesc`이므로 고치려면 번역 파일을 수정하고 zip을 다시 올림

언어별 이름(`appName`, 75자 이내)과 짧은 설명(`appDesc`, 132자 이내)은 `public/_locales/<언어>/messages.json`에 있음. 글자 수 제한은 `npm run check`의 테스트가 검사

제출 전에 zip을 바꿔야 하면 왼쪽 메뉴 **패키지**에서 **새 패키지 업로드**로 다시 올림. 이미 입력한 내용은 유지됨

## 2단계. 스토어 등록정보 (Store listing)

### 2-1. 설명 (Description)

화면 위쪽 언어 선택 목록에서 언어를 고른 뒤 붙여 넣기, 13개 언어를 하나씩 반복. 스토어가 마크다운을 지우므로 줄바꿈만 사용

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

ja

```
よく使うブックマークをキーボードショートカットひとつで開けます。

機能
最大9個のショートカットスロットに、それぞれブックマークを1つ割り当てられます。
割り当てていないスロットはブックマークバーの順番に従います。ブックマークバーの最初のブックマークは最初のショートカットで開きます。フォルダは飛ばします。
同じページがすでにタブで開いている場合は、新しく開かずにそのタブへ移動します。
ポップアップには各スロットのサイトアイコンと名前が表示され、ブックマークを検索して割り当てられます。

使い方
1. Mac は Option+1、Windows は Alt+Shift+1 を押すと、ブックマークバーの最初のブックマークが開きます。
2. 別のブックマークを割り当てるには、OmniKit アイコンをクリックしてスロットを選び、ブックマークを検索します。
3. スロット5〜9のショートカットは、ポップアップから開く Chrome のショートカット設定画面で設定します。

プライバシー
すべてのデータはお使いのデバイス内にとどまります。OmniKit はブックマークやタブなどのデータを外部に送信せず、分析ツールや広告もありません。
```

zh_CN

```
只需一个键盘快捷键，即可打开常用书签。

功能
最多 9 个快捷键槽位，每个槽位关联一个书签。
未设置的槽位按书签栏顺序对应：书签栏上的第一个书签用第一个快捷键打开。文件夹会被跳过。
如果该页面已在某个标签页中打开，OmniKit 会切换到那个标签页，而不是重复打开。
弹出窗口会显示每个槽位的网站图标和名称，并可搜索书签进行关联。

使用方法
1. 在 Mac 上按 Option+1，在 Windows 上按 Alt+Shift+1，即可打开书签栏上的第一个书签。
2. 如需关联其他书签，请点击 OmniKit 图标，选择槽位并搜索书签。
3. 槽位 5 到 9 的快捷键可在 Chrome 快捷键设置页面中设置，该页面可从弹出窗口打开。

隐私
所有数据都保留在你的设备上。OmniKit 不会将书签、标签页或任何其他数据发送到任何地方，也没有分析工具或广告。
```

zh_TW

```
只要一個鍵盤快速鍵，就能開啟常用書籤。

功能
最多 9 個快速鍵欄位，每個欄位連結一個書籤。
未設定的欄位會依照書籤列的順序對應：書籤列上的第一個書籤用第一個快速鍵開啟。資料夾會略過。
如果該頁面已在某個分頁中開啟，OmniKit 會切換到該分頁，而不會重複開啟。
彈出式視窗會顯示每個欄位的網站圖示和名稱，並可搜尋書籤進行連結。

使用方式
1. 在 Mac 上按 Option+1，在 Windows 上按 Alt+Shift+1，即可開啟書籤列上的第一個書籤。
2. 若要連結其他書籤，請點選 OmniKit 圖示，選擇欄位並搜尋書籤。
3. 欄位 5 到 9 的快速鍵可在 Chrome 快速鍵設定頁面中設定，該頁面可從彈出式視窗開啟。

隱私權
所有資料都只留在你的裝置上。OmniKit 不會將書籤、分頁或任何其他資料傳送到任何地方，也沒有分析工具或廣告。
```

es

```
Abre tus marcadores favoritos con un solo atajo de teclado.

Funciones
Hasta 9 ranuras de atajos, cada una vinculada a un marcador.
Las ranuras que no hayas configurado siguen el orden de tu barra de marcadores: el primer marcador de la barra se abre con el primer atajo. Las carpetas se omiten.
Si la página ya está abierta en una pestaña, OmniKit cambia a esa pestaña en lugar de abrir una copia.
La ventana emergente muestra cada ranura con el icono y el nombre del sitio, y te permite buscar en tus marcadores para elegir uno.

Cómo usarlo
1. Pulsa Option+1 en Mac o Alt+Shift+1 en Windows para abrir el primer marcador de tu barra de marcadores.
2. Para vincular otro marcador, haz clic en el icono de OmniKit, elige una ranura y busca un marcador.
3. Los atajos de las ranuras 5 a 9 se configuran en la página de atajos de Chrome, que puedes abrir desde la ventana emergente.

Privacidad
Todo se queda en tu dispositivo. OmniKit no envía tus marcadores, pestañas ni ningún otro dato a ninguna parte, y no tiene analíticas ni anuncios.
```

pt_BR

```
Abra seus favoritos preferidos com um único atalho de teclado.

Recursos
Até 9 espaços de atalho, cada um vinculado a um favorito.
Os espaços que você não definiu seguem a ordem da barra de favoritos: o primeiro favorito da barra abre com o primeiro atalho. Pastas são ignoradas.
Se a página já estiver aberta em uma guia, o OmniKit muda para essa guia em vez de abrir uma cópia.
O pop-up mostra cada espaço com o ícone e o nome do site e permite pesquisar seus favoritos para escolher um.

Como usar
1. Pressione Option+1 no Mac ou Alt+Shift+1 no Windows para abrir o primeiro favorito da barra de favoritos.
2. Para vincular outro favorito, clique no ícone do OmniKit, escolha um espaço e pesquise um favorito.
3. Os atalhos dos espaços 5 a 9 são definidos na página de atalhos do Chrome, que pode ser aberta pelo pop-up.

Privacidade
Tudo fica no seu dispositivo. O OmniKit não envia seus favoritos, guias nem nenhum outro dado para lugar nenhum e não tem análises nem anúncios.
```

de

```
Öffne deine Lieblingslesezeichen mit einem einzigen Tastenkürzel.

Funktionen
Bis zu 9 Kürzel-Plätze, jeder mit einem Lesezeichen verknüpft.
Nicht belegte Plätze folgen der Reihenfolge deiner Lesezeichenleiste: Das erste Lesezeichen der Leiste öffnet sich mit dem ersten Kürzel. Ordner werden übersprungen.
Ist die Seite schon in einem Tab geöffnet, wechselt OmniKit zu diesem Tab, statt sie doppelt zu öffnen.
Das Pop-up zeigt jeden Platz mit Website-Symbol und Namen und lässt dich deine Lesezeichen durchsuchen, um eines auszuwählen.

So funktioniert es
1. Drücke Option+1 auf dem Mac oder Alt+Umschalt+1 unter Windows, um das erste Lesezeichen deiner Lesezeichenleiste zu öffnen.
2. Um ein anderes Lesezeichen zu verknüpfen, klicke auf das OmniKit-Symbol, wähle einen Platz und suche nach einem Lesezeichen.
3. Kürzel für die Plätze 5 bis 9 legst du auf der Chrome-Seite für Tastenkürzel fest, die du über das Pop-up öffnest.

Datenschutz
Alles bleibt auf deinem Gerät. OmniKit sendet deine Lesezeichen, Tabs und andere Daten nirgendwohin und enthält weder Analysetools noch Werbung.
```

fr

```
Ouvrez vos favoris préférés avec un seul raccourci clavier.

Fonctionnalités
Jusqu'à 9 emplacements de raccourci, chacun lié à un favori.
Les emplacements non définis suivent l'ordre de votre barre de favoris : le premier favori de la barre s'ouvre avec le premier raccourci. Les dossiers sont ignorés.
Si la page est déjà ouverte dans un onglet, OmniKit bascule vers cet onglet au lieu d'ouvrir un doublon.
La fenêtre pop-up affiche chaque emplacement avec l'icône et le nom du site, et vous permet de rechercher dans vos favoris pour en choisir un.

Utilisation
1. Appuyez sur Option+1 sur Mac ou Alt+Maj+1 sous Windows pour ouvrir le premier favori de votre barre de favoris.
2. Pour lier un autre favori, cliquez sur l'icône OmniKit, choisissez un emplacement et recherchez un favori.
3. Les raccourcis des emplacements 5 à 9 se définissent sur la page des raccourcis de Chrome, accessible depuis la fenêtre pop-up.

Confidentialité
Tout reste sur votre appareil. OmniKit n'envoie vos favoris, vos onglets ni aucune autre donnée nulle part, et ne contient ni outil d'analyse ni publicité.
```

id

```
Buka bookmark favorit dengan satu pintasan keyboard.

Fitur
Hingga 9 slot pintasan, masing-masing terhubung ke satu bookmark.
Slot yang belum diatur mengikuti urutan bilah bookmark: bookmark pertama di bilah terbuka dengan pintasan pertama. Folder dilewati.
Jika halaman sudah terbuka di sebuah tab, OmniKit berpindah ke tab itu alih-alih membuka duplikat.
Popup menampilkan setiap slot dengan ikon dan nama situs, dan Anda dapat mencari bookmark untuk memilihnya.

Cara menggunakan
1. Tekan Option+1 di Mac atau Alt+Shift+1 di Windows untuk membuka bookmark pertama di bilah bookmark.
2. Untuk menghubungkan bookmark lain, klik ikon OmniKit, pilih slot, lalu cari bookmark.
3. Pintasan untuk slot 5 sampai 9 diatur di halaman pintasan Chrome, yang dapat dibuka dari popup.

Privasi
Semua data tetap di perangkat Anda. OmniKit tidak mengirim bookmark, tab, atau data lain ke mana pun, dan tidak memiliki analitik atau iklan.
```

vi

```
Mở dấu trang yêu thích chỉ bằng một phím tắt.

Tính năng
Tối đa 9 ô phím tắt, mỗi ô gắn với một dấu trang.
Các ô chưa đặt sẽ theo thứ tự trên thanh dấu trang: dấu trang đầu tiên trên thanh mở bằng phím tắt đầu tiên. Thư mục được bỏ qua.
Nếu trang đã mở trong một thẻ, OmniKit sẽ chuyển sang thẻ đó thay vì mở thêm một bản.
Cửa sổ bật lên hiển thị biểu tượng và tên trang web của từng ô, và cho phép tìm dấu trang để chọn.

Cách dùng
1. Nhấn Option+1 trên Mac hoặc Alt+Shift+1 trên Windows để mở dấu trang đầu tiên trên thanh dấu trang.
2. Để gắn dấu trang khác, nhấp vào biểu tượng OmniKit, chọn một ô rồi tìm dấu trang.
3. Phím tắt cho ô 5 đến 9 được đặt trong trang phím tắt của Chrome, có thể mở từ cửa sổ bật lên.

Quyền riêng tư
Mọi dữ liệu đều ở lại trên thiết bị của bạn. OmniKit không gửi dấu trang, thẻ hay bất kỳ dữ liệu nào khác đi đâu cả, và không có công cụ phân tích hay quảng cáo.
```

hi

```
अपने पसंदीदा बुकमार्क एक ही कीबोर्ड शॉर्टकट से खोलें।

सुविधाएं
9 तक शॉर्टकट स्लॉट, हर स्लॉट एक बुकमार्क से जुड़ा।
जिन स्लॉट को आपने सेट नहीं किया है, वे बुकमार्क बार के क्रम का पालन करते हैं: बार का पहला बुकमार्क पहले शॉर्टकट से खुलता है। फ़ोल्डर छोड़ दिए जाते हैं।
अगर पेज पहले से किसी टैब में खुला है, तो OmniKit नया खोलने के बजाय उसी टैब पर ले जाता है।
पॉपअप हर स्लॉट को साइट के आइकन और नाम के साथ दिखाता है, और बुकमार्क खोजकर चुनने देता है।

इस्तेमाल का तरीका
1. बुकमार्क बार का पहला बुकमार्क खोलने के लिए Mac पर Option+1 या Windows पर Alt+Shift+1 दबाएं।
2. कोई दूसरा बुकमार्क जोड़ने के लिए OmniKit आइकन पर क्लिक करें, स्लॉट चुनें और बुकमार्क खोजें।
3. स्लॉट 5 से 9 के शॉर्टकट Chrome के शॉर्टकट पेज पर सेट किए जाते हैं, जिसे पॉपअप से खोला जा सकता है।

निजता
सारा डेटा आपके डिवाइस पर ही रहता है। OmniKit आपके बुकमार्क, टैब या कोई भी दूसरा डेटा कहीं नहीं भेजता, और इसमें कोई एनालिटिक्स या विज्ञापन नहीं है।
```

ar

```
افتح إشاراتك المرجعية المفضلة باختصار واحد من لوحة المفاتيح.

الميزات
حتى 9 خانات للاختصارات، كل خانة مرتبطة بإشارة مرجعية واحدة.
الخانات التي لم تعيّنها تتبع ترتيب شريط الإشارات المرجعية: أول إشارة في الشريط تُفتح بالاختصار الأول. يتم تخطي المجلدات.
إذا كانت الصفحة مفتوحة بالفعل في علامة تبويب، ينتقل OmniKit إلى تلك العلامة بدلًا من فتح نسخة مكررة.
تعرض النافذة المنبثقة كل خانة مع رمز الموقع واسمه، وتتيح لك البحث في إشاراتك المرجعية لاختيار إحداها.

طريقة الاستخدام
1. اضغط Option+1 على Mac أو Alt+Shift+1 على Windows لفتح أول إشارة مرجعية في شريط الإشارات.
2. لربط إشارة مرجعية أخرى، انقر على رمز OmniKit واختر خانة وابحث عن إشارة مرجعية.
3. يمكن تعيين اختصارات الخانات من 5 إلى 9 في صفحة اختصارات Chrome، التي تفتحها من النافذة المنبثقة.

الخصوصية
تبقى كل البيانات على جهازك. لا يرسل OmniKit إشاراتك المرجعية أو علامات التبويب أو أي بيانات أخرى إلى أي مكان، ولا يحتوي على أدوات تحليل أو إعلانات.
```

### 2-2. 나머지 칸

| 칸 | 넣을 값 |
|---|---|
| 카테고리 (Category) | 도구 (Tools), 생산성은 묶음 제목이라 고를 수 없고 그 아래 항목 중 선택 |
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

개인정보처리방침 본문 (구글 문서에 영어 다음 한국어 순서로 넣음)

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

```
OmniKit 개인정보처리방침

최종 수정일: 2026년 11월 24일

OmniKit이 사용하는 데이터
OmniKit은 북마크를 단축키로 열고 팝업에서 검색할 수 있도록 북마크를 읽습니다. 단축키를 누르면 같은 페이지가 이미 열린 탭으로 이동하려고 열려 있는 탭의 주소를 확인합니다. 사이트 아이콘은 크롬이 기기에 이미 저장해 둔 것을 보여 줍니다. 이 모든 처리는 기기 안에서 이루어집니다.

데이터 저장
OmniKit이 저장하는 것은 단축키 칸마다 연결한 북마크뿐입니다. 이 정보는 기기에만 저장되며 동기화하거나 업로드하지 않습니다.

데이터 공유
OmniKit은 어떤 데이터도 기기 밖으로 보내지 않습니다. 분석 도구, 광고, 외부 서비스를 사용하지 않으며 데이터를 공유하거나 판매하지 않습니다.

데이터 삭제
팝업에서 칸을 비우면 그 칸에 저장된 북마크가 지워지고, 확장 프로그램을 삭제하면 저장된 모든 데이터가 지워집니다.

방침 변경
이 방침이 바뀌면 새 날짜와 함께 바뀐 내용을 이 주소에 올립니다.

문의
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
- 항목 ID: `lfjjclkojbgjgjbjjpfippbjbemjmoci`

## 버전 기록

| 버전 | 날짜 | 변경 | 상태 |
|---|---|---|---|
| 1.0.0 | 2026-11-24 | 북마크 단축키 첫 제출 (en, ko) | 13개 언어를 넣으려고 리뷰 취소 |
| 1.0.1 | 2026-11-24 | 13개 언어 추가, 아랍어 화면 좌우 반전 | 검토 대기 중 (2026-11-24 제출, 통과하면 자동 게시) |

## 심사 참고

- 기본 단축키는 크롬 제한으로 1~4번 칸만 지정, 5~9번은 사용자가 직접 지정
- `tabs` 권한은 `activeTab`으로 대체 가능한지 물을 수 있음, 모든 창의 열린 탭을 찾아야 해서 대체 불가 (권한 사유에 포함)
