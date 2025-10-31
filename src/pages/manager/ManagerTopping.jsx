import React from "react";
// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Coffee,
  Store,
  MapPin,
  Pencil,
  CupSoda,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Ban,
  ListOrdered,
  Search,
  Trash2,
  Settings,
  CheckSquare,
  Square,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import stores để quản lý trạng thái
import { useManagerStore } from "../../store/managerStore";
import { useRequestManagerStore } from "../../store/request/requestManagerStore";

// Import component
import Notification from "../../components/ui/Notification";
import AddToppingRequestModal from "../../components/features/manager/request/topping/AddToppingRequestModal";
import UpdateToppingRequestModal from "../../components/features/manager/request/topping/UpdateToppingRequestModal";
import DeleteToppingRequestModal from "../../components/features/manager/request/topping/DeleteToppingRequestModal";

// Import utilities và hooks
import { formatNiceDate } from "../../utils/helpers/dateFormatter";
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";

// Tùy chọn sắp xếp
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
  {
    value: "name-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-green-600" />
        Tên A-Z
      </span>
    ),
  },
  {
    value: "name-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-green-600" />
        Tên Z-A
      </span>
    ),
  },
  {
    value: "extraPrice-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-orange-600" />
        Giá thấp đến cao
      </span>
    ),
  },
  {
    value: "extraPrice-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-orange-600" />
        Giá cao đến thấp
      </span>
    ),
  },
];

