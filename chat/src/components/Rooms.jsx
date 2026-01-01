import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom"
import { Users, ArrowRight, Hash, Shield } from "lucide-react";

const Room = ({ rooms: roomsPath }) => { 
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  if (!token) {
    const navigate = useNavigate()
    navigate("/login")
  }
  useEffect(() => {
    if (!roomsPath) return;

    const getRooms = async () => {
      setLoading(true);

      const savedToken = localStorage.getItem("token");

      if (!savedToken) {
        console.error("No token found in localStorage");
        setLoading(false);
        return;
      }
      console.log("Fetching from:", roomsPath);
      console.log("Using Token:", localStorage.getItem("token"));
      try {
        const response = await fetch(
          `http://localhost:3003/api/${roomsPath}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${savedToken}`,
            },
          }
        );

        if (response.status === 401) {
          console.error("Server says: Unauthorized. Check if token is expired.");
        }

        const data = await response.json();
        setRooms(Array.isArray(data) ? data : data.rooms || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    getRooms();
  }, [roomsPath]);
  return (
    <div className="p-8 w-full h-full bg-[#0F172A] overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <header className="relative mb-10 text-left">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          {roomsPath.includes("my") ? (
            <>
              <Shield className="text-indigo-500 w-8 h-8" />
              My Communities
            </>
          ) : (
            <>
              <Hash className="text-blue-500 w-8 h-8" />
              Discovery
            </>
          )}
        </h1>
        <p className="text-gray-400 mt-1">
          {roomsPath.includes("my")
            ? "Rooms you are a member of."
            : "Explore communities and start chatting."}
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {rooms.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-3xl">
              <p className="text-gray-500">No rooms found in this section.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 relative">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="group relative bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 transition-all duration-300 hover:bg-gray-800/60 hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <img
                    src={room.room_icon || "https://i.pravatar.cc/150"}
                    alt={room.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all"
                  />
                  <div className="flex items-center gap-1.5 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-gray-300">
                      {room.members?.length || 0}
                    </span>
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
                    {roomsPath.includes("my") ? "Open Chat" : "Join Room"}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Room;