import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';

const AddToppingModal = ({ onAdd, onClose, isLoading }) => {
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .min(2, 'Tên topping phải có ít nhất 2 ký tự')
            .max(100, 'Tên topping không được quá 100 ký tự')
            .required('Tên topping là bắt buộc'),
        extraPrice: Yup.number()
            .min(0, 'Giá topping không được âm')
            .required('Giá topping là bắt buộc'),
        description: Yup.string()
            .trim()
            .max(200, 'Mô tả không được quá 200 ký tự'),
        status: Yup.string()
            .oneOf(['available', 'unavailable'], 'Trạng thái không hợp lệ')
            .required('Trạng thái là bắt buộc')
    });

    const initialValues = {
        name: '',
        extraPrice: '',
        description: '',
        status: 'available'
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const toppingData = {
                name: values.name.trim(),
                extraPrice: parseFloat(values.extraPrice),
                description: values.description.trim(),
                status: values.status
            };

            await onAdd(toppingData);
            resetForm();
        } catch (error) {
            console.error('Error adding topping:', error);
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

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Thêm Topping Mới</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, values }) => (
                        <Form className="space-y-4">
                            {/* Topping Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Topping <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green_starbuck focus:border-transparent transition-all"
                                    placeholder="Nhập tên topping (VD: Trân châu đen, Pudding)"
                                />
                                <ErrorMessage 
                                    name="name" 
                                    component="div" 
                                    className="text-red-500 text-sm mt-1" 
                                />
                            </div>

                            {/* Extra Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá Thêm (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    type="number"
                                    name="extraPrice"
                                    min="0"
                                    step="1"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green_starbuck focus:border-transparent transition-all"
                                    placeholder="Nhập giá thêm (VD: 5000)"
                                />
                                <ErrorMessage 
                                    name="extraPrice" 
                                    component="div" 
                                    className="text-red-500 text-sm mt-1" 
                                />
                                {values.extraPrice && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        = {parseFloat(values.extraPrice || 0).toLocaleString()} VNĐ
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô Tả
                                </label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    rows="3"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green_starbuck focus:border-transparent transition-all resize-none"
                                    placeholder="Nhập mô tả cho topping (tối đa 200 ký tự)"
                                />
                                <ErrorMessage 
                                    name="description" 
                                    component="div" 
                                    className="text-red-500 text-sm mt-1" 
                                />
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {values.description.length}/200 ký tự
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng Thái <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    as="select"
                                    disabled
                                    name="status"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:ring-2 focus:ring-green_starbuck focus:border-transparent transition-all"
                                >
                                    <option value="available">Đang bán</option>
                                    <option value="unavailable">Ngừng bán</option>
                                </Field>
                                <ErrorMessage 
                                    name="status" 
                                    component="div" 
                                    className="text-red-500 text-sm mt-1" 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Topping mới sẽ tự động có trạng thái "Đang bán"
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                    className="flex-1 bg-green_starbuck text-white py-3 px-4 rounded-lg hover:bg-green_starbuck/80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isSubmitting || isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang thêm...
                                        </span>
                                    ) : (
                                        'Thêm Topping'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting || isLoading}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddToppingModal;