import socket from '../connection/ClientConnect';
import { useState, useEffect, useRef } from 'react';
import ChatNavbar from './ChatNavbar';
import { Send, PlusCircle, Smile, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatScreen = ({ selectedChat }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // Ensure we only add messages meant for this specific conversation logic 
      // (You might need to add a roomId check here later)
      setMessages((prev) => [...prev, { 
        sender: 'Other', 
        text: data.message || data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    socket.on('recv_msg', handleReceiveMessage);

    // Cleanup listener on unmount or when chat changes
    return () => {
      socket.off('recv_msg', handleReceiveMessage);
    };
  }, [selectedChat]); // Reset listener if the selected user changes

  const Send_msg = () => {
    if (message.trim() === '') return;

    const newMessage = {
      sender: 'You',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', { message, to: selectedChat.id });
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0F172A] relative overflow-hidden">
      
      {/* Dynamic Header */}
      <ChatNavbar chat={selectedChat} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 custom-scrollbar scroll-smooth">
        
        {/* Chat Start Indicator */}
        <div className="flex flex-col items-center justify-center py-10 opacity-40">
           <img src={selectedChat.avatar} className="w-16 h-16 rounded-3xl mb-3 grayscale" alt="" />
           <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
             End-to-End Encrypted with {selectedChat.name}
           </p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[65%] group`}>
                <div className={`relative px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all ${
                  msg.sender === 'You'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                    : 'bg-white/5 text-gray-100 rounded-tl-none border border-white/5'
                }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                </div>
                <p className={`text-[10px] mt-1.5 font-bold text-gray-500 tracking-tight ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Floating Input Bar */}
      <div className="px-6 pb-6 pt-2 bg-transparent z-20">
        <div className="max-w-5xl mx-auto flex items-end gap-3 bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[28px] shadow-2xl focus-within:border-blue-500/30 transition-all">
          
          <div className="flex items-center">
            <button title="Attach File" className="p-3 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-full transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <textarea
            rows="1"
            value={message}
            placeholder={`Message ${selectedChat.name}...`}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                Send_msg();
              }
            }}
            className="flex-1 bg-transparent text-white px-2 py-3 outline-none placeholder:text-gray-600 text-[15px] resize-none max-h-32 custom-scrollbar"
          />

          <div className="flex items-center gap-1">
            <button title="Emojis" className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-white/5 rounded-full transition-all hidden sm:block">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={Send_msg}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 group ${
                message.trim() ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className={`w-5 h-5 transition-transform ${message.trim() ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;