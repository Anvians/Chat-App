import { useState, useEffect, useRef } from "react";
import socket from "../connection/ClientConnect";
import axios from "axios";
import ChatNavbar from "./ChatNavbar";
import { Send, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatScreen = ({ selectedChat, userId, token }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3003/api/chat/messages/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const msgs = res.data.map((msg) => ({
          id: msg._id,
          sender: msg.sender._id === userId ? "You" : "Other",
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));

        setMessages(msgs);

        await axios.post(
          "http://localhost:3003/api/chat/messages/read",
          { chatId: selectedChat.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    socket.emit("join_room", { room: selectedChat.id });

  }, [selectedChat, token, userId]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (!selectedChat || data.chatId !== selectedChat.id) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: data.senderId === userId ? "You" : "Other",
          text: data.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    };

    socket.on("recv_msg", handleReceiveMessage);
    return () => socket.off("recv_msg", handleReceiveMessage);
  }, [selectedChat, userId]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
      console.log('Token in ChatScreen:', token)

    const newMsg = {
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    socket.emit("send_message", { message, to: selectedChat.id });

    try {
      await axios.post(
        "http://localhost:3003/api/chat/message",
        { content: message, chatId: selectedChat.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save message", err);
    }
  };

  if (!selectedChat)
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat to start messaging</div>;

  return (
    <div className="flex flex-col w-full h-full bg-[#0F172A] relative overflow-hidden">
      <ChatNavbar chat={selectedChat} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 custom-scrollbar scroll-smooth">
        <div className="flex flex-col items-center justify-center py-10 opacity-40">
          <img
            src={selectedChat.dp || selectedChat.avatar}
            className="w-16 h-16 rounded-3xl mb-3 grayscale"
            alt=""
          />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            End-to-End Encrypted with {selectedChat.name}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%] md:max-w-[65%] group">
                <div
                  className={`relative px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all ${
                    msg.sender === "You"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                      : "bg-white/5 text-gray-100 rounded-tl-none border border-white/5"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <p
                  className={`text-[10px] mt-1.5 font-bold text-gray-500 tracking-tight ${
                    msg.sender === "You" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 pb-6 pt-2 bg-transparent z-20">
        <div className="max-w-5xl mx-auto flex items-end gap-3 bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-2xl focus-within:border-blue-500/30 transition-all">
          <button title="Attach File" className="p-3 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            rows="1"
            value={message}
            placeholder={`Message ${selectedChat.name}...`}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-transparent text-white px-2 py-3 outline-none placeholder:text-gray-600 text-[15px] resize-none max-h-32 custom-scrollbar"
          />
          <div className="flex items-center gap-1">
            <button title="Emojis" className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-white/5 rounded-full transition-all hidden sm:block">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 ${
                message.trim() ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
