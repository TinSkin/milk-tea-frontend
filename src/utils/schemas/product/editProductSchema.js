import * as Yup from "yup";

// Regex để check URL (đơn giản, không quá nghiêm ngặt)
const urlRegex = /^(http|https):\/\/[^ "]+$/;

export const editProductSchema = Yup.object().shape({
  name: Yup.string().trim().required("Tên sản phẩm không được để trống"),
  images: Yup.array()
    .of(Yup.string().url("Mỗi URL ảnh phải hợp lệ"))
    .min(1, "Phải có ít nhất một ảnh")
    .required("Ảnh là bắt buộc"),
  price: Yup.number().typeError("Giá phải là số"),
  sizeOptions: Yup.array()
    .of(
      Yup.object().shape({
        size: Yup.string().required(),
        price: Yup.number().typeError("Phải là số").required("Bắt buộc"),
      })
    ),
  toppings: Yup.array()
    .of(Yup.string().required("Vui lòng chọn topping")),
  description: Yup.string().trim().required("Vui lòng nhập mô tả"),
  category: Yup.string().required("Vui lòng chọn danh mục"),
});
