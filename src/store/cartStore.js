//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import { persist } from "zustand/middleware"; // Persist middleware cho localStorage

const useCartStore = create(
  persist(
    (set, get) => ({
      //! 3. Khởi tạo các trạng thái mặc định
      items: [], // Mảng lưu trữ các sản phẩm trong giỏ hàng

      //! 4. Hàm thêm sản phẩm vào giỏ hàng
      addToCart: (product, quantity = 1) => {
        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.id === product._id &&
            item.sizeOption === (product.sizeOption || "M") &&
            item.sugarLevel === (product.sugarLevel || "100%") &&
            item.iceOption === (product.iceOption || "100%") &&
            JSON.stringify(
              item.toppings.map(t => ({ _id: t._id, name: t.name, extraPrice: t.extraPrice }))
            ) === JSON.stringify(
              (product.toppings || []).map(t => ({ _id: t._id, name: t.name, extraPrice: t.extraPrice }))
            ));

        const sizeOptionObj = product.sizeOptions?.find(s => s.size === (product.sizeOption || "M"));

        if (existingItemIndex !== -1) {
          // Nếu sản phẩm đã tồn tại, tăng số lượng
          const updatedItems = [...get().items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Nếu sản phẩm mới, thêm vào giỏ hàng
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

      //! 5. Hàm xóa sản phẩm khỏi giỏ hàng
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

      //! 6. Hàm cập nhật số lượng sản phẩm
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

      //! 7. Hàm xóa toàn bộ giỏ hàng
      clearCart: () => set({ items: [] }),

      //! 8. Các hàm helper sử dụng get() để truy cập state hiện tại
      getCurrentItems: () => {
        const { items } = get();
        return items;
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          return total + item.price * (item.quantity || 1);
        }, 0);
      },

      getItemById: (productId) => {
        const { items } = get();
        return items.find(item => item.id === productId) || null;
      },

      getItemsByCategory: (categoryName) => {
        const { items } = get();
        return items.filter(item => item.category === categoryName);
      },

      hasItems: () => {
        const { items } = get();
        return items.length > 0;
      },

      isEmpty: () => {
        const { items } = get();
        return items.length === 0;
      },

      getItemsCount: () => {
        const { items } = get();
        return items.length;
      },

      getUniqueProductsCount: () => {
        const { items } = get();
        const uniqueIds = new Set(items.map(item => item.id));
        return uniqueIds.size;
      },

      getTotalWithToppings: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const basePrice = item.price;
          const sizePrice = item.sizeOptionPrice || 0;
          const toppingsPrice = (item.toppings || []).reduce((sum, topping) => sum + (topping.extraPrice || 0), 0);
          return total + (basePrice + sizePrice + toppingsPrice) * item.quantity;
        }, 0);
      }
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({ items: state.items }), // Chỉ persist items
    }
  )
);

export { useCartStore };
