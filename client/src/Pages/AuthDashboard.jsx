import React, { useState, useRef } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { app, db } from "../utils/firebase";
import { getAdditionalUserInfo } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaHeartbeat,
  FaUserPlus,
  FaSignInAlt,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const HealthAuth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const emailRef = useRef();
  const passwordRef = useRef();
  const registerEmailRef = useRef();
  const registerPasswordRef = useRef();
  const confirmPasswordRef = useRef();
  const navigateTO = useNavigate();

  const handleArrowKeys = (e, next, prev) => {
    if (e.key === "ArrowDown" && next?.current) next.current.focus();
    else if (e.key === "ArrowUp" && prev?.current) prev.current.focus();
  };

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  // Handle email login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setSuccessMessage(
        "Login successful! Redirecting to your health dashboard..."
      );
      navigateTO("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle email registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );

      const user = userCredential.user;

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        isProfileComplete: false,
      });

      setSuccessMessage(
        "Account created successfully! Welcome to HealthTrack."
      );
      navigateTO("/");

      // Clear form
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login (for both login and registration)
  const handleGoogleAuth = async (isRegistration = false) => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // If it's registration and user is new, store in Firestore
      if (isRegistration && additionalInfo?.isNewUser) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          isProfileComplete: false,
        });
      }

      setSuccessMessage(
        isRegistration
          ? "Registration with Google successful!"
          : "Login with Google successful!"
      );
      navigateTO("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) return setError("Please enter your email first");
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setSuccessMessage("Password reset link sent to your email.");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/user-not-found":
        return "User not found";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later";
      case "auth/popup-closed-by-user":
        return "Google sign-in canceled";
      case "auth/account-exists-with-different-credential":
        return "Account exists with different credentials";
      default:
        return "Authentication failed. Please try again.";
    }
  };

