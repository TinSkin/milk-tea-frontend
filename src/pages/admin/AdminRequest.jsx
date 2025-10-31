// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import motion từ framer-motion để tạo hiệu ứng chuyển động
import { motion } from "framer-motion";

// Import Select component từ react-select để tạo dropdown đẹp
import Select from "react-select";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Eye,
  Search,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  SortDesc,
  SortAsc,
  ListOrdered,
  CheckSquare,
  Square,
  FileText,
  Package,
  Tag,
  Users,
  Calendar,
  Filter,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  User,
  Store,
  MessageSquare,
  AlertCircle,
  Info,
} from "lucide-react";

// Import stores để quản lý trạng thái
import { useRequestAdminStore } from "../../store/request/requestAdminStore";

// Import component
import Notification from "../../components/ui/Notification";
import LoadingSpinner from "../../layouts/components/LoadingSpinner";
import Pagination from "../../layouts/components/Pagination";

// Import utilities và hooks
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
    value: "updatedAt-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-green-600" />
        Cập nhật mới nhất
      </span>
    ),
  },
  {
    value: "priority-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-red-600" />
        Ưu tiên cao
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
        <ListOrdered className="w-4 h-4 text-gray-600" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "pending",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-yellow-600" />
        Chờ duyệt
      </span>
    ),
  },
  {
    value: "approved",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Đã duyệt
      </span>
    ),
  },
  {
    value: "rejected",
    label: (
      <span className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-600" />
        Từ chối
      </span>
    ),
  },
  {
    value: "cancelled",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-gray-600" />
        Đã hủy
      </span>
    ),
  },
];

// Tùy chọn loại entity
const entityOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-gray-600" />
        Tất cả loại
      </span>
    ),
  },
  {
    value: "product",
    label: (
      <span className="flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-600" />
        Sản phẩm
      </span>
    ),
  },
  {
    value: "category",
    label: (
      <span className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-green-600" />
        Danh mục
      </span>
    ),
  },
  {
    value: "topping",
    label: (
      <span className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-orange-600" />
        Topping
      </span>
    ),
  },
];

// Tùy chọn hành động
const actionOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-gray-600" />
        Tất cả hành động
      </span>
    ),
  },
  {
    value: "create",
    label: (
      <span className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-green-600" />
        Tạo mới
      </span>
    ),
  },
  {
    value: "update",
    label: (
      <span className="flex items-center gap-2">
        <Edit className="w-4 h-4 text-blue-600" />
        Cập nhật
      </span>
    ),
  },
  {
    value: "delete",
    label: (
      <span className="flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-red-600" />
        Xóa
      </span>
    ),
  },
];

