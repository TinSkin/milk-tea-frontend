import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  //! Handle loading cart
  const loadCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(storedCart);
  };

  useEffect(() => {
    loadCart();
    // Lắng nghe event "cartUpdated" để cập nhật lại cartItems
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  return (
    <div className="rounded-lg w-72 text-center shadow-lg">
      {/* Cart Header */}
      <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md mb-4 shadow-sm">
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
          className="bg-dark_blue hover:bg-camel text-white w-full px-4 py-2 rounded text-sm font-semibold block"
        >
          Thanh toán
        </Link>
      </div>
    </div>
  );
}

export default Cart;
