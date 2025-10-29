import React, { useEffect, useState, useRef } from "react";
import {
  ListOrdered,
  SortAsc,
  SortDesc,
  Search,
  Settings,
  CheckSquare,
  Square,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  RefreshCw,
  Eye,
  History
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";
import Notification from "../../components/ui/Notification";
import { useManagerStore } from "../../store/managerStore";
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";
import { formatNiceDate } from "../../utils/helpers/dateFormatter";
import OrderDetailModal from "../../components/features/manager/orders/OrderDetailModal";

const selectStyles = {
  control: (base) => ({ ...base, padding: "2px 0", borderRadius: "0.5rem", borderColor: "#1e293b", boxShadow: "none", minHeight: "40px" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#f0fdf4" : state.isFocused ? "#f3f4f6" : "white",
    fontWeight: state.isSelected ? "bold" : "normal",
    fontSize: "1rem",
  }),
};

const sortOptions = [
  { value: "newest", label: <span className="flex items-center gap-2"><SortDesc className="w-4 h-4 text-blue-600" />Mới nhất</span> },
  { value: "oldest", label: <span className="flex items-center gap-2"><SortAsc className="w-4 h-4 text-blue-600" />Cũ nhất</span> },
];

const statusOptions = [
  { value: "all", label: <span className="flex items-center gap-2"><ListOrdered className="w-4 h-4 text-gray-600" />Tất cả</span> },
  { value: "finding_driver", label: <span className="flex items-center gap-2"><Search className="w-4 h-4 text-yellow-500" />Đang tìm tài xế</span> },
  { value: "picking_up", label: <span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500" />Đang lấy hàng</span> },
  { value: "delivering", label: <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-indigo-500" />Đang giao hàng</span> },
  { value: "delivered", label: <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" />Đã giao</span> },
  { value: "cancelled", label: <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-600" />Đã hủy</span> },
];

const itemsPerPageOptions = [
  { value: 5, label: "5 / Trang" },
  { value: 10, label: "10 / Trang" },
  { value: 15, label: "15 / Trang" },
  { value: 20, label: "20 / Trang" },
];

const ManagerOrders = () => {
  const isInitLoaded = useRef(false);
  const {
    orders = [],
    pagination = {},
    isLoading,
    fetchMyStoreOrders,
    clearError
  } = useManagerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    selectedItems,
    selectedCount,
    toggleSelectItem,
    toggleSelectAll,
    isItemSelected,
    isAllSelected,
    clearSelection,
  } = useTableCheckbox(orders || [], "_id");

  const loadOrders = async (page = currentPage, limit = itemsPerPage) => {
    console.log("Loading orders...", { 
      page, 
      limit, 
      searchTerm, 
      statusFilter, 
      sortBy
    });
    
    try {
      clearError();
      const params = {
        page,
        limit,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : "",
        sortBy,
      };

      console.log(" Sending request with params:", params);
      
      const result = await fetchMyStoreOrders(params);
      console.log(" Orders loaded successfully:", result?.data?.orders?.length || 0);
      
      if (result?.success) {
        setCurrentPage(page);
      }
    } catch (err) {
      console.error(" Error loading orders:", err);
      if (err.response?.status === 401) {
        Notification.error("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại");
      } else {
        Notification.error("Không thể tải danh sách đơn hàng", err?.response?.data?.message || err.message);
      }
    }
  };

  // Load orders khi component mount
  useEffect(() => {
    if (!isInitLoaded.current) {
      console.log(" Initial load orders");
      isInitLoaded.current = true;
      loadOrders(1);
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Load orders khi filters thay đổi
  useEffect(() => {
    if (isInitLoaded.current) {
      console.log(" Filters changed, reloading orders...");
      loadOrders(1);
    }
  }, [statusFilter, sortBy, itemsPerPage]);

  // THÊM useEffect ĐỂ THEO DÕI STATE CHANGES
useEffect(() => {
  console.log(" Orders state updated:", {
    ordersCount: orders?.length,
    orders: orders?.map(o => ({ 
      id: o._id, 
      orderNumber: o.orderNumber,
      status: o.status, 
      paymentStatus: o.paymentStatus 
    })),
    isLoading
  });
}, [orders, isLoading]);

  // Xử lý search với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitLoaded.current) {
        loadOrders(1);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleRefresh = () => {
    loadOrders(currentPage);
  };

  const handlePageChange = (newPage) => {
    loadOrders(newPage);
  };

  // Mở modal xem chi tiết
const handleViewDetails = (orderId) => {
  setSelectedOrderId(orderId);
  setIsDetailModalOpen(true);
};

// Đóng modal
const handleCloseModal = () => {
  setIsDetailModalOpen(false);
  setSelectedOrderId(null);
};

// Mở modal hủy đơn hàng
const handleOpenCancelModal = (orderId) => {
  setCancelOrderId(orderId);
};

// Đóng modal hủy đơn hàng
const handleCloseCancelModal = () => {
  setCancelOrderId(null);
  setCancelReason('');
};

// Xử lý hủy đơn hàng
const handleCancelOrder = async () => {
  if (!cancelReason.trim()) {
    Notification.error('Lỗi', 'Vui lòng nhập lý do hủy đơn hàng');
    return;
  }

  try {
    console.log("Canceling order:", { cancelOrderId, cancelReason });
    
    const { cancelOrder, orders } = useManagerStore.getState();
    console.log("Before cancel - orders state:", orders.map(o => ({ 
      id: o._id, 
      status: o.status, 
      paymentStatus: o.paymentStatus 
    })));
    
    const result = await cancelOrder(cancelOrderId, cancelReason);
    console.log("Cancel order result:", result);
    
    // Kiểm tra state sau khi hủy
    setTimeout(() => {
      const { orders: updatedOrders } = useManagerStore.getState();
      console.log("After cancel - orders state:", updatedOrders.map(o => ({ 
        id: o._id, 
        status: o.status, 
        paymentStatus: o.paymentStatus 
      })));
    }, 100);
    
    Notification.success('Thành công', 'Đã hủy đơn hàng thành công');
    handleCloseCancelModal();
    loadOrders(currentPage); // Reload danh sách
    
  } catch (error) {
    console.error("Cancel order error:", error);
    Notification.error('Lỗi', error.response?.data?.message || error.message);
  }
};

// Cập nhật trạng thái nhanh
const handleQuickStatusUpdate = async (orderId, newStatus) => {
  try {
    const { updateOrderStatus } = useManagerStore.getState();
    await updateOrderStatus(orderId, { 
      status: newStatus, 
      note: `Cập nhật nhanh trạng thái` 
    });
    Notification.success('Thành công', 'Cập nhật trạng thái thành công');
    loadOrders(currentPage);
  } catch (error) {
    Notification.error('Lỗi', error.response?.data?.message || error.message);
  }
};

  console.log("Current state:", {
    ordersCount: orders?.length,
    isLoading,
    pagination,
    currentPage
  });

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Danh sách đơn hàng</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.totalOrders ? `Tổng cộng ${pagination.totalOrders} đơn hàng` : "Quản lý và theo dõi tình trạng đơn hàng."}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-b-2 border-gray-200 px-5 py-4 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <Select
              options={statusOptions}
              value={statusOptions.find((s) => s.value === statusFilter)}
              onChange={(opt) => setStatusFilter(opt.value)}
              placeholder="Chọn trạng thái..."
              className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#1e293b",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
            />

            <Select
              options={sortOptions}
              value={sortOptions.find((opt) => opt.value === sortBy)}
              onChange={(opt) => setSortBy(opt.value)}
              placeholder="Chọn cách sắp xếp..."
              className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#1e293b",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
            />
          </div>

          <div className="flex gap-3">
            <Select
              options={itemsPerPageOptions}
              value={itemsPerPageOptions.find((opt) => opt.value === itemsPerPage)}
              onChange={(opt) => {
                setItemsPerPage(opt.value);
                setCurrentPage(1);
              }}
              placeholder="Chọn số lượng..."
              className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-green_starbuck" />
              <span className="text-gray-600">Đang tải đơn hàng...</span>
            </div>
          </div>
        )}

        {/* Debug info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="px-5 py-2 bg-yellow-50 text-xs">
            <strong>Debug:</strong> Orders: {orders?.length || 0}, Loading: {isLoading.toString()}, 
            Page: {currentPage}, Total: {pagination.totalOrders || 0}
          </div>
        )} */}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="w-12 px-3 py-4 text-left">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected()} 
                    onChange={toggleSelectAll} 
                    className="w-4 h-4" 
                  />
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Mã đơn</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Khách hàng</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Tổng tiền</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Trạng thái</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Ngày tạo</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">Cập nhật</th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  <Settings className="w-6 h-6" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
              {!isLoading && orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 text-center">
                    <td className="p-3">
                      <button onClick={() => toggleSelectItem(order._id)}>
                        {isItemSelected(order._id) ? 
                          <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                          <Square className="w-5 h-5 text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="p-3 font-semibold">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="text-left">
                        <div className="font-medium">{order.customerInfo?.name}</div>
                        <div className="text-sm text-gray-500">{order.customerInfo?.phone}</div>
                      </div>
                    </td>
                    <td className="p-3 text-orange-600 font-bold">
                      {order.finalAmount?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-sm rounded font-semibold ${
                          order.status === "delivered"
                            ? "text-green-700 bg-green-100"
                            : order.status === "cancelled"
                            ? "text-red-700 bg-red-100"
                            : order.status === "finding_driver"
                            ? "text-yellow-700 bg-yellow-100"
                            : order.status === "picking_up"
                            ? "text-blue-700 bg-blue-100"
                            : order.status === "delivering"
                            ? "text-indigo-700 bg-indigo-100"
                            : "text-gray-700 bg-gray-100"
                        }`}
                      >
                        {order.status === "delivered" ? "Đã giao" :
                         order.status === "cancelled" ? "Đã hủy" :
                         order.status === "finding_driver" ? "Đang tìm tài xế" :
                         order.status === "picking_up" ? "Đang lấy hàng" :
                         order.status === "delivering" ? "Đang giao hàng" :
                         order.status}
                      </span>
                    </td>
                    <td className="p-3">{formatNiceDate(order.createdAt)}</td>
                    <td className="p-3">{formatNiceDate(order.updatedAt)}</td>
                    <td className="p-3">
  <div className="flex justify-center gap-2">
    {/* Button xem chi tiết */}
    <button 
      onClick={() => handleViewDetails(order._id)}
      className="text-blue-600 hover:text-blue-800"
      title="Xem chi tiết"
    >
      <Eye className="w-4 h-4" />
    </button>

    {/* Button xem lịch sử */}
    <button 
      onClick={() => {
        setSelectedOrderId(order._id);
        setIsDetailModalOpen(true);
        // Modal sẽ tự động fetch history khi mở tab history
      }}
      className="text-purple-600 hover:text-purple-800"
      title="Xem lịch sử"
    >
      <History className="w-4 h-4" />
    </button>

    {/* Button hủy đơn hàng (chỉ hiện khi ở trạng thái finding_driver) */}
    {order.status === "finding_driver" && (
      <button 
        onClick={() => handleOpenCancelModal(order._id)}
        className="text-red-600 hover:text-red-800"
        title="Hủy đơn hàng"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}

    {/* Quick action buttons - Cập nhật trạng thái nhanh */}
    <div className="flex flex-col gap-1">
      {order.status === "finding_driver" && (
        <button
          onClick={() => handleQuickStatusUpdate(order._id, "picking_up")}
          className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 border border-green-600 rounded"
          title="Chuyển sang đang lấy hàng"
        >
          Lấy hàng
        </button>
      )}
      {order.status === "picking_up" && (
        <button
          onClick={() => handleQuickStatusUpdate(order._id, "delivering")}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 border border-blue-600 rounded"
          title="Chuyển sang đang giao hàng"
        >
          Giao hàng
        </button>
      )}
      {order.status === "delivering" && (
        <button
          onClick={() => handleQuickStatusUpdate(order._id, "delivered")}
          className="text-purple-600 hover:text-purple-800 text-xs font-medium px-2 py-1 border border-purple-600 rounded"
          title="Chuyển sang đã giao"
        >
          Hoàn thành
        </button>
      )}
    </div>
  </div>
</td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>

          {!isLoading && (!orders || orders.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.totalOrders)} của {pagination.totalOrders} đơn hàng
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                // Hiển thị một số trang xung quanh trang hiện tại
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === page
                          ? 'bg-green_starbuck text-white border-green_starbuck'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
          {/* Order Detail Modal */}
    <OrderDetailModal
      orderId={selectedOrderId}
      isOpen={isDetailModalOpen}
      onClose={handleCloseModal}
    />

    {/* Cancel Order Confirmation Modal */}
    {cancelOrderId && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Hủy đơn hàng</h3>
          <p className="mb-4 text-gray-600">Bạn có chắc muốn hủy đơn hàng này?</p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lý do hủy:</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCloseCancelModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default ManagerOrders;