# Code chưa chỉnh sửa ( Sử dụng Fetch API để lấy dữ liệu từ API của mockup server )

<!-- Tạo user mới từ giá trị nhập vào -->
const newUser = {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password.trim(),
    role: "user", => mặc định user
    status: "available"
};

<!-- Gửi dữ liệu lên API mock để tạo tài khoản -->
const response = await fetch(
    "https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b",
    {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
    },
        body: JSON.stringify(newUser),
});

# Code đã chỉnh sửa ( Sử dụng zustand + axios của authStore để lấy dữ liệu từ API của backend Nodejs )

<!-- Tạo userData object từ Formik values -->
const userData = {
    userName: values.fullName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password.trim()
    <!-- Mặc định role khi đăng ký là user -->
    <!-- Mặc định status khi đăng ký là available -->
};

<!-- Gửi dữ liệu lên backend để tạo tài khoản -->


