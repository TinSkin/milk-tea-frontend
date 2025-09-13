import * as Yup from "yup";

export const addProductSchema = Yup.object().shape({
  name: Yup.string().trim().required("Tên sản phẩm là bắt buộc"),
  images: Yup.array()
    .of(Yup.string().url("URL ảnh không hợp lệ"))
    .min(1, "Phải nhập ít nhất 1 URL ảnh")
    .required("Phải nhập ít nhất 1 URL ảnh"),
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
