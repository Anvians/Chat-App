import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Sider from "./components/Sider";
import ChatScreen from "./components/ChatScreen";
import AuthForm from "./components/AuthForm";
import UserProfile from "./components/UserProfile";
import Room from "./components/Rooms";
import Navbar from "./components/Navbar";
import { MessageSquareDashed } from "lucide-react";
import { ProtectedRoute } from "./components/protectedRoute.jsx";

const App = () => {
  const [activeChat, setActiveChat] = useState(() => {
    try {
      const saved = sessionStorage.getItem("activeChat");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loadMyRoom, setLoadMyRoom] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/auth";
  const isChatPage = location.pathname === "/chat";
  const isProfilePage = location.pathname.startsWith("/profile");

  const triggerSidebarRefresh = () => setRefreshSidebar(prev => prev + 1);

  const showNavbar = !isAuthPage && !isChatPage;
  const showSider = !isAuthPage;

  const handleSelectChat = (chat) => {
    // Normalize: sidebar items use _id (Mongoose ObjectId), search/profile
    // use id (string). ChatScreen always reads selectedChat.id so we ensure
    // it is always a plain string regardless of where the chat came from.
    const normalized = {
      ...chat,
      id: (chat.id || chat._id)?.toString(),
    };
    console.log('Setting active chat:', normalized);
    setActiveChat(normalized);
    sessionStorage.setItem("activeChat", JSON.stringify(normalized));
    setRefreshSidebar(prev => prev + 1);
    navigate('/chat');
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020617] text-white selection:bg-blue-500/30">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {showNavbar && (
        <header className="z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
          <Navbar
            onMyRoomClick={() => setLoadMyRoom(prev => !prev)}
            onSelectChat={handleSelectChat}
          />
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">

        <AnimatePresence>
          {showSider && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`h-full z-40 border-r border-white/5 bg-[#020617]/40 backdrop-blur-sm
                ${isChatPage ? "hidden md:block" : "block w-full md:w-auto"}`}
            >
              <Sider
                onSelectUser={handleSelectChat}
                refreshTrigger={refreshSidebar}
                activeUserId={activeChat?.id}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* On mobile, hide main content when sidebar is fullscreen (non-chat pages) */}
        <main className={`flex-1 relative overflow-hidden bg-transparent
          ${showSider && !isChatPage ? "hidden md:block" : "block"}`}>
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
                <Route
                  path="/"
                  element={<Room rooms={loadMyRoom ? "rooms/my" : "rooms/discover"} />}
                />

                <Route
                  path="/profile"
                  element={
                  <ProtectedRoute>
                    <UserProfile isPage={true} onSelectChat={handleSelectChat} />
                  </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                  <ProtectedRoute>
                    <UserProfile isPage={true} onSelectChat={handleSelectChat} />
                  </ProtectedRoute>
                  }
                />

                <Route path="/chat" element={
                  activeChat ? (
                    <ProtectedRoute>

                    <ChatScreen
                      selectedChat={activeChat}
                      token={localStorage.getItem("token")}
                      userId={JSON.parse(localStorage.getItem("user"))?._id}
                      onBack={() => navigate(-1)}
                      />
                      </ProtectedRoute>
                  ) : (
                    <ProtectedRoute>

                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="p-6 bg-blue-500/10 rounded-full">
                        <MessageSquareDashed className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Your Messages</h3>
                      <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Select a friend from the sidebar to start a secure conversation.
                      </p>
                    </div>
                    </ProtectedRoute>
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