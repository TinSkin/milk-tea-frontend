//! 1. Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import { persist } from "zustand/middleware"; // Persist middleware cho localStorage

const useCartStore = create(
  persist(
    (set, get) => ({
      //! 3. Khởi tạo các trạng thái mặc định
      items: [], // Mảng lưu trữ các sản phẩm trong giỏ hàng
      
      // ✅ Thêm trạng thái lưu id các sản phẩm được tick chọn
      selectedItems: [],

      // ✅ Set sản phẩm đã chọn
      setSelectedItems: (selected) => set({ selectedItems: selected }),

      // ✅ Lấy danh sách sản phẩm đã chọn
      getSelectedItems: () => get().selectedItems,

      // helper: chuẩn hoá topping để so sánh
      _mapToppingsForCompare: (arr) =>
        JSON.stringify(
          (arr || []).map((t) => ({
            _id: t._id,
            name: t.name,
            extraPrice: t.extraPrice || 0,
          }))
        ),

      //cập nhật giá sau khi thay đổi

      // Thêm sản phẩm vào giỏ
      addToCart: (product, quantity = 1) => {
        const mapToppingsForCompare = get()._mapToppingsForCompare;

        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.id === product._id &&
            item.sizeOption === (product.sizeOption || "M") &&
            item.sugarLevel === (product.sugarLevel || "100%") &&
            item.iceOption === (product.iceOption || "Chung") &&
            mapToppingsForCompare(item.toppings) ===
              mapToppingsForCompare(product.toppings)
        );

        const sizeOptionObj = product.sizeOptions?.find(
          (s) => s.size === (product.sizeOption || "M")
        );

        // chuẩn hoá rawAvailable (nhiều tên trường khác nhau)
        const rawAvailable =
          product.availableToppings ||
          product.allToppings ||
          product.toppingOptions ||
          product.toppingsList ||
          product.toppings ||
          [];

        if (existingItemIndex !== -1) {
          // Nếu sản phẩm đã tồn tại, tăng số lượng
          const updatedItems = [...get().items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
          return;
        }

        // Tạo newItem (chỉ 1 lần)
        const newItem = {
          id: product._id,
          name: product.name,
          images: product.images || [],
          price: product.price || 0,
          quantity: quantity,
          // choices
          sizeOption:
            product.sizeOption || (product.sizeOptions?.[0]?.size ?? "M"),
          sizeOptionPrice: sizeOptionObj?.price || 0,
          sugarLevel: product.sugarLevel || "100%",
          iceOption: product.iceOption || "Chung",
          // dữ liệu tham chiếu để edit sau này
          sizeOptions: product.sizeOptions || [],
          // selected toppings (những topping user đã chọn khi add)
          toppings: (product.toppings || []).map((t) => ({
            _id: t._id,
            name: t.name,
            extraPrice: t.extraPrice || 0,
          })),
          // toàn bộ topping khả dụng của product
          availableToppings: (rawAvailable || []).map((t) => ({
            _id: t._id,
            name: t.name,
            extraPrice: t.extraPrice || 0,
          })),
        };

        set({ items: [...get().items, newItem] });
      },

      // Xóa sản phẩm (theo id + option)
      removeFromCart: (id, options = {}) => {
        const mapToppingsForCompare = get()._mapToppingsForCompare;
        const updatedItems = get().items.filter(
          (item) =>
            !(
              item.id === id &&
              item.sizeOption === (options.sizeOption || "M") &&
              item.sugarLevel === (options.sugarLevel || "100%") &&
              item.iceOption === (options.iceOption || "Chung") &&
              mapToppingsForCompare(item.toppings) ===
                mapToppingsForCompare(options.toppings)
            )
        );
        set({ items: updatedItems });
      },

      // Cập nhật số lượng
      updateQuantity: (id, quantity, options = {}) => {
        const mapToppingsForCompare = get()._mapToppingsForCompare;
        const updatedItems = get().items.map((item) => {
          if (
            item.id === id &&
            item.sizeOption === (options.sizeOption || "M") &&
            item.sugarLevel === (options.sugarLevel || "100%") &&
            item.iceOption === (options.iceOption || "Chung") &&
            mapToppingsForCompare(item.toppings) ===
              mapToppingsForCompare(options.toppings)
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
        return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      },

      // Tính tổng tiền: đơn giá = item.price + sizeOptionPrice + toppings extra
      // getCartTotal: () => {
      //   return get().items.reduce((total, item) => {
      //     const toppingTotal = (item.toppings || []).reduce(
      //       (s, t) => s + (t.extraPrice || 0),
      //       0
      //     );
      //     const sizeExtra = item.sizeOptionPrice || 0;
      //     const unitPrice = (item.price || 0) + sizeExtra + toppingTotal;
      //     return total + unitPrice * (item.quantity || 1);
      //   }, 0);
      // },
      getCartTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price || 0) * (item.quantity || 1);
        }, 0);
      },
      
      //hàm tính tổng sản phẩm đã chọn, bên checkout page dùng
      getSelectedTotal: () => {
        const { items, selectedItems } = get();
        const getItemKey = (item) =>
          `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(item.toppings || [])}`;
      
        return items
          .filter((item) => selectedItems.includes(getItemKey(item)))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      

      // Chỉnh sửa sản phẩm: dùng oldItem object để match chính xác
      updateCartItem: (oldItem, updatedItem) => {
        const mapToppingsForCompare = get()._mapToppingsForCompare;
        set({
          items: get().items.map((item) => {
            if (
              item.id === oldItem.id &&
              item.sizeOption === oldItem.sizeOption &&
              item.sugarLevel === oldItem.sugarLevel &&
              item.iceOption === oldItem.iceOption &&
              mapToppingsForCompare(item.toppings) ===
                mapToppingsForCompare(oldItem.toppings)
            ) {
              // 👉 Tính lại giá mới chỉ dựa vào size + topping
              const newSizePrice = updatedItem.sizeOptionPrice || 0;
              const toppingTotal = (updatedItem.toppings || []).reduce(
                (s, t) => s + (t.extraPrice || 0),
                0
              );

              return {
                ...item,
                ...updatedItem,
                availableToppings:
                  item.availableToppings || updatedItem.availableToppings || [],
                sizeOptions: item.sizeOptions || updatedItem.sizeOptions || [],
                // ✅ Giá mới thay thế giá cũ
                price: newSizePrice + toppingTotal,
              };
            }
            return item;
          }),
        });
      },

      mergeDuplicateItems: () => {
        const { items } = get();
        const mapToppingsForCompare = get()._mapToppingsForCompare;

        let mergedItems = [];

        for (let i = 0; i < items.length; i++) {
          const current = items[i];

          // tìm xem mergedItems đã có item trùng cấu hình chưa
          const existingIndex = mergedItems.findIndex(
            (m) =>
              m.id === current.id &&
              m.sizeOption === current.sizeOption &&
              m.sugarLevel === current.sugarLevel &&
              m.iceOption === current.iceOption &&
              mapToppingsForCompare(m.toppings) ===
                mapToppingsForCompare(current.toppings)
          );

          if (existingIndex !== -1) {
            // gộp số lượng lại, nhưng giữ cấu hình của current (sản phẩm mới nhất)
            mergedItems[existingIndex] = {
              ...current,
              quantity:
                (mergedItems[existingIndex].quantity || 0) +
                (current.quantity || 0),
            };
          } else {
            mergedItems.push({ ...current });
          }
        }

        set({ items: mergedItems });
      },

      getItemById: (productId) => {
        const { items } = get();
        return items.find((item) => item.id === productId) || null;
      },

      // Xóa toàn bộ giỏ
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({
        items: state.items,
        selectedItems: state.selectedItems, // ✅ lưu thêm selectedItems
      }),
    }
  )
);

export { useCartStore };
