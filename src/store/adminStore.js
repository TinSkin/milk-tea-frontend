// store/adminStore.js
import { create } from "zustand";
import api from "../api/axios";
export const useAdminOrderStore = create((set, get) => ({
  orders: [],
  stores: [],
  currentOrder: null,
  orderHistory: [],
  pagination: {},
  isLoading: false,
  isDetailLoading: false,
  error: null,

  //  Lấy danh sách đơn hàng
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/orders", { params });
      const data = response.data;

      const processedOrders = data.orders
        ? data.orders.map((order) => ({
            ...order,
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
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false,
      });
      return { success: false, error };
    }
  },

  //  Lấy chi tiết đơn hàng
  fetchOrderDetail: async (orderId) => {
    set({ isDetailLoading: true, error: null });
    try {
      const response = await api.get(`/orders/${orderId}`);
      const data = response.data;

      set({
        currentOrder: data.order || data.data,
        isDetailLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isDetailLoading: false,
      });
      return { success: false, error };
    }
  },

  //  Lấy lịch sử trạng thái đơn hàng
  fetchOrderStatusHistory: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/orders/${orderId}/history`);
      const data = response.data;

      set({
        orderHistory: data.history || data.data || [],
        isLoading: false,
      });

      return { success: true, data };
    } catch (error) {
      // fallback nếu không có API history
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

      set({
        error: error.response?.data?.message || error.message,
        isLoading: false,
      });
      return { success: false, error };
    }
  },

  //  Lấy danh sách cửa hàng
  fetchStores: async () => {
    try {
      const response = await api.get("/stores");
      const data = response.data;

      const stores = data.data?.stores || data.stores || data.data || [];
      set({ stores });
    } catch (error) {
      console.error("Error fetching stores:", error);
      set({ stores: [] });
    }
  },

  clearError: () => set({ error: null }),
}));
