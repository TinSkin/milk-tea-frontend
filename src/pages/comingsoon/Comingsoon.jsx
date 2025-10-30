import React from "react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#0b3042] text-[#e59c36]">
      <h1 className="text-7xl font-bold mb-4">COMING SOON</h1>
      <p className="text-gray-300 mb-8 text-lg">
        Trang này đang được xây dựng, vui lòng quay lại sau.
      </p>
      <Link
        to="/admin/products" 
        className="border-2 border-[#e59c36] px-8 py-3 rounded-md hover:bg-[#e59c36] hover:text-[#0b3042] transition-all duration-300 font-semibold"
      >
        Trở về trang quản lý sản phẩm
      </Link>
    </div>
  );
};

export default ComingSoon;
