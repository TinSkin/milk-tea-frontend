import api from "./axios";

export const cartAPI = {
  // Lấy giỏ hàng từ backend
  getCart: async (storeId) => {
    try {
      console.log("GET /cart?storeId=", storeId);
      const response = await api.get(`/cart?storeId=${storeId}`);
      console.log("GET response:", response.data);
      return response.data;
    } catch (error) {
      console.error("GET ERROR:", error.response?.data || error.message);
      if (error.response?.status === 404) {
        return { success: true, data: { items: [], totalAmount: 0 } };
      }
      throw error;
    }
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (cartData) => {
    try {
      console.log("POST /cart/add raw:", cartData);

      const formattedData = {
        storeId: cartData.storeId,
        productId: cartData.productId,
        quantity: cartData.quantity ?? 1,
        sizeOption: cartData.sizeOption || "M",
        sugarLevel: String(cartData.sugarLevel || "100%").includes('%') 
          ? cartData.sugarLevel 
          : `${cartData.sugarLevel}%`,
        iceOption: cartData.iceOption || "Chung",
        specialNotes: cartData.specialNotes || "",
        // Gửi array ID string
        toppings: (cartData.toppings || []).map(t => t._id || t.toppingId || t).filter(Boolean)
      };

      console.log("POST formatted:", JSON.stringify(formattedData, null, 2));

      const response = await api.post("/cart/add", formattedData);
      console.log("POST success:", response.data);
      return response.data;
    } catch (error) {
      console.error("POST ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Cập nhật số lượng
  updateQuantity: async (updateData) => {
    try {
      console.log("PUT /cart/quantity data:", updateData);
      const response = await api.put("/cart/quantity", updateData);
      console.log("PUT quantity success:", response.data);
      return response.data;
    } catch (error) {
      console.error("PUT quantity ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa sản phẩm
  removeFromCart: async (removeData) => {
    try {
      console.log("DELETE /cart/item data:", removeData);
      const response = await api.delete("/cart/item", { data: removeData });
      console.log("DELETE success:", response.data);
      return response.data;
    } catch (error) {
      console.error("DELETE ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa toàn bộ giỏ
  clearCart: async (storeId) => {
    try {
      console.log("DELETE /cart/clear storeId:", storeId);
      const response = await api.delete("/cart/clear", { data: { storeId } });
      console.log("CLEAR success:", response.data);
      return response.data;
    } catch (error) {
      console.error("CLEAR ERROR:", error.response?.data || error.message);
      throw error;
    }
  },

  // CẬP NHẬT CẤU HÌNH SẢN PHẨM - QUAN TRỌNG NHẤT
  updateCartItem: async (updateData) => {
    try {
      // BẮT BUỘC: itemId phải là _id của cart item
      if (!updateData.itemId) {
        throw new Error("Thiếu itemId (cart item _id)");
      }

      console.log("PUT /cart/update RAW:", updateData);

      const formattedData = {
        storeId: updateData.storeId,
        itemId: updateData.itemId,
        newConfig: {
          quantity: updateData.newConfig?.quantity ?? 1,
          sizeOption: updateData.newConfig?.sizeOption || "M",
          sugarLevel: updateData.newConfig?.sugarLevel || "100%",
          iceOption: updateData.newConfig?.iceOption || "Chung",
          specialNotes: updateData.newConfig?.specialNotes || "",
          // CHỈ GỬI MẢNG ID STRING
          toppings: (updateData.newConfig?.toppings || [])
            .map(t => t._id || t.toppingId || t)
            .filter(Boolean)
        }
      };

      console.log("PUT /cart/update FORMATTED:", JSON.stringify(formattedData, null, 2));

      const response = await api.put("/cart/update", formattedData);
      console.log("UPDATE success:", response.data);
      return response.data;
    } catch (error) {
      console.error("UPDATE CART ITEM ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      throw error;
    }
  },

  // Gom trùng (tùy chọn - backend đã xử lý)
  mergeDuplicateItems: async (storeId) => {
    try {
      console.log("PUT /cart/merge storeId:", storeId);
      const response = await api.put("/cart/merge", { storeId });
      console.log("MERGE success:", response.data);
      return response.data;
    } catch (error) {
      console.error("MERGE ERROR:", error.response?.data || error.message);
      throw error;
    }
  }
};