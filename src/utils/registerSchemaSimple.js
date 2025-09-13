import * as Yup from "yup";

// Simplified validation - chỉ check format cơ bản
export const registerSchema = Yup.object({
  userName: Yup.string()
    .trim()
    .required("Tên không được để trống")
    .min(2, "Tên phải có ít nhất 2 ký tự"),
    
  phoneNumber: Yup.string()
    .trim()
    .required("Số điện thoại không được để trống")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
    
  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Email không được để trống"),
    
  password: Yup.string()
    .required("Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    
  confirmPassword: Yup.string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([Yup.ref('password')], "Mật khẩu xác nhận không khớp")
});

export default registerSchema;
