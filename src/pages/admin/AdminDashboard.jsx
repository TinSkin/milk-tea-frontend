import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../api/productAPI";
import { useAuthStore } from "../../store/authStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const { checkTokenValidity } = useAuthStore();

  useEffect(() => {
    // Check token validity when component mounts
    const checkToken = async () => {
      console.log("🔍 AdminDashboard: Checking token on mount...");
      await checkTokenValidity();
    };
    checkToken();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProducts({ cache: "no-store" });

        const productsList = Array.isArray(result)
          ? result.flatMap(
              (item) =>
                item?.data?.filter(
                  (product) =>
                    product &&
                    typeof product === "object" &&
                    product.id &&
                    product.name
                ) || []
            )
          : [];

        const productMap = new Map();
        productsList.forEach((product) => {
          const existingProduct = productMap.get(product.id);
          if (!existingProduct) {
            productMap.set(product.id, product);
          } else {
            const existingDate = new Date(
              existingProduct.date.replace("thg", "tháng")
            );
            const newDate = new Date(product.date.replace("thg", "tháng"));
            if (newDate > existingDate) {
              productMap.set(product.id, product);
            }
          }
        });

        const uniqueProducts = Array.from(productMap.values());
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        alert("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <svg
          className="animate-spin h-12 w-12 text-primary-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
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
        <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  }

  return <div>AdminDashboard</div>;
};

export default AdminDashboard;
