import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";
import Header from "../components/layout/Header";
import CheckoutModal from "../components/features/ecommerce/CheckoutModal";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);  
  const [errors, setErrors] = useState({});
  const items = useCartStore((s) => s.items);
  const selectedItems = useCartStore((s) => s.selectedItems);
  const getSelectedTotal = useCartStore((s) => s.getSelectedTotal);




  const getItemKey = (item) =>
    `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(
      item.toppings || []
    )}`;


  const checkoutItems = items.filter((it) =>
    selectedItems && selectedItems.length > 0
      ? selectedItems.includes(getItemKey(it))
      : true
  );


  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "cod",
    notes: "",
  });




  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};


    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.address.trim())
      newErrors.address = "Vui lòng nhập địa chỉ cụ thể";
    if (!formData.city.trim()) newErrors.city = "Vui lòng chọn tỉnh/thành phố";


    setErrors(newErrors);


    return Object.keys(newErrors).length === 0; // true nếu form hợp lệ
  };


  const handleCheckoutClick = () => {
    if (validateForm()) {
      setModalOpen(true); // mở modal nếu form hợp lệ
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin nhận hàng"); // hoặc dùng alert()
    }
  };


  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Truck,
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua ATM hoặc Internet Banking",
      icon: CreditCard,
    },
    {
      id: "e_wallet",
      name: "Ví điện tử",
      description: "Thanh toán qua MoMo, ZaloPay, VNPAY",
      icon: Shield,
    },
  ];

  const handleConfirm = async () => {
    setModalOpen(false);
    setIsProcessing(true);
  
    const orderData = {
      customerInfo: { name: formData.fullName, email: formData.email },
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
      },
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      items: checkoutItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.sizeOption || "",
        toppings: item.toppings || [],
        image: item.image || "",
      })),
      totalAmount: getSelectedTotal(),
    };
  
    try {
      // 📌 Gọi API và lấy newOrder
      const res = await api.post("/orders", orderData);
      const newOrder = res.data.order;
  
      alert("Đặt hàng thành công!");
  
      // ===============================
      // Xóa các sản phẩm đã chọn khỏi giỏ
      // ===============================
      const { items, selectedItems, removeFromCart, setSelectedItems } = useCartStore.getState();
      const getItemKey = (item) =>
        `${item.id}__${item.sizeOption || "M"}__${JSON.stringify(item.toppings || [])}`;
  
      items.forEach((item) => {
        if (selectedItems.includes(getItemKey(item))) {
          removeFromCart(item.id, {
            sizeOption: item.sizeOption,
            sugarLevel: item.sugarLevel,
            iceOption: item.iceOption,
            toppings: item.toppings,
          });
        }
      });  

      console.log("newOrder:", newOrder); 
      // Clear selectedItems sau khi xóa
      navigate(`/order-tracking/${newOrder._id}`);
    } catch (error) {
      console.error(error);
      alert("Đặt hàng thất bại, vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };
 
  // ========================================================


  if (items.length === 0) {
    return (
      <div className="text-center text-white py-10">
        Giỏ hàng trống, quay lại <span className="text-[#0b3042]">Shop</span>.
      </div>
    );
  }


  return (
    <>
      <Header />
      <div className="bg-[#151d2d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-[#e2cda2] mb-2">
              Thanh toán
            </h1>
            <p className="text-white">
              Vui lòng điền thông tin để hoàn tất đơn hàng
            </p>
          </motion.div>


          {/* Form + Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-[#447484]  to-transparent rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e2cda2]" />
                  Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Khác">Tỉnh/thành khác</option>
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập quận/huyện"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập phường/xã"
                    />
                  </div>
                </div>


                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường...)"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </motion.div>


              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-b from-[#447484]  rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#e2cda2]" />
                  Phương thức thanh toán
                </h2>


                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200
    ${
      formData.paymentMethod === method.id
        ? "border-[#e2cda2] bg-[#769da8]/70 text-white"
        : "border-gray-300 hover:bg-gray-50 group"
    } // chỉ thêm group cho những ô chưa chọn
  `}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <Icon
                          className={`w-5 h-5 mr-3 transition-colors duration-200
      ${
        formData.paymentMethod === method.id
          ? "text-white"
          : "text-white group-hover:text-black"
      }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium transition-colors duration-200
        ${
          formData.paymentMethod === method.id
            ? "text-white"
            : "text-white group-hover:text-black"
        }`}
                          >
                            {method.name}
                          </p>
                          <p
                            className={`text-sm transition-colors duration-200
        ${
          formData.paymentMethod === method.id
            ? "text-white"
            : "text-white group-hover:text-black"
        }`}
                          >
                            {method.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>


              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-[#447484]  rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">
                  Ghi chú đơn hàng
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                />
              </motion.div>
            </div>


            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-b from-[#447484]  rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-6">
                  Đơn hàng của bạn
                </h2>


                <div className="space-y-4 mb-6">
                  {checkoutItems.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-white">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>


                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-white">
                    <span>Tạm tính</span>
                    <span>{formatPrice(getSelectedTotal())}</span>
                  </div>


                  <div className="flex justify-between text-white">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-bold"></span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white border-t border-gray-200 pt-3">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {formatPrice(getSelectedTotal())}
                    </span>
                  </div>
                </div>


                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCheckoutClick} // <-- dùng hàm mới
                  className="w-full bg-[#044c5c] text-white hover:scale-105 font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


      {/* Modal */}
      <CheckoutModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onConfirm={handleConfirm} // <-- đây
  orderInfo={{
    ...formData,
    items: checkoutItems,
    total: getSelectedTotal(),
  }}
/>
    </>
  );
};


export default CheckoutPage;


