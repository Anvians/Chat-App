import { Link } from "react-router-dom";
import AnimatedSearchBar from "./SearchBar.jsx";

const Navbar = ({ onMyRoomClick, onSelectChat }) => {
  return (
    <div className="w-full h-14 md:h-16 bg-gray-900 flex items-center justify-between px-4 md:px-8 shadow-lg border-b border-white/5 relative z-[100]">

      {/* Logo */}
      <div className="flex flex-col justify-center min-w-[100px]">
        <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter leading-tight">
          CHITCHAT
        </h1>
        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-widest uppercase">
          Messages
        </p>
      </div>

      {/* Nav links — hidden on small screens, shown md+ */}
      <nav className="hidden md:flex flex-1 justify-center">
        <ul className="flex space-x-8 text-sm font-medium text-gray-400">
          <li className="hover:text-blue-400 transition-colors cursor-pointer">
            <Link to="/">Explore</Link>
          </li>
          <li className="hover:text-blue-400 transition-colors cursor-pointer">
            Notifications
          </li>
          <li className="hover:text-blue-400 transition-colors cursor-pointer">
            <Link to="/profile">Profile</Link>
          </li>
        </ul>
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-3">

        <AnimatedSearchBar onSelectChat={onSelectChat} />

        {/* Mobile nav icons */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            to="/"
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors text-xs font-bold"
          >
            Explore
          </Link>
          <Link
            to="/profile"
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors text-xs font-bold"
          >
            Profile
          </Link>
        </div>

        {/* My Rooms button */}
        <div className="relative group">
          <button
            onClick={onMyRoomClick}
            className="w-10 h-10 md:w-[64px] md:h-[44px] flex items-center justify-center bg-transparent border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <span className="absolute top-12 right-0 bg-gray-800 border border-white/10 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl pointer-events-none whitespace-nowrap">
            Your Rooms
          </span>
        </div>
      </div>

    </div>
  );
};

export default Navbar;