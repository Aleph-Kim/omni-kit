# OmniKit

[English](../README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Español](README.es.md) | [Português (Brasil)](README.pt-BR.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Bahasa Indonesia](README.id.md) | **Tiếng Việt** | [हिन्दी](README.hi.md) | [العربية](README.ar.md)

Tiện ích Chrome tập hợp các công cụ hữu ích hằng ngày ở một nơi. Hỗ trợ 13 ngôn ngữ.

[Cài đặt từ Chrome Web Store](https://chromewebstore.google.com/detail/lfjjclkojbgjgjbjjpfippbjbemjmoci)

![Cửa sổ bật lên](../store-assets/screenshot-light.png)

## Tính năng

### Phím tắt dấu trang

- Mở 9 ô dấu trang trong thẻ mới bằng phím tắt
- Chọn dấu trang cho từng ô, hoặc để trống để dùng dấu trang ở cùng vị trí trên thanh dấu trang
- Nếu đã có thẻ mở cùng địa chỉ, chuyển sang thẻ đó
- Phím tắt mặc định cho ô 1 đến 4 (Option+số trên Mac, Alt+Shift+số trên hệ điều hành khác). Ô 5 đến 9 đặt tại `chrome://extensions/shortcuts`

### Chụp

- 4 cách: Vùng đã chọn, Phần tử trang, Phần đang hiển thị và Toàn trang (cửa sổ bật lên và menu chuột phải)
- Toàn trang và phần tử dài được chụp trong khi cuộn rồi ghép lại, tiêu đề cố định được ẩn
- Chỉnh sửa trong trình chỉnh sửa với Chữ, Mũi tên, Bút, Hình, Khảm, Làm mờ, Biểu tượng và Cắt
- Tải xuống dạng PNG, JPEG hoặc WebP, hoặc sao chép vào bảng nhớ tạm

![Trình chỉnh sửa](../store-assets/screenshot-editor.png)

## Quyền riêng tư

- Không gửi dữ liệu nào đến máy chủ bên ngoài
- Ảnh chụp chỉ được lưu trong trình duyệt trên máy tính này và bị xóa khi đóng thẻ chỉnh sửa
- Quyền chụp chỉ áp dụng cho thẻ mà bạn đã nhấn biểu tượng trên thanh công cụ hoặc menu chuột phải (`activeTab`)

## Tự build từ mã nguồn

Cần Node.js 20.19 trở lên

```sh
npm install
npm run build
```

1. Mở `chrome://extensions` trong Chrome
2. Bật Chế độ dành cho nhà phát triển
3. Nhấn Tải tiện ích đã giải nén rồi chọn thư mục `dist`

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Máy chủ phát triển |
| `npm run check` | Kiểm tra kiểu, kiểm thử và build |
| `npm run package` | Tạo file zip cho Chrome Web Store |

## Công nghệ

Manifest V3, Vite, CRXJS, React 19, Tailwind CSS 4, TypeScript, Konva, Vitest

## Giấy phép

[MIT](../LICENSE)

Giấy phép của các thư viện đi kèm (konva, react-konva, Lucide) có trong [public/THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt)