// Tùy chọn trạng thái
const statusOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <CupSoda className="w-4 h-4 text-gray-600" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "available",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Đang bán
      </span>
    ),
  },
  {
    value: "unavailable",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-600" />
        Ngừng bán
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

const ManagerTopping = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý topping
  const { toppings, isLoading, pagination, fetchMyStoreToppings, updateMyStoreTopping, clearError } =
    useManagerStore();

  // Store quản lý requests
  const { isLoading: isRequestLoading } = useRequestManagerStore();

  // Trạng thái bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Phân trang
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [requestingTopping, setRequestingTopping] = useState(null);

  //! Hàm xử lý thêm topping request
  const handleAddToppingRequest = () => {
    setShowAddModal(false);
    Notification.info(
      "Yêu cầu đã được gửi", 
      "Admin sẽ xem xét và phản hồi yêu cầu của bạn sớm nhất có thể."
    );
  };

  //! Xử lý thành công khi gửi request cập nhật topping
  const handleUpdateRequestSuccess = () => {
    setShowUpdateRequestModal(false);
    setRequestingTopping(null);
  };

  //! Xử lý thành công khi gửi request xóa topping
  const handleDeleteRequestSuccess = () => {
    setShowDeleteRequestModal(false);
    setRequestingTopping(null);
  };

  //! Manager không được sửa topping trực tiếp - phải qua request system
  const handleEditTopping = (toppingData) => {
    setRequestingTopping(toppingData);
    setShowUpdateRequestModal(true);
  };

  //! Manager không được xóa topping - chỉ có thể request tới admin
  const handleDeleteTopping = (topping) => {
    setRequestingTopping(topping);
    setShowDeleteRequestModal(true);
  };

  //! Gửi yêu cầu tới Admin để thay đổi system status
  const handleRequestSystemStatusChange = async (topping) => {
    // Xác định loại request dựa trên system status hiện tại
    let requestType = "";
    let requestReason = "";
    let newSystemStatus = "available"; // Default target status

    if (topping.status === "unavailable") {
      requestType = "Yêu cầu mở lại topping";
      requestReason =
        "Topping đang bị khóa bởi Admin, cửa hàng muốn sử dụng lại topping này.";
      newSystemStatus = "available";
    } else if (topping.status === "paused") {
      requestType = "Yêu cầu mở lại topping";
      requestReason =
        "Topping đang bị tạm dừng bởi Admin, cửa hàng muốn sử dụng lại topping này.";
      newSystemStatus = "available";
    } else {
      Notification.info(
        "Topping đang hoạt động bình thường",
        "Không cần gửi yêu cầu thay đổi trạng thái."
      );
      return;
    }

    try {
      // Implement request API call here if needed
      Notification.success(
        "Đã gửi yêu cầu tới Admin",
        `${requestType} cho topping "${topping.name}"`
      );
    } catch (error) {
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    }
  };

  //! Xử lý chuyển trạng thái topping TẠI CỬA HÀNG (storeStatus)
  const handleToggleStoreStatus = async (topping) => {
    // Kiểm tra constraint: Chỉ được toggle khi system status = available
    if (topping.status !== "available") {
      Notification.warning(
        "Không thể thay đổi trạng thái",
        "Topping phải được Admin mở lại trước khi bạn có thể thay đổi trạng thái cửa hàng."
      );
      return;
    }

    try {
      // CHT có thể toggle giữa "available" và "paused"
      const newStoreStatus =
        topping.storeStatus === "available" ? "paused" : "available";

      await updateMyStoreTopping(topping._id, { storeStatus: newStoreStatus });

      Notification.success(
        newStoreStatus === "available"
          ? "Đã BẬT lại topping tại cửa hàng!"
          : "Đã TẠM DỪNG topping tại cửa hàng!"
      );

      loadToppings(pagination.currentPage);
    } catch (error) {
      console.error("Toggle topping store status error:", error);

      // Handle specific business rule errors
      const errorResponse = error.response?.data;
      if (errorResponse?.code) {
        switch (errorResponse.code) {
          case "SYSTEM_STATUS_UNAVAILABLE":
            Notification.error(
              "Không thể bật topping",
              "Admin đã tắt topping này toàn hệ thống. Liên hệ Admin để kích hoạt lại."
            );
            break;
          case "SYSTEM_STATUS_PAUSED":
            Notification.error(
              "Không thể bật topping",
              "Admin đang tạm dừng topping này. Liên hệ Admin để biết thêm thông tin."
            );
            break;
          case "SYSTEM_STATUS_OUT_OF_STOCK":
            Notification.error(
              "Không thể bật topping",
              "Topping đang hết hàng toàn hệ thống. Chờ Admin nhập thêm hàng."
            );
            break;
          default:
            Notification.error(
              "Cập nhật trạng thái thất bại",
              errorResponse.message || error.message
            );
        }
      } else {
        Notification.error(
          "Cập nhật trạng thái cửa hàng thất bại",
          error.message
        );
      }
    }
  };

  //! Wrapper function for the switch component
  const handleToggleStatus = async (topping) => {
    await handleToggleStoreStatus(topping);
  };

  //! Hàm tải danh sách topping cho lần đầu (có notification)
  const loadToppingsInit = async (page = 1, limit = itemsPerPage) => {
    try {
      clearError();
      const params = {
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      };
      const result = await fetchMyStoreToppings(params);
      console.log("Fetched toppings:", result);
      if (result.data && result.data.categories) {
        Notification.success(
          `Tải thành công ${result.data.toppings.length} topping.`
        );
      }
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách topping",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Hàm tải danh sách topping cho search/filter/pagination (không notification)
  const loadToppings = async (page = 1, limit = itemsPerPage) => {
    try {
      clearError();

      const params = {
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      };

      const result = await fetchMyStoreToppings(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách topping",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Load data lần đầu khi component mount (với protection)
  useEffect(() => {
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadToppingsInit(1);
    } else {
      console.log("⚠️ Prevented duplicate load");
    }
  }, []); // Chỉ chạy một lần khi component mount

  //! Xử lý tìm kiếm với debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadToppings(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  //! Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadToppings(newPage);
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  // Checkbox selection hook
  const {
    selectedItems,
    selectedCount,
    hasSelection,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    isItemSelected,
    isAllSelected,
    getSelectedItems,
  } = useTableCheckbox(toppings, "_id");

  // State cho expand description
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  //! Xử lý expand/collapse description
  const toggleDescription = (toppingId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toppingId)) {
        newSet.delete(toppingId);
      } else {
        newSet.add(toppingId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
          {/* Title & Nút tác vụ */}
          <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách topping
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi topping của bạn để thêm vào sản phẩm.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-4 flex-wrap">
              {/* Xóa topping */}
              <div className="flex gap-2">
                <button
                  // onClick={handleDeleteSelectedToppings}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa topping đã chọn ({selectedCount})
                </button>
              </div>
              {/* Thêm topping */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2"
              >
                <CupSoda className="w-4 h-4" />
                Thêm topping
              </button>
            </div>
          </div>

          {hasSelection && (
            <div className="px-5">
              <div className="flex items-center justify-around p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium">
                    Đã chọn {selectedCount} topping
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-blue-600 hover:text-blue-800 underline text-md"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thanh tìm kiếm & sắp xếp & lọc */}
          <div className="border-b-2 border-gray-200 px-5 py-4">
            <div className="flex gap-3 sm:justify-between">
              {/* Tìm kiếm & Sắp xếp */}
              <div className="flex gap-3">
                {/* Tìm kiếm */}
                <div className="relative flex-1 sm:flex-auto">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên topping..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {/* Lọc theo trạng thái */}
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (opt) => opt.value === statusFilter
                  )}
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
          </div>

          {/* Trạng thái tải */}
          {isLoading && toppings.length === 0 && (
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
                Đang tải topping...
              </div>
            </div>
          )}

          {/* Bảng topping */}
          <div className="overflow-x-auto">
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {toppings.length === 0 && !isLoading ? (
              <p className="text-center text-gray-600 text-lg py-8">
                {searchTerm ? "Không tìm thấy topping nào" : "Chưa có topping"}
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                {" "}
                {/* Phần tiêu đề bảng */}
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="w-12 px-3 py-4 text-left">
                      {/* Chọn tất cả */}
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllSelected()}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-green_starbuck focus:ring-green_starbuck"
                        />
                      </label>
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Tên
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Giá thêm
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Mô tả
                    </th>
                    {/* <th className="p-3 text-md font-semibold text-green_starbuck">
                      Hệ thống
                    </th> */}
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Cửa hàng
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Ngày thêm
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Cập nhật
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      <div className="flex items-center justify-center">
                        <Settings className="w-6 h-6" />
                      </div>
                    </th>
                  </tr>
                </thead>
                {/* Phần thân bảng */}
                <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
                  {toppings.map((topping) => (
                    <tr
                      key={topping._id}
                      className="hover:bg-gray-50 text-center"
                    >
                      {/* Hiển thị tickbox từng topping */}
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectItem(topping._id)}
                          className="flex items-center justify-center w-full"
                        >
                          {isItemSelected(topping._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Tên */}
                      <td className="p-3 text-sm text-dark_blue font-semibold text-left">
                        {topping.name || "Không có tên"}
                      </td>

                      {/* Giá thêm */}
                      <td className="p-3 text-lg text-orange-600 text-start font-bold">
                        {topping.extraPrice.toLocaleString()} VNĐ
                      </td>

                      {/* Mô tả */}
                      <td className="p-3 text-md text-start text-gray-900 max-w-xs">
                        <div>
                          <div
                            className={
                              expandedDescriptions.has(topping._id)
                                ? ""
                                : "line-clamp-2"
                            }
                          >
                            {topping.description || "Không có mô tả"}
                          </div>
                          {topping.description &&
                            topping.description.length > 100 && (
                              <button
                                onClick={() => toggleDescription(topping._id)}
                                className="text-blue-600 hover:underline text-sm mt-1"
                              >
                                {expandedDescriptions.has(topping._id)
                                  ? "Thu gọn"
                                  : "Xem thêm"}
                              </button>
                            )}
                        </div>
                      </td>

                      {/* Trạng thái (Admin) */}
                      {/* <td className="p-3 min-w-[140px]">
                        <span
                          className={`px-2 py-1 text-sm rounded font-semibold ${
                            topping.status === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {topping.status === "available"
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </td> */}

                      {/* Trạng thái (Store Manager) */}
                      <td className="p-3 min-w-[140px]">
                        <span
                          className={`px-2 py-1 text-sm rounded font-semibold ${
                            topping.storeStatus === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {topping.storeStatus === "available"
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </td>

                      {/* Hiển thị ngày thêm */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(topping.addedAt)}
                      </td>

                      {/* Hiển thị ngày cập nhật */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(topping.lastUpdatedAt) || "Chưa cập nhật"}
                      </td>

                      {/* Hành động */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditTopping(topping)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                            title="Yêu cầu chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <Switch
                            checked={topping.storeStatus === "available"}
                            onChange={() => handleToggleStoreStatus(topping)}
                            disabled={topping.status !== "available"}
                            className={`${
                              topping.storeStatus === "available"
                                ? "bg-green-500"
                                : "bg-red-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              topping.status !== "available" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <span className="sr-only">
                              Chuyển trạng thái cửa hàng
                            </span>
                            <span
                              className={`${
                                topping.storeStatus === "available"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                          </Switch>

                          <button
                            onClick={() => handleDeleteTopping(topping)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                            title="Yêu cầu xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 flex-col border-t border-gray-200 px-5 py-4 sm:flex-row">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage || isLoading}
                className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
              >
                Trang trước
              </button>

              {/* Số trang */}
              <div className="flex gap-2">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = pagination.currentPage - 2 + i;
                    if (pageNum > 0 && pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className={`px-3 py-1 rounded font-semibold ${
                            pagination.currentPage === pageNum
                              ? "bg-green_starbuck text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              {/* Thông tin kết quả */}
              <div className="flex items-center gap-4">
                <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
                  Hiển thị {toppings.length} / {pagination.totalToppings || 0}{" "}
                  topping (Trang {pagination.currentPage || 1} /{" "}
                  {pagination.totalPages || 1})
                </div>
                <button
                  onClick={nextPage}
                  disabled={!pagination.hasNextPage || isLoading}
                  className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal thêm topping request */}
      {showAddModal && (
        <AddToppingRequestModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddToppingRequest}
        />
      )}

      {/* Modal cập nhật topping request */}
      {showUpdateRequestModal && requestingTopping && (
        <UpdateToppingRequestModal
          isOpen={showUpdateRequestModal}
          onClose={() => {
            setShowUpdateRequestModal(false);
            setRequestingTopping(null);
          }}
          onSuccess={handleUpdateRequestSuccess}
          toppingData={requestingTopping}
        />
      )}

      {/* Modal xóa topping request */}
      {showDeleteRequestModal && requestingTopping && (
        <DeleteToppingRequestModal
          isOpen={showDeleteRequestModal}
          onClose={() => {
            setShowDeleteRequestModal(false);
            setRequestingTopping(null);
          }}
          onSuccess={handleDeleteRequestSuccess}
          toppingData={requestingTopping}
        />
      )}
    </>
  );
};

export default ManagerTopping;
