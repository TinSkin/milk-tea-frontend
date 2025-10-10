import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { motion } from "framer-motion";
import { Package, Calendar, CreditCard, Eye } from "lucide-react";
import api from "../api/axios";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/orders/my-orders"); // backend cần route này
        // ✅ THÊM DEBUG
        console.log("API Response:", res);
        console.log("res.data:", res.data);
        console.log("Type of res.data:", typeof res.data);
        console.log("Is array?", Array.isArray(res.data));

        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-white py-10 bg-[#151d2d] min-h-screen">
        Đang tải lịch sử đơn hàng...
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

  return (
    <>
      <Header />
      <div className="bg-[#151d2d] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tiêu đề */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-[#e2cda2] mb-2">
              Lịch sử đơn hàng
            </h1>
            <p className="text-white">
              Theo dõi tất cả đơn hàng của bạn tại đây
            </p>
          </motion.div>

          {orders.length === 0 ? (
            <div className="text-center text-white py-12 bg-[#447484]/50 rounded-2xl">
              <Package className="mx-auto h-16 w-16 text-[#e2cda2] mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="mb-6">Hãy bắt đầu mua sắm ngay!</p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f2b53b] to-[#D5BB93] text-black px-6 py-3 rounded-xl font-medium hover:scale-105 transition"
              >
                Mua sắm ngay
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#447484]/50 rounded-2xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-[#e2cda2]" />
                        <span className="text-[#e2cda2] font-semibold">
                          Đơn hàng #{order.orderNumber || order._id.slice(-8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <Package className="h-5 w-5 text-[#e2cda2]" />
                        <span className="text-white font-semibold">
                          Trạng thái:{" "}
                          <span
                            className={`font-semibold ${
                              order.status === "delivered"
                                ? "text-green-400"
                                : order.status === "cancelled"
                                ? "text-red-400"
                                : "text-yellow-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#e2cda2]" />
                          <span>
                            Ngày đặt:{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#e2cda2]" />
                          <span>
                            Thanh toán:{" "}
                            {order.paymentMethod === "cod"
                              ? "Khi nhận hàng"
                              : order.paymentMethod || "Chưa xác định"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#e2cda2]" />
                          <span>{order.items?.length || 0} sản phẩm</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-[#f2b53b]">
                        {order.totalAmount?.toLocaleString() || 0}đ
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/order-tracking/${order._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f2b53b] to-[#D5BB93] text-black rounded-lg hover:scale-105 transition text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
