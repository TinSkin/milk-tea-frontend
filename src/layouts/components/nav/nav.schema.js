import {
    Package,
    Users,
    ShoppingCart,
    BarChart3,
    Tag,
    Coffee,
    Store,
    Globe,
    ListChecks
} from "lucide-react";

// Cấu trúc navigation (sidebar) dùng chung cho tất cả vai trò
// Nếu không khai báo roles → mặc định hiển thị cho tất cả role
export const navSchema = [
    {
        id: "dashboard",
        title: "Dashboard", 
        icon: BarChart3,
        path: "/dashboard",
    },
    {
        id: "products",
        title: "Sản phẩm",
        icon: Package,
        roles: ["admin", "storeManager"],
        children: [
            { title: "Danh sách sản phẩm", path: "/products" },
            { title: "Thêm sản phẩm", path: "/products/add", roles: ["admin", "storeManager"] },
        ],
    },
    {
        id: "categories",
        title: "Danh mục",
        icon: Tag,
        path: "/categories",
        roles: ["admin", "storeManager"],
    },
    {
        id: "toppings",
        title: "Topping",
        icon: Coffee,
        path: "/toppings",
        roles: ["admin", "storeManager"],
    },
    {
        id: "stores",
        title: "Cửa hàng",
        icon: Store,
        path: "/stores",
        roles: ["admin"],
    },
    {
        id: "orders",
        title: "Đơn hàng",
        icon: ShoppingCart,
        path: "/orders",
        roles: ["admin", "storeManager"],
    },
    {
        id: "accounts",
        title: "Tài khoản",
        icon: Users,
        path: "/accounts",
        roles: ["admin", "storeManager"], 
    },
    {
        id: "requests",
        title: "Yêu cầu",
        icon: ListChecks,
        path: "/requests",
        roles: ["admin", "storeManager"],
    },
    {
        id: "system",
        title: "Hệ thống",
        icon: Globe,
        roles: ["admin"],
        children: [
            { title: "Cài đặt chung", path: "/system/settings" },
            { title: "Phân quyền", path: "/system/permissions" },
        ],
    },
];