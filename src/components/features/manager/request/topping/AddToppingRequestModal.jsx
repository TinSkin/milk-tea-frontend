import { useState, useEffect } from 'react';
import { X, Search, Plus, Cookie, Lightbulb } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useRequestManagerStore } from '../../../../../store/request/requestManagerStore';
import { useManagerStore } from '../../../../../store/managerStore';
import Notification from '../../../../ui/Notification';
import { addToppingRequestSchema, createToppingRequestSchema } from '../../../../../utils/requests';

const AddToppingRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'new'
  
  // Store data
  const { submitCreateRequest } = useRequestManagerStore();
  const { 
    storeInfo,
    isLoading
  } = useManagerStore();
  
  // State cho tab "Thêm topping có sẵn"
  const [availableToppings, setAvailableToppings] = useState([]);
  const [filteredToppings, setFilteredToppings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  //! Initial values
  const existingToppingInitialValues = {
    selectedToppingId: '',
    reason: ''
  };

  const newToppingInitialValues = {
    name: '',
    description: '',
    extraPrice: 0,
    reason: ''
  };

  //! Load dữ liệu khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'existing') {
        loadAvailableToppings();
      }
    }
  }, [isOpen, activeTab]);

  //! Filter toppings khi search
  useEffect(() => {
    if (searchTerm) {
      setFilteredToppings(
        availableToppings.filter(topping => 
          topping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topping.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredToppings(availableToppings);
    }
  }, [searchTerm, availableToppings]);

  // TODO: Load danh sách topping hệ thống chưa có ở cửa hàng
  const loadAvailableToppings = async () => {
    try {
      // Tạm thời mock data - sau này sẽ gọi API thực
      const mockToppings = [
        {
          _id: '1',
          name: 'Trân châu đen',
          description: 'Trân châu đen dai ngon, ngọt thanh',
          price: 10000,
          image: 'https://example.com/topping1.jpg'
        },
        {
          _id: '2', 
          name: 'Thạch dừa',
          description: 'Thạch dừa tươi mát, béo ngậy',
          price: 8000,
          image: 'https://example.com/topping2.jpg'
        },
        {
          _id: '3',
          name: 'Kem cheese',
          description: 'Kem phô mai béo ngậy, thơm lừng',
          price: 15000,
          image: 'https://example.com/topping3.jpg'
        },
        {
          _id: '4',
          name: 'Pudding',
          description: 'Bánh flan mềm mịn, ngọt vừa',
          price: 12000,
          image: 'https://example.com/topping4.jpg'
        }
      ];
      setAvailableToppings(mockToppings);
    } catch (error) {
      console.error('Error loading available toppings:', error);
    }
  };

  //! Thêm topping có sẵn
  const handleSubmitExistingTopping = async (values, { setSubmitting }) => {
    try {
      console.log('Submitting existing topping with values:', values);
      console.log('Store info:', storeInfo);
      
      if (!storeInfo?._id) {
        Notification.error('Thiếu thông tin cửa hàng', 'Vui lòng tải lại trang và thử lại');
        return;
      }
      
      const selectedTopping = availableToppings.find(t => t._id === values.selectedToppingId);
      if (!selectedTopping) throw new Error('Không tìm thấy topping được chọn');

      // Theo backend controller, cần gửi đúng format
      const requestData = {
        storeId: storeInfo?._id,
        entity: 'topping',
        action: 'create',
        payload: {
          // Đây là dữ liệu topping có sẵn muốn thêm vào store
          toppingId: selectedTopping._id,
          name: selectedTopping.name,
          description: selectedTopping.description,
          price: selectedTopping.price,
          image: selectedTopping.image
        },
        original: {},
        reason: values.reason || `Yêu cầu thêm topping "${selectedTopping.name}" vào cửa hàng`,
        attachments: [],
        tags: ['add-existing-topping']
      };

      await submitCreateRequest('topping', requestData);
      
      Notification.success(
        'Gửi yêu cầu thành công!',
        `Đã gửi yêu cầu thêm topping "${selectedTopping.name}" tới Admin`
      );
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting existing topping request:', error);
      Notification.error(
        'Gửi yêu cầu thất bại',
        error.message || 'Đã xảy ra lỗi khi gửi yêu cầu'
      );
    } finally {
      setSubmitting(false);
    }
  };

  //! Đề xuất topping mới
  const handleSubmitNewTopping = async (values, { setSubmitting }) => {
    try {
      console.log('Submitting new topping with values:', values);
      console.log('Store info:', storeInfo);
      
      if (!storeInfo?._id) {
        Notification.error('Thiếu thông tin cửa hàng', 'Vui lòng tải lại trang và thử lại');
        return;
      }
      
      // Theo backend controller, cần gửi đúng format  
      const requestData = {
        storeId: storeInfo._id,
        entity: 'topping', 
        action: 'create',
        payload: {
          // Đây là dữ liệu topping mới hoàn toàn
          name: values.name,
          description: values.description,
          extraPrice: values.extraPrice
        },
        original: {},
        reason: values.reason || `Đề xuất tạo topping mới: "${values.name}"`,
        attachments: [],
        tags: ['new-topping-proposal']
      };

      await submitCreateRequest('topping', requestData);
      
      Notification.success(
        'Gửi yêu cầu thành công!',
        `Đã gửi đề xuất topping mới "${values.name}" tới Admin`
      );
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error submitting new topping request:', error);
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cookie className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Yêu cầu thêm topping
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
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Cookie className="w-4 h-4" />
              <span>Thêm topping có sẵn</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Đề xuất topping mới</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'existing' ? (
            <Formik
              initialValues={existingToppingInitialValues}
              validationSchema={addToppingRequestSchema}
              onSubmit={handleSubmitExistingTopping}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Search toppings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tìm kiếm topping
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên topping, mô tả..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Toppings grid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chọn topping *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {filteredToppings.map((topping) => (
                        <div
                          key={topping._id}
                          onClick={() => setFieldValue('selectedToppingId', topping._id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            values.selectedToppingId === topping._id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {topping.image && (
                              <img
                                src={topping.image}
                                alt={topping.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{topping.name}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {topping.description}
                              </p>
                              <div className="mt-2">
                                <span className="text-sm font-medium text-orange-600">
                                  +{topping.price.toLocaleString()}đ
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ErrorMessage name="selectedToppingId" component="div" className="text-red-500 text-sm mt-1" />
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
                      placeholder="Nhập lý do tại sao cần thêm topping này..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={newToppingInitialValues}
              validationSchema={createToppingRequestSchema}
              onSubmit={handleSubmitNewTopping}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Topping name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên topping *
                    </label>
                    <Field
                      name="name"
                      placeholder="VD: Trân châu vàng"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả topping *
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={3}
                      placeholder="Mô tả chi tiết về topping này, hương vị, cách chế biến..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá topping *
                    </label>
                    <div className="relative">
                      <Field
                        name="extraPrice"
                        type="number"
                        placeholder="0"
                        className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 text-sm">VNĐ</span>
                      </div>
                    </div>
                    <ErrorMessage name="extraPrice" component="div" className="text-red-500 text-sm mt-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      Giá này sẽ được cộng thêm vào giá sản phẩm khi khách chọn topping
                    </p>
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
                      placeholder="Tại sao bạn muốn thêm topping này? Có lợi ích gì cho cửa hàng..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
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

export default AddToppingRequestModal;