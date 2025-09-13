import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Category from "../components/Category";
import ProductList from "../components/ProductList";
import Cart from "../components/Cart";
import FadeInOnScroll from "./../components/FadeInOnScroll";
import {
  Clock,
  SortAsc,
  SortDesc,
  DollarSign,
  ListOrdered,
  Search,
} from "lucide-react";
import Select from "react-select";

// Import Stores
import { useProductStore } from "../store/productStore";
import { useCategoryStore } from "../store/categoryStore";

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
  {
    value: "date-asc",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4" /> Ngày: Cũ nhất <SortAsc />
      </span>
    ),
  },
  {
    value: "date-desc",
    label: (
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4" /> Ngày: Mới nhất <SortDesc />
      </span>
    ),
  },
];

const itemsPerPageOptions = [
  {
    value: 4,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />4 sản phẩm / trang
      </span>
    ),
  },
  {
    value: 8,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />8 sản phẩm / trang
      </span>
    ),
  },
  {
    value: 12,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        12 sản phẩm / trang
      </span>
    ),
  },
  {
    value: 16,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        16 sản phẩm / trang
      </span>
    ),
  },
];

function Menu() {
  //! Product stores
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    getAllProducts,
    clearError: clearProductsError,
  } = useProductStore();

  const {
    categories,
    isLoading: categoriesLoading,
    getAllCategories,
  } = useCategoryStore();

  // Local state for UI
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  //! Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  //! Load products and categories
  const loadInitialData = async () => {
    try {
      // Load categories
      await getAllCategories({
        status: "available",
        page: 1,
        limit: 50,
        sortBy: "name",
        sortOrder: "asc",
      });

      // Load products
      await getAllProducts({
        status: "available", // Only show available products
        page: 1,
        limit: 100, // Get more products for client-side filtering
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  //! Filter products based on search, category, and sort
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => {
        // Handle both object and string category
        const productCategory =
          typeof product.category === "object"
            ? product.category._id
            : product.category;
        return productCategory === selectedCategory;
      });
    }

    // Sort products
    if (sortOption === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "date-asc") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "date-desc") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, selectedCategory, sortOption]);

  //! Pagination calculations
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //! Generate page numbers for pagination
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

  //! Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  //! Get category name by ID
  const getCategoryName = (categoryId) => {
    if (categoryId === "all") return "Tất cả sản phẩm";
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Không xác định";
  };

  //! Clear errors after 5 seconds
  useEffect(() => {
    if (productsError) {
      const timer = setTimeout(() => {
        clearProductsError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [productsError, clearProductsError]);

  //! Show loading state
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div>
      <Header />
      <div className="font-roboto min-h-screen bg-gray-100 p-6">
        <div className="flex gap-4">
          {/* Category Sidebar */}
          <FadeInOnScroll direction="left" delay={0.2}>
            <div className="bg-white shadow w-60 rounded-md">
              <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md">
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
                    <span className="font-semibold">Tất cả sản phẩm</span>
                    <span className="text-sm font-semibold">
                      ({products.length})
                    </span>
                  </li>

                  {/* Dynamic categories */}
                  {categories && categories.length > 0 ? (
                    categories
                      .filter((cat) => cat.status === "available")
                      .map((category) => {
                        const categoryProductCount = products.filter(
                          (product) => {
                            const productCategory =
                              product.category &&
                              typeof product.category === "object"
                                ? product.category._id
                                : product.category;
                            return productCategory === category._id;
                          }
                        ).length;
                        if (categoryProductCount === 0) return null;

                        return (
                          <li
                            key={category._id}
                            onClick={() => handleCategorySelect(category._id)}
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
          <div className="flex-1">
            <div className="flex gap-4 mb-5">
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

              {/* Sort */}
              <Select
                options={sortOptions}
                value={sortOptions.find((opt) => opt.value === sortOption)}
                onChange={(opt) => setSortOption(opt.value)}
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
                value={itemsPerPageOptions.find(
                  (opt) => opt.value === itemsPerPage
                )}
                onChange={(opt) => {
                  setItemsPerPage(opt.value);
                  loadInitialData(1, opt.value);
                }}
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
                  Hiển thị {currentProducts.length} trong tổng số{" "}
                  {filteredProducts.length} sản phẩm
                  {searchTerm && ` cho "${searchTerm}"`}
                  {selectedCategory !== "all" &&
                    ` trong danh mục "${getCategoryName(selectedCategory)}"`}
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
            {!isLoading && currentProducts.length === 0 ? (
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
                    Xem tất cả sản phẩm
                  </button>
                )}
              </div>
            ) : (
              <ProductList
                products={currentProducts.map((prod) => ({
                  ...prod,
                  images:
                    prod.images && prod.images.length > 0
                      ? prod.images
                      : ["/no-image.png"], // hoặc URL placeholder ảnh
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

                <div className="flex gap-2">{renderPaginationNumbers()}</div>

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
      <Footer />
    </div>
  );
}

export default Menu;
