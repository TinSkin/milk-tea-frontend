import * as Yup from 'yup';

export const updateRequestSchema = Yup.object({
  reason: Yup.string().min(10, 'Lý do phải có ít nhất 10 ký tự').required('Lý do là bắt buộc'),
  payload: Yup.object().required('Dữ liệu cập nhật là bắt buộc'),
  original: Yup.object().required('Dữ liệu gốc là bắt buộc')
});

export const cancelRequestSchema = Yup.object({
  note: Yup.string().min(10, 'Ghi chú phải có ít nhất 10 ký tự').required('Ghi chú là bắt buộc')
});

export const approveRequestSchema = Yup.object({
  note: Yup.string()
});

export const rejectRequestSchema = Yup.object({
  note: Yup.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự').required('Lý do từ chối là bắt buộc')
});

export const bulkActionRequestSchema = Yup.object({
  requestIds: Yup.array().min(1, 'Phải chọn ít nhất 1 request').required('Danh sách request là bắt buộc'),
  action: Yup.string().oneOf(['approve', 'reject'], 'Action không hợp lệ').required('Action là bắt buộc'),
  note: Yup.string()
});