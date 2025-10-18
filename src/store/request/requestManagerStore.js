//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import api from "../../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho request manager
const API_ENDPOINT = "/manager/requests";

//! 3. Tạo zustand store để quản lý requests cho Manager
export const useRequestManagerStore = create((set, get) => ({
    //! 4. Khởi tạo các trạng thái mặc định
    requests: [], // Danh sách tất cả requests của manager
    currentRequest: null, // Request hiện tại đang xem/edit
    isLoading: false, // Trạng thái loading cho các thao tác request
    error: null, // Trạng thái lỗi cho các thao tác request
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalRequests: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách requests
    previewDiff: null, // Kết quả preview diff

    //! 5. Hàm lấy danh sách requests của manager
    getMyRequests: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                status: params.status || "",
                entity: params.entity || "",
                action: params.action || "",
                storeId: params.storeId || "",
                targetId: params.targetId || ""
            });

            // Lọc bỏ các tham số rỗng
            const filteredParams = new URLSearchParams();
            for (const [key, value] of queryParams) {
                if (value && value !== "") {
                    filteredParams.append(key, value);
                }
            }

            const response = await api.get(`${API_ENDPOINT}?${filteredParams}`);

            if (response.data.success) {
                set({
                    requests: response.data.items,
                    pagination: {
                        currentPage: response.data.page,
                        totalPages: response.data.pages,
                        totalRequests: response.data.total,
                        limit: response.data.limit,
                        hasNextPage: response.data.page < response.data.pages,
                        hasPrevPage: response.data.page > 1
                    },
                    isLoading: false,
                    error: null
                });

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

    //! 6. Hàm lấy chi tiết một request
    getMyRequestById: async (requestId) => {
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

    //! 7. Hàm tạo request CREATE
    submitCreateRequest: async (type, requestData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/${type}/create`, requestData);

            if (response.data.success) {
                const newRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                set({
                    requests: [newRequest, ...currentRequests],
                    isLoading: false,
                    error: null
                });

                return newRequest;
            } else {
                throw new Error(response.data.message || "Không thể tạo request");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo request";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 8. Hàm tạo request UPDATE
    submitUpdateRequest: async (type, targetId, requestData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/${type}/${targetId}/update`, requestData);

            if (response.data.success) {
                const newRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                set({
                    requests: [newRequest, ...currentRequests],
                    isLoading: false,
                    error: null
                });

                return newRequest;
            } else {
                throw new Error(response.data.message || "Không thể tạo request update");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo request update";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 9. Hàm tạo request DELETE
    submitDeleteRequest: async (type, targetId, requestData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/${type}/${targetId}/delete`, requestData);

            if (response.data.success) {
                const newRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                set({
                    requests: [newRequest, ...currentRequests],
                    isLoading: false,
                    error: null
                });

                return newRequest;
            } else {
                throw new Error(response.data.message || "Không thể tạo request delete");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi tạo request delete";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 10. Hàm cập nhật request PENDING
    updateMyRequest: async (requestId, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`${API_ENDPOINT}/${requestId}`, updateData);

            if (response.data.success) {
                const updatedRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                const updatedRequests = currentRequests.map(request =>
                    request._id === requestId ? updatedRequest : request
                );
                set({
                    requests: updatedRequests,
                    currentRequest: updatedRequest,
                    isLoading: false,
                    error: null
                });

                return updatedRequest;
            } else {
                throw new Error(response.data.message || "Không thể cập nhật request");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi cập nhật request";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 11. Hàm hủy request PENDING
    cancelMyRequest: async (requestId, note = "") => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`${API_ENDPOINT}/${requestId}/cancel`, { note });

            if (response.data.success) {
                const cancelledRequest = response.data.data;

                // Cập nhật state local
                const currentRequests = get().requests;
                const updatedRequests = currentRequests.map(request =>
                    request._id === requestId ? cancelledRequest : request
                );
                set({
                    requests: updatedRequests,
                    currentRequest: cancelledRequest,
                    isLoading: false,
                    error: null
                });

                return cancelledRequest;
            } else {
                throw new Error(response.data.message || "Không thể hủy request");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi hủy request";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 12. Hàm preview diff
    previewRequestDiff: async (original, payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_ENDPOINT}/preview-diff`, {
                original,
                payload
            });

            if (response.data.success) {
                set({
                    previewDiff: response.data.data,
                    isLoading: false,
                    error: null
                });

                return response.data.data;
            } else {
                throw new Error(response.data.message || "Không thể preview diff");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi preview diff";
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    //! 13. Các hàm quản lý state
    setRequests: (requests) => set({ requests }),
    setCurrentRequest: (request) => set({ currentRequest: request }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),
    setPreviewDiff: (diff) => set({ previewDiff: diff }),

    clearRequests: () => {
        set({
            requests: [],
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalRequests: 0,
                limit: 10,
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

    clearPreviewDiff: () => {
        set({ previewDiff: null });
    },

    //! 14. Các hàm helper sử dụng get() để truy cập state hiện tại
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
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length
        };
    }
}));
