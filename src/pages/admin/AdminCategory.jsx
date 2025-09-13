import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Tags, Search } from "lucide-react";
import { Switch } from "@headlessui/react";

// Stores
import { useCategoryStore } from "../../store/categoryStore";
import { useAuthStore } from "../../store/authStore";

// Components
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";
import AddCategoryModal from "../../components/Admin/Category/AddCategoryModal";
import EditCategoryModal from "../../components/Admin/Category/EditCategoryModal";
import ConfirmDeleteModal from "../../components/Admin/ConfirmDeleteModal";

const AdminCategory = () => {
  const navigate = useNavigate();
  const isInitLoaded = useRef(false);

  //! Category store
  const {
    categories,
    isLoading,
    pagination,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    softDeleteCategory,
    clearError,
    syncCategoriesWithProducts,
  } = useCategoryStore();

  //! Auth store
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  //! Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  //! Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    categoryId: null,
    categoryName: "",
    action: null,
  });

  //! Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  //! Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //! Load categories
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

      const result = await getAllCategories(params);

      if (result && result.categories) {
        Notification.success(
          `Tải thành công ${result.categories.length} danh mục.`
        );
      }
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách danh mục",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };
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

      const result = await getAllCategories(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách danh mục",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Handle add category
  const handleAddCategory = async (categoryData) => {
    try {
      await createCategory(categoryData);
      setShowAddModal(false);
      Notification.success("Thêm danh mục thành công!");
      loadCategories(pagination.currentPage);
    } catch (error) {
      Notification.error("Thêm danh mục thất bại", error.message);
    }
  };

  //! Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  //! Handle update category
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

  //! Handle hard delete category (mở modal xác nhận xóa vĩnh viễn)
  const handleDeleteCategory = (category) => {
    setDeleteModalConfig({
      type: "hard",
      categoryId: category._id,
      categoryName: category.name,
      action: "hardDelete",
    });
    setShowDeleteModal(true);
  };

  //! Handle soft delete category (mở modal xác nhận chuyển trạng thái)
  const handleSoftDeleteCategory = (category) => {
    setDeleteModalConfig({
      type: "soft",
      categoryId: category._id,
      categoryName: category.name,
      action: "softDelete",
    });
    setShowDeleteModal(true);
  };

  //! Confirm delete action
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

      // Close modal and reload
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

  //! Close delete modal
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

  //! Handle sync categories with products
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

  //! Handle toggle topping status
  const handleToggleStatus = async (category) => {
    try {
      handleSoftDeleteCategory(category);
    } catch (error) {
      Notification.error("Cập nhật trạng thái thất bại", error.message);
    }
  };

  //! Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadCategories(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  //! Handle pagination
  const handlePageChange = (newPage) => {
    loadCategories(newPage);
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
      loadCategoriesInit(1);
    }
  }, [isCheckingAuth, isAuthenticated, user, navigate]);

  //! Loading state
  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải danh mục...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="font-roboto max-w-full mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 bg-camel/10 rounded-lg py-4 px-6">
          <Tags className="w-8 h-8 text-camel" strokeWidth={2} />
          <h1 className="font-montserrat text-2xl font-semibold text-dark_blue capitalize tracking-tight pb-2 border-b-2 border-camel inline-block">
            Quản lý danh mục
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
              Thêm Danh mục
            </button>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tên danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Đang sử dụng</option>
              <option value="unavailable">Ngừng sử dụng</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setItemsPerPage(newLimit);
                loadCategories(1, newLimit);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 danh mục / trang</option>
              <option value="10">10 danh mục / trang</option>
              <option value="15">15 danh mục / trang</option>
            </select>
          </div>
        </div>

        {/* Categories table */}
        <div className="overflow-x-auto rounded-md">
          {categories.length === 0 ? (
            <p className="text-center text-gray-600 text-lg py-8">
              {searchTerm ? "Không tìm thấy danh mục nào" : "Chưa có danh mục"}
            </p>
          ) : (
            <table className="min-w-full border-2 divide-y divide-gray-200">
              <thead className="bg-green_starbuck">
                <tr className="text-center">
                  <th className="p-3 text-lg font-semibold text-white text-left">
                    Tên Danh mục
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
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 text-center"
                  >
                    {/* Name */}
                    <td className="p-3 text-dark_blue font-semibold text-left">
                      {category.name}
                    </td>

                    {/* Description */}
                    <td className="p-3 text-lg text-gray-900 text-left">
                      {category.description || "Không có mô tả"}
                    </td>

                    {/* Status */}
                    <td className="p-3">
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
                    </td>

                    {/* Created At */}
                    <td className="p-3 text-lg text-gray-900">
                      {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <Switch
                          checked={category.status === "available"}
                          onChange={() => handleToggleStatus(category)}
                          className={`${
                            category.status === "available"
                              ? "bg-green-500"
                              : "bg-red-400"
                          } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                        >
                          <span className="sr-only">Chuyển trạng thái bán</span>
                          <span
                            className={`${
                              category.status === "available"
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                          />
                        </Switch>

                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                          title="Thay đổi trạng thái"
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

          {/* Result Info */}
          <div className="flex items-center gap-4">
            <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
              Hiển thị {categories.length} / {pagination.totalCategories} danh
              mục (Trang {pagination.currentPage} / {pagination.totalPages})
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
        <AddCategoryModal
          onAdd={handleAddCategory}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
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

export default AdminCategory;
