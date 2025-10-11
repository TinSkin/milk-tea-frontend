import { Trash2 } from "lucide-react"; 
const SelectedItemsBanner = ({
    selectedCount,
    itemType = "topping",
    onClearSelection,
    onBulkDelete,
    isLoading = false,
  }) => {
    if (selectedCount === 0) return null;
  
    return (
      <div className="px-5">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-blue-700 font-medium">
              Đã chọn {selectedCount} {itemType}
            </span>
            <button
              onClick={onClearSelection}
              className="text-blue-600 hover:text-blue-800 underline text-md"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default SelectedItemsBanner;