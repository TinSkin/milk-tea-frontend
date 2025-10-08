import React from "react";
import { X, User, Mail, Phone, Shield, CheckCircle2, Clock, Calendar } from "lucide-react";

function ViewUserModal({ user, onClose }) {
  if (!user) return null;

  //! Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  //! Get role display info
  const getRoleInfo = (role) => {
    switch (role) {
      case "admin":
        return { label: "Admin", bgColor: "bg-red-100", textColor: "text-red-700" };
      case "storeManager":
        return { label: "Store Manager", bgColor: "bg-blue-100", textColor: "text-blue-700" };
      case "staff":
        return { label: "Staff", bgColor: "bg-yellow-100", textColor: "text-yellow-700" };
      default:
        return { label: "Customer", bgColor: "bg-green-100", textColor: "text-green-700" };
    }
  };

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green_starbuck to-green_starbuck/80 text-white p-6 rounded-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Chi tiết tài khoản</h2>
                <p className="text-green-50 text-sm">Thông tin người dùng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Thông tin cá nhân
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Tên đăng nhập:</span>
                  <p className="font-semibold text-gray-900">{user.userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="font-semibold text-blue-600">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Số điện thoại:</span>
                  <p className="font-semibold text-gray-900">
                    {user.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {user.fullName && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Họ tên:</span>
                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Trạng thái tài khoản
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-600">Vai trò:</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-600">Xác minh:</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.isVerified
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Thời gian
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Ngày tạo:</span>
                  <p className="font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-600">Cập nhật gần nhất:</span>
                  <p className="font-semibold text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-green_starbuck text-white rounded-lg font-semibold hover:bg-green_starbuck/90 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewUserModal;