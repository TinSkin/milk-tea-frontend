import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ProductList from "../components/features/ecommerce/ProductList";
import Cart from "../components/features/ecommerce/Cart";
import FadeInOnScroll from "../components/ui/FadeInOnScroll";
import {
  SortAsc,
  SortDesc,
  DollarSign,
  ListOrdered,
  Search,
  MapPin,
  Store,
} from "lucide-react";
import Select from "react-select";
import { useStoreSelectionStore } from "../store/storeSelectionStore";

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
    value: 4,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />4 / Trang
      </span>
    ),
  },
  {
    value: 8,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />8 / Trang
      </span>
    ),
  },
  {
    value: 12,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        12 / Trang
      </span>
    ),
  },
  {
    value: 16,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        16 / Trang
      </span>
    ),
  },
];

function Menu() {
  // Dữ liệu cửa hàng đã chọn
  const {
    selectedStore,
    loadStoreCategories,
    loadStoreProducts,
    openStoreModal,
    isLoading: isLoadingStore,
  } = useStoreSelectionStore();

  // Trạng thái sản phẩm và danh mục - quản lý theo cửa hàng đã chọn
  const [productsList, setProductsList] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Tất cả sản phẩm để tính category count
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Bộ lọc và phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Sync với defaultValue
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  //! Load categories và all products từ store đã chọn
  const loadInitialData = async () => {
    try {
      if (!selectedStore?._id) {
        console.warn("No store selected, cannot load store-specific data");
        return;
      }

      setCategoriesLoading(true);

      // Load categories của store cụ thể
      const storeCategories = await loadStoreCategories(selectedStore._id);
      const categoriesArray = storeCategories.categories || [];
      setCategories(categoriesArray);

      // Load tất cả sản phẩm để tính category count
      await loadAllProducts();

      setCategoriesLoading(false);

      // Load products với pagination sau khi có categories
      loadProducts();
    } catch (error) {
      console.error("Error loading store categories:", error);
      setCategoriesLoading(false);
    }
  };

  //! Load tất cả sản phẩm để tính category count (không pagination, không filter)
  const loadAllProducts = async () => {
    try {
      if (!selectedStore?._id) return;

      // Load tất cả sản phẩm với limit cao
      const allProductsAPI = await loadStoreProducts(
        selectedStore._id,
        1,
        1000,
        "",
        "",
        "createdAt",
        "desc"
      );

      setAllProducts(allProductsAPI.products || []);
    } catch (error) {
      console.error("Error loading all products:", error);
    }
  };

  //! Hàm tải danh sách sản phẩm theo trang, tìm kiếm, lọc danh mục, sắp xếp và theo cửa hàng người dùng chọn
  const loadProducts = async (
    page = currentPage,
    limit = itemsPerPage,
    search = searchTerm,
    category = selectedCategory,
    sortOrder = "desc"
  ) => {
    try {
      if (!selectedStore?._id) return;

      setProductsLoading(true);
      setProductsError(null);

      // Parse sortOption để tạo sortBy và sortOrder
      let finalSortBy = "createdAt";
      let finalSortOrder = "desc";

      if (sortOption) {
        if (sortOption === "price-asc") {
          finalSortBy = "price";
          finalSortOrder = "asc";
        } else if (sortOption === "price-desc") {
          finalSortBy = "price";
          finalSortOrder = "desc";
        } else if (sortOption === "date-asc") {
          finalSortBy = "createdAt";
          finalSortOrder = "asc";
        } else if (sortOption === "date-desc") {
          finalSortBy = "createdAt";
          finalSortOrder = "desc";
        }
      }

      const productsAPI = await loadStoreProducts(
        selectedStore._id,
        page,
        limit,
        search,
        category === "all" ? "" : category,
        finalSortBy,
        finalSortOrder
      );

      setProductsList(productsAPI.products || []);
      setTotalProducts(productsAPI.pagination?.totalProducts || 0);
      setTotalPages(productsAPI.pagination?.totalPages || 0);
      setProductsLoading(false);
    } catch (error) {
      console.error("Error loading store products:", error);
      setProductsLoading(false);
      setProductsError(error.message || "Lỗi tải danh sách sản phẩm");
    }
  };

  //! Reset về trang 1 khi filter thay đổi và load sản phẩm khi chọn lại cửa hàng
  useEffect(() => {
    if (selectedStore?._id) {
      loadProducts(1); // Reset to page 1 when filters change
      setCurrentPage(1);
    }
  }, [
    selectedStore?._id,
    searchTerm,
    selectedCategory,
    sortOption,
    itemsPerPage,
  ]);

  //! Phân trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    loadProducts(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      loadProducts(newPage);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      loadProducts(newPage);
    }
  };

  //! Tạo danh sách nút số trang
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded font-semibold ${
            currentPage === i
              ? "bg-dark_blue text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  //! Xử lý khi chọn danh mục
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  //! Hàm lấy tên danh mục
  const getCategoryName = (categoryId) => {
    if (categoryId === "all") return "Tất cả sản phẩm";
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Không xác định";
  };

  //! Xóa lỗi sản phẩm
  const clearProductsError = () => {
    setProductsError(null);
  };

  //! Xóa thông báo lỗi sau 5 giây
  useEffect(() => {
    if (productsError) {
      const timer = setTimeout(() => {
        clearProductsError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [productsError, clearProductsError]);

  // Kết hợp loading của products và categories
  const isLoading = productsLoading || categoriesLoading;

  //! Tải dữ liệu ban đầu khi component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  //! Reload data khi selectedStore thay đổi
  useEffect(() => {
    if (!selectedStore) {
      console.log("Selected Store changed:", selectedStore);
    }

    if (selectedStore?._id) {
      loadInitialData();
    }
  }, [selectedStore?._id]);

  useEffect(() => {
    if (!productsList && !categories) {
      console.log(
        "ProductsList state updated:",
        productsList,
        "& Categories state updated:",
        categories
      );
    }
  }, [productsList, categories]);

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100">
        {/* Store Info Bar */}
        {selectedStore && (
          <div className="bg-[#151d2d] text-white py-3 shadow-md">
            <div className="max-w-[100rem] mx-auto flex justify-evenly items-center px-4 sm:px-6 lg:px-8">
              {/* Left: Store Info */}
              <div className="flex items-center gap-3 flex-1 pl-3">
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

              {/* Center: Empty for spacing - takes remaining space */}
              <div className="flex-1"></div>

              {/* Right: Action Buttons */}
              <div className="text-right text-sm flex-1 flex justify-end">
                <div>
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`px-4 py-3 rounded text-xs ${
                        selectedStore.status ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {selectedStore.status ? "Đang mở cửa" : "Đóng cửa"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      openStoreModal();
                    }}
                    className="mt-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded text-xs border border-white/30 transition-colors"
                  >
                    Đổi cửa hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="font-roboto min-h-screen bg-gray-100 mt-6">
            <div className="flex gap-4">
              {/* Category Sidebar */}
              <FadeInOnScroll direction="left" delay={0.2}>
                <div className="bg-white shadow w-60 rounded">
                  <div className="bg-[#151d2d] p-4 rounded-tr rounded-tl">
                    <h2 className="font-semibold text-white text-center">
                      Danh Mục
                    </h2>
                  </div>

                  {categoriesLoading ? (
                    <div className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-gray-500"
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
                        Đang tải...
                      </div>
                    </div>
                  ) : (
                    <ul className="p-4">
                      {/* All categories option */}
                      <li
                        onClick={() => handleCategorySelect("all")}
                        className={`flex justify-between py-2 px-2 rounded cursor-pointer transition-colors ${
                          selectedCategory === "all"
                            ? "bg-camel text-white"
                            : "text-dark_blue hover:bg-camel hover:text-white"
                        }`}
                      >
                        <span className="font-semibold">Tất cả</span>
                        <span className="text-sm font-semibold">
                          ({allProducts.length})
                        </span>
                      </li>

                      {/* Categories Sidebar */}
                      {categories && categories.length > 0 ? (
                        categories
                          .filter(
                            (cat) =>
                              cat.status === "active" ||
                              cat.status === "available"
                          ) // Support both status types
                          .map((category) => {
                            const categoryProductCount = allProducts.filter(
                              (product) => {
                                const productCategory =
                                  product.category &&
                                  typeof product.category === "object"
                                    ? product.category._id
                                    : product.category;
                                return productCategory === category._id;
                              }
                            ).length;

                            return (
                              <li
                                key={category._id}
                                onClick={() =>
                                  handleCategorySelect(category._id)
                                }
                                className={`flex justify-between py-2 px-2 rounded cursor-pointer transition-colors ${
                                  selectedCategory === category._id
                                    ? "bg-camel text-white"
                                    : "text-dark_blue hover:bg-camel/50 hover:text-white"
                                }`}
                              >
                                <span className="font-semibold">
                                  {category.name}
                                </span>
                                <span className="text-sm font-semibold">
                                  ({categoryProductCount})
                                </span>
                              </li>
                            );
                          })
                      ) : (
                        <li className="text-center text-gray-500 py-4">
                          <p>Không có danh mục nào</p>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </FadeInOnScroll>

              {/* Search and Sort Controls */}
              <div className="flex-1 mb-10">
                <div className="flex gap-4 mb-5">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Sort */}
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

                  {/* Items per page */}
                  <Select
                    options={itemsPerPageOptions}
                    defaultValue={itemsPerPageOptions[1]} // 6/trang default
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
                </div>

                {/* Results Info */}
                <div className="mb-4 text-gray-600">
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
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
                  ) : (
                    <p>
                      Hiển thị {productsList.length} / {totalProducts} sản phẩm
                      (trang {currentPage} / {totalPages})
                      {searchTerm && ` cho "${searchTerm}"`}
                      {selectedCategory !== "all" &&
                        ` trong danh mục "${getCategoryName(
                          selectedCategory
                        )}"`}
                    </p>
                  )}
                </div>

                {/* Error Display */}
                {productsError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{productsError}</p>
                    <button
                      onClick={loadInitialData}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Product Display */}
                {!isLoading && productsList.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">
                      {searchTerm || selectedCategory !== "all"
                        ? "Không tìm thấy sản phẩm nào phù hợp"
                        : "Chưa có sản phẩm nào"}
                    </p>
                    {(searchTerm || selectedCategory !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                        }}
                        className="px-4 py-2 bg-dark_blue text-white rounded hover:bg-dark_blue/80"
                      >
                        Xem tất cả
                      </button>
                    )}
                  </div>
                ) : (
                  <ProductList
                    products={productsList.map((prod) => ({
                      ...prod,
                      images:
                        prod.images && prod.images.length > 0
                          ? prod.images
                          : ["/no-image.png"],
                    }))}
                    isLoading={isLoading}
                    error={productsError}
                  />
                )}

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-dark_blue text-white rounded hover:bg-dark_blue/80 disabled:bg-gray-400 font-semibold"
                    >
                      Trang trước
                    </button>

                    <div className="flex gap-2">
                      {renderPaginationNumbers()}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-dark_blue text-white rounded hover:bg-dark_blue/80 disabled:bg-gray-400 font-semibold"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Sidebar */}
              <FadeInOnScroll direction="right" delay={0.2}>
                <Cart />
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Menu;
