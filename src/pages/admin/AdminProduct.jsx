// Import các hook useEffect, useState, useRef từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Pencil,
  Eye,
  Trash2,
  Package,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  DollarSign,
  ListOrdered,
  ChevronDown,
  Square,
  CheckSquare,
  Settings,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import Swiper để tạo carousel ảnh
import "swiper/css"; // Import CSS của Swiper để hiển thị carousel ảnh
import "swiper/css/navigation"; // Import CSS navigation của Swiper (nếu có dùng navigation)
import { Autoplay } from "swiper/modules"; // Import module Autoplay từ Swiper để ảnh tự động chuyển
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide để tạo carousel ảnh sản phẩm

// Import stores quản lý trạng thái
import { useProductStore } from "../../store/productStore";
import { useCategoryStore } from "../../store/categoryStore";
import { useToppingStore } from "../../store/toppingStore";

// Import component
import Notification from "../../components/ui/Notification";
import AddProductModal from "../../components/features/admin/product/AddProductModal";
import EditProductModal from "../../components/features/admin/product/EditProductModal";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";
import ViewToppingsModal from "../../components/features/admin/product/ViewToppingsModal";
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
  { value: "", label: "Không sắp xếp" },
  {
    value: "price-asc",
    label: (
      <span className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" /> Giá tăng dần <SortAsc />
      </span>
    ),
  },
  {
    value: "price-desc",
    label: (
      <span className="flex items-center gap-2">
        <DollarSign className="w-4 h-4" /> Giá giảm dần <SortDesc />
      </span>
    ),
  },
];

// Tùy chọn số lượng mỗi trang
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

