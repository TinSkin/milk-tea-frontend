import * as Yup from "yup";

//! Regex: Only allow letters and spaces (Vietnamese names)
const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;

//! Regex: Basic VN phone number validation
const phoneRegex = /^(0[2-9]|84[2-9])([0-9]{8})$/;

//! Regex helpers
const hasUpper = /[A-Z]/;
const hasLower = /[a-z]/;
const hasNumber = /\d/;
const hasSpecial = /[^A-Za-z0-9]/; // Special characters like !@#$%^&*() etc.
const noSpaces = /^\S*$/;          // No spaces allowed
const noOnlySpaces = /.*\S.*/;     // No only spaces

//! Common bad passwords
const commonBadPasswords = new Set([
  "123456", "12345678", "password", "qwerty", "111111",
  "123123", "abc123", "iloveyou", "admin"
]);

const registerSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .matches(nameRegex, "Tên chỉ được chứa chữ cái và dấu cách")
    .matches(noOnlySpaces, "Tên không được chỉ là khoảng trắng")
    .required("Vui lòng nhập họ tên"),

  phone: Yup.string()
    .trim()
    .matches(/^\d+$/, "Số điện thoại chỉ chứa số")
    .matches(phoneRegex, "Số điện thoại không hợp lệ (VD: 098xxxxxxx)")
    .required("Vui lòng nhập số điện thoại"),

  email: Yup.string()
    .trim()
    .email("Email không đúng định dạng")
    .required("Vui lòng nhập email"),

  password: Yup.string()
    .trim()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(64, "Mật khẩu không được quá 64 ký tự")
    .matches(noOnlySpaces, "Mật khẩu không được chỉ chứa khoảng trắng")
    .matches(noSpaces, "Mật khẩu không được chứa khoảng trắng")
    .required("Vui lòng nhập mật khẩu")
    .matches(hasUpper, "Mật khẩu phải có ít nhất 1 chữ IN HOA (A–Z)")
    .matches(hasLower, "Mật khẩu phải có ít nhất 1 chữ thường (a–z)")
    .matches(hasNumber, "Mật khẩu phải có ít nhất 1 số (0–9)")
    .matches(hasSpecial, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)")
    .test("not-common", "Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác", (value) =>
      value ? !commonBadPasswords.has(value.toLowerCase()) : true
    )
    // (Tuỳ chọn) không chứa email/username
    .test("not-contain-user", "Mật khẩu không nên chứa tên/email của bạn", function (value) {
      if (!value) return true;
      const { email, name } = this.parent;
      const local = (email || "").split("@")[0]?.toLowerCase();
      const lowered = value.toLowerCase();
      return name
        ? !lowered.includes(name.toLowerCase()) &&
        (!local || !lowered.includes(local))
        : (!local || !lowered.includes(local));
    }),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default registerSchema;
