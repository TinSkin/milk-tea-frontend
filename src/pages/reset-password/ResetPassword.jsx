import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faCheck,
  faExclamationTriangle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

// Hook for navigation
import { Link, useNavigate, useParams } from "react-router-dom";

// Import store for managing state
import { useAuthStore } from "../../store/authStore";

// Import Components
import Notification from "../../components/Notification";

// Validation schema
const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
    .matches(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
    .matches(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword, isLoading } = useAuthStore();

  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //! Handle reset password logic
  const handleResetPassword = async (values, { setSubmitting, setErrors }) => {
    try {
      // Prepare reset data for authStore
      const resetData = {
        token: token,
        password: values.password.trim(),
      };

      await resetPassword(resetData);

      setIsSuccess(true);
      Notification.success(
        "Đặt lại mật khẩu thành công!",
        "Bạn có thể đăng nhập với mật khẩu mới."
      );

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";

      // Check if token is invalid
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid")
      ) {
        setIsTokenValid(false);
      }

      setErrors({ password: errorMessage });
      Notification.error("Đặt lại mật khẩu thất bại", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  //! Check token validity on mount
  useEffect(() => {
    if (!token || token.length < 20) {
      setIsTokenValid(false);
    }
  }, [token]);

  //! Invalid token screen
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-8 w-8 text-red-600"
            />
          </div>
          <h2 className="text-3xl font-bold text-red-600">
            Liên kết không hợp lệ
          </h2>
          <p className="mt-2 text-gray-600">
            Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.
          </p>
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-camel hover:bg-camel/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel transition-colors"
            >
              Yêu cầu liên kết mới
            </Link>
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  //! Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FontAwesomeIcon
              icon={faCheck}
              className="h-8 w-8 text-green-600"
            />
          </div>
          <h2 className="text-3xl font-bold text-green-600">Thành công!</h2>
          <p className="mt-2 text-gray-600">
            Mật khẩu của bạn đã được đặt lại thành công.
          </p>
          <p className="text-sm text-gray-500">
            Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-green-200 rounded-full">
              <div className="h-2 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <Link
            to="/login"
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-camel/20 to-dark_blue/20">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-dark_blue">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6">
              {/* Password Field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FontAwesomeIcon icon={faLock} className="text-camel mr-2" />
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-camel focus:border-camel transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />

                {/* Password strength indicator */}
                {values.password && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                      Độ mạnh mật khẩu:
                    </div>
                    <div className="flex space-x-1">
                      <div
                        className={`h-1 flex-1 rounded ${
                          values.password.length >= 6
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded ${
                          /[A-Z]/.test(values.password)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded ${
                          /[a-z]/.test(values.password)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded ${
                          /[0-9]/.test(values.password)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FontAwesomeIcon icon={faLock} className="text-camel mr-2" />
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-camel focus:border-camel transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel transition-colors ${
                  isSubmitting || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-camel hover:bg-camel/90"
                }`}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-camel hover:text-camel/80 font-semibold inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </Form>
          )}
        </Formik>

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon
                icon={faLock}
                className="h-5 w-5 text-blue-400"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Bảo mật mật khẩu
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Ít nhất 6 ký tự</li>
                  <li>Có chữ hoa và chữ thường</li>
                  <li>Có ít nhất 1 số</li>
                  <li>Không chia sẻ với người khác</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
