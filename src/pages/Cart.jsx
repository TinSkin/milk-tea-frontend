import { useEffect, useState } from "react"; // Import hook useEffect và useState để quản lý trạng thái và side-effect
import { Link, useNavigate } from "react-router-dom"; // Import hook useNavigate để điều hướng
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cartStore";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { checkOutSchema } from "../utils/checkOutSchema";

// Import Component
import Header from "../components/Header";
import Footer from "../components/Footer";
import Notification from "../components/Notification";


const Cart = () => {
  // Định nghĩa component Cart
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
  const items = useCartStore((state) => state.items);
const clearCart = useCartStore((state) => state.clearCart);
const getCartTotal = useCartStore((state) => state.getCartTotal);
const getTotalItems = useCartStore((state) => state.getTotalItems);
const removeFromCart = useCartStore((state) => state.removeFromCart);
const updateQuantity = useCartStore((state) => state.updateQuantity);


const [isLoading, setIsLoading] = useState(false); // Trạng thái loading


  //hàm xóa tất cả sản phẩm khỏi giỏ hàng
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      clearCart();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    navigate("/checkout");
  };



  //hàm đếm tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Tính tổng tiền
  const getTotal = () => {
    return getCartTotal().toLocaleString();
  };

  if (items.length === 0 && !isLoading) {
    return (
      <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-[#0b3042] rounded-full w-24 h-24 flex items-center justify-center mx-auto mt-20">
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0b3042] mb-4 mt-4">
              Giỏ hàng trống
            </h2>
            <p className="text-black mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm
              tuyệt vời của chúng tôi!
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#0b3042] text-white hover:scale-105 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Quay lại trang thực đơn
            </Link>
          </motion.div>
 </div>
 </div>
   </>
    );
  }


  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0b3042] mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-black">
            Bạn có {getTotalItems()} sản phẩm trong giỏ hàng
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black">
                Sản phẩm ({items.length})
              </h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
            {isLoading ? (
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-dark_blue mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full bg-white border divide-y divide-gray-200">
                  <thead className="bg-dark_blue text-white">
                    <tr>
                      <th className="p-3 text-left text-lg font-semibold w-1/4">
                        Tên
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Đường
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Đá
                      </th>
                      <th
                        colSpan={3}
                        className="p-3 text-left text-lg font-semibold"
                      >
                        Topping
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Giá
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Số lượng
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Thành tiền
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                      <tr
                        key={
                          item.productId +
                          item.sizeOption +
                          JSON.stringify(item.toppings)
                        }
                      >
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={item.images}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/50x50?text=Image+Not+Found")
                            }
                          />
                          <span className="font-bold text-lg text-dark_blue">
                            {item.name}
                          </span>
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.sugarLevel.toLocaleString()}%
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.iceOption.toLocaleString()}
                        </td>
                        <td colSpan={3} className="p-3 text-lg text-dark_blue">
                          {item.toppings.map((option, index) => (
                            <div
                              key={index}
                              className="block mx-1 px-2 py-1 mt-2 rounded text-left"
                            >
                              <span className="text-black">
                                {typeof option === "object"
                                  ? option.name
                                  : option}
                                : <span></span>
                              </span>
                              <span className="text-black">
                                {typeof option.extraPrice === "number"
                                  ? option.extraPrice.toLocaleString()
                                  : "N/A"}
                                ₫
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.price.toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value), {
                                sizeOption: item.sizeOption,
                                sugarLevel: item.sugarLevel,
                                iceOption: item.iceOption,
                                toppings: item.toppings
                              })
                
                            }
                            min="1"
                            className="w-16 p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-3 text-lg text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              removeFromCart(item.id, {
                                sizeOption: item.sizeOption,
                                sugarLevel: item.sugarLevel,
                                iceOption: item.iceOption,
                                toppings: item.toppings
                              })
                            }
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
           </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0b3042]/10 rounded-lg shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-[#0b3042] mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4">
                {/* Items Summary */}
                <div className="flex justify-between text-black">
                  <span>Tạm tính ({getTotalItems()} sản phẩm)</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>

                <div className="flex justify-between text-black">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-black">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-[#0b3042] text-white hover:scale-105 font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                 
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tiến hành thanh toán
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/menu"
                  className="block w-full text-center text-[#0b3042] hover:scale-105 font-medium py-2 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm text-center">
                  🔒 Thanh toán an toàn và bảo mật
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart; // Xuất component Cart
