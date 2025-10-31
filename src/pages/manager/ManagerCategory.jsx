// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Pencil,
  Eye,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  DollarSign,
  CheckCircle2,
  Ban,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Check,
  Square,
  CheckSquare,
  Settings,
  Tags,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import stores để quản lý trạng thái
import { useManagerStore } from "../../store/managerStore";
import { useRequestManagerStore } from "../../store/request/requestManagerStore";

// Import component
import Notification from "../../components/ui/Notification";
import AddCategoryRequestModal from "../../components/features/manager/request/category/AddCategoryRequestModal";
import UpdateCategoryRequestModal from "../../components/features/manager/request/category/UpdateCategoryRequestModal";
import DeleteCategoryRequestModal from "../../components/features/manager/request/category/DeleteCategoryRequestModal";
import EditCategoryModal from "../../components/features/admin/category/EditCategoryModal";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";

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
];

// Tùy chọn trạng thái
const statusOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <Tags className="w-4 h-4 text-gray-600" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "available",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Đang sử dụng
      </span>
    ),
  },
  {
    value: "unavailable",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-600" />
        Ngừng sử dụng
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

const ManagerCategory = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý danh mục
  const { categories, pagination, isLoading, fetchMyStoreCategories, updateMyStoreCategory, clearError } =
    useManagerStore();

  // Store quản lý requests  
  const { isLoading: isRequestLoading } = useRequestManagerStore();

  // Trạng thái các modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [requestingCategory, setRequestingCategory] = useState(null);

  //! Hàm xử lý thêm danh mục request
  const handleAddCategoryRequest = () => {
    setShowAddModal(false);
    Notification.info(
      "Yêu cầu đã được gửi", 
      "Admin sẽ xem xét và phản hồi yêu cầu của bạn sớm nhất có thể."
    );
  };

  //! Xử lý thành công khi gửi request cập nhật danh mục
  const handleUpdateRequestSuccess = () => {
    setShowUpdateRequestModal(false);
    setRequestingCategory(null);
  };

  //! Xử lý thành công khi gửi request xóa danh mục
  const handleDeleteRequestSuccess = () => {
    setShowDeleteRequestModal(false);
    setRequestingCategory(null);
  };

  //! Manager không được sửa danh mục trực tiếp - phải qua request system
  const handleEditCategory = (categoryData) => {
    setRequestingCategory(categoryData);
    setShowUpdateRequestModal(true);
  };

  //! Hàm xử lý cập nhật danh mục
  const handleUpdateCategory = async (categoryData) => {
    try {
      await updateCategory(editingCategory._id, categoryData);
      await handleSyncCategoriesWithProducts();
      setShowEditModal(false);
      setEditingCategory(null);
      Notification.success("Cập nhật danh mục thành công!");
      loadCategories(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật thất bại", error.message);
    }
  };

  // Trạng thái modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    categoryId: null,
    categoryName: "",
    action: null,
  });

  // Trạng thái modal xóa hàng loạt
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  //! Hàm xử lý xóa hẳn các danh mục được chọn
  const handleDeleteSelectedCategories = async () => {
    if (!hasSelection) {
      Notification.warning("Vui lòng chọn ít nhất một danh mục để xóa");
      return;
    }

    // Mở modal xác nhận thay vì dùng window.confirm
    setShowBulkDeleteModal(true);
  };

  //! Xác nhận xóa bulk categories (HARD DELETE)
  const handleConfirmBulkDelete = async () => {
    try {
      // getSelectedItems() trả về objects, cần extract IDs
      const selectedCategoryObjects = getSelectedItems();
      const selectedCategoryIds = selectedCategoryObjects.map(
        (category) => category._id
      );

      // Thêm vào logic xóa vĩnh viễn ở store
      for (const categoryId of selectedCategoryIds) {
        await deleteCategory(categoryId); // Hard delete thay vì soft delete
      }

      await handleSyncCategoriesWithProducts(); // Đồng bộ sau khi xóa
      Notification.success(`Đã xóa vĩnh viễn ${selectedCount} danh mục`);
      clearSelection();
      setShowBulkDeleteModal(false);
      loadCategories(pagination.currentPage);
    } catch (error) {
      console.error("Bulk delete error:", error);
      Notification.error("Xóa danh mục thất bại", error.message);
    }
  };

  //! Hàm xác nhận hành động xóa
  const handleConfirmDelete = async () => {
    try {
      const { categoryId, action } = deleteModalConfig;

      if (action === "softDelete") {
        await softDeleteCategory(categoryId);
        Notification.success("Đã thay đổi trạng thái danh mục!");
        await handleSyncCategoriesWithProducts();
      } else if (action === "hardDelete") {
        await deleteCategory(categoryId);
        Notification.success("Đã xóa danh mục vĩnh viễn!");
        await handleSyncCategoriesWithProducts();
      }

      // Đóng modal và tải lại danh sách
      setShowDeleteModal(false);
      setDeleteModalConfig({
        type: "soft",
        categoryId: null,
        categoryName: "",
        action: null,
      });
      loadCategories(pagination.currentPage);
    } catch (error) {
      const errorMsg =
        deleteModalConfig.action === "softDelete"
          ? "Thay đổi trạng thái thất bại"
          : "Xóa danh mục thất bại";
      Notification.error(errorMsg, error.message);
    }
  };

  //! Hàm đóng modal xóa
  const handleCloseDeleteModal = () => {
    if (!isLoading) {
      setShowDeleteModal(false);
      setDeleteModalConfig({
        type: "soft",
        categoryId: null,
        categoryName: "",
        action: null,
      });
    }
  };

  // Trạng thái lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Phân trang
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //! Hàm tải danh sách danh mục cho lần đầu (có notification)
  const loadCategoriesInit = async (page = 1, limit = itemsPerPage) => {
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

      const result = await fetchMyStoreCategories(params);
      if (result.data && result.data.categories) {
        Notification.success(
          `Tải thành công ${result.data.categories.length} danh mục.`
        );
      }
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách danh mục",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Hàm tải danh sách danh mục cho search/filter/pagination (không notification)
  const loadCategories = async (page = 1, limit = itemsPerPage) => {
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

      await fetchMyStoreCategories(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách danh mục",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Hàm xử lý đồng bộ danh mục với sản phẩm
  const handleSyncCategoriesWithProducts = async () => {
    try {
      await syncCategoriesWithProducts();
      Notification.success("Đồng bộ danh mục với sản phẩm thành công!");
    } catch (error) {
      Notification.error(
        "Đồng bộ danh mục với sản phẩm thất bại",
        error.message
      );
    }
  };

  //! Manager không được xóa danh mục - chỉ có thể request tới admin
  const handleRemoveFromStore = async (category) => {
    setRequestingCategory(category);
    setShowDeleteRequestModal(true);
  };

  //! Gửi yêu cầu tới Admin để thay đổi system status
  const handleRequestSystemStatusChange = async (category) => {
    // Xác định loại request dựa trên system status hiện tại
    let requestType = "";
    let requestReason = "";
    let newSystemStatus = "available"; // Default target status

    if (category.status === "unavailable") {
      requestType = "Yêu cầu mở lại danh mục";
      requestReason =
        "Danh mục đang bị khóa bởi Admin, cửa hàng muốn sử dụng lại danh mục này.";
      newSystemStatus = "available";
    } else if (category.status === "paused") {
      requestType = "Yêu cầu mở lại danh mục";
      requestReason =
        "Danh mục đang bị tạm dừng bởi Admin, cửa hàng muốn sử dụng lại danh mục này.";
      newSystemStatus = "available";
    } else {
      Notification.info(
        "Danh mục đang hoạt động bình thường",
        "Không cần gửi yêu cầu thay đổi trạng thái."
      );
      return;
    }

    try {
      // Implement request API call here if needed
      Notification.success(
        "Đã gửi yêu cầu tới Admin",
        `${requestType} cho danh mục "${category.name}"`
      );
    } catch (error) {
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    }
  };

  //! Xử lý chuyển trạng thái danh mục TẠI CỬA HÀNG (storeStatus)
  const handleToggleStoreStatus = async (category) => {
    // Kiểm tra constraint: Chỉ được toggle khi system status = available
    if (category.status !== "available") {
      Notification.warning(
        "Không thể thay đổi trạng thái",
        "Danh mục phải được Admin mở lại trước khi bạn có thể thay đổi trạng thái cửa hàng."
      );
      return;
    }

    try {
      // CHT có thể toggle giữa "available" và "paused"
      const newStoreStatus =
        category.storeStatus === "available" ? "paused" : "available";

      await updateMyStoreCategory(category._id, { storeStatus: newStoreStatus });

      Notification.success(
        newStoreStatus === "available"
          ? "Đã BẬT lại danh mục tại cửa hàng!"
          : "Đã TẠM DỪNG danh mục tại cửa hàng!"
      );

      loadCategories(pagination.currentPage);
    } catch (error) {
      console.error("Toggle category store status error:", error);

      // Handle specific business rule errors
      const errorResponse = error.response?.data;
      if (errorResponse?.code) {
        switch (errorResponse.code) {
          case "SYSTEM_STATUS_UNAVAILABLE":
            Notification.error(
              "Không thể bật danh mục",
              "Admin đã tắt danh mục này toàn hệ thống. Liên hệ Admin để kích hoạt lại."
            );
            break;
          case "SYSTEM_STATUS_PAUSED":
            Notification.error(
              "Không thể bật danh mục",
              "Admin đang tạm dừng danh mục này. Liên hệ Admin để biết thêm thông tin."
            );
            break;
          case "SYSTEM_STATUS_OUT_OF_STOCK":
            Notification.error(
              "Không thể bật danh mục",
              "Danh mục đang bị hạn chế toàn hệ thống. Chờ Admin xử lý."
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

  //! Xử lý tìm kiếm với debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadCategories(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  //! Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadCategories(newPage);
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

  //! Tải dữ liệu ban đầu khi component mount
  useEffect(() => {
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadCategoriesInit(1);
    }
  }, []); // Chỉ chạy một lần khi component mount

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
  } = useTableCheckbox(categories, "_id");

  // State cho expand description
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  //! Xử lý expand/collapse description
  const toggleDescription = (categoryId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
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
                Danh sách danh mục
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi danh mục của bạn để thêm vào sản phẩm.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-4 flex-wrap">
              {/* Xóa danh mục */}
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteSelectedCategories}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa danh mục đã chọn ({selectedCount})
                </button>
              </div>
              {/* Thêm danh mục */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2"
              >
                <Tags className="w-4 h-4" />
                Thêm danh mục
              </button>
            </div>
          </div>

          {hasSelection && (
            <div className="px-5">
              <div className="flex items-center justify-around p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium">
                    Đã chọn {selectedCount} danh mục
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
                    placeholder="Tìm kiếm tên danh mục..."
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
                    loadCategories(1, opt.value); // Load page 1 với limit mới
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
          {isLoading && categories.length === 0 && (
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
                Đang tải danh mục...
              </div>
            </div>
          )}

          {/* Bảng danh mục */}
          <div className="overflow-x-auto">
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {categories.length === 0 && !isLoading ? (
              <p className="text-center text-gray-600 text-lg py-8">
                {searchTerm
                  ? "Không tìm thấy danh mục nào"
                  : "Chưa có danh mục"}
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
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="hover:bg-gray-50 text-center"
                    >
                      {/* Hiển thị tickbox từng danh mục */}
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectItem(category._id)}
                          className="flex items-center justify-center w-full"
                        >
                          {isItemSelected(category._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Tên */}
                      <td className="p-3 text-sm text-dark_blue font-semibold text-left">
                        {category.name || "Không có tên"}
                      </td>

                      {/* Mô tả */}
                      <td className="p-3 text-md text-start text-gray-900 max-w-xs">
                        <div>
                          <div
                            className={
                              expandedDescriptions.has(category._id)
                                ? ""
                                : "line-clamp-2"
                            }
                          >
                            {category.description || "Không có mô tả"}
                          </div>
                          {category.description &&
                            category.description.length > 100 && (
                              <button
                                onClick={() => toggleDescription(category._id)}
                                className="text-blue-600 hover:underline text-sm mt-1"
                              >
                                {expandedDescriptions.has(category._id)
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
                            category.status === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {category.status === "available"
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </td> */}

                      {/* Trạng thái (Store Manager) */}
                      <td className="p-3 min-w-[140px]">
                        <span
                          className={`px-2 py-1 text-sm rounded font-semibold ${
                            category.storeStatus === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {category.storeStatus === "available"
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </td>

                      {/* Hiển thị ngày thêm */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(category.addedAt)}
                      </td>

                      {/* Hiển thị ngày cập nhật */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(category.lastUpdated)}
                      </td>

                      {/* Hành động */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                            title="Yêu cầu chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <Switch
                            checked={category.storeStatus === "available"}
                            onChange={() => handleToggleStoreStatus(category)}
                            disabled={category.status !== "available"}
                            className={`${
                              category.storeStatus === "available"
                                ? "bg-green-500"
                                : "bg-red-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              category.status !== "available" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <span className="sr-only">
                              Chuyển trạng thái cửa hàng
                            </span>
                            <span
                              className={`${
                                category.storeStatus === "available"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                          </Switch>

                          <button
                            onClick={() => handleRemoveFromStore(category)}
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
            <div className="flex justify-between items-center mt-4 flex-col border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800">
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
                  Hiển thị {categories.length} /{" "}
                  {pagination.totalCategories || 0} danh mục (Trang{" "}
                  {pagination.currentPage || 1} / {pagination.totalPages || 1})
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

      {/* Modal thêm/sửa/xóa */}
      {showAddModal && (
        <AddCategoryRequestModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddCategoryRequest}
        />
      )}

      {showUpdateRequestModal && requestingCategory && (
        <UpdateCategoryRequestModal
          isOpen={showUpdateRequestModal}
          onClose={() => {
            setShowUpdateRequestModal(false);
            setRequestingCategory(null);
          }}
          onSuccess={handleUpdateRequestSuccess}
          categoryData={requestingCategory}
        />
      )}

      {showDeleteRequestModal && requestingCategory && (
        <DeleteCategoryRequestModal
          isOpen={showDeleteRequestModal}
          onClose={() => {
            setShowDeleteRequestModal(false);
            setRequestingCategory(null);
          }}
          onSuccess={handleDeleteRequestSuccess}
          categoryData={requestingCategory}
        />
      )}

      {showEditModal && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onUpdate={handleUpdateCategory}
          onClose={() => {
            setShowEditModal(false);
            setEditingCategory(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Modal xác nhận xóa bulk */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa vĩnh viễn
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn{" "}
                <span className="font-bold text-red-600">XÓA VĨNH VIỄN</span>{" "}
                <span className="font-semibold text-red-600">
                  {selectedCount}
                </span>{" "}
                danh mục được chọn không?
              </p>
              <p className="text-xs text-gray-400 mt-2">
                <span className="font-semibold text-red-600">Cảnh báo:</span>{" "}
                Hành động này KHÔNG THỂ hoàn tác!
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Đang xử lý...
                  </span>
                ) : (
                  "Xóa vĩnh viễn"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
        deleteType={deleteModalConfig.type}
        itemName={deleteModalConfig.categoryName}
        message={
          deleteModalConfig.type === "soft"
            ? "Bạn có chắc muốn thay đổi trạng thái danh mục này không?"
            : "Bạn có chắc muốn XÓA VĨNH VIỄN danh mục này không?"
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

export default ManagerCategory;
