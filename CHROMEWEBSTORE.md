# 크롬 웹 스토어 등록 순서 (OmniKit)

> 마지막 수정: 2026-11-26

1.1.0(결제, 광고 없음) 기준. 1.0.x는 첫 등록, 1.1.0은 캡처(스크린샷) 기능을 더한 업데이트. 대시보드 화면 순서대로 어디를 눌러 무엇을 넣는지 정리. 메뉴와 칸 이름은 OmniView 등록(2026-11-19) 때 확인한 한국어 화면 기준이며 괄호 안은 영어 화면 이름

## 제출 전 남은 일

- [x] 아이콘 16, 32, 48, 128px PNG 만들고 manifest에 연결
- [x] 확장 설명(`appDesc`)에서 아직 없는 기능(전체 페이지 스크린샷) 문구 빼기
- [x] 스크린샷 2장 (1280x800), `store-assets/`에 저장
- [x] 개인정보처리방침을 구글 문서로 만들고 링크 공유(링크가 있는 모든 사용자 보기) 후 주소 채우기
- [x] 게시자 이름과 공개 연락 이메일 채우기 (둘 다 dev.aleph.kim@gmail.com)
- [x] 캡처 기능을 넣은 다음 버전(1.1.0) 제출 전: 설명, 스크린샷, 전용 목적, 사용자 데이터, 개인정보처리방침 고치기 (권한 사유는 3-2)
- [x] 1.1.0: 개인정보처리방침을 3-5 본문으로 바꾸기 (새 구글 문서를 만들어 주소를 바꿈, 예전 문서는 1.0.x 내용 그대로 남아 있음)

## 준비물

- 업로드할 파일: `npm run package`로 만든 `omni-kit-<버전>.zip` (`dist-release`에서 묶음, 이름이 `OmniKit DEV`가 아닌지 확인)
- 스토어 아이콘: `public/icons/icon-128.png`
- 스크린샷: `store-assets/screenshot-capture.png`, `store-assets/screenshot-editor-hide.png`, `store-assets/screenshot-light.png`, `store-assets/screenshot-dark.png` (1280x800, 이 순서로 올림)
- 개인정보처리방침 주소: 저장소의 `PRIVACY.md` (공개 저장소라 로그인 없이 열림)
  `https://github.com/Aleph-Kim/omni-kit/blob/main/PRIVACY.md` (예전 구글 문서는 1.1.0용 `1sGd32lTq3sTiYn3jhmwASDvhPUfhIt49H4Nvorv1hno`, 1.0.x용 `1XemSNDAWv9wfWYxrJtoz5U8VORFr2NuJjwyqCF605Uk`)
- 홈페이지 주소: `https://github.com/Aleph-Kim/omni-kit`

## 1단계. zip 올리기

이미 등록된 항목의 새 버전(1.1.0 등)은 항목을 열고 왼쪽 메뉴 **패키지**에서 **새 패키지 업로드**로 zip을 올림. 이전 버전이 아직 검토 대기 중이면 먼저 **검토 취소**해야 올릴 수 있음

처음 등록할 때만 아래 순서

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
Everyday browser tools in one place: screenshots and bookmark shortcuts.

Screenshots
Capture a selected area, the visible part or the full page, from the popup or the right-click menu.
Full-page screenshots scroll the page for you. Headers that stay on screen appear only once, and on pages that keep loading more as you scroll, the screenshot stops at what was already loaded.
Download as PNG, JPEG or WebP at full, half or quarter size, copy to the clipboard, or open in a new tab.
Some pages show their content in a frame from another site. For a full-page screenshot of such a page, Chrome asks you once to allow access to that site.

Bookmark shortcuts
Up to 9 shortcut slots, each linked to one bookmark.
Slots you have not set follow your bookmarks bar in order, so the first bookmark on the bar opens with the first shortcut. Folders are skipped.
If the page is already open in a tab, OmniKit switches to that tab instead of opening a duplicate.
The popup shows each slot with the site icon and name, and lets you search your bookmarks to pick one.

How to use
1. To take a screenshot, click the OmniKit icon, open Screenshot and choose Selected area, Visible part or Full page. You can also right-click the page and choose OmniKit capture.
2. Press Option+1 on Mac or Alt+Shift+1 on Windows to open the first bookmark on your bookmarks bar.
3. To link a different bookmark, click the OmniKit icon, choose a slot and search for a bookmark.
4. Shortcuts for slots 5 to 9 can be set on the Chrome shortcuts page, opened from the popup.

Privacy
Everything stays on your device. Screenshots are kept only until you close their tab. OmniKit does not send your screenshots, bookmarks, tabs or any other data anywhere, and has no analytics or ads.

Open source
OmniKit is open source under the MIT License. Source code: https://github.com/Aleph-Kim/omni-kit
```

ko

```
자주 쓰는 브라우저 도구 모음입니다. 스크린샷과 북마크 단축키를 지원합니다.

스크린샷
선택 영역, 보이는 화면, 전체 페이지를 팝업이나 우클릭 메뉴에서 찍습니다.
전체 페이지는 페이지를 알아서 내리며 찍습니다. 화면에 고정된 머리글은 한 번만 나오고, 내릴수록 계속 불러오는 페이지는 이미 불러온 부분까지만 찍습니다.
PNG, JPEG, WebP 형식과 원본, 50%, 25% 크기로 내려받거나, 클립보드에 복사하거나, 새 탭에서 열 수 있습니다.
내용이 다른 사이트의 프레임 안에 있는 페이지는 전체 페이지를 찍을 때 크롬이 그 사이트 접근 허용을 한 번 묻습니다.

