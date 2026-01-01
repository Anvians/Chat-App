import { useState, useEffect } from "react";
import { LogOut, Search } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const server_url = import.meta.env.VITE_BACKEND_URL;

const Sider = ({ onSelectUser, activeUserId, refreshTrigger }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const fetchMyProfile = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      setUser(savedUser);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${server_url}/api/chat/sidebar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setChats(sorted);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
    fetchChats();

    const socket = io(server_url, {
      auth: { token: localStorage.getItem("token") }
    });

    // Listen for new chats or messages
    socket.on("new_chat_added", fetchChats);
    socket.on("recv_msg", fetchChats);

    return () => socket.disconnect();
  }, [refreshTrigger]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  return (
    <div className="flex flex-col w-80 h-full bg-[#020617]/60 backdrop-blur-xl text-gray-100 border-r border-white/5">
      {/* Logged-in user */}
      {user && (
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <img
            src={user.dp || "https://i.pravatar.cc/150"}
            alt="profile"
            className="w-12 h-12 rounded-2xl object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{user.name}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Online</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 my-4">
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            placeholder="Search conversations..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Chats */}
      <ul className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
             <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-xs text-gray-500">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <li className="text-center text-gray-500 py-10 text-xs italic">No conversations yet</li>
        ) : (
          chats.map((chat) => {
            const isActive = activeUserId === chat._id;
            return (
              <li
                key={chat._id}
                onClick={() => onSelectUser(chat)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600/20 border border-blue-500/30" 
                    : "hover:bg-white/[0.05] border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={chat.dp || `https://i.pravatar.cc/150?u=${chat.id}`}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/5"
                    alt=""
                  />
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-4 border-[#020617] rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-gray-200"}`}>
                      {chat.name}
                    </p>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {new Date(chat.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium">
                    {chat.lastMessage || "Start a conversation"}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500 text-red-400 hover:text-white py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sider;
