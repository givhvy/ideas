# 💡 My Ideas - Personal Ideas Manager

Ứng dụng quản lý ý tưởng cá nhân với mã hóa AES-256 và đồng bộ Firebase.

## ✨ Tính năng

- ✅ **CRUD đầy đủ**: Thêm, sửa, xóa, tìm kiếm ý tưởng
- 🔐 **Mã hóa AES-256**: Dữ liệu được mã hóa trước khi lưu lên Firebase
- 🔄 **Sync realtime**: Đồng bộ tự động giữa các thiết bị
- 🔒 **Authentication**: Đăng nhập bằng email/password
- 💾 **Remember Me**: Duy trì phiên đăng nhập
- ☁️ **Cloud Storage**: Lưu trữ trên Firebase Firestore
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🚀 Cài đặt Firebase

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** hoặc **"Add project"**
3. Đặt tên project (ví dụ: `my-ideas-app`)
4. Tắt Google Analytics (không bắt buộc)
5. Click **"Create project"**

### Bước 2: Enable Authentication

1. Trong Firebase Console, chọn **Authentication** từ menu bên trái
2. Click **"Get started"**
3. Chọn tab **"Sign-in method"**
4. Enable **"Email/Password"**
5. Click **"Save"**

### Bước 3: Tạo User Account

1. Trong Authentication, chọn tab **"Users"**
2. Click **"Add user"**
3. Nhập email và password của bạn
4. Click **"Add user"**

⚠️ **LƯU Ý**: Email và password này sẽ dùng để đăng nhập vào app

### Bước 4: Enable Firestore Database

1. Trong Firebase Console, chọn **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (để dễ dàng phát triển)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click **"Enable"**

### Bước 5: Setup Firestore Security Rules

Trong Firestore Database → **Rules**, paste rule sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Chỉ cho phép user đã authenticated
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **"Publish"**

### Bước 6: Lấy Firebase Config

1. Trong Firebase Console, click icon ⚙️ → **"Project settings"**
2. Scroll xuống phần **"Your apps"**
3. Click icon **"</>"** (Web) để thêm web app
4. Nhập nickname: `My Ideas Web`
5. **KHÔNG** check "Also set up Firebase Hosting"
6. Click **"Register app"**
7. Copy toàn bộ `firebaseConfig`:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
}
```

### Bước 7: Cấu hình trong App

1. Mở `login.html` trong trình duyệt
2. Nếu chưa có Firebase config, app sẽ tự động redirect về trang config
3. Nhập các thông tin từ Firebase Config vào form
4. Click **"Lưu cấu hình"**
5. Đăng nhập bằng email/password đã tạo ở Bước 3

## 📦 Deploy lên Netlify

### Bước 1: Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-ideas.git
git push -u origin main
```

### Bước 2: Deploy trên Netlify

1. Truy cập [Netlify](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **"GitHub"** và authorize
4. Chọn repository `my-ideas`
5. Build settings:
   - Build command: (để trống)
   - Publish directory: `/` hoặc `.`
6. Click **"Deploy site"**

### Bước 3: Setup Custom Domain (Optional)

1. Trong Netlify dashboard, chọn **"Domain settings"**
2. Click **"Add custom domain"**
3. Nhập domain của bạn
4. Follow hướng dẫn để cấu hình DNS

## 🔐 Bảo mật

### Cách hoạt động:

1. **Authentication**: Firebase Auth với email/password
2. **Encryption**:
   - Dữ liệu được mã hóa AES-256 trước khi upload
   - Key mã hóa **CHUNG** cho tất cả thiết bị (cùng 1 account)
3. **Firebase Storage**:
   - Chỉ lưu dữ liệu đã mã hóa
   - Admin Firebase **KHÔNG THỂ ĐỌC** được nội dung

### Ví dụ dữ liệu trên Firebase:

```javascript
// Trước mã hóa (local)
{
  title: "Ý tưởng kinh doanh mới",
  content: "...",
  tags: ["business", "startup"]
}

// Sau mã hóa (trên Firebase)
{
  id: 1234567890,
  data: "553616c7465645f5f8d9e2a1b4c3d...", // Hex string
  timestamp: "2024-01-15T10:30:00Z"
}
```

## 📱 Sử dụng

### Đăng nhập lần đầu:

1. Mở `login.html` (hoặc domain của bạn)
2. Nhập email/password
3. Check ✅ **"Ghi nhớ đăng nhập"** (recommended)
4. Click **"Đăng nhập"**

### Thêm ý tưởng:

1. Nhập ý tưởng vào ô input
2. Nhấn **Enter** hoặc click **"Thêm"**

### Sửa/Xóa:

1. Click vào card ý tưởng
2. Modal hiện ra với nút **"Sửa"** và **"Xóa"**

### Đồng bộ Firebase:

- **Đồng bộ lên Cloud**: Upload dữ liệu local lên Firebase
- **Tải từ Cloud**: Download dữ liệu từ Firebase về
- **Bật Sync Realtime**: Tự động đồng bộ realtime

## 🔧 Troubleshooting

### Lỗi: "Firebase not configured"
→ Vào Settings → Cấu hình Firebase

### Lỗi: "Permission denied"
→ Kiểm tra Firestore Rules đã setup đúng chưa

### Lỗi: "User not found"
→ Tạo user trong Firebase Authentication

### Lỗi: "Cannot decrypt data"
→ Clear localStorage và sync lại từ Firebase

## 📝 Files Structure

```
my-ideas/
├── index.html              # Main app page
├── login.html              # Login page
├── style.css               # Styles
├── app.js                  # Main app logic
├── auth.js                 # Authentication logic
├── encryption.js           # AES-256 encryption
├── firebase-manager.js     # Firebase operations
└── README.md              # This file
```

## 🎯 Roadmap

- [ ] Export/Import JSON
- [ ] Dark/Light theme toggle
- [ ] Categories/Folders
- [ ] Rich text editor
- [ ] Attachments support
- [ ] Share ideas publicly

## 📄 License

MIT License - Feel free to use for personal or commercial projects

---

Made with ❤️ and Claude Code
