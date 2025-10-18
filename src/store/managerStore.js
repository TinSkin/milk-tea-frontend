//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

const API_ENDPOINT = "/stores/my-store";

//! 3. Tạo zustand store để quản lý các thao tác dữ liệu cửa hàng
export const useManagerStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    myStore: null, // Cửa hàng mà manager đang quản lý
    products: [], // Danh sách sản phẩm có trong cửa hàng
    categories: [], // Danh sách categories có trong cửa hàng - cho sidebar filtering
    toppings: [], // Danh sách topping có trong cửa hàng - cho sidebar filtering
    staff: [], // Danh sách nhân viên (staff + customer) của cửa hàng
    manager: null, // Thông tin manager của cửa hàng
    storeInfo: null, // Thông tin cơ bản của cửa hàng
    isLoading: false, // Trạng thái loading cho các thao tác cửa hàng
    error: null, // Trạng thái lỗi cho các thao tác cửa hàng
    stats: null, // Thống kê doanh thu, đơn hàng của cửa hàng
    orders: [], // Danh sách đơn hàng của cửa hàng
    payments: [], // Danh sách phương thức thanh toán của cửa hàng
    currentOrder: null, // Đơn hàng đang xem chi tiết
    orderHistory: [],   // Lịch sử trạng thái đơn hàng
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalCategories: 0,
        totalToppings: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho các danh sách

    //! 5. Action để lấy danh sách sản phẩm của cửa hàng
    fetchMyStoreProducts: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/products`, { params });

            if (response.data.success) {
                set({
                    products: response.data.data.products,
                    storeInfo: response.data.data.storeInfo,
                    pagination: response.data.data.pagination || response.data.pagination,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy sản phẩm cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! 6. Action để lấy danh sách nhân viên của cửa hàng (có phân trang)
    fetchMyStoreStaff: async (params = {}) => {
        set({ isLoading: true, error: null });
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

            const response = await api.get(`${API_ENDPOINT}/staff?${queryParams}`);
            if (response.data.success) {
                set({
                    staff: response.data.data.staff,
                    manager: response.data.data.manager,
                    storeInfo: response.data.data.storeInfo,
                    stats: response.data.data.stats,
                    pagination: response.data.data.pagination,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy danh sách nhân viên",
                isLoading: false
            });
            throw error;
        }
    },

    //! 7. Action để lấy thông tin tổng quan cửa hàng
    fetchMyStore: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINT);

            if (response.data.success) {
                const store = response.data.data;
                set({
                    myStore: store,
                    storeInfo: {
                        _id: store._id,
                        storeName: store.storeName,
                        storeCode: store.storeCode,
                        address: store.address,
                        phone: store.phone,
                        email: store.email
                    },
                    manager: store.manager,
                    staff: store.staff,
                    products: store.products,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy thông tin cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! 8. Action để lấy thống kê cửa hàng
    fetchMyStoreStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/stats`);

            if (response.data.success) {
                set({
                    stats: response.data.data,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy thống kê cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy thống kê cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! 9. Action để lấy danh sách đơn hàng
    fetchMyStoreOrders: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/orders`, { params });

            if (response.data.success) {
                set({
                    orders: response.data.data.orders,
                    pagination: response.data.data.pagination,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy danh sách đơn hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Lấy chi tiết đơn hàng
    fetchOrderDetail: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/orders/${orderId}?t=${Date.now()}`);

            if (response.data.success) {
                set({
                    currentOrder: response.data.data,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy chi tiết đơn hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (orderId, statusData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/orders/${orderId}/status`, statusData);

            if (response.data.success) {
                // Cập nhật lại danh sách đơn hàng
                const { orders, currentOrder } = get();
                const updatedOrders = orders.map(order =>
                    order._id === orderId
                        ? { ...order, status: statusData.status }
                        : order
                );

                const updatedCurrentOrder = currentOrder && currentOrder._id === orderId
                    ? { ...currentOrder, status: statusData.status }
                    : currentOrder;
                set({
                    orders: updatedOrders,
                    currentOrder: updatedCurrentOrder,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Cập nhật trạng thái thanh toán
    updatePaymentStatus: async (orderId, paymentData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/orders/${orderId}/payment-status`, paymentData);

            if (response.data.success) {
                // Cập nhật lại danh sách đơn hàng
                const { orders, currentOrder } = get();
                const updatedOrders = orders.map(order =>
                    order._id === orderId
                        ? { ...order, paymentStatus: paymentData.paymentStatus }
                        : order
                );

                const updatedCurrentOrder = currentOrder && currentOrder._id === orderId
                    ? { ...currentOrder, paymentStatus: paymentData.paymentStatus }
                    : currentOrder;

                set({
                    orders: updatedOrders,
                    currentOrder: updatedCurrentOrder,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán",
                isLoading: false
            });
            throw error;
        }
    },

    //! Hủy đơn hàng
    cancelOrder: async (orderId, reason) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/orders/${orderId}/cancel`, { reason });

            if (response.data.success) {
                // Cập nhật lại danh sách đơn hàng
                const { orders, currentOrder } = get();
                const updatedOrders = orders.map(order =>
                    order._id === orderId
                        ? {
                            ...order,
                            status: "cancelled",
                            paymentStatus: "failed"
                        }
                        : order
                );

                const updatedCurrentOrder = currentOrder && currentOrder._id === orderId
                    ? {
                        ...currentOrder,
                        status: "cancelled",
                        paymentStatus: "failed"
                    }
                    : currentOrder;

                set({
                    orders: updatedOrders,
                    currentOrder: updatedCurrentOrder,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi hủy đơn hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Lấy lịch sử trạng thái đơn hàng
    fetchOrderStatusHistory: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/orders/${orderId}/history`);

            if (response.data.success) {
                set({
                    orderHistory: response.data.data.history,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy lịch sử đơn hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Action để clear current order - THÊM VÀO SAU fetchOrderStatusHistory
    clearCurrentOrder: () => {
        set({
            currentOrder: null,
            orderHistory: []
        });
    },
    //! 10. Action để lấy danh sách categories của cửa hàng
    fetchMyStoreCategories: async (params = {}) => {
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

            const response = await api.get(`${API_ENDPOINT}/categories?${queryParams}`);

            if (response.data.success) {
                set({
                    categories: response.data.data.categories,
                    storeInfo: response.data.data.storeInfo,
                    pagination: response.data.data.pagination,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách categories:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy danh sách categories",
                isLoading: false
            });
            throw error;
        }
    },

    //! 11. Action để lấy danh sách toppings của cửa hàng
    fetchMyStoreToppings: async (params = {}) => {
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

            const response = await api.get(`${API_ENDPOINT}/toppings?${queryParams}`);

            if (response.data.success) {
                set({
                    toppings: response.data.data.toppings,
                    storeInfo: response.data.data.storeInfo,
                    pagination: response.data.data.pagination,
                    isLoading: false
                });
                return response.data;
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách toppings:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi lấy danh sách toppings",
                isLoading: false
            });
            throw error;
        }
    },

    //! Action để cập nhật sản phẩm của cửa hàng (chỉ storeStatus)
    updateMyStoreProduct: async (productId, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/products/${productId}`, updateData);

            if (response.data.success) {
                const updatedProduct = response.data.data;
                
                // Cập nhật state local
                const currentProducts = get().products;
                const updatedProducts = currentProducts.map(product =>
                    product._id === productId ? updatedProduct : product
                );
                
                set({
                    products: updatedProducts,
                    isLoading: false,
                    error: null
                });

                return updatedProduct;
            } else {
                throw new Error(response.data.message || "Không thể cập nhật sản phẩm");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi cập nhật sản phẩm cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Action để cập nhật danh mục của cửa hàng (chỉ storeStatus)
    updateMyStoreCategory: async (categoryId, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/categories/${categoryId}`, updateData);

            if (response.data.success) {
                const updatedCategory = response.data.data;
                
                // Cập nhật state local
                const currentCategories = get().categories;
                const updatedCategories = currentCategories.map(category =>
                    category._id === categoryId ? updatedCategory : category
                );
                
                set({
                    categories: updatedCategories,
                    isLoading: false,
                    error: null
                });

                return updatedCategory;
            } else {
                throw new Error(response.data.message || "Không thể cập nhật danh mục");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi cập nhật danh mục cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! Action để cập nhật topping của cửa hàng (chỉ storeStatus)
    updateMyStoreTopping: async (toppingId, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`${API_ENDPOINT}/toppings/${toppingId}`, updateData);

            if (response.data.success) {
                const updatedTopping = response.data.data;
                
                // Cập nhật state local
                const currentToppings = get().toppings;
                const updatedToppings = currentToppings.map(topping =>
                    topping._id === toppingId ? updatedTopping : topping
                );
                
                set({
                    toppings: updatedToppings,
                    isLoading: false,
                    error: null
                });

                return updatedTopping;
            } else {
                throw new Error(response.data.message || "Không thể cập nhật topping");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật topping cửa hàng:", error);
            set({
                error: error.response?.data?.message || "Lỗi khi cập nhật topping cửa hàng",
                isLoading: false
            });
            throw error;
        }
    },

    //! 12. Action để reset state
    resetStore: () => {
        set({
            myStore: null,
            products: [],
            categories: [],
            toppings: [],
            staff: [],
            manager: null,
            storeInfo: null,
            isLoading: false,
            error: null,
            stats: null,
            orders: [],
            payments: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
            }
        });
    },

    //! 11. Action để clear error
    clearError: () => {
        set({ error: null });
    }
}));