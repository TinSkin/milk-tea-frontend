// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
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
import { useToppingStore } from "../../store/toppingStore";

// Import component
import Notification from "../../components/ui/Notification";
import AddToppingModal from "../../components/features/admin/topping/AddToppingModal";
import EditToppingModal from "../../components/features/admin/topping/EditToppingModal";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";
import BulkDeleteModal from "../../components/features/admin/BulkDeleteModal";
import SelectedItemsBanner from "../../components/features/admin/SelectedItemsBanner";

//Import component layouts
import LoadingSpinner from "../../layouts/components/LoadingSpinner";
import Pagination from "../../layouts/components/Pagination";

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

const AdminTopping = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý topping
  const {
    toppings,
    isLoading,
    pagination,
    getAllToppings,
    createTopping,
    updateTopping,
    deleteTopping,
    softDeleteTopping,
    clearError,
  } = useToppingStore();

  // Trạng thái các modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);

  //! Hàm xử lý thêm topping
  const handleAddTopping = async (toppingData) => {
    try {
      await createTopping(toppingData);
      setShowAddModal(false);
      Notification.success("Thêm topping thành công!");
      loadToppings(pagination.currentPage);
    } catch (error) {
      Notification.error("Thêm topping thất bại", error.message);
    }
  };

  //! Hàm xử lý khi bấm chỉnh sửa topping
  const handleEditTopping = (topping) => {
    setEditingTopping(topping);
    setShowEditModal(true);
  };

  //! Hàm xử lý cập nhật topping
  const handleUpdateTopping = async (toppingData) => {
    try {
      await updateTopping(editingTopping._id, toppingData);
      setShowEditModal(false);
      setEditingTopping(null);
      Notification.success("Cập nhật topping thành công!");
      loadToppings(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật thất bại", error.message);
    }
  };

  // Trạng thái modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    toppingId: null,
    toppingName: "",
    action: null,
  });

  // Trạng thái modal xóa hàng loạt
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  //! Hàm xử lý xóa hẳn các topping được chọn
  const handleDeleteSelectedToppings = async () => {
    if (!hasSelection) {
      Notification.warning("Vui lòng chọn ít nhất một topping để xóa");
      return;
    }

    // Mở modal xác nhận thay vì dùng window.confirm
    setShowBulkDeleteModal(true);
  };

  //! Xác nhận xóa bulk toppings (HARD DELETE)
  const handleConfirmBulkDelete = async () => {
    try {
      // getSelectedItems() trả về objects, cần extract IDs
      const selectedToppingObjects = getSelectedItems();
      const selectedToppingIds = selectedToppingObjects.map(
        (topping) => topping._id
      );

      // Sử dụng store function thay vì API trực tiếp
      for (const toppingId of selectedToppingIds) {
        await deleteTopping(toppingId); // Dùng store function
      }

      Notification.success(`Đã xóa vĩnh viễn ${selectedCount} topping`);
      clearSelection();
      setShowBulkDeleteModal(false);
      loadToppings(pagination.currentPage);
    } catch (error) {
      console.error("Bulk delete error:", error);
      Notification.error("Xóa topping thất bại", error.message);
    }
  };

  //! Hàm xử lý xóa vĩnh viễn topping (mở modal xác nhận xóa vĩnh viễn)
  const handleDeleteTopping = (topping) => {
    setDeleteModalConfig({
      type: "hard",
      toppingId: topping._id,
      toppingName: topping.name,
      action: "hardDelete",
    });
    setShowDeleteModal(true);
  };

  //! Hàm xử lý xóa mềm topping (mở modal xác nhận chuyển trạng thái)
  const handleSoftDeleteTopping = (topping) => {
    setDeleteModalConfig({
      type: "soft",
      toppingId: topping._id,
      toppingName: topping.name,
      action: "softDelete",
    });
    setShowDeleteModal(true);
  };

  //! Hàm xác nhận hành động xóa
  const handleConfirmDelete = async () => {
    try {
      const { toppingId, action } = deleteModalConfig;

      if (action === "softDelete") {
        await softDeleteTopping(toppingId); // Dùng store function
        Notification.success("Đã thay đổi trạng thái topping!");
      } else if (action === "hardDelete") {
        await deleteTopping(toppingId); // Dùng store function
        Notification.success("Đã xóa vĩnh viễn topping!");
      }

      // Đóng modal và tải lại danh sách
      setShowDeleteModal(false);
      setDeleteModalConfig({
        type: "soft",
        toppingId: null,
        toppingName: "",
        action: null,
      });
      loadToppings(pagination.currentPage);
    } catch (error) {
      const errorMsg =
        deleteModalConfig.action === "softDelete"
          ? "Thay đổi trạng thái thất bại"
          : "Xóa topping thất bại";
      Notification.error(errorMsg, error.message);
    }
  };

  //! Hàm đóng modal xóa
  const handleCloseDeleteModal = () => {
    if (!isLoading) {
      setShowDeleteModal(false);
      setDeleteModalConfig({
        type: "soft",
        toppingId: null,
        toppingName: "",
        action: null,
      });
    }
  };

  // Trạng thái bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Phân trang
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      const result = await getAllToppings(params);
      if (result && result.toppings) {
        Notification.success(
          `Tải thành công ${result.toppings.length} topping.`
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

      const result = await getAllToppings(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách topping",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Xử lý chuyển trạng thái topping
  const handleToggleStatus = async (topping) => {
    try {
      const newStatus =
        topping.status === "available" ? "unavailable" : "available";
      await updateTopping(topping._id, { status: newStatus });
      Notification.success("Đã cập nhật trạng thái topping!");
      loadToppings(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật trạng thái thất bại", error.message);
    }
  };

  //! Xử lý tìm kiếm với debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadToppings(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  //! Load data lần đầu khi component mount (với protection)
  useEffect(() => {
    if (!isInitLoaded.current) {
      console.log(" First load only - Using loadToppingsInit");
      loadToppingsInit(1);
      isInitLoaded.current = true;
    } else {
      console.log("⚠️ Prevented duplicate load");
    }
  }, []); // Empty dependency array = chỉ chạy 1 lần khi mount

  //! Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadToppings(newPage);
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
                  onClick={handleDeleteSelectedToppings}
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
          {/* Banner thông báo đã chọn */}
          <SelectedItemsBanner
            selectedCount={selectedCount}
            itemType="topping"
            onClearSelection={clearSelection}
            onBulkDelete={handleDeleteSelectedToppings}
            isLoading={isLoading}
          />

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
            <LoadingSpinner message="Đang tải danh sách topping..." />
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
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Trạng thái
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Ngày tạo
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

                      {/* Trạng thái */}
                      <td className="p-3 min-w-[140px]">
                        <span
                          className={`px-2 py-1 text-sm rounded font-semibold ${
                            topping.status === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {topping.status === "available"
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                      </td>

                      {/* Hiển thị ngày */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(topping.createdAt)}
                      </td>

                      {/* Hành động */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditTopping(topping)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <Switch
                            checked={topping.status === "available"}
                            onChange={() => handleToggleStatus(topping)}
                            className={`${
                              topping.status === "available"
                                ? "bg-green-500"
                                : "bg-red-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                          >
                            <span className="sr-only">
                              Chuyển trạng thái bán
                            </span>
                            <span
                              className={`${
                                topping.status === "available"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                          </Switch>

                          <button
                            onClick={() => handleDeleteTopping(topping)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                            title="Xóa vĩnh viễn"
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
          <Pagination
            pagination={pagination}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            label="tài khoản"
            currentItemsCount={toppings.length}
            totalItemsKey="totalToppings"
          />
        </div>
      </div>

      {/* Modal thêm/sửa/xóa */}
      {showAddModal && (
        <AddToppingModal
          onAdd={handleAddTopping}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      )}

      {showEditModal && editingTopping && (
        <EditToppingModal
          topping={editingTopping}
          onUpdate={handleUpdateTopping}
          onClose={() => {
            setShowEditModal(false);
            setEditingTopping(null);
          }}
          isLoading={isLoading}
        />
      )}
      {/* Modal xác nhận xóa bulk */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isLoading}
        selectedCount={selectedCount}
        itemType="topping"
        confirmText="Xóa vĩnh viễn"
      />

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
        deleteType={deleteModalConfig.type}
        itemName={deleteModalConfig.toppingName}
        message={
          deleteModalConfig.type === "soft"
            ? "Bạn có chắc muốn thay đổi trạng thái topping này không?"
            : "Bạn có chắc muốn XÓA VĨNH VIỄN topping này không?"
        }
        confirmText={
          deleteModalConfig.type === "soft"
            ? "Thay đổi trạng thái"
            : "Xóa vĩnh viễn"
        }
      />
    </>
  );
};

export default AdminTopping;
