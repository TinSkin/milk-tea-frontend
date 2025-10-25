//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho xác thực
const API_ENDPOINT = "/auth";

//! 3. Tạo zustand store để quản lý trạng thái xác thực
export const useAuthStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    user: null, // Lưu thông tin người dùng sau khi đăng nhập
    isAuthenticated: false, // Xác minh người dùng đã được xác thực chưa
    error: null, // Lưu thông tin lỗi nếu có
    isLoading: false, // Trạng thái loading dữ liệu, mặc định không loading
    isCheckingAuth: true, // Trạng thái này dùng để kiểm tra xác thực khi app khởi động
    message: null, // Lưu thông báo từ server (ví dụ: đăng ký thành công, xác minh email thành công, v.v.)
    pendingVerification: null, // Lưu thông tin chờ xác minh Google { email, provider, reason }

    //! 5. Hàm đăng ký tài khoản mới
    register: async (userData) => {
        set({ isLoading: true, error: null, message: null }); // Đặt trạng thái loading và reset error, message
        try {
            // Gửi request POST đến endpoint đăng ký với dữ liệu userData
            const response = await api.post(`${API_ENDPOINT}/register`, userData);
            // Nếu thành công, không đăng nhập ngay - chờ xác minh email
            set({
                user: { email: userData.email, isVerified: false }, // cho phép flow xác minh
                isAuthenticated: true,   // có cookie
                isCheckingAuth: false,   // tránh guard chuyển hướng về /login
                message: response.data.message || "Vui lòng kiểm tra email để xác minh tài khoản",
                isLoading: false,
                error: null,
            });
            return response.data; // Trả về response để xử lý tiếp
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi đăng ký";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 6. Hàm xác minh OTP
    verifyOTP: async (code) => {
        set({ isLoading: true, error: null, message: null });
        try {
            // Gửi request POST đến endpoint xác minh email với mã OTP
            const response = await api.post(`${API_ENDPOINT}/verify-otp`, { code });
            // Nếu thành công, cập nhật trạng thái user và đặt isAuthenticated thành true
            set({
                user: response.data.user, // Lưu thông tin user từ response
                isAuthenticated: true, // Đặt isAuthenticated thành true
                isLoading: false, // Đặt loading thành false
                message: response.data.message || "Xác minh email thành công", // Lưu thông báo thành công
            });
            return response.data; // Trả về response để xử lý tiếp
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi xác minh email";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 7. Hàm gửi lại OTP xác minh
    resendVerificationOTP: async (email) => {
        console.log("Frontend: Attempting to resend OTP for:", email);
        set({ isLoading: true, error: null, message: null });
        try {
            console.log(`Frontend: Sending POST request to: ${API_ENDPOINT}/resend-otp`);
            console.log("Frontend: Request payload:", { email });
            
            // Gửi request POST đến endpoint gửi lại OTP với email
            const response = await api.post(`${API_ENDPOINT}/resend-otp`, { email });

            console.log("Frontend: Resend OTP response:", response.data);
            
            // Nếu thành công, cập nhật trạng thái message
            set({
                message: response.data.message || "Gửi lại email OTP xác minh thành công",
                isLoading: false, // Đặt loading thành false
                error: null // Reset trạng thái error
            });
            return response.data; // Trả về response để xử lý tiếp
        } catch (error) {
            console.error("Frontend: Error in resendVerificationOTP:", error);
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 8. Hàm xác minh email
    verifyEmail: async (token) => {
        if (!token) {
            const msg = "Thiếu token xác minh";
            set({ error: msg, message: null });
            throw { status: 400, message: msg };
        }

        set({ isLoading: true, error: null, message: null });

        try {
            const { data } = await api.post(`${API_ENDPOINT}/verify-email`, { token });

            // Sử dụng response trực tiếp từ backend (không cần gọi check-auth thêm)
            if (data.isAuthenticated && data.user) {
                set({
                    user: { ...data.user, isVerified: true },
                    isAuthenticated: true,
                    message: null, // Không lưu message để tránh hiển thị lặp
                    isLoading: false,
                    error: null,
                    pendingVerification: null // Xóa trạng thái chờ xác minh
                });
            } else {
                set({
                    message: null, // Không lưu message để tránh hiển thị lặp
                    isLoading: false,
                    error: null,
                });
            }

            return data;
        } catch (err) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.message || "Xác minh email thất bại";
            set({ error: msg, isLoading: false });
            throw { status, message: msg };
        }
    },

    //! 9. Hàm gửi lại email xác minh
    resendVerificationEmail: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            // Gửi request POST đến endpoint gửi lại email xác minh với email
            const response = await api.post(`${API_ENDPOINT}/resend-verification-email`, { email });

            // Nếu thành công, cập nhật trạng thái message
            set({
                message: response.data.message || "Gửi lại email xác minh thành công",
                isLoading: false, // Đặt loading thành false
                error: null // Reset trạng thái error
            });
            return response; // Trả về response để xử lý tiếp
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi gửi lại email xác minh";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 10. Hàm đăng nhập
    login: async (userData) => {
        set({ isLoading: true, error: null }); // Đặt trạng thái loading và reset error
        try {
            // Gửi request POST đến endpoint đăng nhập với email, password và rememberMe
            const response = await api.post(`${API_ENDPOINT}/login`, userData);

            const user = response.data.user;

            // Nếu thành công, cập nhật trạng thái user và đặt isAuthenticated thành true
            set({
                user: user, // Lưu thông tin user từ response (có thể chứa assignedStoreId)
                isAuthenticated: true, // Đặt isAuthenticated thành true
                error: null, // Reset trạng thái error
                isLoading: false // Đặt loading thành false
            });

            // 🛒 Sau khi đăng nhập thành công, merge giỏ hàng local (Zustand) với giỏ hàng backend
try {
    const { useCartStore } = await import("./cartStore.js"); // import động để tránh vòng lặp giữa store
    const cartStore = useCartStore.getState();
    const localItems = cartStore.items || [];

    if (localItems.length > 0) {
        console.log("🔄 Merge local cart với backend sau khi đăng nhập...");
        await api.put("/cart/merge", { items: localItems });
        await cartStore.fetchCart(); // đồng bộ lại từ backend
    } else {
        await cartStore.fetchCart(); // tải giỏ hàng backend nếu local trống
    }
} catch (err) {
    console.error("⚠️ Lỗi khi merge giỏ hàng sau đăng nhập:", err);
}


            // Nếu user là Quản lý cửa hàng và có assignedStoreId, lưu vào localStorage
            if (user.role === 'storeManager' && user.assignedStoreId) {
                // Lưu vào localStorage (tồn tại ngay cả khi reload trang)
                localStorage.setItem('managerStoreId', user.assignedStoreId);
                console.log('Stored manager store ID:', user.assignedStoreId);

                // Dispatch event (real-time thông báo cho các component lắng nghe sự kiện này)
                window.dispatchEvent(new CustomEvent('managerStoreAssignment', {
                    detail: { storeId: user.assignedStoreId, trigger: 'login' }
                }));
            }

            return response.data; // Trả về response để xử lý tiếp
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi đăng nhập";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 11. Hàm đăng nhập Google
    loginWithGoogle: async (googleCredential) => {
        set({ isLoading: true, error: null, message: null }); // Đặt trạng thái loading
        try {
            console.log("Gửi thông tin Google credential đến backend...", api.defaults.baseURL + API_ENDPOINT + "/google");

            // Gửi Google credential token đến backend
            const response = await api.post(`${API_ENDPOINT}/google`, {
                credential: googleCredential
            });

            console.log("Phản hồi đăng nhập Google:", response.data);

            // Kiểm tra xem có cần xác minh thêm không
            if (response.data.requiresVerification) {
                console.log("Người dùng Google cần xác minh bổ sung");

                // Đặt trạng thái chờ xác minh
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                    isLoading: false,
                    message: response.data.message,
                    pendingVerification: {
                        email: response.data.user.email,
                        provider: 'google',
                        reason: response.data.verificationReason
                    }
                });

                return {
                    requiresVerification: true,
                    email: response.data.user.email,
                    message: response.data.message,
                    reason: response.data.verificationReason
                };
            }

            // Normal login success - no verification required
            set({
                user: response.data.user, // Save user information from the response
                isAuthenticated: true, // Set isAuthenticated to true
                error: null, // Reset error state
                isLoading: false, // Set loading to false
                message: response.data.message || "Đăng nhập Google thành công",
                pendingVerification: null // Clear any pending verification
            });

            return {
                requiresVerification: false,
                user: response.data.user
            };
        } catch (error) {
            console.error("Google login error:", error);
            // If there is an error, update the error with the message from the server or a default message
            const errorMessage = error.response?.data?.message || "Lỗi đăng nhập Google";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 12. Hàm kiểm tra xác thực
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            if (!data) {
                return null;
            }
            const { data } = await api.get(`${API_ENDPOINT}/check-auth`); // axios phải withCredentials: true
            const user = data?.user || null;

            const rememberMeCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('rememberMe='));
            const rememberMeStatus = rememberMeCookie ? rememberMeCookie.split('=')[1] === 'true' : false;

            console.log("Trạng thái Remember Me:", rememberMeStatus);

            set({
                user,
                isAuthenticated: !!user,
                isCheckingAuth: false,
                error: null,
            });

            // Verify manager store ID on reload
            if (user && user.role === 'storeManager' && user.assignedStoreId) {
                const storedStoreId = localStorage.getItem('managerStoreId');
                console.log('Manager store ID - Backend:', user.assignedStoreId, 'localStorage:', storedStoreId);

                // Chỉ update nếu khác biệt (edge case: admin thay đổi assignment)
                if (storedStoreId !== user.assignedStoreId) {
                    localStorage.setItem('managerStoreId', user.assignedStoreId);
                    console.log('Updated manager store ID:', user.assignedStoreId);

                    // Dispatch event khi có thay đổi
                    window.dispatchEvent(new CustomEvent('managerStoreAssignment', {
                        detail: { storeId: user.assignedStoreId, trigger: 'checkAuth-updated' }
                    }));
                } else if (storedStoreId) {
                    // Dispatch event cho case bình thường (reload page)
                    window.dispatchEvent(new CustomEvent('managerStoreAssignment', {
                        detail: { storeId: user.assignedStoreId, trigger: 'checkAuth-reload' }
                    }));
                }
            }
        } catch (_) {
            // Silent fail - không log vì đây là behavior bình thường khi user chưa đăng nhập
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                error: null,
            });
        }
    },

    //! 13. Hàm kiểm tra tính hợp lệ của token - hữu ích cho trang admin
    checkTokenValidity: async () => {
        console.log("Kiểm tra tính hợp lệ của token...");
        try {
            await api.get(`${API_ENDPOINT}/check-auth`);
            console.log("Token hợp lệ");
            return true;
        } catch (error) {
            console.log("Xác thực token thất bại:", error.response?.status);
            return false;
        }
    },

    //! 14. Hàm đăng xuất
    logout: async () => {
        set({ isLoading: true, error: null }); // Đặt trạng thái loading và reset error
        try {
            // Gửi request POST đến endpoint đăng xuất
            await api.post(`${API_ENDPOINT}/logout`);

            // Clear manager store ID khi logout
            localStorage.removeItem('managerStoreId');

            // Nếu thành công, reset user, isAuthenticated và đặt loading thành false
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi đăng xuất";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 15. Hàm quên mật khẩu
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, message: null }); // Đặt trạng thái loading và reset error, message
        try {
            // Gửi request POST đến endpoint quên mật khẩu với email
            const response = await api.post(`${API_ENDPOINT}/forgot-password`, { email });

            // Nếu thành công, cập nhật trạng thái message
            set({
                message: response.data.message || "Gửi email đặt lại mật khẩu thành công",
                isLoading: false, // Đặt loading thành false
                error: null // Reset trạng thái error
            });
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định
            const errorMessage = error.response?.data?.message || "Lỗi gửi email đặt lại mật khẩu";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 16. Hàm đặt lại mật khẩu
    resetPassword: async (resetData) => {
        set({ isLoading: true, error: null }); // Đặt trạng thái loading và reset error
        try {
            // Gửi request POST đến endpoint đặt lại mật khẩu với resetData
            const response = await api.post(`${API_ENDPOINT}/reset-password/${resetData.token}`, { password: resetData.password });

            // Nếu thành công, cập nhật trạng thái message
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định, tắt loading
            set({
                isLoading: false,
                error: error.response.data.message || "Lỗi đặt lại mật khẩu",
            });
            throw error; // Ném lỗi ra ngoài
        }
    },

    //! 17. Các hàm helper sử dụng get() để truy cập state hiện tại
    getCurrentUser: () => {
        const { user } = get();
        return user;
    },

    getCurrentUserRole: () => {
        const { user } = get();
        return user?.role || null;
    },

    isCurrentUserVerified: () => {
        const { user } = get();
        return user?.isVerified || false;
    },

    hasError: () => {
        const { error } = get();
        return !!error;
    },

    canPerformAction: () => {
        const { isAuthenticated, user, isLoading } = get();
        return isAuthenticated && user && !isLoading;
    },

    //! 18. Hàm xóa lỗi
    clearError: () => set({ error: null }),

    //! 19. Hàm xóa thông báo
    clearMessage: () => set({ message: null }),

    //! 20. Helper function để lấy assignedStoreId của manager
    getManagerStoreId: () => {
        const { user } = get();
        return user?.role === 'storeManager' ? user.assignedStoreId : null;
    }
}));

