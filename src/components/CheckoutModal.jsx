import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XCircle, Clock, DollarSign, CreditCard } from "lucide-react";

const CheckoutModal = ({ isOpen, onClose, onConfirm, orderInfo }) => {
  const [countdown, setCountdown] = useState(15);

  // Hàm format số tiền
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  // Tính tổng tiền chính xác từ items
  const calculateTotal = () => {
    console.log(" [CheckoutModal] orderInfo:", orderInfo);
    console.log(" [CheckoutModal] orderInfo.items:", orderInfo?.items);
    
    if (!orderInfo?.items || !Array.isArray(orderInfo.items)) {
      console.log(" [CheckoutModal] No items found");
      return 0;
    }
    
    const total = orderInfo.items.reduce((total, item, index) => {
      const itemPrice = Number(item.price) || 0;
      const itemQuantity = Number(item.quantity) || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      console.log(` [CheckoutModal] Item ${index + 1}:`, {
        name: item.name,
        price: itemPrice,
        quantity: itemQuantity,
        total: itemTotal
      });
      
      return total + itemTotal;
    }, 0);

    console.log(" [CheckoutModal] Calculated total:", total);
    return total;
  };

  const accurateTotal = calculateTotal();
  const itemCount = orderInfo?.items?.length || 0;

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(15); // reset countdown

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onConfirm(); // tự động confirm
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onConfirm]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl p-8 relative">
              
              {/* Countdown */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-bold text-lg">
                  {countdown}s
                </div>
              </div>

              <Dialog.Title className="text-2xl font-bold text-center mb-4">
                Xác nhận đặt đơn
              </Dialog.Title>
              <p className="text-gray-500 text-center mb-6">
                Bạn ơi, hãy kiểm tra thông tin lần nữa nhé!
              </p>

              {/* Order Info */}
              <div className="space-y-6 text-gray-700 text-base">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 mt-0.5 text-gray-400" />
                  <div>{orderInfo?.address || "Đang tải địa chỉ..."}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>{orderInfo?.date || "Hôm nay 17:15"}</div>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Tổng tiền */}
                  <div className="flex items-center gap-3 font-semibold">
                    <DollarSign className="w-5 h-5 text-gray-700" />
                    <span>
                      {formatPrice(accurateTotal)} ({itemCount} món)
                      {accurateTotal === 0 && (
                        <span className="text-red-500 text-sm ml-2">⚠️ Lỗi tính tiền</span>
                      )}
                    </span>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="flex items-center gap-3 font-semibold">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    <span>
                      {orderInfo?.paymentMethod === "cod" 
                        ? "Thanh toán khi nhận hàng (COD)" 
                        : orderInfo?.paymentMethod || "Chưa xác định"}
                    </span>
                  </div>
                </div>

                {/* Hiển thị chi tiết từng item để debug */}
                {orderInfo?.items && orderInfo.items.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Chi tiết đơn hàng:</p>
                    {orderInfo.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-between mt-8 gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:scale-105 transition-transform"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 bg-[#044c5c] text-white rounded-xl hover:scale-105 transition-transform"
                >
                  Đặt đơn ngay
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CheckoutModal;