//! 1. Import necessary libraries and modules
import { create } from "zustand"; // Zustand create store to manage global state
import axios from "axios"; // Axios for making API requests

//! 2. Identify API URL based on environment (development OR production)
// If mode is in development environment (development), API_URL will be "http://localhost:5000/api/auth"
// If mode is in production environment (production), API_URL will be "/api/auth"
const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

//! 3. Set up axios to always send cookies when making requests (useful for session authentication)
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true // For cookies
});

//! 4. Create zustand store to manage authentication state
export const useAuthStore = create((set) => ({
    // Initialize default states
    user: null, // Save user information after login
    isAuthenticated: false, // Verify if user is authenticated or not
    error: null, // Save error information if any
    isLoading: false, // Loading data state, default is not loading (not making a request)
    isCheckingAuth: true, // This state is used to check if the user is authenticated when the app loads
    message: null, // Save messages from the server (e.g., successful registration message, successful email verification message, etc.)

    //! Register new account function 
    register: async (userData) => {
        set({ isLoading: true, error: null, message: null }); // Set loading state to true and reset error and message states
        try {
            // Send request POST to register endpoint with userData object
            const response = await api.post("/register", userData);
            // If successful, don't login immediately - wait for email verification
            set({
                user: { email: userData.email, isVerified: false }, // permit for verify flow
                isAuthenticated: true,   // has cookie
                isCheckingAuth: false,   // avoid guard redirecting to /login
                message: response.data.message || "Please check your email to verify your account",
                isLoading: false,
                error: null,
            });
            return response.data; // Return response for further handling
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error signing up";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Verify OTP function
    verifyOTP: async (code) => {
        set({ isLoading: true, error: null, message: null });
        try {
            // Send request POST to verify email endpoint with code
            const response = await api.post("/verify-otp", { code });
            // If successful, update user state and set isAuthenticated to true
            set({
                user: response.data.user, // Save user information from the response
                isAuthenticated: true, // Set isAuthenticated to true
                isLoading: false, // Set loading to false
                message: response.data.message || "Email verified successfully", // Save success message
            });
            return response.data; // Return response for further handling
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error verifying email";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Resend verification OTP function
    resendVerificationOTP: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            // Send request POST to resend verification OTP endpoint with email
            const response = await api.post("/resend-otp", { email });

            // If successful, update message state
            set({
                message: response.data.message || "Verification OTP email resent successfully",
                isLoading: false, // Set loading to false
                error: null // Reset error state
            });
            return response.data; // Return response for further handling
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error resending verification email";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Verify email function
    verifyEmail: async (token) => {
        if (!token) {
            const msg = "Thiếu token xác minh";
            set({ error: msg, message: null });
            throw { status: 400, message: msg };
        }

        set({ isLoading: true, error: null, message: null });

        try {
            const { data } = await api.post("/verify-email", { token });
            try {
                const me = await api.get("/check-auth");
                set({
                    user: me?.data?.user ? { ...me.data.user, isVerified: true } : null,
                    isAuthenticated: !!me?.data?.user,
                    message: data?.message || "Xác minh email thành công",
                    isLoading: false,
                    error: null,
                });
            } catch {
                set({
                    message: data?.message || "Xác minh email thành công",
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

    //! Resend verification email function
    resendVerificationEmail: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            // Send request POST to resend verification email endpoint with email
            const response = await api.post("/resend-verification-email", { email });

            // If successful, update message state
            set({
                message: response.data.message || "Verification email resent successfully",
                isLoading: false, // Set loading to false
                error: null // Reset error state
            });
            return response; // Return response for further handling
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error resending verification email";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Login function
    login: async (userData) => {
        set({ isLoading: true, error: null }); // Set state to loading is true and reset error
        try {
            // Send request POST to login endpoint with email and password
            const response = await api.post("/login", userData);

            // If successful, update user state and set isAuthenticated to true
            set({
                user: response.data.user, // Save user information from the response
                isAuthenticated: true, // Set isAuthenticated to true
                error: null, // Reset error state
                isLoading: false // Set loading to false
            });
            return response.data; // Return response for further handling
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error logging in";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Check authentication function
    checkAuth: async () => {
        console.log("🔍 checkAuth started");
        set({ isCheckingAuth: true, error: null });
        try {
            const { data } = await api.get("/check-auth"); // axios phải withCredentials: true
            const user = data?.user || null;
            set({
                user,
                isAuthenticated: !!user,
                isCheckingAuth: false,
                error: null,
            });
        } catch (_) {
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                error: null,
            });
        }
    },

    //! Logout function
    logout: async () => {
        set({ isLoading: true, error: null }); //Set state to loading is true and reset error
        try {
            // Send request POST method to logout endpoint
            await api.post("/logout");
            // If successful, reset user, isAuthenticated and set loading to false
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error logging out";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Forgot password function
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, message: null }); // Set loading state to true and reset error and message states
        try {
            // Send request POST to forgot password endpoint with email
            const response = await api.post("/forgot-password", { email });

            // If successful, update message state
            set({
                message: response.data.message || "Password reset email sent successfully",
                isLoading: false, // Set loading to false
                error: null // Reset error state
            });
        } catch (error) {
            // If there is an error, update the error with the message from the server or a default message, and set loading to false
            const errorMessage = error.response?.data?.message || "Error sending password reset email";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Reset password function
    resetPassword: async (resetData) => {
        set({ isLoading: true, error: null }); // Set loading state to true and reset error
        try {
            // Send request POST to reset password endpoint with resetData
            const response = await api.post(`/reset-password/${resetData.token}`, { password: resetData.password });

            // If successful, update message state
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            // Nếu có lỗi, cập nhật error với thông báo từ server hoặc thông báo mặc định, tắt loading
            set({
                isLoading: false,
                error: error.response.data.message || "Error resetting password",
            });
            throw error; // Ném lỗi ra ngoài
        }
    }
}));

