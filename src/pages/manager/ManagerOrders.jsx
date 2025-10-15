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
  Ban,
  Package,
  Truck,
  XCircle
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";
import Notification from "../../components/ui/Notification";
import { useManagerStore } from "../../store/managerStore";
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";
import { formatNiceDate } from "../../utils/helpers/dateFormatter";

// Giữ nguyên style Select (giống topping)
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

// Sort & Filter options
const sortOptions = [
  {
    value: "createdAt-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-blue-600" />
        Mới nhất
      </span>
    ),
  },
  {
    value: "createdAt-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-blue-600" />
        Cũ nhất
      </span>
    ),
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

// Số mục hiển thị trên mỗi trang
const itemsPerPageOptions = [
  {
    value: 10,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        10 / Trang
      </span>
    ),
  },
  {
    value: 5,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />5 / Trang
      </span>
    ),
  },
  {
    value: 15,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        15 / Trang
      </span>
    ),
  },
  {
    value: 20,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        20 / Trang
      </span>
    ),
  },
];
const ManagerOrders = () => {
  const isInitLoaded = useRef(false);
  const {
    orders,
    pagination,
    isLoading,
    fetchMyStoreOrders,
    clearError,
  } = useManagerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Checkbox selection
  const {
    selectedItems,
    selectedCount,
    toggleSelectItem,
    toggleSelectAll,
    isItemSelected,
    isAllSelected,
    hasSelection,
    clearSelection,
  } = useTableCheckbox(orders, "_id");

  const loadOrders = async (page = 1) => {
    try {
      clearError();
      await fetchMyStoreOrders({
        page,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
    } catch (err) {
      Notification.error("Không thể tải danh sách đơn hàng", err.message);
    }
  };

  useEffect(() => {
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadOrders(1);
    }
  }, []);

  return (
    <div className="px-5 pt-4 pb-6">
      <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Danh sách đơn hàng
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quản lý và theo dõi tình trạng đơn hàng.
            </p>
          </div>
           {/* Nút tác vụ */}
           <div className="flex gap-4 flex-wrap">
          
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold flex items-center gap-2"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" /> Xóa đơn hàng đã chọn ({selectedCount})
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-b-2 border-gray-200 px-5 py-4 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

            {/* Sắp xếp */}
            <Select
                  options={sortOptions}
                  value={sortOptions.find(
                    (opt) => opt.value === `${sortBy}-${sortOrder}`
                  )}
                  onChange={(opt) => {
                    const [field, order] = opt.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
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
              
                          {/* Phân trang */}
                          <div className="flex gap-3">
                <Select
                  options={itemsPerPageOptions}
                  defaultValue={itemsPerPageOptions[0]} // Mặc định là 10 sản phẩm một trang
                  value={itemsPerPageOptions.find(
                    (opt) => opt.value === itemsPerPage
                  )}
                  onChange={(opt) => {
                    setItemsPerPage(opt.value);
                    loadToppings(1, opt.value); // Load page 1 với limit mới
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

 {/* Trạng thái tải */}
 {isLoading && orders.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center">
                <svg
                  className="animate-spin h-6 w-6 mr-3 text-green_starbuck"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Đang tải đơn hàng...
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
                  Tổng tiền
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Trạng thái
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Ngày tạo
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  Cập nhật
                </th>
                <th className="p-3 text-md font-semibold text-green_starbuck">
                  <Settings className="w-6 h-6" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">
                    <button onClick={() => toggleSelectItem(order._id)}>
                      {isItemSelected(order._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 font-semibold">{order.orderCode}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3 text-orange-600 font-bold">
                    {order.totalPrice.toLocaleString()} ₫
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded font-semibold ${
                        order.status === "completed"
                          ? "text-green-700 bg-green-100"
                          : order.status === "canceled"
                          ? "text-red-700 bg-red-100"
                          : "text-yellow-700 bg-yellow-100"
                      }`}
                    >
                      {order.status === "completed"
                        ? "Hoàn tất"
                        : order.status === "canceled"
                        ? "Đã hủy"
                        : "Đang xử lý"}
                    </span>
                  </td>
                  <td className="p-3">{formatNiceDate(order.createdAt)}</td>
                  <td className="p-3">{formatNiceDate(order.updatedAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <Switch
                        checked={order.status === "completed"}
                        onChange={() => {}}
                        className={`${
                          order.status === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-400"
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span className="sr-only">Đổi trạng thái</span>
                        <span
                          className={`${
                            order.status === "completed"
                              ? "translate-x-6"
                              : "translate-x-1"
                          } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                        />
                      </Switch>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && !isLoading && (
            <p className="text-center text-gray-600 text-lg py-8">
              Không có đơn hàng nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerOrders;
