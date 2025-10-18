import React, { useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import { X, Edit3 } from "lucide-react";
import Select from "react-select";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";
import { updateProductRequestSchema } from "@/utils/requests";

const UpdateProductRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  productData,
}) => {
  // Quản lý dữ liệu store
  const { submitUpdateRequest } = useRequestManagerStore();
  const {
    categories,
    toppings,
    storeInfo,
    fetchMyStoreCategories,
    fetchMyStoreToppings,
  } = useManagerStore();

  // Dữ liệu ban đầu từ sản phẩm hiện có
  const initialValues = {
    name: productData?.name || "",
    description: productData?.description || "",
    images: productData?.images || [],
    category: productData?.category?._id || productData?.category || "",
    sizeOptions: productData?.sizeOptions || [],
    toppings:
      productData?.toppings?.map((t) => (typeof t === "object" ? t._id : t)) ||
      [],
    reason: "",
  };

  //! Tải dữ liệu khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    try {
      await Promise.all([
        fetchMyStoreCategories({ status: "available" }),
        fetchMyStoreToppings({ status: "available" }),
      ]);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  //! Xử lí dữ liệu khi submit form
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // console.log("Bắt đầu submit update request");

      // Process images from string to array if multiple URLs
      const images =
        typeof values.images === "string"
          ? values.images
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          : values.images;

      // Format sizeOptions to proper number type
      const sizeOptions = values.sizeOptions.map((opt) => ({
        size: opt.size,
        price: Number(opt.price),
      }));

      // Process toppings to array of IDs
      const toppings = values.toppings.map((topping) =>
        typeof topping === "object" ? topping._id : topping
      );

      // Create request data theo backend controller format
      const requestData = {
        storeId: storeInfo?._id,
        payload: {
          name: values.name,
          description: values.description,
          images,
          category: values.category,
          sizeOptions,
          toppings,
          price: sizeOptions[0]?.price || 0,
        },
        original: {
          name: productData.name,
          description: productData.description,
          images: productData.images,
          category: productData.category?._id || productData.category,
          sizeOptions: productData.sizeOptions || [],
          toppings:
            productData.toppings?.map((t) =>
              typeof t === "object" ? t._id : t
            ) || [],
          price: productData.sizeOptions?.[0]?.price || productData.price || 0,
        },
        reason: values.reason,
        attachments: [],
        tags: ["update-product-request"],
      };

      //   console.log("Request data format:", JSON.stringify(requestData, null, 2));
      //   console.log("Calling submitUpdateRequest with:", "product", productData._id, requestData);

      await submitUpdateRequest("product", productData._id, requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu cập nhật sản phẩm "${values.name}" tới Admin`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting update product request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Xử lí khi click ra ngoài modal (chỉ đóng khi không đang submit)
  const updateModalBackdropRef = useRef(false);

  const handleBackdropMouseDown = (e) => {
    updateModalBackdropRef.current = e.target === e.currentTarget; // chỉ đánh dấu nếu bắt đầu ở backdrop
  };

  const handleBackdropMouseUp = (e) => {
    const upOnBackdrop = e.target === e.currentTarget;
    if (updateModalBackdropRef.current && upOnBackdrop) onClose(); // chỉ đóng nếu down & up đều ở backdrop
    updateModalBackdropRef.current = false;
  };

  //! Xử lí đồng bộ giá từ các tùy chọn kích thước
  function PriceSyncer() {
    const { values, setFieldValue } = useFormikContext();
    useEffect(() => {
      const validPrices = values.sizeOptions
        .filter((opt) => opt.price !== "" && !isNaN(Number(opt.price)))
        .map((opt) => Number(opt.price));
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : "";
      setFieldValue("price", minPrice);
    }, [values.sizeOptions, setFieldValue]);
    return null;
  }

  if (!isOpen || !productData) return null;

  // Danh mục có sẵn để chọn
  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  // Topping có sẵn để chọn
  const toppingOptions = toppings.map((topping) => ({
    value: topping._id,
    label: `${topping.name} (+${topping.extraPrice?.toLocaleString()}₫)`,
  }));

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={updateProductRequestSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => {
            // Debug validation errors
            console.log("🔴 Validation errors:", errors);
            console.log("📝 Form values:", values);
            console.log("✋ Touched fields:", touched);

            return (
              <>
                <PriceSyncer />
                <Form>
                  {/* Header */}
                  <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 z-10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Edit3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Yêu cầu cập nhật sản phẩm
                        </h2>
                        <p className="text-sm text-gray-600">
                          {productData.name}
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
                    <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <strong>Hướng dẫn:</strong> Thay đổi thông tin sản phẩm mà
                      bạn muốn cập nhật. Admin sẽ xem xét và phê duyệt các thay
                      đổi của bạn.
                    </div>

                    {/* Product name and category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VD: Trà Đào Cam Sả Đặc Biệt"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Danh mục <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={categoryOptions}
                          value={categoryOptions.find(
                            (opt) => opt.value === values.category
                          )}
                          onChange={(option) =>
                            setFieldValue("category", option?.value || "")
                          }
                          placeholder="Chọn danh mục"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                        <ErrorMessage
                          name="category"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="description"
                        as="textarea"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Mô tả chi tiết về sản phẩm, nguyên liệu, hương vị..."
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Ảnh sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <Field name="images">
                        {({ field, form }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                            value={
                              Array.isArray(values.images)
                                ? values.images.join(", ")
                                : values.images
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              form.setFieldValue(
                                "images",
                                value.split(",").map((url) => url.trim())
                              );
                            }}
                          />
                        )}
                      </Field>
                      <p className="text-xs text-gray-500 mt-1">
                        Nhập các URL ảnh cách nhau bằng dấu phẩy
                      </p>
                      <ErrorMessage
                        name="images"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />

                      {/* Image Preview */}
                      {values.images &&
                        Array.isArray(values.images) &&
                        values.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {values.images
                              .filter(
                                (img) => img && img.trim() && img.trim() !== ""
                              )
                              .filter((img) => {
                                // Kiểm tra URL có hợp lệ không
                                try {
                                  new URL(img.trim());
                                  return true;
                                } catch {
                                  return (
                                    img.trim().startsWith("http") ||
                                    img.trim().startsWith("data:")
                                  );
                                }
                              })
                              .map((src, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={src.trim()}
                                    alt={`preview-${idx}`}
                                    className="w-20 h-20 object-cover rounded border"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/80x80?text=No+Image";
                                      e.target.onerror = null; // Tránh infinite loop
                                    }}
                                    onLoad={(e) => {
                                      // Reset error handler khi load thành công
                                      e.target.onerror = (er) => {
                                        er.target.src =
                                          "https://via.placeholder.com/80x80?text=Error";
                                        er.target.onerror = null;
                                      };
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Size Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kích thước và giá{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {["S", "M", "L"].map((size) => {
                        const isChecked = values.sizeOptions.some(
                          (opt) => opt.size === size
                        );
                        const currentPrice =
                          values.sizeOptions.find((opt) => opt.size === size)
                            ?.price || "";

                        return (
                          <div
                            key={size}
                            className="flex items-center gap-3 mb-3 p-3 border border-gray-200 rounded-lg"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("sizeOptions", [
                                    ...values.sizeOptions,
                                    { size, price: "" },
                                  ]);
                                } else {
                                  setFieldValue(
                                    "sizeOptions",
                                    values.sizeOptions.filter(
                                      (opt) => opt.size !== size
                                    )
                                  );
                                }
                              }}
                              className="rounded"
                            />
                            <span className="w-8 font-medium text-center">
                              {size}
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder={`Giá size ${size}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                              value={
                                currentPrice !== ""
                                  ? Number(currentPrice).toLocaleString("vi-VN")
                                  : ""
                              }
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setFieldValue(
                                  "sizeOptions",
                                  values.sizeOptions.map((opt) =>
                                    opt.size === size
                                      ? {
                                          ...opt,
                                          price:
                                            rawValue === ""
                                              ? ""
                                              : Number(rawValue),
                                        }
                                      : opt
                                  )
                                );
                              }}
                              disabled={!isChecked}
                            />
                            <span className="text-gray-500">₫</span>
                          </div>
                        );
                      })}
                      <ErrorMessage
                        name="sizeOptions"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Toppings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topping (tùy chọn)
                      </label>
                      <Select
                        isMulti
                        options={toppingOptions}
                        value={toppingOptions.filter((opt) =>
                          values.toppings.includes(opt.value)
                        )}
                        onChange={(options) =>
                          setFieldValue(
                            "toppings",
                            options.map((opt) => opt.value)
                          )
                        }
                        placeholder="Chọn topping..."
                        className="react-select-container"
                        classNamePrefix="react-select"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Giải thích lý do tại sao cần cập nhật sản phẩm này..."
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
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
              </>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default UpdateProductRequestModal;
