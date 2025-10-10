import React from "react";

const Pagination = ({ 
  pagination, 
  isLoading, 
  onPageChange, 
  label = "kết quả",
  className = "",
  currentItemsCount = 0, // Số lượng items hiện tại (products.length, toppings.length, etc.)
  totalItemsKey = "totalItems" // Key để lấy tổng số items từ pagination
}) => {
  // Kiểm tra và chuẩn hóa dữ liệu pagination
  const normalizePagination = (paginationData) => {
    if (!paginationData) return null;
    
    // Hỗ trợ nhiều cấu trúc pagination khác nhau
    return {
      currentPage: paginationData.currentPage || paginationData.page || paginationData.current || 1,
      totalPages: paginationData.totalPages || paginationData.pages || paginationData.totalPages || 1,
      // Lấy totalItems theo key được chỉ định hoặc các key thông dụng
      totalItems: paginationData[totalItemsKey] || 
                 paginationData.totalItems || 
                 paginationData.total || 
                 paginationData.count || 
                 0,
      hasPrevPage: paginationData.hasPrevPage !== undefined 
        ? paginationData.hasPrevPage 
        : ((paginationData.currentPage || 1) > 1),
      hasNextPage: paginationData.hasNextPage !== undefined 
        ? paginationData.hasNextPage 
        : ((paginationData.currentPage || 1) < (paginationData.totalPages || 1)),
      perPage: paginationData.perPage || paginationData.limit || paginationData.pageSize || 10
    };
  };

  const normalizedPagination = normalizePagination(pagination);
  
  if (!normalizedPagination || normalizedPagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasPrevPage, hasNextPage, totalItems, perPage } = normalizedPagination;

  const prevPage = () => {
    if (hasPrevPage && !isLoading) onPageChange(currentPage - 1);
  };

  const nextPage = () => {
    if (hasNextPage && !isLoading) onPageChange(currentPage + 1);
  };

  // Render dải số trang tối đa 5
  const renderPaginationNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className={`px-3 py-1 rounded font-semibold transition-colors min-w-[40px] ${
            currentPage === i
              ? "bg-green_starbuck text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  // Hàm render text hiển thị
  const renderDisplayText = () => {
    // Tính toán số lượng hiển thị thực tế
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);
    const showingCount = currentItemsCount > 0 ? currentItemsCount : (endItem - startItem + 1);

    return `Hiển thị ${showingCount} / ${totalItems} ${label} (Trang ${currentPage} / ${totalPages})`;
  };

  return (
    <div className={`flex justify-between items-center mt-4 flex-col border-t border-gray-200 px-5 py-4 sm:flex-row ${className}`}>
      <button
        onClick={prevPage}
        disabled={!hasPrevPage || isLoading}
        className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        Trang trước
      </button>

      {/* Số trang */}
      <div className="flex gap-2 my-2 sm:my-0">
        {renderPaginationNumbers()}
      </div>

      {/* Thông tin hiển thị */}
      <div className="flex items-center gap-4 flex-col sm:flex-row">
        <div className="text-sm text-gray-600 font-semibold flex items-center">
          {renderDisplayText()}
        </div>
        <button
          onClick={nextPage}
          disabled={!hasNextPage || isLoading}
          className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;