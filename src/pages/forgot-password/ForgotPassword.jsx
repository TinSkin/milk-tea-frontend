import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

// Hook for navigation
import { Link } from "react-router-dom";

// Import store for managing state
import { useAuthStore } from "../../store/authStore";

// Import Components
import Notification from "../../components/Notification";

// Validation schema
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
});

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { forgotPassword, isLoading } = useAuthStore();

  //! Handle forgot password logic
  const handleForgotPassword = async (userData, { setSubmitting, setErrors }) => {
    try {
      // Call API to send forgot password email
      console.log("Sending forgot password email for:", userData.email);
      const response = await forgotPassword(userData.email);

      Notification.success(
        "Email đã được gửi!",
        "Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu."
      );

      setIsEmailSent(true);
    } catch (error) {
      const errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
      setErrors({ email: errorMessage });
      Notification.error("Gửi email thất bại", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-camel/20 to-dark_blue/20">
        <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="h-8 w-8 text-green-600"
              />
            </div>
            <h2 className="text-3xl font-bold text-dark_blue">
              Email đã được gửi!
            </h2>
            <p className="mt-2 text-gray-600">
              Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt
              lại mật khẩu.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-camel hover:text-camel/80 font-semibold underline"
              >
                thử lại
              </button>
            </p>
          </div>

          <Link
            to="/login"
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-dark_blue hover:bg-dark_blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark_blue transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br py-12 px-4 from-camel/20 to-dark_blue/20">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-dark_blue">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-gray-600">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={forgotPasswordSchema}
          onSubmit={async (values, formikActions) => {
            // Transform Formik values to userData
            const userData = {
              email: values.email.trim(),
            }

            await handleForgotPassword(userData, formikActions);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="relative group">
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@domain.com"
                  className="w-full px-3 py-3 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-camel focus:border-camel placeholder:text-gray-400 placeholder:text-center"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1 text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-md font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel transition-colors ${
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
                    Đang gửi email...
                  </>
                ) : (
                  "Gửi email đặt lại mật khẩu"
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-camel hover:text-camel/80 font-semibold flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;
