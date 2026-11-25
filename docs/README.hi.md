# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | [Tiếng Việt](README.vi.md) | **हिन्दी** | [العربية](README.ar.md)

रोज़ काम आने वाले ब्राउज़र टूल एक जगह लाने वाला Chrome एक्सटेंशन। 13 भाषाओं में उपलब्ध।

![पॉप-अप](../store-assets/screenshot-light.png)

## सुविधाएँ

### बुकमार्क शॉर्टकट

- शॉर्टकट से 9 बुकमार्क स्लॉट नए टैब में खोलें
- हर स्लॉट के लिए बुकमार्क चुनें, या खाली छोड़ें ताकि बुकमार्क बार में उसी क्रम वाला बुकमार्क इस्तेमाल हो
- अगर उसी पते का टैब पहले से खुला है, तो उसी टैब पर चले जाएँ
- डिफ़ॉल्ट शॉर्टकट स्लॉट 1 से 4 के लिए (Mac पर Option+नंबर, बाकी पर Alt+Shift+नंबर)। स्लॉट 5 से 9 `chrome://extensions/shortcuts` में सेट करें

### कैप्चर

- 4 तरीके: चुना हुआ हिस्सा, पेज एलिमेंट, दिखने वाला हिस्सा और पूरा पेज (पॉप-अप और राइट-क्लिक मेन्यू)
- पूरा पेज और लंबे एलिमेंट स्क्रॉल करते हुए कैप्चर करके जोड़े जाते हैं, फ़िक्स्ड हेडर छिपा दिए जाते हैं
- एडिटर में टेक्स्ट, तीर, पेन, आकृति, मोज़ेक, धुंधला, आइकन और क्रॉप से बदलाव करें
- PNG, JPEG या WebP में डाउनलोड करें, या क्लिपबोर्ड पर कॉपी करें

![एडिटर](../store-assets/screenshot-editor.png)

## गोपनीयता

- कोई भी डेटा बाहरी सर्वर पर नहीं भेजा जाता
- कैप्चर सिर्फ़ इसी कंप्यूटर के ब्राउज़र में सेव होते हैं और एडिटर टैब बंद करने पर मिट जाते हैं
- कैप्चर की अनुमति सिर्फ़ उसी टैब पर लागू होती है जहाँ आपने टूलबार आइकन या राइट-क्लिक मेन्यू पर क्लिक किया (`activeTab`)

## सोर्स से बिल्ड करें

Node.js 20.19 या नया वर्शन ज़रूरी

```sh
npm install
npm run build
```

1. Chrome में `chrome://extensions` खोलें
2. डेवलपर मोड चालू करें
3. अनपैक्ड लोड करें पर क्लिक करके `dist` फ़ोल्डर चुनें

| कमांड | विवरण |
|---|---|
| `npm run dev` | डेवलपमेंट सर्वर |
| `npm run check` | टाइप जाँच, टेस्ट और बिल्ड |
| `npm run package` | Chrome वेब स्टोर के लिए zip बनाएँ |

## तकनीक

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## लाइसेंस

[MIT](../LICENSE)

शामिल लाइब्रेरी (konva, react-konva, Lucide) के लाइसेंस यहाँ हैं: [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
