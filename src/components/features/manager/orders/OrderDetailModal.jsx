import React, { useEffect, useState } from 'react';
import { X, Package, Truck, CheckCircle2, Clock, User, Phone, MapPin, CreditCard } from 'lucide-react';
import { useManagerStore } from '../../../../store/managerStore';
import Notification from '../../../ui/Notification';
import { formatNiceDate } from '../../../../utils/helpers/dateFormatter';

const OrderDetailModal = ({ orderId, isOpen, onClose }) => {
  const { 
    currentOrder, 
    orderHistory, // THÊM orderHistory
    isLoading, 
    fetchOrderDetail,
    updateOrderStatus,
    updatePaymentStatus,
    fetchOrderStatusHistory, // THÊM fetchOrderStatusHistory
    clearCurrentOrder, // THÊM clearCurrentOrder
    
  } = useManagerStore();
  
  const [activeTab, setActiveTab] = useState('details');
  const [historyLoading, setHistoryLoading] = useState(false);

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
    if (isOpen && orderId && activeTab === 'history' && (!orderHistory || orderHistory.length === 0)) {
      loadOrderHistory();
    }
  }, [isOpen, orderId, activeTab, orderHistory]);

  const loadOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      await fetchOrderStatusHistory(orderId);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, { 
        status: newStatus, 
        note: `Chuyển trạng thái sang ${getStatusText(newStatus)}` 
      });
      Notification.success('Thành công', 'Cập nhật trạng thái thành công');
      // Reload chi tiết đơn hàng để cập nhật lịch sử mới
      await fetchOrderDetail(orderId);
    } catch (error) {
      Notification.error('Lỗi', error.response?.data?.message || error.message);
    }
  };

  const handlePaymentUpdate = async (newPaymentStatus) => {
    try {
      await updatePaymentStatus(orderId, { 
        paymentStatus: newPaymentStatus,
        note: `Cập nhật trạng thái thanh toán thành ${getPaymentStatusText(newPaymentStatus)}`
      });
      Notification.success('Thành công', 'Cập nhật trạng thái thanh toán thành công');
      // Reload chi tiết đơn hàng để cập nhật lịch sử mới
      await fetchOrderDetail(orderId);
    } catch (error) {
      Notification.error('Lỗi', error.response?.data?.message || error.message);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'finding_driver': 'Đang tìm tài xế',
      'picking_up': 'Đang lấy hàng',
      'delivering': 'Đang giao hàng',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ thanh toán',
      'paid': 'Đã thanh toán',
      'failed': 'Thất bại',
      'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
  };

  // Render lịch sử từ orderHistory
  const renderOrderHistory = () => {
    if (historyLoading) {
      return (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-green-500" />
            <span>Đang tải lịch sử...</span>
          </div>
        </div>
      );
    }

    if (!orderHistory || orderHistory.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có lịch sử cập nhật</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orderHistory.map((history, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
            <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
              history.status === 'delivered' ? 'bg-green-500' :
              history.status === 'cancelled' ? 'bg-red-500' :
              history.status === 'finding_driver' ? 'bg-yellow-500' :
              history.status === 'picking_up' ? 'bg-blue-500' :
              'bg-gray-500'
            }`}></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium">
                  {getStatusText(history.status)}
                  {history.paymentStatus && history.paymentStatus !== 'pending' && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      history.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      history.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {getPaymentStatusText(history.paymentStatus)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNiceDate(history.timestamp)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">{history.note}</p>
              {history.updatedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Cập nhật bởi: {history.updatedBy.name || 'Hệ thống'}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : currentOrder ? (
          <div className="p-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
                <p><strong>Mã đơn:</strong> {currentOrder.orderNumber}</p>
                <p><strong>Ngày tạo:</strong> {formatNiceDate(currentOrder.createdAt)}</p>
                <p><strong>Tổng tiền:</strong> {currentOrder.finalAmount?.toLocaleString()} ₫</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Trạng thái</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    currentOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    currentOrder.status === 'finding_driver' ? 'bg-yellow-100 text-yellow-800' :
                    currentOrder.status === 'picking_up' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(currentOrder.status)}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    currentOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    currentOrder.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getPaymentStatusText(currentOrder.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex space-x-8">
                {['details', 'actions', 'history'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' && 'Chi tiết'}
                    {tab === 'actions' && 'Thao tác'}
                    {tab === 'history' && 'Lịch sử'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" /> Thông tin khách hàng
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Tên:</strong> {currentOrder.customerInfo?.name}</p>
                    <p><strong>Email:</strong> {currentOrder.customerInfo?.email}</p>
                    <p><strong>Điện thoại:</strong> {currentOrder.shippingAddress?.phone || currentOrder.customerInfo?.phone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Địa chỉ giao hàng
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{currentOrder.shippingAddress?.address}</p>
                    <p>{currentOrder.shippingAddress?.ward}, {currentOrder.shippingAddress?.district}</p>
                    <p>{currentOrder.shippingAddress?.city}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Sản phẩm</h4>
                  <div className="space-y-3">
                    {currentOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          {item.toppings?.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Topping: {item.toppings.map(t => t.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.price?.toLocaleString()} ₫</p>
                          <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                          <p className="text-sm font-medium">Tổng: {item.subtotal?.toLocaleString()} ₫</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-4">
                <h4 className="font-semibold">Cập nhật trạng thái đơn hàng</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['picking_up', 'delivering', 'delivered'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={currentOrder.status === 'cancelled' || currentOrder.status === 'delivered'}
                      className="p-3 border rounded-lg text-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium">{getStatusText(status)}</div>
                    </button>
                  ))}
                </div>

                <h4 className="font-semibold mt-6">Cập nhật thanh toán</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['paid', 'failed', 'refunded'].map(status => (
                    <button
                      key={status}
                      onClick={() => handlePaymentUpdate(status)}
                      className="p-3 border rounded-lg text-center hover:bg-gray-50"
                    >
                      <div className="font-medium">{getPaymentStatusText(status)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-semibold mb-4">Lịch sử trạng thái đơn hàng</h4>
                {renderOrderHistory()}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">Không tìm thấy thông tin đơn hàng</div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;