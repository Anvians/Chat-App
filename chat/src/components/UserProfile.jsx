import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Bell, Shield, Mail, Edit3, Save, Camera, ArrowLeft, MessageSquare } from "lucide-react";

const server_url = 'http://localhost:3003' ||   'https://chat-app-l5l5.vercel.app'


const UserProfile = ({ isPage = false, user: propUser, onSelectChat }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [user, setUser] = useState(propUser);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = id 
        ? `${server_url}/api/user/profile/${id}` 
        : `${server_url}/api/user/profile`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      setFormData(res.data.user);
      setIsOwnProfile(res.data.isOwnProfile);
    } catch (err) {
      console.error("Profile load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${server_url}/api/user/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      alert("Update failed");
    }
  };

  const startConversation = () => {
    if (onSelectChat) {
      onSelectChat({
        id: user._id,
        name: user.name,
        dp: user.dp,
        status: user.status
      });
      navigate("/chat");
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-gray-500 font-medium">Loading profile...</div>;
  if (!user) return <div className="h-full flex items-center justify-center text-red-400">User not found</div>;

  return (
    <div className="h-full overflow-y-auto pt-10 px-4 pb-20">
      <motion.div 
        layout
        className="relative w-full max-w-md mx-auto bg-[#111827] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative shadow-inner">
          {isPage && (
            <button 
              onClick={() => window.history.back()}
              className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {isOwnProfile && (
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all shadow-lg backdrop-blur-md"
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            </button>
          )}
        </div>

        <div className="px-6 pb-8 -mt-16 flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={formData.dp || "https://i.pravatar.cc/150"}
              className={`w-32 h-32 rounded-[2.5rem] border-8 border-[#111827] object-cover shadow-2xl transition-all ${isEditing ? 'opacity-50 blur-[2px]' : ''}`}
              alt={user.name}
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <Camera className="text-white drop-shadow-md" size={32} />
                <input type="file" className="hidden" />
              </label>
            )}
          </div>

          {isEditing ? (
            <div className="mt-4 w-full px-4 space-y-2">
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-white font-bold outline-none focus:border-blue-500/50"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-blue-400 text-xs outline-none focus:border-blue-500/50"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              />
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-black text-white tracking-tight">{user.name}</h2>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{user.status}</p>
            </>
          )}

          <div className="w-full mt-8 space-y-1 text-left">
            <EditableRow 
                icon={<Mail size={16}/>} label="Email" value={formData.email} 
                isEditing={isEditing} field="email" setFormData={setFormData} formData={formData}
            />
            <InfoRow icon={<Phone size={16}/>} label="Phone" value={user.phone_number} />
            <InfoRow icon={<Shield size={16}/>} label="Privacy" value="End-to-End Encrypted" />
            
            {!isOwnProfile && (
               <motion.button 
                 whileTap={{ scale: 0.95 }}
                 onClick={startConversation}
                 className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
               >
                  <MessageSquare size={18} />
                  Message {user.name.split(' ')[0]}
               </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EditableRow = ({ icon, label, value, isEditing, field, setFormData, formData }) => (
  <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
    <div className="flex items-center gap-3 text-gray-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {isEditing ? (
      <input 
        className="bg-blue-500/10 border-none outline-none text-right text-sm text-white rounded px-2 w-1/2 py-1"
        value={value}
        onChange={(e) => setFormData({...formData, [field]: e.target.value})}
      />
    ) : (
      <span className="text-sm font-bold text-gray-500">{value || "None"}</span>
    )}
  </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between p-3 text-gray-400">
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-500">{value}</span>
    </div>
);

export default UserProfile;