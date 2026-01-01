import { useState, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, ArrowRight, ChevronDown, ArrowLeft, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const server_url = 'http://localhost:3003' ||   'https://chat-app-l5l5.vercel.app'


const AuthForm = () => {
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  const SignUp = async () => {
    console.log("DEBUG: SignUp function triggered");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${server_url}/api/auth/signup`, {
        name: name,
        phone_number: phone,
        password: password,
      });
      console.log("DEBUG: Signup Success Response ->", res.data);
      alert("Account created successfully! Please log in.");
      setMode("login");
    } catch (err) {
      console.error("DEBUG: Signup Error ->", err.response?.data);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const SignIn = async () => {
    console.log("DEBUG 1: SignIn function started");
    setLoading(true);
    setError("");

    try {
      console.log("DEBUG 2: Sending request to backend with:", { phone, password });
      const res = await axios.post(`${server_url}/api/auth/signin`, {
        phone_number: phone,
        password: password,
      });

      console.log("DEBUG 3: Success! Received Data ->", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        
        localStorage.setItem("user", JSON.stringify(res.data.user));

        console.log("DEBUG 4: Data saved to localStorage. Redirecting...");
        

        navigate("/"); 
      }
    } catch (err) {
      console.error("DEBUG 5: Catch Block Error ->", err.response);
      setError(err.response?.data?.message || "Invalid credentials or Server error");
    } finally {
      setLoading(false);
      console.log("DEBUG 6: SignIn sequence finished");
    }
  };
// OTP functionality 
  const SendOTP = async () => {
    console.log("DEBUG: SendOTP triggered");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${server_url}/api/forgot-password`, {
        phone_number: phone,
      });
      console.log("DEBUG: OTP Response ->", res.data);
      alert("OTP sent to your phone!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    console.log("DEBUG: Form Submit button clicked. Current Mode:", mode);

    if (mode === "login") {
      SignIn();
    } else if (mode === "signup") {
      SignUp();
    } else if (mode === "forgot") {
      SendOTP();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-black text-white">
      <div className="relative w-full max-w-[420px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[2.5rem] blur opacity-20"></div>
        
        <div className="relative bg-gray-900/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tighter">
              {isLogin && "Welcome Back"}
              {isSignup && "Create Account"}
              {isForgot && "Recovery"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {isForgot ? "We'll send a code to your phone" : "Enter your details to continue"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <InputGroup
                    icon={<User />}
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignup}
                  />
                </motion.div>
              )}

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-r border-white/10 pr-3">
                  <span className="text-sm font-bold">+91</span>
                  <ChevronDown size={14} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500 rounded-2xl py-4 pl-20 pr-4 outline-none transition-all"
                />
              </div>

              {!isForgot && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <InputGroup
                    icon={<Lock />}
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-red-400 text-xs font-medium text-center bg-red-400/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-500 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
            >
              {loading ? "PLEASE WAIT..." : (
                <>
                  {isLogin && "SIGN IN"}
                  {isSignup && "CREATE ACCOUNT"}
                  {isForgot && "SEND OTP"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center">
            {isLogin && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-gray-500 hover:text-blue-400 font-bold uppercase">
                Forgot Password?
              </button>
            )}

            <div className="text-sm text-gray-400">
              {isLogin ? "New here?" : "Have an account?"} 
              <button 
                type="button" 
                onClick={() => { setError(""); setMode(isLogin ? "signup" : "login"); }}
                className="ml-2 text-blue-400 font-bold hover:underline"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
      {cloneElement(icon, { size: 20 })}
    </div>
    <input
      {...props}
      className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
    />
  </div>
);

export default AuthForm;