import { Routes, Route } from "react-router-dom";
import Sider from "./components/Sider";
import ChatScreen from "./components/ChatScreen";

const App = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <Sider />
      </div>

      {/* Main content */}
      <div className="flex-1 flex bg-gray-200">
        <Routes>
          <Route path="/" element={<ChatScreen />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
