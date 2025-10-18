import { useState, useEffect, useRef } from "react";
import { X, Search, Package, Lightbulb } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Select from "react-select";
import { useRequestManagerStore } from "../../../../../store/request/requestManagerStore";
import { useManagerStore } from "../../../../../store/managerStore";
import Notification from "../../../../ui/Notification";
import {
  addProductRequestSchema,
  createProductRequestSchema,
} from "@/utils/requests";

const CreateProductRequestModal = ({ isOpen, onClose, onSuccess }) => {
  // Chuyển đổi giữa tab
  const [activeTab, setActiveTab] = useState("existing");

  // Quản lí state và store dữ liệu
  const { submitCreateRequest } = useRequestManagerStore();
  const {
    categories,
    toppings,
    storeInfo,
    fetchMyStoreCategories,
    fetchMyStoreToppings,
  } = useManagerStore();

  // State cho tab "Thêm sản phẩm có sẵn"
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu sản phẩm có sẵn
  const existingProductInitialValues = {
    selectedProductId: "",
    reason: "",
  };

  // Dữ liệu sản phẩm mới
  const newProductInitialValues = {
    name: "",
    description: "",
    images: "", // String thay vì array để dễ nhập
    category: "",
    sizeOptions: [],
    price: 0,
    toppings: [],
    reason: "",
  };

  //! Load dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      loadFormData();
      if (activeTab === "existing") {
        loadAvailableProducts();
      }
    }
  }, [isOpen, activeTab]);

  //! Filter products khi search
  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        availableProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(availableProducts);
    }
  }, [searchTerm, availableProducts]);

  //! Load dữ liệu cần thiết cho form
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

  // TODO: Load danh sách sản phẩm hệ thống chưa có ở cửa hàng (MOCK DATA)
  const loadAvailableProducts = async () => {
    try {
      // Tạm thời mock data - sau này sẽ gọi API thực
      const mockProducts = [
        {
          _id: "1",
          name: "Trà Đào Cam Sả",
          category: { _id: "1", name: "Trà trái cây" },
          images: ["https://example.com/image1.jpg"],
          description: "Trà đào thơm ngon với hương cam sả tươi mát",
          sizeOptions: [
            { size: "M", price: 45000 },
            { size: "L", price: 55000 },
          ],
        },
        {
          _id: "2",
          name: "Cà Phê Đen Đá",
          category: { _id: "2", name: "Cà phê" },
          images: ["https://example.com/image2.jpg"],
          description: "Cà phê đen đậm đà, thơm ngon",
          sizeOptions: [
            { size: "M", price: 25000 },
            { size: "L", price: 35000 },
          ],
        },
      ];
      setAvailableProducts(mockProducts);
    } catch (error) {
      console.error("Error loading available products:", error);
      Notification.error("Lỗi", "Không thể tải danh sách sản phẩm");
    }
  };

  //! Xử lí submit cho tab "Thêm sản phẩm có sẵn"
  const handleSubmitExistingProduct = async (values, { setSubmitting }) => {
    try {
      const selectedProduct = availableProducts.find(
        (p) => p._id === values.selectedProductId
      );
      if (!selectedProduct)
        throw new Error("Không tìm thấy sản phẩm được chọn");

      const requestData = {
        storeId: storeInfo?._id,
        payload: {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          description: selectedProduct.description,
          images: selectedProduct.images,
          category: selectedProduct.category._id,
          sizeOptions: selectedProduct.sizeOptions,
          price: selectedProduct.sizeOptions[0]?.price || 0,
          toppings: selectedProduct.toppings || [],
          status: "available",
          currency: "VNĐ",
          metaTitle: selectedProduct.name,
          metaDescription: selectedProduct.description,
        },
        reason:
          values.reason ||
          `Yêu cầu thêm sản phẩm "${selectedProduct.name}" vào cửa hàng`,
        attachments: [],
        tags: ["add-existing-product"],
      };

      await submitCreateRequest("product", requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi yêu cầu thêm sản phẩm "${selectedProduct.name}" tới Admin`
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting existing product request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Xử lí submit cho tab "Đề xuất sản phẩm mới"
  const handleSubmitNewProduct = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    try {
      console.log("Submitting create product request:", values);

      // Process images - chuyển từ string thành array
      const images =
        typeof values.images === "string"
          ? values.images
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          : values.images;

      // Process sizeOptions - đảm bảo price là số
      const sizeOptions = (values.sizeOptions || []).map((opt) => ({
        size: opt.size,
        price: Number(opt.price),
      }));

      // Create request data theo format backend
      const requestData = {
        storeId: storeInfo?._id,
        payload: {
          name: values.name,
          description: values.description,
          images,
          category: values.category,
          sizeOptions,
          price: sizeOptions[0]?.price || 0, // Lấy giá của size đầu tiên làm giá cơ bản
          toppings: values.toppings || [],
          status: "available",
          currency: "VNĐ",
          metaTitle: values.name,
          metaDescription: values.description,
        },
        reason: values.reason || `Đề xuất tạo sản phẩm mới: "${values.name}"`,
        attachments: [],
        tags: ["create-product-request"],
      };

      await submitCreateRequest("product", requestData);

      Notification.success(
        "Gửi yêu cầu thành công!",
        `Đã gửi đề xuất sản phẩm mới "${values.name}" tới Admin`
      );

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting create product request:", error);
      Notification.error(
        "Gửi yêu cầu thất bại",
        error.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // DANH MỤC của cửa hàng có sẵn để lựa chọn
  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  // TOPPING của cửa hàng có sẵn để lựa chọn
  const toppingOptions = toppings.map((topping) => ({
    value: topping._id,
    label: `${topping.name} (+${topping.extraPrice?.toLocaleString()}₫)`,
  }));

  //! Xử lí khi click ra ngoài modal (chỉ đóng khi không đang submit)
//   const downOnBackdrop = useRef(false);
  if (!open) return null;

  const onMouseDown = (e) => {
    downOnBackdrop.current = e.target === e.currentTarget; // chỉ đánh dấu nếu bắt đầu ở backdrop
  };

  const onMouseUp = (e) => {
    const upOnBackdrop = e.target === e.currentTarget;
    if (downOnBackdrop.current && upOnBackdrop) onClose(); // chỉ đóng nếu down & up đều ở backdrop
    downOnBackdrop.current = false;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        className="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Yêu cầu thêm sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("existing")}
            className={`flex-1 py-3 px-6 text-center font-medium transition ${
              activeTab === "existing"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Thêm sản phẩm có sẵn
            </div>
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-3 px-6 text-center font-medium transition ${
              activeTab === "new"
                ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Đề xuất sản phẩm mới
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "existing" ? (
            // Tab thêm sản phẩm có sẵn
            <Formik
              initialValues={existingProductInitialValues}
              validationSchema={addProductRequestSchema}
              onSubmit={handleSubmitExistingProduct}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                    <strong>Hướng dẫn:</strong> Chọn sản phẩm từ hệ thống mà cửa
                    hàng bạn chưa có để gửi yêu cầu thêm vào menu.
                  </div>

                  {/* Tìm kiếm */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Products grid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chọn sản phẩm *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() =>
                            setFieldValue("selectedProductId", product._id)
                          }
                          className={`p-4 border rounded-lg cursor-pointer transition ${
                            values.selectedProductId === product._id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/60?text=No+Image";
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {product.category?.name}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {product.sizeOptions?.map((option, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    {option.size}:{" "}
                                    {option.price?.toLocaleString()}₫
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredProducts.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          {searchTerm
                            ? "Không tìm thấy sản phẩm"
                            : "Đang tải sản phẩm..."}
                        </div>
                      )}
                    </div>
                    <ErrorMessage
                      name="selectedProductId"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do yêu cầu (tùy chọn)
                    </label>
                    <Field
                      as="textarea"
                      name="reason"
                      rows={3}
                      placeholder="Lý do yêu cầu thêm sản phẩm này..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="reason"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang gửi...
                        </span>
                      ) : (
                        "Gửi yêu cầu thêm"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            // Tab đề xuất sản phẩm mới
            <Formik
              initialValues={newProductInitialValues}
              validationSchema={createProductRequestSchema}
              onSubmit={handleSubmitNewProduct}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
                    <strong>Hướng dẫn:</strong> Đề xuất sản phẩm hoàn toàn mới
                    mà hệ thống chưa có. Admin sẽ xem xét và tạo sản phẩm nếu
                    phù hợp.
                  </div>

                  {/* Tên sản phẩm và Danh mục */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="name"
                        type="text"
                        placeholder="VD: Trà Đào Cam Sả Đặc Biệt"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      rows={4}
                      placeholder="Mô tả chi tiết về sản phẩm, nguyên liệu, hương vị..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Hình ảnh */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="images"
                      type="text"
                      placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="images"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />

                    {/* Image Preview */}
                    {values.images && values.images.trim() && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Xem trước hình ảnh:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {values.images
                            .split(",")
                            .map((url) => url.trim())
                            .filter((url) => url && url !== "")
                            .filter((url) => {
                              // Kiểm tra URL có hợp lệ không
                              try {
                                new URL(url);
                                return true;
                              } catch {
                                return (
                                  url.startsWith("http") ||
                                  url.startsWith("data:")
                                );
                              }
                            })
                            .map((url, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/200x192?text=Invalid+URL";
                                    e.target.onerror = null; // Tránh infinite loop
                                  }}
                                  onLoad={(e) => {
                                    // Reset error handler khi load thành công
                                    e.target.onerror = (er) => {
                                      er.target.src =
                                        "https://via.placeholder.com/200x192?text=Error";
                                      er.target.onerror = null;
                                    };
                                  }}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Size Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kích thước và giá <span className="text-red-500">*</span>
                    </label>
                    {["S", "M", "L"].map((size) => {
                      const isChecked = (values.sizeOptions || []).some(
                        (opt) => opt.size === size
                      );
                      const currentPrice =
                        (values.sizeOptions || []).find(
                          (opt) => opt.size === size
                        )?.price || "";

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
                                  ...(values.sizeOptions || []),
                                  { size, price: "" },
                                ]);
                              } else {
                                setFieldValue(
                                  "sizeOptions",
                                  (values.sizeOptions || []).filter(
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
                            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
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
                                (values.sizeOptions || []).map((opt) =>
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
                      Topping đề xuất (tùy chọn)
                    </label>
                    <Select
                      isMulti
                      options={toppingOptions}
                      value={toppingOptions.filter((opt) =>
                        values.toppings?.includes(opt.value)
                      )}
                      onChange={(options) =>
                        setFieldValue(
                          "toppings",
                          options?.map((opt) => opt.value) || []
                        )
                      }
                      placeholder="Chọn topping..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Lý do */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do đề xuất (tùy chọn)
                    </label>
                    <Field
                      name="reason"
                      as="textarea"
                      rows={3}
                      placeholder="Giải thích tại sao nên thêm sản phẩm này vào hệ thống..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="reason"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang gửi...
                        </span>
                      ) : (
                        "Gửi đề xuất"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProductRequestModal;
