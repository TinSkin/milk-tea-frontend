import * as Yup from 'yup';

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO topping
export const addToppingRequestSchema = Yup.object({
  selectedToppingId: Yup.string().required('Vui lòng chọn topping'),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO topping mới
export const createToppingRequestSchema = Yup.object({
  name: Yup.string().required('Tên topping là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  extraPrice: Yup.number().min(0, 'Giá thêm không được âm').required('Giá thêm là bắt buộc'),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu CẬP NHẬT topping
export const updateToppingRequestSchema = Yup.object({
  name: Yup.string().required('Tên topping là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  extraPrice: Yup.number().min(0, 'Giá thêm không được âm').required('Giá thêm là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu XÓA topping
export const deleteToppingRequestSchema = Yup.object({
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu THAY ĐỔI trạng thái topping
export const changeToppingStatusRequestSchema = Yup.object({
  status: Yup.string().oneOf(['available', 'unavailable'], 'Trạng thái không hợp lệ').required('Trạng thái là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu THAY ĐỔI giá topping
export const changeToppingPriceRequestSchema = Yup.object({
  extraPrice: Yup.number().min(0, 'Giá thêm không được âm').required('Giá thêm là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});