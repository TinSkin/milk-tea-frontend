//! 1. Import các thư viện và module cần thiết
import { create } from "zustand"; // Zustand create store để quản lý trạng thái toàn cục
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho người dùng
const API_ENDPOINT = "/users";

//! 3. Tạo zustand store để quản lý người dùng
export const useUserStore = create((set, get) => ({
    //! 4. Khởi tạo trạng thái mặc định
    users: [], // Thông tin người dùng sẽ được lưu trữ ở đây
    isLoading: false, // Trạng thái loading cho các thao tác bất đồng bộ
    error: null, // Trạng thái lỗi để xử lý lỗi
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    }, // Thông tin phân trang cho danh sách người dùng

    //! 5. Hàm lấy tất cả người dùng (bao gồm phân trang, lọc, tìm kiếm)
    getAllUsers: async (params = {}) => {
        set({ isLoading: true, error: null }); // Đặt trạng thái loading và xóa lỗi trước đó
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

            const response = await api.get(`${API_ENDPOINT}?${queryParams}`); // Thực hiện GET request để lấy dữ liệu người dùng

            // Xử lý các cấu trúc response khác nhau
            if (response.data.success) {
                set({
                    users: response.data.users,
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });

                return response.data;
            } else {
                throw new Error(response.data.message || "Lỗi lấy danh sách người dùng");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách tài khoản";
            set({
                error: errorMessage,
                isLoading: false,
                users: []
            });
            throw error;
        }
    },

    //! 6. Các hàm quản lý trạng thái
    setUsers: (users) => set({ users }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    clearUsers: () => {
        set({ 
            users: [], 
            error: null,
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalUsers: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    clearError: () => {
        set({ error: null });
    },

    //! 7. Các hàm helper sử dụng get() để truy cập trạng thái hiện tại
    getCurrentUsers: () => {
        const { users } = get();
        return users;
    },

    getUserById: (userId) => {
        const { users } = get();
        return users.find(user => user._id === userId) || null;
    },

    getUsersByRole: (role) => {
        const { users } = get();
        return users.filter(user => user.role === role);
    },

    getVerifiedUsers: () => {
        const { users } = get();
        return users.filter(user => user.isVerified === true);
    },

    getActiveUsers: () => {
        const { users } = get();
        return users.filter(user => user.status === 'active');
    },

    getUsersCount: () => {
        const { users } = get();
        return users.length;
    },

    hasUsers: () => {
        const { users } = get();
        return users.length > 0;
    },

    isLoadingUsers: () => {
        const { isLoading } = get();
        return isLoading;
    },

    hasUserError: () => {
        const { error } = get();
        return !!error;
    }
}));