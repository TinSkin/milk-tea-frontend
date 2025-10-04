// Nhập hook `useField` từ Formik, hook này giúp quản lý các trường biểu mẫu trong form Formik
import { useField, useFormikContext } from "formik";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Định nghĩa component `InputField`, nhận prop `label` và các prop khác (dùng spread operator)
const InputField = ({ icon, label, style, autoHideError = true, errorTimeout = 4000, ...props }) => {
  // Sử dụng hook `useField` để kết nối input này với trạng thái biểu mẫu của Formik
  const [field, meta] = useField(props);
  const { submitCount } = useFormikContext();
  
  // State để quản lý việc hiển thị error
  const [showError, setShowError] = useState(false);
  const [focusTimer, setFocusTimer] = useState(null);
  
  // State để quản lý hiển thị mật khẩu (chỉ cho type="password")
  const [showPassword, setShowPassword] = useState(false);
  
  // Kiểm tra xem có phải field password không
  const isPasswordField = props.type === "password";
  
  // Xác định type thực tế của input
  const inputType = isPasswordField && showPassword ? "text" : props.type;

  // Custom onFocus handler để hiển thị error khi user click vào field
  const handleFocus = (e) => {
    // Clear timer cũ nếu có
    if (focusTimer) {
      clearTimeout(focusTimer);
      setFocusTimer(null);
    }
    
    // Nếu có error và đã touched, hiển thị lại
    if (meta.touched && meta.error) {
      setShowError(true);
      
      // Start timer nếu auto-hide được bật
      if (autoHideError) {
        const timer = setTimeout(() => {
          setShowError(false);
        }, errorTimeout);
        setFocusTimer(timer);
      }
    }
    
    // Gọi onFocus gốc nếu có
    if (field.onFocus) {
      field.onFocus(e);
    }
  };

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (focusTimer) {
        clearTimeout(focusTimer);
      }
    };
  }, [focusTimer]);

  // Effect để tự động ẩn error sau một khoảng thời gian
  useEffect(() => {
    if (meta.touched && meta.error) {
      // Luôn hiển thị error khi có touched + error
      setShowError(true);
      
      // Chỉ auto-hide nếu được bật
      if (autoHideError) {
        const timer = setTimeout(() => {
          setShowError(false);
        }, errorTimeout);

        return () => clearTimeout(timer);
      }
    } else if (!meta.error) {
      // Nếu không có error, ẩn ngay
      setShowError(false);
    }
  }, [meta.touched, meta.error, submitCount, autoHideError, errorTimeout]); // Thêm submitCount

  // Trả về JSX cho component trường nhập liệu
  return (
    // Bao bọc input và label trong một div, thêm margin-bottom để tạo khoảng cách
    <div className={style}>
      {/* Container cho input và nút toggle password */}
      <div className="relative">
        {/* Hiển thị thẻ input, sử dụng spread operator để:
            - Truyền các prop từ `field` (như value, onChange, onBlur) để kết nối với trạng thái Formik
            - Truyền các prop khác (như type, placeholder) được truyền vào component
            - Áp dụng các lớp Tailwind CSS để định dạng (rộng 100%, padding, viền, góc bo) */}
        <input
          {...field}
          {...props}
          type={inputType}
          onFocus={handleFocus}
          placeholder=""
          className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${
            isPasswordField ? "pr-8" : ""
          }`}
        />
        
        {/* Nút toggle hiển thị mật khẩu (chỉ hiển thị cho password field) */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-2.5 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="w-4 h-4"
            />
          </button>
        )}
      </div>
      
      {/* Hiển thị label cho trường nhập liệu, được định dạng là block, có margin-bottom và chữ đậm */}
      <label className="peer-focus:font-bold absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
        {icon}
        {label}
      </label>

      {/* Tạo không gian cố định cho error message để tránh layout bị nhảy */}
      <div className="h-6 mt-1">
        {meta.touched && meta.error && showError ? (
          // Hiển thị thông báo lỗi với regular weight, màu đỏ và animation subtle
          <div className="text-red-600 text-xs transition-opacity duration-300 opacity-90">
            {meta.error}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Xuất component `InputField` để sử dụng ở các phần khác của ứng dụng
export default InputField;
