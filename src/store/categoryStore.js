//! 1. Import necessary libraries and modules
import { create } from "zustand"; // Zustand create store to manage global state
import axios from "axios"; // Axios for making API requests

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/categories" : "/api/categories";

//! 3. Set up axios to always send cookies when making requests (useful for session authentication)
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true // For cookies
});

//! Create zustand store to manage product categories
export const useCategoryStore = create((set, get) => ({
    //! State
    categories: [],
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCategories: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    },

    //! Actions
    setCategories: (categories) => set({ categories }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    //! Get all categories
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

            const response = await api.get(`/?${queryParams}`);

            if (response.data.success) {
                set({
                    categories: response.data.categories,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Failed to fetch categories");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error fetching categories";
            set({
                error: errorMessage,
                isLoading: false,
                categories: []
            });
            throw error;
        }
    },

    //! Create category
    createCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post("/", categoryData);
            const newCategory = response.data.success ? response.data.category : response.data;

            // Update local state
            const currentCategories = get().categories;
            set({
                categories: [newCategory, ...currentCategories],
                isLoading: false
            });

            return newCategory;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error creating category";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Update category
    updateCategory: async (categoryId, categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/${categoryId}`, categoryData);
            const updatedCategory = response.data.success ? response.data.category : response.data;

            // Update local state
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
            const errorMessage = error.response?.data?.message || "Error updating category";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Soft delete category
    softDeleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Soft deleting category with ID:", categoryId);
            const response = await api.post(`/${categoryId}/soft-delete`);
            const updatedCategory = response.data.success ? response.data.category : response.data;

            // Update local state
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
            const errorMessage = error.response?.data?.message || "Error updating category status";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Hard delete category
    deleteCategory: async (categoryId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.delete(`/${categoryId}`);
            if (response.data.success) {
                // Xóa khỏi local state
                const currentCategories = get().categories;
                const updatedCategories = currentCategories.filter(category => category._id !== categoryId);
                set({
                    categories: updatedCategories,
                    isLoading: false
                });
                return response.data;
            } else {
                throw new Error(response.data.message || "Failed to delete category");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error deleting category";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Sync categories with products
    syncCategoriesWithProducts: async () => {
        set({ isSyncing: true, error: null });
        try {
            const response = await api.post("/sync-products");
            set({ isSyncing: false });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error syncing categories with products";
            set({ error: errorMessage, isSyncing: false });
            throw error;
        }
    },

    //! Clear categories
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

    //! Clear error
    clearError: () => {
        set({ error: null });
    }
}));