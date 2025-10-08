import {
    User, Mail, Phone, Shield, CheckCircle2, Clock, Calendar,
    DollarSign, Building, Users, TrendingUp, Key, Activity, Store, Briefcase
} from "lucide-react";

// Ma trận quyền xem - ai được xem role nào
export const ROLE_VIEW_PERMISSIONS = {
    admin: ['customer', 'staff', 'storeManager', 'admin', 'regionalManager', 'hr'],
    storeManager: ['customer', 'staff'], // Manager chỉ xem customer và staff thuộc store
    hr: ['staff', 'storeManager', 'admin'], // HR xem nhân viên và quản lý
    regionalManager: ['storeManager', 'staff'], // Quản lý khu vực
    staff: ['customer'], // Staff chỉ xem customer
    customer: [] // Customer không xem ai cả
};

// Cấu hình field cho từng role
export const ROLE_FIELD_CONFIG = {
    customer: {
        title: 'Thông tin khách hàng',
        subtitle: 'Chi tiết tài khoản khách hàng',
        sections: {
            personal: {
                title: 'Thông tin cá nhân',
                fields: ['userName', 'email', 'phoneNumber', 'fullName', 'address']
            },
            account: {
                title: 'Trạng thái tài khoản',
                fields: ['role', 'status', 'isVerified']
            },
            timestamps: {
                title: 'Thời gian',
                fields: ['createdAt', 'updatedAt']
            }
        }
    },

    staff: {
        title: 'Thông tin nhân viên',
        subtitle: 'Chi tiết tài khoản nhân viên',
        sections: {
            personal: {
                title: 'Thông tin cá nhân',
                fields: ['userName', 'email', 'phoneNumber', 'fullName', 'address']
            },
            account: {
                title: 'Trạng thái tài khoản',
                fields: ['role', 'status', 'isVerified']
            },
            work: {
                title: 'Thông tin công việc',
                fields: ['salary', 'workingHours', 'shifts', 'storeId', 'hireDate', 'position', 'department']
            },
            timestamps: {
                title: 'Thời gian',
                fields: ['createdAt', 'updatedAt', 'hireDate']
            }
        }
    },

    storeManager: {
        title: 'Thông tin quản lý cửa hàng',
        subtitle: 'Chi tiết tài khoản quản lý',
        sections: {
            personal: {
                title: 'Thông tin cá nhân',
                fields: ['userName', 'email', 'phoneNumber', 'fullName', 'address']
            },
            account: {
                title: 'Trạng thái tài khoản',
                fields: ['role', 'status', 'isVerified']
            },
            work: {
                title: 'Thông tin công việc',
                fields: ['salary', 'workingHours', 'storeId', 'hireDate', 'position']
            },
            management: {
                title: 'Thông tin quản lý',
                fields: ['managedStores', 'teamSize', 'performance', 'revenue']
            },
            timestamps: {
                title: 'Thời gian',
                fields: ['createdAt', 'updatedAt', 'hireDate']
            }
        }
    },

    admin: {
        title: 'Thông tin quản trị viên',
        subtitle: 'Chi tiết tài khoản quản trị hệ thống',
        sections: {
            personal: {
                title: 'Thông tin cá nhân',
                fields: ['userName', 'email', 'phoneNumber', 'fullName', 'address']
            },
            account: {
                title: 'Trạng thái tài khoản',
                fields: ['role', 'status', 'isVerified']
            },
            work: {
                title: 'Thông tin công việc',
                fields: ['salary', 'position', 'department', 'hireDate']
            },
            system: {
                title: 'Quyền hệ thống',
                fields: ['systemAccess', 'lastLogin', 'permissions', 'securityLevel']
            },
            timestamps: {
                title: 'Thời gian',
                fields: ['createdAt', 'updatedAt', 'lastLogin', 'hireDate']
            }
        }
    }
};

