//! 1. Import necessary libraries and modules
import { create } from "zustand"; // Zustand create store to manage global state
import api from "../api/axios"; // Shared axios instance with interceptor

//! 2. API endpoint for users
const API_ENDPOINT = "/users";

export const useUserStore = create((set) => ({
    // Initialize default states
    users: [], // User information will be stored here
    isLoading: false, // Loading state for async operations
    error: null, // Error state for handling errors
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    },

    //! Define actions to update the user store
    setUsers: (users) => set({ users }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    //! Get all users (pagination, filter, search included)
    getAllUsers: async (params = {}) => {
        set({ isLoading: true, error: null }); // Set loading state and clear previous errors
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                search: params.search || "",
                status: params.status || "all",
                role: params.role || "all",
                sortBy: params.sortBy || "createdAt",
                sortOrder: params.sortOrder || "desc",
                isVerified: params.isVerified || "all"
            });

            const response = await api.get(`${API_ENDPOINT}?${queryParams}`); // Make GET request to fetch user data

            // Handle different response structures
            if (response.data.success) {
                set({
                    users: response.data.users,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Failed to fetch users");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error fetching accounts";
            set({
                error: errorMessage,
                isLoading: false,
                users: []
            });
            throw error;
        }
    },

    //! Clear users
    clearUsers: () => {
        set({ users: [], error: null });
    },

    //! Clear error
    clearError: () => {
        set({ error: null });
    }
}));