북마크 단축키
단축키 칸 최대 9개, 칸마다 북마크 하나를 연결합니다.
연결하지 않은 칸은 북마크바 순서를 따릅니다. 북마크바의 첫 번째 북마크는 첫 번째 단축키로 열립니다. 폴더는 건너뜁니다.
같은 페이지가 이미 탭에 열려 있으면 새로 열지 않고 그 탭으로 이동합니다.
팝업에서 칸마다 사이트 아이콘과 이름을 보여 주고, 북마크를 검색해 연결할 수 있습니다.

사용 방법
1. 스크린샷은 OmniKit 아이콘을 눌러 스크린샷을 펼친 뒤 선택 영역, 보이는 화면, 전체 페이지 중 고릅니다. 페이지에서 우클릭해 OmniKit 캡처를 골라도 됩니다.
2. Mac은 Option+1, 윈도우는 Alt+Shift+1을 누르면 북마크바의 첫 번째 북마크가 열립니다.
3. 다른 북마크를 연결하려면 OmniKit 아이콘을 눌러 칸을 고르고 북마크를 검색합니다.
4. 5번에서 9번 칸 단축키는 팝업에서 여는 크롬 단축키 화면에서 지정합니다.

개인정보
모든 데이터는 내 컴퓨터에만 있습니다. 찍은 스크린샷은 그 탭을 닫을 때까지만 보관합니다. 스크린샷, 북마크, 탭 등 어떤 데이터도 외부로 보내지 않으며 분석 도구나 광고가 없습니다.

오픈소스
OmniKit은 MIT 라이선스로 공개된 오픈소스입니다. 소스 코드: https://github.com/Aleph-Kim/omni-kit
```

ja

```
毎日使うブラウザツールをひとつに。スクリーンショットとブックマークのショートカットを使えます。

スクリーンショット
選択範囲、表示部分、ページ全体を、ポップアップまたは右クリックメニューから撮影できます。
ページ全体はページを自動でスクロールして撮影します。画面に固定されたヘッダーは一度だけ写り、スクロールするたびに読み込みが続くページは、すでに読み込まれた部分までを撮影します。
PNG、JPEG、WebP 形式と、元のサイズ、50%、25% でダウンロードしたり、クリップボードにコピーしたり、新しいタブで開いたりできます。
内容が別のサイトのフレーム内にあるページでは、ページ全体を撮影するときに Chrome がそのサイトへのアクセス許可を一度だけ確認します。

ブックマークのショートカット
最大9個のショートカットスロットに、それぞれブックマークを1つ割り当てられます。
割り当てていないスロットはブックマークバーの順番に従います。ブックマークバーの最初のブックマークは最初のショートカットで開きます。フォルダは飛ばします。
同じページがすでにタブで開いている場合は、新しく開かずにそのタブへ移動します。
ポップアップには各スロットのサイトアイコンと名前が表示され、ブックマークを検索して割り当てられます。

使い方
1. スクリーンショットは、OmniKit アイコンをクリックしてスクリーンショットを開き、選択範囲、表示部分、ページ全体から選びます。ページを右クリックして OmniKit キャプチャを選ぶこともできます。
2. Mac は Option+1、Windows は Alt+Shift+1 を押すと、ブックマークバーの最初のブックマークが開きます。
3. 別のブックマークを割り当てるには、OmniKit アイコンをクリックしてスロットを選び、ブックマークを検索します。
4. スロット5〜9のショートカットは、ポップアップから開く Chrome のショートカット設定画面で設定します。

プライバシー
すべてのデータはお使いのデバイス内にとどまります。撮影したスクリーンショットは、そのタブを閉じるまでだけ保存されます。OmniKit はスクリーンショット、ブックマーク、タブなどのデータを外部に送信せず、分析ツールや広告もありません。

オープンソース
OmniKitはMITライセンスのオープンソースです。ソースコード: https://github.com/Aleph-Kim/omni-kit
```

zh_CN

```
常用浏览器工具合集：截图和书签快捷键。

截图
可通过弹出窗口或右键菜单截取选定区域、可见部分或整个页面。
截取整个页面时会自动滚动页面。固定在屏幕上的页眉只出现一次；对于越滚动越会继续加载内容的页面，只截取已经加载的部分。
可下载为 PNG、JPEG 或 WebP 格式，选择原始、50% 或 25% 尺寸，也可复制到剪贴板或在新标签页中打开。
有些页面的内容位于其他网站的框架中。截取此类页面的整个页面时，Chrome 会询问一次是否允许访问该网站。

书签快捷键
最多 9 个快捷键槽位，每个槽位关联一个书签。
未设置的槽位按书签栏顺序对应：书签栏上的第一个书签用第一个快捷键打开。文件夹会被跳过。
如果该页面已在某个标签页中打开，OmniKit 会切换到那个标签页，而不是重复打开。
弹出窗口会显示每个槽位的网站图标和名称，并可搜索书签进行关联。

使用方法
1. 要截图，请点击 OmniKit 图标，展开截图，然后选择选定区域、可见部分或整个页面。也可以在页面上点击右键，选择 OmniKit 截取。
2. 在 Mac 上按 Option+1，在 Windows 上按 Alt+Shift+1，即可打开书签栏上的第一个书签。
3. 如需关联其他书签，请点击 OmniKit 图标，选择槽位并搜索书签。
4. 槽位 5 到 9 的快捷键可在 Chrome 快捷键设置页面中设置，该页面可从弹出窗口打开。

