// schemas/accountSchema.js
import * as Yup from "yup";

// Regex: không cho phép chỉ toàn dấu cách
const noOnlySpaces = /^(?!\s+$).*/;

// Regex: chỉ cho phép chữ cái, dấu cách, không ký tự đặc biệt
const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;

// Regex: số điện thoại VN cơ bản
const phoneRegex = /^(0[2-9]|84[2-9])([0-9]{8})$/;

export const addAccountSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .matches(nameRegex, "Tên chỉ được chứa chữ cái và dấu cách")
    .matches(noOnlySpaces, "Tên không được chỉ là khoảng trắng")
    .required("Vui lòng nhập họ tên"),

  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),
  password: Yup.string()
    .trim()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(noOnlySpaces, "Mật khẩu không được chỉ chứa khoảng trắng")
    .required("Vui lòng nhập mật khẩu")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
      "Mật khẩu phải chứa ít nhất 1 chữ và 1 số"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
  phone: Yup.string()
    .trim()
    .matches(/^\d+$/, "Số điện thoại chỉ chứa số")
    .matches(phoneRegex, "Số điện thoại không hợp lệ (VD: 098xxxxxxx)")
    .required("Vui lòng nhập số điện thoại"),
  role: Yup.string().oneOf(["user", "admin"], "Vai trò không hợp lệ"),
  status: Yup.string().oneOf(
    ["available", "unavailable"],
    "Trạng thái không hợp lệ"
  ),
});
