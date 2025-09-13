import { useNavigate } from "react-router-dom"; // Import useNavigate

import "./style.css"

const Unauthorized = () => {
  const navigate = useNavigate(); // Khởi tạo navigate

  const handleLogout = () => {
    localStorage.clear(); // Xóa localStorage
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    <>
      <div className="text-center mt-20 text-red-600 font-semibold text-xl">
        🚫 Bạn không có quyền truy cập trang này.
      </div>
      <div className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow text-center">
        <button
          onClick={handleLogout} // Gọi hàm handleLogout
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Quay Lại
        </button>
      </div>
    </>
  );
};

export default Unauthorized;
