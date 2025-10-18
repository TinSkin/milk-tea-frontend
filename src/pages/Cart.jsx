import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useStoreSelectionStore } from "../store/storeSelectionStore";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Pencil,
  Settings,
} from "lucide-react";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { checkOutSchema } from "../utils/checkOutSchema";

// Import Component
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const selectedItems = useCartStore((state) => state.selectedItems);
  const setSelectedItems = useCartStore((state) => state.setSelectedItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const mergeDuplicateItems = useCartStore((state) => state.mergeDuplicateItems);

  const { 
    loadCartFromBackend, 
    isAuthenticated, 
    currentStoreId,
    isLoading: cartLoading
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const products = useProductStore((state) => state.products);

  const getItemKey = (item) =>
    `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(
      item.toppings || []
    )}`;

  //! Load giỏ hàng từ backend khi component mount và user đã đăng nhập
 // File: pages/Cart.js
//! Load giỏ hàng từ backend khi component mount và user đã đăng nhập
useEffect(() => {
  console.log("🔄 [Cart] useEffect triggered", {
    isAuthenticated,
    currentStoreId,
    itemsCount: items.length
  });
  
  if (isAuthenticated && currentStoreId) {
    console.log("📥 [Cart] Loading cart from backend...");
    loadCartFromBackend(currentStoreId);
  }
}, [isAuthenticated, currentStoreId, loadCartFromBackend]);

// ✅ THÊM: Debug items
useEffect(() => {
  console.log("📦 [Cart] Items updated:", {
    count: items.length,
    items: items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      toppings: item.toppings,
      price: item.price
    }))
  });
}, [items]);
  //! Hàm xóa tất cả sản phẩm khỏi giỏ hàng
  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      console.log("🧹 [Cart] User triggered clear cart");
      try {
        await clearCart();
        toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
      } catch (error) {
        console.error("❌ [Cart] Error clearing cart:", error);
        toast.error("Có lỗi khi xóa giỏ hàng");
      }
    }
  };

  // ✅ SỬA: Hàm xử lý lỗi khi update quantity
  const handleUpdateQuantity = async (id, quantity, options = {}) => {
    try {
      if (quantity < 1) {
        toast.error("Số lượng phải lớn hơn 0");
        return;
      }
      await updateQuantity(id, quantity, options);
    } catch (error) {
      console.error("❌ [Cart] Error updating quantity:", error);
      toast.error("Có lỗi khi cập nhật số lượng");
    }
  };

  // ✅ SỬA: Hàm xử lý lỗi khi remove item
  const handleRemoveFromCart = async (id, options = {}) => {
    try {
      await removeFromCart(id, options);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error("❌ [Cart] Error removing item:", error);
      toast.error("Có lỗi khi xóa sản phẩm");
    }
  };

  //! Hàm xử lý khi nhấn nút thanh toán
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }

    navigate("/checkout");
  };

  //! Hàm đếm tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  //! Hàm xử lý tick checkbox
  const handleSelectItem = (item) => {
    const key = getItemKey(item);
    if (selectedItems.includes(key)) {
      setSelectedItems(selectedItems.filter((k) => k !== key));
    } else {
      setSelectedItems([...selectedItems, key]);
    }
  };

  //! Hàm tính tổng số lượng sản phẩm được chọn
  const getSelectedQuantity = () => {
    return items
      .filter((item) => selectedItems.includes(getItemKey(item)))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  //! Hàm tính tổng tiền sản phẩm được chọn
  const getSelectedTotal = () => {
    return items
      .filter((item) => selectedItems.includes(getItemKey(item)))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
  
  //! Hàm sửa sản phẩm
  const handleEdit = (cartItem) => {
    const product = products?.find((p) => p._id === cartItem.id);

    const rawAvailable =
      product?.availableToppings ||
      product?.allToppings ||
      product?.toppingOptions ||
      product?.toppingsList ||
      product?.toppings ||
      cartItem?.availableToppings ||
      [];

    const availableToppings = Array.isArray(rawAvailable)
      ? rawAvailable.map((t) => ({
          _id: t._id,
          name: t.name,
          extraPrice: typeof t.extraPrice === "number" ? t.extraPrice : 0,
        }))
      : [];

    const selectedToppings = (cartItem.toppings || []).map((t) => ({
      _id: t._id,
      name: t.name,
      extraPrice: typeof t.extraPrice === "number" ? t.extraPrice : 0,
    }));

    const sizeOptions = product?.sizeOptions || cartItem?.sizeOptions || [];

    const merged = {
      ...(product || {}),
      ...cartItem,
      sizeOptions,
      availableToppings,
      toppings: selectedToppings,
      quantity: cartItem.quantity || 1,
      sizeOption: cartItem.sizeOption || sizeOptions[0]?.size || "M",
      sugarLevel: cartItem.sugarLevel || "100%",
      iceOption: cartItem.iceOption || "Chung",
    };

    setEditingItem({ oldItem: cartItem, merged });
  };

  // ✅ SỬA: Hàm xử lý submit form chỉnh sửa
  const handleEditSubmit = async (values) => {
    try {
      const merged = editingItem.merged || {};
      const selectedSize = (merged.sizeOptions || []).find(
        (s) => s.size === values.sizeOption
      );
      const sizePrice = selectedSize?.price || 0;

      const toppingsPrice = (values.toppings || []).reduce(
        (sum, t) => sum + (t.extraPrice || 0),
        0
      );

      const updatedItem = {
        quantity: values.quantity,
        sizeOption: values.sizeOption,
        sizeOptionPrice: sizePrice,
        sugarLevel: values.sugarLevel,
        iceOption: values.iceOption,
        toppings: values.toppings,
        price: merged.price || 0,
      };

      await updateCartItem(editingItem.oldItem, updatedItem);
      await mergeDuplicateItems();
      setEditingItem(null);
      toast.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("❌ [Cart] Error updating item:", error);
      toast.error("Có lỗi khi cập nhật sản phẩm");
    }
  };

  if (items.length === 0 && !cartLoading) {
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
                Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản
                phẩm tuyệt vời của chúng tôi!
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
            <div className="lg:col-span-9 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">
                  Sản phẩm ({getTotalItems()})
                </h2>
                <button
                  onClick={handleClearCart}
                  disabled={cartLoading}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Xóa tất cả
                </button>
              </div>
              {cartLoading ? (
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
                          <th className="text-center w-[50px]"></th>
                          <th className="p-3 text-left text-lg font-semibold w-1/5">
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
                          <th className="p-3 flex justify-center text-lg font-semibold">
                            <Settings className="w-5 h-5" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                          <tr
                            key={
                              item.id +
                              item.sizeOption +
                              JSON.stringify(item.toppings)
                            }
                          >
                            <td className="px-1 text-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={selectedItems.includes(
                                  getItemKey(item)
                                )}
                                onChange={() => handleSelectItem(item)}
                              />
                            </td>

                            <td className="p-3 flex items-center space-x-3">
                              <img
                                src={
                                  Array.isArray(item.images) &&
                                  item.images.length > 0
                                    ? item.images[0]
                                    : "https://placehold.co/50x50?text=No+Image"
                                }
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) =>
                                  (e.target.src =
                                    "https://placehold.co/50x50?text=No+Image")
                                }
                              />

                              <span className="font-bold text-lg text-dark_blue">
                                {item.name}
                              </span>
                            </td>
                            <td className="p-3 text-lg text-dark_blue">
                              {item.sugarLevel}
                            </td>
                            <td className="p-3 text-lg text-dark_blue">
                              {item.iceOption}
                            </td>
                            <td
                              colSpan={3}
                              className="p-3 text-lg text-dark_blue"
                            >
                              {item.toppings.map((option, index) => (
                                <div
                                  key={index}
                                  className="block mx-1 px-2 py-1 mt-2 rounded text-left"
                                >
                                  <span className="text-black">
                                    {typeof option === "object"
                                      ? option.name
                                      : option}
                                  </span>
                                  <span className="text-black ml-1">
                                    {typeof option.extraPrice === "number"
                                      ? `+${option.extraPrice.toLocaleString()}₫`
                                      : ""}
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
                                  handleUpdateQuantity(
                                    item.id,
                                    parseInt(e.target.value),
                                    {
                                      sizeOption: item.sizeOption,
                                      sugarLevel: item.sugarLevel,
                                      iceOption: item.iceOption,
                                      toppings: item.toppings,
                                    }
                                  )
                                }
                                min="1"
                                className="w-16 p-1 border rounded text-center"
                              />
                            </td>
                            <td className="p-3 text-lg text-gray-900">
                              {(item.price * item.quantity).toLocaleString()} ₫
                            </td>
                            <td className="p-3 flex gap-3 mb-10">
                              {/* Nút xem/chỉnh sửa */}
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>

                              {/* Nút xóa */}
                              <button
                                onClick={() =>
                                  handleRemoveFromCart(item.id, {
                                    sizeOption: item.sizeOption,
                                    sugarLevel: item.sugarLevel,
                                    iceOption: item.iceOption,
                                    toppings: item.toppings,
                                  })
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
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
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0b3042]/10 rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-[#0b3042] mb-6">
                  Giỏ hàng của bạn
                </h2>

                <div className="space-y-4">
                  {/* Items Summary */}
                  <div className="flex justify-between text-black">
                    <span>Tất cả ({getTotalItems()} sản phẩm)</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-black">
                      <span>Mua hàng ({getSelectedQuantity()} sản phẩm)</span>
                      <span className="text-green-600">
                        {formatPrice(getSelectedTotal())}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={cartLoading || selectedItems.length === 0}
                    className="w-full bg-[#0b3042] text-white hover:scale-105 font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? (
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
      <Footer />

      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          {(() => {
            const merged = editingItem.merged || {};
            const raw = (merged.availableToppings || []).concat(
              merged.toppings || []
            );
            const seen = {};
            const union = [];
            for (let i = 0; i < raw.length; i++) {
              const t = raw[i];
              if (!t || !t._id) continue;
              if (!seen[t._id]) {
                seen[t._id] = true;
                union.push({
                  _id: t._id,
                  name: t.name,
                  extraPrice: t.extraPrice || 0,
                });
              }
            }

            return (
              <Formik
                enableReinitialize
                initialValues={{
                  quantity: merged.quantity ?? 1,
                  sizeOption:
                    merged.sizeOption ?? merged.sizeOptions?.[0]?.size ?? "M",
                  sugarLevel: merged.sugarLevel ?? "100%",
                  iceOption: merged.iceOption ?? "Chung",
                  toppings: merged.toppings || [],
                }}
                onSubmit={handleEditSubmit}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form className="bg-white p-6 rounded shadow-md w-[700px] max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">
                      {merged.name || "Chỉnh sửa"}
                    </h2>

                    {merged.images?.[0] && (
                      <img
                        src={merged.images[0]}
                        alt={merged.name || ""}
                        className="w-24 h-24 object-cover rounded mb-4"
                      />
                    )}

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue(
                            "quantity",
                            Math.max((values.quantity || 1) - 1, 1)
                          )
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <Field
                        name="quantity"
                        type="number"
                        className="w-16 text-center border rounded py-1"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue("quantity", (values.quantity || 1) + 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* Size */}
                    <div className="mb-4">
                      <label className="font-semibold block mb-1">Size</label>
                      <div className="flex gap-4 flex-wrap">
                        {(merged.sizeOptions || []).map((size) => (
                          <label
                            key={size.size}
                            className="flex items-center gap-2"
                          >
                            <Field
                              type="radio"
                              name="sizeOption"
                              value={size.size}
                            />
                            <span>
                              {size.size} ({(size.price || 0).toLocaleString()}
                              ₫)
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Topping */}
                    <div className="mb-4">
                      <label className="font-semibold block mb-1">
                        Topping
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {union.length ? (
                          union.map((topping) => {
                            const isChecked = (values.toppings || []).some(
                              (t) => t._id === topping._id
                            );
                            return (
                              <label
                                key={topping._id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...(values.toppings || []), topping]
                                      : (values.toppings || []).filter(
                                          (t) => t._id !== topping._id
                                        );
                                    setFieldValue("toppings", updated);
                                  }}
                                />
                                <span>
                                  {topping.name} (+
                                  {(topping.extraPrice || 0).toLocaleString()}₫)
                                </span>
                              </label>
                            );
                          })
                        ) : (
                          <div>Không có topping</div>
                        )}
                      </div>
                    </div>

                    {/* Sugar & Ice */}
                    <div className="mb-4">
                      <label className="font-semibold block mb-1">Đường</label>
                      <div className="flex gap-4">
                        {["25%", "50%", "75%", "100%"].map((l) => (
                          <label key={l} className="flex items-center gap-2">
                            <Field type="radio" name="sugarLevel" value={l} />
                            {l}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="font-semibold block mb-1">Đá</label>
                      <div className="flex gap-4">
                        {["Chung", "Riêng"].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <Field type="radio" name="iceOption" value={opt} />
                            {opt === "Chung" ? "Đá Chung" : "Đá Riêng"}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-4 py-2 border rounded"
                        disabled={isSubmitting}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            );
          })()}
        </div>
      )}
    </>
  );
};

export default Cart;