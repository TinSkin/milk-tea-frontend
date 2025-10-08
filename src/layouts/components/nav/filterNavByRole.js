// Lọc navigation theo vai trò người dùng
// → Chỉ hiển thị những mục mà role hiện tại có quyền xem
export const filterNavByRole = (items, role) => {
    const canSee = (item) => !item.roles || item.roles.includes(role);

    return items
        .filter(canSee)
        .map((item) => {
            if (item.children) {
                const children = filterNavByRole(item.children, role);
                return children.length ? { ...item, children } : null;
            }
            return item;
        })
        .filter(Boolean);
};