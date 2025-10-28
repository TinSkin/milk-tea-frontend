import React from "react";
import { useNavigate } from "react-router-dom";

function NavbarMenu() {
  const navigate = useNavigate();

  // Handle to redirect to landing page
  const handleDashboardClick = () => {
    navigate("/");
  };

  // Handle to redirect to login page
  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-10" />
      </div>

      {/* Search and Region Selector */}
      <div className="flex items-center gap-4 flex-grow max-w-3xl mx-8">
        <ul className="flex gap-6 text-gray-800 font-medium">
          <li
            className="hover:text-yellow-500 cursor-pointer"
            onClick={handleDashboardClick}
          >
            Trang chủ
          </li>
          <li className="hover:text-yellow-500 cursor-pointer">Giới thiệu</li>
          <li className="hover:text-yellow-500 cursor-pointer">Sản phẩm</li>
          <li
            className="hover:text-yellow-500 cursor-pointer"
          >
            Menu
          </li>
        </ul>
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full w-full">
          <span className="text-gray-400 mr-2"></span>

          <span className="text-sm text-gray-500">Tìm kiếm sản phẩm...</span>
        </div>
        {/* <div className="border px-4 py-2 rounded-full cursor-pointer text-sm hover:bg-gray-100 transition">
          Miền Nam ⌄
        </div> */}
      </div>

      {/* Login Button */}
      <div>
        <button
          onClick={handleLoginClick}
          className="bg-yellow-400 text-white px-5 py-2 rounded-full hover:bg-yellow-500 transition text-sm"
        >
          Đăng nhập
        </button>
      </div>
    </nav>
  );
}

export default NavbarMenu;
