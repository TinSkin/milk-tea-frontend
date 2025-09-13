// Import hook useNavigate từ react-router-dom để điều hướng trang
import { useNavigate } from "react-router-dom";

// Import hook useEffect và useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState } from "react";

// Import các icon Pencil, Eye, Trash2 từ thư viện lucide-react để dùng trong giao diện
import { Pencil, Eye, Package, Search } from "lucide-react";
import { Switch } from "@headlessui/react";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Swiper
import "swiper/css"; // Import CSS của Swiper để hiển thị carousel ảnh
import "swiper/css/navigation"; // Import CSS navigation của Swiper (nếu có dùng navigation)
import { Autoplay } from "swiper/modules"; // Import module Autoplay từ Swiper để ảnh tự động chuyển
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide để tạo carousel ảnh sản phẩm

// Import hàm fetchProducts từ productAPI để lấy danh sách sản phẩm từ server
import { useProductStore } from "../../store/productStore";
import { useAuthStore } from "../../store/authStore";
import { useCategoryStore } from "../../store/categoryStore";
import { useToppingStore } from "../../store/toppingStore";

// Import Schema
import { addProductSchema } from "../../utils/addProductSchema";
import { editProductSchema } from "../../utils/editProductSchema";

// Import component
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";
import AddProductModal from "../../components/Admin/Product/AddProductModal";
import EditProductModal from "../../components/Admin/Product/EditProductModal";
import ConfirmDeleteModal from "../../components/Admin/ConfirmDeleteModal";
import ViewToppingsModal from "../../components/Admin/Product/ViewToppingsModal";

