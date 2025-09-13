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
          <Form action="#" id="sign-up-form" className="w-full">
            {/* Username */}
            <InputField
              label="Họ và tên"
              name="fullName"
              type="text"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faUser} className="text-camel mr-3" />
              }
            />

            {/* Phone Number */}
            <InputField
              label="Số điện thoại"
              name="phone"
              type="text"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faPhone} className="text-camel mr-3" />
              }
            />

            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-camel mr-3"
                />
              }
            />

            {/* Password */}
            <InputField
              label="Mật khẩu"
              name="password"
              type="password"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faLock} className="text-camel mr-3" />
              }
            />

            <InputField
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              type="password"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faUnlock} className="text-camel mr-3" />
              }
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-semibold uppercase sign-up-action text-white focus:ring-camel tracking-wider hover:bg-camel rounded-lg text-sm px-5 py-6 text-center flex items-center me-2 mb-2 mt-5 ${
                isSubmitting
                  ? "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                  : "bg-camel hover:bg-logo_color"
              }`}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="text-sm font-semibold text-dark_blue mr-3 inline">
              Bạn đã có tài khoản?{" "}
              <button
                type="button"
                className="font-medium text-primary-600 text-dark_blue"
                onClick={handleLogInClick}
              >
                Đăng nhập
              </button>
            </p>

            {/* SWITCH LOG IN FORM */}
            <button
              onClick={handleLogInClick}
              type="button"
              id="log-in-button"
              className="font-semibold uppercase log-in-button sign-up-action tracking-wider text-white bg-dark_blue hover:bg-dark_blue/90 focus:ring-4 focus:outline-none focus:ring-dark_blue/50 rounded-lg text-sm px-5 py-3 text-center flex items-center dark:focus:ring-dark_blue/50 dark:hover:bg-dark_blue/30 me-2 mb-2"
            >
              Đăng Nhập
            </button>
            <p className="text-center font-semibold text-dark_blue">
              hoặc đăng ký với mạng xã hội
            </p>
            <SocialIcon />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;
