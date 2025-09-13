# # Register Function

# Version cũ (Immediate Login):

set({
user: response.data.user,  
 isAuthenticated: true,
isLoading: false
<!-- user: response.data.user => User data -->
<!-- isAuthenticated: true => Logged in right away  -->
});

1. User registers → isAuthenticated: true ngay lập tức
2. User chưa verify email nhưng đã "logged in"
3. Security issue: Unverified users có access

# Version hiện tại (Email Verification Flow):

set({
message: response.data.message, // ← Success message
isLoading: false, // ← Stop loading
error: null // ← Clear errors
<!-- ❌ NO user: response.data.user -->
<!-- ❌ NO isAuthenticated: true -->
});

1. User registers → Backend tạo user (isVerified: false)
2. Backend gửi verification email
3. User verify email → isVerified: true
4. User login → isAuthenticated: true

- Sử dụng isLoading để hiển thị spinner trong khi xác thực email.
- try catch để hành động trong try bắt lỗi trong catch.
- get để lấy state hiện tại đang xài của store và set để cập nhật state mới.

# useStore(state => state.xxx) và useStore.getState()

- useStore(selector): dùng trong component, gây re-render khi phần state được chọn thay đổi.

- useStore.getState(): đọc ngoài React hoặc trong event handlers mà không cần re-render. Không reactive.

# Làm sao để xử lý async actions (gọi API) trong Zustand?