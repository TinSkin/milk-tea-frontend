import Notification from "../components/Notification"; // import Notification đúng đường dẫn

// Hàm bất đồng bộ để lấy danh sách sản phẩm từ mock API
export const fetchProducts = async () => {
    try {
        // Gửi yêu cầu GET đến endpoint productList với apiKey
        const response = await fetch(
            "https://mindx-mockup-server.vercel.app/api/resources/products_drink?apiKey=67fe686cc590d6933cc1248b"
        );

        // Parse response thành đối tượng JavaScript
        const result = await response.json();

        // Truy cập dữ liệu thật nằm trong result.data.data
        // Cấu trúc mock API là { data: { data: [...] } }
        const products = result?.data?.data;

        // Nếu là mảng thì trả về, nếu không thì trả về mảng rỗng để tránh lỗi
        return Array.isArray(products) ? products : [];
    } catch (error) {
        // Log lỗi nếu xảy ra sự cố trong quá trình gọi hoặc xử lý API
        Notification.error("Lỗi khi gọi API", error.message);

        // Trả về mảng rỗng để đảm bảo ứng dụng không bị crash
        return [];
    }
};
