import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreSelectionStore } from "../../../store/storeSelectionStore";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [lastStoreId, setLastStoreId] = useState(null);
  
  const { selectedStore } = useStoreSelectionStore();

  //! Xử lí giỏ hàng từ localStorage
  const loadCart = () => {
    try {
      const storedCart = localStorage.getItem("cart-storage");
      
      // Nếu không có key hoặc key bị xóa
      if (!storedCart) {
        console.log("No cart found in localStorage");
        setCartItems([]);
        return;
      }
      
      const parsedCart = JSON.parse(storedCart);
      const cartItems = parsedCart?.state?.items || [];
      console.log("Loaded cart items:", cartItems);
      setCartItems(cartItems);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
      // Xóa corrupted data
      localStorage.removeItem("cart-storage");
    }
  };

  //! Clear cart when store changes
  const clearCart = () => {
    // Xóa hoàn toàn localStorage key để tránh cache issue
    localStorage.removeItem("cart-storage");
    setCartItems([]);
    
    // Dispatch multiple events để đảm bảo tất cả components được update
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart-storage',
      oldValue: null,
      newValue: null,
      storageArea: localStorage
    }));
    
    console.log("Cart cleared completely - localStorage key removed");
  };

  useEffect(() => {
    loadCart();
    
    // Lắng nghe event "cartUpdated" để cập nhật lại cartItems
    const handleCartUpdate = () => {
      loadCart();
    };

    // Lắng nghe localStorage changes từ tabs khác
    const handleStorageChange = (e) => {
      if (e.key === "cart-storage") {
        loadCart();
      }
    };

    // Lắng nghe focus event để cập nhật khi quay lại tab
    const handleFocus = () => {
      loadCart();
    };

    // Polling mechanism - check localStorage every 2 seconds
    const pollInterval = setInterval(() => {
      loadCart();
    }, 2000);

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollInterval);
    };
  }, []);

  //! Clear cart when store changes
  useEffect(() => {
    if (selectedStore?._id) {
      // First time setting store - just track it
      if (lastStoreId === null) {
        setLastStoreId(selectedStore._id);
        return;
      }
      
      // Store changed - clear cart for guest users
      if (lastStoreId !== selectedStore._id) {        
        clearCart();
        setLastStoreId(selectedStore._id);
        
        // Show notification to user
        if (window.showNotification) {
          window.showNotification("Giỏ hàng đã được làm trống do thay đổi cửa hàng", "info");
        }
      }
    }
  }, [selectedStore?._id, lastStoreId]);

  return (
    <div className="rounded-lg w-72 text-center shadow-lg">
      {/* Cart Header */}
      <div className="bg-[#151d2d] p-4 rounded-tr rounded-tl mb-4 shadow-sm">
        <h2 className="text-white text-lg font-semibold">Giỏ Hàng Của Tôi</h2>
      </div>
      {/* Cart Items */}
      <div className="w-[80%] mx-auto pb-4">
        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Chưa có sản phẩm nào!</p>
        ) : (
          <ul className="text-left text-sm space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
            {cartItems.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={item.images}
                    alt={item.productName}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {item.sizeOption} | SL: {item.quantity}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/cart"
          className="bg-[#151d2d] hover:bg-camel text-white w-full px-4 py-2 rounded text-sm font-semibold block"
        >
          Thanh toán
        </Link>
      </div>
    </div>
  );
}

export default Cart;
