import { Phone, Video, MoreVertical, Search, ArrowLeft } from "lucide-react";

const ChatNavbar = ({ chat, onBack }) => {
  return (
    <div className="w-full h-16 md:h-20 bg-gray-900/60 backdrop-blur-md flex items-center px-3 md:px-6 border-b border-gray-800 z-30">

      {/* Back button — only visible on mobile */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-2 mr-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center flex-1 min-w-0">
        <div className="relative shrink-0">
          <img
            src={chat.avatar || chat.dp}
            alt={chat.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-4 border-gray-900 rounded-full"></div>
        </div>

        <div className="ml-3 min-w-0">
          <h2 className="text-white font-bold text-sm md:text-base leading-tight truncate">{chat.name}</h2>
          <span className="text-[10px] md:text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            {chat.status}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
        <button className="p-2 md:p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all hidden sm:block">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="p-2 md:p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <Phone className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="p-2 md:p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all hidden sm:block">
          <Video className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="w-[1px] h-5 bg-gray-800 mx-1 hidden sm:block"></div>
        <button className="p-2 md:p-2.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all">
          <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatNavbar;