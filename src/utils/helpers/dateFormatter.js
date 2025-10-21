//! Parse định dạng ngày dd/mm/yyyy thành Date object
export const parseDMY = (str) => {
    if (!str || typeof str !== "string") return null;
    const match = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript month bắt đầu từ 0
    const year = parseInt(match[3], 10);

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
};

//! Parse định dạng ngày Việt Nam "15, thg 10, 2024" thành Date object
export const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
        return new Date(0); // Trả về ngày mặc định (1/1/1970) nếu lỗi
    }

    if (dateStr.includes("thg")) {
        // Kiểm tra nếu chuỗi ngày có định dạng tiếng Việt (chứa "thg")
        const months = {
            "thg 1": "Jan", "thg 2": "Feb", "thg 3": "Mar", "thg 4": "Apr",
            "thg 5": "May", "thg 6": "Jun", "thg 7": "Jul", "thg 8": "Aug",
            "thg 9": "Sep", "thg 10": "Oct", "thg 11": "Nov", "thg 12": "Dec",
        };

        const [day, month, year] = dateStr.split(", ");
        if (!day || !month || !year) {
            return new Date(0);
        }

        const monthKey = month.toLowerCase();
        const engDateStr = `${day.replace(/\D/g, "")} ${months[monthKey]} ${year}`;
        return new Date(engDateStr) || new Date(0);
    }

    return new Date(dateStr) || new Date(0);
};

//! Format ngày thành chuỗi đẹp theo định dạng Việt Nam
export const formatNiceDate = (input) => {
    if (input === null || input === undefined || input === "") return "";

    let dateObj = null;

    // Kiểm tra nếu là Date object hợp lệ
    if (input instanceof Date && !isNaN(input.getTime())) {
        dateObj = input;
    }
    // Kiểm tra nếu là timestamp number
    else if (typeof input === "number") {
        dateObj = new Date(input);
    }
    // Kiểm tra nếu là string
    else if (typeof input === "string") {
        // Thử parse ISO / RFC format trước
        const tryIso = new Date(input);
        if (!isNaN(tryIso.getTime())) {
            dateObj = tryIso;
        } else {
            // Thử format dd/mm/yyyy
            const dmy = parseDMY(input);
            if (dmy) {
                dateObj = dmy;
            } else {
                // Thử format Việt Nam
                const custom = parseCustomDate(input);
                if (custom && !isNaN(custom.getTime())) {
                    dateObj = custom;
                }
            }
        }
    }

    // Nếu không parse được, trả về string gốc
    if (!dateObj || isNaN(dateObj.getTime())) {
        return String(input);
    }

    // Format thành định dạng đẹp
    return dateObj.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

//! Format ngày thành định dạng ngắn "20/09/2025"
export const formatShortDate = (input) => {
    if (input === null || input === undefined || input === "") return "";

    const date = new Date(input);
    if (isNaN(date.getTime())) return String(input);

    return date.toLocaleDateString("vi-VN");
};

//! Kiểm tra xem 2 ngày có cùng ngày không (bỏ qua giờ)
export const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};