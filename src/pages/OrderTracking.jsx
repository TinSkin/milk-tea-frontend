import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Smile } from "lucide-react";
import api from "../api/axios";

export default function OrderTracking() {
  const { id } = useParams(); // id lấy từ URL (_id trong MongoDB)
  console.log("orderId từ URL:", id);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map trạng thái từ backend sang frontend
  const statusMap = {
    finding_driver: "Đã xác nhận",
    picking_up: "Đang lấy đơn",
    delivering: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const steps = ["Đã xác nhận", "Đang lấy đơn", "Đang giao", "Đã giao"];
  const stepIcons = [CheckCircle, Package, Truck, Smile];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
        setError("Không thể tải đơn hàng. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-white py-10 bg-[#151d2d] min-h-screen">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-white py-10 bg-[#151d2d] min-h-screen">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-white py-10 bg-[#151d2d] min-h-screen">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  // Xác định step hiện tại
  const currentStatus = statusMap[order.status] || "Không xác định";
  const currentStep =
    steps.indexOf(currentStatus) !== -1 ? steps.indexOf(currentStatus) : 0;

  return (
    <>
      <Header />
      <div className="bg-[#151d2d] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-[#e2cda2] mb-2">
              Theo dõi đơn hàng #{order.orderNumber || order._id}
            </h1>
          </motion.div>

          {/* Trạng thái đơn hàng */}
          <div className="bg-[#447484]/50 rounded-2xl shadow p-4 mb-6">
            <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">
              Trạng thái: {currentStatus}
            </h2>
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => {
                const Icon = stepIcons[index];
                const isActive = index === currentStep;
                const isCompleted = index <= currentStep;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-4
                      ${
                        isCompleted
                          ? "bg-red-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="font-medium mt-2 text-center text-white">
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-1 -z-10 
                          ${index < currentStep ? "bg-red-500" : "bg-gray-300"}`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Địa chỉ giao hàng */}
          <div className="bg-[#447484]/50 rounded-2xl shadow p-4 mb-6">
            <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">
              Địa chỉ giao hàng
            </h2>
            <p className="font-medium text-white mb-4">
              {order.shippingAddress?.fullName || "Người nhận"} -{" "}
              {order.shippingAddress?.phone || "Số điện thoại"}
            </p>
            <p className="font-medium text-white">
              {order.shippingAddress?.address || "Địa chỉ"},{" "}
              {order.shippingAddress?.ward || ""},{" "}
              {order.shippingAddress?.district || ""},{" "}
              {order.shippingAddress?.city || ""}
            </p>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="bg-[#447484]/50 rounded-2xl shadow p-4 mb-6">
            <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">
              Tóm tắt đơn hàng
            </h2>
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt="product"
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-white mb-4">
                    {item.productName || "Sản phẩm"}
                  </p>
                  <p className="font-medium text-white mb-4">
                    Số lượng: {item.quantity || 0}
                  </p>
                  <p className="font-medium text-white">
                    Giá:{" "}
                    {item.price
                      ? item.price.toLocaleString()
                      : 0}
                    đ
                  </p>
                </div>
              </div>
            ))}
            <div className="font-medium space-y-4 text-white">
              <p>
                <span className="font-medium text-white">Tổng tiền: </span>
                {order.totalAmount?.toLocaleString() || 0}đ
              </p>
              <p>
                <span className="font-medium text-white">Thanh toán: </span>
                {order.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng"
                  : order.paymentMethod || "Chưa xác định"}
              </p>
            </div>
          </div>

          {/* Nút quay lại */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-[#f2b53b] to-[#D5BB93] text-black font-bold px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{ boxShadow: "0 0 5px #fde599, 0 0 5px #fcd34d" }}
            >
              Quay lại trang chủ
            </button>
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
}
