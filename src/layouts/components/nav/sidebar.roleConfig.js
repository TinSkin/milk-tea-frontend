// Cấu hình giao diện sidebar cho từng vai trò
// Mỗi role gồm:
// - basePath: prefix route
// - brand: thông tin thương hiệu
// - activeColor: màu nền khi chọn
// - brandColor: màu nền logo

import { Shield, Store as StoreIcon } from "lucide-react";

export const sidebarRoleConfig = {
    admin: {
        basePath: "/admin",
        brand: { icon: Shield, title: "Admin Panel", subtitle: "Quản trị hệ thống" },
        activeColor: "bg-green_starbuck",
        brandColor: "bg-blue-600",
    },
    manager: {
        basePath: "/store-manager",
        brand: { icon: StoreIcon, title: "Store Manager" },
        activeColor: "bg-green_starbuck",
        brandColor: "bg-camel",
    },
};