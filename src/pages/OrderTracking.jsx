import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Smile } from "lucide-react";


export default function OrderTracking() {
  // Trạng thái đơn hàng hiện tại 
  const currentStep = 2;
  const stepIcons = [CheckCircle, Package, Truck, Smile];
  const steps = [
    "Đã xác nhận",
    "Đang lấy đơn",
    "Đang giao",
    "Đã giao",
  ];

  return (
    <>
      <Header />
    <div className="bg-[#151d2d]"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tiêu đề */}
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-[#e2cda2] mb-2">Theo dõi đơn hàng của bạn</h1>
        </motion.div>
{/* Trạng thái đơn hàng */}
<div className="bg-[#447484]/50 rounded-2xl shadow p-4 mb-6">
  <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">
    Trạng thái: {steps[currentStep]}
  </h2>
  <div className="flex items-center justify-between">
    {steps.map((step, index) => {
      const Icon = stepIcons[index]; // lấy icon tương ứng
      const isActive = index === currentStep; // trạng thái hiện tại

      return (
        <div key={index} className="flex-1 flex flex-col items-center relative">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-4
              ${isActive ? "bg-red-500 text-white" : "bg-gray-300 text-gray-600"}`}
          >
            <Icon size={20} /> {/* hiển thị icon */}
          </div>
          <span className="font-medium mt-2 text-center text-white">{step}</span>

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

<hr className="mb-6 border-t-4 border-white"/>

      {/* Địa chỉ */}
      <div className="bg-[#447484]/50  rounded-2xl shadow p-4 mb-6">
        <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">Địa chỉ</h2>
        <p className="font-medium text-white mb-4">
          <span className="font-semibold text-white ">Từ: </span>
          Penny Âu Cơ, Quận Tân Phú, TP.HCM
        </p>
        <p className="font-medium text-white">
          <span className="font-semibold text-white ">Đến: </span>
          741/5 Lũy Bán Bích, Quận 7, TP.HCM
        </p>
      </div>

      <hr className="mb-6 border-t-4 border-white"/>

      {/* Tóm tắt đơn hàng */}
      <div className="bg-[#447484]/50 rounded-2xl shadow p-4 mb-6">
        <h2 className="text-2xl font-extrabold text-[#e2cda2] mb-4">Tóm tắt đơn hàng</h2>
        <div className="flex gap-4 mb-4">
          <img
            src="https://via.placeholder.com/80"
            alt="product"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-white mb-4">Trà sữa trân châu đường đen</p>
            <p className="font-medium text-white mb-4">Số lượng: 1</p>
            <p className="font-medium text-white mb-4">Ghi chú: Ít ngọt</p>
          </div>
        </div>
        <div className="font-medium space-y-4 text-white">
          <p >
            <span className="font-medium text-white">Tổng tiền: </span>34.000đ
          </p>
          <p >
            <span className="font-medium text-white">Phí giao hàng: </span>16.000đ
          </p>
          <p c>
            <span className="font-medium text-white">Thanh toán: </span>50.000đ (Thanh toán khi nhận hàng)
          </p>
        </div>
      </div>

      {/* Nút quay lại */}
      <div className="flex justify-center mb-8">
  <button
    className="bg-gradient-to-r from-[#f2b53b] to-[#D5BB93] text-black font-bold px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
    style={{
      boxShadow: "0 0 5px #fde599, 0 0 5px #fcd34d",
    }}
  >
    Quay lại trang chủ
  </button>
</div>

      <Footer />
    </div>
    </div>
    </>
  );
}
