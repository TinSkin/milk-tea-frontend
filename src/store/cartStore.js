// File: src/store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartAPI } from "../api/cartAPI";

const isDev = import.meta.env.MODE === "development";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State - THÊM storeCarts để lưu multiple carts
      items: [],
      selectedItems: [],
      isAuthenticated: false,
      currentStoreId: null,
      isLoading: false,
      storeCarts: {},

      // Actions
      setSelectedItems: (selected) => set({ selectedItems: selected }),
      getSelectedItems: () => get().selectedItems,

      // Set authentication status
      setAuthStatus: (status) => set({ isAuthenticated: status }),

      // Helper function: log only in dev
      _log: (...args) => {
        if (isDev) console.log(...args);
      },

      // ✅ SỬA: Set current store + tự động switch cart
      setCurrentStore: async (storeId) => {
        const { currentStoreId, storeCarts, items: currentItems } = get();

        if (currentStoreId === storeId) return;

        get()._log(
          `🏪 [Cart] Switching store: ${currentStoreId} → ${storeId}`,
          {
            currentItems: currentItems.length,
          }
        );

        // 1. Lưu cart hiện tại trước khi chuyển
        if (currentStoreId && currentItems.length > 0) {
          set({
            storeCarts: {
              ...storeCarts,
              [currentStoreId]: {
                items: currentItems,
                lastUpdated: Date.now(),
              },
            },
          });
          get()._log(
            `💾 [Cart] Saved current cart for store ${currentStoreId}:`,
            currentItems.length,
            "items"
          );
        }

        // 2. Chuyển sang store mới - ƯU TIÊN local storage, nếu rỗng thì dùng current items
        let newCartItems = storeCarts[storeId]?.items || [];

        // ✅ QUAN TRỌNG: Nếu đang có items và store mới chưa có cart, GIỮ LẠI items hiện tại
        if (currentItems.length > 0 && newCartItems.length === 0) {
          newCartItems = currentItems;
          get()._log("🔄 [Cart] Keeping current items for new store");
        }

        // Set currentStoreId and tentative items, but avoid overwriting later loads if a backend load is in progress
        set({
          currentStoreId: storeId,
          items: newCartItems,
          isLoading: false,
        });

        get()._log(
          `✅ [Cart] Switched to store ${storeId}, items:`,
          newCartItems.length
        );

        // 3. Nếu đã đăng nhập, load từ backend SAU KHI đã set items
        if (get().isAuthenticated) {
          get()._log("🔄 [Cart] Loading backend cart after store switch...");
          // Small debounce to ensure any other state updates settle
          setTimeout(async () => {
            try {
              await get().loadCartFromBackend(storeId);
            } catch (error) {
              console.error(
                "❌ [Cart] Error loading backend cart after switch:",
                error
              );
            }
          }, 500);
        }
      },

      // ✅ THÊM: Switch store với logic đầy đủ
      switchStore: async (newStoreId) => {
        await get().setCurrentStore(newStoreId);
      },

      // Helper function
      _mapToppingsForCompare: (arr) =>
        JSON.stringify(
          (arr || [])
            .map((t) => ({
              _id: t._id,
              name: t.name,
              extraPrice: t.extraPrice || 0,
            }))
            // sort to ensure deterministic string
            .sort((a, b) => (a._id || "").toString().localeCompare(b._id || ""))
        ),

      // Helper: Compare toppings
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

      // Helper: Transform backend items to local format - SỬA HOÀN TOÀN
      _transformBackendToLocal: (backendItems) => {
        if (!backendItems || !Array.isArray(backendItems)) return [];

        get()._log("🔄 [Transform] Backend items:", backendItems);

        return backendItems.map((item) => {
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

          // price here is unit price (size + toppings) — preserve previous behaviour where item's displayed price = (size+toppings)*quantity
          const unitPrice = sizePrice + toppingsPrice;
          const totalPrice = unitPrice * (item.quantity || 1);

          return {
            id: item.productId?._id || item.productId,
            _id: item._id,
            name: item.productId?.name || "Sản phẩm",
            images: item.productId?.images || [],
            // keep both unit and total-ish compatibility: use unitPrice as price and quantity multiply elsewhere
            price: unitPrice,
            quantity: item.quantity || 1,
            sizeOption: item.sizeOption || "M",
            sizeOptionPrice: item.sizeOptionPrice || sizePrice || 0,
            sugarLevel: item.sugarLevel || "100%",
            iceOption: item.iceOption || "Chung",
            toppings: transformedToppings,
            availableToppings: item.productId?.availableToppings || [],
            sizeOptions: item.productId?.sizeOptions || [],
            // legacy compatibility: include computedTotal in case UI expects it
            _computedTotal: totalPrice,
          };
        });
      },

      // File: store/cartStore.js
      // ✅ SỬA: Sync cart KHÔNG clear cart cũ
      syncCartToBackend: async () => {
        const { items, currentStoreId, isAuthenticated } = get();

        get()._log("🔄 [SYNC] Starting SMART SYNC", {
          localItems: items.length,
          currentStoreId,
          isAuthenticated,
        });

        if (!isAuthenticated || !currentStoreId) {
          get()._log("❌ [SYNC] Skipped - not authenticated or no storeId");
          return;
        }

        // Nếu local cart rỗng, chỉ load từ backend (KHÔNG CLEAR)
        if (items.length === 0) {
          get()._log("🔄 [SYNC] Local cart empty, loading from backend only");
          await get().loadCartFromBackend(currentStoreId);
          return;
        }

        try {
          set({ isLoading: true });

          // 1. Lấy giỏ hàng hiện tại từ backend
          get()._log("📦 [SYNC] Getting existing backend cart...");
          let backendCart;
          try {
            const response = await cartAPI.getCart(currentStoreId);
            // cartAPI.getCart returns already-parsed object (see your api impl)
            backendCart = response.data || response || { items: [] };
            get()._log(
              "📦 [SYNC] Backend cart loaded:",
              backendCart.items?.length || 0,
              "items"
            );
          } catch (error) {
            get()._log("📦 [SYNC] No backend cart found, will create new one");
            backendCart = { items: [] };
          }

          // 2. SMART MERGE: Thêm local items vào backend (KHÔNG CLEAR)
          get()._log("🔄 [SYNC] Merging local items to backend...");

          // Use Promise.all to speed up multiple add requests
          await Promise.all(
            items.map(async (localItem) => {
              get()._log(
                "🔍 [SYNC] Processing local item:",
                localItem.name,
                "x",
                localItem.quantity
              );

              try {
                // Transform toppings to backend format expected by API
                const backendToppings = (localItem.toppings || []).map((t) => ({
                  toppingId: t._id,
                }));

                // Call addToCart API for each item
                await cartAPI.addToCart({
                  storeId: currentStoreId,
                  productId: localItem.id,
                  quantity: localItem.quantity,
                  sizeOption: localItem.sizeOption,
                  sugarLevel: localItem.sugarLevel,
                  iceOption: localItem.iceOption,
                  toppings: backendToppings,
                  specialNotes: localItem.specialNotes || "",
                });

                get()._log(
                  "✅ [SYNC] Item merged successfully:",
                  localItem.name
                );
              } catch (error) {
                get()._log(
                  "❌ [SYNC] Failed to merge item:",
                  error?.message || error
                );
                // swallow individual item errors to continue merging others
              }
            })
          );

          get()._log("✅ [SYNC] Merge process completed");

          // 3. Load lại giỏ hàng đã merged từ backend
          get()._log("🔄 [SYNC] Reloading final cart from backend...");
          await get().loadCartFromBackend(currentStoreId);

          get()._log("🎉 [SYNC] SMART MERGE completed!");
        } catch (error) {
          console.error("❌ [SYNC] syncCartToBackend error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ SỬA: Load giỏ hàng từ backend
     // File: store/cartStore.js
// ✅ SỬA HOÀN TOÀN: Load cart từ backend - ƯU TIÊN LOCAL CART
loadCartFromBackend: async (storeId = null) => {
  const effectiveStoreId = storeId || get().currentStoreId;
  const { isAuthenticated, _transformBackendToLocal, items: currentLocalItems } = get();

  if (!isAuthenticated || !effectiveStoreId) {
    get()._log("❌ [LOAD] Cannot load - not authenticated or no storeId");
    return currentLocalItems; // Trả về items hiện tại
  }

  try {
    set({ isLoading: true });
    get()._log("📥 [LOAD] Loading cart from backend for store:", effectiveStoreId, {
      currentLocalItems: currentLocalItems.length
    });
    
    const response = await cartAPI.getCart(effectiveStoreId);
    const backendData = response.data || response || {};
    const backendItems = backendData.items || [];
    const transformedBackendItems = _transformBackendToLocal(backendItems);

    get()._log("🔄 [LOAD] Backend vs Local:", {
      backendItems: transformedBackendItems.length,
      localItems: currentLocalItems.length
    });

    // ✅ QUAN TRỌNG: QUYẾT ĐỊNH ITEMS CUỐI CÙNG
    let finalItems = currentLocalItems;

    // NẾU: Local có items VÀ backend cũng có items → MERGE
    if (currentLocalItems.length > 0 && transformedBackendItems.length > 0) {
      get()._log("🔀 [LOAD] Both local and backend have items - SMART MERGING");
      
      // Tạo map của backend items để merge
      const backendItemsMap = new Map();
      transformedBackendItems.forEach(item => {
        const key = `${item.id}__${item.sizeOption}__${get()._mapToppingsForCompare(item.toppings)}`;
        backendItemsMap.set(key, item);
      });

      // Merge logic: Ưu tiên local items, nhưng cập nhật từ backend nếu cần
      const mergedItems = currentLocalItems.map(localItem => {
        const key = `${localItem.id}__${localItem.sizeOption}__${get()._mapToppingsForCompare(localItem.toppings)}`;
        const backendItem = backendItemsMap.get(key);
        
        if (backendItem) {
          // Item tồn tại ở cả 2 bên → giữ thông tin local nhưng có thể cập nhật _id từ backend
          backendItemsMap.delete(key); // Đánh dấu đã xử lý
          return {
            ...localItem,
            _id: backendItem._id, // Giữ _id từ backend để các thao tác sau
          };
        }
        return localItem;
      });

      // Thêm các items chỉ có trong backend (nếu có)
      const remainingBackendItems = Array.from(backendItemsMap.values());
      if (remainingBackendItems.length > 0) {
        get()._log("➕ [LOAD] Adding", remainingBackendItems.length, "items from backend");
        mergedItems.push(...remainingBackendItems);
      }

      finalItems = mergedItems;
      
    } 
    // NẾU: Local trống NHƯNG backend có items → DÙNG BACKEND
    else if (currentLocalItems.length === 0 && transformedBackendItems.length > 0) {
      get()._log("📥 [LOAD] Local empty, using backend items");
      finalItems = transformedBackendItems;
    }
    // NẾU: Local có items NHƯNG backend trống → GIỮ LOCAL (không làm gì)
    else if (currentLocalItems.length > 0 && transformedBackendItems.length === 0) {
      get()._log("💾 [LOAD] Backend empty, keeping local items");
      finalItems = currentLocalItems;
    }
    // NẾU: Cả 2 đều trống → trống
    else {
      get()._log("📭 [LOAD] Both local and backend are empty");
      finalItems = [];
    }

    // ✅ CẬP NHẬT STATE
    const { storeCarts } = get();
    set({
      items: finalItems,
      storeCarts: {
        ...storeCarts,
        [effectiveStoreId]: {
          items: finalItems,
          lastUpdated: Date.now(),
        },
      },
      isLoading: false,
    });

    get()._log(`✅ [LOAD] Final cart:`, finalItems.length, "items");
    return finalItems;

  } catch (error) {
    console.error("❌ [LOAD] Error loading cart:", error);
    set({ isLoading: false });
    // Trả về items hiện tại nếu có lỗi
    return currentLocalItems;
  }
},

      // ✅ SỬA: Add to cart - cập nhật cả storeCarts
      addToCart: async (product, quantity = 1) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
          storeCarts,
          _transformBackendToLocal,
        } = get();

        // ✅ KIỂM TRA: Phải có storeId
        if (!currentStoreId) {
          console.error("❌ [Cart] No storeId available for addToCart");
          return { success: false, error: "NO_STORE_SELECTED" };
        }

        // Tìm item trùng trong local
        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.id === product._id &&
            item.sizeOption === (product.sizeOption || "M") &&
            item.sugarLevel === (product.sugarLevel || "100%") &&
            item.iceOption === (product.iceOption || "Chung") &&
            _mapToppingsForCompare(item.toppings) ===
              _mapToppingsForCompare(product.toppings)
        );

        const sizeOptionObj = product.sizeOptions?.find(
          (s) => s.size === (product.sizeOption || "M")
        );

        const rawAvailable =
          product.availableToppings ||
          product.allToppings ||
          product.toppings ||
          [];

        //Transform toppings để gửi lên backend ĐÚNG FORMAT
        const backendToppings = (product.toppings || []).map((t) => {
          // Backend mong đợi { toppingId: string } hoặc string
          return {
            toppingId: t._id || t, // Chỉ gửi ID, không gửi cả object
          };
        });

        // Nếu đã đăng nhập, gọi API
        if (isAuthenticated && currentStoreId) {
          try {
            const response = await cartAPI.addToCart({
              storeId: currentStoreId,
              productId: product._id,
              quantity: quantity,
              sizeOption: product.sizeOption || "M",
              sugarLevel: product.sugarLevel || "100%",
              iceOption: product.iceOption || "Chung",
              toppings: backendToppings,
              specialNotes: "",
            });

            // Nếu backend trả về cart/data thì cập nhật local từ response (tránh re-fetch nặng)
            const respData = response.data || response || {};
            if (respData.data?.items) {
              const transformed = _transformBackendToLocal(respData.data.items);
              set({
                items: transformed,
                storeCarts: {
                  ...storeCarts,
                  [currentStoreId]: {
                    items: transformed,
                    lastUpdated: Date.now(),
                  },
                },
              });
            } else {
              // fallback: reload full cart for consistency
              await loadCartFromBackend(currentStoreId);
            }
            return;
          } catch (error) {
            console.error("❌ [Cart] Error adding to backend:", error);
            // Fallback to local below
          }
        }

        // Local handling (fallback hoặc chưa đăng nhập)
        let newItems;
        if (existingItemIndex !== -1) {
          newItems = [...get().items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          const newItem = {
            id: product._id,
            name: product.name,
            images: product.images || [],
            price: product.price || 0,
            quantity: quantity,
            sizeOption:
              product.sizeOption || (product.sizeOptions?.[0]?.size ?? "M"),
            sizeOptionPrice: sizeOptionObj?.price || 0,
            sugarLevel: product.sugarLevel || "100%",
            iceOption: product.iceOption || "Chung",
            sizeOptions: product.sizeOptions || [],
            toppings: (product.toppings || []).map((t) => ({
              _id: t._id,
              name: t.name,
              extraPrice: t.extraPrice || 0,
            })),
            availableToppings: (rawAvailable || []).map((t) => ({
              _id: t._id,
              name: t.name,
              extraPrice: t.extraPrice || 0,
            })),
          };
          newItems = [...get().items, newItem];
        }

        // ✅ CẬP NHẬT CẢ storeCarts
        set({
          items: newItems,
          storeCarts: {
            ...storeCarts,
            [currentStoreId]: {
              items: newItems,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      // ✅ SỬA: Remove from cart - cập nhật cả storeCarts
      removeFromCart: async (id, options = {}) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
          storeCarts,
        } = get();

        // Nếu đã đăng nhập, xóa trong backend
        if (isAuthenticated && currentStoreId) {
          try {
            // Tìm item trong local để lấy _id từ backend
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
              return;
            }
          } catch (error) {
            console.error("❌ [Cart] Error removing from backend:", error);
            // Fallback to local
          }
        }

        // Local handling
        const updatedItems = get().items.filter(
          (item) =>
            !(
              item.id === id &&
              item.sizeOption === (options.sizeOption || "M") &&
              item.sugarLevel === (options.sugarLevel || "100%") &&
              item.iceOption === (options.iceOption || "Chung") &&
              _mapToppingsForCompare(item.toppings) ===
                _mapToppingsForCompare(options.toppings)
            )
        );

        // ✅ CẬP NHẬT CẢ storeCarts
        set({
          items: updatedItems,
          storeCarts: {
            ...storeCarts,
            [currentStoreId]: {
              items: updatedItems,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      // ✅ SỬA: Update quantity - cập nhật cả storeCarts
      updateQuantity: async (id, quantity, options = {}) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
          storeCarts,
        } = get();

        // Nếu đã đăng nhập, cập nhật backend
        if (isAuthenticated && currentStoreId) {
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
              return;
            }
          } catch (error) {
            console.error(
              "❌ [Cart] Error updating quantity in backend:",
              error
            );
            // Fallback to local
          }
        }

        // Local handling
        const updatedItems = get().items.map((item) => {
          if (
            item.id === id &&
            item.sizeOption === (options.sizeOption || "M") &&
            item.sugarLevel === (options.sugarLevel || "100%") &&
            item.iceOption === (options.iceOption || "Chung") &&
            _mapToppingsForCompare(item.toppings) ===
              _mapToppingsForCompare(options.toppings)
          ) {
            return { ...item, quantity };
          }
          return item;
        });

        // ✅ CẬP NHẬT CẢ storeCarts
        set({
          items: updatedItems,
          storeCarts: {
            ...storeCarts,
            [currentStoreId]: {
              items: updatedItems,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      // ✅ SỬA: Update cart item - cập nhật cả storeCarts
      updateCartItem: async (oldItem, updatedItem) => {
        const {
          isAuthenticated,
          currentStoreId,
          _mapToppingsForCompare,
          loadCartFromBackend,
          storeCarts,
        } = get();

        if (isAuthenticated && currentStoreId) {
          try {
            const backendToppings = (updatedItem.toppings || []).map((t) => ({
              toppingId: t._id, // Chỉ gửi ID
            }));

            get()._log(
              "✏️ [Cart] Updating item with toppings:",
              backendToppings
            );
            await cartAPI.updateCartItem({
              storeId: currentStoreId,
              itemId: oldItem._id,
              newConfig: {
                toppings: backendToppings,
                specialNotes: updatedItem.specialNotes || "",
                sizeOption: updatedItem.sizeOption,
                sugarLevel: updatedItem.sugarLevel,
                iceOption: updatedItem.iceOption,
              },
            });
            await loadCartFromBackend(currentStoreId);
            return;
          } catch (error) {
            console.error("❌ [Cart] Error updating item in backend:", error);
          }
        }

        // Local implementation
        const updatedItems = get().items.map((item) => {
          if (
            item.id === oldItem.id &&
            item.sizeOption === oldItem.sizeOption &&
            item.sugarLevel === oldItem.sugarLevel &&
            item.iceOption === oldItem.iceOption &&
            _mapToppingsForCompare(item.toppings) ===
              _mapToppingsForCompare(oldItem.toppings)
          ) {
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
              price: newSizePrice + toppingTotal,
            };
          }
          return item;
        });

        // ✅ CẬP NHẬT CẢ storeCarts
        set({
          items: updatedItems,
          storeCarts: {
            ...storeCarts,
            [currentStoreId]: {
              items: updatedItems,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      // ✅ SỬA: Clear cart - chỉ clear store hiện tại
      clearCart: async () => {
        const { isAuthenticated, currentStoreId, storeCarts } = get();

        if (isAuthenticated && currentStoreId) {
          try {
            get()._log("🗑️ [CLEAR] Attempting to clear backend cart...");

            try {
              const existingCart = await cartAPI.getCart(currentStoreId);
              const backendItems =
                existingCart?.data?.items || existingCart?.items || [];
              if (backendItems && backendItems.length > 0) {
                await cartAPI.clearCart(currentStoreId);
                get()._log("✅ [CLEAR] Backend cart cleared successfully");
                // reload to keep in sync
                await get().loadCartFromBackend(currentStoreId);
              } else {
                get()._log(
                  "ℹ️ [CLEAR] No backend cart to clear (already empty)"
                );
              }
            } catch (error) {
              get()._log("ℹ️ [CLEAR] No backend cart found to clear");
            }
          } catch (error) {
            console.error(
              "❌ [CLEAR] Error clearing backend cart:",
              error.message
            );
          }
        }

        // ✅ CLEAR CHỈ store hiện tại
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
        get()._log("✅ [CLEAR] Local cart cleared for store:", currentStoreId);
      },

      // ✅ THÊM: Helper functions cho multi-store
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

      // Các hàm helper khác
      getCurrentItems: () => get().items,
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      getCartTotal: () =>
        get().items.reduce(
          (total, item) => total + (item.price || 0) * (item.quantity || 1),
          0
        ),

      getSelectedTotal: () => {
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

      mergeDuplicateItems: () => {
        const { items, _mapToppingsForCompare, currentStoreId, storeCarts } =
          get();

        let mergedItems = [];
        for (let i = 0; i < items.length; i++) {
          const current = items[i];
          const existingIndex = mergedItems.findIndex(
            (m) =>
              m.id === current.id &&
              m.sizeOption === current.sizeOption &&
              m.sugarLevel === current.sugarLevel &&
              m.iceOption === current.iceOption &&
              _mapToppingsForCompare(m.toppings) ===
                _mapToppingsForCompare(current.toppings)
          );

          if (existingIndex !== -1) {
            // giữ nguyên đơn giá, chỉ cộng quantity
            mergedItems[existingIndex] = {
              ...mergedItems[existingIndex],
              quantity:
                (mergedItems[existingIndex].quantity || 0) +
                (current.quantity || 0),
            };
          } else {
            mergedItems.push({ ...current });
          }
        }

        // ✅ CẬP NHẬT CẢ storeCarts
        set({
          items: mergedItems,
          storeCarts: {
            ...storeCarts,
            [currentStoreId]: {
              items: mergedItems,
              lastUpdated: Date.now(),
            },
          },
        });
      },

      getItemById: (productId) => {
        const { items } = get();
        return items.find((item) => item.id === productId) || null;
      },

      // ✅ THÊM: Reload current cart (helper)
      reloadCurrentCart: async () => {
        const { currentStoreId } = get();
        if (!currentStoreId) return;
        await get().loadCartFromBackend(currentStoreId);
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