// Định nghĩa metadata cho từng field
export const FIELD_METADATA = {
    // Personal fields
    userName: { label: 'Tên đăng nhập', icon: User, type: 'text' },
    email: { label: 'Email', icon: Mail, type: 'email' },
    phoneNumber: { label: 'Số điện thoại', icon: Phone, type: 'phone' },
    fullName: { label: 'Họ tên', icon: User, type: 'text' },
    address: { label: 'Địa chỉ', icon: Building, type: 'text' },

    // Account fields
    role: { label: 'Vai trò', icon: Shield, type: 'role' },
    status: { label: 'Trạng thái', icon: Clock, type: 'status' },
    isVerified: { label: 'Xác minh', icon: CheckCircle2, type: 'verified' },

    // Work fields
    salary: { label: 'Lương', icon: DollarSign, type: 'currency' },
    workingHours: { label: 'Giờ làm việc', icon: Clock, type: 'text' },
    shifts: { label: 'Ca làm việc', icon: Calendar, type: 'array' },
    storeId: { label: 'Cửa hàng', icon: Store, type: 'store' },
    hireDate: { label: 'Ngày vào làm', icon: Calendar, type: 'date' },
    position: { label: 'Vị trí', icon: Briefcase, type: 'text' },
    department: { label: 'Phòng ban', icon: Building, type: 'text' },

    // Management fields
    managedStores: { label: 'Cửa hàng quản lý', icon: Building, type: 'array' },
    teamSize: { label: 'Số nhân viên', icon: Users, type: 'number' },
    performance: { label: 'Hiệu suất', icon: TrendingUp, type: 'percentage' },
    revenue: { label: 'Doanh thu', icon: DollarSign, type: 'currency' },

    // System fields
    systemAccess: { label: 'Quyền hệ thống', icon: Key, type: 'array' },
    lastLogin: { label: 'Đăng nhập cuối', icon: Activity, type: 'datetime' },
    permissions: { label: 'Quyền hạn', icon: Shield, type: 'array' },
    securityLevel: { label: 'Cấp độ bảo mật', icon: Shield, type: 'text' },

    // Timestamp fields
    createdAt: { label: 'Ngày tạo', icon: Calendar, type: 'datetime' },
    updatedAt: { label: 'Cập nhật cuối', icon: Clock, type: 'datetime' }
};

// Các field nhạy cảm - ai được xem
export const FIELD_SENSITIVITY = {
    salary: ['admin', 'hr'], // Chỉ admin và HR xem lương
    performance: ['admin', 'storeManager', 'hr'],
    revenue: ['admin', 'storeManager'],
    systemAccess: ['admin'], // Chỉ admin xem quyền hệ thống
    permissions: ['admin'],
    securityLevel: ['admin'],
    shifts: ['admin', 'storeManager'], // Manager xem ca làm của staff
    workingHours: ['admin', 'storeManager', 'hr'],
    hireDate: ['admin', 'hr', 'storeManager'],
    managedStores: ['admin', 'regionalManager'],
    teamSize: ['admin', 'storeManager', 'hr']
};

// Hàm kiểm tra quyền xem user
export const canViewUser = (viewerRole, targetUserRole) => {
    const allowedRoles = ROLE_VIEW_PERMISSIONS[viewerRole] || [];
    return allowedRoles.includes(targetUserRole);
};

// Hàm kiểm tra quyền xem field
export const canViewField = (fieldKey, viewerRole, targetUserRole) => {
    // Nếu field không nhạy cảm, ai cũng xem được
    if (!FIELD_SENSITIVITY[fieldKey]) {
        return true;
    }

    // Admin xem tất cả
    if (viewerRole === 'admin') {
        return true;
    }

    // Kiểm tra quyền xem field nhạy cảm
    const allowedRoles = FIELD_SENSITIVITY[fieldKey];
    return allowedRoles.includes(viewerRole);
};

// Hàm lấy config hiển thị cho role
export const getRoleDisplayConfig = (userRole, viewerRole) => {
    // Kiểm tra quyền xem user
    if (!canViewUser(viewerRole, userRole)) {
        return null; // Không có quyền xem
    }

    const config = ROLE_FIELD_CONFIG[userRole] || ROLE_FIELD_CONFIG.customer;

    // Lọc các field theo quyền
    const filteredSections = {};

    Object.entries(config.sections).forEach(([sectionKey, section]) => {
        const visibleFields = section.fields.filter(fieldKey =>
            canViewField(fieldKey, viewerRole, userRole)
        );

        if (visibleFields.length > 0) {
            filteredSections[sectionKey] = {
                ...section,
                fields: visibleFields
            };
        }
    });

    return {
        ...config,
        sections: filteredSections
    };
};