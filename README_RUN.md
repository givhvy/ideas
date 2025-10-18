# 🚀 Cách Chạy Ứng Dụng

## Cách 1: Double-click (Dễ nhất)

1. **Double-click vào file `START_SERVER.bat`**
2. Lần đầu sẽ tự động cài dependencies (npm install)
3. Browser sẽ tự động mở trang `http://localhost:3000`
4. Đăng nhập và sử dụng!

## Cách 2: Command Line

Mở Command Prompt tại folder này và chạy:

```bash
# Lần đầu tiên: cài dependencies
npm install

# Khởi động server
npm start
```

Sau đó mở browser và vào: `http://localhost:3000`

## 📱 Test Cross-Browser Sync

### Browser A (Chrome):
1. Mở `http://localhost:3000`
2. Đăng nhập
3. Thêm vài ý tưởng (hoặc click "🧪 Test Add")
4. Click "☁️ Đồng bộ lên Cloud"

### Browser B (Edge/Firefox hoặc Incognito):
1. Mở `http://localhost:3000`
2. Đăng nhập với **CÙNG tài khoản**
3. Click "⬇️ Tải từ Cloud"
4. Thấy dữ liệu từ Browser A! ✅

## ❌ Dừng Server

Nhấn `Ctrl + C` trong cửa sổ Command Prompt

## 🔧 Yêu Cầu

- Node.js đã cài đặt (kiểm tra: `node --version`)
- Nếu chưa có Node.js, tải tại: https://nodejs.org/

## 🌐 URLs

- **Ứng dụng:** http://localhost:3000
- **Login:** http://localhost:3000/login.html
- **App:** http://localhost:3000/index.html
