import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Base API URLs
const BASE_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:5000/api" 
    : "https://milk-tea-backend-s4s2.onrender.com/api";

// Create shared axios instance
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // For cookies
});

// Global response interceptor for auto-logout
api.interceptors.response.use(
    (response) => {
        console.log("✅ API Response success:", response.config.url);
        return response;
    },
    (error) => {
        console.log("❌ API Error:", error.response?.status, error.config?.url);
        
        // Auto logout on 401 (token expired)
        if (error.response?.status === 401) {
            console.log("🔴 Token expired, auto logout from shared axios interceptor");
            
            // Show notification
            import("../components/Notification").then((module) => {
                module.default.warning("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
            }).catch(() => {
                console.log("⚠️ Notification not available");
            });
            
            // Clear auth store
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                error: "Phiên đăng nhập đã hết hạn"
            });
            
            console.log("🔴 Store state cleared by shared interceptor");
        }
        return Promise.reject(error);
    }
);

// Create API instances for different endpoints
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

// Apply interceptor to all API instances
[authAPI, productAPI, userAPI, categoryAPI, toppingAPI].forEach(instance => {
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.log("🔴 Token expired, auto logout");
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