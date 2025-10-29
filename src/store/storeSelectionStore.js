//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import { persist } from "zustand/middleware"; // Persist middleware cho localStorage
import api from "../api/axios"; // Axios instance được chia sẻ với interceptor

//! 2. API endpoint cho cửa hàng
const API_ENDPOINT = "/stores";

//! 3. Tạo zustand store để quản lý UI state chọn cửa hàng
export const useStoreSelectionStore = create(
    persist(
        (set, get) => ({
            //! 4. Khởi tạo các trạng thái mặc định
            selectedStore: null, // Object cửa hàng hiện tại được chọn
            selectedCity: null, // Thành phố hiện tại được chọn
            availableStores: [], // Danh sách cửa hàng trong thành phố đã chọn
            isStoreModalOpen: false, // Điều khiển hiển thị modal chọn cửa hàng
            isLoadingStores: false, // Trạng thái loading khi fetch stores
            error: null, // Trạng thái lỗi cho các thao tác cửa hàng
            hasCompletedSelection: false, // Theo dõi xem user đã hoàn thành chọn cửa hàng chưa

            //! 4a. Setup event listener cho Manager Store Assignment
            _initialized: (() => {
                // Setup event listener for manager store assignment
                if (typeof window !== 'undefined') {
                    window.addEventListener('managerStoreAssignment', async (event) => {
                        const { storeId } = event.detail;
                        // console.log("Received manager store assignment:", storeId);
                        
                        try {
                            await get().loadStoreById(storeId);
                        } catch (error) {
                            console.error("Failed to auto-assign manager store:", error);
                        }
                    });
                }
                return true; // Mark as initialized
            })(),

            //! 5. Các hàm quản lý modal chọn cửa hàng
            openStoreModal: () => {
                set({ isStoreModalOpen: true, error: null });
            },

            closeStoreModal: () => {
                set({ isStoreModalOpen: false, error: null });
            },

            //! 6. Hàm chọn thành phố
            selectCity: async (cityName) => {
                set({ isLoadingStores: true, error: null, selectedCity: cityName });

                try {
                    // Lấy danh sách cửa hàng cho thành phố đã chọn
                    const response = await api.get(`${API_ENDPOINT}/city?city=${cityName}`);

                    set({
                        availableStores: response.data.stores || [],
                        isLoadingStores: false,
                        error: null
                    });

                    return response.data;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách cửa hàng";
                    set({
                        error: errorMessage,
                        isLoadingStores: false,
                        availableStores: []
                    });
                    throw error;
                }
            },

            //! 7. Hàm chọn cửa hàng
            selectStore: async (store) => {
                set({
                    selectedStore: store,
                    isStoreModalOpen: false,
                    hasCompletedSelection: true,
                    error: null
                });
                
                try {
                    const cartStore = useCartStore.getState();
                    
                    // Nếu đổi store, clear cart local và load cart mới
                    if (previousStore && previousStore._id !== store._id) {
                        console.log("[StoreSelection] Store changed, switching cart...");
                        await cartStore.switchStore(store._id);
                    } else {
                        // Lần đầu chọn store
                        cartStore.setCurrentStore(store._id);
                        console.log("🆕 [StoreSelection] Initial store selection, cart store updated");
                    }
                } catch (error) {
                    console.error(" [StoreSelection] Error syncing cart store:", error);
                }

                // Verify state change
                const newState = get();
            },

            //! 8. Hàm xóa lựa chọn cửa hàng
            clearStoreSelection: () => {
                set({
                    selectedStore: null,
                    selectedCity: null,
                    availableStores: [],
                    hasCompletedSelection: false,
                    isStoreModalOpen: false,
                    error: null
                });
            },

            //! 9. Kiểm tra xem có cần chọn cửa hàng không
            isStoreSelectionRequired: () => {
                const { selectedStore, hasCompletedSelection } = get();
                return !selectedStore || !hasCompletedSelection;
            },

            //! 10. Lấy thông tin cửa hàng hiện tại
            getCurrentStoreInfo: () => {
                const { selectedStore } = get();
                return selectedStore || null;
            },

            //! 11. Xác thực tính khả dụng của cửa hàng
            validateStoreAvailability: async (storeId) => {
                try {
                    const response = await api.get(`${API_ENDPOINT}/${storeId}/availability`);
                    return response.data;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi kiểm tra tình trạng cửa hàng";
                    set({ error: errorMessage });
                    throw error;
                }
            },

            //! 12. Hàm reset trạng thái lỗi
            clearError: () => {
                set({ error: null });
            },

            //! 13. Các hàm helper sử dụng get() để truy cập state hiện tại
            getSelectedStore: () => {
                const { selectedStore } = get();
                return selectedStore;
            },

            getSelectedCity: () => {
                const { selectedCity } = get();
                return selectedCity;
            },

            getAvailableStores: () => {
                const { availableStores } = get();
                return availableStores;
            },

            isModalOpen: () => {
                const { isStoreModalOpen } = get();
                return isStoreModalOpen;
            },

            isLoading: () => {
                const { isLoadingStores } = get();
                return isLoadingStores;
            },

            hasError: () => {
                const { error } = get();
                return !!error;
            },

            hasSelectedStore: () => {
                const { selectedStore } = get();
                return !!selectedStore;
            },

            getStoreCount: () => {
                const { availableStores } = get();
                return availableStores.length;
            },

            //! 14. Hàm lấy danh sách thành phố có cửa hàng
            getAvailableCities: async () => {
                set({ isLoadingStores: true, error: null });
                try {
                    const response = await api.get(`${API_ENDPOINT}/cities`);
                    set({ isLoadingStores: false, error: null });
                    return response.data;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi lấy danh sách thành phố";
                    set({ error: errorMessage, isLoadingStores: false });
                    throw error;
                }
            },

            //! 15. Hàm tìm cửa hàng gần vị trí (Geolocation)
            getStoresNearLocation: async (latitude, longitude, radius = 10) => {
                set({ isLoadingStores: true, error: null });
                try {
                    const response = await api.get(`${API_ENDPOINT}/nearby`, {
                        params: { lat: latitude, lng: longitude, radius }
                    });

                    set({
                        availableStores: response.data.stores || [],
                        isLoadingStores: false,
                        error: null,
                        selectedCity: response.data.city || "Gần bạn"
                    });

                    return response.data.stores || [];
                } catch (error) {
                    // Fallback: nếu API chưa có, dùng mock data
                    console.warn("Nearby API not implemented, using fallback");
                    const mockNearbyStores = [
                        {
                            _id: "nearby1",
                            storeName: "Cửa hàng gần bạn",
                            address: { street: "Gần vị trí hiện tại", district: "", city: "Gần bạn" },
                            phone: "0901-234-567",
                            status: "active"
                        }
                    ];

                    set({
                        availableStores: mockNearbyStores,
                        isLoadingStores: false,
                        error: null,
                        selectedCity: "Gần bạn"
                    });

                    return mockNearbyStores;
                }
            },

            //! 16. Hàm load products của store đã chọn với pagination
            loadStoreProducts: async (storeId, page = 1, limit = 8, search = '', category = '', sortBy = 'createdAt', sortOrder = 'desc') => {
                set({ isLoadingStores: true, error: null });
                try {
                    // Tạo query parameters
                    const params = new URLSearchParams({
                        page: page.toString(),
                        limit: limit.toString(),
                        search,
                        category,
                        sortBy,
                        sortOrder
                    });

                    // Gọi API backend để load products của store cụ thể với pagination
                    const response = await api.get(`${API_ENDPOINT}/${storeId}/products?${params}`);

                    // Products sẽ được lưu trong local state của component
                    set({ isLoadingStores: false, error: null });
                    return response.data.data || {}; // Return cả store info + products + pagination
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi lấy sản phẩm của cửa hàng";
                    set({ error: errorMessage, isLoadingStores: false });
                    console.error("Error loading store products:", error);
                    throw error;
                }
            },

            //! 16. Hàm load store by ID cho Store Manager assignment
            loadStoreById: async (storeId) => {
                set({ isLoadingStores: true, error: null });
                try {
                    const response = await api.get(`${API_ENDPOINT}/${storeId}`);
                    const store = response.data.data || response.data.store;
                    
                    if (store) {
                        set({
                            selectedStore: store,
                            hasCompletedSelection: true,
                            isLoadingStores: false,
                            error: null
                        });
                        console.log("Auto-assigned store for manager:", store.storeName || store.name);
                        return store;
                    } else {
                        throw new Error("Store không tìm thấy");
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi load thông tin cửa hàng";
                    set({ error: errorMessage, isLoadingStores: false });
                    console.error("Error loading store by ID:", error);
                    throw error;
                }
            },

            //! 17. Hàm load categories của store đã chọn (cho sidebar Menu)
            loadStoreCategories: async (storeId) => {
                set({ isLoadingStores: true, error: null });
                try {
                    const response = await api.get(`${API_ENDPOINT}/${storeId}/categories`);
                    set({ isLoadingStores: false, error: null });
                    return response.data.data || {}; // Return store info + categories
                } catch (error) {
                    const errorMessage = error.response?.data?.message || "Lỗi lấy danh mục của cửa hàng";
                    set({ error: errorMessage, isLoadingStores: false });
                    console.error("Error loading store categories:", error);
                    throw error;
                }
            }
        }),
        {
            name: "store-selection-storage", // localStorage key
            partialize: (state) => ({
                selectedStore: state.selectedStore,
                selectedCity: state.selectedCity,
                availableStores: state.availableStores, // Thêm persist cho danh sách cửa hàng
                hasCompletedSelection: state.hasCompletedSelection
            }), // Chỉ persist những field này
        }
    )
)