
import { Link } from "react-router-dom";



const Navbar = () => {

  return (

    <div className="w-full h-16 bg-gray-900 flex items-center px-6 shadow-lg">

      

      {/* Logo */}

      <h1 className="text-2xl font-bold text-blue-400 tracking-wide">

        Chit<span className="text-white">Chat</span>

      </h1>



      {/* Nav */}

      <nav className="ml-auto">

        <ul className="flex space-x-6 text-white">

          <li className="hover:text-blue-400 transition">

            <Link to="/">Rooms</Link>

          </li>

          <li className="hover:text-blue-400 transition">

            Notifications

          </li>

          <li className="hover:text-blue-400 transition">

            Profile

          </li>

        </ul>

      </nav>

    </div>

  );

};



export default Navbar;

