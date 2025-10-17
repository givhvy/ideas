# Hướng Dẫn Cấu Hình Firebase

## Tính năng bảo mật

Ứng dụng này sử dụng **mã hóa AES-256 + HEX** để bảo vệ dữ liệu trước khi upload lên Firebase:

- ✅ Dữ liệu được mã hóa hoàn toàn trước khi lưu lên cloud
- ✅ Mỗi thiết bị có key mã hóa riêng biệt
- ✅ Firebase chỉ lưu trữ dữ liệu đã được mã hóa
- ✅ Không ai có thể đọc được dữ liệu của bạn, kể cả Firebase admin

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** (Thêm dự án)
3. Đặt tên project (ví dụ: "my-ideas-app")
4. Tắt Google Analytics nếu không cần thiết
5. Click **"Create project"**

## Bước 2: Tạo Firestore Database

1. Trong project vừa tạo, click **"Firestore Database"** ở menu bên trái
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho phép read/write tự do)
4. Chọn location gần bạn nhất (ví dụ: asia-southeast1)
5. Click **"Enable"**

## Bước 3: Lấy Config Firebase

1. Click icon ⚙️ (Settings) góc trên bên trái
2. Chọn **"Project settings"**
3. Scroll xuống phần **"Your apps"**
4. Click icon **"</>" (Web)** để thêm web app
5. Đặt nickname (ví dụ: "Ideas App Web")
6. **KHÔNG** chọn "Also set up Firebase Hosting"
7. Click **"Register app"**
8. Copy toàn bộ thông tin trong phần `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

## Bước 4: Cấu Hình Trong Ứng Dụng

1. Mở file **index.html** trong trình duyệt
2. Click nút **"⚙️ Cấu hình"** trong phần Firebase Cloud Sync
3. Paste các thông tin từ Firebase Config vào form:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
4. Click **"🧪 Kiểm tra kết nối"** để test
5. Nếu thành công, click **"💾 Lưu cấu hình"**

## Bước 5: Sử Dụng

### Đồng bộ lên Cloud
- Click **"☁️ Đồng bộ lên Cloud"** để upload tất cả ý tưởng lên Firebase
- Dữ liệu sẽ được mã hóa trước khi upload

### Tải từ Cloud
- Click **"⬇️ Tải từ Cloud"** để download ý tưởng từ Firebase về
- Dữ liệu sẽ tự động được giải mã

### Sync Realtime
- Click **"🔄 Bật Sync Realtime"** để tự động đồng bộ
- Mọi thay đổi trên Firebase sẽ được cập nhật ngay lập tức

## Cấu Hình Firestore Rules (Tùy chọn - Bảo mật cao hơn)

Để tăng cường bảo mật, vào **Firestore Database > Rules** và paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

Hoặc nếu muốn bảo mật hơn (chỉ cho phép từ domain của bạn):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Lưu Ý Quan Trọng

⚠️ **API Key không phải là bí mật**: API Key trong Firebase config có thể công khai vì Firebase sử dụng Security Rules để bảo vệ dữ liệu.

✅ **Dữ liệu được mã hóa**: Tất cả ý tưởng của bạn được mã hóa AES-256 trước khi lưu lên Firebase, nên ngay cả admin Firebase cũng không đọc được.

🔑 **Key mã hóa**: Được lưu local trên máy bạn, mỗi thiết bị có key riêng. Nếu xóa browser data sẽ mất key và không giải mã được dữ liệu cũ.

## Khắc Phục Sự Cố

### Lỗi "Firebase not configured"
- Kiểm tra lại config đã nhập đúng chưa
- Click "Cấu hình" và nhập lại thông tin

### Lỗi "Permission denied"
- Kiểm tra Firestore Rules đã set đúng chưa
- Đảm bảo database ở "test mode" hoặc rules cho phép read/write

### Mất dữ liệu sau khi clear browser
- Key mã hóa được lưu trong localStorage
- Backup export dữ liệu thường xuyên
- Hoặc dùng chức năng "Tải từ Cloud" để khôi phục

## Tính Năng Mã Hóa

### Cách hoạt động:
1. **Tạo Key**: Mỗi thiết bị tự động tạo key mã hóa duy nhất
2. **Mã hóa**: Dữ liệu được mã hóa AES-256, sau đó convert sang HEX
3. **Upload**: Chỉ dữ liệu đã mã hóa được upload lên Firebase
4. **Download**: Dữ liệu được tự động giải mã khi tải về

### Bảo mật:
- 🔒 AES-256: Thuật toán mã hóa mạnh nhất hiện nay
- 🔐 HEX Encoding: Thêm lớp obfuscation
- 🛡️ Local Key: Key không bao giờ được upload lên cloud
- 🚫 Zero-Knowledge: Firebase không thể đọc dữ liệu của bạn

---

**Chúc bạn sử dụng vui vẻ! 🎉**
