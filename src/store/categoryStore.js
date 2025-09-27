//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho danh mục
const API_ENDPOINT = "/categories";

//! 3. Tạo zustand store để quản lý danh mục sản phẩm
export const useCategoryStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    categories: [], // Danh sách tất cả danh mục
    isLoading: false, // Trạng thái loading cho các thao tác danh mục
    error: null, // Trạng thái lỗi cho các thao tác danh mục
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCategories: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách danh mục

    //! 5. Hàm lấy tất cả danh mục
    getAllCategories: async (params = {}) => {
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
                    categories: response.data.categories,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Không thể lấy danh sách danh mục");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách danh mục";
            set({
                error: errorMessage,
                isLoading: false,
                categories: []
            });
            throw error;
        }
    },

    //! 6. Hàm tạo danh mục
    createCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(API_ENDPOINT, categoryData);
            const newCategory = response.data.success ? response.data.category : response.data;

            // Cập nhật state local
            const currentCategories = get().categories;
            set({
                categories: [newCategory, ...currentCategories],
                isLoading: false
            });

            return newCategory;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo danh mục";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 7. Hàm cập nhật danh mục
    updateCategory: async (categoryId, categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/${categoryId}`, categoryData);
            const updatedCategory = response.data.success ? response.data.category : response.data;

            // Cập nhật state local
            const currentCategories = get().categories;
            const updatedCategories = currentCategories.map(category =>
                category._id === categoryId ? updatedCategory : category
            );
            set({
                categories: updatedCategories,
                isLoading: false
            });

            return updatedCategory;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật danh mục";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm xóa mềm danh mục
    softDeleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Xóa mềm danh mục với ID:", categoryId);
            const response = await api.post(`${API_ENDPOINT}/${categoryId}/soft-delete`);
            const updatedCategory = response.data.success ? response.data.category : response.data;

            // Cập nhật state local
            const currentCategories = get().categories;
            const updatedCategories = currentCategories.map(category =>
                category._id === categoryId ? updatedCategory : category
            );
            set({
                categories: updatedCategories,
                isLoading: false
            });

            return updatedCategory;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật trạng thái danh mục";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm xóa cứng danh mục
    deleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.delete(`${API_ENDPOINT}/${categoryId}`);
            if (response.data.success) {
                // Xóa khỏi state local
                const currentCategories = get().categories;
                const updatedCategories = currentCategories.filter(category => category._id !== categoryId);
                set({
                    categories: updatedCategories,
                    isLoading: false
                });
                return response.data;
            } else {
                throw new Error(response.data.message || "Không thể xóa danh mục");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi xóa danh mục";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Hàm đồng bộ danh mục với sản phẩm
    syncCategoriesWithProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/sync-products`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi đồng bộ danh mục với sản phẩm";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 11. Các hàm quản lý state
    setCategories: (categories) => set({ categories }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    clearCategories: () => {
        set({
            categories: [],
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalCategories: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    clearError: () => {
        set({ error: null });
    },

    //! 12. Các hàm helper sử dụng get() để truy cập state hiện tại
    getCurrentCategories: () => {
        const { categories } = get();
        return categories;
    },

    getCategoryById: (categoryId) => {
        const { categories } = get();
        return categories.find(category => category._id === categoryId) || null;
    },

    getActiveCategories: () => {
        const { categories } = get();
        return categories.filter(category => category.status === 'active');
    },

    getCategoriesCount: () => {
        const { categories } = get();
        return categories.length;
    },

    hasCategories: () => {
        const { categories } = get();
        return categories.length > 0;
    },

    isLoadingCategories: () => {
        const { isLoading } = get();
        return isLoading;
    },

    hasCategoryError: () => {
        const { error } = get();
        return !!error;
    }
}));