import React, { useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { X, Edit3 } from "lucide-react";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";
import { updateCategoryRequestSchema } from "@/utils/requests";

const UpdateCategoryRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  categoryData,
}) => {
  // Quản lý dữ liệu store
  const { submitUpdateRequest } = useRequestManagerStore();
  const { storeInfo } = useManagerStore();

  // Dữ liệu ban đầu từ category hiện có
  const initialValues = {
    name: categoryData?.name || "",
    description: categoryData?.description || "",
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

      console.log("Submitting update category request with values:", values);

      // Create request data theo backend controller format
      const requestData = {
        storeId: storeInfo._id,
        payload: {
          name: values.name,
          description: values.description,
        },
        original: {
          name: categoryData.name,
          description: categoryData.description,
        },
        reason: values.reason,
        attachments: [],
        tags: ["update-category-request"],
      };

      console.log("Request data for update category:", requestData);

      await submitUpdateRequest("category", categoryData._id, requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu cập nhật danh mục "${values.name}" tới Admin`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting update category request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Backdrop logic
  const updateCategoryModalBackdropRef = useRef(false);

  const handleBackdropMouseDown = (e) => {
    updateCategoryModalBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropMouseUp = (e) => {
    const upOnBackdrop = e.target === e.currentTarget;
    if (updateCategoryModalBackdropRef.current && upOnBackdrop) onClose();
    updateCategoryModalBackdropRef.current = false;
  };

  if (!isOpen || !categoryData) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={updateCategoryRequestSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, isSubmitting }) => (
            <Form>
              {/* Header */}
              <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Yêu cầu cập nhật danh mục
                    </h2>
                    <p className="text-sm text-gray-600">
                      {categoryData.name}
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
                {/* Info banner */}
                <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <strong>Hướng dẫn:</strong> Thay đổi thông tin danh mục mà
                  bạn muốn cập nhật. Admin sẽ xem xét và phê duyệt các thay
                  đổi của bạn.
                </div>

                {/* Category name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="VD: Trà sữa, Cà phê, Smoothie..."
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả danh mục <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Mô tả chi tiết về danh mục sản phẩm..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do thay đổi <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="reason"
                    as="textarea"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Giải thích lý do tại sao cần cập nhật danh mục này..."
                  />
                  <ErrorMessage
                    name="reason"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 flex justify-end space-x-3 p-6 border-t">
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
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
                    "Gửi yêu cầu cập nhật"
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

export default UpdateCategoryRequestModal;