import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  ListOrdered,
  SortAsc,
  SortDesc,
  Search,
  Settings,
  CheckSquare,
  Square,
  Eye,
  Store,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  MapPin,
} from "lucide-react";
import Select from "react-select";
import Notification from "../../components/ui/Notification";
import { formatNiceDate } from "../../utils/helpers/dateFormatter";
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";
import { useAdminOrderStore } from "../../store/adminStore";
import { useStoreStore } from "../../store/storeStore";
import AdminOrderDetailModal from "../../components/features/admin/OrderDetailModal";

const selectStyles = {
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
    fontWeight: state.isSelected ? "bold" : "normal",
    fontSize: "1rem",
  }),
};

const sortOptions = [
  {
    value: "newest",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-blue-600" />
        Mới nhất
      </span>
    ),
  },
  {
    value: "oldest",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-blue-600" />
        Cũ nhất
      </span>
    ),
  },
  {
    value: "amount_asc",
    label: <span className="flex items-center gap-2">Giá tăng dần</span>,
  },
  {
    value: "amount_desc",
    label: <span className="flex items-center gap-2">Giá giảm dần</span>,
  },
];

const statusOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-gray-600" />
        Tất cả
      </span>
    ),
  },
  {
    value: "finding_driver",
    label: (
      <span className="flex items-center gap-2">
        <Search className="w-4 h-4 text-yellow-500" />
        Đang tìm tài xế
      </span>
    ),
  },
  {
    value: "picking_up",
    label: (
      <span className="flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-500" />
        Đang lấy hàng
      </span>
    ),
  },
  {
    value: "delivering",
    label: (
      <span className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-indigo-500" />
        Đang giao hàng
      </span>
    ),
  },
  {
    value: "delivered",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Đã giao
      </span>
    ),
  },
  {
    value: "cancelled",
    label: (
      <span className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-600" />
        Đã hủy
      </span>
    ),
  },
];

