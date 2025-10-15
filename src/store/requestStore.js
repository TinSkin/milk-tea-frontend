//! Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! API endpoint - tương tự logic trong axios.js
const MANAGER_API_ENDPOINT = "/manager/requests";
const ADMIN_API_ENDPOINT = "/admin/requests";

//! Store quản lý request (Zustand)
const useRequestStore = create((set, get) => ({
    requests: [], // Danh sách request của CHT
    adminRequests: [], // Danh sách request của Admin
    loading: false, // Trạng thái loading chung
    error: null, // Lỗi chung

    //! Tạo request mới (CHT gửi yêu cầu)
    createRequest: async (requestData, type, action) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`${MANAGER_API_ENDPOINT}/${type}/${action}`, requestData);
            // Thêm request mới vào danh sách
            set((state) => ({ requests: [response.data, ...state.requests] }));
            return response.data;
        } catch (error) {
            set({ error: error.message || "Lỗi không xác định" });
        } finally {
            set({ loading: false });
        }
    },
})); 