隐私
所有数据都保留在你的设备上。截图只保留到你关闭它所在的标签页为止。OmniKit 不会将截图、书签、标签页或任何其他数据发送到任何地方，也没有分析工具或广告。

开源
OmniKit 是基于 MIT 许可证的开源软件。源代码: https://github.com/Aleph-Kim/omni-kit
```

zh_TW

```
常用瀏覽器工具合集：螢幕截圖和書籤快速鍵。

螢幕截圖
可從彈出式視窗或右鍵選單擷取選取範圍、可見部分或整個頁面。
擷取整個頁面時會自動捲動頁面。固定在畫面上的頁首只會出現一次；對於越捲動越會繼續載入內容的頁面，只擷取已經載入的部分。
可下載為 PNG、JPEG 或 WebP 格式，選擇原始、50% 或 25% 大小，也可複製到剪貼簿或在新分頁中開啟。
有些頁面的內容位於其他網站的框架中。擷取這類頁面的整個頁面時，Chrome 會詢問一次是否允許存取該網站。

書籤快速鍵
最多 9 個快速鍵欄位，每個欄位連結一個書籤。
未設定的欄位會依照書籤列的順序對應：書籤列上的第一個書籤用第一個快速鍵開啟。資料夾會略過。
如果該頁面已在某個分頁中開啟，OmniKit 會切換到該分頁，而不會重複開啟。
彈出式視窗會顯示每個欄位的網站圖示和名稱，並可搜尋書籤進行連結。

使用方式
1. 若要截圖，請點選 OmniKit 圖示，展開螢幕截圖，然後選擇選取範圍、可見部分或整個頁面。也可以在頁面上按右鍵，選擇 OmniKit 擷取。
2. 在 Mac 上按 Option+1，在 Windows 上按 Alt+Shift+1，即可開啟書籤列上的第一個書籤。
3. 若要連結其他書籤，請點選 OmniKit 圖示，選擇欄位並搜尋書籤。
4. 欄位 5 到 9 的快速鍵可在 Chrome 快速鍵設定頁面中設定，該頁面可從彈出式視窗開啟。

隱私權
所有資料都只留在你的裝置上。螢幕截圖只保留到你關閉它所在的分頁為止。OmniKit 不會將螢幕截圖、書籤、分頁或任何其他資料傳送到任何地方，也沒有分析工具或廣告。

開放原始碼
OmniKit 是以 MIT 授權發布的開放原始碼軟體。原始碼: https://github.com/Aleph-Kim/omni-kit
```

es

```
Herramientas del navegador para el día a día en un solo lugar: capturas de pantalla y atajos de marcadores.

Capturas de pantalla
Captura un área seleccionada, la parte visible o la página completa desde la ventana emergente o el menú contextual.
La captura de página completa desplaza la página por ti. Los encabezados fijos aparecen una sola vez, y en las páginas que cargan más contenido al desplazarte, la captura se detiene en lo que ya estaba cargado.
Descarga en PNG, JPEG o WebP a tamaño original, 50 % o 25 %, cópiala al portapapeles o ábrela en una pestaña nueva.
Algunas páginas muestran su contenido en un marco de otro sitio. Para capturar la página completa en ese caso, Chrome te pide una vez permiso para acceder a ese sitio.

Atajos de marcadores
Hasta 9 ranuras de atajos, cada una vinculada a un marcador.
Las ranuras que no hayas configurado siguen el orden de tu barra de marcadores: el primer marcador de la barra se abre con el primer atajo. Las carpetas se omiten.
Si la página ya está abierta en una pestaña, OmniKit cambia a esa pestaña en lugar de abrir una copia.
La ventana emergente muestra cada ranura con el icono y el nombre del sitio, y te permite buscar en tus marcadores para elegir uno.

Cómo usarlo
1. Para hacer una captura, haz clic en el icono de OmniKit, abre Captura de pantalla y elige Área seleccionada, Parte visible o Página completa. También puedes hacer clic derecho en la página y elegir Captura de OmniKit.
2. Pulsa Option+1 en Mac o Alt+Shift+1 en Windows para abrir el primer marcador de tu barra de marcadores.
3. Para vincular otro marcador, haz clic en el icono de OmniKit, elige una ranura y busca un marcador.
4. Los atajos de las ranuras 5 a 9 se configuran en la página de atajos de Chrome, que puedes abrir desde la ventana emergente.

Privacidad
Todo se queda en tu dispositivo. Las capturas se guardan solo hasta que cierras su pestaña. OmniKit no envía tus capturas, marcadores, pestañas ni ningún otro dato a ninguna parte, y no tiene analíticas ni anuncios.

Código abierto
OmniKit es de código abierto con licencia MIT. Código fuente: https://github.com/Aleph-Kim/omni-kit
```

pt_BR

```
Ferramentas do dia a dia para o navegador em um só lugar: capturas de tela e atalhos de favoritos.

Capturas de tela
Capture uma área selecionada, a parte visível ou a página inteira pelo pop-up ou pelo menu do botão direito.
A captura da página inteira rola a página para você. Cabeçalhos fixos aparecem só uma vez e, em páginas que carregam mais conteúdo conforme você rola, a captura para no que já estava carregado.
Baixe em PNG, JPEG ou WebP no tamanho original, 50% ou 25%, copie para a área de transferência ou abra em uma nova guia.
Algumas páginas mostram o conteúdo em um quadro de outro site. Para capturar a página inteira nesse caso, o Chrome pede uma vez permissão para acessar esse site.

