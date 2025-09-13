// Nhập hook `useField` từ Formik, hook này giúp quản lý các trường biểu mẫu trong form Formik
import { useField } from "formik";

// Định nghĩa component `InputField`, nhận prop `label` và các prop khác (dùng spread operator)
const InputField = ({ icon, label, style, ...props }) => {
  // Sử dụng hook `useField` để kết nối input này với trạng thái biểu mẫu của Formik
  // Hook trả về một mảng gồm 3 phần tử:
  // - `field`: chứa các prop của input như value, onChange, onBlur
  // - `meta`: chứa trạng thái của trường như touched (đã tương tác chưa), error (lỗi xác thực)
  // - `helpers`: các hàm hỗ trợ (không dùng ở đây)
  const [field, meta] = useField(props);

  // Trả về JSX cho component trường nhập liệu
  return (
    // Bao bọc input và label trong một div, thêm margin-bottom để tạo khoảng cách
    <div className={style}>
      {/* Hiển thị thẻ input, sử dụng spread operator để:
          - Truyền các prop từ `field` (như value, onChange, onBlur) để kết nối với trạng thái Formik
          - Truyền các prop khác (như type, placeholder) được truyền vào component
          - Áp dụng các lớp Tailwind CSS để định dạng (rộng 100%, padding, viền, góc bo) */}
      <input
        {...field}
        {...props}
        placeholder=""
        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      />
      {/* Hiển thị label cho trường nhập liệu, được định dạng là block, có margin-bottom và chữ đậm */}
      <label className="peer-focus:font-bold absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
        {icon}
        {label}
      </label>

      {/* Kiểm tra nếu trường đã được tương tác (touched) và có lỗi xác thực (error),
         thì hiển thị thông báo lỗi */}
      {meta.touched && meta.error ? (
        // Hiển thị thông báo lỗi bằng chữ màu đỏ, cỡ chữ nhỏ
        <div className="text-red-500 text-sm font-bold mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

// Xuất component `InputField` để sử dụng ở các phần khác của ứng dụng
export default InputField;
