import React from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  Clock,
  CheckCircle2,
  Ban,
  Building2,
  Target,
  Users,
  Package
} from 'lucide-react';
import { formatNiceDate } from '../../../../utils/helpers/dateFormatter';

const ViewStoreModal = ({ store, onClose }) => {
    // Handle click outside modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    //! Render trạng thái badge
    const renderStatusBadge = (status) => {
        const statusConfig = {
            active: {
                bg: "bg-green-100",
                text: "text-green-800",
                icon: CheckCircle2,
                label: "Đang hoạt động",
            },
            inactive: {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                icon: Clock,
                label: "Tạm ngừng",
            },
            closed: {
                bg: "bg-red-100",
                text: "text-red-800",
                icon: Ban,
                label: "Đã đóng cửa",
            },
        };

        const config = statusConfig[status] || statusConfig.active;
        const Icon = config.icon;

        return (
            <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
            >
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        );
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (!store) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-camel to-orange-600 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{store.storeName}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-white/90">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    Mã: {store.storeCode}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Tạo: {formatNiceDate(store.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {renderStatusBadge(store.status)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5 text-camel" />
                                Thông tin cơ bản
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Tên cửa hàng</label>
                                    <div className="text-gray-900 font-medium">{store.storeName}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Mã cửa hàng</label>
                                    <div className="text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                                        {store.storeCode}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
                                    <div>
                                        {renderStatusBadge(store.status)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-camel" />
                                Địa chỉ
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Địa chỉ đầy đủ</label>
                                    <div className="text-gray-900">
                                        {store.address?.street}
                                        <br />
                                        {store.address?.district}, {store.address?.city}
                                        {store.address?.zipCode && (
                                            <span className="text-gray-600"> - {store.address.zipCode}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin liên hệ */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="w-5 h-5 text-camel" />
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                                        <a 
                                            href={`tel:${store.phone}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {store.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Email</label>
                                        <a 
                                            href={`mailto:${store.email}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {store.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông số kinh doanh */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-camel" />
                                Thông số kinh doanh
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Sức chứa</label>
                                        <div className="text-gray-900 font-medium">
                                            {store.capacity} khách
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Target className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Mục tiêu doanh số/tháng</label>
                                        <div className="text-gray-900 font-medium">
                                            {formatCurrency(store.monthlyTarget)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-900">
                                {store.products?.length || 0}
                            </div>
                            <div className="text-sm text-blue-700">Sản phẩm</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-900">
                                {store.staff?.length || 0}
                            </div>
                            <div className="text-sm text-green-700">Nhân viên</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <Building2 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-orange-900">
                                {store.categories?.length || 0}
                            </div>
                            <div className="text-sm text-orange-700">Danh mục</div>
                        </div>
                    </div>

                    {/* Thông tin quản lý */}
                    {store.manager && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-camel" />
                                Quản lý cửa hàng
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-camel to-orange-600 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {store.manager.fullName || store.manager.username || 'Chưa có thông tin'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {store.manager.email || 'Chưa có email'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ngày tạo và cập nhật */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Ngày tạo: {formatNiceDate(store.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Cập nhật: {formatNiceDate(store.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStoreModal;