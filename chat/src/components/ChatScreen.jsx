import { useState, useEffect, useRef } from "react";
import socket from "../connection/ClientConnect";
import axios from "axios";
import ChatNavbar from "./ChatNavbar";
import { Send, Paperclip, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const server_url = 'http://localhost:3003' ||   'https://chat-app-l5l5.vercel.app'

const ChatScreen = ({ selectedChat, userId, token }) => {
  const lastTypingTimeRef = useRef(0);
  const [isTyping, setIsTyping] = useState(false)
  const [typing, setTyping] = useState(false)


  useEffect(() => {
    if (!socket) return;

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket]);


  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (!socket || !socket.connected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat.id);
    }

    // Use the Ref to track time across renders
    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;

      // Only stop typing if 3 seconds have passed since the LAST keystroke
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop_typing", selectedChat.id);
        setTyping(false);
      }
    }, timerLength);
  };

  // Get userId from token if not provided
  const getUserIdFromToken = () => {
    if (userId) return userId;
    const token = localStorage.getItem("token");
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log('Decoded user ID from token:', payload.id);
      return payload.id;
    } catch (error) {
      console.log('Error decoding token:', error);
      return null;
    }
  };




  const currentUserId = getUserIdFromToken();
  console.log('Current user ID in ChatScreen:', currentUserId);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      console.log('Fetching messages for chat:', selectedChat.id, 'Current user ID:', currentUserId);
      try {
        const res = await axios.get(
          `${server_url}/api/chat/messages/${selectedChat.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Raw messages response:', res.data);
        console.log('Number of messages received:', res.data.length);

        const msgs = res.data.map((msg) => {
          const msgSenderId = msg.sender?._id || msg.sender;
          console.log('Processing message:', msg._id, 'Sender ID:', msgSenderId, 'Content:', msg.content);


          const isMe = msgSenderId?.toString() === currentUserId?.toString();
          console.log('Is Me:', isMe, 'Sender will be:', isMe ? "You" : "Other");

          return {
            id: msg._id,
            sender: isMe ? "You" : "Other",
            text: msg.content,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }),
          };
        });
        setMessages(msgs);
        console.log('Final mapped messages:', msgs);
        await axios.post(
          `${server_url}/api/chat/messages/read`,
          { chatId: selectedChat.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error fetching messages:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
      }
    };

    fetchMessages();

    // Join the chat room only if socket is available and connected
    if (socket && socket.connected) {
      socket.emit("join_room", selectedChat.id);
    } else {
      console.warn('Socket not connected, cannot join room');
    }

  }, [selectedChat, token, currentUserId]);

  console.log('Fetched Messages', messages);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      const incomingChatId = data.chat?._id || data.chat;
      if (!selectedChat || incomingChatId?.toString() !== selectedChat.id.toString()) return;

      setMessages((prev) => {
        const isMyMessageFromSocket = (data.sender?._id || data.sender) === currentUserId;

        const tempMessageIndex = prev.findIndex(m =>
          m.sender === "You" && m.text === data.content && m.id.toString().startsWith("temp-")
        );

        if (isMyMessageFromSocket && tempMessageIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempMessageIndex] = {
            ...newMessages[tempMessageIndex],
            id: data._id, 
            time: new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          return newMessages;
        }

        if (prev.some(m => m.id === data._id)) return prev;

        return [
          ...prev,
          {
            id: data._id || Date.now(),
            sender: isMyMessageFromSocket ? "You" : "Other",
            text: data.content,
            time: new Date(data.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }),
          },
        ];
      });
    };

    socket.on("recv_msg", handleReceiveMessage);
    return () => socket.off("recv_msg", handleReceiveMessage);
  }, [selectedChat?.id, currentUserId, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
  
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.id]);

  const sendMessage = async () => {
    const cleanMessage = message.trim();
    if (!cleanMessage || !selectedChat) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      sender: "You",
      text: cleanMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessage(""); 
    setMessages((prev) => [...prev, newMsg]);

    if (socket && socket.connected) {
      socket.emit("send_message", {
        message: cleanMessage,
        to: selectedChat.id,
        senderId: currentUserId
      });
    }

    try {
      await axios.post(
        `${server_url}/api/chat/message`,
        { content: cleanMessage, chatId: selectedChat.id },
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
        {console.log('Rendering Messages:', messages)}
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}  
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%] md:max-w-[65%] group">
                <div
                  className={`relative px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all ${msg.sender === "You"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                    : "bg-white/5 text-gray-100 rounded-tl-none border border-white/5"
                    }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <p
                  className={`text-[10px] mt-1.5 font-bold text-gray-500 tracking-tight ${msg.sender === "You" ? "text-right" : "text-left"
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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                
              </span>
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

      <div className="px-6 pb-6 pt-2 bg-transparent z-20">
        <div className="max-w-5xl mx-auto flex items-end gap-3 bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-2xl focus-within:border-blue-500/30 transition-all">
          <button title="Attach File" className="p-3 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all">
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
            <button title="Emojis" className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-white/5 rounded-full transition-all hidden sm:block">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 ${message.trim() ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"
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
