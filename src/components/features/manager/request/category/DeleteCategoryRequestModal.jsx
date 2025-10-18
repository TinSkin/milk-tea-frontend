import React, { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";

const DeleteCategoryRequestModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  categoryData 
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store hooks
  const { submitDeleteRequest } = useRequestManagerStore();
  const { storeInfo, fetchMyStore } = useManagerStore();

  // Load store info nếu chưa có
  useEffect(() => {
    if (isOpen && !storeInfo?._id) {
      console.log("Loading store info for delete category modal...");
      fetchMyStore();
    }
  }, [isOpen, storeInfo, fetchMyStore]);

  if (!isOpen || !categoryData) return null;

  //! Backdrop click handler
  const handleBackdropClick = (e) => {
    if (
      e.target === e.currentTarget && 
      !isSubmitting &&
      !e.target.closest('.modal-content') &&
      e.clientX < window.innerWidth - 20
    ) {
      onClose();
    }
  };

  //! Xử lí khi submit yêu cầu xóa danh mục
  const handleSubmit = async () => {
    if (!reason.trim()) {
      Notification.warning("Cần nhập lý do", "Vui lòng nhập lý do để gửi yêu cầu xóa danh mục");
      return;
    }

    if (reason.trim().length < 10) {
      Notification.warning("Lý do quá ngắn", "Lý do phải có ít nhất 10 ký tự");
      return;
    }

    // Kiểm tra storeId
    if (!storeInfo?._id) {
      Notification.error("Thiếu thông tin cửa hàng", "Vui lòng tải lại trang và thử lại");
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo request data theo format backend
      const requestData = {
        storeId: storeInfo._id,
        reason: reason.trim(),
        tags: ["delete-category-request"]
      };

      await submitDeleteRequest('category', categoryData._id, requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu xóa danh mục "${categoryData.name}" tới Admin`
      );

      // Reset form và đóng modal
      setReason("");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting delete category request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại", 
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu xóa danh mục"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  //! Đóng modal
  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="modal-content bg-white rounded-lg w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-100">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Yêu cầu xóa danh mục
              </h3>
              <p className="text-sm text-gray-500">
                Gửi yêu cầu tới Admin để xóa danh mục khỏi cửa hàng
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center text-green-600 font-bold text-lg">
                  {categoryData.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {categoryData.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {categoryData.description || "Không có mô tả"}
                </p>
                <div className="text-xs text-gray-500">
                  Trạng thái: {categoryData.status === 'available' ? 'Hoạt động' : 'Không hoạt động'}
                </div>
              </div>
            </div>
          </div>

          {/* Warning message */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Lưu ý quan trọng</p>
              <p className="text-yellow-700">
                Yêu cầu xóa danh mục sẽ được gửi tới Admin để xem xét. 
                Danh mục chỉ bị xóa khỏi cửa hàng của bạn, không ảnh hưởng đến hệ thống.
              </p>
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do yêu cầu xóa <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="VD: Danh mục không còn phù hợp với mô hình kinh doanh, ít sản phẩm..."
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Mô tả chi tiết lý do để Admin có thể xem xét
              </p>
              <span className="text-xs text-gray-400">
                {reason.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Gửi yêu cầu xóa
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryRequestModal;