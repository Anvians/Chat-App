import { Routes, Route, useLocation } from "react-router-dom";
import Sider from "./components/Sider";
import ChatScreen from "./components/ChatScreen";
import Signup from "./components/Signup";
import Login from "./components/Login"
const App = () => {
  const location = useLocation()
  const hideSiderPaths = ['/signup', '/login']
  const showSider = !hideSiderPaths.includes(location.pathname)
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}

      {showSider && (<div className="w-64 shrink-0">
        <Sider />
      </div>)}

      {/* Main content */}
      <div className={`flex-1 flex bg-gray-200 ${showSider ? '' : 'w-full'}`}>
        <Routes>
          <Route path="/" element={<ChatScreen />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

        </Routes>
      </div>
    </div>
  );
};

export default App;
