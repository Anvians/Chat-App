import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Use environment variable for backend URL
const server_url = import.meta.env.VITE_BACKEND_URL;

const AnimatedSearchBar = ({ onSelectChat }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 1) {
                setSearching(true);
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(
                        `${server_url}/api/user/search?query=${query}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setResults(res.data);
                } catch (err) {
                    console.error("Search error", err);
                } finally {
                    setSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const handleUserClick = async (clickedUserId) => {
        try {
            const token = localStorage.getItem("token");
            const currentUser = JSON.parse(localStorage.getItem("user"));
            const myId = currentUser?._id || currentUser?.id;
            
            const res = await axios.post(
                `${server_url}/api/chat`, 
                { userId: clickedUserId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const chatData = res.data;

            const otherUser = chatData.users.find(u => u._id.toString() !== myId.toString());

            if (onSelectChat) {
                onSelectChat({
                    id: chatData._id,
                    name: otherUser?.name || "User",
                    dp: otherUser?.dp || otherUser?.avatar || "https://i.pravatar.cc/150",
                });
            }

            navigate("/chat");
            setIsOpen(false);
            setQuery("");
        } catch (err) {
            console.error("Failed to access chat from search", err);
        }
    };

    return (
        <div className="relative flex items-center">
            <motion.div
                initial={false}
                animate={{ 
                    width: isOpen ? 260 : 40, 
                    backgroundColor: isOpen ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.03)" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center h-10 rounded-full overflow-hidden border border-white/10 backdrop-blur-md px-2"
            >
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (isOpen) setQuery(""); 
                    }}
                    className="flex items-center justify-center text-blue-400 hover:text-blue-300 shrink-0 transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Search size={20} />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.input
                            ref={inputRef}
                            key="input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search users..."
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 px-3 w-full"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results Dropdown */}
            <AnimatePresence>
                {isOpen && query.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-12 right-0 w-72 bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-[100] overflow-hidden"
                    >
                        <div className="p-2">
                            {searching ? (
                                <p className="text-xs text-gray-500 p-4 text-center italic">Searching...</p>
                            ) : results.length ? (
                                results.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleUserClick(u._id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        <img
                                            src={u.dp || "https://i.pravatar.cc/150"}
                                            className="w-9 h-9 rounded-full border border-white/10 object-cover"
                                            alt={u.name}
                                        />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white leading-tight">{u.name}</p>
                                            <p className="text-[10px] text-gray-400 truncate w-40">{u.status}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-xs text-gray-500 p-4 text-center">No users found</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnimatedSearchBar;
