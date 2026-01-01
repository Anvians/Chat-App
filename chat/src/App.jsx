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
const App = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [loadMyRoom, setLoadMyRoom] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0); 

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === "/auth";
  const isChatPage = location.pathname === "/chat";
  console.log('Active Chat in App:', activeChat)
  // Check if current path starts with /profile (matches /profile and /profile/:id)
  const isProfilePage = location.pathname.startsWith("/profile");
const triggerSidebarRefresh = () => setRefreshSidebar(prev => prev + 1);
  // Navbar is hidden on Auth and Chat screens
  const showNavbar = !isAuthPage && !isChatPage;

  // Sidebar is hidden on Auth and ANY Profile screen (own or others)
  // const showSider = !isAuthPage && !isProfilePage;
  //I will use this if needed

  // Combined function to set active chat and navigate to chat page
  const handleSelectChat = (chat) => {
    console.log('Setting active chat:', chat);
    setActiveChat(chat);
    setRefreshSidebar(prev => prev + 1); // Refresh sidebar when chat is selected
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
          {/* Pass setActiveChat as onSelectChat to Navbar */}
          <Navbar
            onMyRoomClick={() => setLoadMyRoom(prev => !prev)}
            onSelectChat={handleSelectChat}
          />
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">

        <AnimatePresence>
          {/* {showSider && ( */}
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full z-40 border-r border-white/5 bg-[#020617]/40 backdrop-blur-sm"
          >
            <Sider onSelectUser={handleSelectChat} refreshTrigger={refreshSidebar} activeUserId={activeChat?.id} />
          </motion.aside>
          {/* )} */}
        </AnimatePresence>

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
                {/* Rooms/Discovery */}
                <Route
                  path="/"
                  element={<Room rooms={loadMyRoom ? "rooms/my" : "rooms/discover"} />}
                />

                {/* Profile Routes: Passed onSelectChat to allow messaging from profile */}
                <Route
                  path="/profile"
                  element={<UserProfile isPage={true} onSelectChat={handleSelectChat} />}
                />
                <Route
                  path="/profile/:id"
                  element={<UserProfile isPage={true} onSelectChat={handleSelectChat} />}
                />

                {/* Chat Section */}
                <Route path="/chat" element={
                  activeChat ? (
                    <ChatScreen
                      selectedChat={activeChat}
                      token={localStorage.getItem("token")}
                      userId={JSON.parse(localStorage.getItem("user"))?._id}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                      <div className="p-6 bg-blue-500/10 rounded-full">
                        <MessageSquareDashed className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Your Messages</h3>
                      <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Select a friend from the sidebar to start a secure conversation.
                      </p>
                    </div>
                  )
                } />

                {/* Auth & Fallback */}
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