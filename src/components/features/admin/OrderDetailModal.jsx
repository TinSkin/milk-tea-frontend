import { useEffect, useState } from "react";
import { useAdminOrderStore } from "../../../store/adminStore";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  CreditCard,
  Store,
  ShoppingBag,
} from "lucide-react";

// Hàm format date
const formatNiceDate = (dateString) => {
  if (!dateString) return "Không có ngày";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Ngày không hợp lệ";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const AdminOrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const {
    currentOrder,
    orderHistory,
    isDetailLoading,
    fetchOrderDetail,
    fetchOrderStatusHistory,
    clearCurrentOrder,
  } = useAdminOrderStore();

  const [activeTab, setActiveTab] = useState("details");

  // Khi modal mở hoặc orderId thay đổi → fetch data
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail(orderId);
    }
  }, [isOpen, orderId, fetchOrderDetail]);

  // Clear data khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      clearCurrentOrder();
    }
  }, [isOpen, clearCurrentOrder]);

  // Load history khi chuyển sang tab history
  useEffect(() => {
    if (
      isOpen &&
      orderId &&
      activeTab === "history" &&
      (!orderHistory || orderHistory.length === 0)
    ) {
      fetchOrderStatusHistory(orderId);
    }
  }, [isOpen, orderId, activeTab, orderHistory, fetchOrderStatusHistory]);

  const getStatusText = (status) => {
    const statusMap = {
      finding_driver: "Đang tìm tài xế",
      picking_up: "Đang lấy hàng",
      delivering: "Đang giao hàng",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      failed: "Thất bại",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cod: "Thanh toán khi nhận hàng",
      momo: "Ví MoMo",
      banking: "Chuyển khoản ngân hàng",
    };
    return methodMap[method] || method;
  };

  // Render lịch sử đơn hàng
  const renderOrderHistory = () => {
    const history =
      orderHistory && orderHistory.length > 0
        ? orderHistory
        : currentOrder?.statusHistory || [];

    if (history.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có lịch sử cập nhật</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {history.map((historyItem, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
          >
            <div
              className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                historyItem.status === "delivered"
                  ? "bg-green-500"
                  : historyItem.status === "cancelled"
                  ? "bg-red-500"
                  : historyItem.status === "finding_driver"
                  ? "bg-yellow-500"
                  : historyItem.status === "picking_up"
                  ? "bg-blue-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium">
                  {getStatusText(historyItem.status)}
                  {historyItem.paymentStatus &&
                    historyItem.paymentStatus !== "pending" && (
                      <span
                        className={`ml-2 text-xs px-2 py-1 rounded ${
                          historyItem.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : historyItem.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {getPaymentStatusText(historyItem.paymentStatus)}
                      </span>
                    )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNiceDate(historyItem.timestamp)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{historyItem.note}</p>
              {historyItem.updatedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Cập nhật bởi: {historyItem.updatedBy.name || "Hệ thống"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-gray-900"
                  >
                    Chi tiết đơn hàng - Admin
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {isDetailLoading ? (
                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5 animate-spin text-green-500" />
                      <span>Đang tải chi tiết đơn hàng...</span>
                    </div>
                  </div>
                ) : currentOrder ? (
                  <div className="p-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Thông tin đơn hàng
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Mã đơn:</strong> {currentOrder.orderNumber}
                          </p>
                          <p>
                            <strong>Ngày tạo:</strong>{" "}
                            {formatNiceDate(currentOrder.createdAt)}
                          </p>
                          <p>
                            <strong>Cập nhật:</strong>{" "}
                            {formatNiceDate(currentOrder.updatedAt)}
                          </p>
                          <p>
                            <strong>Phương thức thanh toán:</strong>{" "}
                            {getPaymentMethodText(currentOrder.paymentMethod)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Trạng thái</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              currentOrder.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : currentOrder.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : currentOrder.status === "finding_driver"
                                ? "bg-yellow-100 text-yellow-800"
                                : currentOrder.status === "picking_up"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getStatusText(currentOrder.status)}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              currentOrder.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : currentOrder.paymentStatus === "failed"
                                ? "bg-red-100 text-red-800"
                                : currentOrder.paymentStatus === "refunded"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {getPaymentStatusText(currentOrder.paymentStatus)}
                          </span>
                        </div>

                        {/* Thông tin tiền */}
                        <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span>Tổng tiền:</span>
                            <span>
                              {currentOrder.totalAmount?.toLocaleString()} ₫
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí ship:</span>
                            <span>
                              {currentOrder.shippingFee?.toLocaleString()} ₫
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Giảm giá:</span>
                            <span className="text-red-600">
                              -{currentOrder.discountAmount?.toLocaleString()} ₫
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1 font-bold text-lg text-orange-600">
                            <span>Thành tiền:</span>
                            <span>
                              {currentOrder.finalAmount?.toLocaleString()} ₫
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b mb-6">
                      <div className="flex space-x-8">
                        {["details", "history"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-1 font-medium ${
                              activeTab === tab
                                ? "border-b-2 border-green-500 text-green-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tab === "details" && "Chi tiết đơn hàng"}
                            {tab === "history" && "Lịch sử cập nhật"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "details" && (
                      <div className="space-y-6">
                        {/* Store Info */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Store className="w-5 h-5" /> Thông tin cửa hàng
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            {currentOrder.storeId &&
                            typeof currentOrder.storeId === "object" ? (
                              <>
                                <p>
                                  <strong>Tên cửa hàng:</strong>{" "}
                                  {currentOrder.storeId.name ||
                                    "Không xác định"}
                                </p>
                                <p>
                                  <strong>Địa chỉ:</strong>{" "}
                                  {currentOrder.storeId.address ||
                                    "Chưa có địa chỉ"}
                                </p>
                                <p>
                                  <strong>Thành phố:</strong>{" "}
                                  {currentOrder.storeId.city ||
                                    "Chưa có thông tin"}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-500">
                                Đang tải thông tin cửa hàng...
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" /> Thông tin khách hàng
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p>
                              <strong>Tên:</strong>{" "}
                              {currentOrder.customerInfo?.name || "Không có"}
                            </p>
                            <p>
                              <strong>Email:</strong>{" "}
                              {currentOrder.customerInfo?.email || "Không có"}
                            </p>
                            <p>
                              <strong>Điện thoại:</strong>{" "}
                              {currentOrder.shippingAddress?.phone ||
                                currentOrder.customerInfo?.phone ||
                                "Không có"}
                            </p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Địa chỉ giao hàng
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p>
                              <strong>Họ tên:</strong>{" "}
                              {currentOrder.shippingAddress?.fullName ||
                                "Không có"}
                            </p>
                            <p>
                              <strong>Điện thoại:</strong>{" "}
                              {currentOrder.shippingAddress?.phone ||
                                "Không có"}
                            </p>
                            <p>
                              <strong>Địa chỉ:</strong>{" "}
                              {currentOrder.shippingAddress?.address ||
                                "Không có"}
                            </p>
                            <p>
                              <strong>Phường/Xã:</strong>{" "}
                              {currentOrder.shippingAddress?.ward || "Không có"}
                            </p>
                            <p>
                              <strong>Quận/Huyện:</strong>{" "}
                              {currentOrder.shippingAddress?.district ||
                                "Không có"}
                            </p>
                            <p>
                              <strong>Thành phố:</strong>{" "}
                              {currentOrder.shippingAddress?.city || "Không có"}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5" /> Sản phẩm đã đặt
                          </h4>
                          <div className="space-y-3">
                            {currentOrder.items?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                              >
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-16 h-16 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/64x64?text=No+Image";
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {item.productName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Size: {item.size}
                                  </p>
                                  {item.toppings &&
                                    item.toppings.length > 0 && (
                                      <p className="text-sm text-gray-600">
                                        Topping:{" "}
                                        {item.toppings
                                          .map((t) => t.name)
                                          .join(", ")}
                                      </p>
                                    )}
                                  <p className="text-sm text-gray-600">
                                    Số lượng: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {item.price?.toLocaleString()} ₫
                                  </p>
                                  <p className="text-sm font-medium text-orange-600">
                                    Tổng:{" "}
                                    {(
                                      item.price * item.quantity
                                    )?.toLocaleString()}{" "}
                                    ₫
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {currentOrder.notes && (
                          <div>
                            <h4 className="font-semibold mb-3">
                              Ghi chú đơn hàng
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700">
                                {currentOrder.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5" /> Lịch sử cập nhật đơn
                          hàng
                        </h4>
                        {renderOrderHistory()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Không tìm thấy thông tin đơn hàng</p>
                  </div>
                )}

                <div className="mt-6 text-right p-6 border-t">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminOrderDetailModal;
