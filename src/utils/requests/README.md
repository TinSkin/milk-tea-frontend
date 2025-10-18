# Request Validation Schemas

Thư mục này chứa các validation schemas cho các request operations trong hệ thống milk-tea-app, được tổ chức theo convention quốc tế.

## Cấu trúc

```
utils/requests/
├── index.js          # Export tất cả schemas
├── product.js        # Schemas cho product requests
├── category.js       # Schemas cho category requests  
├── topping.js        # Schemas cho topping requests
├── common.js         # Schemas chung cho tất cả entities
└── README.md         # Documentation này
```

## Cách sử dụng

### Import từ index (Recommended)
```javascript
import { 
  addProductRequestSchema, 
  createCategoryRequestSchema,
  updateToppingRequestSchema,
  cancelRequestSchema 
} from '../../../../utils/requests';
```

### Import trực tiếp từ file entity
```javascript
import { addProductRequestSchema } from '../../../../utils/requests/product';
import { createCategoryRequestSchema } from '../../../../utils/requests/category';
```

## Loại schemas

### Product Schemas
- `addProductRequestSchema` - Thêm sản phẩm có sẵn vào store
- `createProductRequestSchema` - Tạo sản phẩm mới
- `updateProductRequestSchema` - Cập nhật sản phẩm
- `deleteProductRequestSchema` - Xóa sản phẩm
- `changeProductStatusRequestSchema` - Thay đổi trạng thái sản phẩm

### Category Schemas  
- `addCategoryRequestSchema` - Thêm danh mục có sẵn vào store
- `createCategoryRequestSchema` - Tạo danh mục mới
- `updateCategoryRequestSchema` - Cập nhật danh mục
- `deleteCategoryRequestSchema` - Xóa danh mục
- `changeCategoryStatusRequestSchema` - Thay đổi trạng thái danh mục

### Topping Schemas
- `addToppingRequestSchema` - Thêm topping có sẵn vào store  
- `createToppingRequestSchema` - Tạo topping mới
- `updateToppingRequestSchema` - Cập nhật topping
- `deleteToppingRequestSchema` - Xóa topping
- `changeToppingStatusRequestSchema` - Thay đổi trạng thái topping
- `changeToppingPriceRequestSchema` - Thay đổi giá topping

### Common Schemas
- `updateRequestSchema` - Schema chung cho update operations
- `cancelRequestSchema` - Hủy request
- `approveRequestSchema` - Approve request (Admin)
- `rejectRequestSchema` - Reject request (Admin)
- `bulkActionRequestSchema` - Bulk operations

## Formik Integration

Các schemas này được thiết kế để tích hợp với Formik + Yup:

```javascript
import { Formik, Form } from 'formik';
import { addProductRequestSchema } from '../../../../utils/requests';

<Formik
  initialValues={initialValues}
  validationSchema={addProductRequestSchema}
  onSubmit={handleSubmit}
>
  <Form>
    {/* Form fields */}
  </Form>
</Formik>
```

## Naming Convention

- `add[Entity]RequestSchema` - Thêm entity có sẵn từ hệ thống
- `create[Entity]RequestSchema` - Tạo entity mới hoàn toàn
- `update[Entity]RequestSchema` - Cập nhật entity đã có
- `delete[Entity]RequestSchema` - Xóa entity
- `change[Entity][Property]RequestSchema` - Thay đổi thuộc tính cụ thể

## Contribution

Khi thêm schemas mới:
1. Thêm vào file entity tương ứng (product.js, category.js, topping.js)
2. Export trong index.js
3. Update README.md này
4. Tuân theo naming convention đã định