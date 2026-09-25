# ⚡ CryptoVol Radar - Máy Quét Khối Lượng Đột Biến & Lướt Sóng Crypto

Nền tảng phân tích kỹ thuật và quét khối lượng giao dịch đột biến (Volume Spikes) theo thời gian thực kết nối trực tiếp với WebSocket của sàn **Binance**, tự động tính toán tiềm năng sinh lời và thiết lập kế hoạch vào lệnh lướt sóng (Entry / Take Profit / Stop Loss).

---

## 🚀 Tính Năng Chính

- **Quét Khối Lượng Đột Biến (Volume Spikes Multiplier)**: So sánh khối lượng nến hiện tại với mức trung bình 20 kỳ (MA20 Volume), phát hiện sớm dòng tiền cá mập gom hàng khi volume nổ từ `2.0x` đến `7.0x+`.
- **Biểu Đồ Trực Quan Xung Lực (Visual Volume Surge Chart)**:
  - Bục vinh danh **TOP 3 Khối Lượng Bùng Nổ Nhất**.
  - Thanh đo trực quan xung lực khối lượng và tiềm năng lãi dự báo.
- **Kế Hoạch Giao Dịch 4 Bước (Trade Setup)**:
  - Vùng mua an toàn (Safe Entry Zone) chống mua đuổi (FOMO).
  - Điểm chốt lời 2 nấc: TP1 (+2.5% đến +3.5%) và TP2 (+5.0% đến +7.0%).
  - Mức cắt lỗ chuẩn quản trị vốn (-1.5%) bảo toàn tài khoản.
- **Dữ Liệu Trực Tiếp Binance**: Kết nối WebSocket Binance độ trễ mili-giây, biểu đồ nến động Interactive Candlestick và âm thanh cảnh báo khi có biến động lớn.
- **Chế Độ Xem Linh Hoạt**: Chuyển đổi giữa **Biểu Đồ Trực Quan 📊**, **Danh Sách Bảng 📋**, và **Bản Đồ Nhiệt 🗺️**.

---

## 📦 Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite 8
- **Icons & UI**: Lucide React
- **Data Source**: Binance Live REST API & Binance WebSocket (`wss://stream.binance.com:9443`)

---

## 🌐 Hướng Dẫn Triển Khai Lên GitHub (Deployment Guide)

### Bước 1: Khởi tạo Git và đẩy mã nguồn lên GitHub

Mở Terminal trên máy tính tại thư mục dự án và chạy các lệnh sau:

```bash
# 1. Khởi tạo Git
git init

# 2. Thêm tất cả file vào staging
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Khoi tao du an CryptoVol Radar san sang deploy"

# 4. Đổi tên nhánh chính thành main
git branch -M main

# 5. Liên kết với kho lưu trữ GitHub của bạn (thay URL bên dưới bằng repo của bạn)
git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/TÊN_REPO.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

### Bước 2: Kích hoạt GitHub Pages (Miễn phí 100%)

Dự án đã được tích hợp sẵn file cấu hình tự động **GitHub Actions** tại `.github/workflows/deploy.yml`:

1. Truy cập vào kho lưu trữ của bạn trên **GitHub**.
2. Chọn tab **Settings** (Cài đặt) $\rightarrow$ chọn mục **Pages** ở thanh menu bên trái.
3. Tại phần **Build and deployment**:
   - Ở mục **Source**, chọn **`GitHub Actions`**.
4. GitHub sẽ tự động chạy workflow build và sau khoảng 1-2 phút, liên kết trang web của bạn sẽ hiển thị tại:
   ```
   https://<TÊN_GITHUB_CỦA_BẠN>.github.io/<TÊN_REPO>/
   ```

---

### Bước 3: (Tùy chọn) Triển khai nhanh lên Vercel / Netlify

Nếu muốn sử dụng Vercel hoặc Netlify:
1. Đăng nhập vào [Vercel](https://vercel.com/) hoặc [Netlify](https://www.netlify.com/).
2. Chọn **"Add New Project"** $\rightarrow$ chọn repository GitHub vừa tạo.
3. Vercel / Netlify sẽ tự động nhận diện **Vite**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Bấm **Deploy**. Trang web sẽ hoạt động ngay lập tức với SSL miễn phí và tốc độ cực nhanh!

---

## 💻 Hướng Dẫn Chạy Trên Máy Tính (Local Development)

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động môi trường phát triển (Dev server)
npm run dev

# 3. Mở trình duyệt tại địa chỉ
http://localhost:3000

# 4. Đóng gói sản phẩm (Production build)
npm run build
```

---

## 📄 Bản Quyền & Giấy Phép

Phát triển phục vụ cộng đồng trader crypto. Tự do tùy biến và tích hợp các chiến lược giao dịch định lượng riêng của bạn!