function AdminRequest() {
  // Store quản lý requests
  const {
    requests,
    isLoading,
    pagination,
    filters,
    getAllRequests,
    approveRequest,
    rejectRequest,
    bulkApproveRequests,
    bulkRejectRequests,
    setFilters,
    resetFilters,
    clearError,
    getRequestsStats,
  } = useRequestAdminStore();

  // Trạng thái modal và views
  const [viewingRequest, setViewingRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  
  // State cho action modal (approve/reject với note)
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve" hoặc "reject"
  const [actionNote, setActionNote] = useState("");
  const [actionRequestId, setActionRequestId] = useState(null);

  // Trạng thái filters local
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(
    statusOptions.find((opt) => opt.value === filters.status) || statusOptions[0]
  );
  const [entityFilter, setEntityFilter] = useState(
    entityOptions.find((opt) => opt.value === filters.entity) || entityOptions[0]
  );
  const [actionFilter, setActionFilter] = useState(
    actionOptions.find((opt) => opt.value === filters.action) || actionOptions[0]
  );
  const [sortOption, setSortOption] = useState(sortOptions[0]);

  // Checkbox selection
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
  } = useTableCheckbox(requests);

  // Refs
  const searchTimeoutRef = useRef(null);

  //! Load requests khi component mount hoặc filters thay đổi
  const loadRequests = async (page = 1) => {
    try {
      const [sortBy, sortOrder] = sortOption.value.split("-");
      await getAllRequests({
        page,
        search: searchTerm,
        status: statusFilter.value,
        entity: entityFilter.value,
        action: actionFilter.value,
        sortBy,
        sortOrder,
      });
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  //! Effect để load requests ban đầu
  useEffect(() => {
    loadRequests();
    return () => clearError();
  }, []);

  //! Effect để load lại khi filters thay đổi
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadRequests(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, statusFilter, entityFilter, actionFilter, sortOption]);

  //! Xử lý xem chi tiết request
  const handleViewRequest = (request) => {
    setViewingRequest(request);
    setShowViewModal(true);
  };

  //! Mở action modal với note
  const openActionModal = (type, requestId) => {
    setActionType(type);
    setActionRequestId(requestId);
    setActionNote("");
    setShowActionModal(true);
  };

  //! Xử lý action với note
  const handleActionWithNote = async () => {
    try {
      console.log("Action details:", {
        type: actionType,
        requestId: actionRequestId,
        note: actionNote
      });
      
      if (actionType === "approve") {
        await approveRequest(actionRequestId, actionNote);
        Notification.success("Đã duyệt request thành công");
      } else if (actionType === "reject") {
        await rejectRequest(actionRequestId, actionNote);
        Notification.success("Đã từ chối request thành công");
      }
      
      setShowActionModal(false);
      setShowViewModal(false);
      clearSelection();
    } catch (error) {
      console.error("Action error:", error);
      Notification.error(
        `${actionType === "approve" ? "Duyệt" : "Từ chối"} request thất bại`,
        error.message
      );
    }
  };

  //! Xử lý duyệt request (có thể gọi trực tiếp hoặc mở modal)
  const handleApproveRequest = async (requestId, note = "", openModal = false) => {
    if (openModal) {
      openActionModal("approve", requestId);
      return;
    }
    
    try {
      await approveRequest(requestId, note);
      Notification.success("Đã duyệt request thành công");
      clearSelection();
    } catch (error) {
      Notification.error("Duyệt request thất bại", error.message);
    }
  };

  //! Xử lý từ chối request (có thể gọi trực tiếp hoặc mở modal)
  const handleRejectRequest = async (requestId, note = "", openModal = false) => {
    if (openModal) {
      openActionModal("reject", requestId);
      return;
    }
    
    try {
      await rejectRequest(requestId, note);
      Notification.success("Đã từ chối request thành công");
      clearSelection();
    } catch (error) {
      Notification.error("Từ chối request thất bại", error.message);
    }
  };

  //! Xử lý bulk actions
  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      Notification.warning("Vui lòng chọn ít nhất một request");
      return;
    }

    try {
      const selectedIds = selectedItems.map((item) => item._id);

      if (bulkAction === "approve") {
        const result = await bulkApproveRequests(selectedIds, bulkNote);
        if (result.success) {
          Notification.success(
            `Đã duyệt ${result.approved.length} requests thành công`
          );
        } else {
          Notification.warning(
            `Duyệt ${result.approved.length} requests thành công, ${result.errors.length} lỗi`
          );
        }
      } else if (bulkAction === "reject") {
        const result = await bulkRejectRequests(selectedIds, bulkNote);
        if (result.success) {
          Notification.success(
            `Đã từ chối ${result.rejected.length} requests thành công`
          );
        } else {
          Notification.warning(
            `Từ chối ${result.rejected.length} requests thành công, ${result.errors.length} lỗi`
          );
        }
      }

      setShowBulkModal(false);
      setBulkNote("");
      clearSelection();
    } catch (error) {
      Notification.error("Thao tác bulk thất bại", error.message);
    }
  };

  //! Xử lý reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter(statusOptions[0]);
    setEntityFilter(entityOptions[0]);
    setActionFilter(actionOptions[0]);
    setSortOption(sortOptions[0]);
    resetFilters();
    clearSelection();
  };

  //! Format ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  //! Render status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800",
        text: "Chờ duyệt",
      },
      approved: {
        icon: CheckCircle2,
        className: "bg-green-100 text-green-800",
        text: "Đã duyệt",
      },
      rejected: {
        icon: XCircle,
        className: "bg-red-100 text-red-800",
        text: "Từ chối",
      },
      cancelled: {
        icon: Ban,
        className: "bg-gray-100 text-gray-800",
        text: "Đã hủy",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${config.className}`}
      >
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  //! Render entity badge
  const renderEntityBadge = (entity) => {
    const entityConfig = {
      product: {
        icon: Package,
        className: "bg-blue-100 text-blue-800",
        text: "Sản phẩm",
      },
      category: {
        icon: Tag,
        className: "bg-green-100 text-green-800",
        text: "Danh mục",
      },
      topping: {
        icon: Plus,
        className: "bg-orange-100 text-orange-800",
        text: "Topping",
      },
    };

    const config = entityConfig[entity] || entityConfig.product;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  //! Render action badge
  const renderActionBadge = (action) => {
    const actionConfig = {
      create: {
        icon: Plus,
        className: "bg-green-100 text-green-800",
        text: "Tạo mới",
      },
      update: {
        icon: Edit,
        className: "bg-blue-100 text-blue-800",
        text: "Cập nhật",
      },
      delete: {
        icon: Trash2,
        className: "bg-red-100 text-red-800",
        text: "Xóa",
      },
    };

    const config = actionConfig[action] || actionConfig.update;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  // Get stats for summary
  const stats = getRequestsStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Requests
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả các yêu cầu từ Store Managers
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hủy</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.cancelled}
                </p>
              </div>
              <Ban className="w-8 h-8 text-gray-600" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow mb-6 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo lý do, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Chọn trạng thái"
              isSearchable={false}
            />
          </div>

          {/* Entity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại
            </label>
            <Select
              options={entityOptions}
              value={entityFilter}
              onChange={setEntityFilter}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Chọn loại"
              isSearchable={false}
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <Select
              options={actionOptions}
              value={actionFilter}
              onChange={setActionFilter}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Chọn hành động"
              isSearchable={false}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp
            </label>
            <Select
              options={sortOptions}
              value={sortOption}
              onChange={setSortOption}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Chọn cách sắp xếp"
              isSearchable={false}
            />
          </div>

          {/* Reset Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center mt-4">

          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Đã chọn {selectedItems.length} items
              </span>
              <button
                onClick={() => {
                  setBulkAction("approve");
                  setShowBulkModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Duyệt hàng loạt
              </button>
              <button
                onClick={() => {
                  setBulkAction("reject");
                  setShowBulkModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Từ chối hàng loạt
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">
                      <input
                        type="checkbox"
                        // checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store & User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại & Hành động
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr
                      key={request._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.some(
                            (item) => item._id === request._id
                          )}
                          onChange={() => handleSelectItem(request)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <h3 className="text-sm font-medium text-gray-900">
                            {request.reason || "Không có lý do"}
                          </h3>
                          {request.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {request.description}
                            </p>
                          )}
                          {request.tags && request.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {request.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {request.tags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{request.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">
                              {request.storeId?.storeName || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 truncate">
                              {request.userId?.userName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {renderEntityBadge(request.entity)}
                          {renderActionBadge(request.action)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {formatDate(request.createdAt)}
                          </span>
                          {request.updatedAt !== request.createdAt && (
                            <span className="text-xs text-gray-500">
                              Cập nhật: {formatDate(request.updatedAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewRequest(request)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => openActionModal("approve", request._id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Duyệt"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openActionModal("reject", request._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={loadRequests}
                  totalItems={pagination.totalRequests}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* View Request Modal */}
      {showViewModal && viewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết Request
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Lý do
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingRequest.reason || "Không có lý do"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        <p className="text-sm text-gray-900">
                          {viewingRequest.description || "Không có mô tả"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Trạng thái
                        </label>
                        <div className="mt-1">
                          {renderStatusBadge(viewingRequest.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Thông tin request
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Loại
                        </label>
                        <div className="mt-1">
                          {renderEntityBadge(viewingRequest.entity)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hành động
                        </label>
                        <div className="mt-1">
                          {renderActionBadge(viewingRequest.action)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày tạo
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDate(viewingRequest.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store and User Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Thông tin cửa hàng & người dùng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cửa hàng
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewingRequest.storeId?.storeName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Người tạo
                      </label>
                      <p className="text-sm text-gray-900">
                        {viewingRequest.userId?.userName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payload */}
                {viewingRequest.payload && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dữ liệu</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(viewingRequest.payload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Notes */}
                {(viewingRequest.note || viewingRequest.approverNote) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Ghi chú</h3>
                    <div className="space-y-3">
                      {viewingRequest.note && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ghi chú của Manager
                          </label>
                          <p className="text-sm text-gray-900">
                            {viewingRequest.note}
                          </p>
                        </div>
                      )}
                      {viewingRequest.approverNote && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ghi chú của Admin
                          </label>
                          <p className="text-sm text-gray-900">
                            {viewingRequest.approverNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {viewingRequest.status === "pending" && (
                  <div className="flex gap-4 pt-6 border-t">
                    <button
                      onClick={() => openActionModal("approve", viewingRequest._id)}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Duyệt Request
                    </button>
                    <button
                      onClick={() => openActionModal("reject", viewingRequest._id)}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Từ chối Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject với note) */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === "approve" ? "Duyệt Request" : "Từ chối Request"}
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn {actionType === "approve" ? "duyệt" : "từ chối"} request này?
              </p>
              <textarea
                placeholder={`Lý do ${actionType === "approve" ? "duyệt" : "từ chối"} (tùy chọn)`}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleActionWithNote}
                  className={`flex-1 py-2 rounded-lg text-white transition-colors ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionType === "approve" ? "Duyệt" : "Từ chối"}
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {bulkAction === "approve" ? "Duyệt hàng loạt" : "Từ chối hàng loạt"}
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn{" "}
                {bulkAction === "approve" ? "duyệt" : "từ chối"}{" "}
                {selectedItems.length} requests đã chọn?
              </p>
              <textarea
                placeholder="Ghi chú (tùy chọn)"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBulkAction}
                  className={`flex-1 py-2 rounded-lg text-white transition-colors ${
                    bulkAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRequest;
