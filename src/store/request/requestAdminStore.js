//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho request admin
const API_ENDPOINT = "/admin/requests";

//! 3. Tạo zustand store để quản lý requests cho Admin
export const useRequestAdminStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    requests: [], // Danh sách tất cả requests trong hệ thống
    currentRequest: null, // Request hiện tại đang xem/xử lý
    isLoading: false, // Trạng thái loading cho các thao tác request
    error: null, // Trạng thái lỗi cho các thao tác request
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalRequests: 0,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách requests
    filters: {
        search: "",
        status: "all",
        entity: "all", 
        action: "all",
        storeId: "",
        userId: "",
        approverId: "",
        from: "",
        to: "",
        sortBy: "createdAt",
        sortOrder: "desc"
    }, // Bộ lọc cho admin

    //! 5. Hàm lấy tất cả requests trong hệ thống (cho Admin)
    getAllRequests: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams({
                page: params.page || get().pagination.currentPage || 1,
                limit: params.limit || get().pagination.limit || 20,
                search: params.search || get().filters.search || "",
                status: params.status || get().filters.status || "all",
                entity: params.entity || get().filters.entity || "all",
                action: params.action || get().filters.action || "all",
                storeId: params.storeId || get().filters.storeId || "",
                userId: params.userId || get().filters.userId || "",
                approverId: params.approverId || get().filters.approverId || "",
                from: params.from || get().filters.from || "",
                to: params.to || get().filters.to || "",
                sortBy: params.sortBy || get().filters.sortBy || "createdAt",
                sortOrder: params.sortOrder || get().filters.sortOrder || "desc"
            });

            // Lọc bỏ các tham số rỗng hoặc "all"
            const filteredParams = new URLSearchParams();
            for (const [key, value] of queryParams) {
                if (value && value !== "" && value !== "all") {
                    filteredParams.append(key, value);
                } else if (key === "page" || key === "limit" || key === "sortBy" || key === "sortOrder") {
                    // Luôn giữ các tham số này
                    filteredParams.append(key, value || (key === "page" ? "1" : key === "limit" ? "20" : key === "sortBy" ? "createdAt" : "desc"));
                }
            }

            const response = await api.get(`${API_ENDPOINT}?${filteredParams}`);

            if (response.data.success) {
                set({
                    requests: response.data.requests,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                // Cập nhật filters với params thực tế đã sử dụng
                set((state) => ({
                    filters: { ...state.filters, ...params }
                }));

                return response.data;
            } else {
                throw new Error(response.data.message || "Không thể lấy danh sách requests");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách requests";
            set({
                error: errorMessage,
                isLoading: false,
                requests: []
            });
            throw error;
        }
    },

    //! 6. Hàm lấy chi tiết một request theo ID (cho Admin)
    getRequestById: async (requestId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`${API_ENDPOINT}/${requestId}`);

            if (response.data.success) {
                set({
                    currentRequest: response.data.data,
                    isLoading: false,
                    error: null
                });

                return response.data.data;
            } else {
                throw new Error(response.data.message || "Không thể lấy chi tiết request");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy chi tiết request";
            set({
                error: errorMessage,
                isLoading: false,
                currentRequest: null
            });
            throw error;
        }
    },

    //! 7. Hàm phê duyệt request (Admin approve)
    approveRequest: async (requestId, note = "") => {
        set({ isLoading: true, error: null });
        try {
            console.log("Store approveRequest called with:", { requestId, note });
            const response = await api.post(`${API_ENDPOINT}/${requestId}/approve`, { note });
            console.log("Approve response:", response.data);

            if (response.data.success) {
                const approvedRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                const updatedRequests = currentRequests.map(request =>
                    request._id === requestId ? approvedRequest : request
                );
                set({
                    requests: updatedRequests,
                    currentRequest: approvedRequest,
                    isLoading: false,
                    error: null
                });

                return approvedRequest;
            } else {
                throw new Error(response.data.message || "Không thể phê duyệt request");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi phê duyệt request";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm từ chối request (Admin reject)
    rejectRequest: async (requestId, note = "") => {
        set({ isLoading: true, error: null });
        try {
            console.log("Store rejectRequest called with:", { requestId, note });
            console.log("API base URL:", api.defaults.baseURL);
            console.log("Full API endpoint:", `${API_ENDPOINT}/${requestId}/reject`);
            console.log("Request body:", { note });
            
            const response = await api.post(`${API_ENDPOINT}/${requestId}/reject`, { note });
            console.log("Reject response:", response.data);

            if (response.data.success) {
                const rejectedRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                const updatedRequests = currentRequests.map(request =>
                    request._id === requestId ? rejectedRequest : request
                );
                set({
                    requests: updatedRequests,
                    currentRequest: rejectedRequest,
                    isLoading: false,
                    error: null
                });

                return rejectedRequest;
            } else {
                throw new Error(response.data.message || "Không thể từ chối request");
            }
        } catch (error) {
            console.error("Reject request error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            const errorMessage = error.response?.data?.message || "Lỗi từ chối request";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm phê duyệt hàng loạt requests
    bulkApproveRequests: async (requestIds, note = "") => {
        set({ isLoading: true, error: null });
        try {
            const approvedRequests = [];
            const errors = [];

            for (const requestId of requestIds) {
                try {
                    const result = await get().approveRequest(requestId, note);
                    approvedRequests.push(result);
                } catch (error) {
                    errors.push({ requestId, error: error.message });
                }
            }

            set({ isLoading: false });

            return {
                approved: approvedRequests,
                errors: errors,
                success: errors.length === 0
            };
        } catch (error) {
            const errorMessage = "Lỗi phê duyệt hàng loạt requests";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Hàm từ chối hàng loạt requests
    bulkRejectRequests: async (requestIds, note = "") => {
        set({ isLoading: true, error: null });
        try {
            const rejectedRequests = [];
            const errors = [];

            for (const requestId of requestIds) {
                try {
                    const result = await get().rejectRequest(requestId, note);
                    rejectedRequests.push(result);
                } catch (error) {
                    errors.push({ requestId, error: error.message });
                }
            }

            set({ isLoading: false });

            return {
                rejected: rejectedRequests,
                errors: errors,
                success: errors.length === 0
            };
        } catch (error) {
            const errorMessage = "Lỗi từ chối hàng loạt requests";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 11. Các hàm quản lý filters và search
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }));
    },

    resetFilters: () => {
        set({
            filters: {
                search: "",
                status: "all",
                entity: "all",
                action: "all",
                storeId: "",
                userId: "",
                approverId: "",
                from: "",
                to: "",
                sortBy: "createdAt",
                sortOrder: "desc"
            }
        });
    },

    //! 12. Các hàm quản lý state
    setRequests: (requests) => set({ requests }),
    setCurrentRequest: (request) => set({ currentRequest: request }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    clearRequests: () => {
        set({
            requests: [],
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalRequests: 0,
                limit: 20,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    clearCurrentRequest: () => {
        set({ currentRequest: null });
    },

    clearError: () => {
        set({ error: null });
    },

    //! 13. Các hàm helper sử dụng get() để truy cập state hiện tại
    getCurrentRequests: () => {
        const { requests } = get();
        return requests;
    },

    getRequestById: (requestId) => {
        const { requests } = get();
        return requests.find(request => request._id === requestId) || null;
    },

    getRequestsByStatus: (status) => {
        const { requests } = get();
        return requests.filter(request => request.status === status);
    },

    getRequestsByEntity: (entity) => {
        const { requests } = get();
        return requests.filter(request => request.entity === entity);
    },

    getRequestsByAction: (action) => {
        const { requests } = get();
        return requests.filter(request => request.action === action);
    },

    getRequestsByStore: (storeId) => {
        const { requests } = get();
        return requests.filter(request => request.storeId === storeId);
    },

    getRequestsByUser: (userId) => {
        const { requests } = get();
        return requests.filter(request => request.userId === userId);
    },

    getPendingRequests: () => {
        const { requests } = get();
        return requests.filter(request => request.status === 'pending');
    },

    getApprovedRequests: () => {
        const { requests } = get();
        return requests.filter(request => request.status === 'approved');
    },

    getRejectedRequests: () => {
        const { requests } = get();
        return requests.filter(request => request.status === 'rejected');
    },

    getCancelledRequests: () => {
        const { requests } = get();
        return requests.filter(request => request.status === 'cancelled');
    },

    getRequestsCount: () => {
        const { requests } = get();
        return requests.length;
    },

    hasRequests: () => {
        const { requests } = get();
        return requests.length > 0;
    },

    isLoadingRequests: () => {
        const { isLoading } = get();
        return isLoading;
    },

    hasRequestError: () => {
        const { error } = get();
        return !!error;
    },

    getRequestsStats: () => {
        const { requests } = get();
        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length
        };

        // Thống kê theo entity
        stats.byEntity = {
            product: requests.filter(r => r.entity === 'product').length,
            category: requests.filter(r => r.entity === 'category').length,
            topping: requests.filter(r => r.entity === 'topping').length
        };

        // Thống kê theo action
        stats.byAction = {
            create: requests.filter(r => r.action === 'create').length,
            update: requests.filter(r => r.action === 'update').length,
            delete: requests.filter(r => r.action === 'delete').length
        };

        return stats;
    },

    //! 14. Các hàm tiện ích cho Admin
    canApproveRequest: (request) => {
        return request && request.status === 'pending';
    },

    canRejectRequest: (request) => {
        return request && request.status === 'pending';
    },

    getSelectedRequestsForBulkAction: (selectedIds) => {
        const { requests } = get();
        return requests.filter(request => 
            selectedIds.includes(request._id) && request.status === 'pending'
        );
    },

    //! 15. Hàm search và filter nâng cao
    searchRequests: (searchTerm) => {
        const { requests } = get();
        if (!searchTerm) return requests;

        return requests.filter(request =>
            request.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            request.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.action?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },

    getFilteredRequests: () => {
        const { requests, filters } = get();
        let filtered = requests;

        // Apply filters
        if (filters.status && filters.status !== "all") {
            filtered = filtered.filter(r => r.status === filters.status);
        }
        if (filters.entity && filters.entity !== "all") {
            filtered = filtered.filter(r => r.entity === filters.entity);
        }
        if (filters.action && filters.action !== "all") {
            filtered = filtered.filter(r => r.action === filters.action);
        }
        if (filters.storeId) {
            filtered = filtered.filter(r => r.storeId === filters.storeId);
        }
        if (filters.userId) {
            filtered = filtered.filter(r => r.userId === filters.userId);
        }
        if (filters.search) {
            filtered = get().searchRequests(filters.search);
        }

        return filtered;
    }
}));
