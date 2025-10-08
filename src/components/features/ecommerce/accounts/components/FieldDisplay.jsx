import React from "react";
import { FIELD_METADATA } from "../config/roleConfig";

const FieldDisplay = ({ fieldKey, value, user }) => {
  const metadata = FIELD_METADATA[fieldKey];

  if (!metadata || value === undefined || value === null) {
    return null;
  }

  const IconComponent = metadata.icon;

  //! Format giá trị dựa trên loại field
  const formatValue = () => {
    switch (metadata.type) {
      case "currency":
        return value
          ? `${Number(value).toLocaleString("vi-VN")}đ`
          : "Chưa cập nhật";

      case "date":
        return value
          ? new Date(value).toLocaleDateString("vi-VN")
          : "Chưa cập nhật";

      case "datetime":
        return value
          ? new Date(value).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Chưa cập nhật";

      case "phone":
        return value || "Chưa cập nhật";

      case "email":
        return value || "Chưa cập nhật";

      case "array":
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(", ") : "Chưa có dữ liệu";
        }
        return value || "Chưa cập nhật";

      case "number":
        return value !== undefined ? value.toString() : "Chưa cập nhật";

      case "percentage":
        return value ? `${value}%` : "Chưa đánh giá";

      case "role":
        return getRoleDisplay(value);

      case "status":
        return getStatusDisplay(value);

      case "verified":
        return getVerifiedDisplay(value);

      case "store":
        return getStoreDisplay(value, user);

      default:
        return value || "Chưa cập nhật";
    }
  };

  //! Lấy và hiển thị vai trò
  const getRoleDisplay = (role) => {
    const roleConfig = {
      admin: { label: "Admin", bg: "bg-red-100", text: "text-red-700" },
      storeManager: {
        label: "Store Manager",
        bg: "bg-blue-100",
        text: "text-blue-700",
      },
      staff: { label: "Staff", bg: "bg-yellow-100", text: "text-yellow-700" },
      customer: {
        label: "Customer",
        bg: "bg-green-100",
        text: "text-green-700",
      },
    };

    const config = roleConfig[role] || roleConfig.customer;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  //! Hiển thị trạng thái tài khoản
  const getStatusDisplay = (status) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {status === "active" ? "Hoạt động" : "Không hoạt động"}
      </span>
    );
  };

  //! Hiển thị xác minh của tài khoản
  const getVerifiedDisplay = (isVerified) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isVerified
            ? "bg-orange-100 text-orange-600"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {isVerified ? "Đã xác minh" : "Chưa xác minh"}
      </span>
    );
  };

  //! Hiển thị cửa hàng
  const getStoreDisplay = (storeId, user) => {
    // Cho là user.store chứa thông tin cửa hàng
    if (user.store && user.store.name) {
      return user.store.name;
    }
    return storeId || "Chưa được gán";
  };

  //! Lấy màu chữ dựa trên loại field
  const getValueColor = () => {
    switch (metadata.type) {
      case "email":
        return "text-blue-600";
      case "currency":
        return "text-green-600";
      case "role":
      case "status":
      case "verified":
        return ""; // Custom styling handled in format functions
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <IconComponent className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-600">
          {metadata.label}:
        </span>
        <div className={`font-semibold ${getValueColor()}`}>
          {formatValue()}
        </div>
      </div>
    </div>
  );
};

export default FieldDisplay;
