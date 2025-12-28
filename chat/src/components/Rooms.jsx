import RoomData from "../data/RoomData.js";
import { Users, ArrowRight, Hash } from "lucide-react";

const Room = () => {
  return (
    <div className="p-8 w-full h-full bg-[#0F172A] overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <header className="relative mb-10 text-left">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Hash className="text-blue-500 w-8 h-8" />
          Discovery
        </h1>
        <p className="text-gray-400 mt-1">Explore communities and start chatting.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 relative">
        {RoomData.map((room) => (
          <div
            key={room.id}
            className="group relative bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 transition-all duration-300 hover:bg-gray-800/60 hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <img
                  src={room.group_icon}
                  alt={room.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0F172A] rounded-full"></div>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-gray-300">{room.members}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {room.name}
              </h2>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                {room.description}
              </p>
            </div>

            <button className="mt-6 w-full group/btn relative flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl transition-all overflow-hidden">
              <span className="z-10 flex items-center gap-2">
                Join Room
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;