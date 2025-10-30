// Import Formik Yup
import { Formik, Form } from "formik";
import loginSchema from "../../../../utils/schemas/auth/loginSchema";

// Import FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";

// Hook điều hướng
import { useNavigate, useLocation } from "react-router-dom";

// Import store quản lý trạng thái
import { useAuthStore } from "../../../../store/authStore";
import { useCartStore } from "../../../../store/cartStore";

// Import Components
import SocialIcon from "../SocialIcon";
import InputField from "../../../ui/InputField";
import Notification from "../../../ui/Notification";

import { useStoreSelectionStore } from "../../../../store/storeSelectionStore";
const Login = ({ handleRegisterClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  //! HÀM XỬ LÝ SAU KHI LOGIN THÀNH CÔNG
  const handleLoginSuccess = async (userData) => {
    try {
      console.log("🔐 [Login] User data:", userData);

      const cartStore = useCartStore.getState();
      const storeSelectionStore = useStoreSelectionStore.getState();

      cartStore.setAuthStatus(true);

      let storeId =
        userData?.storeId ||
        userData?.assignedStoreId ||
        userData?.defaultStoreId ||
        storeSelectionStore.selectedStore?._id;

      if (!storeId) {
        console.warn("⚠️ Không tìm thấy storeId, bỏ qua đồng bộ giỏ hàng.");
        return;
      }

      await cartStore.setCurrentStore(storeId);

      // 🧩 1️⃣ Load lại giỏ hàng guest từ localStorage (nếu có)
      cartStore.loadGuestCart();

      // 🧩 2️⃣ Lấy giỏ hàng từ backend
      const backendCart = await cartStore.fetchCart();

      // 🧩 3️⃣ Merge logic
      if (cartStore.items.length > 0) {
        if (!backendCart?.items?.length) {
          console.log("Backend trống → đẩy local cart lên...");
          await cartStore.syncCartToBackend();
        } else {
          console.log("🧩 Merge local cart vào backend cart...");
          const mergedItems = [];

          for (const localItem of cartStore.items) {
            const existing = backendCart.items.find(
              (i) =>
                i.productId === localItem.productId &&
                i.sizeOption === localItem.sizeOption &&
                i.sugarLevel === localItem.sugarLevel &&
                i.iceOption === localItem.iceOption
            );
            if (existing) {
              existing.quantity += localItem.quantity;
            } else {
              mergedItems.push(localItem);
            }
          }

          backendCart.items = [...backendCart.items, ...mergedItems];
          cartStore.setItems(backendCart.items);
          await cartStore.syncCartToBackend();
        }

        // 🧹 Xóa guest cart trong localStorage
        cartStore.clearGuestCart();
      }

      await cartStore.fetchCart();
      console.log(" [Login] Merge hoàn tất!");
    } catch (error) {
      console.error(" [Login] handleLoginSuccess error:", error);
    }
  };

  //! Xử lý logic đăng nhập với error handling
  const handleLogin = async (userData, { setErrors, setSubmitting }) => {
    try {
      const response = await login(userData);

      Notification.success("Đăng nhập thành công!", "Chào mừng bạn quay lại.");

      const user =
        response?.data?.user || useAuthStore.getState()?.user || null;

      if (user) {
        await handleLoginSuccess(user);
        // Chưa xác thực email -> chuyển đến trang verify
        if (!user.isVerified) {
          return navigate("/verify-choice", {
            replace: true,
            state: { email: user.email },
          });
        }

        // Đã xác thực -> GuestRoute sẽ tự động redirect theo role
        // console.log("Login success for role:", user.role, "- GuestRoute will handle redirect");
      }
    } catch (error) {
      console.error("Login failed:", error);

      // Kiểm tra nếu BE đã trả về error message
      const errorMessage = error.response?.data?.message || error.message;

      if (errorMessage) {
        // Sử dụng error message từ BE
        setErrors({ email: errorMessage });
        Notification.error("Đăng nhập thất bại", errorMessage);
      } else {
        // Fallback nếu không có message từ BE
        setErrors({ email: "Có lỗi xảy ra. Vui lòng thử lại." });
        Notification.error(
          "Đăng nhập thất bại",
          "Vui lòng kiểm tra kết nối mạng"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  //! Xử lý click quên mật khẩu
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="form-box log-in-form-container absolute bg-white flex items-center h-full">
      <Formik
        initialValues={{ email: "", password: "", rememberMe: false }}
        validationSchema={loginSchema}
        onSubmit={async (values, formikActions) => {
          const userData = {
            email: values.email.trim(),
            password: values.password.trim(),
            rememberMe: values.rememberMe,
          };
          await handleLogin(userData, formikActions);
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form action="#" id="log-in-form" className="w-full px-4">
            {/* Header */}
            <h1 className="text-xl text-dark_blue font-bold md:text-4xl">
              Chào mừng trở lại
            </h1>
            <p className="text-dark_blue md:text-xl mb-6">
              Vui lòng nhập thông tin đăng nhập
            </p>

            {/* Email */}
            <div className="mb-2">
              <InputField
                label="Email"
                name="email"
                type="email"
                style="relative z-0 w-full group field"
                icon={
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-camel mr-3"
                  />
                }
                errorTimeout={5000}
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <InputField
                label="Mật khẩu"
                name="password"
                type="password"
                style="relative z-0 w-full group field"
                icon={
                  <FontAwesomeIcon icon={faKey} className="text-camel mr-3" />
                }
                errorTimeout={6000}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="rememberMe"
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={() =>
                    setFieldValue("rememberMe", !values.rememberMe)
                  }
                  className="w-4 h-4 text-camel bg-gray-50 border-gray-300 rounded focus:ring-camel focus:ring-2"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-600"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                className="text-sm font-semibold text-camel hover:text-logo_color hover:underline transition-colors duration-200"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-semibold uppercase text-white tracking-wider rounded-lg text-sm px-5 py-3 text-center transition-colors duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-camel hover:bg-logo_color focus:ring-4 focus:ring-camel/30"
              }`}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Register Link */}
            <div className="text-center mt-4 mb-4">
              <p className="text-sm text-gray-600">
                Bạn chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="font-semibold text-camel hover:text-logo_color hover:underline transition-colors duration-200"
                  onClick={handleRegisterClick}
                >
                  Đăng ký miễn phí
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">
                  hoặc đăng nhập với
                </span>
              </div>
            </div>

            {/* Social Login */}
            <SocialIcon />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
