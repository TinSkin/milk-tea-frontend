// components/Admin/ConfirmDeleteModal.jsx
import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa item này không?",
  itemName = "",
  deleteType = "soft", // "soft" or "hard"
  confirmText = "Xóa",
  cancelText = "Hủy",
}) => {
  if (!isOpen) return null;

  //! Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  //! Handle confirm action
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  //! Dynamic styling based on delete type
  const getDeleteTypeConfig = () => {
    switch (deleteType) {
      case "hard":
        return {
          icon: <Trash2 className="w-12 h-12 text-red-600" />,
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          title: "Xóa vĩnh viễn",
          warningText: "Thao tác này sẽ xóa hoàn toàn và không thể khôi phục.",
        };
      case "soft":
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          iconBg: "bg-yellow-100",
          confirmButton:
            "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          title: "Thay đổi trạng thái",
          warningText: "Bạn có thể sẽ không khôi phục được sau này.",
        };
    }
  };

  const config = getDeleteTypeConfig();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${config.iconBg}`}>
              {config.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">{message}</p>

          {itemName && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="font-medium text-gray-900">{itemName}</p>
            </div>
          )}

          <p
            className={`text-sm ${
              deleteType === "hard" ? "text-red-600" : "text-yellow-600"
            } font-medium`}
          >
            {config.warningText}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${config.confirmButton} disabled:bg-gray-400`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </span>
            ) : (
              confirmText
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
