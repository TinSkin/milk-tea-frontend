import * as Yup from 'yup';

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO sản phẩm
export const addProductRequestSchema = Yup.object({
  selectedProductId: Yup.string().required('Vui lòng chọn sản phẩm'),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO sản phẩm mới
export const createProductRequestSchema = Yup.object({
  name: Yup.string().required('Tên sản phẩm là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  images: Yup.string().min(1, 'Phải có ít nhất 1 hình ảnh'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  sizeOptions: Yup.array()
    .min(1, 'Phải có ít nhất 1 size')
    .of(
      Yup.object({
        size: Yup.string().required('Tên size là bắt buộc'),
        price: Yup.number().positive('Giá phải lớn hơn 0').required('Giá là bắt buộc')
      })
    ),
  toppings: Yup.array(),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu CẬP NHẬT sản phẩm
export const updateProductRequestSchema = Yup.object({
  name: Yup.string().required('Tên sản phẩm là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  images: Yup.array().min(1, 'Phải có ít nhất 1 hình ảnh'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  sizeOptions: Yup.array()
    .min(1, 'Phải có ít nhất 1 size')
    .of(
      Yup.object({
        size: Yup.string().required('Tên size là bắt buộc'),
        price: Yup.number().positive('Giá phải lớn hơn 0').required('Giá là bắt buộc')
      })
    ),
  toppings: Yup.array(),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu XÓA sản phẩm
export const deleteProductRequestSchema = Yup.object({
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu THAY ĐỔI trạng thái sản phẩm
export const changeProductStatusRequestSchema = Yup.object({
  status: Yup.string().oneOf(['available', 'unavailable'], 'Trạng thái không hợp lệ').required('Trạng thái là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});