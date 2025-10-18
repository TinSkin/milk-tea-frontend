import { useState, useEffect } from 'react';
import { X, Search, Plus, FolderTree, Lightbulb } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRequestManagerStore } from '../../../../../store/request/requestManagerStore';
import { useManagerStore } from '../../../../../store/managerStore';
import Notification from '../../../../ui/Notification';
import { addCategoryRequestSchema, createCategoryRequestSchema } from '../../../../../utils/requests';

const AddCategoryRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
  
  // Store data
  const { submitCreateRequest } = useRequestManagerStore();
  const { 
    storeInfo,
    isLoading
  } = useManagerStore();
  
  // State cho tab "Thêm danh mục có sẵn"
  const [availableCategories, setAvailableCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  //! Initial values
  const existingCategoryInitialValues = {
    selectedCategoryId: '',
    reason: ''
  };

  const newCategoryInitialValues = {
    name: '',
    description: '',
    reason: ''
  };

  //! Load dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'existing') {
        loadAvailableCategories();
      }
    }
  }, [isOpen, activeTab]);

  //! Filter categories khi search
  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        availableCategories.filter(category => 
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(availableCategories);
    }
  }, [searchTerm, availableCategories]);

  // TODO: Load danh sách danh mục hệ thống chưa có ở cửa hàng
  const loadAvailableCategories = async () => {
    try {
      // Tạm thời mock data - sau này sẽ gọi API thực
      const mockCategories = [
        {
          _id: '1',
          name: 'Trà trái cây',
          description: 'Các loại trà pha với trái cây tươi ngon',
          image: 'https://example.com/category1.jpg'
        },
        {
          _id: '2', 
          name: 'Cà phê đặc biệt',
          description: 'Cà phê rang xay với hương vị độc đáo',
          image: 'https://example.com/category2.jpg'
        },
        {
          _id: '3',
          name: 'Smoothie',
          description: 'Sinh tố trái cây tươi ngon, bổ dưỡng',
          image: 'https://example.com/category3.jpg'
        }
      ];
      setAvailableCategories(mockCategories);
    } catch (error) {
      console.error('Error loading available categories:', error);
    }
  };

  //! Xử lí khi submit yêu cầu thêm danh mục có sẵn
  const handleSubmitExistingCategory = async (values, { setSubmitting }) => {
    try {
      const selectedCategory = availableCategories.find(c => c._id === values.selectedCategoryId);
      if (!selectedCategory) throw new Error('Không tìm thấy danh mục được chọn');

      // Theo backend controller, cần gửi đúng format
      const requestData = {
        storeId: storeInfo?._id,
        entity: 'category',
        action: 'create',
        payload: {
          // Đây là dữ liệu danh mục có sẵn muốn thêm vào store
          categoryId: selectedCategory._id,
          name: selectedCategory.name,
          description: selectedCategory.description,
          image: selectedCategory.image
        },
        original: {},
        reason: values.reason || `Yêu cầu thêm danh mục "${selectedCategory.name}" vào cửa hàng`,
        attachments: [],
        tags: ['add-existing-category']
      };

      await submitCreateRequest('category', requestData);
      
      Notification.success(
        'Gửi yêu cầu thành công!',
        `Đã gửi yêu cầu thêm danh mục "${selectedCategory.name}" tới Admin`
      );
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting existing category request:', error);
      Notification.error(
        'Gửi yêu cầu thất bại',
        error.message || 'Đã xảy ra lỗi khi gửi yêu cầu'
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Xử lí khi submit yêu cầu đề xuất danh mục mới
  const handleSubmitNewCategory = async (values, { setSubmitting }) => {
    try {
      // Theo backend controller, cần gửi đúng format  
      const requestData = {
        storeId: storeInfo?._id,
        entity: 'category', 
        action: 'create',
        payload: {
          // Đây là dữ liệu danh mục mới hoàn toàn
          name: values.name,
          description: values.description
        },
        original: {},
        reason: values.reason || `Đề xuất tạo danh mục mới: "${values.name}"`,
        attachments: [],
        tags: ['new-category-proposal']
      };

      await submitCreateRequest('category', requestData);
      
      Notification.success(
        'Gửi yêu cầu thành công!',
        `Đã gửi đề xuất danh mục mới "${values.name}" tới Admin`
      );
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting new category request:', error);
      Notification.error(
        'Gửi yêu cầu thất bại',
        error.message || 'Đã xảy ra lỗi khi gửi yêu cầu'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab('existing');
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderTree className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Yêu cầu thêm danh mục
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'existing'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FolderTree className="w-4 h-4" />
              <span>Thêm danh mục có sẵn</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Đề xuất danh mục mới</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'existing' ? (
            <Formik
              initialValues={existingCategoryInitialValues}
              validationSchema={addCategoryRequestSchema}
              onSubmit={handleSubmitExistingCategory}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Search categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tìm kiếm danh mục
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên danh mục, mô tả..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Categories grid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chọn danh mục *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {filteredCategories.map((category) => (
                        <div
                          key={category._id}
                          onClick={() => setFieldValue('selectedCategoryId', category._id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            values.selectedCategoryId === category._id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ErrorMessage name="selectedCategoryId" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do yêu cầu (tùy chọn)
                    </label>
                    <Field
                      as="textarea"
                      name="reason"
                      rows={3}
                      placeholder="Nhập lý do tại sao cần thêm danh mục này..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage name="reason" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={newCategoryInitialValues}
              validationSchema={createCategoryRequestSchema}
              onSubmit={handleSubmitNewCategory}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Category name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên danh mục *
                    </label>
                    <Field
                      name="name"
                      placeholder="VD: Trà sữa cao cấp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả danh mục *
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      placeholder="Mô tả chi tiết về danh mục này, loại sản phẩm sẽ thuộc danh mục..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do đề xuất (tùy chọn)
                    </label>
                    <Field
                      as="textarea"
                      name="reason"
                      rows={3}
                      placeholder="Tại sao bạn muốn thêm danh mục này? Có lợi ích gì cho cửa hàng..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <ErrorMessage name="reason" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi đề xuất'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryRequestModal;