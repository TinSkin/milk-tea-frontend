//! 1. Import các thư viện và module cần thiết
import { create } from "zustand"; // Zustand create store để quản lý trạng thái toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho topping
const API_ENDPOINT = "/toppings";

//! 3. Tạo zustand store để quản lý topping
export const useToppingStore = create((set, get) => ({
    //! 4. Khởi tạo trạng thái mặc định
    toppings: [], // Mảng chứa tất cả đối tượng topping
    isLoading: false, // Trạng thái loading cho API requests
    error: null, // Trạng thái lỗi cho API requests
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalToppings: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách topping

    //! 5. Hàm lấy tất cả topping
    getAllToppings: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                search: params.search || "",
                status: params.status || "all",
                sortBy: params.sortBy || "createdAt",
                sortOrder: params.sortOrder || "desc"
            });

            const response = await api.get(`${API_ENDPOINT}?${queryParams}`);

            if (response.data.success) {
                set({
                    toppings: response.data.toppings,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Lỗi lấy danh sách topping");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách topping";
            set({
                error: errorMessage,
                isLoading: false,
                toppings: []
            });
            throw error;
        }
    },

    //! 6. Hàm tạo topping mới
    createTopping: async (toppingData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Đang tạo topping:", toppingData);

            const response = await api.post(API_ENDPOINT, toppingData);
            const newTopping = response.data.success ? response.data.topping : response.data;

            // Cập nhật trạng thái local
            const currentToppings = get().toppings;
            set({
                toppings: [newTopping, ...currentToppings],
                isLoading: false
            });

            return newTopping;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 7. Hàm cập nhật topping
    updateTopping: async (toppingId, toppingData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Đang cập nhật topping:", toppingId, toppingData);
            const response = await api.put(`${API_ENDPOINT}/${toppingId}`, toppingData);
            const updatedTopping = response.data.success ? response.data.topping : response.data;

            // Cập nhật trạng thái local
            const currentToppings = get().toppings;
            const updatedToppings = currentToppings.map(topping =>
                topping._id === toppingId ? updatedTopping : topping
            );
            set({
                toppings: updatedToppings,
                isLoading: false
            });

            return updatedTopping;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm xóa vĩnh viễn topping (hard delete)
    deleteTopping: async (toppingId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Đang xóa vĩnh viễn topping:", toppingId);
            const response = await api.delete(`${API_ENDPOINT}/${toppingId}`);

            // Xóa khỏi trạng thái local
            const currentToppings = get().toppings;
            const filteredToppings = currentToppings.filter(topping => topping._id !== toppingId);
            set({
                toppings: filteredToppings,
                isLoading: false
            });

            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi xóa topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm xóa mềm topping (soft delete)
    softDeleteTopping: async (toppingId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Đang thay đổi trạng thái topping:", toppingId);
            const response = await api.post(`${API_ENDPOINT}/${toppingId}/soft-delete`);
            const updatedTopping = response.data.success ? response.data.topping : response.data;

            // Cập nhật trạng thái local
            const currentToppings = get().toppings;
            const updatedToppings = currentToppings.map(topping =>
                topping._id === toppingId ? updatedTopping : topping
            );
            set({
                toppings: updatedToppings,
                isLoading: false
            });

            return updatedTopping;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi thay đổi trạng thái topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Các hàm quản lý trạng thái
    setToppings: (toppings) => set({ toppings }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    clearToppings: () => {
        set({
            toppings: [],
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalToppings: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    clearError: () => {
        set({ error: null });
    },

    //! 11. Các hàm helper sử dụng get() để truy cập trạng thái hiện tại
    getCurrentToppings: () => {
        const { toppings } = get();
        return toppings;
    },

    getToppingById: (toppingId) => {
        const { toppings } = get();
        return toppings.find(topping => topping._id === toppingId) || null;
    },

    getAvailableToppings: () => {
        const { toppings } = get();
        return toppings.filter(topping => topping.status === 'available');
    },

    getToppingsByPriceRange: (minPrice, maxPrice) => {
        const { toppings } = get();
        return toppings.filter(topping => 
            topping.price >= minPrice && topping.price <= maxPrice
        );
    },

    getToppingsCount: () => {
        const { toppings } = get();
        return toppings.length;
    },

    hasToppings: () => {
        const { toppings } = get();
        return toppings.length > 0;
    },

    isLoadingToppings: () => {
        const { isLoading } = get();
        return isLoading;
    },

    hasToppingError: () => {
        const { error } = get();
        return !!error;
    }
}));