Atalhos de favoritos
Até 9 espaços de atalho, cada um vinculado a um favorito.
Os espaços que você não definiu seguem a ordem da barra de favoritos: o primeiro favorito da barra abre com o primeiro atalho. Pastas são ignoradas.
Se a página já estiver aberta em uma guia, o OmniKit muda para essa guia em vez de abrir uma cópia.
O pop-up mostra cada espaço com o ícone e o nome do site e permite pesquisar seus favoritos para escolher um.

Como usar
1. Para fazer uma captura, clique no ícone do OmniKit, abra Captura de tela e escolha Área selecionada, Parte visível ou Página inteira. Você também pode clicar com o botão direito na página e escolher Captura do OmniKit.
2. Pressione Option+1 no Mac ou Alt+Shift+1 no Windows para abrir o primeiro favorito da barra de favoritos.
3. Para vincular outro favorito, clique no ícone do OmniKit, escolha um espaço e pesquise um favorito.
4. Os atalhos dos espaços 5 a 9 são definidos na página de atalhos do Chrome, que pode ser aberta pelo pop-up.

Privacidade
Tudo fica no seu dispositivo. As capturas ficam guardadas só até você fechar a guia delas. O OmniKit não envia suas capturas, favoritos, guias nem nenhum outro dado para lugar nenhum e não tem análises nem anúncios.

Código aberto
O OmniKit é de código aberto sob a licença MIT. Código-fonte: https://github.com/Aleph-Kim/omni-kit
```

de

```
Browser-Werkzeuge für jeden Tag an einem Ort: Screenshots und Lesezeichen-Kürzel.

Screenshots
Nimm einen ausgewählten Bereich, den sichtbaren Bereich oder die ganze Seite auf, über das Pop-up oder das Kontextmenü.
Bei der ganzen Seite scrollt OmniKit die Seite für dich. Fest stehende Kopfzeilen erscheinen nur einmal, und bei Seiten, die beim Scrollen immer mehr nachladen, endet der Screenshot bei dem, was schon geladen war.
Lade ihn als PNG, JPEG oder WebP in Originalgröße, 50 % oder 25 % herunter, kopiere ihn in die Zwischenablage oder öffne ihn in einem neuen Tab.
Manche Seiten zeigen ihren Inhalt in einem Frame einer anderen Website. Für einen Screenshot der ganzen Seite fragt Chrome dann einmal, ob der Zugriff auf diese Website erlaubt wird.

Lesezeichen-Kürzel
Bis zu 9 Kürzel-Plätze, jeder mit einem Lesezeichen verknüpft.
Nicht belegte Plätze folgen der Reihenfolge deiner Lesezeichenleiste: Das erste Lesezeichen der Leiste öffnet sich mit dem ersten Kürzel. Ordner werden übersprungen.
Ist die Seite schon in einem Tab geöffnet, wechselt OmniKit zu diesem Tab, statt sie doppelt zu öffnen.
Das Pop-up zeigt jeden Platz mit Website-Symbol und Namen und lässt dich deine Lesezeichen durchsuchen, um eines auszuwählen.

So funktioniert es
1. Für einen Screenshot klicke auf das OmniKit-Symbol, öffne Screenshot und wähle Ausgewählter Bereich, Sichtbarer Bereich oder Ganze Seite. Du kannst auch mit der rechten Maustaste auf die Seite klicken und OmniKit-Aufnahme wählen.
2. Drücke Option+1 auf dem Mac oder Alt+Umschalt+1 unter Windows, um das erste Lesezeichen deiner Lesezeichenleiste zu öffnen.
3. Um ein anderes Lesezeichen zu verknüpfen, klicke auf das OmniKit-Symbol, wähle einen Platz und suche nach einem Lesezeichen.
4. Kürzel für die Plätze 5 bis 9 legst du auf der Chrome-Seite für Tastenkürzel fest, die du über das Pop-up öffnest.

Datenschutz
Alles bleibt auf deinem Gerät. Screenshots werden nur aufbewahrt, bis du ihren Tab schließt. OmniKit sendet deine Screenshots, Lesezeichen, Tabs und andere Daten nirgendwohin und enthält weder Analysetools noch Werbung.

Open Source
OmniKit ist Open Source unter der MIT-Lizenz. Quellcode: https://github.com/Aleph-Kim/omni-kit
```

fr

```
Des outils de navigation pour tous les jours, réunis au même endroit : captures d'écran et raccourcis de favoris.

Captures d'écran
Capturez une zone sélectionnée, la partie visible ou la page entière depuis la fenêtre pop-up ou le menu contextuel.
La capture de la page entière fait défiler la page pour vous. Les en-têtes fixes n'apparaissent qu'une fois et, sur les pages qui chargent du contenu au fil du défilement, la capture s'arrête à ce qui était déjà chargé.
Téléchargez-la en PNG, JPEG ou WebP en taille d'origine, 50 % ou 25 %, copiez-la dans le presse-papiers ou ouvrez-la dans un nouvel onglet.
Certaines pages affichent leur contenu dans un cadre provenant d'un autre site. Pour capturer la page entière dans ce cas, Chrome vous demande une fois d'autoriser l'accès à ce site.

