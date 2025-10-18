import React, { useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { X, Edit3 } from "lucide-react";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";
import { updateToppingRequestSchema } from "../../../../../utils/requests";

const UpdateToppingRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  toppingData,
}) => {
  // Quản lý dữ liệu store
  const { submitUpdateRequest } = useRequestManagerStore();
  const { storeInfo } = useManagerStore();

  // Dữ liệu ban đầu từ topping hiện có
  const initialValues = {
    name: toppingData?.name || "",
    description: toppingData?.description || "",
    extraPrice: toppingData?.extraPrice || 0,
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
          name: values.name,
          description: values.description,
          extraPrice: Number(values.extraPrice),
        },
        original: {
          name: toppingData.name,
          description: toppingData.description,
          extraPrice: toppingData.extraPrice,
        },
        reason: values.reason,
        attachments: [],
        tags: ["update-topping-request"],
      };

      await submitUpdateRequest("topping", toppingData._id, requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu cập nhật topping "${values.name}" tới Admin`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting update topping request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Backdrop logic
  const updateToppingModalBackdropRef = useRef(false);

  const handleBackdropMouseDown = (e) => {
    updateToppingModalBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropMouseUp = (e) => {
    const upOnBackdrop = e.target === e.currentTarget;
    if (updateToppingModalBackdropRef.current && upOnBackdrop) onClose();
    updateToppingModalBackdropRef.current = false;
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
        className="modal-content bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={updateToppingRequestSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Header */}
              <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b bg-gradient-to-r from-orange-50 to-amber-50 z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Edit3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Yêu cầu cập nhật topping
                    </h2>
                    <p className="text-sm text-gray-600">
                      {toppingData.name}
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
                <div className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <strong>Hướng dẫn:</strong> Thay đổi thông tin topping mà
                  bạn muốn cập nhật. Admin sẽ xem xét và phê duyệt các thay
                  đổi của bạn.
                </div>

                {/* Topping name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên topping <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="VD: Trân châu đen, Thạch dừa, Pudding..."
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
                    Mô tả topping <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Mô tả chi tiết về topping, nguyên liệu, đặc điểm..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Extra Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá thêm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Field name="extraPrice">
                      {({ field, form }) => (
                        <input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="VD: 5000"
                          value={
                            values.extraPrice !== "" && values.extraPrice !== 0
                              ? Number(values.extraPrice).toLocaleString("vi-VN")
                              : ""
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, "");
                            form.setFieldValue(
                              "extraPrice",
                              rawValue === "" ? "" : Number(rawValue)
                            );
                          }}
                        />
                      )}
                    </Field>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₫
                    </span>
                  </div>
                  <ErrorMessage
                    name="extraPrice"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Giải thích lý do tại sao cần cập nhật topping này..."
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
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center"
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

export default UpdateToppingRequestModal;