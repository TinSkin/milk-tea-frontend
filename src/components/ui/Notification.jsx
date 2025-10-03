// components/Notify.jsx
import { toast } from 'sonner';

const Notification = {
  success: (message = "Thành công!", description = "") =>
    toast.success(message, {
      description,
    }),

  error: (message = "Lỗi!", description = "") =>
    toast.error(message, {
      description,
    }),

  info: (message = "Thông báo", description = "") =>
    toast.message(message, {
      description,
    }),

  warning: (message = "Cảnh báo!", description = "") =>
    toast.warning(message, {
      description,
    }),

  promise: (promiseFn, { loading = "Đang xử lý...", success = "Thành công", error = "Thất bại" }) =>
    toast.promise(promiseFn, {
      loading,
      success,
      error,
    }),
};

export default Notification;