Raccourcis de favoris
Jusqu'à 9 emplacements de raccourci, chacun lié à un favori.
Les emplacements non définis suivent l'ordre de votre barre de favoris : le premier favori de la barre s'ouvre avec le premier raccourci. Les dossiers sont ignorés.
Si la page est déjà ouverte dans un onglet, OmniKit bascule vers cet onglet au lieu d'ouvrir un doublon.
La fenêtre pop-up affiche chaque emplacement avec l'icône et le nom du site, et vous permet de rechercher dans vos favoris pour en choisir un.

Utilisation
1. Pour faire une capture, cliquez sur l'icône OmniKit, ouvrez Capture d'écran et choisissez Zone sélectionnée, Partie visible ou Page entière. Vous pouvez aussi faire un clic droit sur la page et choisir Capture OmniKit.
2. Appuyez sur Option+1 sur Mac ou Alt+Maj+1 sous Windows pour ouvrir le premier favori de votre barre de favoris.
3. Pour lier un autre favori, cliquez sur l'icône OmniKit, choisissez un emplacement et recherchez un favori.
4. Les raccourcis des emplacements 5 à 9 se définissent sur la page des raccourcis de Chrome, accessible depuis la fenêtre pop-up.

Confidentialité
Tout reste sur votre appareil. Les captures ne sont conservées que jusqu'à la fermeture de leur onglet. OmniKit n'envoie vos captures, vos favoris, vos onglets ni aucune autre donnée nulle part, et ne contient ni outil d'analyse ni publicité.

Open source
OmniKit est open source sous licence MIT. Code source : https://github.com/Aleph-Kim/omni-kit
```

id

```
Alat browser sehari-hari dalam satu tempat: tangkapan layar dan pintasan bookmark.

Tangkapan layar
Ambil area terpilih, bagian yang terlihat, atau seluruh halaman dari popup atau menu klik kanan.
Tangkapan seluruh halaman menggulir halaman untuk Anda. Header yang tetap di layar hanya muncul sekali, dan pada halaman yang terus memuat konten saat digulir, tangkapan berhenti di bagian yang sudah dimuat.
Unduh sebagai PNG, JPEG, atau WebP dalam ukuran asli, 50%, atau 25%, salin ke papan klip, atau buka di tab baru.
Beberapa halaman menampilkan kontennya dalam bingkai dari situs lain. Untuk menangkap seluruh halaman seperti itu, Chrome meminta izin sekali untuk mengakses situs tersebut.

Pintasan bookmark
Hingga 9 slot pintasan, masing-masing terhubung ke satu bookmark.
Slot yang belum diatur mengikuti urutan bilah bookmark: bookmark pertama di bilah terbuka dengan pintasan pertama. Folder dilewati.
Jika halaman sudah terbuka di sebuah tab, OmniKit berpindah ke tab itu alih-alih membuka duplikat.
Popup menampilkan setiap slot dengan ikon dan nama situs, dan Anda dapat mencari bookmark untuk memilihnya.

Cara menggunakan
1. Untuk mengambil tangkapan layar, klik ikon OmniKit, buka Tangkapan layar, lalu pilih Area terpilih, Bagian yang terlihat, atau Seluruh halaman. Anda juga bisa klik kanan pada halaman dan memilih Tangkapan OmniKit.
2. Tekan Option+1 di Mac atau Alt+Shift+1 di Windows untuk membuka bookmark pertama di bilah bookmark.
3. Untuk menghubungkan bookmark lain, klik ikon OmniKit, pilih slot, lalu cari bookmark.
4. Pintasan untuk slot 5 sampai 9 diatur di halaman pintasan Chrome, yang dapat dibuka dari popup.

Privasi
Semua data tetap di perangkat Anda. Tangkapan layar hanya disimpan sampai tabnya ditutup. OmniKit tidak mengirim tangkapan layar, bookmark, tab, atau data lain ke mana pun, dan tidak memiliki analitik atau iklan.

Sumber terbuka
OmniKit adalah perangkat lunak sumber terbuka dengan Lisensi MIT. Kode sumber: https://github.com/Aleph-Kim/omni-kit
```

vi

```
Bộ công cụ trình duyệt dùng hằng ngày: chụp màn hình và phím tắt dấu trang.

Chụp màn hình
Chụp vùng đã chọn, phần đang hiển thị hoặc toàn trang từ cửa sổ bật lên hoặc menu chuột phải.
Khi chụp toàn trang, OmniKit tự cuộn trang. Phần đầu trang cố định chỉ xuất hiện một lần, và với những trang càng cuộn càng tải thêm nội dung, ảnh chụp dừng ở phần đã được tải.
Tải xuống dạng PNG, JPEG hoặc WebP ở kích thước gốc, 50% hoặc 25%, sao chép vào bộ nhớ tạm hoặc mở trong thẻ mới.
Một số trang hiển thị nội dung trong khung của trang web khác. Khi chụp toàn trang như vậy, Chrome sẽ hỏi một lần để cho phép truy cập trang web đó.

Phím tắt dấu trang
Tối đa 9 ô phím tắt, mỗi ô gắn với một dấu trang.
Các ô chưa đặt sẽ theo thứ tự trên thanh dấu trang: dấu trang đầu tiên trên thanh mở bằng phím tắt đầu tiên. Thư mục được bỏ qua.
Nếu trang đã mở trong một thẻ, OmniKit sẽ chuyển sang thẻ đó thay vì mở thêm một bản.
Cửa sổ bật lên hiển thị biểu tượng và tên trang web của từng ô, và cho phép tìm dấu trang để chọn.

