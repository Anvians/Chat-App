import { useState, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, Phone, ChevronDown, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";

const AuthForm = () => {
  const [mode, setMode] = useState("login"); // 'login', 'signup', or 'forgot'
  const [phone, setPhone] = useState("");

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <div className="min-h-full w-full flex items-center justify-center p-6">
      <div className="relative w-full max-w-[420px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[2.5rem] blur opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-gray-900/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  {isLogin && "Welcome Back"}
                  {isSignup && "Create Account"}
                  {isForgot && "Recovery"}
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                  {isForgot ? "We'll send a code to your phone" : "Enter your details to continue"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="popLayout">
              {/* Field: Full Name (Signup Only) */}
              {isSignup && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <InputGroup icon={<User />} type="text" placeholder="Full Name" />
                </motion.div>
              )}

              {/* Field: Phone (All Modes) */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-r border-white/10 pr-3 group-focus-within:text-blue-400 transition-colors">
                  <span className="text-sm font-bold">+91</span>
                  <ChevronDown size={14} />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full bg-white/[0.03] focus:bg-white/[0.07] border border-white/10 focus:border-blue-500/50 rounded-2xl py-4 pl-20 pr-4 text-white outline-none transition-all focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Field: Password (Login & Signup Only) */}
              {!isForgot && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <InputGroup icon={<Lock />} type="password" placeholder="Password" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group">
              {isLogin && "SIGN IN"}
              {isSignup && "CREATE ACCOUNT"}
              {isForgot && "SEND OTP"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Bottom Navigation Links */}
          <div className="mt-8 space-y-4 text-center">
            {isLogin && (
              <button onClick={() => setMode("forgot")} className="text-xs text-gray-500 hover:text-blue-400 font-bold tracking-wide transition-colors uppercase">
                Forgot Password?
              </button>
            )}

            <div className="text-sm text-gray-400">
              {isLogin ? "New to ChitChat?" : "Already have an account?"} 
              <button 
                onClick={() => setMode(isLogin ? "signup" : "login")}
                className="ml-2 text-blue-400 font-bold hover:underline"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </div>

            {isForgot && (
              <button onClick={() => setMode("login")} className="flex items-center justify-center gap-2 w-full text-xs text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-blue-500" />
            Secure Entry
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Helper Components
const InputGroup = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
      {cloneElement(icon, { size: 20 })}
    </div>
    <input
      {...props}
      className="w-full bg-white/[0.03] focus:bg-white/[0.07] border border-white/10 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-gray-600 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

export default AuthForm;