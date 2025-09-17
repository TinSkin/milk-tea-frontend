import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ✅ Thêm sản phẩm vào giỏ
      addToCart: (product, quantity = 1) => {
        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.id === product._id &&
            item.sizeOption === (product.sizeOption || "M") &&
            item.sugarLevel === (product.sugarLevel || "100%") &&
            item.iceOption === (product.iceOption || "100%") &&
            JSON.stringify(
              item.toppings.map(t => ({_id: t._id, name: t.name, extraPrice: t.extraPrice}))
            ) === JSON.stringify(
              (product.toppings || []).map(t => ({_id: t._id, name: t.name, extraPrice: t.extraPrice}))
            ));

            const sizeOptionObj = product.sizeOptions?.find(s => s.size === (product.sizeOption || "M"));

        if (existingItemIndex !== -1) {
          // Nếu sp đã có → tăng số lượng
          const updatedItems = [...get().items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Nếu chưa có → thêm mới
          const newItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            images: product.images,
            sizeOption: product.sizeOption || "M",
            sizeOptionPrice: sizeOptionObj?.price || 0,
            sugarLevel: product.sugarLevel || "100%",
            iceOption: product.iceOption || "100%",
            toppings: (product.toppings || []).map(t => ({
              _id: t._id,
              name: t.name,
              extraPrice: t.extraPrice || 0
            }))
            
          };
          set({ items: [...get().items, newItem] });
        }
      },

      // ✅ Xóa sản phẩm (theo id + option)
      removeFromCart: (id, options = {}) => {
        const updatedItems = get().items.filter(
          (item) =>
            !(
              item.id === id &&
              item.sizeOption === (options.sizeOption || "M") &&
              item.sugarLevel === (options.sugarLevel || "100%") &&
              item.iceOption === (options.iceOption || "100%") &&
              JSON.stringify(item.toppings || []) ===
                JSON.stringify(options.toppings || [])
            )
        );
        set({ items: updatedItems });
      },

      // ✅ Cập nhật số lượng
      updateQuantity: (id, quantity, options = {}) => {
        const updatedItems = get().items.map((item) => {
          if (
            item.id === id &&
            item.sizeOption === (options.sizeOption || "M") &&
            item.sugarLevel === (options.sugarLevel || "100%") &&
            item.iceOption === (options.iceOption || "100%") &&
            JSON.stringify(item.toppings || []) ===
              JSON.stringify(options.toppings || [])
          ) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },      

    // ✅ Tính tổng tiền (giá đã bao gồm topping + size)
getCartTotal: () => {
  return get().items.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);
},


      // ✅ Xóa toàn bộ giỏ
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export { useCartStore };
;
