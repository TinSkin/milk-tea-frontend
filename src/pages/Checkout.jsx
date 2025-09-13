import React from "react";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { PhoneCall, User, MapPinHouse, PartyPopper } from "lucide-react";

// Import Components
import Header from "../components/Header";
import Notification from "../components/Notification";

const Checkout = () => {
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem("checkoutInfo");
    if (savedData) {
      setOrderInfo(JSON.parse(savedData));
    }
  }, []);

  if (!orderInfo) {
    return <p className="p-4">Không có thông tin đơn hàng.</p>;
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-2xl shadow-lg mt-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-dark_blue">
          Đặt hàng thành công!
        </h2>

        <div className="space-y-4 text-base text-gray-800">
          <div className="flex justify-between">
            <span className="font-semibold flex gap-4">
              <User className="text-camel" /> Tên khách hàng:
            </span>
            <span className="font-medium text-dark_blue">
              {orderInfo.fullName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold flex gap-4">
              <PhoneCall className="text-camel" /> Số điện thoại:
            </span>
            <span className="font-medium text-dark_blue">
              {orderInfo.phone}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold flex gap-4">
              <MapPinHouse className="text-camel" /> Địa chỉ giao hàng:
            </span>
            <span className="font-medium text-right text-dark_blue">
              {orderInfo.address}
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="block mt-8 text-center bg-dark_blue hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </>
  );
};

export default Checkout;