const AdminProduct = () => {
  // Khởi tạo hook useNavigate để điều hướng trang
  const navigate = useNavigate();

  //! Store states
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
  const {
    products,
    isLoading,
    pagination,
    error,
    getAllProducts,
    createProduct,
    updateProduct,
    softDeleteProduct,
    clearError,
  } = useProductStore();
  const { categories, getAllCategories } = useCategoryStore();
  const { toppings, getAllToppings } = useToppingStore();

  // Local state for UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Trạng thái editingProduct: Lưu thông tin sản phẩm đang được chỉnh sửa
  const [imagePreviews, setImagePreviews] = useState([]); // Trạng thái imagePreviews: Lưu danh sách URL ảnh để hiển thị preview trong modal

  //! View topping modal
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [viewingToppings, setViewingToppings] = useState([]);

  //! Handle view toppings
  const handleViewToppings = (toppings) => {
    setViewingToppings(toppings);
    setShowToppingModal(true);
  };

  //! Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    categoryId: null,
    categoryName: "",
    action: null,
  });

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //! Load initial data
  useEffect(() => {
    loadProducts();
    loadFormData();
  }, []);

  //! Load products with current filters
  const loadProducts = async (page = 1) => {
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sortBy: getSortBy(),
        sortOrder: getSortOrder(),
      };

      await getAllProducts(params);
    } catch (error) {
      Notification.error("Lỗi tải danh sách sản phẩm", error.message);
    }
  };

  // Hàm parseCustomDate: Chuyển đổi định dạng ngày tháng dạng "15, thg 10, 2024" thành Date object để sắp xếp
  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      // Kiểm tra nếu dateStr không tồn tại hoặc không phải string
      return new Date(0); // Trả về ngày mặc định (1/1/1970) nếu lỗi
    }
    if (dateStr.includes("thg")) {
      // Kiểm tra nếu chuỗi ngày có định dạng tiếng Việt (chứa "thg")
      const months = {
        // Định nghĩa object ánh xạ tháng tiếng Việt sang tiếng Anh
        "thg 1": "Jan",
        "thg 2": "Feb",
        "thg 3": "Mar",
        "thg 4": "Apr",
        "thg 5": "May",
        "thg 6": "Jun",
        "thg 7": "Jul",
        "thg 8": "Aug",
        "thg 9": "Sep",
        "thg 10": "Oct",
        "thg 11": "Nov",
        "thg 12": "Dec",
      };
      const [day, month, year] = dateStr.split(", "); // Tách chuỗi ngày thành ngày, tháng, năm
      if (!day || !month || !year) {
        // Kiểm tra nếu không tách được đầy đủ
        return new Date(0); // Trả về ngày mặc định nếu lỗi
      }
      const monthKey = month.toLowerCase(); // Chuyển tháng về chữ thường để ánh xạ
      const engDateStr = `${day.replace(/\D/g, "")} ${
        months[monthKey]
      } ${year}`; // Tạo chuỗi ngày dạng tiếng Anh: "15 Jan 2024"
      return new Date(engDateStr) || new Date(0); // Chuyển thành Date object, trả về ngày mặc định nếu lỗi
    }
    return new Date(dateStr) || new Date(0); // Nếu không phải định dạng tiếng Việt, thử chuyển trực tiếp thành Date, trả về ngày mặc định nếu lỗi
  };

  //! Handle delete all products (soft delete all)
  const handleSoftDeleteAllProducts = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn thay đổi trạng thái tất cả sản phẩm?"
      )
    ) {
      try {
        // This would need a bulk operation endpoint
        for (const product of products) {
          if (product.status === "available") {
            await softDeleteProduct(product._id);
          }
        }

        Notification.success("Cập nhật trạng thái tất cả sản phẩm thành công!");
        loadProducts(pagination.currentPage);
      } catch (error) {
        Notification.error("Cập nhật trạng thái thất bại", error.message);
      }
    }
  };

  //! Load categories and toppings for dropdowns
  const loadFormData = async () => {
    try {
      await Promise.all([
        getAllCategories({ status: "available" }),
        getAllToppings({ status: "available" }),
      ]);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  //! Handle image preview
  const handleImageInputChange = (e) => {
    const value = e.target.value;
    if (value.trim()) {
      const urls = value
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
      setImagePreviews(urls);
    } else {
      setImagePreviews([]);
    }
  };

  //! Handle add product
  const handleAddProduct = async (productData) => {
    console.log("Adding product with data:", productData);
    try {
      // Transform data to match backend schema
      const transformedData = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        category: getCategoryIdByName(productData.category),
        images: Array.isArray(productData.images)
          ? productData.images
          : productData.images
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url),
        price: parseFloat(productData.price),
        sizeOptions: productData.sizeOptions.map((opt) => ({
          size: opt.size,
          price: parseFloat(opt.price),
        })),
        toppings: Array.isArray(productData.toppings)
          ? productData.toppings.map((topping) =>
              typeof topping === "object" ? topping._id : topping
            )
          : [],
        status: "available",
      };

      console.log("Transformed data:", transformedData);
      await createProduct(transformedData);

      setShowAddModal(false);
      setImagePreviews([]);
      Notification.success("Thêm sản phẩm thành công!");

      // Reload current page
      loadProducts(pagination.currentPage);
    } catch (error) {
      Notification.error("Thêm sản phẩm thất bại", error.message);
    }
  };

  //! Handle edit product
  const handleEditProduct = (productData) => {
    // Transform product data for editing
    const editData = {
      ...productData,
      category: productData.category?.name || product.category,
      basePrice: productData.price,
      image: Array.isArray(productData.images)
        ? productData.images
        : [productData.images].filter(Boolean),
    };

    setEditingProduct(editData);
    setImagePreviews(editData.images);
    setShowEditModal(true);
  };

  //! Handle update product
  const handleUpdateProduct = async (productData) => {
    console.log("Updating product with data:", productData);
    try {
      // Transform data to match backend schema
      const transformedData = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        category: getCategoryIdByName(productData.category),
        images: Array.isArray(productData.images)
          ? productData.images
          : productData.images
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url),
        price: parseFloat(productData.price),
        sizeOptions: productData.sizeOptions.map((opt) => ({
          size: opt.size,
          price: parseFloat(opt.price),
        })),
        toppings: Array.isArray(productData.toppings)
          ? productData.toppings.map((topping) =>
              typeof topping === "object" ? topping._id : topping
            )
          : [],
      };

      console.log("Transformed data:", transformedData);
      await updateProduct(editingProduct._id, transformedData);

      setShowEditModal(false);
      setEditingProduct(null);
      setImagePreviews([]);
      Notification.success("Cập nhật sản phẩm thành công!");

      // Reload current page
      loadProducts(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật sản phẩm thất bại", error.message);
    }
  };

  //! Get sort configuration
  const getSortBy = () => {
    if (!sortOption) return "createdAt";
    if (sortOption.includes("price")) return "price";
    if (sortOption.includes("date")) return "createdAt";
    return "createdAt";
  };

  const getSortOrder = () => {
    if (!sortOption) return "desc";
    return sortOption.includes("asc") ? "asc" : "desc";
  };

  //! Handle filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, sortOption, itemsPerPage]);

  //! Handle pagination
  const handlePageChange = (page) => {
    loadProducts(page);
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

  //! Handle soft delete product
  const handleSoftDeleteProduct = async (product) => {
    setDeleteModalConfig({
      type: "soft",
      productId: product._id,
      productName: product.name,
      action: "softDelete",
    });
    setShowDeleteModal(true);
  };

  //! Confirm delete action
  const handleConfirmDelete = async () => {
    try {
      const { productId, action } = deleteModalConfig;

      if (action === "softDelete") {
        await softDeleteProduct(productId);
        Notification.success("Đã thay đổi trạng thái sản phẩm!");
      } else if (action === "hardDelete") {
        await deleteProduct(productId);
        Notification.success("Đã xóa sản phẩm vĩnh viễn!");
      }

      // Close modal and reload
      setShowDeleteModal(false);
      setDeleteModalConfig({
        type: "soft",
        categoryId: null,
        categoryName: "",
        action: null,
      });
      loadProducts(pagination.currentPage);
    } catch (error) {
      const errorMsg =
        deleteModalConfig.action === "softDelete"
          ? "Thay đổi trạng thái thất bại"
          : "Xóa sản phẩm thất bại";
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

  //! Handle toggle topping status
  const handleToggleStatus = async (product) => {
    try {
      // Kiểm tra category tồn tại
      if (!product.category || !product.category._id) {
        Notification.error("Sản phẩm chưa có danh mục!");
        return;
      }

      // Tìm category trong danh sách categories
      const category = categories.find(
        (cat) => cat._id === product.category._id
      );

      // Kiểm tra category có tồn tại và đang hoạt động
      if (!category || category.status !== "available") {
        Notification.error(
          "Danh mục của sản phẩm đang ngừng hoạt động hoặc đã bị xóa. Không thể chuyển trạng thái sản phẩm sang 'Đang bán'!"
        );
        return;
      }

      if (product.status === "unavailable") {
        // Chuyển sang đang bán
        await updateProduct(product._id, { status: "available" });
        Notification.success("Đã chuyển trạng thái sản phẩm sang 'Đang bán'!");
        loadProducts(pagination.currentPage);
      } else {
        // Chuyển sang ngừng bán (mở modal xác nhận)
        handleSoftDeleteProduct(product);
      }

      // handleSoftDeleteProduct(product);
    } catch (error) {
      Notification.error("Cập nhật trạng thái thất bại", error.message);
    }
  };

  //! Helper function to get category ID by name
  const getCategoryIdByName = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?._id || categoryName;
  };

  //! Get available toppings for form
  const availableToppings = toppings.filter(
    (topping) => topping.status === "available"
  );

  //! Get available categories for filter
  const availableCategories = categories.filter(
    (category) => category.status === "available"
  );

  //! Handle errors
  useEffect(() => {
    if (error) {
      Notification.error("Lỗi", error);
      clearError();
    }
  }, [error, clearError]);

  //! Checking log in & loading products
  useEffect(() => {
    // Wait for auth check to complete
    if (isCheckingAuth) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    loadProducts(); // Gọi hàm loadProducts để tải danh sách sản phẩm
  }, [isCheckingAuth, isAuthenticated, user, navigate]); // Chạy lại khi navigate thay đổi

  //! Render pagination numbers
  const renderPaginationNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Show max 5 page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded font-semibold ${
            currentPage === i
              ? "bg-green_starbuck text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <>
      <Header />
      <div className="font-roboto max-w-full mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 bg-camel/10 rounded-lg py-4 px-6">
          <Package className="w-8 h-8 text-camel" strokeWidth={2} />
          <h1 className="font-montserrat text-2xl font-semibold text-dark_blue capitalize tracking-tight pb-2 border-b-2 border-camel inline-block">
            Quản lý sản phẩm
          </h1>
        </div>
        {/* Container chính */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          {/* Container cho các nút và bộ lọc */}
          <div className="flex gap-4">
            {/* Nhóm nút Soft Delete All và Add New */}
            <button
              onClick={handleSoftDeleteAllProducts} // Gọi hàm soft delete tất cả
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
              disabled={isLoading || products.length === 0} // Vô hiệu hóa khi đang loading
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                "🗑 Delete All"
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)} // Mở modal thêm sản phẩm
              className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2"
              disabled={isLoading}
            >
              + Add New
            </button>
            {/* Nhóm các bộ lọc và sắp xếp */}
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {/* Dropdown lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Đang bán</option>
              <option value="unavailable">Ngừng bán</option>
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {availableCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* Dropdown sắp xếp */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Không sắp xếp</option>
              <option value="price-asc">Giá: Tăng dần</option>
              <option value="price-desc">Giá: Giảm dần</option>
              <option value="date-asc">Ngày: Cũ nhất</option>
              <option value="date-desc">Ngày: Mới nhất</option>
            </select>
            {/* Dropdown chọn số sản phẩm mỗi trang */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 sản phẩm / trang</option>
              <option value="10">10 sản phẩm / trang</option>
              <option value="15">15 sản phẩm / trang</option>
              <option value="20">20 sản phẩm / trang</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && products.length === 0 && (
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
              Đang tải sản phẩm...
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="overflow-x-auto rounded-md">
          {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
          {products.length === 0 && !isLoading ? (
            <p className="text-center text-gray-600 text-lg py-8">
              {searchTerm
                ? "Sản phẩm bạn tìm kiếm không tồn tại"
                : "Chưa có sản phẩm nào"}
            </p>
          ) : (
            <table className="min-w-full border-2 divide-y divide-gray-200">
              {/* Bảng hiển thị sản phẩm */}
              <thead className="bg-green_starbuck">
                {/* Phần tiêu đề bảng */}
                <tr className="text-center">
                  <th className="p-3 text-lg font-semibold text-white">Ảnh</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Tên sản phẩm
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Ngày tạo
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Mô tả
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Danh mục
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">Giá</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Kích cỡ
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Topping
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Trạng thái
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Phần thân bảng */}
                {products.map(
                  (
                    product // Duyệt qua danh sách sản phẩm hiển thị
                  ) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 text-center"
                    >
                      {/* IMAGE */}
                      <td className="p-3 flex items-center space-x-3">
                        <div className="w-[150px] h-[150px]">
                          {/* Container ảnh */}
                          {product.images && product.images.length > 0 ? (
                            <Swiper
                              modules={[Autoplay]}
                              autoplay={{
                                delay: 2000,
                                disableOnInteraction: false,
                              }}
                              loop={product.images.length > 1}
                              className="rounded-md overflow-hidden h-full"
                            >
                              {product.images.map((img, idx) => (
                                <SwiperSlide key={idx}>
                                  <img
                                    src={img}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/150?text=No+Image";
                                    }}
                                  />
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                              <span className="text-gray-500">No Image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* NAME */}
                      <td className="p-3 font-bold text-camel text-lg text-left min-w-[200px]">
                        {product.name || "N/A"} {/* Hiển thị tên sản phẩm */}
                      </td>
                      {/* DATE */}
                      <td className="p-3 text-lg text-dark_blue">
                        {new Date(product.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        {/* Hiển thị ngày */}
                      </td>
                      {/* DESCRIPTION */}
                      <td className="p-3 text-lg text-gray-900">
                        {product.description || "N/A"}
                        {/* Hiển thị mô tả sản phẩm */}
                      </td>
                      {/* CATEGORY */}
                      <td className="p-3 text-lg text-gray-900">
                        {product.category?.name || "N/A"}{" "}
                        {/* Hiển thị danh mục sản phẩm */}
                      </td>
                      {/* PRICE */}
                      <td className="p-2 text-lg font-semibold text-orange-600">
                        {product.price?.toLocaleString("vi-VN")}₫
                      </td>
                      {/* SIZE */}
                      <td className="p-2 text-lg text-gray-900">
                        {Array.isArray(product.sizeOptions) &&
                        product.sizeOptions.length > 0 ? (
                          product.sizeOptions.map((option, index) => (
                            <div
                              key={index}
                              className="inline-block mx-1 px-2 py-1 bg-dark_blue mt-1 rounded text-left"
                            >
                              <span className="text-white font-semibold">
                                {option.size}:{" "}
                              </span>
                              <span className="text-white">
                                {option.price?.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">No sizes</span>
                        )}
                      </td>
                      {/* TOPPING */}
                      <td className="p-2 text-lg text-gray-900 text-center">
                        {Array.isArray(product.toppings) &&
                        product.toppings.length > 0 ? (
                          <button
                            className="flex items-center justify-center mx-auto p-2 rounded hover:bg-blue-50 transition"
                            title={`Xem ${product.toppings.length} topping`}
                            onClick={() => handleViewToppings(product.toppings)}
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                        ) : (
                          <span className="text-gray-500">
                            Không có topping
                          </span>
                        )}
                      </td>
                      {/* STATUS */}
                      <td className="p-3 min-w-[140px]">
                        <span
                          className={`px-2 py-1 text-md rounded font-semibold ${
                            product.status === "available"
                              ? "text-green-700 bg-green-100"
                              : "text-red-700 bg-red-100"
                          }`}
                        >
                          {product.status === "available"
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                      </td>
                      {/* ACTION */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Nhóm các nút hành động */}
                          <Pencil
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                            onClick={() => handleEditProduct(product)} // Gọi hàm chỉnh sửa
                            disabled={product.status === "unavailable"}
                            style={{
                              cursor:
                                product.status === "unavailable"
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                product.status === "unavailable" ? 0.5 : 1,
                            }}
                          />
                          <Switch
                            checked={product.status === "available"}
                            onChange={() => handleToggleStatus(product)}
                            className={`${
                              product.status === "available"
                                ? "bg-green-500"
                                : "bg-red-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                          >
                            <span className="sr-only">
                              Chuyển trạng thái bán
                            </span>
                            <span
                              className={`${
                                product.status === "available"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                          </Switch>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevPage}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
            >
              Trang trước
            </button>

            {/* Pagination Numbers */}
            <div className="flex gap-2">{renderPaginationNumbers()}</div>

            {/* Result Info */}
            <div className="flex items-center gap-4">
              <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
                Hiển thị {categories.length} / {pagination.totalCategories} danh
                mục (Trang {pagination.currentPage} / {pagination.totalPages})
              </div>
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Add Product Modal*/}
      {showAddModal && (
        <AddProductModal
          onAdd={handleAddProduct}
          onClose={() => {
            setShowAddModal(false);
            setImagePreviews([]);
          }}
          isLoading={isLoading}
          imagePreviews={imagePreviews}
          handleImageInputChange={handleImageInputChange}
          availableToppings={availableToppings}
          availableCategories={availableCategories}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <EditProductModal
          editingProduct={editingProduct}
          onUpdate={handleUpdateProduct}
          onClose={() => {
            setShowEditModal(false);
            setImagePreviews([]);
            setEditingProduct(null);
          }}
          isLoading={isLoading}
          imagePreviews={imagePreviews}
          handleImageInputChange={handleImageInputChange}
          availableToppings={availableToppings}
          availableCategories={availableCategories}
        />
      )}

      {/* View Topping Modal */}
      {showToppingModal && (
        <ViewToppingsModal
          toppings={viewingToppings}
          onClose={() => setShowToppingModal(false)}
        />
      )}

      {/* Confirm Delete Modal */}
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

export default AdminProduct;
