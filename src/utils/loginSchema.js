import * as Yup from "yup";

//! Regex: No only spaces & no spaces
const noOnlySpaces = /.*\S.*/;
const noSpaces = /^\S*$/;

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),

  password: Yup.string()
    .trim()
    .max(64, "Mật khẩu không được quá 64 ký tự")
    .matches(noOnlySpaces, "Vui lòng nhập mật khẩu")
    .matches(noSpaces, "Mật khẩu không được chứa khoảng trắng")
    .required("Vui lòng nhập mật khẩu"),
});

export default loginSchema;
