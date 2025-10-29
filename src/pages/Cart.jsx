import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useToppingStore } from "../store/toppingStore";
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
  const mergeDuplicateItems = useCartStore(
    (state) => state.mergeDuplicateItems
  );

  const {
    loadCartFromBackend,
    isAuthenticated,
    currentStoreId,
    isLoading: cartLoading,
  } = useCartStore();

  const { toppings, getAllToppings, getAvailableToppings } = useToppingStore();
  const { products, getAllProducts } = useProductStore();

  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const getItemKey = (item) =>
    `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(
      item.toppings || []
    )}`;

  //! Load giỏ hàng từ backend khi component mount và user đã đăng nhập
  useEffect(() => {
    console.log(" [Cart] useEffect triggered", {
      isAuthenticated,
      currentStoreId,
      itemsCount: items.length,
    });

    const loadData = async () => {
      if (isAuthenticated && currentStoreId) {
        console.log(" [Cart] Loading cart from backend...");
        await loadCartFromBackend(currentStoreId);
      }

      // Load products nếu chưa có
      if (products.length === 0) {
        console.log(" [Cart] Loading products...");
        await getAllProducts({ limit: 100 });
      }

      // THÊM: Load toppings nếu chưa có
      if (toppings.length === 0) {
        console.log(" [Cart] Loading all toppings...");
        await getAllToppings({
          limit: 100,
          status: "available",
          sortBy: "name",
          sortOrder: "asc",
        });
      }
      if (isAuthenticated && currentStoreId) {
        console.log(" [Cart] Loading cart from backend...");
        loadCartFromBackend(currentStoreId);
      }
    };

    loadData();
  }, [
    isAuthenticated,
    currentStoreId,
    loadCartFromBackend,
    getAllProducts,
    getAllToppings,
  ]);

  useEffect(() => {
    console.log(" [Cart] Items updated:", {
      count: items.length,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        toppings: item.toppings,
        price: item.price,
      })),
    });
  }, [items]);

  useEffect(() => {
    console.log(" [Cart] Data status:", {
      productsCount: products.length,
      toppingsCount: toppings.length,
      availableToppingsCount: getAvailableToppings().length,
      itemsCount: items.length,
    });
  }, [products, toppings, items]);
  //! Hàm xóa tất cả sản phẩm khỏi giỏ hàng - SỬA ĐỔI
  const handleClearCart = async () => {
    // Thay vì dùng window.confirm, hiển thị modal custom
    setShowClearCartModal(true);
  };

  //! Hàm xác nhận xóa giỏ hàng
  const confirmClearCart = async () => {
    console.log("🧹 [Cart] User confirmed clear cart");
    try {
      await clearCart();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
      setShowClearCartModal(false);
    } catch (error) {
      console.error(" [Cart] Error clearing cart:", error);
      toast.error("Có lỗi khi xóa giỏ hàng");
    }
  };

  //! Hàm hủy xóa giỏ hàng
  const cancelClearCart = () => {
    setShowClearCartModal(false);
  };

  //  SỬA: Hàm xử lý lỗi khi update quantity
  const handleUpdateQuantity = async (id, quantity, options = {}) => {
    try {
      if (quantity < 1) {
        toast.error("Số lượng phải lớn hơn 0");
        return;
      }
      await updateQuantity(id, quantity, options);
    } catch (error) {
      console.error(" [Cart] Error updating quantity:", error);
      toast.error("Có lỗi khi cập nhật số lượng");
    }
  };

  //  SỬA: Hàm xử lý lỗi khi remove item
  const handleRemoveFromCart = async (id, options = {}) => {
    try {
      await removeFromCart(id, options);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      console.error(" [Cart] Error removing item:", error);
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

  //! Hàm sửa sản phẩm - CHỈ DÙNG TOPPING TỪ SẢN PHẨM
  const handleEdit = (cartItem) => {
    console.log(" [Cart] Editing item:", cartItem);

    // Tìm sản phẩm gốc từ store products
    const product = products?.find((p) => p._id === cartItem.id);
    console.log(" [Cart] Found product:", product);

    if (!product) {
      console.error(" [Cart] Product not found for item:", cartItem);
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    //  SỬA: CHUẨN HÓA sugarLevel - bỏ ký tự % nếu có
    const currentSugarLevel = cartItem.sugarLevel || "100%";
    const normalizedSugarLevel = currentSugarLevel.includes("%")
      ? currentSugarLevel.replace("%", "")
      : currentSugarLevel;

    // Lấy danh sách topping CHỈ từ sản phẩm gốc
    const rawProductToppings =
      product.availableToppings ||
      product.allToppings ||
      product.toppingOptions ||
      product.toppingsList ||
      product.toppings ||
      [];

    console.log(" [Cart] Raw product toppings:", rawProductToppings);

    // Xử lý topping từ sản phẩm
    const availableToppings = rawProductToppings
      .map((topping) => {
        // Xử lý cả hai định dạng: topping trực tiếp hoặc qua toppingId
        const toppingData = topping.toppingId || topping;

        return {
          _id: toppingData._id,
          name: toppingData.name || "Topping",
          extraPrice: toppingData.extraPrice || 0,
        };
      })
      .filter((topping) => topping._id); // Lọc bỏ topping không hợp lệ

    console.log(" [Cart] Available toppings for product:", availableToppings);

    // Lấy topping đã chọn từ cart item và map với topping gốc
    const selectedToppings = (cartItem.toppings || [])
      .map((cartTopping) => {
        // Tìm topping gốc từ danh sách topping của sản phẩm
        const originalTopping = availableToppings.find(
          (t) => t._id === cartTopping._id
        );

        return (
          originalTopping || {
            _id: cartTopping._id,
            name: cartTopping.name,
            extraPrice: cartTopping.extraPrice || 0,
          }
        );
      })
      .filter((topping) => topping._id); // Lọc bỏ topping không hợp lệ

    console.log(" [Cart] Selected toppings:", selectedToppings);

    const sizeOptions = product.sizeOptions || cartItem.sizeOptions || [];

    const merged = {
      ...product,
      ...cartItem,
      sizeOptions,
      availableToppings, // Chỉ chứa topping của sản phẩm này
      toppings: selectedToppings,
      quantity: cartItem.quantity || 1,
      sizeOption: cartItem.sizeOption || sizeOptions[0]?.size || "M",
      sugarLevel: normalizedSugarLevel, //  SỬA: Dùng giá trị đã chuẩn hóa (không có %)
      iceOption: cartItem.iceOption || "Chung",
    };

    console.log(" [Cart] Final merged data:", {
      productName: merged.name,
      sugarLevel: merged.sugarLevel, //  Kiểm tra giá trị
      availableToppings: merged.availableToppings?.length,
      selectedToppings: merged.toppings?.length,
      hasSizeOptions: merged.sizeOptions?.length > 0,
    });

    setEditingItem({ oldItem: cartItem, merged });
  };
  //  Hàm xử lý submit form chỉnh sửa
  //  Hàm xử lý submit form chỉnh sửa
  const handleEditSubmit = async (values) => {
    setIsLoading(true);

    try {
      const merged = editingItem.merged || {};

      console.log("[Cart] Starting BULK update process...", {
        oldItem: editingItem.oldItem,
        newValues: values,
        oldSugarLevel: editingItem.oldItem.sugarLevel, //  THÊM
        newSugarLevel: values.sugarLevel, //  THÊM
      });

      //  SỬA: CHUẨN HÓA sugarLevel trước khi gửi
      const normalizedSugarLevel = values.sugarLevel?.includes("%")
        ? values.sugarLevel
        : `${values.sugarLevel || "100"}%`;

      // Tính toán lại giá dựa trên size và topping được chọn
      const selectedSize = (merged.sizeOptions || []).find(
        (s) => s.size === values.sizeOption
      );
      const sizePrice = selectedSize?.price || 0;

      const toppingsPrice = (values.toppings || []).reduce(
        (sum, t) => sum + (t.extraPrice || 0),
        0
      );

      // Giá đơn vị mới
      const newUnitPrice = sizePrice + toppingsPrice;

      const updatedItem = {
        ...editingItem.oldItem, // Giữ lại tất cả thuộc tính cũ
        quantity: values.quantity,
        sizeOption: values.sizeOption,
        sizeOptionPrice: sizePrice,
        sugarLevel: normalizedSugarLevel, //  SỬA: Dùng giá trị đã chuẩn hóa
        iceOption: values.iceOption,
        toppings: values.toppings,
        price: newUnitPrice,
      };

      console.log(" [Cart] Sending bulk update with:", {
        unitPrice: updatedItem.price,
        quantity: updatedItem.quantity,
        sugarLevel: updatedItem.sugarLevel, //  THÊM
      });

      //  Gọi updateCartItem với logic mới
      await updateCartItem(editingItem.oldItem, updatedItem);

      console.log(" [Cart] Bulk update completed, closing modal");
      setEditingItem(null);
      toast.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error(" [Cart] Error in bulk update:", error);
      toast.error(
        "Có lỗi khi cập nhật sản phẩm: " + (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
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
                          <th className="text-center w-[50px]">
                            <label className="flex justify-center items-center cursor-pointer w-full h-full py-3">
                              {/* Checkbox thật - ẩn nhưng vẫn chiếm không gian */}
                              <input
                                type="checkbox"
                                className="absolute opacity-0 w-4 h-4 cursor-pointer"
                                checked={
                                  selectedItems.length === items.length &&
                                  items.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const allKeys = items.map((item) =>
                                      getItemKey(item)
                                    );
                                    setSelectedItems(allKeys);
                                  } else {
                                    setSelectedItems([]);
                                  }
                                }}
                              />

                              {/* Custom checkbox hiển thị */}
                              <div className="w-4 h-4 border border-white rounded flex items-center justify-center transition-all relative">
                                {/* Dấu tick */}
                                <svg
                                  className="w-3 h-3 text-white opacity-0 transition-opacity absolute"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>

                              {/* Hiệu ứng khi checked */}
                              <style jsx>{`
                                input:checked + div {
                                  background-color: #3b82f6; /* blue-500 */
                                  border-color: #3b82f6;
                                }
                                input:checked + div svg {
                                  opacity: 1;
                                }
                              `}</style>
                            </label>
                          </th>
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
                      <tbody className="divide-y-2 divide-gray-100">
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

                            <td className="p-3 mt-10 ">
                              <div className="flex items-center space-x-3">
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
                              </div>
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
                            <td className="p-3">
                              <div className="flex gap-3">
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
                              </div>
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
      {/* Modal xác nhận xóa giỏ hàng */}
      {showClearCartModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xóa giỏ hàng
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-2">
                Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?
              </p>
              <p className="text-sm text-gray-500">
                Thao tác này không thể hoàn tác. Tất cả {getTotalItems()} sản
                phẩm sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelClearCart}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmClearCart}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          {(() => {
            const merged = editingItem.merged || {};
            const allToppings = merged.availableToppings || [];

            console.log(" [Modal] All available toppings:", allToppings.length);
            console.log(" [Modal] Current selected toppings:", merged.toppings);

            return (
              <Formik
                enableReinitialize={true}
                initialValues={{
                  quantity: merged.quantity ?? 1,
                  sizeOption:
                    merged.sizeOption ?? merged.sizeOptions?.[0]?.size ?? "M",
                  sugarLevel: merged.sugarLevel?.replace("%", "") || "100",
                  iceOption: merged.iceOption ?? "Chung",
                  toppings: merged.toppings || [],
                }}
                onSubmit={handleEditSubmit}
              >
                {({ values, setFieldValue, isSubmitting }) => {
                  //  THÊM: Tính toán giá real-time
                  const calculateTotalPrice = () => {
                    // Tìm giá size được chọn
                    const selectedSize = (merged.sizeOptions || []).find(
                      (s) => s.size === values.sizeOption
                    );
                    const sizePrice = selectedSize?.price || 0;

                    // Tính tổng giá topping
                    const toppingsPrice = (values.toppings || []).reduce(
                      (sum, t) => sum + (t.extraPrice || 0),
                      0
                    );

                    // Giá mỗi đơn vị = giá size + giá topping
                    const unitPrice = sizePrice + toppingsPrice;

                    // Tổng giá = giá mỗi đơn vị * số lượng
                    const total = unitPrice * (values.quantity || 1);

                    return {
                      sizePrice,
                      toppingsPrice,
                      unitPrice,
                      total,
                    };
                  };

                  const priceInfo = calculateTotalPrice();

                  return (
                    <div
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setEditingItem(null);
                      }}
                      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
                    >
                      <Form
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 rounded-2xl shadow-xl w-[720px] max-w-[95vw] space-y-4"
                      >
                        {/* Header: Ảnh + thông tin nhanh */}
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Cột trái: Ảnh */}
                          <div className="sm:w-1/3 w-full">
                            {merged.images?.[0] && (
                              <img
                                src={merged.images[0]}
                                alt={merged.name || ""}
                                className="w-full h-64 object-cover rounded-xl shadow-sm"
                                onError={(e) =>
                                  (e.currentTarget.src = "/no-image.png")
                                }
                              />
                            )}
                          </div>

                          {/* Cột phải: Thông tin + số lượng */}
                          <div className="sm:w-2/3 w-full flex flex-col justify-between">
                            <div className="flex flex-col gap-2">
                              {/* Tiêu đề */}
                              <h2 className="text-[22px] font-semibold text-slate-900">
                                {merged.name || "Chỉnh sửa sản phẩm"}
                              </h2>

                              {/* Giá chọn size & Tổng */}
                              <div className="space-y-1">
                                {/* Giá size */}
                                <div className="text-sm text-slate-500">
                                  Chọn size:{" "}
                                  <span className="text-camel font-semibold">
                                    {priceInfo.sizePrice
                                      ? `${priceInfo.sizePrice.toLocaleString(
                                          "vi-VN"
                                        )}đ`
                                      : "0đ"}
                                  </span>
                                </div>

                                {/* Tổng nổi bật */}
                                <div className="text-2xl font-bold text-green_starbuck">
                                  Tổng:{" "}
                                  {priceInfo.total.toLocaleString("vi-VN")}đ
                                </div>
                              </div>
                            </div>

                            {/* Stepper số lượng */}
                            <div className="mt-3 flex items-center gap-2 justify-start">
                              <button
                                type="button"
                                onClick={() =>
                                  values.quantity > 1 &&
                                  setFieldValue("quantity", values.quantity - 1)
                                }
                                className="w-9 h-9 rounded-xl border border-dark_blue text-dark_blue grid place-items-center hover:bg-dark_blue hover:text-white transition"
                                aria-label="Giảm"
                              >
                                −
                              </button>
                              <Field
                                name="quantity"
                                type="number"
                                readOnly
                                className="w-12 text-center border rounded-xl py-1"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setFieldValue("quantity", values.quantity + 1)
                                }
                                className="w-9 h-9 rounded-xl border border-dark_blue text-dark_blue grid place-items-center hover:bg-dark_blue hover:text-white transition"
                                aria-label="Tăng"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Size — Circle badges */}
                        <div>
                          <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                            Chọn Size
                          </label>
                          <div className="flex items-center gap-4 flex-wrap">
                            {(merged.sizeOptions || []).map((item) => (
                              <label
                                key={item.size}
                                className="cursor-pointer flex items-center gap-2"
                              >
                                <Field
                                  type="radio"
                                  name="sizeOption"
                                  value={item.size}
                                  className="peer sr-only"
                                />
                                <span
                                  className="w-10 h-10 rounded-full border grid place-items-center text-sm font-semibold
                         transition hover:border-green_starbuck
                         peer-checked:bg-green_starbuck peer-checked:text-white peer-checked:border-transparent"
                                >
                                  {item.size}
                                </span>
                                <span className="text-camel font-semibold">
                                  {item.price.toLocaleString("vi-VN")}đ
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Độ ngọt - segmented control */}
                        <div>
                          <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                            Chọn độ ngọt
                          </label>
                          <div className="inline-flex rounded-xl border p-1 gap-1">
                            {["25", "50", "75", "100"].map((level) => (
                              <label key={level} className="cursor-pointer">
                                <Field
                                  type="radio"
                                  name="sugarLevel"
                                  value={level}
                                  className="peer sr-only"
                                />
                                <span
                                  className="px-3 py-1.5 rounded-lg text-sm
                         peer-checked:bg-green_starbuck peer-checked:text-white
                         hover:bg-gray-100 inline-block"
                                >
                                  {level}%
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Đá — segmented control */}
                        <div>
                          <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                            Chọn Đá
                          </label>
                          <div className="inline-flex rounded-xl border p-1 gap-1">
                            {["Chung", "Riêng"].map((option) => (
                              <label key={option} className="cursor-pointer">
                                <Field
                                  type="radio"
                                  name="iceOption"
                                  value={option}
                                  className="peer sr-only"
                                />
                                <span className="px-3 py-1.5 rounded-lg text-sm inline-block hover:bg-gray-100 peer-checked:bg-green_starbuck peer-checked:text-white">
                                  {option === "Chung" ? "Đá Chung" : "Đá Riêng"}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Topping */}
                        <div>
                          <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                            Chọn Topping
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                            {allToppings.map((topping, index) => {
                              const isChecked = (values.toppings || []).some(
                                (t) => t._id === topping._id
                              );
                              return (
                                <label
                                  key={topping._id}
                                  className={`flex items-center text-sm p-2 rounded-lg border ${
                                    isChecked
                                      ? "bg-green-50 border-green_starbuck/50"
                                      : "border-gray-200"
                                  } cursor-pointer`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const updatedToppings = e.target.checked
                                        ? [...(values.toppings || []), topping]
                                        : (values.toppings || []).filter(
                                            (t) => t._id !== topping._id
                                          );
                                      setFieldValue(
                                        "toppings",
                                        updatedToppings
                                      );
                                    }}
                                    className="mr-2 accent-green_starbuck"
                                  />
                                  <span className="flex-1 whitespace-nowrap">
                                    {topping.name} (+
                                    {topping.extraPrice.toLocaleString("vi-VN")}
                                    ₫)
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          {/* Hiển thị số lượng topping đã chọn */}
                          {values.toppings && values.toppings.length > 0 && (
                            <div className="mt-2 text-sm text-blue-600">
                              Đã chọn: {values.toppings.length} topping
                              {priceInfo.toppingsPrice > 0 && (
                                <span className="text-green-600 ml-2">
                                  (+{priceInfo.toppingsPrice.toLocaleString()}₫)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer hành động */}
                        <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                          <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting}
                          >
                            Hủy
                          </button>

                          <button
                            type="submit"
                            className="relative bg-dark_blue text-white px-5 py-2 rounded-xl hover:bg-dark_blue/90 disabled:opacity-70"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                                Đang cập nhật...
                              </span>
                            ) : (
                              "Cập nhật"
                            )}
                          </button>
                        </div>
                      </Form>
                    </div>
                  );
                }}
              </Formik>
            );
          })()}
        </div>
      )}
    </>
  );
};

export default Cart;
