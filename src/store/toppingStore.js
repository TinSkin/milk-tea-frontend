//! 1. Import necessary libraries and modules
import { create } from "zustand"; // Zustand create store to manage global state
import api from "../api/axios"; // Shared axios instance with interceptor

//! 2. API endpoint for toppings
const API_ENDPOINT = "/toppings";

//! Create zustand store to manage product categories
export const useToppingStore = create((set, get) => ({
    // Initialize default states
    toppings: [], // Array to hold all topping objects
    isLoading: false, // Loading state for API requests
    error: null, // Error state for API requests
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalToppings: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    },

    //! Define actions to update the user store
    setToppings: (toppings) => set({ toppings }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    //! Fetch all toppings
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
                throw new Error(response.data.message || "Failed to fetch toppings");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error fetching toppings";
            set({
                error: errorMessage,
                isLoading: false,
                toppings: []
            });
            throw error;
        }
    },

    //! Create topping
    createTopping: async (toppingData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Creating topping:", toppingData);

            const response = await api.post(API_ENDPOINT, toppingData);
            const newTopping = response.data.success ? response.data.topping : response.data;

            // Update local state
            const currentToppings = get().toppings;
            set({
                toppings: [newTopping, ...currentToppings],
                isLoading: false
            });

            return newTopping;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error creating topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Update topping
    updateTopping: async (toppingId, toppingData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Updating topping:", toppingId, toppingData);
            const response = await api.put(`${API_ENDPOINT}/${toppingId}`, toppingData);
            const updatedTopping = response.data.success ? response.data.topping : response.data;

            // Update local state
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
            const errorMessage = error.response?.data?.message || "Error updating topping";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Clear toppings
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

    //! Clear error
    clearError: () => {
        set({ error: null });
    }
}));