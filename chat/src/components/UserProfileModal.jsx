import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Video, Bell, Shield, Image, MapPin, Mail } from "lucide-react";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] px-4"
          >
            <div className="bg-[#111827] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
                <div className="relative group">
                  <img
                    src={user.avatar}
                    className="w-24 h-24 rounded-[2rem] border-4 border-[#111827] object-cover shadow-xl"
                  />
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#111827] rounded-full"></div>
                </div>

                <h2 className="mt-4 text-2xl font-black text-white">{user.name}</h2>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{user.status}</p>
                
                <p className="mt-3 text-gray-400 text-sm px-4 leading-relaxed">
                  "Always up for a quick chat about tech and design. 🚀"
                </p>

                <div className="flex gap-3 mt-6">
                  <button className="p-4 bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl text-gray-300 transition-all active:scale-90">
                    <Phone size={20} />
                  </button>
                  <button className="p-4 bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl text-gray-300 transition-all active:scale-90">
                    <Video size={20} />
                  </button>
                  <button className="p-4 bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl text-gray-300 transition-all active:scale-90">
                    <Mail size={20} />
                  </button>
                </div>

                <div className="w-full mt-8 space-y-1 text-left">
                  <InfoRow icon={<MapPin size={16}/>} label="Location" value="New Delhi, India" />
                  <InfoRow icon={<Bell size={16}/>} label="Notifications" value="Muted" />
                  <InfoRow icon={<Shield size={16}/>} label="Encryption" value="Verified" />
                  <InfoRow icon={<Image size={16}/>} label="Shared Media" value="124 Photos" isLink />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InfoRow = ({ icon, label, value, isLink }) => (
  <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
    <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-200">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-sm font-bold ${isLink ? 'text-blue-400' : 'text-gray-500'}`}>{value}</span>
  </div>
);

export default UserProfileModal;