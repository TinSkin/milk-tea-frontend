import * as Yup from 'yup';

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO danh mục
export const addCategoryRequestSchema = Yup.object({
  selectedCategoryId: Yup.string().required('Vui lòng chọn danh mục'),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu TẠO danh mục mới
export const createCategoryRequestSchema = Yup.object({
  name: Yup.string().required('Tên danh mục là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  reason: Yup.string()
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu CẬP NHẬT danh mục
export const updateCategoryRequestSchema = Yup.object({
  name: Yup.string().required('Tên danh mục là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu XÓA danh mục
export const deleteCategoryRequestSchema = Yup.object({
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});

// Lược đồ kiểm tra dữ liệu cho yêu cầu THAY ĐỔI trạng thái danh mục
export const changeCategoryStatusRequestSchema = Yup.object({
  status: Yup.string().oneOf(['available', 'unavailable'], 'Trạng thái không hợp lệ').required('Trạng thái là bắt buộc'),
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc')
});