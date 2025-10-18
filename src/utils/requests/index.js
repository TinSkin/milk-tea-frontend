// Xuất (export) các lược đồ xác thực dữ liệu liên quan đến SẢN PHẨM
export {
  addProductRequestSchema,
  createProductRequestSchema,
  updateProductRequestSchema,
  deleteProductRequestSchema,
  changeProductStatusRequestSchema
} from './product';

// Xuất (export) các lược đồ xác thực dữ liệu liên quan đến DANH MỤC
export {
  addCategoryRequestSchema,
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  deleteCategoryRequestSchema,
  changeCategoryStatusRequestSchema
} from './category';

// Xuất (export) các lược đồ xác thực dữ liệu liên quan đến TOPPING
export {
  addToppingRequestSchema,
  createToppingRequestSchema,
  updateToppingRequestSchema,
  deleteToppingRequestSchema,
  changeToppingStatusRequestSchema,
  changeToppingPriceRequestSchema
} from './topping';

// Xuất (export) tất cả lược đồ yêu cầu chung
export {
  updateRequestSchema,
  cancelRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  bulkActionRequestSchema
} from './common';