Cách dùng
1. Để chụp màn hình, nhấp vào biểu tượng OmniKit, mở Ảnh chụp màn hình rồi chọn Vùng đã chọn, Phần đang hiển thị hoặc Toàn trang. Bạn cũng có thể nhấp chuột phải vào trang và chọn Chụp bằng OmniKit.
2. Nhấn Option+1 trên Mac hoặc Alt+Shift+1 trên Windows để mở dấu trang đầu tiên trên thanh dấu trang.
3. Để gắn dấu trang khác, nhấp vào biểu tượng OmniKit, chọn một ô rồi tìm dấu trang.
4. Phím tắt cho ô 5 đến 9 được đặt trong trang phím tắt của Chrome, có thể mở từ cửa sổ bật lên.

Quyền riêng tư
Mọi dữ liệu đều ở lại trên thiết bị của bạn. Ảnh chụp chỉ được giữ đến khi bạn đóng thẻ của nó. OmniKit không gửi ảnh chụp, dấu trang, thẻ hay bất kỳ dữ liệu nào khác đi đâu cả, và không có công cụ phân tích hay quảng cáo.

Mã nguồn mở
OmniKit là phần mềm mã nguồn mở theo Giấy phép MIT. Mã nguồn: https://github.com/Aleph-Kim/omni-kit
```

hi

```
रोज़ काम आने वाले ब्राउज़र टूल एक ही जगह: स्क्रीनशॉट और बुकमार्क शॉर्टकट।

स्क्रीनशॉट
पॉपअप या राइट-क्लिक मेनू से चुना हुआ हिस्सा, दिखने वाला हिस्सा या पूरा पेज कैप्चर करें।
पूरे पेज का स्क्रीनशॉट लेते समय OmniKit पेज को अपने आप स्क्रॉल करता है। स्क्रीन पर टिके रहने वाले हेडर सिर्फ़ एक बार आते हैं, और जो पेज स्क्रॉल करने पर और सामग्री लोड करते रहते हैं, उनमें स्क्रीनशॉट उतने ही हिस्से तक रुकता है जितना पहले से लोड था।
PNG, JPEG या WebP में मूल आकार, 50% या 25% पर डाउनलोड करें, क्लिपबोर्ड पर कॉपी करें या नए टैब में खोलें।
कुछ पेज अपनी सामग्री किसी दूसरी साइट के फ़्रेम में दिखाते हैं। ऐसे पेज का पूरा स्क्रीनशॉट लेने पर Chrome एक बार उस साइट तक पहुंच की अनुमति मांगता है।

बुकमार्क शॉर्टकट
9 तक शॉर्टकट स्लॉट, हर स्लॉट एक बुकमार्क से जुड़ा।
जिन स्लॉट को आपने सेट नहीं किया है, वे बुकमार्क बार के क्रम का पालन करते हैं: बार का पहला बुकमार्क पहले शॉर्टकट से खुलता है। फ़ोल्डर छोड़ दिए जाते हैं।
अगर पेज पहले से किसी टैब में खुला है, तो OmniKit नया खोलने के बजाय उसी टैब पर ले जाता है।
पॉपअप हर स्लॉट को साइट के आइकन और नाम के साथ दिखाता है, और बुकमार्क खोजकर चुनने देता है।

इस्तेमाल का तरीका
1. स्क्रीनशॉट लेने के लिए OmniKit आइकन पर क्लिक करें, स्क्रीनशॉट खोलें और चुना हुआ हिस्सा, दिखने वाला हिस्सा या पूरा पेज चुनें। आप पेज पर राइट-क्लिक करके OmniKit कैप्चर भी चुन सकते हैं।
2. बुकमार्क बार का पहला बुकमार्क खोलने के लिए Mac पर Option+1 या Windows पर Alt+Shift+1 दबाएं।
3. कोई दूसरा बुकमार्क जोड़ने के लिए OmniKit आइकन पर क्लिक करें, स्लॉट चुनें और बुकमार्क खोजें।
4. स्लॉट 5 से 9 के शॉर्टकट Chrome के शॉर्टकट पेज पर सेट किए जाते हैं, जिसे पॉपअप से खोला जा सकता है।

निजता
सारा डेटा आपके डिवाइस पर ही रहता है। स्क्रीनशॉट सिर्फ़ तब तक रखे जाते हैं जब तक आप उनका टैब बंद नहीं करते। OmniKit आपके स्क्रीनशॉट, बुकमार्क, टैब या कोई भी दूसरा डेटा कहीं नहीं भेजता, और इसमें कोई एनालिटिक्स या विज्ञापन नहीं है।

ओपन सोर्स
OmniKit, MIT लाइसेंस के तहत ओपन सोर्स है। सोर्स कोड: https://github.com/Aleph-Kim/omni-kit
```

ar

```
أدوات المتصفح اليومية في مكان واحد: لقطات الشاشة واختصارات الإشارات المرجعية.

لقطات الشاشة
التقط المنطقة المحددة أو الجزء المرئي أو الصفحة كاملة من النافذة المنبثقة أو من قائمة النقر بزر الماوس الأيمن.
عند التقاط الصفحة كاملة، يمرّر OmniKit الصفحة نيابةً عنك. تظهر الرؤوس الثابتة على الشاشة مرة واحدة فقط، وفي الصفحات التي تواصل تحميل المزيد كلما مرّرت، تتوقف اللقطة عند ما كان قد تم تحميله بالفعل.
نزّلها بصيغة PNG أو JPEG أو WebP بالحجم الأصلي أو 50% أو 25%، أو انسخها إلى الحافظة، أو افتحها في علامة تبويب جديدة.
تعرض بعض الصفحات محتواها داخل إطار من موقع آخر. لالتقاط الصفحة كاملة في هذه الحالة، يطلب Chrome منك مرة واحدة السماح بالوصول إلى ذلك الموقع.

