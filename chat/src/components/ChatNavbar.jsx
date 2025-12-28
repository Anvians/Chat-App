import { Phone, Video, MoreVertical, Search } from "lucide-react";

const ChatNavbar = ({ chat }) => {
  return (
    <div className="w-full h-20 bg-gray-900/60 backdrop-blur-md flex items-center px-6 border-b border-gray-800 z-30">
      {/* Profile Info */}
      <div className="flex items-center flex-1">
        <div className="relative">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-gray-900 rounded-full"></div>
        </div>
        
        <div className="ml-4">
          <h2 className="text-white font-bold text-base leading-tight">{chat.name}</h2>
          <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            {chat.status}
          </span>
        </div>
      </div>

      {/* Modern Actions */}
      <div className="flex items-center space-x-2">
        <button className="p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <Video className="w-5 h-5" />
        </button>
        <div className="w-[1px] h-6 bg-gray-800 mx-2"></div>
        <button className="p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatNavbar;