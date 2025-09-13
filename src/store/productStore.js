//! 1. Import necessary libraries and modules
import { create } from "zustand"; // Zustand create store to manage global state
import axios from "axios"; // Axios for making API requests

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/products" : "/api/products";

//! 3. Set up axios to always send cookies when making requests (useful for session authentication)
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true // For cookies
});

//! Create zustand store to manage product categories
export const useProductStore = create((set, get) => ({
    // Initialize default states
    products: [],
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    },

    // Form data for dropdowns
    formData: {
        categories: [],
        toppings: []
    },

    //! Actions
    setProducts: (products) => set({ products }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),
    setFormData: (formData) => set({ formData }),

    //! Get all products
    getAllProducts: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                search: params.search || "",
                status: params.status || "all",
                category: params.category || "all",
                sortBy: params.sortBy || "createdAt",
                sortOrder: params.sortOrder || "desc"
            });

            const response = await api.get(`?${queryParams}`);

            if (response.data.success) {
                set({
                    products: response.data.products,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Failed to fetch products");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error fetching products";
            set({
                error: errorMessage,
                isLoading: false,
                products: []
            });
            throw error;
        }
    },

    //! Get all categories
    getCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            // Send request to fetch categories from the backend
            const response = await api.get("/categories");
            set({ categories: response.data, isLoading: false });
            return response.data; // Return fetched categories
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error fetching categories";
            set({ error: errorMessage, isLoading: false });
            throw error; // Re-throw the error for further handling
        }
    },

    //! Create product
    createProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post("", productData);
            const newProduct = response.data.success ? response.data.product : response.data;

            // Update local state
            const currentProducts = get().products;
            set({
                products: [newProduct, ...currentProducts],
                isLoading: false
            });

            return newProduct;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error creating product";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Update product
    updateProduct: async (productId, productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/${productId}`, productData);
            const updatedProduct = response.data.success ? response.data.product : response.data;

            // Update local state
            const currentProducts = get().products;
            const updatedProducts = currentProducts.map(product =>
                product._id === productId ? updatedProduct : product
            );
            set({
                products: updatedProducts,
                isLoading: false
            });

            return updatedProduct;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error updating product";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Soft delete product
    softDeleteProduct: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/${productId}/soft-delete`);
            const updatedProduct = response.data.success ? response.data.product : response.data;

            // Update local state
            const currentProducts = get().products;
            const updatedProducts = currentProducts.map(product =>
                product._id === productId ? updatedProduct : product
            );
            set({
                products: updatedProducts,
                isLoading: false
            });

            return updatedProduct;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error updating product status";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! Clear products
    clearProducts: () => {
        set({
            products: [],
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalProducts: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    //! Clear error
    clearError: () => {
        set({ error: null });
    },

    //! Get product by ID (helper)
    getProductById: (productId) => {
        return get().products.find(product => product._id === productId);
    },

    //! Filter products by category (helper)
    getProductsByCategory: (categoryId) => {
        return get().products.filter(product =>
            product.category._id === categoryId && product.status === 'available'
        );
    },

    //! Search products locally (helper)
    searchProducts: (searchTerm) => {
        const products = get().products;
        if (!searchTerm) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
}));