اختصارات الإشارات المرجعية
حتى 9 خانات للاختصارات، كل خانة مرتبطة بإشارة مرجعية واحدة.
الخانات التي لم تعيّنها تتبع ترتيب شريط الإشارات المرجعية: أول إشارة في الشريط تُفتح بالاختصار الأول. يتم تخطي المجلدات.
إذا كانت الصفحة مفتوحة بالفعل في علامة تبويب، ينتقل OmniKit إلى تلك العلامة بدلًا من فتح نسخة مكررة.
تعرض النافذة المنبثقة كل خانة مع رمز الموقع واسمه، وتتيح لك البحث في إشاراتك المرجعية لاختيار إحداها.

طريقة الاستخدام
1. لالتقاط لقطة شاشة، انقر على رمز OmniKit وافتح لقطة شاشة ثم اختر المنطقة المحددة أو الجزء المرئي أو الصفحة كاملة. يمكنك أيضًا النقر بزر الماوس الأيمن على الصفحة واختيار التقاط OmniKit.
2. اضغط Option+1 على Mac أو Alt+Shift+1 على Windows لفتح أول إشارة مرجعية في شريط الإشارات.
3. لربط إشارة مرجعية أخرى، انقر على رمز OmniKit واختر خانة وابحث عن إشارة مرجعية.
4. يمكن تعيين اختصارات الخانات من 5 إلى 9 في صفحة اختصارات Chrome، التي تفتحها من النافذة المنبثقة.

الخصوصية
تبقى كل البيانات على جهازك. تُحفظ لقطات الشاشة فقط حتى تغلق علامة التبويب الخاصة بها. لا يرسل OmniKit لقطات الشاشة أو إشاراتك المرجعية أو علامات التبويب أو أي بيانات أخرى إلى أي مكان، ولا يحتوي على أدوات تحليل أو إعلانات.

مفتوح المصدر
OmniKit مفتوح المصدر بموجب ترخيص MIT. الشيفرة المصدرية: https://github.com/Aleph-Kim/omni-kit
```

### 2-2. 나머지 칸

| 칸 | 넣을 값 |
|---|---|
| 카테고리 (Category) | 도구 (Tools), 생산성은 묶음 제목이라 고를 수 없고 그 아래 항목 중 선택 |
| 언어 (Language) | 영어 (English) |
| 스토어 아이콘 (Store icon) | `public/icons/icon-128.png` 업로드 |
| 전 언어 공통 스크린샷 (Global screenshots) | 준비물의 4장을 순서대로 업로드 (언어별 현지화 스크린샷 칸은 비워 둠) |
| 홈페이지 URL (Homepage URL) | 준비물의 홈페이지 주소 (깃허브 저장소) |
| 작은 프로모션 타일, 마키 타일, YouTube, 지원 URL | 비워 둠 (선택 항목) |
| 성인용 콘텐츠 (Mature content) | 끔 |

스크린샷 구성 (실제 빌드한 팝업 화면에 예시 북마크와 예시 페이지를 넣어 촬영, 개인 북마크 노출 방지. 영어 화면, 5~9번 단축키는 지정한 모습으로 표시)

1. `screenshot-capture.png`: 라이트 모드, 전체 페이지 버튼에 닿아 설명이 보이는 팝업 (Capture any part of the page)
2. `screenshot-editor-hide.png`: 다크 모드, 예시 주문 페이지의 이메일, 전화, 주소를 모자이크하고 결제 수단을 흐리게 한 편집 화면
3. `screenshot-light.png`: 라이트 모드, 2번 동그라미에 마우스를 올려 이름과 단축키 말풍선이 보이는 팝업
4. `screenshot-dark.png`: 다크 모드, 편집을 펼치고 3번 칸에서 북마크를 검색하는 팝업 (크롬 팝업 최대 높이 600px로 자름)

오른쪽 위 **임시저장 (Save draft)** 클릭

## 3단계. 개인정보 보호 (Privacy practices)

### 3-1. 전용 목적 (Single purpose)

```
OmniKit speeds up two everyday browsing tasks from one toolbar button: opening the user's chosen bookmarks with keyboard shortcuts, and taking screenshots of the current tab.
```

북마크와 캡처를 한 확장에 넣어 "단일 목적" 심사에 걸릴 수 있음 (1.1.0 제출 때 그대로 묶어서 내기로 함). 거절되면 캡처를 별도 확장으로 나누는 것을 검토

### 3-2. 권한 사유 (Permission justification)

권한 이름이 적힌 칸마다 붙여 넣기. manifest에 적은 콘텐츠 스크립트는 없어서 해당 칸도 없음. 호스트 권한은 선택 권한(`optional_host_permissions`)만 있음

`activeTab`, `scripting`, `contextMenus` 칸과 `tabs`, `storage` 칸의 캡처 문장은 캡처 기능을 넣은 다음 버전부터 해당 (1.0.1에는 없음)

**bookmarks** 칸

```
Reads the user's bookmarks so a keyboard shortcut can open the bookmark linked to each slot, follow the order of the bookmarks bar for slots the user has not set, and let the user search bookmarks in the popup to pick one. Bookmarks are never changed.
```

**tabs** 칸

```
Reads the addresses of open tabs only when a shortcut is pressed, to switch to a tab that already shows the same page instead of opening a duplicate. This must check tabs in every window, so activeTab, which only covers the current tab after a click, cannot replace it. It also reads the current tab's address when the popup opens, to turn off capture options on pages where Chrome does not let extensions capture. Tab addresses are not stored or sent anywhere.
```

**favicon** 칸

```
Shows each site's icon next to its bookmark in the popup, using the icons Chrome has already saved on the device.
```

**storage** 칸

```
Saves which bookmark the user linked to each shortcut slot in chrome.storage.local, and, while a screenshot editor tab is open, which screenshot that tab shows in chrome.storage.session. Nothing is sent off the device.
```

**activeTab** 칸

```
Captures a screenshot of the tab the user is viewing, only after the user clicks a capture option in the popup or the right-click menu. Access is limited to that one tab and ends when the tab moves to another site.
```

**scripting** 칸

```
Adds the area-selection overlay and scrolls the page for full-page screenshots on the tab the user chose to capture. No script runs on any page until the user starts a capture.
```

**contextMenus** 칸

```
Adds capture options (selected area, visible part, full page) to the right-click menu.
```

**호스트 권한** 칸 (선택 권한 `http://*/*`, `https://*/*`, 캡처 기능을 넣은 다음 버전부터)

