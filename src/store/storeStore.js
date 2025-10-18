//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho cửa hàng
const API_ENDPOINT = "/stores";

//! 3. Tạo zustand store để quản lý các thao tác dữ liệu cửa hàng
export const useStoreStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    stores: [], // Danh sách tất cả cửa hàng
    currentStore: null, // Cửa hàng hiện tại đang được xem/chỉnh sửa
    isLoading: false, // Trạng thái loading cho các thao tác cửa hàng
    error: null, // Trạng thái lỗi cho các thao tác cửa hàng
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }, // Thông tin phân trang cho danh sách cửa hàng

    //! 5. Hàm lấy tất cả cửa hàng
    fetchStores: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
            // Xây dựng query parameters
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                ...params.filters
            });

            const response = await api.get(`${API_ENDPOINT}?${queryParams}`);
            
            // ✅ SỬA: Truy cập đúng cấu trúc response từ backend
            set({
                stores: response.data.data?.stores || [],
                pagination: response.data.data?.pagination || {},
                isLoading: false,
                error: null
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 6. Hàm lấy cửa hàng theo thành phố
    fetchStoresByCity: async (cityName) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.get(`${API_ENDPOINT}/city?city=${cityName}`);
            
            // ✅ SỬA: Truy cập đúng cấu trúc response và endpoint từ backend
            set({
                stores: response.data.data?.stores || [],
                isLoading: false,
                error: null
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy cửa hàng theo thành phố";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 7. Hàm lấy thông tin cửa hàng theo ID
    fetchStoreById: async (storeId) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.get(`${API_ENDPOINT}/${storeId}`);
            
            set({
                currentStore: response.data.data,
                isLoading: false,
                error: null
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy chi tiết cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm tạo cửa hàng mới (Chỉ Admin)
    createStore: async (storeData) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.post(API_ENDPOINT, storeData);
            
            // ✅ SỬA: Truy cập đúng cấu trúc response từ backend
            // Thêm cửa hàng mới vào danh sách hiện tại
            const { stores } = get();
            set({
                stores: [response.data.data, ...stores],
                currentStore: response.data.data,
                isLoading: false,
                error: null
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm cập nhật cửa hàng (Admin/Quản lý cửa hàng)
    updateStore: async (storeId, updateData) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.put(`${API_ENDPOINT}/${storeId}`, updateData);
            
            // ✅ SỬA: Truy cập đúng cấu trúc response từ backend
            // Cập nhật cửa hàng trong danh sách
            const { stores } = get();
            const updatedStores = stores.map(store => 
                store._id === storeId ? response.data.data : store
            );
            
            set({
                stores: updatedStores,
                currentStore: response.data.data,
                isLoading: false,
                error: null
            });
            
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Hàm xóa cửa hàng (Chỉ Admin)
    deleteStore: async (storeId) => {
        set({ isLoading: true, error: null });
        
        try {
            await api.delete(`${API_ENDPOINT}/${storeId}`);
            
            // Xóa cửa hàng khỏi danh sách
            const { stores } = get();
            const filteredStores = stores.filter(store => store._id !== storeId);
            
            set({
                stores: filteredStores,
                currentStore: null,
                isLoading: false,
                error: null
            });
            
            return { success: true, message: "Xóa cửa hàng thành công" };
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi xóa cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 11. Hàm lấy sản phẩm của cửa hàng
    getStoreProducts: async (storeId, params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
            const queryParams = new URLSearchParams(params);
            const response = await api.get(`${API_ENDPOINT}/${storeId}/products?${queryParams}`);
            
            set({ isLoading: false, error: null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy sản phẩm cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 12. Hàm cập nhật sản phẩm cửa hàng (Quản lý cửa hàng)
    updateStoreProducts: async (storeId, productIds) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await api.put(`${API_ENDPOINT}/${storeId}/products`, { products: productIds });
            
            // ✅ SỬA: Truy cập đúng cấu trúc response từ backend
            // Cập nhật cửa hàng hiện tại nếu trùng khớp
            const { currentStore } = get();
            if (currentStore && currentStore._id === storeId) {
                set({ currentStore: response.data.data });
            }
            
            set({ isLoading: false, error: null });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật sản phẩm cửa hàng";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 13. Hàm kiểm tra tình trạng hoạt động cửa hàng
    checkStoreAvailability: async (storeId) => {
        try {
            const response = await api.get(`${API_ENDPOINT}/${storeId}/availability`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi kiểm tra tình trạng cửa hàng";
            set({ error: errorMessage });
            throw error;
        }
    },

    //! 14. Hàm đặt cửa hàng hiện tại
    setCurrentStore: (store) => {
        set({ currentStore: store, error: null });
    },

    //! 15. Hàm xóa cửa hàng hiện tại
    clearCurrentStore: () => {
        set({ currentStore: null, error: null });
    },

    //! 16. Hàm reset danh sách cửa hàng
    clearStores: () => {
        set({ 
            stores: [], 
            currentStore: null, 
            error: null,
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
            }
        });
    },

    //! 17. Hàm xóa lỗi
    clearError: () => {
        set({ error: null });
    }
}));

