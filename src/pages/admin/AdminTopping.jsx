import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Plus,
  CupSoda,
  Clock,
  SortAsc,
  SortDesc,
  Tag,
  DollarSign,
  CheckCircle2,
  Ban,
  ListOrdered,
  Search,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import store để lấy danh sách topping từ server
import { useToppingStore } from "../../store/toppingStore";
import { useAuthStore } from "../../store/authStore";

// Components
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";
import AddToppingModal from "../../components/Admin/Topping/AddToppingModal";
import EditToppingModal from "../../components/Admin/Topping/EditToppingModal";
import ConfirmDeleteModal from "../../components/Admin/ConfirmDeleteModal";

const sortOptions = [
  {
    value: "createdAt-desc",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4" /> Mới nhất <SortAsc />
      </span>
    ),
  },
  {
    value: "createdAt-asc",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4" /> Cũ nhất <SortDesc />
      </span>
    ),
  },
  {
    value: "name-asc",
    label: (
      <span className="flex items-center gap-2">
        <Tag className="w-4 h-4" /> Tên A-Z <SortAsc />
      </span>
    ),
  },
  {
    value: "name-desc",
    label: (
      <span className="flex items-center gap-2">
        <Tag className="w-4 h-4" /> Tên Z-A <SortDesc />
      </span>
    ),
  },
  {
    value: "extraPrice-asc",
    label: (
      <span className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" /> Giá thấp đến cao <SortAsc />
      </span>
    ),
  },
  {
    value: "extraPrice-desc",
    label: (
      <span className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" /> Giá cao đến thấp <SortDesc />
      </span>
    ),
  },
];

const statusOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-gray-500" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "available",
    label: (
      <span className="flex items-center gap-2 bg-green-50 text-green-700">
        <CheckCircle2 className="w-4 h-4 text-green-700" />
        Đang bán
      </span>
    ),
  },
  {
    value: "unavailable",
    label: (
      <span className="flex items-center gap-2 bg-red-50 text-red-700">
        <Ban className="w-4 h-4 text-red-700" />
        Ngừng bán
      </span>
    ),
  },
];

const itemsPerPageOptions = [
  {
    value: 5,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />5 topping / trang
      </span>
    ),
  },
  {
    value: 10,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        10 topping / trang
      </span>
    ),
  },
  {
    value: 15,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        15 topping / trang
      </span>
    ),
  },
];

const AdminTopping = () => {
  const navigate = useNavigate();
  const isInitLoaded = useRef(false);

  //! Topping store
  const {
    toppings,
    isLoading,
    pagination,
    getAllToppings,
    createTopping,
    updateTopping,
    clearError,
  } = useToppingStore();

  //! Auth store
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  //! Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);

  //! Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  //! Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //! Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    toppingId: null,
    toppingName: "",
    action: null,
  });

  //! Confirm delete action
  const handleConfirmDelete = async () => {
    try {
      const { type, toppingId, action } = deleteModalConfig;

      if (action === "softDelete") {
        await softDeleteTopping(toppingId);
        Notification.success("Đã thay đổi trạng thái topping!");
      }

      // Close modal and reload
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

  //! Close delete modal
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

  //! Load toppings
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

  //! Handle add topping
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

  //! Handle edit topping
  const handleEditTopping = (topping) => {
    setEditingTopping(topping);
    setShowEditModal(true);
  };

  //! Handle update topping
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

  //! Handle toggle topping status
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

  //! Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadToppings(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  //! Handle pagination
  const handlePageChange = (newPage) => {
    loadToppings(newPage);
  };

  //! Auth check and initial load
  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    // Load initial data
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadToppingsInit(1);
    }
  }, [isCheckingAuth, isAuthenticated, user, navigate]);

  //! Loading state
  if (isLoading && toppings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải topping...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="font-roboto max-w-full mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 bg-camel/10 rounded-lg py-4 px-6">
          <CupSoda className="w-8 h-8 text-camel" strokeWidth={2} />
          <h1 className="font-montserrat text-2xl font-semibold text-dark_blue capitalize tracking-tight pb-2 border-b-2 border-camel inline-block">
            Quản lý topping
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm Topping
            </button>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tên topping..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <Select
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === statusFilter)}
              onChange={(opt) => setStatusFilter(opt.value)}
              className="min-w-[180px]"
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

            {/* Sort */}
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
              className="min-w-[220px]"
            />

            {/* Items per page */}
            <Select
              options={itemsPerPageOptions}
              value={itemsPerPageOptions.find(
                (opt) => opt.value === itemsPerPage
              )}
              onChange={(opt) => {
                setItemsPerPage(opt.value);
                loadToppings(1, opt.value);
              }}
              className="min-w-[180px]"
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

        {/* Toppings table */}
        <div className="overflow-x-auto rounded-md">
          {toppings.length === 0 ? (
            <p className="text-center text-gray-600 text-lg py-8">
              {searchTerm ? "Không tìm thấy topping nào" : "Chưa có topping"}
            </p>
          ) : (
            <table className="min-w-full border-2 divide-y divide-gray-200">
              <thead className="bg-green_starbuck">
                <tr className="text-center">
                  <th className="p-3 text-lg font-semibold text-white text-left">
                    Tên Topping
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Giá thêm
                  </th>
                  <th className="p-3 text-lg font-semibold text-white text-left">
                    Mô tả
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Trạng thái
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Ngày tạo
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {toppings.map((topping) => (
                  <tr
                    key={topping._id}
                    className="hover:bg-gray-50 text-center"
                  >
                    {/* Name */}
                    <td className="p-3 text-dark_blue font-semibold text-left">
                      {topping.name}
                    </td>

                    {/* Extra Price */}
                    <td className="p-3 text-lg text-orange-600 font-bold">
                      {topping.extraPrice.toLocaleString()} VNĐ
                    </td>

                    {/* Description */}
                    <td className="p-3 text-lg text-gray-900 text-left">
                      {topping.description || "Không có mô tả"}
                    </td>

                    {/* Status */}
                    <td className="p-3">
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

                    {/* Created At */}
                    <td className="p-3 text-lg text-gray-900">
                      {new Date(topping.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditTopping(topping)}
                          className={`${
                            topping.status === "unavailable"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } text-blue-600 hover:text-blue-800`}
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
                          <span className="sr-only">Chuyển trạng thái bán</span>
                          <span
                            className={`${
                              topping.status === "available"
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                          />
                        </Switch>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mx-auto max-w-full p-6">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
          >
            Trang trước
          </button>

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

          <div className="flex items-center gap-4">
            <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
              Hiển thị {toppings.length} / {pagination.totalToppings} topping
              (Trang {pagination.currentPage} / {pagination.totalPages})
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
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

      {/* Confirm Delete Modal */}
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
