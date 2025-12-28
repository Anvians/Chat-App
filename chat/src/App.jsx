import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Sider from "./components/Sider";
import ChatScreen from "./components/ChatScreen";
import AuthForm from "./components/AuthForm"; 
import Room from "./components/Rooms";
import Navbar from "./components/Navbar";
import { MessageSquareDashed } from "lucide-react"; 

const App = () => {
  const [activeChat, setActiveChat] = useState(null); 
  const location = useLocation();
  
  const isAuthPage = location.pathname === "/auth";
  const isChatPage = location.pathname === "/chat";

  const showNavbar = !isAuthPage && !isChatPage;
  const showSider = !isAuthPage;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020617] text-white selection:bg-blue-500/30">
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {showNavbar && (
        <header className="z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
          <Navbar />
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">
        {showSider && (
          <aside className="h-full z-40 border-r border-white/5 bg-[#020617]/40 backdrop-blur-sm">
            <Sider onSelectUser={setActiveChat} activeUserId={activeChat?.id} />
          </aside>
        )}

        <main className="flex-1 relative overflow-hidden bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + (activeChat?.id || "")} 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Room />} />
                
                {/* Updated Chat Route */}
                <Route path="/chat" element={
                  activeChat ? (
                    <ChatScreen selectedChat={activeChat} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="p-6 bg-blue-500/10 rounded-full">
                        <MessageSquareDashed className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Your Messages</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">
                          Select a friend from the sidebar to start a secure conversation.
                        </p>
                      </div>
                    </div>
                  )
                } />

                <Route path="/auth" element={<AuthForm />} />
                <Route path="*" element={<Navigate to="/auth" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;