```
Optional, never granted at install. Some pages show their content inside a frame from another address and only that frame scrolls. When the user picks a full-page screenshot on such a page, the extension asks Chrome for access to that one frame address, and Chrome shows its own permission prompt. If allowed, the extension scrolls that frame to capture it. If declined, it captures the visible part only.
```

### 3-3. 원격 코드 (Remote code)

나오면 **아니요, 원격 코드를 사용하지 않습니다 (No, I am not using remote code)** 선택

### 3-4. 사용자 데이터 사용 (Data usage)

스토어 정책상 기기 안에서만 처리하는 데이터도 공개 대상 (OmniView와 같은 기준)

| 항목 | 체크 | 이유 |
|---|---|---|
| 웹 기록 (Web history) | 체크 | 단축키를 누를 때 열린 탭 주소와 북마크 주소를 기기 안에서 비교 |
| 웹사이트 콘텐츠 (Website content) | 체크 (1.1.0부터) | 사용자가 고른 탭을 스크린샷으로 찍어 기기 안에만 저장 |
| 나머지 (개인 식별 정보, 건강, 금융, 인증, 개인 커뮤니케이션, 위치, 사용자 활동) | 체크 안 함 | 처리하지 않음 |

아래 확인 체크박스 3개(데이터 판매 금지, 목적 외 사용 금지, 신용 평가 사용 금지)는 모두 해당하므로 직접 읽고 체크. 하나라도 비면 제출 불가

### 3-5. 개인정보처리방침 (Privacy policy)

**개인정보처리방침 URL** 칸에 준비물의 링크 공유 주소 붙여 넣기. 데이터 체크 항목을 바꾸면 처리방침도 함께 고침

개인정보처리방침 본문은 저장소의 `PRIVACY.md` (영어 다음 한국어), 고치면 깃허브에 푸시해야 스토어 링크에 반영

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
| 1.0.1 | 2026-11-24 | 13개 언어 추가, 아랍어 화면 좌우 반전 | 게시됨 - 공개 |
| 1.1.0 | 2026-11-25 | 스크린샷 캡처(선택 영역, 보이는 화면, 전체 페이지, 우클릭 메뉴, 편집 화면에서 내보내기) | 1.1.1로 대체 |
| 1.1.1 | 2026-11-25 | PDF 전체 페이지 캡처 안내, 고정 요소 숨김 수정 | 게시됨 - 공개 |
| 1.2.0 ~ 1.5.0 | 2026-11-25 | 편집 화면 꾸미기, 선택 영역 입력 수정, 요소 선택 캡처, 팝업 그림 버튼, 개체 개수 제한 | 다음 버전에 포함 |
| 1.6.0 | 2026-11-25 | 떠 있는 도구 줄과 작업 영역 조절, MIT 오픈소스 전환(설명에 GitHub 링크, 홈페이지와 개인정보처리방침을 GitHub 저장소로) | 1.7.0을 넣으려고 리뷰 취소 |
| 1.7.0 | 2026-11-26 | iframe 안 요소 선택, 못 쓰는 캡처 방식의 이유 안내, 첫 캡처 누락 수정, 화질 수정(내보내기 1px, 이어 붙인 곳 틈, PNG 고해상도 표시, 편집 화면 처음 100%) | 검토 대기 중 (2026-11-26 제출, 통과하면 자동 게시) |

## 심사 참고

- 기본 단축키는 크롬 제한으로 1~4번 칸만 지정, 5~9번은 사용자가 직접 지정
- `tabs` 권한은 `activeTab`으로 대체 가능한지 물을 수 있음, 모든 창의 열린 탭을 찾아야 해서 대체 불가 (권한 사유에 포함)
- 캡처는 설치 때 받는 호스트 권한(`<all_urls>`) 없이 `activeTab`만 사용, 다른 주소의 iframe 안에서만 스크롤되는 페이지의 전체 페이지만 그 iframe 주소를 선택 권한으로 요청, 다운로드와 클립보드 권한 대신 편집 화면에서 웹 표준 다운로드 링크와 복사 기능 사용
