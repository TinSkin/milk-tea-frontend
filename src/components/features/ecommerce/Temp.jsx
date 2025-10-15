import React from "react";
import AddToCartAddressModal from "./../location/LocationSelection/AddToCartAddressModal";

const Temp = () => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);

  // ----------------------------------------- PRODUCT CARD CODE -----------------------------------
  useEffect(() => {
    const selectedSize = props.sizeOptions.find(
      (opt) => opt.size === values.sizeOption
    );
    const sizePrice = selectedSize ? selectedSize.price : 0;
    const toppingsPrice = values.toppings.reduce(
      (sum, t) => sum + (t.extraPrice || 0),
      0
    );
    const total = (sizePrice + toppingsPrice) * values.quantity;

    if (values.price !== total) {
      setFieldValue("price", total);
    }
  }, [values.sizeOption, values.toppings, values.quantity]);

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
  </Swiper>;

  <p className="font-bold text-dark_blue text-2xl mb-2">{props.name}</p>;
  {
    (() => {
      const selected = props.sizeOptions.find(
        (opt) => opt.size === values.sizeOption
      );
      return (
        <span className="text-camel font-semibold text-lg my-2">
          {selected ? selected.price.toLocaleString("vi-VN") : "Chọn size: 0"}₫
        </span>
      );
    })();
  }
  {
    (() => {
      const selectedSize = props.sizeOptions.find(
        (opt) => opt.size === values.sizeOption
      );
      const toppingsTotal = values.toppings.reduce(
        (sum, t) => sum + (t.extraPrice || 0),
        0
      );
      const total = selectedSize
        ? (selectedSize.price + toppingsTotal) * values.quantity
        : 0;

      return (
        <span className="block text-green_starbuck font-bold text-lg my-2">
          Tổng: {total.toLocaleString("vi-VN")}₫
        </span>
      );
    })();
  }

  // ----------------------------------------- PRODUCT CARD CODE -----------------------------------

  return (
    <>
      {/* Address Modal - Hiển thị sau khi chọn xong sản phẩm */}
      {showAddressModal && productToAdd && (
        <AddToCartAddressModal
          onClose={() => {
            setShowAddressModal(false);
            setProductToAdd(null);
          }}
          onAddressConfirmed={(address, deliveryInfo) => {
            // Thêm sản phẩm vào giỏ hàng với thông tin địa chỉ
            const productWithAddress = {
              ...productToAdd,
              deliveryAddress: address,
              deliveryInfo: deliveryInfo,
            };

            console.log("Adding to cart with address:", productWithAddress);
            addToCart(productWithAddress);

            // Đóng modal và reset state
            setShowAddressModal(false);
            setProductToAdd(null);

            Notification.success("Đã thêm sản phẩm vào giỏ hàng!");
          }}
          selectedStore={selectedStore}
          product={productToAdd}
        />
      )}

      {/* ----------------------------------------- PRODUCT CARD CODE ----------------------------------- */}
      {/* Size */}
      <div>
        <label className="block font-semibold mb-1">Chọn Size</label>
        <div className="flex gap-4 flex-wrap">
          {props.sizeOptions?.map((item) => (
            <label
              key={item.size}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Field
                type="radio"
                name="sizeOption"
                value={item.size}
                className="accent-green_starbuck"
              />
              <span className="whitespace-nowrap">
                {item.size} —{" "}
                <span className="text-camel font-semibold">
                  {item.price.toLocaleString("vi-VN")}đ
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

      {/* Size — Card tile */}
      <div>
        <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Chọn Size
        </label>
        <div className="grid grid-cols-3 gap-3">
          {props.sizeOptions?.map((item) => (
            <label key={item.size} className="cursor-pointer">
              <Field
                type="radio"
                name="sizeOption"
                value={item.size}
                className="peer sr-only"
              />
              <div
                className="rounded-xl border px-3 py-2 text-center transition
                              hover:border-green_starbuck
                              peer-checked:border-green_starbuck peer-checked:bg-green-50"
              >
                <div className="font-semibold">{item.size}</div>
                <div className="text-camel font-semibold">
                  {item.price.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </label>
          ))}
        </div>
        <ErrorMessage
          name="sizeOption"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>

      {/* Size — Pill buttons */}
      <div>
        <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Chọn Size
        </label>
        <div className="flex flex-wrap gap-2">
          {props.sizeOptions?.map((item) => (
            <label key={item.size} className="cursor-pointer">
              <Field
                type="radio"
                name="sizeOption"
                value={item.size}
                className="peer sr-only"
              />
              <span
                className="px-3 py-1.5 rounded-full border text-sm inline-block transition
                               hover:border-green_starbuck
                               peer-checked:bg-green_starbuck peer-checked:text-white peer-checked:border-transparent"
              >
                <span className="font-medium">{item.size}</span>
                <span className="ml-1 opacity-80">
                  — {item.price.toLocaleString("vi-VN")}đ
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

      {/* Size — Segmented control */}
      <div>
        <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Chọn Size
        </label>
        <div className="inline-flex rounded-xl border p-1 gap-1">
          {props.sizeOptions?.map((item) => (
            <label key={item.size} className="cursor-pointer">
              <Field
                type="radio"
                name="sizeOption"
                value={item.size}
                className="peer sr-only"
              />
              <span
                className="px-3 py-1.5 rounded-lg text-sm inline-block
                               hover:bg-gray-100
                               peer-checked:bg-green_starbuck peer-checked:text-white"
              >
                <span className="font-medium">{item.size}</span>
                <span className="ml-1 opacity-90">
                  ({item.price.toLocaleString("vi-VN")}đ)
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

      {/* Size — Radio tile với mô tả phụ */}
      <div>
        <label className="block text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Chọn Size
        </label>
        <div className="space-y-2">
          {props.sizeOptions?.map((item) => (
            <label
              key={item.size}
              className="flex items-center gap-3 p-3 border rounded-xl hover:border-green_starbuck cursor-pointer"
            >
              <Field
                type="radio"
                name="sizeOption"
                value={item.size}
                className="accent-green_starbuck"
              />
              <div className="flex-1">
                <div className="font-semibold">{item.size}</div>
                <div className="text-sm text-slate-500">
                  {item.note || "Dung tích tiêu chuẩn"}
                </div>
              </div>
              <div className="text-camel font-semibold">
                {item.price.toLocaleString("vi-VN")}đ
              </div>
            </label>
          ))}
        </div>
        <ErrorMessage
          name="sizeOption"
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      </div>
      {/* ----------------------------------------- PRODUCT CARD CODE ----------------------------------- */}
    </>
  );
};

export default Temp;
