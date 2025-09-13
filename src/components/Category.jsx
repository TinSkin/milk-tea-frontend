import React from "react";
import { useEffect, useState } from "react";
import { useCategoryStore } from "../store/categoryStore";

function Category() {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAllCategories } = useCategoryStore();

  //! Get categories
  const handleGetCategories = async () => {
    try {
      setLoading(true);

      // Call with params
      const response = await getAllCategories({
        status: "available", // Only get available categories
        page: 1,
        limit: 50, // Get all categories
        sortBy: "name",
        sortOrder: "asc",
      });

      console.log("Categories fetched:", response);

      // Check response
      if (response && response.categories) {
        setCategoriesData(response.categories);
      } else if (Array.isArray(response)) {
        setCategoriesData(response);
      } else {
        setCategoriesData([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Lỗi khi tải danh mục");
      setCategoriesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCategories();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow w-60 rounded-md">
        <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md">
          <h2 className="font-semibold text-white text-center">Danh Mục</h2>
        </div>
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white shadow w-60 rounded-md">
        <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md">
          <h2 className="font-semibold text-white text-center">Danh Mục</h2>
        </div>
        <div className="p-4 text-center text-red-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={handleGetCategories}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow w-60 rounded-md">
      <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md">
        <h2 className="font-semibold text-white text-center">Danh Mục</h2>
      </div>
      <ul className="p-4">
        {categoriesData && categoriesData.length > 0 ? (
          categoriesData.map((cat, index) => (
            <li
              key={cat._id || index}
              className="flex justify-between py-2 px-2 hover:bg-camel rounded cursor-pointer text-dark_blue hover:text-white transition-colors"
            >
              <span className="font-semibold">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-md font-semibold">{cat.productCount}</span>
              )}
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 py-4">
            <p>Không có danh mục nào</p>
            <button
              onClick={handleGetCategories}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Tải lại
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Category;
