# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | **Bahasa Indonesia** | [Tiếng Việt](README.vi.md) | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Ekstensi Chrome yang mengumpulkan alat yang berguna sehari-hari di satu tempat. Tersedia dalam 13 bahasa.

![Pop-up](../store-assets/screenshot-light.png)

## Fitur

### Pintasan bookmark

- Buka 9 slot bookmark di tab baru dengan pintasan keyboard
- Pilih bookmark untuk setiap slot, atau biarkan kosong untuk memakai bookmark di urutan yang sama pada bilah bookmark
- Jika tab dengan alamat yang sama sudah terbuka, pindah ke tab tersebut
- Pintasan bawaan untuk slot 1 sampai 4 (Option+angka di Mac, Alt+Shift+angka di sistem lain). Slot 5 sampai 9 diatur di `chrome://extensions/shortcuts`

### Tangkap

- 4 cara: Area terpilih, Elemen halaman, Bagian yang terlihat, dan Seluruh halaman (pop-up dan menu klik kanan)
- Seluruh halaman dan elemen panjang ditangkap sambil menggulir lalu digabungkan, header tetap disembunyikan
- Edit di editor dengan Teks, Panah, Pena, Bentuk, Mosaik, Buram, Ikon, dan Potong
- Unduh sebagai PNG, JPEG, atau WebP, atau salin ke papan klip

![Editor](../store-assets/screenshot-editor.png)

## Privasi

- Tidak ada data yang dikirim ke server luar
- Tangkapan hanya disimpan di browser komputer ini dan dihapus saat tab editor ditutup
- Izin tangkap hanya berlaku untuk tab tempat Anda mengklik ikon toolbar atau menu klik kanan (`activeTab`)

## Build dari kode sumber

Memerlukan Node.js 20.19 atau lebih baru

```sh
npm install
npm run build
```

1. Buka `chrome://extensions` di Chrome
2. Aktifkan Mode pengembang
3. Klik Muat yang belum dibuka lalu pilih folder `dist`

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run check` | Pemeriksaan tipe, pengujian, dan build |
| `npm run package` | Membuat zip untuk Chrome Web Store |

## Teknologi

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## Lisensi

[MIT](../LICENSE)

Lisensi pustaka yang disertakan (konva, react-konva, Lucide) ada di [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
