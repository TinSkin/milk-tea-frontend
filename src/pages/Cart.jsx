import { useEffect, useState } from "react"; // Import hook useEffect và useState để quản lý trạng thái và side-effect
import { useNavigate } from "react-router-dom"; // Import hook useNavigate để điều hướng

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { checkOutSchema } from "../utils/checkOutSchema";

// Import Component
import Header from "../components/Header";
import Footer from "../components/Footer";
import Notification from "../components/Notification";

const Cart = () => {
  // Định nghĩa component Cart
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
  const [cartItems, setCartItems] = useState([]); // Trạng thái lưu danh sách sản phẩm trong giỏ hàng
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  const handleCheckOut = (values) => {
    console.log("Giá trị getTotal():", getTotal());
    // Lưu thông tin vào localStorage
    localStorage.setItem("checkoutInfo", JSON.stringify(values));

    // Xóa giỏ hàng
    localStorage.removeItem("cart");

    Notification.success("Đã tạo đơn hàng thành công!");

    navigate("/checkout");
  };

  // Hàm tải giỏ hàng từ localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart"); // Lấy giỏ hàng từ localStorage
    if (savedCart) {
      setCartItems(JSON.parse(savedCart)); // Parse và cập nhật trạng thái nếu có
    }
  }, []); // Chạy một lần khi component mount

  // Hàm cập nhật số lượng sản phẩm
  const updateQuantity = (id, sizeOption, toppings, quantity) => {
    const updatedCart = cartItems.map((item) => {
      if (
        item.id === id &&
        item.sizeOption === sizeOption &&
        JSON.stringify(item.toppings) === JSON.stringify(toppings)
      ) {
        return { ...item, quantity: Math.max(1, quantity) }; // Cập nhật số lượng, đảm bảo >=1
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Lưu vào localStorage
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeItem = (id, sizeOption, toppings) => {
    const updatedCart = cartItems.filter(
      (item) =>
        !(
          item.id === id &&
          item.sizeOption === sizeOption &&
          JSON.stringify(item.toppings) === JSON.stringify(toppings)
        )
    ); // Lọc ra sản phẩm không có ID cần xóa
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Cập nhật localStorage
  };

  // Tính tổng tiền
  const getTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toLocaleString(); // Tính tổng và định dạng số
  };

  if (!cartItems.length && !isLoading) {
    // Hiển thị thông báo nếu giỏ hàng trống
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Giỏ hàng của bạn
            </h3>
            <p className="text-center text-gray-600">Giỏ hàng trống.</p>
            <button
              onClick={() => navigate("/menu")} // Chuyển hướng về trang Hello
              className="mt-4 bg-dark_blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 mx-auto block font-semibold"
            >
              Quay lại mua sắm
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-dark_blue text-center mb-6">
            Giỏ hàng của bạn
          </h3>
          {isLoading ? (
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-dark_blue mx-auto"
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
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full bg-white border divide-y divide-gray-200">
                  <thead className="bg-dark_blue text-white">
                    <tr>
                      <th className="p-3 text-left text-lg font-semibold">
                        Tên
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Đường
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Đá
                      </th>
                      <th
                        colSpan={3}
                        className="p-3 text-left text-lg font-semibold"
                      >
                        Topping
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Giá
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Số lượng
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Thành tiền
                      </th>
                      <th className="p-3 text-left text-lg font-semibold">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <tr
                        key={
                          item.productId +
                          item.sizeOption +
                          JSON.stringify(item.toppings)
                        }
                      >
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={item.images}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/50x50?text=Image+Not+Found")
                            }
                          />
                          <span className="font-bold text-lg text-dark_blue">
                            {item.productName}
                          </span>
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.sugarLevel.toLocaleString()}%
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.iceOption.toLocaleString()}
                        </td>
                        <td colSpan={3} className="p-3 text-lg text-dark_blue">
                          {item.toppings.map((option, index) => (
                            <div
                              key={index}
                              className="block mx-1 px-2 py-1 bg-dark_blue mt-2 rounded text-left"
                            >
                              <span className="text-white">
                                {typeof option === "object"
                                  ? option.name
                                  : option}
                                : <span></span>
                              </span>
                              <span className="text-white">
                                {typeof option.extraPrice === "number"
                                  ? option.extraPrice.toLocaleString()
                                  : "N/A"}
                                ₫
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 text-lg text-dark_blue">
                          {item.price.toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                item.sizeOption,
                                item.toppings,
                                parseInt(e.target.value)
                              )
                            }
                            min="1"
                            className="w-16 p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-3 text-lg text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              removeItem(
                                item.id,
                                item.sizeOption,
                                item.toppings
                              )
                            }
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <Formik
                  initialValues={{
                    fullName: "",
                    phone: "",
                    address: "",
                    totalPrice: getTotal(),
                  }}
                  validationSchema={checkOutSchema}
                  onSubmit={(values) => {
                    console.log("Submitting Testing: ", values);
                    handleCheckOut(values);
                  }}
                >
                  <Form className="flex justify-between">
                    <div>
                      {/* Thêm Name */}
                      <Field
                        name="fullName"
                        type="text"
                        className="w-full p-2 border rounded mb-4 font-semibold border-dark_blue"
                        placeholder="Họ và tên"
                      />
                      <ErrorMessage
                        name="fullName"
                        component="div"
                        className="text-red-500 text-sm"
                      />

                      {/* Thêm Phone */}
                      <Field
                        name="phone"
                        type="text"
                        className="w-full p-2 border rounded mb-4 font-semibold border-dark_blue"
                        placeholder="Số điện thoại"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm"
                      />

                      {/* Thêm Address */}
                      <Field
                        name="address"
                        as="textarea"
                        className="w-full p-2 border rounded mb-4 font-semibold border-dark_blue"
                        placeholder="Địa chỉ"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        Tổng tiền: {getTotal()} ₫
                      </p>
                      <button
                        type="submit"
                        className="mt-4 bg-dark_blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-dark_blue transition duration-300"
                      >
                        Đặt hàng
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart; // Xuất component Cart
