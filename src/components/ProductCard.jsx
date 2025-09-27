import { useCartStore } from "../store/cartStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { addOrderSchema } from "../utils/addOrderSchema";

// Import Component
import Notification from "./Notification";

// Import Store
import { useAuthStore } from "../store/authStore";

function ProductCard(props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  //! Lấy trạng thái đăng nhập từ store
  const { user } = useAuthStore();

  //! Using props.image (array) for Swiper
  const images =
    Array.isArray(props.image) && props.image.length > 0
      ? props.image
      : ["/no-image.png"];

  const minPrice = props.sizeOptions?.length
    ? Math.min(...props.sizeOptions.map((opt) => Number(opt.price) || 0))
    : 0;

  //! Handle add product to cart
  const addToCart = useCartStore((state) => state.addToCart);

  //! Handle add product click
  const handleAddClick = () => {
    if (!user) {
      Notification.warning("Bạn cần đăng nhập để thêm sản phẩm!");
      navigate("/login");
      return;
    }
    setShowAddModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Product Swiper */}
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={images.length > 1}
          className="rounded-md"
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
            onClick={() => handleAddClick(true)}
            className="bg-dark_blue hover:bg-camel text-white py-1 px-2 rounded text-sm flex items-center justify-center w-full"
          >
            <span className="mr-1">+</span> Thêm
          </button>
        </div>
      </div>
      {showAddModal && ( // Hiển thị modal thêm sản phẩm
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
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
            // inside Formik onSubmit in ProductCard.jsx
            onSubmit={(values) => {
              // lấy price size, toppings như bạn đã làm
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
                // lưu price ban đầu (frontend của bạn dùng price field), nhưng store sẽ dùng price khi hiển thị
                price: total, // giữ như trước (bạn có thể thay bằng props.price nếu muốn base)
                sizeOption: values.sizeOption,
                sizeOptionPrice: sizePrice,
                sugarLevel: values.sugarLevel,
                iceOption: values.iceOption,
                toppings: values.toppings || [], // toppings đã chọn
                // ✅ quan trọng: truyền full list topping từ product (props.toppings) để store có availableToppings
                availableToppings: (props.toppings || []).map((t) => ({
                  _id: t._id,
                  name: t.name,
                  extraPrice: t.extraPrice || 0,
                })),
                sizeOptions: props.sizeOptions || [],
                quantity: values.quantity || 1,
              };

              addToCart(newProduct, 1);
              setShowAddModal(false);
            }}
          >
            {({ values, setFieldValue }) => {
              useEffect(() => {
                const selectedSize = props.sizeOptions.find(
                  (opt) => opt.size === values.sizeOption
                );
                const sizePrice = selectedSize ? selectedSize.price : 0;
                const toppingsPrice = values.toppings.reduce(
                  (sum, t) => sum + t.extraPrice,
                  0
                );
                const total = (sizePrice + toppingsPrice) * values.quantity;

                if (values.price !== total) {
                  setFieldValue("price", total);
                }
              }, [values.sizeOption, values.toppings, values.quantity]);
              return (
                <Form className="bg-white p-6 rounded shadow-md w-[700px] space-y-4">
                  <div className="flex justify-start">
                    {/* Product Swiper */}
                    <Swiper
                      modules={[Autoplay]} // Sử dụng module Autoplay
                      autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                      }} // Tự động chuyển ảnh sau 2 giây
                      loop={
                        Array.isArray(props.image) && props.image.length > 1 // Lặp lại nếu có nhiều hơn 1 ảnh
                      }
                      className="rounded-md w-1/3"
                    >
                      {Array.isArray(props.image) &&
                        props.image.map(
                          (
                            img,
                            idx // Duyệt qua danh sách ảnh
                          ) => (
                            <SwiperSlide key={idx}>
                              <img
                                src={img}
                                alt={props.name || "Product image"}
                                className="w-full h-72 object-cover rounded-md"
                              />
                            </SwiperSlide>
                          )
                        )}
                    </Swiper>

                    <div className="w-2/3 ml-4">
                      <p className="font-bold text-dark_blue text-2xl mb-2">
                        {props.name}
                      </p>
                      {(() => {
                        const selected = props.sizeOptions.find(
                          (opt) => opt.size === values.sizeOption
                        );
                        return (
                          <span className="text-camel font-semibold text-lg my-2">
                            {selected
                              ? selected.price.toLocaleString("vi-VN")
                              : "Chọn size: 0"}
                            ₫
                          </span>
                        );
                      })()}
                      {(() => {
                        const selectedSize = props.sizeOptions.find(
                          (opt) => opt.size === values.sizeOption
                        );
                        const toppingsTotal = values.toppings.reduce(
                          (sum, t) => sum + t.extraPrice,
                          0
                        );
                        const total = selectedSize
                          ? (selectedSize.price + toppingsTotal) *
                            values.quantity
                          : 0;

                        return (
                          <span className="block text-green_starbuck font-bold text-lg my-2">
                            Tổng: {total.toLocaleString("vi-VN")}₫
                          </span>
                        );
                      })()}
                      <p className="my-2">{props.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        {/* Nút Giảm */}
                        <button
                          type="button"
                          onClick={() => {
                            if (values.quantity > 1) {
                              setFieldValue("quantity", values.quantity - 1);
                            }
                          }}
                          className="w-9 h-9 bg-dark_blue text-white flex items-center justify-center border rounded text-lg font-bold"
                        >
                          -
                        </button>

                        {/* Hiển thị số lượng */}
                        <Field
                          name="quantity"
                          type="number"
                          readOnly
                          className="w-12 text-center border rounded py-1"
                        />

                        {/* Nút Tăng */}
                        <button
                          type="button"
                          onClick={() =>
                            setFieldValue("quantity", values.quantity + 1)
                          }
                          className="w-9 h-9 bg-dark_blue text-white flex items-center justify-center border rounded text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chọn Size (Chỉ 1 lựa chọn) */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Chọn size
                    </label>
                    <div className="flex gap-4">
                      {props.sizeOptions.map((item) => (
                        <label
                          key={item.size}
                          className="flex items-center gap-2"
                        >
                          <Field
                            type="radio"
                            name="sizeOption"
                            value={item.size}
                            className="accent-green_starbuck"
                          />
                          <span>
                            {item.size} -{" "}
                            <span className="text-camel font-semibold">
                              {item.price.toLocaleString()}đ
                            </span>
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

                  {/* Chọn Sugar */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">
                      Chọn Mức đường
                    </label>
                    <div className="flex gap-4">
                      {["25", "50", "75", "100"].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <Field
                            type="radio"
                            name="sugarLevel"
                            value={level}
                            className="accent-green_starbuck"
                          />
                          <span>{level}%</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Chọn Đá */}
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Chọn Đá</label>
                    <div className="flex gap-4">
                      {["Chung", "Riêng"].map((option) => (
                        <label key={option} className="flex items-center gap-2">
                          <Field
                            type="radio"
                            name="iceOption"
                            value={option}
                            className="accent-green_starbuck"
                          />
                          <span>
                            {option === "Chung" ? "Đá Chung" : "Đá Riêng"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Chọn Topping cho Order */}
                  <div>
                    <label className="block font-semibold mb-1">
                      Chọn Topping
                    </label>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                      {props.toppings?.map((topping, index) => {
                        const isChecked = values.toppings.some(
                          (t) => t.name === topping.name
                        );
                        return (
                          <label key={index} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updatedToppings = e.target.checked
                                  ? [...values.toppings, topping]
                                  : values.toppings.filter(
                                      (t) => t.name !== topping.name
                                    );
                                setFieldValue("toppings", updatedToppings);
                              }}
                              className="mr-2"
                            />
                            {topping.name} (+
                            {topping.extraPrice.toLocaleString("vi-VN")}₫)
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Button  */}
                  <div className="flex justify-end space-x-2">
                    {/* Button Hủy */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                      }}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                      disabled={isLoading}
                    >
                      Hủy
                    </button>
                    {/* Button Thêm */}
                    <button
                      type="submit"
                      className="relative bg-dark_blue text-white px-4 py-2 rounded hover:bg-dark_blue/80 disabled:bg-dark_blue"
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
