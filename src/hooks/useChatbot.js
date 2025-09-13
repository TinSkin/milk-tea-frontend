import { useRef, useState, useEffect } from "react";
import { companyInfo } from "../companyInfo";

// Import data of product
import { useProductStore } from "../store/productStore";
import { useCategoryStore } from "../store/categoryStore";
import { useToppingStore } from "../store/toppingStore";

export function useChatbot() {
  const chatBodyRef = useRef();

  const [productText, setProductText] = useState("");

  //! Store of Product, Category & Topping
  const { products, getAllProducts } = useProductStore();
  const { categories, getAllCategories } = useCategoryStore();
  const { toppings, getAllToppings } = useToppingStore();

  //! Product: Transform data from response of api to text
  const getProductText = () => {
    if (!products || products.length === 0) return "Chưa có sản phẩm nào";

    return products.map(p => {
      // Size và giá
      const sizes = p.sizeOptions && p.sizeOptions.length > 0
        ? p.sizeOptions.map(s => `${s.size}: ${s.price} VND`).join(", ")
        : `${p.price} VND`;

      // Topping
      const toppingText = p.toppings && p.toppings.length > 0
        ? `Topping: ${Array.isArray(p.toppings)
          ? p.toppings.map(t => t.name || t).join(", ")
          : p.toppings}`
        : "Không có topping";

      // Danh mục
      const categoryText = p.category?.name || p.category || "Không có danh mục";

      // Trạng thái
      const statusText = p.status === "available"
        ? "Đang bán"
        : p.status === "unavailable"
          ? "Ngừng bán"
          : "Hết hàng";

      // Discount
      const discountText = p.discount && p.discount > 0
        ? `Giảm giá: ${p.discount}%`
        : "";

      // Sold count
      const soldText = p.soldCount && p.soldCount > 0
        ? `Đã bán: ${p.soldCount}`
        : "";

      // SEO
      const seoText = [
        p.metaTitle ? `Meta Title: ${p.metaTitle}` : "",
        p.metaDescription ? `Meta Description: ${p.metaDescription}` : ""
      ].filter(Boolean).join(" | ");

      // Người cập nhật
      const updatedByText = p.updatedBy?.name || "";

      return [
        `Tên: ${p.name}`,
        `Mô tả: ${p.description}`,
        `Danh mục: ${categoryText}`,
        `Giá/Size: ${sizes}`,
        toppingText,
        `Trạng thái: ${statusText}`,
        discountText,
        soldText,
        seoText,
        updatedByText ? `Cập nhật bởi: ${updatedByText}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
    }).join("\n\n");
  };

  //! Category: Transform data from response of api to text
  const getCategoryText = () => {
    return categories && categories.length > 0
      ? categories.map(c => `- ${c.name}`).join("\n")
      : "Chưa có danh mục nào";
  };

  //! Topping: Transform data from response of api to text
  const getToppingText = () => {
    return toppings && toppings.length > 0
      ? toppings.map(t => `- ${t.name}: ${t.price} VND`).join("\n")
      : "Chưa có topping nào";
  };

  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
    {
      hideInChat: true,
      role: "model",
      text: productText,
    },
  ]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error.message || "Something went wrong!");
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  //! Fetch data 1 lần để lấy dữ liệu
  useEffect(() => {
    getAllProducts();
    getAllCategories();
    getAllToppings();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setProductText(getProductText());
      console.log("CompanyInfo:", typeof companyInfo);
      console.log("ProductText:", typeof productText);
    }

    console.log("Chat history:", chatHistory);
  }, [products]);

  return {
    chatBodyRef,
    showChatbot,
    setShowChatbot,
    chatHistory,
    setChatHistory,
    generateBotResponse,
  };
}