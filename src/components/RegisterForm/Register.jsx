import { useEffect } from "react";

// Import Formik Yup
import { Formik, Form } from "formik";
import registerSchema from "../../utils/registerSchema";

// Import FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faUser,
  faLock,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

// Hook for navigation
import { useNavigate } from "react-router-dom";

// Call API to fetch accounts (fallback)
import { fetchAccounts } from "../../api/accountAPI";

// Import store for managing state
import { useAuthStore } from "../../store/authStore";

// Import Components
import SocialIcon from "../SocialIcon";
import InputField from "../InputField";
import Notification from "../Notification";

const Register = ({ handleLogInClick }) => {
  const navigate = useNavigate();

  const { register, error, isLoading, isAuthenticated, user } = useAuthStore();

  //! Handle register logic with backend + fallback approach
  const handleRegister = async (userData, { setErrors, setSubmitting }) => {
    try {
      // Call API to register
      const response = await register(userData);

      Notification.success(
        "Đăng ký thành công!",
        "Vui lòng kiểm tra email để xác thực tài khoản"
      );

      setTimeout(() => {
        navigate("/verify-choice", { state: { email: userData.email } });
      }, 1500);
    } catch (error) {
      console.log("Backend register failed, trying fallback...", error);

      // Fallback to mock API
      try {
        const users = await fetchAccounts();
        const emailExists = users.some((user) => user.email === userData.email);

        if (emailExists) {
          setErrors({ email: "Email đã tồn tại!" });
          Notification.error(
            "Email đã tồn tại",
            "Vui lòng sử dụng email khác."
          );
          return;
        }

        const mockUser = {
          fullName: userData.userName,
          phone: userData.phoneNumber,
          email: userData.email,
          password: userData.password,
          role: "user",
          status: "available",
        };

        const mockResponse = await fetch(
          "https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockUser),
          }
        );

        if (!mockResponse.ok) throw new Error("Mock API failed");

        Notification.success("Đăng ký thành công!", "Đang chuyển hướng...");
        setTimeout(() => handleLogInClick(), 1500);
      } catch (fallbackError) {
        Notification.error("Đăng ký thất bại", "Không thể kết nối đến server");
      } finally {
        setSubmitting(false);
      }
    }
  };

  //! If the user is already logged in, redirect to the landing page
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is authenticated:", user);
      if (user.role === "user") {
        navigate("/");
      } else if (user.role === "admin") {
        navigate("/admin/products");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="form-box absolute bg-white flex items-center sign-up-form-container h-full">
      <Formik
        initialValues={{
          fullName: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registerSchema}
        onSubmit={async (values, formikActions) => {
          // Transform Formik values to userData
          const userData = {
            userName: values.fullName.trim(),
            phoneNumber: values.phone.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password.trim(),
          };

          // Call register function
          await handleRegister(userData, formikActions);
        }}
      >
        {({ isSubmitting }) => (
          <Form action="#" id="sign-up-form" className="w-full px-4">
            {/* Header */}
            <h1 className="text-xl text-dark_blue font-bold md:text-4xl">
              Gia nhập Penny
            </h1>
            <p className="text-dark_blue md:text-xl">
              Vui lòng nhập thông tin đăng ký
            </p>

            {/* Username */}
            <div className="mb-1">
              <InputField
                label="Họ và tên"
                name="fullName"
                type="text"
                style="relative z-0 w-full group field"
                icon={
                  <FontAwesomeIcon icon={faUser} className="text-camel mr-3" />
                }
                errorTimeout={3000}  // Ẩn nhanh - field đơn giản
              />
            </div>

            {/* Phone and Email Row */}
            <div className="flex gap-3 mb-1">
              {/* Phone Number */}
              <div className="flex-1">
                <InputField
                  label="Số điện thoại"
                  name="phone"
                  type="text"
                  style="relative z-0 w-full group field"
                  icon={
                    <FontAwesomeIcon icon={faPhone} className="text-camel mr-3" />
                  }
                  errorTimeout={5000}  // Format phức tạp, hiển thị lâu hơn
                />
              </div>

              {/* Email */}
              <div className="flex-1">
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
                  errorTimeout={5000}  // Format quan trọng, hiển thị lâu
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-1">
              <InputField
                label="Mật khẩu"
                name="password"
                type="password"
                style="relative z-0 w-full group field"
                icon={
                  <FontAwesomeIcon icon={faLock} className="text-camel mr-3" />
                }
                errorTimeout={7000}  // Bảo mật quan trọng, hiển thị lâu
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-1">
              <InputField
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                style="relative z-0 w-full group field"
                icon={
                  <FontAwesomeIcon icon={faUnlock} className="text-camel mr-3" />
                }
                autoHideError={false}  // Luôn hiển thị để so sánh với password
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-semibold uppercase text-white tracking-wider rounded-lg text-sm px-5 py-3 text-center mt-4 transition-colors duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-camel hover:bg-logo_color focus:ring-4 focus:ring-camel/30"
              }`}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            {/* Login Link */}
            <div className="text-center mt-3 mb-3">
              <p className="text-sm text-gray-600">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  className="font-semibold text-camel hover:text-logo_color hover:underline transition-colors duration-200"
                  onClick={handleLogInClick}
                >
                  Đăng nhập
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">
                  hoặc đăng ký với
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

export default Register;
