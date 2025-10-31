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
  RotateCcw,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import Select from "react-select";

// Import Swiper để tạo carousel ảnh
import "swiper/css"; // Import CSS của Swiper để hiển thị carousel ảnh
import "swiper/css/navigation"; // Import CSS navigation của Swiper (nếu có dùng navigation)
import { Autoplay } from "swiper/modules"; // Import module Autoplay từ Swiper để ảnh tự động chuyển
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide để tạo carousel ảnh sản phẩm

// Import stores quản lý trạng thái
import { useManagerStore } from "../../store/managerStore";
import { useRequestManagerStore } from "../../store/request/requestManagerStore";

// Import component
import Notification from "../../components/ui/Notification";
import ConfirmDeleteModal from "../../components/features/admin/ConfirmDeleteModal";
import ViewToppingsModal from "../../components/features/admin/product/ViewToppingsModal";
import CreateProductRequestModal from "../../components/features/manager/request/product/CreateProductRequestModal";
import UpdateProductRequestModal from "../../components/features/manager/request/product/UpdateProductRequestModal";
import DeleteProductRequestModal from "../../components/features/manager/request/product/DeleteProductRequestModal";

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

const ManagerProduct = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý dữ liệu cửa hàng
  const {
    products,
    categories,
    toppings,
    storeInfo,
    isLoading,
    error,
    pagination,
    fetchMyStoreProducts,
    fetchMyStoreCategories,
    fetchMyStoreToppings,
    updateMyStoreProduct,
    clearError,
  } = useManagerStore();

  // Store quản lý requests
  const { isLoading: isRequestLoading } = useRequestManagerStore();

  // Trạng thái cho modal request
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [requestingProduct, setRequestingProduct] = useState(null);

  //! Mở modal yêu cầu thêm sản phẩm
  const handleAddProduct = () => {
    setShowAddRequestModal(true);
  };

  //! Xử lý thành công khi gửi request thêm sản phẩm
  const handleAddRequestSuccess = () => {
    setShowAddRequestModal(false);
    Notification.info(
      "Yêu cầu đã được gửi",
      "Admin sẽ xem xét và phản hồi yêu cầu của bạn sớm nhất có thể."
    );
  };

  //! Xử lý thành công khi gửi request cập nhật sản phẩm
  const handleUpdateRequestSuccess = () => {
    setShowUpdateRequestModal(false);
    setRequestingProduct(null);
  };

  //! Xử lý thành công khi gửi request xóa sản phẩm
  const handleDeleteRequestSuccess = () => {
    setShowDeleteRequestModal(false);
    setRequestingProduct(null);
  };

  //! Manager không được sửa sản phẩm trực tiếp - phải qua request system
  const handleEditProduct = (productData) => {
    setRequestingProduct(productData);
    setShowUpdateRequestModal(true);
  };

  // Modal xem topping
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [viewingToppings, setViewingToppings] = useState([]);

  //! Xử lý xem toppings - Map từ array ID sang object đầy đủ
  const handleViewToppings = (toppingIds) => {
    // Map từ array ID sang array object đầy đủ
    const fullToppings = toppingIds
      .map((toppingId) => 
        toppings.find((topping) => topping._id === toppingId)
      )
      .filter(Boolean); // Loại bỏ các topping không tìm thấy

    setViewingToppings(fullToppings);
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

  //! Xác nhận xóa product
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

  // State để theo dõi các sản phẩm có mô tả được mở rộng
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

  // Checkbox chọn lựa sản phẩm
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

  //! Tải dữ liệu ban đầu khi component được mount (có bảo vệ tránh tải lại nhiều lần)
  useEffect(() => {
    if (!isInitLoaded.current) {
      loadProductsInit(); // Gọi hàm loadProductsInit để tải danh sách sản phẩm với notification
      loadFormData(); // Load categories và toppings
      isInitLoaded.current = true;
    } else {
      console.log("Prevented duplicate products load");
    }
  }, []); // Chỉ chạy 1 lần khi component mount

  //! Load products cửa hàng lần đầu (có notification)
  const loadProductsInit = async (page = 1) => {
    try {
      clearError();
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sortBy: getSortBy(),
        sortOrder: getSortOrder(),
      };

      const result = await fetchMyStoreProducts(params);
      // console.log("Fetched store products:", result);
      // console.log("Pagination data:", result?.data?.pagination);
      if (result.data && result.data.products) {
        Notification.success(
          `Tải thành công ${result.data.products.length} sản phẩm của cửa hàng.`
        );
      }
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách sản phẩm cửa hàng",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Load products cửa hàng với bộ lọc chính (không notification)
  const loadProducts = async (page = 1) => {
    try {
      clearError();
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sortBy: getSortBy(),
        sortOrder: getSortOrder(),
      };

      await fetchMyStoreProducts(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách sản phẩm cửa hàng",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Load categories and toppings của cửa hàng for dropdowns
  const loadFormData = async () => {
    try {
      await Promise.all([
        fetchMyStoreCategories({ status: "available" }),
        fetchMyStoreToppings({ status: "available" }),
      ]);
    } catch (error) {
      console.error("Error loading store form data:", error);
    }
  };

  //! Load products cửa hàng với bộ lọc thứ 2
  const loadProducts2 = async (page = 1) => {
    try {
      clearError();
      const params = {
        page,
        limit: itemsPerPage2,
        search: searchTerm2,
        status: statusFilter2,
        category: categoryFilter2,
        sortBy: getSortBy2(),
        sortOrder: getSortOrder2(),
      };

      await fetchMyStoreProducts(params);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách sản phẩm cửa hàng (Bộ lọc 2)",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
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

  //! Lấy cấu hình sắp xếp dựa trên tùy chọn được chọn
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

  //! Lấy cấu hình sắp xếp dựa trên tùy chọn được chọn cho bộ lọc thứ 2
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

  //! Xử lí thay đổi bộ lọc
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, categoryFilter, sortOption, itemsPerPage]);

  //! Xử lí thay đổi bộ lọc cho bộ lọc thứ 2
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts2(1);
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm2, statusFilter2, categoryFilter2, sortOption2, itemsPerPage2]);

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

  //! Manager không được xóa sản phẩm - chỉ có thể request tới admin
  const handleRemoveFromStore = async (product) => {
    setRequestingProduct(product);
    setShowDeleteRequestModal(true);
  };

  //! Gửi yêu cầu tới Admin để thay đổi system status
  const handleRequestSystemStatusChange = async (product) => {
    // TODO: Implement request system status change logic
    // // Xác định loại request dựa trên system status hiện tại
    // let requestType = "";
    // let requestReason = "";
    // let newSystemStatus = "available"; // Default target status

    // if (product.status === "unavailable") {
    //   requestType = "Yêu cầu mở lại sản phẩm";
    //   requestReason =
    //     "Sản phẩm đang bị khóa bởi Admin, cửa hàng muốn bán lại sản phẩm này.";
    //   newSystemStatus = "available";
    // } else if (product.status === "paused") {
    //   requestType = "Yêu cầu tiếp tục bán sản phẩm";
    //   requestReason =
    //     "Sản phẩm đang bị tạm dừng bởi Admin, cửa hàng muốn tiếp tục bán sản phẩm này.";
    //   newSystemStatus = "available";
    // } else if (product.status === "out_of_stock") {
    //   requestType = "Yêu cầu nhập hàng";
    //   requestReason =
    //     "Sản phẩm đang hết hàng toàn hệ thống, cửa hàng muốn Admin nhập thêm hàng.";
    //   newSystemStatus = "available";
    // }

    // try {
    //   const requestData = {
    //     productId: product._id,
    //     productName: product.name,
    //     currentSystemStatus: product.status,
    //     requestedSystemStatus: newSystemStatus,
    //     requestType,
    //     note: requestReason,
    //   };

    //   await submitUpdateRequest("product", product._id, requestData);

    //   Notification.success(
    //     "Gửi yêu cầu thành công!",
    //     `Đã gửi "${requestType}" cho sản phẩm "${product.name}" tới Admin. Yêu cầu sẽ được xem xét sớm nhất có thể.`
    //   );
    // } catch (error) {
    //   console.error("Error submitting system status change request:", error);
    //   Notification.error(
    //     "Gửi yêu cầu thất bại",
    //     error.message || "Đã xảy ra lỗi khi gửi yêu cầu tới Admin"
    //   );
    // }

    // Temporary notification for development
    Notification.info(
      "Đang phát triển",
      "Chức năng gửi yêu cầu thay đổi trạng thái sản phẩm đang được phát triển."
    );
  };

  //! Xử lý chuyển trạng thái sản phẩm TẠI CỬA HÀNG (storeStatus)
  const handleToggleStoreStatus = async (product) => {
    // Kiểm tra constraint: Chỉ được toggle khi system status = available
    if (product.status !== "available") {
      Notification.warning(
        "Không thể thay đổi trạng thái",
        "Sản phẩm phải được Admin mở lại trước khi bạn có thể thay đổi trạng thái cửa hàng."
      );
      return;
    }

    try {
      // CHT có thể toggle giữa "available" và "paused"
      const newStoreStatus =
        product.storeStatus === "available" ? "paused" : "available";

      await updateMyStoreProduct(product._id, { storeStatus: newStoreStatus });

      Notification.success(
        newStoreStatus === "available"
          ? "Đã BẬT lại sản phẩm tại cửa hàng!"
          : "Đã TẠM DỪNG sản phẩm tại cửa hàng!"
      );

      loadProducts(pagination.currentPage);
    } catch (error) {
      console.error("Toggle store status error:", error);

      // Handle specific business rule errors
      const errorResponse = error.response?.data;
      if (errorResponse?.code) {
        switch (errorResponse.code) {
          case "SYSTEM_STATUS_UNAVAILABLE":
            Notification.error(
              "Không thể bật sản phẩm",
              "Admin đã tắt sản phẩm này toàn hệ thống. Liên hệ Admin để kích hoạt lại."
            );
            break;
          case "SYSTEM_STATUS_PAUSED":
            Notification.error(
              "Không thể bật sản phẩm",
              "Admin đang tạm dừng sản phẩm này. Liên hệ Admin để biết thêm thông tin."
            );
            break;
          case "SYSTEM_STATUS_OUT_OF_STOCK":
            Notification.error(
              "Không thể bật sản phẩm",
              "Sản phẩm đang hết hàng toàn hệ thống. Chờ Admin nhập thêm hàng."
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

  //! Hiển thị thông báo lỗi khi có lỗi xảy ra trong store
  useEffect(() => {
    if (error) {
      Notification.error("Lỗi", error);
      clearError();
    }
  }, [error, clearError]);

  //! Hàm render các nút số trang
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
      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
          {/* Tiêu đề & Nút tác vụ */}
          <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
            {/* Tiêu đề */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Sản phẩm cửa hàng
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quản lý sản phẩm có trong cửa hàng của bạn.
              </p>
            </div>
            {/* Nút tác vụ */}
            <div className="flex gap-3">
              {/* Xóa sản phẩm */}
              <div className="flex gap-2">
                <button
                  onClick={handleSoftDeleteSelectedProducts}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa sản phẩm đã chọn ({selectedCount})
                </button>
              </div>
              {/* Thêm sản phẩm */}
              <button
                onClick={handleAddProduct}
                className="bg-green_starbuck text-white px-4 py-2 rounded hover:bg-green_starbuck/80 flex items-center gap-2 font-semibold"
                disabled={isLoading}
              >
                <Package className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {hasSelection && (
            <div className="px-5">
              <div className="flex items-center justify-around p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-700 font-medium">
                    Đã chọn {selectedCount} sản phẩm
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
                          {categories.map((category) => (
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

          {/* Bảng sản phẩm */}
          <div className="overflow-x-auto">
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {products.length === 0 && !isLoading ? (
              <p className="text-center text-gray-600 text-lg py-8">
                {searchTerm
                  ? "Sản phẩm bạn tìm kiếm không tồn tại"
                  : "Cửa hàng chưa có sản phẩm nào"}
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
                    <th className="p-3 text-md text-center font-semibold text-green_starbuck">
                      Topping
                    </th>
                    {/* <th className="p-3 text-md font-semibold text-green_starbuck">
                      Hệ thống
                    </th> */}
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Cửa hàng
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
                      <td className="p-2 flex items-center space-x-3">
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
                          {product.name || "Không có tên"}
                        </span>
                      </td>
                      {/* Hiển thị ngày */}
                      <td className="p-2 text-md text-start text-dark_blue">
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
                      <td className="p-2 text-lg text-gray-900">
                        {Array.isArray(product.toppings) &&
                        product.toppings.length > 0 ? (
                          <div className="flex justify-center">
                            <button
                              className="flex p-2 rounded hover:bg-blue-50 transition"
                              title={`Xem ${product.toppings.length} topping`}
                              onClick={() => handleViewToppings(product.toppings)}
                            >
                              <Eye className="w-5 h-5 text-blue-600" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            Không có topping
                          </span>
                        )}
                      </td>
                      {/* Trạng thái hệ thống (chỉ xem, không sửa được) */}
                      {/* <td className="p-3 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 text-sm rounded font-semibold text-center ${
                              product.status === "available"
                                ? "text-green-700 bg-green-100"
                                : product.status === "paused"
                                ? "text-yellow-700 bg-yellow-100"
                                : product.status === "out_of_stock"
                                ? "text-orange-700 bg-orange-100"
                                : "text-red-700 bg-red-100"
                            }`}
                          >
                            {product.status === "available"
                              ? "Hoạt động"
                              : product.status === "paused"
                              ? "Tạm dừng"
                              : product.status === "out_of_stock"
                              ? "Hết hàng"
                              : "Ngừng bán"}
                          </span>
                          {product.status !== "available" && (
                            <span className="text-xs text-red-500 text-center">
                              {product.status === "paused"
                                ? "Admin tạm dừng"
                                : product.status === "out_of_stock"
                                ? "Hệ thống hết hàng"
                                : "⚠️ Admin đã khóa"}
                            </span>
                          )}
                        </div>
                      </td> */}
                      {/* Trạng thái cửa hàng (CHT có thể thay đổi) */}
                      <td className="p-3 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 text-sm rounded font-semibold text-center ${
                              // Khi system unavailable, store status cũng phải unavailable
                              product.status === "unavailable"
                                ? "text-red-700 bg-red-100"
                                : product.storeStatus === "available"
                                ? "text-blue-700 bg-blue-100"
                                : product.storeStatus === "paused"
                                ? "text-yellow-700 bg-yellow-100"
                                : product.storeStatus === "out_of_stock"
                                ? "text-orange-700 bg-orange-100"
                                : "text-gray-700 bg-gray-100"
                            }`}
                          >
                            {product.status === "unavailable"
                              ? "Bị khóa"
                              : product.storeStatus === "available"
                              ? "Đang bán"
                              : product.storeStatus === "paused"
                              ? "Tạm dừng"
                              : product.storeStatus === "out_of_stock"
                              ? "Hết hàng"
                              : "Tắt"}
                          </span>

                          {/* Hiển thị lý do khi bị constraint */}
                          {product.status === "unavailable" && (
                            <span className="text-xs text-red-500 text-center">
                              🔒 Admin đã khóa
                            </span>
                          )}
                          {product.status === "paused" && (
                            <span className="text-xs text-yellow-600 text-center">
                              ⏸️ Admin tạm dừng
                            </span>
                          )}
                          {product.status === "out_of_stock" && (
                            <span className="text-xs text-orange-600 text-center">
                              Hệ thống hết hàng
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Nhóm các nút hành động */}
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Nút chỉnh sửa - disabled khi system status = unavailable */}
                          <Pencil
                            className={`w-4 h-4 cursor-pointer ${
                              product.status === "unavailable"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:text-blue-800"
                            }`}
                            onClick={() => {
                              if (product.status !== "unavailable") {
                                handleEditProduct(product);
                              }
                            }}
                            title={
                              product.status === "unavailable"
                                ? "Không thể sửa khi sản phẩm bị Admin khóa"
                                : "Gửi yêu cầu chỉnh sửa tới Admin"
                            }
                          />

                          {/* Toggle cho storeStatus - CHỈ hoạt động khi system status = available */}
                          <Switch
                            checked={
                              product.status === "available" &&
                              product.storeStatus === "available"
                            }
                            onChange={() => handleToggleStoreStatus(product)}
                            disabled={product.status !== "available"}
                            className={`${
                              product.status !== "available"
                                ? "bg-gray-300 cursor-not-allowed"
                                : product.storeStatus === "available"
                                ? "bg-blue-500"
                                : "bg-orange-400"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                            title={
                              product.status !== "available"
                                ? "Không thể thay đổi khi hệ thống không cho phép"
                                : "Bật/tắt sản phẩm tại cửa hàng này"
                            }
                          >
                            <span className="sr-only">
                              Chuyển trạng thái bán tại cửa hàng
                            </span>
                            <span
                              className={`${
                                product.status === "available" &&
                                product.storeStatus === "available"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                            />
                          </Switch>

                          {/* Nút Request - luôn hiển thị với tooltip động */}
                          <button
                            onClick={() =>
                              handleRequestSystemStatusChange(product)
                            }
                            className={`p-1 rounded transition ${
                              product.status !== "available"
                                ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            }`}
                            disabled={isRequestLoading}
                            title={
                              product.status === "unavailable"
                                ? "Yêu cầu Admin mở lại sản phẩm bị khóa"
                                : product.status === "paused"
                                ? "Yêu cầu Admin tiếp tục bán sản phẩm bị tạm dừng"
                                : product.status === "out_of_stock"
                                ? "Yêu cầu Admin nhập thêm hàng cho sản phẩm hết hàng"
                                : "Gửi yêu cầu thay đổi sản phẩm tới Admin"
                            }
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Nút xóa khỏi cửa hàng - disabled khi system status = unavailable */}
                          <Trash2
                            className={`w-4 h-4 cursor-pointer ${
                              product.status === "unavailable"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-800"
                            }`}
                            onClick={() => {
                              if (product.status !== "unavailable") {
                                handleRemoveFromStore(product);
                              }
                            }}
                            title={
                              product.status === "unavailable"
                                ? "Không thể xóa khi sản phẩm bị Admin khóa"
                                : "Xóa sản phẩm khỏi cửa hàng (không xóa khỏi hệ thống)"
                            }
                          />
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

      {/* Modal xem Topping */}
      {showToppingModal && (
        <ViewToppingsModal
          toppings={viewingToppings}
          onClose={() => setShowToppingModal(false)}
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
                  Xác nhận thay đổi trạng thái
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn thay đổi trạng thái{" "}
                <span className="font-semibold text-red-600">
                  {selectedCount}
                </span>{" "}
                sản phẩm được chọn không?
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Hành động này có thể được hoàn tác sau.
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
                  "Xác nhận"
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

      {/* Modal yêu cầu thêm sản phẩm */}
      <CreateProductRequestModal
        isOpen={showAddRequestModal}
        onClose={() => setShowAddRequestModal(false)}
        onSuccess={handleAddRequestSuccess}
      />

      {/* Modal yêu cầu cập nhật sản phẩm */}
      <UpdateProductRequestModal
        isOpen={showUpdateRequestModal}
        onClose={() => {
          setShowUpdateRequestModal(false);
          setRequestingProduct(null);
        }}
        onSuccess={handleUpdateRequestSuccess}
        productData={requestingProduct}
      />

      {/* Modal yêu cầu xóa sản phẩm */}
      <DeleteProductRequestModal
        isOpen={showDeleteRequestModal}
        onClose={() => {
          setShowDeleteRequestModal(false);
          setRequestingProduct(null);
        }}
        onSuccess={handleDeleteRequestSuccess}
        productData={requestingProduct}
      />
    </>
  );
};

export default ManagerProduct;
