# Logic cũ (Sử dụng localStorage + fetchAccounts để lấy dữ liệu từ API của mockup server)

<!-- Lưu user và trạng thái đăng nhập vào localStorage -->
useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("user");
    if (isLoggedIn === "true" && user.role === "user") {
      navigate("/");
    }

    if (isLoggedIn === "true" && user.role === "admin") {
      navigate("/admin/products");
    }
  }, [navigate]);

# Logic mới (Sử dụng zustand + axios của authStore để lấy dữ liệu từ API của backend Nodejs)

<!-- Lấy trạng thái đăng nhập và người dùng từ authStore -->
useEffect(() => {
    if (isAuthenticated && user) {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User is authenticated:", user);
    if (user.role === "user") {
        navigate("/");
    } else if (user.role === "admin") {
        navigate("/admin/products");
    }
    }
}, [isAuthenticated, user, navigate]);