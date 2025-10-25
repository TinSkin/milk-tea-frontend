// schemas/accountSchema.js
import * as Yup from "yup";

// Regex: không cho phép chỉ toàn dấu cách
const noOnlySpaces = /^(?!\s+$).*/;

// Regex: chỉ cho phép chữ cái, dấu cách, không ký tự đặc biệt
const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;

// Regex: số điện thoại VN cơ bản
const phoneRegex = /^(0[2-9]|84[2-9])([0-9]{8})$/;

export const editAccountSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .matches(nameRegex, "Tên chỉ được chứa chữ cái và dấu cách")
    .matches(noOnlySpaces, "Tên không được chỉ là khoảng trắng")
    .required("Vui lòng nhập họ tên"),

  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),

  phone: Yup.string()
    .trim()
    .matches(/^\d+$/, "Số điện thoại chỉ chứa số")
    .matches(phoneRegex, "Số điện thoại không hợp lệ (VD: 098xxxxxxx)")
    .required("Vui lòng nhập số điện thoại"),

  role: Yup.string()
    .oneOf(["user", "admin"], "Vai trò không hợp lệ")
    .required("Vui lòng chọn vai trò"),

  status: Yup.string()
    .oneOf(["available", "unavailable"], "Trạng thái không hợp lệ")
    .required("Vui lòng chọn trạng thái"),
});
