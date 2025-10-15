import { useCartStore } from "../../../store/cartStore";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { addOrderSchema } from "../../../utils/addOrderSchema";

// Import Component
import Notification from "../../ui/Notification";

// Import Store
import { useStoreSelectionStore } from "../../../store/storeSelectionStore";

function ProductCard(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  //! Lấy store đã chọn
  const { selectedStore } = useStoreSelectionStore();

  //! Sử dụng props.image (mảng) cho Swiper
  const images =
    Array.isArray(props.image) && props.image.length > 0
      ? props.image
      : ["/no-image.png"];

  const minPrice = props.sizeOptions?.length
    ? Math.min(...props.sizeOptions.map((opt) => Number(opt.price) || 0))
    : 0;

  //! Xử lý thêm sản phẩm vào giỏ hàng
  const addToCart = useCartStore((state) => state.addToCart);

  //! Xử lý hiển thị modal thêm sản phẩm
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  return (
    <>
      {/* Content chính */}
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Product Swiper */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={images.length > 1}
          className="rounded-md transition-transform duration-300 hover:scale-90"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={props.name || "Product image"}
                className="w-full h-72 object-cover rounded-md"
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold leading-tight mb-1">
            {props.name}
          </h3>
          <p className="text-logo_color text-sm mb-2 font-semibold">
            Từ {minPrice.toLocaleString()}đ
          </p>
          <button
            onClick={handleAddClick}
            className="bg-dark_blue hover:bg-camel text-white py-1 px-2 rounded text-sm flex items-center justify-center w-full"
          >
            <span className="mr-1">+</span> Thêm
          </button>
        </div>
      </div>

      {/* Hiển thị modal thêm sản phẩm */}
      {showAddModal && (
        <div
          onClick={(e) => {
            // chỉ đóng khi click đúng overlay (vùng tối), không phải panel
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        >
          <Formik
            initialValues={{
              name: props.name || "",
              images: props.images || "", // props.images là mảng các URL string
              sizeOption: "",
              price: 0,
              toppings: [],
              quantity: 1,
              sugarLevel: "100", // Mặc định 100%
              iceOption: "Chung", // Mặc định đá chung
            }}
            validationSchema={addOrderSchema}
            onSubmit={(values) => {
              // Kiểm tra store đã được chọn chưa
              if (!selectedStore?._id) {
                Notification.error(
                  "Vui lòng chọn cửa hàng trước khi đặt hàng!"
                );
                return;
              }

              // Tính toán giá
              const selectedSize = props.sizeOptions?.find(
                (opt) => opt.size === values.sizeOption
              );
              const sizePrice = selectedSize ? selectedSize.price : 0;
              const toppingsPrice = (values.toppings || []).reduce(
                (s, t) => s + (t.extraPrice || 0),
                0
              );
              const total =
                (sizePrice + toppingsPrice) * (values.quantity || 1);

              const newProduct = {
                _id: props._id,
                name: props.name,
                images: props.image || props.images || [],
                price: total,
                sizeOption: values.sizeOption,
                sizeOptionPrice: sizePrice,
                sugarLevel: values.sugarLevel,
                iceOption: values.iceOption,
                toppings: values.toppings || [],
                availableToppings: (props.toppings || []).map((t) => ({
                  _id: t._id,
                  name: t.name,
                  extraPrice: t.extraPrice || 0,
                })),
                sizeOptions: props.sizeOptions || [],
                quantity: values.quantity || 1,
                storeId: selectedStore._id, // Thêm store info
                storeName: selectedStore.storeName || selectedStore.name,
              };

              // Thêm trực tiếp vào giỏ hàng (không cần đăng nhập)
              addToCart(newProduct);
              setShowAddModal(false);

              // Thông báo cho Cart component cập nhật
              window.dispatchEvent(new CustomEvent("cartUpdated"));

              // Hiển thị thông báo thành công
              Notification.success("Đã thêm sản phẩm vào giỏ hàng!");
            }}
          >
            {({ values, setFieldValue }) => {
              const selectedSize = props.sizeOptions?.find(
                (opt) => opt.size === values.sizeOption
              );
              const sizePrice = selectedSize ? selectedSize.price : 0;
              const toppingsTotal = (values.toppings || []).reduce(
                (sum, t) => sum + (t.extraPrice || 0),
                0
              );
              const total =
                (sizePrice + toppingsTotal) * (values.quantity || 1);
              return (
                <Form
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white p-6 rounded-2xl shadow-xl w-[720px] max-w-[95vw] space-y-4"
                >
                  {/* Header: Ảnh + thông tin nhanh */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Cột trái: Ảnh / Swiper */}
                    <div className="sm:w-1/3 w-full">
                      {Array.isArray(props.image) && props.image.length > 1 ? (
                        <Swiper
                          modules={[Autoplay]}
                          autoplay={{
                            delay: 2000,
                            disableOnInteraction: false,
                          }}
                          loop
                          className="rounded-xl overflow-hidden shadow-sm"
                        >
                          {props.image.map((img, idx) => (
                            <SwiperSlide key={idx}>
                              <img
                                src={img}
                                alt={props.name || "Product image"}
                                className="w-full h-64 object-cover"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <img
                          src={
                            (Array.isArray(props.image) && props.image[0]) ||
                            "/no-image.png"
                          }
                          alt={props.name || "Product image"}
                          className="w-full h-64 object-cover rounded-xl shadow-sm"
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.png")
                          }
                        />
                      )}
                    </div>

                    {/* Cột phải: Thông tin + số lượng (polish) */}
                    <div className="sm:w-2/3 w-full flex flex-col justify-between">
                      <div className="flex flex-col gap-2">
                        {/* Tiêu đề */}
                        <h2 className="text-[22px] font-semibold text-slate-900">
                          {props.name}
                        </h2>

                        {/* Giá chọn size & Tổng (tính inline để không phụ thuộc biến ngoài) */}
                        {(() => {
                          const selected = props.sizeOptions?.find(
                            (opt) => opt.size === values.sizeOption
                          );
                          const sizePrice = selected ? selected.price : 0;
                          const toppingsTotal = (values.toppings || []).reduce(
                            (s, t) => s + (t.extraPrice || 0),
                            0
                          );
                          const total =
                            (sizePrice + toppingsTotal) *
                            (values.quantity || 1);

                          return (
                            <div className="space-y-1">
                              {/* “Chọn size” nhẹ nhàng hơn, label mờ + value nổi */}
                              <div className="text-sm text-slate-500">
                                Chọn size:{" "}
                                <span className="text-camel font-semibold">
                                  {sizePrice
                                    ? `${sizePrice.toLocaleString("vi-VN")}đ`
                                    : "0đ"}
                                </span>
                              </div>

                              {/* Tổng nổi bật, to/đậm, màu thương hiệu xanh */}
                              <div className="text-2xl font-bold text-green_starbuck">
                                Tổng: {total.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                          );
                        })()}

                        {/* Mô tả nhạt màu, tăng line-height cho dễ đọc */}
                        <p className="text-slate-600 leading-relaxed mt-1">
                          {props.description}
                        </p>
                      </div>

                      {/* Stepper: đổi sang “outline” để bớt nặng, đặt dưới cùng, căn trái trên mobile / phải trên desktop */}
                      <div className="mt-3 flex items-center gap-2 justify-start sm:justify-start">
                        <button
                          type="button"
                          onClick={() =>
                            values.quantity > 1 &&
                            setFieldValue("quantity", values.quantity - 1)
                          }
                          className="w-9 h-9 rounded-xl border border-dark_blue text-dark_blue grid place-items-center hover:bg-dark_blue hover:text-white transition"
                          aria-label="Giảm"
                        >
                          −
                        </button>
                        <Field
                          name="quantity"
                          type="number"
                          readOnly
                          className="w-12 text-center border rounded-xl py-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFieldValue("quantity", values.quantity + 1)
                          }
                          className="w-9 h-9 rounded-xl border border-dark_blue text-dark_blue grid place-items-center hover:bg-dark_blue hover:text-white transition"
                          aria-label="Tăng"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Size — Circle badges */}
                  <div>
                    <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Chọn Size
                    </label>
                    <div className="flex items-center gap-4 flex-wrap">
                      {props.sizeOptions?.map((item) => (
                        <label
                          key={item.size}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Field
                            type="radio"
                            name="sizeOption"
                            value={item.size}
                            className="peer sr-only"
                          />
                          <span
                            className="w-10 h-10 rounded-full border grid place-items-center text-sm font-semibold
                         transition hover:border-green_starbuck
                         peer-checked:bg-green_starbuck peer-checked:text-white peer-checked:border-transparent"
                          >
                            {item.size}
                          </span>
                          <span className="text-camel font-semibold">
                            {item.price.toLocaleString("vi-VN")}đ
                          </span>
                        </label>
                      ))}
                    </div>
                    <ErrorMessage
                      name="sizeOption"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Độ ngọt - segmented control*/}
                  <div>
                    <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Chọn độ ngọt
                    </label>
                    <div className="inline-flex rounded-xl border p-1 gap-1">
                      {["25", "50", "75", "100"].map((level) => (
                        <label key={level} className="cursor-pointer">
                          <Field
                            type="radio"
                            name="sugarLevel"
                            value={level}
                            className="peer sr-only"
                          />
                          <span
                            className="px-3 py-1.5 rounded-lg text-sm
                         peer-checked:bg-green_starbuck peer-checked:text-white
                         hover:bg-gray-100 inline-block"
                          >
                            {level}%
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Đá — segmented control */}
                  <div>
                    <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">Chọn Đá</label>
                    <div className="inline-flex rounded-xl border p-1 gap-1">
                      {["Chung", "Riêng"].map((option) => (
                        <label key={option} className="cursor-pointer">
                          <Field
                            type="radio"
                            name="iceOption"
                            value={option}
                            className="peer sr-only"
                          />
                          <span className="px-3 py-1.5 rounded-lg text-sm inline-block hover:bg-gray-100 peer-checked:bg-green_starbuck peer-checked:text-white">
                            {option === "Chung" ? "Đá Chung" : "Đá Riêng"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Topping */}
                  <div>
                    <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
                      Chọn Topping
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {props.toppings?.map((topping, index) => {
                        const isChecked = (values.toppings || []).some(
                          (t) => t.name === topping.name
                        );
                        return (
                          <label
                            key={index}
                            className={`flex items-center text-sm p-2 rounded-lg border ${
                              isChecked
                                ? "bg-green-50 border-green_starbuck/50"
                                : "border-gray-200"
                            } cursor-pointer`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updatedToppings = e.target.checked
                                  ? [...(values.toppings || []), topping]
                                  : (values.toppings || []).filter(
                                      (t) => t.name !== topping.name
                                    );
                                setFieldValue("toppings", updatedToppings);
                              }}
                              className="mr-2 accent-green_starbuck"
                            />
                            <span className="flex-1 whitespace-nowrap">
                              {topping.name} (+
                              {topping.extraPrice.toLocaleString("vi-VN")}₫)
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer hành động */}
                  <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border rounded-xl text-gray-700 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      Hủy
                    </button>

                    <button
                      type="submit"
                      className="relative bg-dark_blue text-white px-5 py-2 rounded-xl hover:bg-dark_blue/90 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
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
                          Đang thêm...
                        </span>
                      ) : (
                        "Thêm"
                      )}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      )}
    </>
  );
}

export default ProductCard;
