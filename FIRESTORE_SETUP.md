# Firestore Setup Guide

## Firestore Rules Configuration

Để ứng dụng hoạt động đúng, bạn cần cấu hình Firestore Rules trong Firebase Console.

### Bước 1: Truy cập Firebase Console
1. Vào https://console.firebase.google.com
2. Chọn project `ideas-3863e`
3. Vào **Firestore Database** từ menu bên trái
4. Click tab **Rules**

### Bước 2: Cập nhật Rules

Copy và paste rules sau vào:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Bước 3: Publish Rules
Click nút **Publish** để áp dụng rules.

## Giải thích Rules

- `request.auth != null` - Chỉ cho phép người dùng đã đăng nhập
- `request.auth.uid == userId` - Người dùng chỉ được truy cập data của chính họ

## Kiểm tra

Sau khi setup rules:
1. Đăng nhập vào app
2. Thêm một idea
3. Mở Console và kiểm tra không có lỗi `permission-denied`
4. Idea sẽ được lưu vào Firestore collection `users/{userId}`

## Common Errors

### Error: Missing or insufficient permissions
- Nguyên nhân: Firestore Rules chưa được setup đúng
- Giải pháp: Kiểm tra lại rules theo hướng dẫn trên

### Error: User signed out
- Nguyên nhân: Chưa đăng nhập hoặc session hết hạn
- Giải pháp: Đăng nhập lại

## Firebase Authentication Setup

Nếu chưa setup Firebase Authentication:

1. Vào **Authentication** trong Firebase Console
2. Click tab **Sign-in method**
3. Enable **Email/Password** provider
4. Vào tab **Users**
5. Click **Add user** để tạo tài khoản test
   - Email: your@email.com
   - Password: (tối thiểu 6 ký tự)
