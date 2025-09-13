import * as Yup from "yup";

export const addOrderSchema = Yup.object({
  sizeOption: Yup.string().required("Vui lòng chọn size sản phẩm"),

  toppings: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required(),
        extraPrice: Yup.number().required(),
      })
    )
    .notRequired(),

  quantity: Yup.number()
    .required("Vui lòng nhập số lượng")
    .min(1, "Số lượng phải lớn hơn hoặc bằng 1")
    .integer("Số lượng phải là số nguyên"),

  sugarLevel: Yup.string().oneOf(["25", "50", "75", "100"]).notRequired(), // hoặc .required() nếu bắt buộc người dùng chọn

  iceOption: Yup.string().oneOf(["Chung", "Riêng"]).notRequired(), // hoặc .required() nếu bắt buộc người dùng chọn
});
