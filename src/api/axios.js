import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Base API URLs - Sử dụng environment variables có sẵn
const BASE_URL = import.meta.env.MODE === "development"
  ? `${import.meta.env.VITE_API_BASE}/api`
  : `${import.meta.env.VITE_API_BASE_PROD}/api`;

// Debug logging for production
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🌐 Base URL:', BASE_URL);
console.log('📊 Env vars:', {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  VITE_API_BASE_PROD: import.meta.env.VITE_API_BASE_PROD
});

// Tạo instance axios với cấu hình chung
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // Gửi cookie cùng request (nếu cần)
});

// Request interceptor để tự động gắn token vào header Authorization
//  - Lấy token trực tiếp từ Zustand store (sử dụng getState để tránh hook rules)
//  - Gắn header Authorization nếu có token
api.interceptors.request.use(
  (config) => {
    try {
      // Tìm token ở một vài chỗ thường gặp
      const state = useAuthStore.getState();
      const token = state?.user?.token || state?.token || state?.accessToken;

      if (token) {
        // đảm bảo giữ các headers khác
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
    } catch (e) {
      console.error("Auth request interceptor error:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor cho tự động logout khi nhận 401 từ server
api.interceptors.response.use(
  (response) => {
    // Chỉ log success khi không phải check-auth
    if (!response.config.url?.includes('/check-auth')) {
      console.log("API Response success:", response.config.url);
    }
    return response;
  },
  (error) => {
    // Không log lỗi 401 cho check-auth vì đó là behavior bình thường
    const isCheckAuth = error.config?.url?.includes('/check-auth');
    const is401 = error.response?.status === 401;

    if (!isCheckAuth || !is401) {
      console.log("API Error:", error.response?.status, error.config?.url);
    }

    // Auto logout on 401 (token expired) - nhưng bỏ qua check-auth
    if (error.response?.status === 401 && !isCheckAuth) {
      console.log("Token expired, auto logout from shared axios interceptor");

      // Show notification
      import("../components/ui/Notification").then((module) => {
        module.default.warning("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
      }).catch(() => {
        console.log("Notification not available");
      });

      // Clear auth store
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        error: "Phiên đăng nhập đã hết hạn"
      });

      console.log("Store state cleared by shared interceptor");
    }
    return Promise.reject(error);
  }
);

// Tạo API instances cho các endpoint khác nhau
export const authAPI = axios.create({
  baseURL: `${BASE_URL}/auth`,
  withCredentials: true
});

export const productAPI = axios.create({
  baseURL: `${BASE_URL}/products`,
  withCredentials: true
});

export const userAPI = axios.create({
  baseURL: `${BASE_URL}/users`,
  withCredentials: true
});

export const categoryAPI = axios.create({
  baseURL: `${BASE_URL}/categories`,
  withCredentials: true
});

export const toppingAPI = axios.create({
  baseURL: `${BASE_URL}/toppings`,
  withCredentials: true
});

//  ÁP DỤNG REQUEST INTERCEPTOR CHO CÁC INSTANCE KHÁC
//  - Hàm tiện ích để attach interceptor vào nhiều instance
const attachAuthRequestInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const state = useAuthStore.getState();
      const token = state?.user?.token || state?.token || state?.accessToken;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Sử dụng interceptor chung cho các instance khác
[authAPI, productAPI, userAPI, categoryAPI, toppingAPI].forEach(instance => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log("Token expired, auto logout");
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          error: "Phiên đăng nhập đã hết hạn"
        });
      }
      return Promise.reject(error);
    }
  );
});

export default api;