import React from "react";

function ViewUserModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 font-sans">
        <h2 className="text-xl font-bold text-dark_blue mb-4 text-center">Chi tiết tài khoản</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700">Tên đăng nhập:</span>
            <span className="ml-2 text-dark_blue">{user.userName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Email:</span>
            <span className="ml-2 text-camel">{user.email}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Số điện thoại:</span>
            <span className="ml-2 text-dark_blue">{user.phoneNumber || "Chưa cập nhật"}</span>
          </div>
          {user.fullName && (
            <div>
              <span className="font-semibold text-gray-700">Họ tên:</span>
              <span className="ml-2">{user.fullName}</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-700">Vai trò:</span>
            <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
              user.role === "admin"
                ? "bg-red-100 text-red-700"
                : user.role === "manager"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {user.role}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Xác minh:</span>
            <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
              user.isVerified
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-100 text-blue-700"
            }`}>
              {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Trạng thái:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
              user.status === "active"
                ? "text-green-700 bg-green-100"
                : "text-gray-600 bg-gray-100"
            }`}>
              {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Ngày tạo:</span>
            <span className="ml-2">{new Date(user.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Cập nhật gần nhất:</span>
            <span className="ml-2">{new Date(user.updatedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-camel text-white rounded font-semibold hover:bg-logo_color transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewUserModal;