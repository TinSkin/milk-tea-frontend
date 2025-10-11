import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreSelectionStore } from "../../../store/storeSelectionStore";
import { useCartStore } from "../../../store/cartStore";
import Notification from "../../ui/Notification";

function Cart() {
  const [lastStoreId, setLastStoreId] = useState(null);

  // Lấy thông tin cửa hàng đã chọn
  const { selectedStore } = useStoreSelectionStore();
  
  // Lấy cartItems và clearCart từ Zustand store
  const { items: cartItems, clearCart: clearCartStore } = useCartStore();

  //! Xóa hoàn toàn giỏ hàng (cả Zustand và localStorage)
  const clearCart = () => {
    // Xóa trong Zustand store (sẽ tự động xóa localStorage)
    clearCartStore();

    // Dispatch events để đảm bảo tất cả components được update
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "cart-storage",
        oldValue: null,
        newValue: null,
        storageArea: localStorage,
      })
    );

    console.log("Cart cleared completely - both Zustand and localStorage");
  };

  //! Xóa giỏ hàng khi cửa hàng thay đổi
  useEffect(() => {
    if (selectedStore?._id) {
      // Lần đầu tiên thiết lập cửa hàng - chỉ theo dõi nó
      if (lastStoreId === null) {
        setLastStoreId(selectedStore._id);
        return;
      }

      // Cửa hàng thay đổi - xóa giỏ hàng cho người dùng khách
      if (lastStoreId !== selectedStore._id) {
        clearCart();
        setLastStoreId(selectedStore._id);

        // Hiển thị thông báo cho người dùng
        Notification.info("Giỏ hàng đã được làm trống do thay đổi cửa hàng");
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