const paymentStatusOptions = [
  { value: "all", label: "Tất cả trạng thái thanh toán" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thanh toán thất bại" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

const itemsPerPageOptions = [
  { value: 10, label: "10 / Trang" },
  { value: 20, label: "20 / Trang" },
  { value: 50, label: "50 / Trang" },
  { value: 100, label: "100 / Trang" },
];

const AdminOrders = () => {
  const isInitLoaded = useRef(false);

  const {
    orders,
    stores,
    pagination,
    isLoading,
    fetchOrders,
    fetchStores,
    clearError,
  } = useAdminOrderStore();

  // Sử dụng storeStore để lấy danh sách cửa hàng đầy đủ
  const { stores: allStores, fetchStores: fetchAllStores } = useStoreStore();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    selectedItems,
    selectedCount,
    toggleSelectItem,
    toggleSelectAll,
    isItemSelected,
    isAllSelected,
    clearSelection,
  } = useTableCheckbox(orders || [], "_id");

  // Tạo mapping storeId -> store info từ allStores
  const storeMap = useMemo(() => {
    console.log(" Creating store map from allStores:", allStores);
    const map = {};
    allStores.forEach((store) => {
      if (store && store._id) {
        map[store._id] = {
          name: store.name || store.storeName || "Không xác định",
          address: store.address || "",
          city: store.city || "",
          phone: store.phone || "",
        };
      }
    });
    console.log(" Store map created:", map);
    return map;
  }, [allStores]);

  // Hàm lấy thông tin cửa hàng từ order
  const getStoreInfo = (order) => {
    if (!order.storeId) {
      console.log(" Order has no storeId:", order.orderNumber);
      return { name: "Không xác định", address: "", city: "" };
    }

    let storeId;

    // Xác định storeId từ order
    if (typeof order.storeId === "object" && order.storeId !== null) {
      // Nếu storeId là object (có thể là populated hoặc có $oid)
      if (order.storeId._id) {
        storeId = order.storeId._id;
      } else if (order.storeId.$oid) {
        storeId = order.storeId.$oid;
      } else {
        console.log(" storeId object structure:", order.storeId);
        storeId = Object.keys(order.storeId)[0]; // Fallback
      }
    } else if (typeof order.storeId === "string") {
      // Nếu storeId là string
      storeId = order.storeId;
    } else {
      console.log(
        " Unknown storeId type:",
        typeof order.storeId,
        order.storeId
      );
      return { name: "Không xác định", address: "", city: "" };
    }

    console.log(" Looking for store:", storeId, "in storeMap:", storeMap);

    // Tìm thông tin cửa hàng trong storeMap
    const storeInfo = storeMap[storeId];

    if (storeInfo) {
      console.log(" Found store info:", storeInfo);
      return storeInfo;
    } else {
      console.log(" Store not found in map:", storeId);
      return {
        name: "Đang tải...",
        address: "",
        city: "",
      };
    }
  };

  const loadOrders = async (page = currentPage, limit = itemsPerPage) => {
    const params = {
      page,
      limit,
      search: searchTerm,
      status: statusFilter !== "all" ? statusFilter : "",
      paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : "",
      storeId: storeFilter !== "all" ? storeFilter : "",
      sortBy,
      startDate,
      endDate,
    };

    // Remove empty params
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === "all") {
        delete params[key];
      }
    });

    console.log(" Loading orders with params:", params);
    await fetchOrders(params);
    setCurrentPage(page);
  };

  // Load initial data
  useEffect(() => {
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      console.log(" Initial load - fetching stores and orders");
      // Load stores từ storeStore trước
      fetchAllStores()
        .then(() => {
          console.log(" Stores loaded, now loading orders");
          loadOrders(1);
        })
        .catch((error) => {
          console.error(" Error loading stores:", error);
          loadOrders(1); // Vẫn load orders nếu không lấy được stores
        });
    }
  }, []);

  // Load orders khi filters thay đổi
  useEffect(() => {
    if (isInitLoaded.current) {
      loadOrders(1);
    }
  }, [
    statusFilter,
    paymentStatusFilter,
    storeFilter,
    sortBy,
    itemsPerPage,
    startDate,
    endDate,
  ]);

  // Search với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitLoaded.current) {
        loadOrders(1);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleRefresh = () => {
    console.log(" Refreshing data...");
    // Refresh cả stores và orders
    fetchAllStores().then(() => {
      loadOrders(currentPage);
    });
  };

  const handlePageChange = (newPage) => {
    loadOrders(newPage);
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { text: "Đã giao", class: "text-green-700 bg-green-100" },
      cancelled: { text: "Đã hủy", class: "text-red-700 bg-red-100" },
      finding_driver: {
        text: "Đang tìm tài xế",
        class: "text-yellow-700 bg-yellow-100",
      },
      picking_up: { text: "Đang lấy hàng", class: "text-blue-700 bg-blue-100" },
      delivering: {
        text: "Đang giao hàng",
        class: "text-indigo-700 bg-indigo-100",
      },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "text-gray-700 bg-gray-100",
    };

    return (
      <span
        className={`px-2 py-1 text-sm rounded font-semibold ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentConfig = {
      paid: { text: "Đã thanh toán", class: "font-semibold text-green-700 bg-green-100" },
      pending: {
        text: "Chờ thanh toán",
        class: "font-semibold text-yellow-700 bg-yellow-100",
      },
      failed: { text: "Thất bại", class: "text-red-700 bg-red-100" },
      refunded: { text: "Đã hoàn tiền", class: "text-blue-700 bg-blue-100" },
    };

    const config = paymentConfig[paymentStatus] || {
      text: paymentStatus,
      class: "text-gray-700 bg-gray-100",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  // Tạo options cho dropdown cửa hàng
  const storeOptions = useMemo(() => {
    console.log(" Generating store options from allStores:", allStores);
    const options = [
      {
        value: "all",
        label: (
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-600" />
            Tất cả cửa hàng
          </span>
        ),
      },
      ...allStores.map((store) => ({
        value: store._id,
        label: (
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            {store.name || store.storeName || "Không xác định"}
            <span className="text-xs text-gray-500">
              ({store.city || "Chưa có thành phố"})
            </span>
          </span>
        ),
      })),
    ];
    console.log(" Store options:", options);
    return options;
  }, [allStores]);

  // Debug: log orders và store info
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log(" Current orders with store info:");
      orders.forEach((order) => {
        const storeInfo = getStoreInfo(order);
        console.log(`Order ${order.orderNumber}:`, {
          storeId: order.storeId,
          storeInfo: storeInfo,
        });
      });
    }
  }, [orders, storeMap]);

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Quản lý đơn hàng - Admin
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.totalOrders
                ? `Tổng cộng ${pagination.totalOrders} đơn hàng`
                : "Quản lý và theo dõi tất cả đơn hàng hệ thống."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-b-2 border-gray-200 px-5 py-4 flex flex-col gap-3">
          {/* Hàng 1: Search */}
          <div className="flex">
            <div className="relative w-full max-w-8xl">
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Hàng 2: Bộ lọc */}
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Store Filter */}
              <Select
                options={storeOptions}
                value={storeOptions.find((s) => s.value === storeFilter)}
                onChange={(opt) => setStoreFilter(opt.value)}
                placeholder="Chọn cửa hàng..."
                className="min-w-[250px] z-10"
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
                isSearchable
              />

              {/* Status Filter */}
              <Select
                options={statusOptions}
                value={statusOptions.find((s) => s.value === statusFilter)}
                onChange={(opt) => setStatusFilter(opt.value)}
                placeholder="Trạng thái đơn hàng..."
                className="min-w-[200px] z-10"
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

              {/* Payment Status Filter */}
              <Select
                options={paymentStatusOptions}
                value={paymentStatusOptions.find(
                  (s) => s.value === paymentStatusFilter
                )}
                onChange={(opt) => setPaymentStatusFilter(opt.value)}
                placeholder="Trạng thái thanh toán..."
                className="min-w-[200px] z-10"
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

              {/* Date Range */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Từ ngày"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Đến ngày"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Sort */}
              <Select
                options={sortOptions}
                value={sortOptions.find((opt) => opt.value === sortBy)}
                onChange={(opt) => setSortBy(opt.value)}
                placeholder="Sắp xếp..."
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

              {/* Items per page */}
              <Select
                options={itemsPerPageOptions}
                value={itemsPerPageOptions.find(
                  (opt) => opt.value === itemsPerPage
                )}
                onChange={(opt) => setItemsPerPage(opt.value)}
                placeholder="Số lượng..."
                className="min-w-[140px] z-10"
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
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Mã đơn
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Khách hàng
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Cửa hàng
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Tổng tiền
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Trạng thái
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Thanh toán
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Ngày tạo
                </th>
                {/* <th className="p-3 text-md font-semibold text-green_starbuck">
                  <Settings className="w-6 h-6" />
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
              {!isLoading && orders && orders.length > 0 ? (
                orders.map((order) => {
                  const storeInfo = getStoreInfo(order);
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 text-center"
                    >
                      <td className="p-3">
                        <button onClick={() => toggleSelectItem(order._id)}>
                          {isItemSelected(order._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-semibold">{order.orderNumber}</td>
                      <td className="p-3">
                        <div className="text-left">
                          <div className="font-medium">
                            {order.customerInfo?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerInfo?.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-left">
                          <div className="font-medium flex items-center gap-1">
                            <Store className="w-4 h-4 text-blue-500" />
                            {storeInfo.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {storeInfo.city || "Chưa có địa chỉ"}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-orange-600 font-bold">
                        {order.finalAmount?.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="p-3">{formatNiceDate(order.createdAt)}</td>
                      {/* <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(order._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    {!isLoading && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          Không có đơn hàng nào
                        </p>
                        <button
                          onClick={handleRefresh}
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, pagination.totalOrders)} của{" "}
              {pagination.totalOrders} đơn hàng
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
                          ? "bg-green_starbuck text-white border-green_starbuck"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2">
                      ...
                    </span>
                  );
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
        {/* <AdminOrderDetailModal
  orderId={selectedOrderId}
  isOpen={isDetailModalOpen}
  onClose={handleCloseModal}
/> */}
      </div>
    </div>
  );
};

export default AdminOrders;
