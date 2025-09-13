import { useEffect } from "react";

// Import Formik Yup
import { Formik, Form } from "formik";
import loginSchema from "../../utils/loginSchema";

// Import FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";

// Hook for navigation
import { useNavigate, useLocation } from "react-router-dom";

// Call API to fetch accounts (fallback)
import { fetchAccounts } from "../../api/accountAPI";

// Import store for managing state
import { useAuthStore } from "../../store/authStore";

// Import Components
import SocialIcon from "../SocialIcon";
import InputField from "../InputField";
import Notification from "../Notification";

const Login = ({ handleRegisterClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, login, isCheckingAuth } = useAuthStore();

  //! Handle login logic with backend + fallback approach
  const handleLogin = async (userData, { setErrors, setSubmitting }) => {
    try {
      // Call API to login
      const response = await login(userData);

      Notification.success("Đăng nhập thành công!", "Chào mừng bạn quay lại.");

      // Debug authStore state NGAY SAU login
      console.log("=== AFTER LOGIN DEBUG ===");
      console.log("Login response:", response);
      console.log("AuthStore state:", useAuthStore.getState());
      console.log("========================");

      const user =
        response?.data?.user || useAuthStore.getState()?.user || null;

      if (user) {
        console.log("User role data:", typeof user.role, user.role);
        // Not verified -> verify-choice
        if (!user.isVerified) {
          return navigate("/verify-choice", {
            replace: true,
            state: { email: user.email },
          });
        }
        // Verified -> navigate based on role
        const targetRoute = user.role === "admin" ? "/admin/products" : "/";
        console.log("🟢 Navigating to:", targetRoute);
        return navigate(targetRoute, { replace: true });
      }
    } catch (error) {
      console.log("Backend login failed, trying fallback...", error);

      // Fallback to mock API
      try {
        const users = await fetchAccounts();
        const user = users.find(
          (acc) =>
            acc.email === userData.email.trim() &&
            acc.password === userData.password.trim()
        );

        if (user) {
          // If found: save to localStorage
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("isLoggedIn", "true");

          Notification.success(
            "Đăng nhập thành công!",
            "Chào mừng bạn quay lại."
          );

          // Navigate based on role
          if (user.role === "admin") {
            navigate("/admin/products");
          } else {
            navigate("/");
          }
        } else {
          // If not found: show error on email field
          Notification.error("Đăng nhập thất bại", "Sai email hoặc mật khẩu.");
          setErrors({ email: "Sai Email hoặc Mật khẩu" });
        }
      } catch (error) {
        // Handle API call error
        setErrors({ email: "Error Issue Log In" });
        Notification.error("Đăng nhập thất bại", "Không lấy được dữ liệu.");
      } finally {
        // Stop loading state
        setSubmitting(false);
      }
    }
  };

  //! Handle forgot password click
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  //! If the user is already logged in, redirect to the landing page
  useEffect(() => {
    // Cần check trạng thái xác thực
    if (isCheckingAuth) return;
    if (!isAuthenticated || !user) return;

    // If user is not in login page
    if (location.pathname !== "/login") {
      console.log("🔵 Not on login page, skipping navigation");
      return;
    }

    // Check user verification status
    if (!user.isVerified) {
      console.log("🟠 User not verified, going to verify-choice");
      navigate("/verify-choice", {
        replace: true,
        state: { email: user.email },
      });
      return;
    }

    // User is verified -> redirect page
    const targetRoute = user.role === "admin" ? "/admin/products" : "/";
    console.log("🔴 useEffect redirecting to:", targetRoute);

    navigate(targetRoute, {
      replace: true,
    });
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="form-box log-in-form-container absolute bg-white flex items-center h-full">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, formikActions) => {
          const userData = {
            email: values.email.trim(),
            password: values.password.trim(),
          };

          // Call login function
          await handleLogin(userData, formikActions);
        }}
      >
        {({ isSubmitting }) => (
          <Form action="#" id="log-in-form" className="w-full">
            <h1 className="text-xl text-dark_blue font-bold md:text-4xl">
              Chào mừng trở lại
            </h1>
            <p className="text-dark_blue md:text-xl">
              Vui lòng nhập thông tin đăng nhập
            </p>

            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              style="relative mb-5 group field"
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
              style="relative mb-5 group field"
              icon={
                <FontAwesomeIcon icon={faKey} className="text-camel mr-3" />
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={handleForgotPasswordClick}
                href="#"
                className="text-sm font-semibold text-primary-600 underline-offset-2 dark:text-primary-500"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="log-in-submit"
              className={`font-bold uppercase log-in-action text-white tracking-wider focus:ring-4 focus:outline-none rounded-lg text-sm px-5 py-6 text-center flex items-center focus:ring-camel hover:bg-camel my-5 me-2 ${
                isSubmitting
                  ? "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                  : "bg-camel hover:bg-logo_color"
              }`}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="text-sm font-semibold text-dark_blue inline">
              Bạn chưa có tài khoản?
              <button
                type="button"
                onClick={handleRegisterClick}
                className="font-medium text-primary-600 dark:text-primary-500 inline underline underline-offset-2"
              >
                Tạo tài khoản miễn phí
              </button>
            </p>

            {/* SWITCH REGISTER FORM */}
            <button
              onClick={handleRegisterClick}
              type="button"
              id="sign-up-button"
              className="font-semibold uppercase sign-up-button sign-up-action text-dark_blue bg-[#fff] hover:bg-gray-300 focus:ring-4 focus:outline-none focus:bg-gray-300 rounded-lg text-sm px-5 py-3 text-center flex items-center dark:focus:ring-gray-300 dark:hover:bg-gray-300 me-2 mb-2 border-2 border-dark_blue"
            >
              Đăng ký
            </button>

            <p className="font-semibold text-center">
              hoặc đăng nhập với mạng xã hội
            </p>
            <SocialIcon />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
