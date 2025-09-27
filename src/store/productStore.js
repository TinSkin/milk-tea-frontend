//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho sản phẩm
const API_ENDPOINT = "/products";

//! 3. Tạo zustand store để quản lý sản phẩm
export const useProductStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    products: [], // Danh sách tất cả sản phẩm
    isLoading: false, // Trạng thái loading cho các thao tác sản phẩm
    error: null, // Trạng thái lỗi cho các thao tác sản phẩm
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách sản phẩm
    formData: {
        categories: [],
        toppings: []
    }, // Dữ liệu form cho dropdown

    //! 5. Hàm lấy tất cả sản phẩm
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

            const response = await api.get(`${API_ENDPOINT}?${queryParams}`);

            if (response.data.success) {
                set({
                    products: response.data.products,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Không thể lấy danh sách sản phẩm");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách sản phẩm";
            set({
                error: errorMessage,
                isLoading: false,
                products: []
            });
            throw error;
        }
    },

    //! 6. Hàm lấy danh mục
    getCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            // Gửi request để lấy danh mục từ backend
            const response = await api.get(`${API_ENDPOINT}/categories`);
            set({ categories: response.data, isLoading: false });
            return response.data; // Trả về danh sách danh mục
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách danh mục";
            set({ error: errorMessage, isLoading: false });
            throw error; // Ném lại lỗi để xử lý tiếp
        }
    },

    //! 7. Hàm tạo sản phẩm
    createProduct: async (productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(API_ENDPOINT, productData);
            const newProduct = response.data.success ? response.data.product : response.data;

            // Cập nhật state local
            const currentProducts = get().products;
            set({
                products: [newProduct, ...currentProducts],
                isLoading: false
            });

            return newProduct;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo sản phẩm";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm cập nhật sản phẩm
    updateProduct: async (productId, productData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/${productId}`, productData);
            const updatedProduct = response.data.success ? response.data.product : response.data;

            // Cập nhật state local
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
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật sản phẩm";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm xóa mềm sản phẩm
    softDeleteProduct: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/${productId}/soft-delete`);
            const updatedProduct = response.data.success ? response.data.product : response.data;

            // Cập nhật state local
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
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật trạng thái sản phẩm";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Các hàm quản lý state
    setProducts: (products) => set({ products }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),
    setFormData: (formData) => set({ formData }),

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

    clearError: () => {
        set({ error: null });
    },

    //! 11. Các hàm helper sử dụng get() để truy cập state hiện tại
    getCurrentProducts: () => {
        const { products } = get();
        return products;
    },

    getProductById: (productId) => {
        const { products } = get();
        return products.find(product => product._id === productId) || null;
    },

    getProductsByCategory: (categoryId) => {
        const { products } = get();
        return products.filter(product =>
            product.category._id === categoryId && product.status === 'available'
        );
    },

    getAvailableProducts: () => {
        const { products } = get();
        return products.filter(product => product.status === 'available');
    },

    searchProducts: (searchTerm) => {
        const { products } = get();
        if (!searchTerm) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },

    getProductsCount: () => {
        const { products } = get();
        return products.length;
    },

    hasProducts: () => {
        const { products } = get();
        return products.length > 0;
    },

    isLoadingProducts: () => {
        const { isLoading } = get();
        return isLoading;
    },

    hasProductError: () => {
        const { error } = get();
        return !!error;
    }
}));