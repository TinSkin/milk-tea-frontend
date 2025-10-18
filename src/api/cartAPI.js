import api from "./axios";

export const cartAPI = {
  // 🛒 Lấy giỏ hàng từ backend
  getCart: async (storeId) => {
    try {
      console.log("🛒 [API] GET /cart?storeId=", storeId);
      const response = await api.get(`/cart?storeId=${storeId}`);
      console.log("🛒 [API] GET response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] GET ERROR:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        return { success: true, data: { items: [], totalAmount: 0 } };
      }
      throw error;
    }
  },

  // 🧃 Thêm sản phẩm vào giỏ hàng backend
  addToCart: async (cartData) => {
    try {
      console.log("🛒 [API] POST /cart/add raw data:", cartData);

      const formattedData = {
        storeId: cartData.storeId,
        productId: cartData.productId,
        quantity: cartData.quantity,
        sizeOption: cartData.sizeOption,
        sugarLevel: cartData.sugarLevel.includes('%') ? cartData.sugarLevel : `${cartData.sugarLevel}%`,
        iceOption: cartData.iceOption,
        specialNotes: cartData.specialNotes || "",
        // ✅ FIX: topping chỉ cần _id hoặc string, không được lồng toppingId bên trong
        toppings: (cartData.toppings || []).map((t) => ({
          toppingId: t._id || t.toppingId || t
        }))
      };

      console.log("🛒 [API] POST formatted data:", JSON.stringify(formattedData, null, 2));

      const response = await api.post("/cart/add", formattedData);
      console.log("🛒 [API] POST response:", response.data);

      return response.data;
    } catch (error) {
      console.error("🛒 [API] POST ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // 🔢 Cập nhật số lượng
  updateQuantity: async (updateData) => {
    try {
      console.log("🛒 [API] PUT /cart/quantity data:", updateData);
      const response = await api.put("/cart/quantity", updateData);
      console.log("🛒 [API] PUT response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] PUT ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // ❌ Xóa sản phẩm
  removeFromCart: async (removeData) => {
    try {
      console.log("🛒 [API] DELETE /cart/item data:", removeData);
      const response = await api.delete("/cart/item", { data: removeData });
      console.log("🛒 [API] DELETE response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] DELETE ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🧹 Xóa toàn bộ giỏ hàng
  clearCart: async (storeId) => {
    try {
      console.log("🛒 [API] DELETE /cart/clear storeId:", storeId);
      const response = await api.delete("/cart/clear", { data: { storeId } });
      console.log("🛒 [API] CLEAR response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] CLEAR ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔧 Cập nhật sản phẩm trong giỏ
  updateCartItem: async (updateData) => {
    try {
      console.log("🛒 [API] PUT /cart/update data:", updateData);

      const formattedData = {
        ...updateData,
        toppings: (updateData.toppings || []).map((t) => ({
          toppingId: t._id || t.toppingId || t
        }))
      };

      const response = await api.put("/cart/update", formattedData);
      console.log("🛒 [API] UPDATE response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] UPDATE ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // 🔄 Gom các sản phẩm trùng
  mergeDuplicateItems: async (storeId) => {
    try {
      console.log("🛒 [API] PUT /cart/merge storeId:", storeId);
      const response = await api.put("/cart/merge", { storeId });
      console.log("🛒 [API] MERGE response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🛒 [API] MERGE ERROR:", error.response?.data || error.message);
      throw error;
    }
  }
};