const AdminProduct = () => {
  const isInitLoaded = useRef(false);

  // Trạng thái của stores
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

  // Trạng thái cục bộ cho modal thêm/sửa
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Trạng thái editingProduct: Lưu thông tin sản phẩm đang được chỉnh sửa
  const [imagePreviews, setImagePreviews] = useState([]); // Trạng thái imagePreviews: Lưu danh sách URL ảnh để hiển thị preview trong modal

  //! Hàm xử lí thêm sản phẩm
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

  //! Hàm xử lí mở modal sửa sản phẩm
  const handleEditProduct = (productData) => {
    // Chuyển dữ liệu sản phẩm cho việc chỉnh sửa
    const editData = {
      ...productData,
      category: productData.category?.name || productData.category,
      basePrice: productData.price,
      image: Array.isArray(productData.images)
        ? productData.images
        : [productData.images].filter(Boolean),
    };

    setEditingProduct(editData);
    setImagePreviews(editData.images);
    setShowEditModal(true);
  };

  //! Hàm xử lí cập nhật sản phẩm
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

  //! Hàm xử lí thay đổi input ảnh để hiển thị preview
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

  // Modal xem topping
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [viewingToppings, setViewingToppings] = useState([]);

  //! Xử lý xem toppings
  const handleViewToppings = (toppings) => {
    setViewingToppings(toppings);
    setShowToppingModal(true);
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

  //! Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadProducts(newPage);
  };

  //! Hàm xử lý xóa mềm các sản phẩm được chọn
  const handleSoftDeleteSelectedProducts = async () => {
    if (!hasSelection) {
      Notification.warning("Vui lòng chọn ít nhất một sản phẩm để xóa");
      return;
    }

    // Mở modal xác nhận thay vì dùng window.confirm
    setShowBulkDeleteModal(true);
  };

  //! Xác nhận xóa bulk products
  const handleConfirmBulkDelete = async () => {
    try {
      const selectedProductIds = getSelectedItems();
      // Implement bulk soft delete logic here
      for (const productId of selectedProductIds) {
        await softDeleteProduct(productId);
      }

      Notification.success(`Đã thay đổi trạng thái ${selectedCount} sản phẩm`);
      clearSelection();
      setShowBulkDeleteModal(false);
      loadProducts(pagination.currentPage);
    } catch (error) {
      Notification.error("Thay đổi trạng thái thất bại", error.message);
    }
  };

  //! Hàm xử lý xóa mềm sản phẩm
  const handleSoftDeleteProduct = async (product) => {
    setDeleteModalConfig({
      type: "soft",
      productId: product._id,
      productName: product.name,
      action: "softDelete",
    });
    setShowDeleteModal(true);
  };

  //! Xác nhận xóa product
  const handleConfirmDelete = async () => {
    try {
      const { productId, action } = deleteModalConfig;

      if (action === "softDelete") {
        await softDeleteProduct(productId);
        Notification.success("Đã thay đổi trạng thái sản phẩm!");
      } else if (action === "hardDelete") {
        // await deleteProduct(productId);
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

  // Trạng thái bộ lọc và phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State cho dropdown filter
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // State cho bộ lọc thứ 2
  const [searchTerm2, setSearchTerm2] = useState("");
  const [statusFilter2, setStatusFilter2] = useState("all");
  const [categoryFilter2, setCategoryFilter2] = useState("all");
  const [sortOption2, setSortOption2] = useState("");
  const [itemsPerPage2, setItemsPerPage2] = useState(10);
  const [showFilter2, setShowFilter2] = useState(false);
  const filterRef2 = useRef(null);

  // State cho expand description
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  //! Xử lý expand/collapse description
  const toggleDescription = (productId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
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
  } = useTableCheckbox(products, "_id");

  //! Load initial data on component mount (với protection)
  useEffect(() => {
    if (!isInitLoaded.current) {
      console.log(" First load products - Using loadProductsInit");
      loadProductsInit(); // Gọi hàm loadProductsInit để tải danh sách sản phẩm với notification
      loadFormData(); // Load categories và toppings
      isInitLoaded.current = true;
    } else {
      console.log("⚠️ Prevented duplicate products load");
    }
  }, []); // Chỉ chạy 1 lần khi component mount

  //! Load products cho lần đầu (có notification)
  const loadProductsInit = async (page = 1) => {
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

      const result = await getAllProducts(params);
      if (result && result.products) {
        Notification.success(
          `Tải thành công ${result.products.length} sản phẩm.`
        );
      }
    } catch (error) {
      Notification.error("Lỗi tải danh sách sản phẩm", error.message);
    }
  };

  //! Load products với bộ lọc chính (không notification)
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

  //! Load categories and toppings for dropdowns
  const loadFormData = async () => {
    try {
      await Promise.all([
        getAllCategories({ status: "available" }),
        getAllToppings({ status: "available", 
          limit: 100, 
          page: 1  }),
      ]);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  //! Load products với bộ lọc thứ 2
  const loadProducts2 = async (page = 1) => {
    try {
      const params = {
        page,
        limit: itemsPerPage2,
        search: searchTerm2,
        status: statusFilter2,
        category: categoryFilter2,
        sortBy: getSortBy2(),
        sortOrder: getSortOrder2(),
      };

      await getAllProducts(params);
    } catch (error) {
      Notification.error(
        "Lỗi tải danh sách sản phẩm (Bộ lọc 2)",
        error.message
      );
    }
  };

  //! Thêm xử lý click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
      if (filterRef2.current && !filterRef2.current.contains(event.target)) {
        setShowFilter2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter, showFilter2]);

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

  //! Get sort configuration cho bộ lọc thứ 2
  const getSortBy2 = () => {
    if (!sortOption2) return "createdAt";
    if (sortOption2.includes("price")) return "price";
    if (sortOption2.includes("date")) return "createdAt";
    return "createdAt";
  };

  const getSortOrder2 = () => {
    if (!sortOption2) return "desc";
    return sortOption2.includes("asc") ? "asc" : "desc";
  };

  //! Handle filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, sortOption, itemsPerPage]);

  //! Handle filter changes cho bộ lọc thứ 2
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts2(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm2, statusFilter2, categoryFilter2, sortOption2, itemsPerPage2]);

  //! Xử lý chuyển trạng thái sản phẩm
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

  //! Hàm lấy ID danh mục từ tên danh mục
  const getCategoryIdByName = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?._id || categoryName;
  };

  //! Lấy các topping có trạng thái "available" để hiển thị trong form
  const availableToppings = toppings.filter(
    (topping) => topping.status === "available"
  );

  //! Lấy các danh mục có trạng thái "available" để hiển thị trong bộ lọc
  const availableCategories = categories.filter(
    (category) => category.status === "available"
  );

  //! Hiển thị thông báo lỗi khi có lỗi xảy ra trong store
  useEffect(() => {
    if (error) {
      Notification.error("Lỗi", error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <>
      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
          {/* Tiêu đề & Nút tác vụ */}
          <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
            {/* Tiêu đề */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách sản phẩm
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi tiến độ cửa hàng của bạn để tăng doanh số bán hàng.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-3">
              {/* Xóa sản phẩm */}
              {/* <div className="flex gap-2">
                <button
                  onClick={handleSoftDeleteSelectedProducts}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa sản phẩm đã chọn ({selectedCount})
                </button>
              </div> */}
              {/* Thêm sản phẩm */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2 font-semibold"
                disabled={isLoading}
              >
                <Package className="w-4 h-4" />
                Thêm sản phẩm
              </button>
             
            </div>
          </div>

          <SelectedItemsBanner
            selectedCount={selectedCount}
            itemType="sản phẩm"
            onClearSelection={clearSelection}
            onBulkDelete={handleSoftDeleteSelectedProducts}
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
                    placeholder="Tìm kiếm tên sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {/* Sắp xếp */}
                <Select
                  options={sortOptions}
                  defaultValue={sortOptions[0]} // "Không sắp xếp" default
                  value={sortOptions.find((opt) => opt.value === sortOption)}
                  onChange={(opt) => setSortOption(opt.value)}
                  placeholder="Chọn cách sắp xếp..."
                  className="min-w-[220px] z-10"
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

              {/* Phân trang & Lọc */}
              <div className="flex gap-3">
                {/* Phân trang */}
                <Select
                  options={itemsPerPageOptions}
                  defaultValue={itemsPerPageOptions[0]} // Mặc định là 10 sản phẩm một trang
                  value={itemsPerPageOptions.find(
                    (opt) => opt.value === itemsPerPage
                  )}
                  onChange={(opt) => {
                    setItemsPerPage(opt.value);
                    setCurrentPage(1); // Reset về trang 1
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

                {/* Lọc */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] "
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    Lọc
                  </button>
                  {showFilter && (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                      <div className="mb-5">
                        <label className="mb-2 block text-xs font-medium text-green_starbuck">
                          Danh mục
                        </label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-green_starbuck focus:border-transparent"
                        >
                          <option value="all">Tất cả danh mục</option>
                          {availableCategories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-5">
                        <label className="mb-2 block text-xs font-medium text-green_starbuck">
                          Trạng thái
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-green_starbuck focus:border-transparent"
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="available">Đang bán</option>
                          <option value="unavailable">Ngừng bán</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái tải */}
          {isLoading && products.length === 0 && (
            <LoadingSpinner message="Đang tải danh sách sản phẩm..." />
          )}

          {/* Bảng sản phẩm */}
          <div className="overflow-x-auto">
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {products.length === 0 && !isLoading ? (
              <p className="text-center text-gray-600 text-lg py-8">
                {searchTerm
                  ? "Sản phẩm bạn tìm kiếm không tồn tại"
                  : "Chưa có sản phẩm nào"}
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
                      Sản phẩm
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Ngày tạo
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Mô tả
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Danh mục
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Kích cỡ : Giá
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Topping
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Trạng thái
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
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 text-center transition-colors ${
                        isItemSelected(product._id)
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      {/* Hiển thị tickbox từng sản phẩm */}
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectItem(product._id)}
                          className="flex items-center justify-center w-full"
                        >
                          {isItemSelected(product._id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      {/* Hiển thị ảnh sản phẩm */}
                      <td className="p-3 flex items-center space-x-3">
                        <div className="w-12 h-12">
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
                        <span className="text-start text-sm font-semibold text-camel">
                          {product.name || "Không có tên"}
                        </span>
                      </td>
                      {/* Hiển thị ngày */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(product.createdAt)}
                      </td>
                      {/* Hiển thị mô tả sản phẩm */}
                      <td className="p-3 text-md text-start text-gray-900 max-w-xs">
                        <div>
                          <div
                            className={
                              expandedDescriptions.has(product._id)
                                ? ""
                                : "line-clamp-2"
                            }
                          >
                            {product.description || "Không có mô tả"}
                          </div>
                          {product.description &&
                            product.description.length > 100 && (
                              <button
                                onClick={() => toggleDescription(product._id)}
                                className="text-blue-600 hover:underline text-sm mt-1"
                              >
                                {expandedDescriptions.has(product._id)
                                  ? "Thu gọn"
                                  : "Xem thêm"}
                              </button>
                            )}
                        </div>
                      </td>
                      {/* Hiển thị danh mục sản phẩm */}
                      <td className="p-3 text-md text-start text-gray-900">
                        {product.category?.name || "Không có danh mục"}{" "}
                      </td>
                      {/* Hiển thị kích cỡ & giá sản phẩm */}
                      <td className="p-2 text-lg text-gray-900 text-start">
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
                          <span className="text-gray-500">
                            Không có kích cỡ
                          </span>
                        )}
                      </td>
                      {/* Hiển thị topping sản phẩm */}
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
                      {/* Hiển thị trạng thái sản phẩm */}
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
                      {/* Nhóm các nút hành động */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
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
            label="sản phẩm"
            currentItemsCount={products.length}
            totalItemsKey="totalProducts"
          />
        </div>
      </div>

      {/* Modal thêm sản phẩm */}
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

      {/* Modal sửa sản phẩm */}
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

      {/* Modal xem Topping */}
      {showToppingModal && (
        <ViewToppingsModal
          toppings={viewingToppings}
          onClose={() => setShowToppingModal(false)}
        />
      )}

      {/* Modal xác nhận xóa bulk */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isLoading}
        selectedCount={selectedCount}
        itemType="sản phẩm"
        confirmText="Xác nhận"
        title="Xác nhận thay đổi trạng thái"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái ${selectedCount} sản phẩm được chọn không?`}
        warningText="Hành động này có thể được hoàn tác sau."
      />

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

export default AdminProduct;
