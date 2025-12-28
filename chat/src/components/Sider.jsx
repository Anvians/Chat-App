import { useState } from "react";
import { LogOut, MessageSquare, Search, Plus } from "lucide-react";

// Receive props from App.jsx
const Sider = ({ onSelectUser, activeUserId }) => {
  const [users] = useState([
    { id: 1, name: "Ankit Sharma", lastMsg: "See you soon!", time: "2m", status: "Online" },
    { id: 2, name: "Vikas Sharma", lastMsg: "How's the project?", time: "1h", status: "Online" },
    { id: 3, name: "Anupam Sharma", lastMsg: "Let's go!", time: "3h", status: "Offline" },
  ]);

  return (
    <div className="flex flex-col w-80 h-full bg-[#020617]/60 backdrop-blur-xl text-gray-100 border-r border-white/5">
      
      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter">
            CHITCHAT
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Messages</p>
        </div>
        
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            placeholder="Search conversations..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white/[0.05] transition-all"
          />
        </div>
      </div>

      {/* Modern Users List */}
      <ul className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
        {users.map((user) => {
          const isActive = activeUserId === user.id;
          
          return (
            <li
              key={user.id}
              onClick={() => onSelectUser(user)} // Triggers the change in App.jsx
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.97] group relative ${
                isActive 
                  ? "bg-blue-600/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
              )}

              <div className="relative">
                <img 
                  src={`https://i.pravatar.cc/150?u=${user.id}`} 
                  alt={user.name} 
                  className={`w-12 h-12 rounded-2xl object-cover transition-all duration-500 ${
                    isActive ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#020617]" : "ring-1 ring-white/10"
                  }`}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-4 border-[#020617] rounded-full ${
                  user.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className={`font-bold truncate text-sm transition-colors ${isActive ? "text-blue-400" : "text-white"}`}>
                    {user.name}
                  </p>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">{user.time}</span>
                </div>
                <p className={`text-xs truncate transition-colors ${isActive ? "text-gray-300" : "text-gray-500"}`}>
                  {user.lastMsg}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Profile/Logout Footer */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
        <button className="flex items-center justify-center gap-2 w-full bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sider;