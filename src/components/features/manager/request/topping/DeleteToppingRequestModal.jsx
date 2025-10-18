import React, { useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { X, Trash2 } from "lucide-react";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";
import { deleteToppingRequestSchema } from "../../../../../utils/requests";

const DeleteToppingRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  toppingData,
}) => {
  // Quản lý dữ liệu store
  const { submitDeleteRequest } = useRequestManagerStore();
  const { storeInfo, fetchMyStore } = useManagerStore();

  // Load store info when modal opens
  useEffect(() => {
    if (isOpen && !storeInfo) {
      fetchMyStore();
    }
  }, [isOpen, storeInfo, fetchMyStore]);

  // Dữ liệu ban đầu
  const initialValues = {
    reason: "",
  };

  //! Xử lí dữ liệu khi submit form
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Kiểm tra storeId
      if (!storeInfo?._id) {
        Notification.error("Thiếu thông tin cửa hàng", "Vui lòng tải lại trang và thử lại");
        return;
      }

      // Create request data theo backend controller format
      const requestData = {
        storeId: storeInfo._id,
        payload: {
          action: "delete",
        },
        original: {
          name: toppingData.name,
          description: toppingData.description,
          extraPrice: toppingData.extraPrice,
        },
        reason: values.reason,
        attachments: [],
        tags: ["delete-topping-request"],
      };

      await submitDeleteRequest("topping", toppingData._id, requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu xóa topping "${toppingData.name}" tới Admin`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting delete topping request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Backdrop logic
  const deleteToppingModalBackdropRef = useRef(false);

  const handleBackdropMouseDown = (e) => {
    deleteToppingModalBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropMouseUp = (e) => {
    const upOnBackdrop = e.target === e.currentTarget;
    if (deleteToppingModalBackdropRef.current && upOnBackdrop) onClose();
    deleteToppingModalBackdropRef.current = false;
  };

  if (!isOpen || !toppingData) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={deleteToppingRequestSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Yêu cầu xóa topping
                    </h2>
                    <p className="text-sm text-gray-600">
                      Yêu cầu này cần được Admin phê duyệt
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ Cảnh báo: Hành động này không thể hoàn tác!
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Topping sẽ bị xóa vĩnh viễn khỏi hệ thống sau khi Admin
                    phê duyệt.
                  </p>
                </div>

                {/* Topping info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Topping sẽ bị xóa:
                  </h3>
                  <div className="flex items-center space-x-3">
                    {/* Icon with first letter */}
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-sm">
                        {toppingData.name?.charAt(0)?.toUpperCase() || "T"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {toppingData.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Giá thêm: +{toppingData.extraPrice?.toLocaleString("vi-VN")}₫
                      </p>
                      {toppingData.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {toppingData.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do xóa topping <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="reason"
                    as="textarea"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Giải thích lý do tại sao cần xóa topping này..."
                  />
                  <ErrorMessage
                    name="reason"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
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
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    "Gửi yêu cầu xóa"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DeleteToppingRequestModal;