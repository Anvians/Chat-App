import { useState, useEffect, useRef } from "react";
import socket from "../connection/ClientConnect";
import axios from "axios";
import ChatNavbar from "./ChatNavbar";
import { Send, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const server_url = import.meta.env.VITE_BACKEND_URL;

const ChatScreen = ({ selectedChat, userId, token, onBack }) => {
  const lastTypingTimeRef = useRef(0);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const getUserIdFromToken = () => {
    if (userId) return userId;

    const storedToken = localStorage.getItem("token");
    if (!storedToken) return null;

    try {
      const payload = JSON.parse(atob(storedToken.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (roomId) => {
      if (roomId === selectedChat?.id) setIsTyping(true);
    };
    const handleStopTyping = (roomId) => {
      if (roomId === selectedChat?.id) setIsTyping(false);
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [selectedChat?.id]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!socket || !socket.connected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat.id);
    }

    lastTypingTimeRef.current = Date.now();
    const timerLength = 3000;

    setTimeout(() => {
      const timeDiff = Date.now() - lastTypingTimeRef.current;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop_typing", selectedChat.id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    if (!selectedChat || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${server_url}/api/chat/messages/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const msgs = res.data.map((msg) => {
          const senderId = msg.sender?._id || msg.sender;
          const isMe = senderId?.toString() === currentUserId?.toString();

          return {
            id: msg._id,
            sender: isMe ? "You" : "Other",
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setMessages(msgs);

        await axios.post(
          `${server_url}/api/chat/messages/read`,
          { chatId: selectedChat.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // Join the socket room — also handle the case where socket isn't
    // connected yet when the component mounts (fires on connect event too)
    if (socket) {
      if (socket.connected) {
        socket.emit("join_room", selectedChat.id);
      }
      const handleConnect = () => socket.emit("join_room", selectedChat.id);
      socket.on("connect", handleConnect);
      return () => socket.off("connect", handleConnect);
    }
  }, [selectedChat?.id, token, currentUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      const incomingChatId = data.chat?._id || data.chat;
      if (!selectedChat || incomingChatId?.toString() !== selectedChat.id.toString()) return;

      const senderId = data.sender?._id || data.sender;
      const isMe = senderId?.toString() === currentUserId?.toString();

      // Sender already added the message optimistically from the REST response,
      // so skip socket echo for own messages to prevent duplicates
      if (isMe) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === data._id)) return prev;

        return [
          ...prev,
          {
            id: data._id,
            sender: "Other",
            text: data.content,
            time: new Date(data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    };

    socket.on("recv_msg", handleReceiveMessage);
    return () => socket.off("recv_msg", handleReceiveMessage);
  }, [selectedChat?.id, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat?.id]);

  const sendMessage = async () => {
    const cleanMessage = message.trim();
    if (!cleanMessage || !selectedChat) return;

    setMessage("");

    try {
      const res = await axios.post(
        `${server_url}/api/chat/message`,
        { content: cleanMessage, chatId: selectedChat.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedMsg = res.data;

      // Add the message immediately to UI from the REST response.
      // The socket recv_msg will fire for the OTHER user's screen.
      // We dedup by _id so if socket echoes back to sender it won't duplicate.
      setMessages((prev) => {
        if (prev.some((m) => m.id === savedMsg._id)) return prev;
        return [
          ...prev,
          {
            id: savedMsg._id,
            sender: "You",
            text: savedMsg.content,
            time: new Date(savedMsg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessage(cleanMessage);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0F172A] relative overflow-hidden">
      {/* Pass onBack so ChatNavbar can show a back arrow on mobile */}
      <ChatNavbar chat={selectedChat} onBack={onBack} />

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
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
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
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
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

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"></span>
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 md:px-6 pb-4 md:pb-6 pt-2 bg-transparent z-20">
        <div className="max-w-5xl mx-auto flex items-end gap-2 md:gap-3 bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-2xl focus-within:border-blue-500/30 transition-all">
          <button
            title="Attach File"
            className="p-2 md:p-3 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            rows="1"
            value={message}
            placeholder={`Message ${selectedChat.name}...`}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-transparent text-white px-2 py-3 outline-none placeholder:text-gray-600 text-[15px] resize-none max-h-32 custom-scrollbar"
          />
          <div className="flex items-center gap-1">
            <button
              title="Emojis"
              className="p-2 md:p-3 text-gray-500 hover:text-yellow-500 hover:bg-white/5 rounded-full transition-all hidden sm:block"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              className={`p-3 md:p-4 rounded-2xl transition-all shadow-xl active:scale-95 ${
                message.trim()
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
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