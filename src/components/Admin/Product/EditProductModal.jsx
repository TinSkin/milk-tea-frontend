import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import { X } from "lucide-react";
import { editProductSchema } from "../../../utils/editProductSchema";

const EditProductModal = ({
  editingProduct,
  onUpdate,
  onClose,
  isLoading,
  imagePreviews,
  handleImageInputChange,
  availableToppings,
  availableCategories,
}) => {
  const initialValues = {
    name: editingProduct?.name || "",
    images: Array.isArray(editingProduct?.images)
      ? editingProduct.images
      : typeof editingProduct?.images === "string"
      ? editingProduct.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    price: editingProduct?.price || "",
    sizeOptions: editingProduct?.sizeOptions || [],
    toppings: Array.isArray(editingProduct?.toppings)
      ? editingProduct.toppings.map((topping) =>
          typeof topping === "object" ? topping._id : topping
        )
      : [],
    description: editingProduct?.description || "",
    category: editingProduct?.category || "",
  };

  //! Handle submit
  const handleSubmit = async (values) => {
    // Chuyển image từ chuỗi sang mảng nếu nhập nhiều URL
    const images =
      typeof values.images === "string"
        ? values.images
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        : values.images;

    // Chuyển price về số (bỏ dấu phẩy nếu có)
    const price =
      values.sizeOptions.length > 0
        ? Math.min(...values.sizeOptions.map((opt) => Number(opt.price)))
        : 0;

    // Chuyển toppings về mảng
    const toppings = values.toppings.map((topping) =>
      typeof topping === "object" ? topping._id : topping
    );
    // Format lại sizeOptions về đúng kiểu số
    const sizeOptions = values.sizeOptions.map((opt) => ({
      size: opt.size,
      price: Number(opt.price),
    }));

    const submitData = {
      ...values,
      images,
      price,
      sizeOptions,
      toppings,
    };

    await onUpdate(submitData);
  };

  //! Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto mx-4">
        <Formik
          initialValues={initialValues}
          validationSchema={editProductSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, dirty, errors, touched }) => {
            return (
              <>
                <PriceSyncer />
                <Form className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-green_starbuck">
                      Chỉnh sửa sản phẩm
                    </h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">ID:</span>{" "}
                      {editingProduct?._id?.slice(-8) || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Ngày tạo:</span>{" "}
                      {editingProduct?.createdAt
                        ? new Date(editingProduct.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </p>
                  </div>

                  {/* ID và Tên */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="name"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green_starbuck focus:border-transparent"
                        placeholder="Nhập tên sản phẩm"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      rows="3"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green_starbuck focus:border-transparent resize-none"
                      placeholder="Nhập mô tả sản phẩm"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="category"
                      as="select"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green_starbuck focus:border-transparent"
                      value={values.category}
                    >
                      <option value="">Chọn danh mục</option>
                      {availableCategories && availableCategories.length > 0 ? (
                        availableCategories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có danh mục
                        </option>
                      )}
                    </Field>
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Ảnh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Ảnh <span className="text-red-500">*</span>
                    </label>
                    <Field name="images">
                      {({ field, form }) => (
                        <input
                          {...field}
                          type="text"
                          value={
                            Array.isArray(field.value)
                              ? field.value.join(", ")
                              : field.value
                          }
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-green_starbuck focus:border-transparent"
                          placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                          onChange={(e) => {
                            const value = e.target.value;
                            const imageArray = value
                              .split(",")
                              .map((url) => url.trim())
                              .filter((url) => url);
                            form.setFieldValue("images", imageArray);
                            handleImageInputChange(e);
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="images"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />

                    {/* Image Preview */}
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {imagePreviews.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-24 h-24 object-cover rounded border"
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/150?text=Image+Not+Found")
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Giá cơ bản */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá cơ bản (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="basePrice"
                      type="number"
                      className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                      placeholder="Giá thấp nhất của các size"
                      disabled
                      value={
                        values.sizeOptions.length > 0 &&
                        values.sizeOptions.some(
                          (opt) => opt.price !== "" && !isNaN(Number(opt.price))
                        )
                          ? Math.min(
                              ...values.sizeOptions
                                .filter(
                                  (opt) =>
                                    opt.price !== "" &&
                                    !isNaN(Number(opt.price))
                                )
                                .map((opt) => Number(opt.price))
                            ).toLocaleString("vi-VN")
                          : ""
                      }
                    />
                    <ErrorMessage
                      name="basePrice"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Size Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size và Giá
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
                          className="flex items-center gap-2 mb-2"
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
                          <span className="w-6 font-medium">{size}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={`Giá size ${size}`}
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green_starbuck focus:border-transparent disabled:bg-gray-100"
                            value={
                              currentPrice !== ""
                                ? Number(currentPrice).toLocaleString("vi-VN")
                                : ""
                            }
                            onChange={(e) => {
                              // Loại bỏ dấu phẩy khi nhập lại thành số
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Toppings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn Topping
                    </label>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 max-h-32 overflow-y-auto border rounded p-2">
                      {availableToppings.map((topping, index) => {
                        const isChecked = values.toppings.includes(topping._id);
                        return (
                          <label
                            key={index}
                            className="flex items-center mb-1 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updatedToppings = e.target.checked
                                  ? [...values.toppings, topping._id]
                                  : values.toppings.filter(
                                      (id) => id !== topping._id
                                    );
                                setFieldValue("toppings", updatedToppings);
                              }}
                              className="mr-2 rounded"
                            />
                            <span className="truncate">
                              {topping.name} (+
                              {topping.extraPrice.toLocaleString("vi-VN")}₫)
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Change Indicator */}
                  {dirty && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Bạn có thay đổi chưa được lưu
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                      // disabled={isLoading || !dirty}
                    >
                      {isLoading ? (
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
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật"
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

export default EditProductModal;
