# Suspense là gì?

**Suspense** là một React component giúp xử lý trạng thái loading cho các component không đồng bộ (asynchronous components).

## Mục đích:

- **Lazy Loading**: Hiển thị fallback UI khi component đang được load
- **Code Splitting**: Chia nhỏ bundle, chỉ load khi cần
- **Better UX**: Cung cấp loading states mượt mà

## Cú pháp:

```jsx
import { Suspense } from "react";

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>;
```

## Các tham số:

- **fallback**: Component hiển thị khi đang loading (bắt buộc)
- **children**: Các component con có thể lazy load

## Ví dụ thực tế:

```jsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

---

# lazy() là gì?

**lazy()** là một React function để tạo component được load động (dynamic import).

## Mục đích:

- **Code Splitting**: Tách component thành chunk riêng biệt
- **Performance**: Giảm bundle size ban đầu
- **On-demand Loading**: Chỉ load khi component được sử dụng

## Cú pháp:

```jsx
import { lazy } from "react";

const LazyComponent = lazy(() => import("./Component"));
```

## Cách hoạt động:

1. **Build time**: Webpack tạo separate chunk cho component
2. **Runtime**: Component chỉ được download khi cần
3. **Suspense**: Cần wrap bằng Suspense để handle loading

## Ví dụ thực tế:

```jsx
// Thay vì import trực tiếp
import AdminPanel from "./AdminPanel"; // ❌ Load ngay lập tức

// Sử dụng lazy loading
const AdminPanel = lazy(() => import("./AdminPanel")); // ✅ Load khi cần

// Sử dụng với Suspense
<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>;
```

## Lợi ích kết hợp Suspense + lazy():

### **1. Performance Optimization:**

```jsx
// Bundle size giảm từ 2MB → 500KB (initial)
// Các pages khác load theo demand
```

### **2. Better User Experience:**

```jsx
// Loading states mượt mà
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/admin" element={<LazyAdminPanel />} />
  </Routes>
</Suspense>
```

### **3. Automatic Code Splitting:**

```jsx
// Webpack tự động tạo chunks:
// - main.js (core app)
// - admin.chunk.js (admin panel)
// - dashboard.chunk.js (dashboard)
```

## So sánh:

| Aspect          | Normal Import  | Lazy Import     |
| --------------- | -------------- | --------------- |
| **Bundle Size** | Lớn            | Nhỏ (initial)   |
| **Load Time**   | Chậm (initial) | Nhanh (initial) |
| **Navigation**  | Instant        | Small delay     |
| **Memory**      | Cao            | Tối ưu          |

## Best Practices:

### **1. Lazy Load Routes:**

```jsx
const Home = lazy(() => import("./pages/Home"));
const Admin = lazy(() => import("./pages/Admin"));
```

### **2. Nested Suspense:**

```jsx
<Suspense fallback={<AppLoader />}>
  <Routes>
    <Route
      path="/admin/*"
      element={
        <Suspense fallback={<AdminLoader />}>
          <AdminRoutes />
        </Suspense>
      }
    />
  </Routes>
</Suspense>
```

### **3. Error Boundaries:**

```jsx
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

## Lưu ý quan trọng:

1. **Luôn cần Suspense**: Lazy components phải được wrap bằng Suspense
2. **Dynamic import**: Phải sử dụng `() => import()` syntax
3. **Default exports**: Component cần được export default
4. **Error handling**: Nên kết hợp với Error Boundaries
