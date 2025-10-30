// store/adminStore.js
import { create } from "zustand";

export const useAdminOrderStore = create((set, get) => ({
  orders: [],
  stores: [],
  currentOrder: null, // THÊM: order đang xem chi tiết
  orderHistory: [], // THÊM: lịch sử đơn hàng
  pagination: {},
  isLoading: false,
  isDetailLoading: false, // THÊM: loading cho chi tiết
  error: null,

  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/orders?${new URLSearchParams(params)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();

      // Xử lý dữ liệu orders
      const processedOrders = data.orders
        ? data.orders.map((order) => ({
            ...order,
            // Đảm bảo các trường số được convert đúng
            totalAmount: Number(order.totalAmount) || 0,
            shippingFee: Number(order.shippingFee) || 0,
            discountAmount: Number(order.discountAmount) || 0,
            finalAmount: Number(order.finalAmount) || 0,
          }))
        : [];

      set({
        orders: processedOrders,
        pagination: data.pagination || {},
        isLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  // THÊM: Fetch chi tiết đơn hàng
  fetchOrderDetail: async (orderId) => {
    set({ isDetailLoading: true, error: null });
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch order detail");

      const data = await response.json();

      set({
        currentOrder: data.order || data.data,
        isDetailLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({ error: error.message, isDetailLoading: false });
      return { success: false, error };
    }
  },

  // THÊM: Fetch lịch sử đơn hàng
  fetchOrderStatusHistory: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/orders/${orderId}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        // Nếu API history chưa tồn tại, sử dụng statusHistory từ currentOrder
        const { currentOrder } = get();
        if (currentOrder?.statusHistory) {
          set({
            orderHistory: currentOrder.statusHistory,
            isLoading: false,
          });
          return {
            success: true,
            data: { history: currentOrder.statusHistory },
          };
        }
        throw new Error("Failed to fetch order history");
      }

      const data = await response.json();

      set({
        orderHistory: data.history || data.data || [],
        isLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      // Fallback: sử dụng statusHistory từ currentOrder
      const { currentOrder } = get();
      if (currentOrder?.statusHistory) {
        set({
          orderHistory: currentOrder.statusHistory,
          isLoading: false,
        });
        return { success: true, data: { history: currentOrder.statusHistory } };
      }

      set({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  },

  fetchStores: async () => {
    try {
      const response = await fetch("/api/stores", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Xử lý cấu trúc response khác nhau
        const stores = data.data?.stores || data.stores || data.data || [];
        set({ stores });
      } else {
        set({ stores: [] });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      set({ stores: [] });
    }
  },

  clearError: () => set({ error: null }),
}));
