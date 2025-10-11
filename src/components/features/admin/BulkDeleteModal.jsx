
import { Trash2 } from "lucide-react";

const BulkDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  selectedCount,
  itemType = "topping",
  confirmText = "Xóa vĩnh viễn",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Xác nhận xóa vĩnh viễn
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Bạn có chắc chắn muốn{" "}
            <span className="font-bold text-red-600">XÓA VĨNH VIỄN</span>{" "}
            <span className="font-semibold text-red-600">{selectedCount}</span>{" "}
            {itemType} được chọn không?
          </p>
          <p className="text-xs text-gray-400 mt-2">
            <span className="font-semibold text-red-600">Cảnh báo:</span>{" "}
            Hành động này KHÔNG THỂ hoàn tác!
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;