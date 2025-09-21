import React from "react";
import Chatbot from "./Chatbot";
import { useChatbot } from "../hooks/useChatbot";

const ChatbotWrapper = () => {
  const {
    chatBodyRef,
    showChatbot,
    setShowChatbot,
    chatHistory,
    setChatHistory,
    generateBotResponse,
  } = useChatbot();

  return (
    <Chatbot
      showChatbot={showChatbot}
      setShowChatbot={setShowChatbot}
      chatBodyRef={chatBodyRef}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      generateBotResponse={generateBotResponse}
    />
  );
};

export default ChatbotWrapper;