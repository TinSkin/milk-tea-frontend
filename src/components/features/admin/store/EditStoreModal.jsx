import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Store, MapPin, Phone, Mail, User, Edit3 } from 'lucide-react';

import Notification from '../../../ui/Notification';

const EditStoreModal = ({ store, onUpdate, onClose, isLoading }) => {
    const validationSchema = Yup.object({
        storeName: Yup.string()
            .trim()
            .min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự')
            .max(100, 'Tên cửa hàng không được quá 100 ký tự')
            .required('Tên cửa hàng là bắt buộc'),
        storeCode: Yup.string()
            .trim()
            .min(2, 'Mã cửa hàng phải có ít nhất 2 ký tự')
            .max(20, 'Mã cửa hàng không được quá 20 ký tự')
            .matches(/^[A-Z0-9]+$/, 'Mã cửa hàng chỉ được chứa chữ hoa và số')
            .required('Mã cửa hàng là bắt buộc'),
        street: Yup.string()
            .trim()
            .min(10, 'Địa chỉ đường phải có ít nhất 10 ký tự')
            .max(200, 'Địa chỉ đường không được quá 200 ký tự')
            .required('Địa chỉ đường là bắt buộc'),
        district: Yup.string()
            .trim()
            .min(2, 'Quận/Huyện phải có ít nhất 2 ký tự')
            .max(50, 'Quận/Huyện không được quá 50 ký tự')
            .required('Quận/Huyện là bắt buộc'),
        city: Yup.string()
            .trim()
            .min(2, 'Thành phố phải có ít nhất 2 ký tự')
            .max(50, 'Thành phố không được quá 50 ký tự')
            .required('Thành phố là bắt buộc'),
        zipCode: Yup.string()
            .trim()
            .matches(/^[0-9]+$/, 'Mã bưu điện chỉ được chứa số')
            .min(5, 'Mã bưu điện phải có ít nhất 5 số')
            .max(10, 'Mã bưu điện không được quá 10 số'),
        phone: Yup.string()
            .trim()
            .matches(/^[0-9+\-\s\(\)]+$/, 'Số điện thoại không hợp lệ')
            .min(10, 'Số điện thoại phải có ít nhất 10 số')
            .max(15, 'Số điện thoại không được quá 15 số')
            .required('Số điện thoại là bắt buộc'),
        email: Yup.string()
            .trim()
            .email('Email không hợp lệ')
            .required('Email là bắt buộc'),
        capacity: Yup.number()
            .min(1, 'Sức chứa phải lớn hơn 0')
            .max(1000, 'Sức chứa không được quá 1000')
            .required('Sức chứa là bắt buộc'),
        monthlyTarget: Yup.number()
            .min(0, 'Mục tiêu doanh số không được âm')
            .max(10000000000, 'Mục tiêu doanh số quá lớn'),
        status: Yup.string()
            .oneOf(['active', 'inactive', 'closed'], 'Trạng thái không hợp lệ')
            .required('Trạng thái là bắt buộc')
    });

    const initialValues = {
        storeName: store?.storeName || '',
        storeCode: store?.storeCode || '',
        street: store?.address?.street || '',
        district: store?.address?.district || '',
        city: store?.address?.city || '',
        zipCode: store?.address?.zipCode || '',
        phone: store?.phone || '',
        email: store?.email || '',
        capacity: store?.capacity || '',
        monthlyTarget: store?.monthlyTarget || '',
        status: store?.status || 'active'
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            Notification.info(
                'Đang phát triển',
                'Chức năng chỉnh sửa thông tin cửa hàng đang được phát triển'
            );
            
            // Close modal after showing notification
            onClose();
            
            // Commented out for development
            /*
            const storeData = {
                storeName: values.storeName.trim(),
                storeCode: values.storeCode.trim().toUpperCase(),
                address: {
                    street: values.street.trim(),
                    district: values.district.trim(),
                    city: values.city.trim(),
                    zipCode: values.zipCode.trim()
                },
                phone: values.phone.trim(),
                email: values.email.trim().toLowerCase(),
                capacity: parseInt(values.capacity),
                monthlyTarget: parseFloat(values.monthlyTarget) || 0,
                status: values.status
            };

            await onUpdate(storeData);
            */
        } catch (error) {
            console.error('Error updating store:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle click outside modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!store) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa cửa hàng</h2>
                            <p className="text-sm text-gray-600">Cập nhật thông tin cửa hàng: {store.storeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <Formik
                    initialValues={initialValues}
                    // validationSchema={validationSchema} // Commented out for development
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, values, errors, touched }) => (
                        <Form className="p-6 space-y-6">
                            {/* Thông tin cơ bản */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Store className="w-5 h-5 text-camel" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên cửa hàng <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="storeName"
                                            type="text"
                                            placeholder="Nhập tên cửa hàng"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.storeName && touched.storeName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="storeName" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mã cửa hàng <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="storeCode"
                                            type="text"
                                            placeholder="VD: STORE001"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.storeCode && touched.storeCode ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="storeCode" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Địa chỉ */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-camel" />
                                    Địa chỉ
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ đường <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="street"
                                            type="text"
                                            placeholder="Nhập địa chỉ chi tiết"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.street && touched.street ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="street" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quận/Huyện <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                name="district"
                                                type="text"
                                                placeholder="Nhập quận/huyện"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                    errors.district && touched.district ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="district" component="div" className="text-red-500 text-xs mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Thành phố <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                name="city"
                                                type="text"
                                                placeholder="Nhập thành phố"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                    errors.city && touched.city ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="city" component="div" className="text-red-500 text-xs mt-1" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mã bưu điện
                                            </label>
                                            <Field
                                                name="zipCode"
                                                type="text"
                                                placeholder="Nhập mã bưu điện"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                    errors.zipCode && touched.zipCode ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="zipCode" component="div" className="text-red-500 text-xs mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin liên hệ */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-camel" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="phone"
                                            type="tel"
                                            placeholder="Nhập số điện thoại"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.phone && touched.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="email"
                                            type="email"
                                            placeholder="Nhập email"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Thông số kinh doanh */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-camel" />
                                    Thông số kinh doanh
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sức chứa <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="capacity"
                                            type="number"
                                            placeholder="Số khách tối đa"
                                            min="1"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.capacity && touched.capacity ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="capacity" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mục tiêu doanh số/tháng (VNĐ)
                                        </label>
                                        <Field
                                            name="monthlyTarget"
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.monthlyTarget && touched.monthlyTarget ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        <ErrorMessage name="monthlyTarget" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            as="select"
                                            name="status"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-camel focus:border-transparent ${
                                                errors.status && touched.status ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Tạm ngừng</option>
                                            <option value="closed">Đã đóng cửa</option>
                                        </Field>
                                        <ErrorMessage name="status" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {(isSubmitting || isLoading) && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    Cập nhật
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default EditStoreModal;