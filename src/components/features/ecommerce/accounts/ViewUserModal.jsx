import { X, User, AlertTriangle } from "lucide-react";
import { getRoleDisplayConfig } from "./config/roleConfig";
import Section from "./components/Section";

const ViewUserModal = ({
  user,
  viewerRole = "customer",
  onClose,
  className = ""
 }) => {
  if (!user) return null;

  // Lấy config hiển thị dựa trên role
  const displayConfig = getRoleDisplayConfig(user.role, viewerRole);
  console.log("Display Config:", displayConfig);

  // Nếu không có quyền xem
  if (!displayConfig) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có quyền truy cập
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền xem thông tin của người dùng này.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green_starbuck to-green_starbuck/80 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{displayConfig.title}</h2>
                <p className="text-green-50 text-sm">
                  {displayConfig.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {Object.entries(displayConfig.sections).map(
            ([sectionKey, section]) => (
              <Section
                key={sectionKey}
                title={section.title}
                fields={section.fields}
                user={user}
              />
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Viewing as: <span className="font-medium">{viewerRole}</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green_starbuck text-white rounded-lg font-semibold hover:bg-green_starbuck/90 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
