import { MessageSquare, CircleX, CircleArrowDown } from "lucide-react";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const Chatbot = ({
  showChatbot,
  setShowChatbot,
  chatBodyRef,
  chatHistory,
  setChatHistory,
  generateBotResponse,
}) => (
  <div className={`container z-10 sticky ${showChatbot ? "show-chatbot" : ""}`}>
    <button
      onClick={() => setShowChatbot((prev) => !prev)}
      id="chatbot-toggler"
    >
      <span className="material-symbols-outlined">
        <MessageSquare />
      </span>
      <span className="material-symbols-outlined">
        <CircleX />
      </span>
    </button>
    <div className="chatbot-popup">
      {/* Chatbot Header */}
      <div className="chat-header">
        <div className="header-info">
          <ChatbotIcon />
          <h2 className="logo-text">Trợ Lý Hệ Thống</h2>
        </div>
        <button
          className="material-symbols-outlined"
          onClick={() => setShowChatbot((prev) => !prev)}
        >
          <CircleArrowDown className="w-full" />
        </button>
      </div>
      {/* Chatbot Body */}
      <div ref={chatBodyRef} className="chat-body">
        <div className="message bot-message">
          <ChatbotIcon />
          <p className="message-text">
            Chào Bạn <br /> Tôi có thể giúp gì cho bạn ?
          </p>
        </div>
        {chatHistory.map((chat, index) => (
          <ChatMessage key={index} chat={chat} />
        ))}
      </div>
      {/* Chatbot Footer */}
      <div className="chat-footer">
        <ChatForm
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          generateBotResponse={generateBotResponse}
        />
      </div>
    </div>
  </div>
);

export default Chatbot;