return (
  <div className="min-h-screen flex relative overflow-hidden" style={{background: 'linear-gradient(135deg, rgb(48, 121, 102) 0%, rgb(129, 197, 169) 50%, rgb(239, 239, 239) 100%)'}}>
    {/* Floating Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 animate-float" style={{backgroundColor: 'rgb(129, 197, 169)'}}></div>
      <div className="absolute top-1/2 right-20 w-96 h-96 rounded-full opacity-15 animate-float-delayed" style={{backgroundColor: 'rgb(48, 121, 102)'}}></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-20 animate-pulse" style={{backgroundColor: 'rgb(129, 197, 169)'}}></div>
      
      {/* Mesh Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(48, 121, 102) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
    </div>

    {/* Left Branding Section */}
    <div className="w-1/2 relative z-10 flex flex-col justify-center items-center p-16 text-white">
      <div className="backdrop-blur-lg rounded-3xl p-10 border shadow-2xl" style={{
        background: 'rgba(48, 121, 102, 0.2)',
        borderColor: 'rgba(129, 197, 169, 0.3)'
      }}>
        <div className="text-center mb-10">
          {/* Logo Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300" style={{
            background: 'linear-gradient(135deg, rgb(129, 197, 169), rgb(48, 121, 102))'
          }}>
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent" style={{
            backgroundImage: 'linear-gradient(135deg, rgb(129, 197, 169), white)'
          }}>
            HealthSync
          </h1>
          <p className="text-2xl opacity-90 font-light">
            Transform Your Wellness Journey
          </p>
        </div>
        
        {/* Feature Pills */}
        <div className="space-y-6">
          {[
            { icon: "⚡", text: "AI-Powered Health Insights", delay: "0ms" },
            { icon: "🔒", text: "Secure Data Protection", delay: "150ms" },
            { icon: "📊", text: "Real-time Analytics", delay: "300ms" }
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300" style={{
              background: 'rgba(129, 197, 169, 0.15)',
              animationDelay: feature.delay
            }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg" style={{
                backgroundColor: 'rgb(129, 197, 169)'
              }}>
                {feature.icon}
              </div>
              <span className="text-lg font-medium text-white">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Form Section */}
    <div className="w-1/2 relative z-10 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Main Form Container */}
        <div className="backdrop-blur-xl rounded-3xl p-10 shadow-2xl border transform hover:scale-[1.01] transition-all duration-500" style={{
          background: 'rgba(239, 239, 239, 0.95)',
          borderColor: 'rgba(129, 197, 169, 0.2)'
        }}>
          
          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="flex p-2 rounded-2xl relative shadow-inner" style={{backgroundColor: 'rgb(239, 239, 239)'}}>
              <div 
                className={`absolute top-2 bottom-2 rounded-xl shadow-lg transition-all duration-500 ease-out transform ${
                  activeTab === "login" ? "left-2 w-24" : "left-28 w-28"
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgb(48, 121, 102), rgb(129, 197, 169))'
                }}
              ></div>
              
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  className={`relative z-10 px-8 py-4 font-bold text-sm transition-all duration-300 rounded-xl transform ${
                    activeTab === tab 
                      ? "text-white scale-105" 
                      : "hover:scale-105"
                  }`}
                  style={{color: activeTab === tab ? 'white' : 'rgb(48, 121, 102)'}}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "login" ? "Sign In" : "Join Us"}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Alert Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl animate-in slide-in-from-left duration-500">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="border-l-4 p-4 mb-6 rounded-r-xl animate-in slide-in-from-left duration-500" style={{
              backgroundColor: 'rgba(129, 197, 169, 0.1)',
              borderColor: 'rgb(129, 197, 169)'
            }}>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3" style={{backgroundColor: 'rgb(129, 197, 169)'}}>
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="font-medium" style={{color: 'rgb(48, 121, 102)'}}>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          {activeTab === "login" ? (
            <form className="space-y-8" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-semibold mb-2" style={{color: 'rgb(48, 121, 102)'}}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 group-focus-within:text-current transition-colors" style={{color: 'rgb(129, 197, 169)'}} />
                  </div>
                  <input
                    type="email"
                    ref={emailRef}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => handleArrowKeys(e, passwordRef, null)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
                    style={{
                      focusBorderColor: 'rgb(129, 197, 169)',
                      focusBoxShadow: '0 0 0 3px rgba(129, 197, 169, 0.1)'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-semibold mb-2" style={{color: 'rgb(48, 121, 102)'}}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 group-focus-within:text-current transition-colors" style={{color: 'rgb(129, 197, 169)'}} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => handleArrowKeys(e, null, emailRef)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-current transition-colors"
                    style={{color: 'rgb(129, 197, 169)'}}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold hover:underline transition-all duration-300"
                  style={{color: 'rgb(48, 121, 102)'}}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgb(129, 197, 169)' : 'linear-gradient(135deg, rgb(48, 121, 102), rgb(129, 197, 169))'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In to HealthSync"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 text-sm font-medium text-gray-500" style={{backgroundColor: 'rgb(239, 239, 239)'}}>
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleAuth(false)}
                className="w-full border-2 py-4 rounded-2xl flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group"
                style={{
                  borderColor: 'rgb(129, 197, 169)',
                  backgroundColor: 'white'
                }}
              >
                <FaGoogle className="mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold" style={{color: 'rgb(48, 121, 102)'}}>Continue with Google</span>
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              {/* Register form with similar styling patterns */}
              <div className="space-y-6">
                {[
                  { ref: registerEmailRef, value: registerEmail, setValue: setRegisterEmail, type: "email", placeholder: "your@email.com", icon: FaEnvelope, label: "Email Address" },
                  { ref: registerPasswordRef, value: registerPassword, setValue: setRegisterPassword, type: showPassword ? "text" : "password", placeholder: "Create strong password", icon: FaLock, label: "Password", showToggle: true },
                  { ref: confirmPasswordRef, value: confirmPassword, setValue: setConfirmPassword, type: showConfirmPassword ? "text" : "password", placeholder: "Confirm password", icon: FaLock, label: "Confirm Password", showToggle: true, useConfirmToggle: true }
                ].map((field, index) => (
                  <div key={index} className="group">
                    <label className="block text-sm font-semibold mb-2" style={{color: 'rgb(48, 121, 102)'}}>
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <field.icon className="text-gray-400 group-focus-within:text-current transition-colors" style={{color: 'rgb(129, 197, 169)'}} />
                      </div>
                      <input
                        type={field.type}
                        ref={field.ref}
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
                      />
                      {field.showToggle && (
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-current transition-colors"
                          style={{color: 'rgb(129, 197, 169)'}}
                          onClick={() => field.useConfirmToggle ? setShowConfirmPassword(!showConfirmPassword) : setShowPassword(!showPassword)}
                        >
                          {(field.useConfirmToggle ? showConfirmPassword : showPassword) ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgb(129, 197, 169)' : 'linear-gradient(135deg, rgb(48, 121, 102), rgb(129, 197, 169))'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Your Account"
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 text-sm font-medium text-gray-500" style={{backgroundColor: 'rgb(239, 239, 239)'}}>
                    or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth(true)}
                className="w-full border-2 py-4 rounded-2xl flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group"
                style={{
                  borderColor: 'rgb(129, 197, 169)',
                  backgroundColor: 'white'
                }}
              >
                <FaGoogle className="mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold" style={{color: 'rgb(48, 121, 102)'}}>Continue with Google</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Custom CSS for animations */}
    <style jsx>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes float-delayed {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-30px) rotate(-5deg); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-float-delayed {
        animation: float-delayed 8s ease-in-out infinite;
      }
      
      input:focus {
        border-color: rgb(129, 197, 169) !important;
        box-shadow: 0 0 0 3px rgba(129, 197, 169, 0.1) !important;
      }
    `}</style>
  </div>
);
};

export default HealthAuth;
