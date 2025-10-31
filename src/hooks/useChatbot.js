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
        ...prev.filter((chatMessage) => chatMessage.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };
    history = history.map(({ role, text }) => ({ 
      role: role === "user" ? "user" : "model", 
      parts: [{ text }] 
    }));
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

  //! Fetch data chỉ khi chatbot được mở lần đầu
  useEffect(() => {
    if (showChatbot && products.length === 0) {
      console.log("🚀 Chatbot: Fetching data from MongoDB...");
      getAllProducts();
      getAllCategories();
      getAllToppings();
    }
  }, [showChatbot, products.length]);

  useEffect(() => {
    if (products.length > 0) {
      console.log("Chatbot Debug - Products data:", products);
      console.log("Total products:", products.length);
      console.log("First product:", products[0]);
      
      const newProductText = getProductText();
      setProductText(newProductText);
      
      // Update chatHistory với data thực từ MongoDB
      setChatHistory(prev => {
        // Đảm bảo companyInfo luôn ở vị trí đầu tiên
        const companyContext = prev.find(msg => msg.text === companyInfo);
        const otherContexts = prev.filter(msg => msg.text !== companyInfo && !msg.text.startsWith("Sản phẩm có sẵn:"));
        
        return [
          // Giữ nguyên companyInfo ở đầu
          companyContext || {
            hideInChat: true,
            role: "model",
            text: companyInfo
          },
          // Thêm context sản phẩm từ MongoDB
          {
            hideInChat: true,
            role: "model",
            text: `Sản phẩm có sẵn:\n${newProductText}`
          },
          // Giữ lại các context khác
          ...otherContexts.filter(msg => !msg.text.startsWith("Sản phẩm có sẵn:"))
        ];
      });
      
      console.log("Updated chatHistory with MongoDB products (keeping companyInfo)");
    }
  }, [products]);

  // Update context khi có categories từ MongoDB
  useEffect(() => {
    if (categories.length > 0) {
      console.log("🔍 Categories loaded:", categories.length);
      const categoryText = getCategoryText();
      
      setChatHistory(prev => {
        // Lọc bỏ context categories cũ nhưng giữ companyInfo
        const filteredHistory = prev.filter(msg => !msg.text.startsWith("Danh mục có sẵn:"));
        
        return [
          ...filteredHistory,
          {
            hideInChat: true,
            role: "model",
            text: `Danh mục có sẵn:\n${categoryText}`
          }
        ];
      });
      
      console.log("Updated categories context (keeping companyInfo)");
    }
  }, [categories]);

  // Update context khi có toppings từ MongoDB  
  useEffect(() => {
    if (toppings.length > 0) {
      console.log("Toppings loaded:", toppings.length);
      const toppingText = getToppingText();
      
      setChatHistory(prev => {
        // Lọc bỏ context toppings cũ nhưng giữ companyInfo  
        const filteredHistory = prev.filter(msg => !msg.text.startsWith("Topping có sẵn:"));
        
        return [
          ...filteredHistory,
          {
            hideInChat: true,
            role: "model", 
            text: `Topping có sẵn:\n${toppingText}`
          }
        ];
      });
      
      console.log("Updated toppings context (keeping companyInfo)");
    }
  }, [toppings]);

  return {
    chatBodyRef,
    showChatbot,
    setShowChatbot,
    chatHistory,
    setChatHistory,
    generateBotResponse,
  };
}