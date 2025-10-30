import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartAPI } from "../api/cartAPI";

const isDev = import.meta.env.MODE === "development";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [],
      isAuthenticated: false,
      currentStoreId: null,
      isLoading: false,
      storeCarts: {},

      // Thêm vào cartStore, sau hàm _isSameConfiguration
      mergeDuplicateItems: () => {
        const { items } = get();
        const mapToppingsForCompare = get()._mapToppingsForCompare;

        console.log(
          "[CartStore] Starting merge process with items:",
          items.length
        );

        if (items.length === 0) {
          return [];
        }

        //  ĐƠN GIẢN: Sử dụng Map để merge
        const itemsMap = new Map();

        items.forEach((current) => {
          const itemKey = `${current.id}_${current.sizeOption}_${
            current.sugarLevel
          }_${current.iceOption}_${mapToppingsForCompare(current.toppings)}`;

          if (itemsMap.has(itemKey)) {
            const existing = itemsMap.get(itemKey);
            itemsMap.set(itemKey, {
              ...current,
              quantity: (existing.quantity || 0) + (current.quantity || 0),
              _id: current._id || existing._id,
            });
          } else {
            itemsMap.set(itemKey, { ...current });
          }
        });

        const mergedItems = Array.from(itemsMap.values());

        console.log(" [CartStore] Merge completed:", {
          before: items.length,
          after: mergedItems.length,
        });

        return mergedItems;
      },

      setSelectedItems: (selected) => set({ selectedItems: selected }),
      getSelectedItems: () => get().selectedItems,

      setAuthStatus: (status) => {
        if (!status) {
          set({
            isAuthenticated: false,
            items: [],
            selectedItems: [],
            storeCarts: {},
          });
          get()._log("Logged out - cleared all cart data");
        } else {
          set({ isAuthenticated: status });
          get()._log("Logged in");
        }
      },

      _log: (...args) => {
        if (isDev) console.log(...args);
      },

      setCurrentStore: async (storeId) => {
        const { currentStoreId, storeCarts, isAuthenticated } = get();

        if (currentStoreId === storeId) return;

        get()._log(`Switching store: ${currentStoreId} → ${storeId}`);

        if (isAuthenticated && currentStoreId && get().items.length > 0) {
          set({
            storeCarts: {
              ...storeCarts,
              [currentStoreId]: {
                items: get().items,
                lastUpdated: Date.now(),
              },
            },
          });
          get()._log(
            `Saved current cart for store ${currentStoreId}:`,
            get().items.length,
            "items"
          );
        }

        let newCartItems = [];
        if (isAuthenticated) {
          newCartItems = storeCarts[storeId]?.items || [];
        }

        set({
          currentStoreId: storeId,
          items: newCartItems,
          isLoading: false,
        });

        get()._log(`Switched to store ${storeId}, items:`, newCartItems.length);

        if (isAuthenticated) {
          get()._log("Loading backend cart after store switch...");
          setTimeout(async () => {
            try {
              await get().loadCartFromBackend(storeId);
            } catch (error) {
              console.error("Error loading backend cart after switch:", error);
            }
          }, 500);
        }
      },

      switchStore: async (newStoreId) => {
        await get().setCurrentStore(newStoreId);
      },
      // Thêm vào cartStore
      forceMergeAndDebug: () => {
        const { items } = get();
        const mapToppingsForCompare = get()._mapToppingsForCompare;

        console.log(" [CartStore] DEBUG - Current items before force merge:");
        items.forEach((item, index) => {
          const key = `${item.id}_${item.sizeOption}_${item.sugarLevel}_${
            item.iceOption
          }_${mapToppingsForCompare(item.toppings)}`;
          console.log(`  Item ${index + 1}:`, {
            name: item.name,
            size: item.sizeOption,
            quantity: item.quantity,
            key: key,
            _id: item._id,
          });
        });

        const mergedItems = get().mergeDuplicateItems();

        console.log(" [CartStore] DEBUG - After force merge:");
        mergedItems.forEach((item, index) => {
          const key = `${item.id}_${item.sizeOption}_${item.sugarLevel}_${
            item.iceOption
          }_${mapToppingsForCompare(item.toppings)}`;
          console.log(`  Item ${index + 1}:`, {
            name: item.name,
            size: item.sizeOption,
            quantity: item.quantity,
            key: key,
            _id: item._id,
          });
        });

        return mergedItems;
      },

      _mapToppingsForCompare: (arr) =>
        JSON.stringify(
          (arr || [])
            .map((t) => ({
              _id: t._id,
              name: t.name,
              extraPrice: t.extraPrice || 0,
            }))
            .sort((a, b) => (a._id || "").toString().localeCompare(b._id || ""))
        ),

      _compareToppings: (a, b) => {
        const normalize = (arr) =>
          (arr || [])
            .map((t) =>
              t.toppingId?._id
                ? t.toppingId._id.toString()
                : t._id?.toString() || t.toString()
            )
            .sort()
            .join(",");
        return normalize(a) === normalize(b);
      },
      _transformBackendToLocal: (backendItems) => {
        if (!backendItems || !Array.isArray(backendItems)) return [];

        console.log(
          "[CartStore] Transforming backend items:",
          backendItems.length
        );

        return backendItems.map((item, index) => {
          const backendToppings = item.toppings || [];

          const transformedToppings = backendToppings.map((t) => {
            const toppingData = t.toppingId || t;

            return {
              _id: toppingData._id || t._id,
              name: toppingData.name || t.name || "Topping",
              extraPrice: toppingData.extraPrice || t.extraPrice || 0,
            };
          });

          const sizePrice = item.sizeOptionPrice || 0;
          const toppingsPrice = transformedToppings.reduce(
            (sum, t) => sum + (t.extraPrice || 0),
            0
          );

          // Tính giá chính xác
          const unitPrice = sizePrice + toppingsPrice;
          const totalPrice = unitPrice * (item.quantity || 1);

          const transformedItem = {
            id: item.productId?._id || item.productId,
            _id: item._id,
            name: item.productId?.name || "Sản phẩm",
            images: item.productId?.images || [],
            price: unitPrice,
            quantity: item.quantity || 1,
            sizeOption: item.sizeOption || "M",
            sizeOptionPrice: item.sizeOptionPrice || sizePrice || 0,
            sugarLevel: item.sugarLevel || "100%",
            iceOption: item.iceOption || "Chung",
            toppings: transformedToppings,
            availableToppings: item.productId?.availableToppings || [],
            sizeOptions: item.productId?.sizeOptions || [],
            _computedTotal: totalPrice,
          };

          //  THÊM: Debug chi tiết từng item
          console.log(` [CartStore] Item ${index + 1}:`, {
            name: transformedItem.name,
            size: transformedItem.sizeOption,
            sizePrice: transformedItem.sizeOptionPrice,
            toppingsCount: transformedToppings.length,
            toppingsPrice,
            unitPrice: transformedItem.price,
            quantity: transformedItem.quantity,
          });

          return transformedItem;
        });
      },

      // Thêm vào cartStore
      _getItemUniqueKey: (item) => {
        const mapToppings = get()._mapToppingsForCompare;
        return `${item.id}_${item.sizeOption}_${item.sugarLevel}_${
          item.iceOption
        }_${mapToppings(item.toppings)}`;
      },

      // Hàm kiểm tra xem 2 item có cùng cấu hình không
      _isSameConfiguration: (item1, item2) => {
        return (
          get()._getItemUniqueKey(item1) === get()._getItemUniqueKey(item2)
        );
      },

      loadCartFromBackend: async (storeId = null) => {
        const effectiveStoreId = storeId || get().currentStoreId;
        const { isAuthenticated, _transformBackendToLocal } = get();

        if (!isAuthenticated || !effectiveStoreId) {
          get()._log("Cannot load - not authenticated or no storeId");
          return [];
        }

        try {
          set({ isLoading: true });
          get()._log("Loading cart from backend for store:", effectiveStoreId);

          const response = await cartAPI.getCart(effectiveStoreId);
          const backendData = response.data || response || {};
          const backendItems = backendData.items || [];
          const transformedBackendItems =
            _transformBackendToLocal(backendItems);

          get()._log(
            "Backend items before merge:",
            transformedBackendItems.length
          );

          const { storeCarts } = get();

          //  Cập nhật state với dữ liệu mới
          set({
            items: transformedBackendItems,
            storeCarts: {
              ...storeCarts,
              [effectiveStoreId]: {
                items: transformedBackendItems,
                lastUpdated: Date.now(),
              },
            },
            isLoading: false,
          });

          //  Merge local
          const mergedItems = get().mergeDuplicateItems();

          //  Đồng bộ lại _id giữa frontend và backend
          const syncedItems = mergedItems.map((localItem) => {
            const backendMatch = transformedBackendItems.find((b) =>
              get()._isSameConfiguration(b, localItem)
            );
            return backendMatch
              ? { ...localItem, _id: backendMatch._id }
              : localItem;
          });

          //  Cập nhật lại state với danh sách đã đồng bộ _id
          set({
            items: syncedItems,
            storeCarts: {
              ...storeCarts,
              [effectiveStoreId]: {
                items: syncedItems,
                lastUpdated: Date.now(),
              },
            },
          });

          get()._log(
            " [CartStore] Synced _id after merge:",
            syncedItems.length
          );
          return syncedItems;
        } catch (error) {
          console.error("Error loading cart:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      addToCart: async (product, quantity = null) => {
        const {
          isAuthenticated,
          currentStoreId,
          loadCartFromBackend,
          storeCarts,
          _transformBackendToLocal,
        } = get();

        if (!isAuthenticated) {
          return { success: false, error: "AUTH_REQUIRED" };
        }

        if (!currentStoreId) {
          return { success: false, error: "NO_STORE_SELECTED" };
        }

        const backendToppings = (product.toppings || []).map((t) => ({
          toppingId: t._id || t,
        }));

        //  SỬA: Sử dụng quantity từ tham số hoặc từ product
        const finalQuantity =
          quantity !== null ? quantity : product.quantity || 1;

        try {
          set({ isLoading: true });

          const response = await cartAPI.addToCart({
            storeId: currentStoreId,
            productId: product._id,
            quantity: finalQuantity, //  Sử dụng số lượng chính xác
            sizeOption: product.sizeOption || "M",
            sugarLevel: product.sugarLevel || "100%",
            iceOption: product.iceOption || "Chung",
            toppings: backendToppings,
            specialNotes: "",
          });

          //  Đảm bảo load lại và merge ngay lập tức
          const updatedItems = await loadCartFromBackend(currentStoreId);

          get()._log(" [CartStore] Item added and merged:", {
            name: product.name,
            quantity: finalQuantity,
            totalItems: updatedItems.length,
          });

          return { success: true, items: updatedItems };
        } catch (error) {
          console.error("Error adding to backend:", error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
      removeFromCart: async (id, options = {}) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
        } = get();

        if (!isAuthenticated || !currentStoreId) {
          return;
        }

        try {
          const localItem = get().items.find(
            (item) =>
              item.id === id &&
              item.sizeOption === (options.sizeOption || "M") &&
              item.sugarLevel === (options.sugarLevel || "100%") &&
              item.iceOption === (options.iceOption || "Chung") &&
              _mapToppingsForCompare(item.toppings) ===
                _mapToppingsForCompare(options.toppings)
          );

          if (localItem && localItem._id) {
            await cartAPI.removeFromCart({
              storeId: currentStoreId,
              itemId: localItem._id,
            });
            await loadCartFromBackend(currentStoreId);
          }
        } catch (error) {
          console.error("Error removing from backend:", error);
        }
      },

      updateQuantity: async (id, quantity, options = {}) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
        } = get();

        if (!isAuthenticated || !currentStoreId) {
          return;
        }

        try {
          const localItem = get().items.find(
            (item) =>
              item.id === id &&
              item.sizeOption === (options.sizeOption || "M") &&
              item.sugarLevel === (options.sugarLevel || "100%") &&
              item.iceOption === (options.iceOption || "Chung") &&
              _mapToppingsForCompare(item.toppings) ===
                _mapToppingsForCompare(options.toppings)
          );

          if (localItem && localItem._id) {
            await cartAPI.updateQuantity({
              storeId: currentStoreId,
              itemId: localItem._id,
              quantity: quantity,
            });
            await loadCartFromBackend(currentStoreId);
          }
        } catch (error) {
          console.error("Error updating quantity in backend:", error);
        }
      },
      updateCartItem: async (oldItem, updatedItem) => {
        const { isAuthenticated, currentStoreId, loadCartFromBackend } = get();

        if (!isAuthenticated || !currentStoreId) {
          throw new Error("Không được xác thực hoặc chưa chọn cửa hàng");
        }

        // BẮT BUỘC: oldItem phải có _id từ backend
        if (!oldItem?._id) {
          throw new Error("Item không có _id, không thể cập nhật backend");
        }

        try {
          console.log("[CartStore] Cập nhật giỏ hàng...", {
            oldItemId: oldItem._id,
            productId: oldItem.id,
            newQuantity: updatedItem.quantity,
            newSize: updatedItem.sizeOption,
            newSugarLevel: updatedItem.sugarLevel, //  THÊM: Log sugarLevel
            newToppings: updatedItem.toppings?.length || 0,
          });

          //  SỬA: CHUẨN HÓA sugarLevel - đảm bảo có ký tự %
          const normalizedSugarLevel = updatedItem.sugarLevel?.includes("%")
            ? updatedItem.sugarLevel
            : `${updatedItem.sugarLevel || "100"}%`;

          // CHỈ GỬI MẢNG ID STRING
          const toppingIds = (updatedItem.toppings || [])
            .map((t) => t._id || t.toppingId || t)
            .filter(Boolean);

          const updatePayload = {
            storeId: currentStoreId,
            itemId: oldItem._id, // _id của cart item
            newConfig: {
              quantity: updatedItem.quantity ?? 1,
              sizeOption: updatedItem.sizeOption || "M",
              sugarLevel: normalizedSugarLevel, //  SỬA: Dùng giá trị đã chuẩn hóa
              iceOption: updatedItem.iceOption || "Chung",
              specialNotes: updatedItem.specialNotes || "",
              toppings: toppingIds, // array string IDs
            },
          };

          console.log(
            " [CartStore] Gửi cập nhật đến backend:",
            JSON.stringify(updatePayload, null, 2)
          );

          // GỌI API - backend sẽ tự gộp
          await cartAPI.updateCartItem(updatePayload);

          // CHỈ LOAD 1 LẦN - backend đã xử lý merge
          const updatedItems = await loadCartFromBackend(currentStoreId);

          console.log(" [CartStore] Cập nhật thành công. Giỏ hàng hiện tại:", {
            itemCount: updatedItems.length,
            items: updatedItems.map((item) => ({
              name: item.name,
              size: item.sizeOption,
              sugarLevel: item.sugarLevel, //  THÊM: Kiểm tra sugarLevel
              quantity: item.quantity,
              toppings: item.toppings?.length || 0,
              _id: item._id,
            })),
          });

          return updatedItems;
        } catch (error) {
          console.error(
            " [CartStore] LỖI cập nhật item:",
            error.response?.data || error.message || error
          );
          throw error;
        }
      },

      clearCart: async () => {
        const { isAuthenticated, currentStoreId, storeCarts } = get();

        if (!isAuthenticated || !currentStoreId) {
          return;
        }

        try {
          get()._log("Attempting to clear backend cart...");

          try {
            const existingCart = await cartAPI.getCart(currentStoreId);
            const backendItems =
              existingCart?.data?.items || existingCart?.items || [];
            if (backendItems && backendItems.length > 0) {
              await cartAPI.clearCart(currentStoreId);
              get()._log("Backend cart cleared successfully");
            } else {
              get()._log("No backend cart to clear (already empty)");
            }
          } catch (error) {
            get()._log("No backend cart found to clear");
          }

          set({
            items: [],
            selectedItems: [],
            storeCarts: {
              ...storeCarts,
              [currentStoreId]: {
                items: [],
                lastUpdated: Date.now(),
              },
            },
          });

          get()._log("Local cart cleared for store:", currentStoreId);
        } catch (error) {
          console.error("Error clearing backend cart:", error.message);
        }
      },

      getCartByStore: (storeId) => {
        return get().storeCarts[storeId]?.items || [];
      },

      getStoreCartInfo: (storeId) => {
        const cart = get().storeCarts[storeId];
        if (!cart) return { itemCount: 0, total: 0 };

        const itemCount = cart.items.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        const total = cart.items.reduce(
          (total, item) => total + (item.price || 0) * (item.quantity || 1),
          0
        );

        return { itemCount, total };
      },

      getCurrentItems: () => get().items,
      getTotalItems: () =>
        get().isAuthenticated
          ? get().items.reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0,
      getCartTotal: () =>
        get().isAuthenticated
          ? get().items.reduce(
              (total, item) => total + (item.price || 0) * (item.quantity || 1),
              0
            )
          : 0,

      getSelectedTotal: () => {
        if (!get().isAuthenticated) return 0;

        const { items, selectedItems } = get();
        const getItemKey = (item) =>
          `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(
            (item.toppings || [])
              .map((t) => (t._id ? t._id.toString() : JSON.stringify(t)))
              .sort()
          )}`;

        return items
          .filter((item) => selectedItems.includes(getItemKey(item)))
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemById: (productId) => {
        const { items } = get();
        return items.find((item) => item.id === productId) || null;
      },

      reloadCurrentCart: async () => {
        const { currentStoreId, isAuthenticated } = get();
        if (!currentStoreId || !isAuthenticated) return;
        await get().loadCartFromBackend(currentStoreId);
      },

      canModifyCart: () => {
        return get().isAuthenticated && get().currentStoreId;
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        selectedItems: state.selectedItems,
        currentStoreId: state.currentStoreId,
        storeCarts: state.storeCarts,
      }),
    }
  )
);

export { useCartStore };
