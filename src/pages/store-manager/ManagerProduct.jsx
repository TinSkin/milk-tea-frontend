// Import các hook useEffect, useState, useRef từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon từ thư viện lucide-react để dùng trong giao diện
import {
  Pencil,
  Eye,
  Package,
  SortAsc,
  SortDesc,
  DollarSign,
  ListOrdered,
  Search,
  MapPin,
  Store,
  Settings,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import Swiper để tạo carousel ảnh
import "swiper/css"; // Import CSS của Swiper để hiển thị carousel ảnh
import "swiper/css/navigation"; // Import CSS navigation của Swiper (nếu có dùng navigation)
import { Autoplay } from "swiper/modules"; // Import module Autoplay từ Swiper để ảnh tự động chuyển
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide để tạo carousel ảnh sản phẩm

// Import store cần thiết cho Store Manager
import { useStoreSelectionStore } from "../../store/storeSelectionStore";

// Import các component cần thiết
import Notification from "../../components/ui/Notification";
import AddProductModal from "../../components/features/admin/product/AddProductModal";
import EditProductModal from "../../components/features/admin/product/EditProductModal";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";
import ViewToppingsModal from "../../components/features/admin/product/ViewToppingsModal";

// Import utilities và hooks
import { formatNiceDate } from "../../utils/helpers/dateFormatter";
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";

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

const ManagerProduct = () => {
  // State của cửa hàng được chọn và các hàm load products, categories từ storeSelectionStore
  const {
    selectedStore,
    loadStoreProducts,
    loadStoreCategories,
    isLoading: storeLoading,
  } = useStoreSelectionStore();

  // State local cho sản phẩm của cửa hàng này
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // State local cho giao diện
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // State editingProduct: Lưu thông tin sản phẩm đang được chỉnh sửa
  const [imagePreviews, setImagePreviews] = useState([]); // State imagePreviews: Lưu danh sách URL ảnh để hiển thị preview trong modal

  //! Modal xem topping
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [viewingToppings, setViewingToppings] = useState([]);

  //! Xử lý xem toppings
  const handleViewToppings = (toppings) => {
    setViewingToppings(toppings);
    setShowToppingModal(true);
  };

  //! State cho modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    type: "soft",
    categoryId: null,
    categoryName: "",
    action: null,
  });

  // State cho lọc và phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State cho dropdown filter
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // State cho expand description
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

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

  //! Xử lý expand/collapse description
  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  //! Thêm xử lý click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  //! Tải dữ liệu ban đầu
  useEffect(() => {
    if (selectedStore?._id) {
      loadProducts();
      loadFormData();
    }
  }, [selectedStore?._id]); // Tải lại khi store thay đổi

  //! Tải lại products khi filter thay đổi
  useEffect(() => {
    if (selectedStore?._id) {
      loadProducts(1);
    }
  }, [searchTerm, statusFilter, categoryFilter, sortOption, itemsPerPage]);

  //! Tải products với filter hiện tại
  const loadProducts = async (page = 1) => {
    try {
      if (!selectedStore?._id) {
        console.warn("No store selected for manager");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Sử dụng loadStoreProducts thay vì getAllProducts
      const response = await loadStoreProducts(
        selectedStore._id,
        page,
        itemsPerPage,
        searchTerm,
        categoryFilter === "all" ? "" : categoryFilter,
        getSortBy(),
        getSortOrder()
      );

      setProducts(response.products || []);
      setPagination(response.pagination || {});
      setIsLoading(false);

      // Clear selection khi load products mới
      clearSelection();
    } catch (error) {
      setError(error.message || "Lỗi tải danh sách sản phẩm");
      setIsLoading(false);
      Notification.error("Lỗi tải danh sách sản phẩm", error.message);
    }
  };

  //! Hàm xử lý xóa mềm các sản phẩm được chọn
  const handleSoftDeleteSelectedProducts = async () => {
    if (selectedCount === 0) {
      Notification.warning("Vui lòng chọn ít nhất một sản phẩm để thực hiện!");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn thay đổi trạng thái ${selectedCount} sản phẩm được chọn?`
      )
    ) {
      try {
        const selectedProducts = getSelectedItems();
        for (const product of selectedProducts) {
          if (product.status === "available") {
            await softDeleteProduct(product._id);
          }
        }

        Notification.success(
          `Cập nhật trạng thái ${selectedCount} sản phẩm thành công!`
        );
        clearSelection();
        loadProducts(pagination.currentPage);
      } catch (error) {
        Notification.error("Cập nhật trạng thái thất bại", error.message);
      }
    }
  };

  //! Tải categories và toppings cho dropdown (theo cửa hàng)
  const loadFormData = async () => {
    try {
      if (!selectedStore?._id) {
        console.warn("No store selected for loading form data");
        return;
      }

      // Load store-specific categories
      const categoriesResponse = await loadStoreCategories(selectedStore._id);
      setCategories(categoriesResponse.categories || []);

      // TODO: Triển khai loadStoreToppings khi có sẵn
      // const toppingsResponse = await loadStoreToppings(selectedStore._id);
      // setToppings(toppingsResponse.toppings || []);

      console.log("Form data loaded for store:", selectedStore.storeName);
    } catch (error) {
      console.error("Error loading form data:", error);
      setError("Lỗi tải dữ liệu form");
    }
  };

  //! Xử lý preview ảnh
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

  //! Xử lý thêm sản phẩm
  const handleAddProduct = async (productData) => {
    console.log("Adding product with data:", productData);
    try {
      // Biến đổi dữ liệu để phù hợp với schema backend
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

      // Tải lại trang hiện tại
      loadProducts(pagination.currentPage);
    } catch (error) {
      Notification.error("Thêm sản phẩm thất bại", error.message);
    }
  };

  //! Xử lý chỉnh sửa sản phẩm
  const handleEditProduct = (productData) => {
    // Biến đổi dữ liệu sản phẩm để chỉnh sửa
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

  //! Xử lý cập nhật sản phẩm
  const handleUpdateProduct = async (productData) => {
    console.log("Updating product with data:", productData);
    try {
      // Biến đổi dữ liệu để phù hợp với schema backend
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

      // Tải lại trang hiện tại
      loadProducts(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật sản phẩm thất bại", error.message);
    }
  };

  //! Lấy cấu hình sắp xếp
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

  //! Xử lý thay đổi filter
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, sortOption, itemsPerPage]);

  //! Xử lý phân trang
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

  //! Xử lý xóa mềm sản phẩm
  const handleSoftDeleteProduct = async (product) => {
    setDeleteModalConfig({
      type: "soft",
      productId: product._id,
      productName: product.name,
      action: "softDelete",
    });
    setShowDeleteModal(true);
  };

  //! Xác nhận thao tác xóa
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

      // Đóng modal và tải lại
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

  //! Đóng modal xóa
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

  //! Xử lý chuyển đổi trạng thái
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

  //! Hàm hỗ trợ lấy ID danh mục theo tên
  const getCategoryIdByName = (categoryName) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?._id || categoryName;
  };

  //! Lấy toppings có sẵn cho form
  const availableToppings = toppings.filter(
    (topping) => topping.status === "available"
  );

  //! Lấy categories có sẵn cho filter
  const availableCategories = categories.filter(
    (category) => category.status === "available"
  );

  //! Xử lý lỗi
  useEffect(() => {
    if (error) {
      Notification.error("Lỗi", error);
      // Xóa lỗi sau khi hiển thị thông báo
      const timer = setTimeout(() => {
        setError(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error]);

  //! Tải dữ liệu ban đầu và products
  useEffect(() => {
    loadProducts(); // Gọi hàm loadProducts để tải danh sách sản phẩm
  }, []);

  //! Hiển thị số trang phân trang
  const renderPaginationNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Hiển thị tối đa 5 số trang
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
      {/* Thông tin cửa hàng */}
      {selectedStore && (
        <div className="bg-green_starbuck/80 text-white px-5 py-4 shadow-md -mt-6 -mx-6 mb-6">
          <div className="max-w-[110rem] mx-auto flex">
            {/* Title */}
            <div className="flex items-center gap-3 flex-1 pl-3">
              <Package className="w-5 h-5" />
              <h1 className="text-md font-montserrat font-semibold capitalize tracking-tight pb-1 border-b-2 border-camel inline-block">
                Quản lý sản phẩm
              </h1>
            </div>

            {/* Empty Space */}
            <div className="flex-1"></div>

            {/* Store Info */}
            <div className="flex items-center gap-3 flex-1 pl-3 justify-end">
              <Store className="w-5 h-5" />
              <div className="pl-2">
                <h3 className="font-semibold">
                  {selectedStore.storeName || selectedStore.name}
                </h3>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedStore.address &&
                  typeof selectedStore.address === "object"
                    ? `${selectedStore.address.street}, ${selectedStore.address.district}, ${selectedStore.address.city}`
                    : selectedStore.address || "Địa chỉ không có sẵn"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
          {/* Title & Nút tác vụ */}
          <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách sản phẩm
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theo dõi tiến độ cửa hàng của bạn để tăng doanh số bán hàng.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-3 ">
              {/* Xóa các item được chọn */}
              <button
                onClick={handleSoftDeleteSelectedProducts}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold disabled:bg-gray-400"
                disabled={isLoading || !hasSelection}
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
                  `🗑 Xóa (${selectedCount})`
                )}
              </button>
              {/* Thêm sản phẩm */}
              <button
                onClick={() => setShowAddModal(true)} // Mở modal thêm sản phẩm
                className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2"
                disabled={isLoading}
              >
                + Add New
              </button>
            </div>
          </div>

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
                    Filter
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

          {/* Bảng hiển thị sản phẩm */}
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
                        <Settings className="w-5 h-5 text-gray-700" />
                      </div>
                    </th>
                  </tr>
                </thead>
                {/* Phần thân bảng */}
                <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 text-center"
                    >
                      {/* Hiển thị tickbox từng sản phẩm */}
                      <td className="w-12 px-3 py-4 text-left">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isItemSelected(product._id)}
                            onChange={() => toggleSelectItem(product._id)}
                            className="w-4 h-4 rounded border-gray-300 text-green_starbuck focus:ring-green_starbuck"
                          />
                        </label>
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
                        <span className="text-sm font-semibold text-camel">
                          {product.name || "N/A"}
                        </span>
                      </td>
                      {/* Hiển thị ngày */}
                      <td className="p-3 text-md text-dark_blue">
                        {formatNiceDate(product.createdAt)}
                      </td>
                      {/* Hiển thị mô tả sản phẩm */}
                      <td className="p-3 text-md text-start text-gray-900 max-w-xs">
                        <div>
                          <div className={expandedDescriptions.has(product._id) ? "" : "line-clamp-2"}>
                            {product.description || "N/A"}
                          </div>
                          {product.description && product.description.length > 100 && (
                            <button 
                              onClick={() => toggleDescription(product._id)}
                              className="text-blue-600 hover:underline text-sm mt-1"
                            >
                              {expandedDescriptions.has(product._id) ? "Thu gọn" : "Xem thêm"}
                            </button>
                          )}
                        </div>
                      </td>
                      {/* Hiển thị danh mục sản phẩm */}
                      <td className="p-3 text-md text-start text-gray-900">
                        {product.category?.name || "N/A"}{" "}
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
                          <span className="text-gray-500">No sizes</span>
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
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 flex-col border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
              >
                Trang trước
              </button>

              {/* Số trang */}
              <div className="flex gap-2">{renderPaginationNumbers()}</div>

              {/* Thông tin kết quả */}
              <div className="flex items-center gap-4">
                <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
                  Hiển thị {products.length} / {pagination.totalProducts || 0}{" "}
                  sản phẩm (Trang {pagination.currentPage || 1} /{" "}
                  {pagination.totalPages || 1})
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

export default ManagerProduct;
