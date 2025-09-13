import React from "react";
import ProductCard from "./ProductCard";

function ProductList({ products = [], isLoading = false, error = null }) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-300 rounded-md mb-3"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-2">Lỗi tải sản phẩm</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🍵</div>
        <p className="text-gray-600 text-lg">Không có sản phẩm nào</p>
      </div>
    );
  }

  // Always pass images array to ProductCard
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((prod, idx) => (
        <ProductCard
          key={prod._id || prod.id || idx}
          {...prod}
          image={
            Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images
              : ["/no-image.png"] // fallback image
          }
        />
      ))}
    </div>
  );
}

export default ProductList;
