// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Pencil,
  Plus,
  Store,
  Clock,
  SortAsc,
  SortDesc,
  MapPin,
  Phone,
  CheckCircle2,
  Ban,
  ListOrdered,
  Search,
  Trash2,
  Settings,
  CheckSquare,
  Square,
  Eye,
  Check,
  Building2,
  Users,
  Target,
  Calendar,
  Mail,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import stores để quản lý trạng thái
import { useStoreStore } from "../../store/storeStore";

// Import component
import Notification from "../../components/ui/Notification";
import AddStoreModal from "../../components/features/admin/store/AddStoreModal";
import EditStoreModal from "../../components/features/admin/store/EditStoreModal";
import ViewStoreModal from "../../components/features/admin/store/ViewStoreModal";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";

//Import component layouts
import LoadingSpinner from "../../layouts/components/LoadingSpinner";

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
    value: "storeName-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-green-600" />
        Tên A-Z
      </span>
    ),
  },
  {
    value: "storeName-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-green-600" />
        Tên Z-A
      </span>
    ),
  },
  {
    value: "storeCode-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-purple-600" />
        Mã cửa hàng A-Z
      </span>
    ),
  },
  {
    value: "storeCode-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-purple-600" />
        Mã cửa hàng Z-A
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
        <Store className="w-4 h-4 text-gray-600" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "active",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Đang hoạt động
      </span>
    ),
  },
  {
    value: "inactive",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-yellow-600" />
        Tạm ngừng
      </span>
    ),
  },
  {
    value: "closed",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-600" />
        Đã đóng cửa
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

const AdminStore = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý cửa hàng
  const {
    stores,
    isLoading,
    pagination,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    clearError,
  } = useStoreStore();

  // Trạng thái các modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [viewingStore, setViewingStore] = useState(null);

  // Trạng thái search và filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);

  // Hook quản lý checkbox selection
  const {
    selectedItems,
    isAllSelected,
    hasSelection,
    selectAll,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    isItemSelected,
    getSelectedItems,
  } = useTableCheckbox(stores);

  //! Hàm load cửa hàng với phân trang và filter
  const loadStores = async (page = 1) => {
    try {
      const params = {
        page,
        limit: itemsPerPage.value,
        filters: {
          search: searchQuery.trim(),
          status: statusFilter.value === "all" ? undefined : statusFilter.value,
          sortBy: sortBy.value,
        },
      };

      await fetchStores(params);
      setCurrentPage(page);
    } catch (error) {
      Notification.error("Lỗi tải dữ liệu cửa hàng", error.message);
    }
  };

  //! Hàm load cửa hàng lần đầu khi component mount
  const loadStoresInit = async () => {
    if (isInitLoaded.current) return;

    isInitLoaded.current = true;
    await loadStores(1);
  };

  //! Effect load dữ liệu ban đầu
  useEffect(() => {
    loadStoresInit();
  }, []);

  //! Effect reload khi thay đổi filter
  useEffect(() => {
    if (isInitLoaded.current) {
      loadStores(1);
      clearSelection();
    }
  }, [searchQuery, statusFilter, sortBy, itemsPerPage]);

  //! Hàm xử lý thêm cửa hàng
  const handleAddStore = async (storeData) => {
    try {
      await createStore(storeData);
      setShowAddModal(false);
      Notification.success("Thêm cửa hàng thành công!");
      loadStores(pagination.currentPage);
    } catch (error) {
      Notification.error("Thêm cửa hàng thất bại", error.message);
    }
  };

  //! Hàm xử lý khi bấm chỉnh sửa cửa hàng
  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowEditModal(true);
  };

  //! Hàm xử lý cập nhật cửa hàng
  const handleUpdateStore = async (storeData) => {
    try {
      await updateStore(editingStore._id, storeData);
      setShowEditModal(false);
      setEditingStore(null);
      Notification.success("Cập nhật cửa hàng thành công!");
      loadStores(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật thất bại", error.message);
    }
  };

  //! Hàm xử lý xem chi tiết cửa hàng
  const handleViewStore = (store) => {
    setViewingStore(store);
    setShowViewModal(true);
  };

  // Trạng thái modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "hard",
    storeId: null,
    storeName: "",
    action: null,
  });

  // Trạng thái modal xóa hàng loạt
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  //! Hàm xử lý đóng cửa hàng được chọn (thay vì xóa)
  const handleCloseSelectedStores = async () => {
    if (!hasSelection) {
      Notification.warning("Vui lòng chọn ít nhất một cửa hàng để đóng cửa");
      return;
    }

    setShowBulkDeleteModal(true);
  };

  //! Xác nhận đóng cửa bulk stores (STATUS UPDATE)
  const handleConfirmBulkClose = async () => {
    try {
      const selectedStoreObjects = getSelectedItems();
      const updatePromises = selectedStoreObjects.map((store) =>
        updateStore(store._id, { ...store, status: "closed" })
      );
      await Promise.all(updatePromises);

      Notification.success(
        `Đã đóng cửa thành công ${selectedStoreObjects.length} cửa hàng`
      );
      setShowBulkDeleteModal(false);
      clearSelection();
      loadStores(currentPage);
    } catch (error) {
      Notification.error("Lỗi đóng cửa hàng", error.message);
    }
  };

  //! Hàm thay đổi trạng thái cửa hàng (thay vì xóa)
  const handleChangeStoreStatus = (store, newStatus) => {
    const statusActions = {
      inactive: () => handleSuspendStore(store),
      closed: () => handleCloseStore(store),
      delete: () => handleDeleteStore(store), // CHỈ cho Super Admin
    };

    if (statusActions[newStatus]) {
      statusActions[newStatus]();
    }
  };

  //! Hàm tạm ngừng cửa hàng
  const handleSuspendStore = (store) => {
    setDeleteModalConfig({
      type: "suspend",
      storeId: store._id,
      storeName: store.storeName,
      action: () => handleConfirmSuspend(store._id),
    });
    setShowDeleteModal(true);
  };

  //! Hàm đóng cửa vĩnh viễn
  const handleCloseStore = (store) => {
    setDeleteModalConfig({
      type: "close",
      storeId: store._id,
      storeName: store.storeName,
      action: () => handleConfirmClose(store._id),
    });
    setShowDeleteModal(true);
  };

  //! Hàm xóa hẳn (CHỈ Super Admin)
  const handleDeleteStore = (store) => {
    // Kiểm tra quyền Super Admin
    const isSupperAdmin = true;

    if (!isSupperAdmin) {
      Notification.error("Chỉ Super Admin mới có quyền xóa hẳn cửa hàng!");
      return;
    }

    setDeleteModalConfig({
      type: "delete",
      storeId: store._id,
      storeName: store.storeName,
      action: () => handleConfirmDelete(store._id),
    });
    setShowDeleteModal(true);
  };

  //! Hàm kích hoạt lại cửa hàng
  const handleReactivateStore = (store) => {
    setDeleteModalConfig({
      type: "reactivate",
      storeId: store._id,
      storeName: store.storeName,
      action: () => handleConfirmReactivate(store._id),
    });
    setShowDeleteModal(true);
  };

  //! Xác nhận kích hoạt lại
  const handleConfirmReactivate = async (storeId) => {
    try {
      const store = stores.find((s) => s._id === storeId);
      await updateStore(storeId, { ...store, status: "active" });
      Notification.success("Kích hoạt lại cửa hàng thành công!");
      setShowDeleteModal(false);
      clearSelection();
      loadStores(currentPage);
    } catch (error) {
      Notification.error("Lỗi kích hoạt lại cửa hàng", error.message);
    }
  };

  //! Xác nhận tạm ngừng
  const handleConfirmSuspend = async (storeId) => {
    try {
      const store = stores.find((s) => s._id === storeId);
      await updateStore(storeId, { ...store, status: "inactive" });
      Notification.success("Tạm ngừng cửa hàng thành công!");
      setShowDeleteModal(false);
      clearSelection();
      loadStores(currentPage);
    } catch (error) {
      Notification.error("Lỗi tạm ngừng cửa hàng", error.message);
    }
  };

  //! Xác nhận đóng cửa vĩnh viễn
  const handleConfirmClose = async (storeId) => {
    try {
      const store = stores.find((s) => s._id === storeId);
      await updateStore(storeId, { ...store, status: "closed" });
      Notification.success("Đóng cửa hàng thành công!");
      setShowDeleteModal(false);
      clearSelection();
      loadStores(currentPage);
    } catch (error) {
      Notification.error("Lỗi đóng cửa hàng", error.message);
    }
  };

  //! Xác nhận xóa hẳn (CHỈ Super Admin)
  const handleConfirmDelete = async (storeId) => {
    try {
      await deleteStore(storeId);
      Notification.success("Xóa cửa hàng thành công!");
      setShowDeleteModal(false);
      clearSelection();
      loadStores(currentPage);
    } catch (error) {
      Notification.error("Lỗi xóa cửa hàng", error.message);
    }
  };

  //! Render trạng thái badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle2,
        label: "Hoạt động",
      },
      inactive: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Tạm ngừng",
      },
      closed: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: Ban,
        label: "Đã đóng",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  //! Render phân trang
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => loadStores(current - 1)}
        disabled={current === 1}
        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trước
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - 1 && i <= current + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => loadStores(i)}
            className={`px-3 py-2 text-sm border rounded-md ${
              i === current
                ? "bg-camel text-white border-camel"
                : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === current - 2 || i === current + 2) {
        pages.push(
          <span key={i} className="px-2 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => loadStores(current + 1)}
        disabled={current === totalPages}
        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sau
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Hiển thị{" "}
          <span className="font-medium">
            {(current - 1) * pagination.limit + 1}
          </span>{" "}
          đến{" "}
          <span className="font-medium">
            {Math.min(current * pagination.limit, pagination.total)}
          </span>{" "}
          của <span className="font-medium">{pagination.total}</span> cửa hàng
        </div>
        <div className="flex items-center space-x-2">{pages}</div>
      </div>
    );
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
                Danh sách cửa hàng
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi cửa hàng của bạn.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-camel text-white rounded-lg hover:bg-camel-dark transition-colors"
              >
                <Store className="w-4 h-4" />
                Thêm cửa hàng
              </button>
            </div>
          </div>

          {/* Thanh tìm kiếm & sắp xếp & lọc */}
          <div className="border-b-2 border-gray-200 px-5 py-4">
            <div className="flex gap-3 sm:justify-between">
              {/* Tìm kiếm & Sắp xếp */}
              <div className="flex gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cửa hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  placeholder="Trạng thái"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />

                {/* Sort By */}
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  placeholder="Sắp xếp theo"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Phân trang */}
              <div className="flex gap-3">
                <Select
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                  options={itemsPerPageOptions}
                  placeholder="Số mục/trang"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {hasSelection && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  Đã chọn {selectedItems.length} cửa hàng
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCloseSelectedStores}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-orange-700 bg-orange-100 rounded hover:bg-orange-200 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Đóng cửa đã chọn
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trạng thái tải */}
          {isLoading && stores.length === 0 && (
            <LoadingSpinner message="Đang tải cửa hàng..." />
          )}

          {/* Bảng cửa hàng */}
          <div>
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {stores.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có cửa hàng nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Hãy thêm cửa hàng đầu tiên cho hệ thống
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-camel text-white rounded-lg hover:bg-camel-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm cửa hàng
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                {" "}
                {/* Phần tiêu đề bảng */}
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="w-10 px-6 py-3 text-left">
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
                      Cửa hàng
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Địa chỉ
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Liên hệ
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Trạng thái
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Ngày tạo
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      <div className="flex items-center justify-center">
                        <Settings className="w-6 h-6" />
                      </div>
                    </th>
                  </tr>
                </thead>
                {/* Phần thân bảng */}
                <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
                  {stores.map((store) => (
                    <tr key={store._id}>
                      {/* Hiển thị tickbox từng cửa hàng */}
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectItem(store._id)}
                          className="flex items-center justify-center"
                        >
                          {isItemSelected(store._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Tên */}
                      <td className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-camel to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {store.storeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Mã: {store.storeCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Địa chỉ */}
                      <td className="p-3">
                        <div className="text-sm text-gray-900">
                          {store.address?.street}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.address?.district}, {store.address?.city}
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-gray-900 mb-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {store.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {store.email}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="p-3 min-w-[140px]">
                        {renderStatusBadge(store.status)}
                      </td>

                      {/* Hiển thị ngày */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(store.createdAt)}
                      </td>

                      {/* Thao tác */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewStore(store)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStore(store)}
                            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Dropdown menu cho các hành động */}
                          <div className="relative group">
                            <button
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                              title="Thêm hành động"
                            >
                              <Settings className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                {/* Tạm ngừng hoạt động */}
                                {store.status === "active" && (
                                  <button
                                    onClick={() => handleSuspendStore(store)}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                  >
                                    <Clock className="w-4 h-4" />
                                    Tạm ngừng hoạt động
                                  </button>
                                )}

                                {/* Kích hoạt lại */}
                                {(store.status === "inactive" ||
                                  store.status === "closed") && (
                                  <button
                                    onClick={() => handleReactivateStore(store)}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Kích hoạt lại
                                  </button>
                                )}

                                {/* Đóng cửa vĩnh viễn */}
                                {store.status !== "closed" && (
                                  <button
                                    onClick={() => handleCloseStore(store)}
                                    className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Đóng cửa vĩnh viễn
                                  </button>
                                )}

                                {/* Xóa hẳn - CHỈ Super Admin */}
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                  <button
                                    onClick={() => handleDeleteStore(store)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>
                                      Xóa hẳn
                                      <span className="text-xs text-red-500 ml-1">
                                        (Super Admin)
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Phân trang */}
          {renderPagination()}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStoreModal
          onAdd={handleAddStore}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      )}

      {showEditModal && (
        <EditStoreModal
          store={editingStore}
          onUpdate={handleUpdateStore}
          onClose={() => {
            setShowEditModal(false);
            setEditingStore(null);
          }}
          isLoading={isLoading}
        />
      )}

      {showViewModal && (
        <ViewStoreModal
          store={viewingStore}
          onClose={() => {
            setShowViewModal(false);
            setViewingStore(null);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteModalConfig.action}
          title={
            deleteModalConfig.type === "suspend"
              ? "Xác nhận tạm ngừng cửa hàng"
              : deleteModalConfig.type === "close"
              ? "Xác nhận đóng cửa vĩnh viễn"
              : deleteModalConfig.type === "reactivate"
              ? "Xác nhận kích hoạt lại cửa hàng"
              : "Xác nhận xóa cửa hàng"
          }
          message={
            deleteModalConfig.type === "suspend"
              ? `Bạn có chắc chắn muốn tạm ngừng hoạt động cửa hàng "${deleteModalConfig.storeName}"? Cửa hàng sẽ không thể phục vụ khách hàng cho đến khi được kích hoạt lại.`
              : deleteModalConfig.type === "close"
              ? `Bạn có chắc chắn muốn đóng cửa vĩnh viễn cửa hàng "${deleteModalConfig.storeName}"? Cửa hàng sẽ ngừng hoạt động và dữ liệu sẽ được lưu trữ.`
              : deleteModalConfig.type === "reactivate"
              ? `Bạn có chắc chắn muốn kích hoạt lại cửa hàng "${deleteModalConfig.storeName}"? Cửa hàng sẽ hoạt động trở lại và có thể phục vụ khách hàng.`
              : `Bạn có chắc chắn muốn XÓA HẲNZ cửa hàng "${deleteModalConfig.storeName}"? Hành động này sẽ xóa vĩnh viễn tất cả dữ liệu và KHÔNG THỂ HOÀN TÁC.`
          }
          confirmText={
            deleteModalConfig.type === "suspend"
              ? "Tạm ngừng"
              : deleteModalConfig.type === "close"
              ? "Đóng cửa"
              : deleteModalConfig.type === "reactivate"
              ? "Kích hoạt"
              : "Xóa hẳn"
          }
          cancelText="Hủy"
          type={
            deleteModalConfig.type === "delete"
              ? "danger"
              : deleteModalConfig.type === "close"
              ? "warning"
              : deleteModalConfig.type === "reactivate"
              ? "success"
              : "warning"
          }
          isLoading={isLoading}
        />
      )}

      {showBulkDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleConfirmBulkClose}
          title="Xác nhận đóng cửa hàng"
          message={`Bạn có chắc chắn muốn đóng cửa ${selectedItems.length} cửa hàng đã chọn? Các cửa hàng sẽ ngừng hoạt động nhưng dữ liệu sẽ được lưu trữ.`}
          confirmText="Đóng cửa tất cả"
          cancelText="Hủy"
          type="warning"
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default AdminStore;
