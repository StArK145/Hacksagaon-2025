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
import {  Activity } from 'lucide-react';

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
  <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-200">
    {/* Floating Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-pink-200 opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 right-20 w-96 h-96 rounded-full bg-teal-200 opacity-20 animate-bounce"></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full bg-cyan-200 opacity-25 animate-pulse"></div>
      <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-pink-300 to-teal-300"></div>
    </div>

    {/* Branding Section */}
    <div className="w-1/2 relative z-10 flex flex-col justify-center items-center p-16 text-pink-600">
      <div className="backdrop-blur-lg rounded-3xl p-10 border border-pink-200 shadow-2xl bg-white/40">
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <div className="bg-pink-200/30 backdrop-blur-sm rounded-full p-6 border border-pink-300/50 mb-4">
              <Activity className="w-16 h-16 text-pink-500" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gray-400 to-teal-400 bg-clip-text text-transparent">HealthSync</h1>
          <p className="text-2xl opacity-90 font-light text-gray-500">Transform Your Wellness Journey</p>
        </div>

        <div className="space-y-6">
          {[
            { icon: "⚡", text: "AI-Powered Health Insights" },
            { icon: "🔒", text: "Secure Data Protection" },
            { icon: "📊", text: "Real-time Analytics" },
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl backdrop-blur-sm bg-pink-100/20 hover:bg-pink-100/30 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg bg-pink-300">
                {feature.icon}
              </div>
              <span className="text-lg font-medium text-gray-600">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Form Section */}
    <div className="w-1/2 relative z-10 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-pink-200/30 bg-white/80 hover:scale-[1.01] transition-all duration-500">
          {/* Tab Nav */}
          <div className="flex justify-center mb-10">
            <div className="flex p-2 rounded-2xl relative shadow-inner bg-pink-50">
              <div
                className={`absolute top-2 bottom-2 rounded-xl shadow-lg transition-all duration-500 ease-out transform bg-gradient-to-br from-[#FF8FA3] to-[#FFA6C1] ${
                  activeTab === "login" ? "left-2 w-24" : "left-28 w-28"
                }`}
              ></div>

              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  className={`relative z-10 px-8 py-4 font-bold text-sm transition-all duration-300 rounded-xl transform hover:scale-105 ${
                    activeTab === tab ? "text-white scale-105" : "text-pink-600"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "login" ? "Sign In" : "Join Us"}
                </button>
              ))}
            </div>
          </div>

          {/* Error/Success Alerts */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">!</span>
                </div>
                <span className="font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="bg-teal-50 border-l-4 border-teal-400 p-4 mb-6 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="font-medium text-teal-800">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Login / Register Forms */}
          {activeTab === "login" ? (
            <div className="space-y-8">
              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-gray-600">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-300 group-focus-within:text-gray-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    ref={emailRef}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyDown={(e) => handleArrowKeys(e, passwordRef, null)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-400 transition-all text-gray-700 placeholder-gray-300 shadow-sm bg-white/70"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-gray-600">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-300 group-focus-within:text-gray-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => handleArrowKeys(e, null, emailRef)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-400 transition-all text-gray-700 placeholder-gray-300 shadow-sm bg-white/70"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="text-sm font-semibold text-gray-500 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-br from-[#FF8FA3] to-[#FFA6C1]"
              >
                {loading ? "Signing in..." : "Sign In to HealthSync"}
              </button>

              {/* Google */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-pink-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 text-sm font-medium text-gray-400 bg-white/80">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth(false)}
                className="w-full border-2 border-pink-300 py-4 rounded-2xl flex items-center justify-center bg-white/70 hover:bg-white/90"
              >
                <FaGoogle className="mr-3 text-red-500" />
                <span className="font-semibold text-pink-600">Continue with Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Register Fields */}
              {[
                {
                  ref: registerEmailRef,
                  value: registerEmail,
                  setValue: setRegisterEmail,
                  type: "email",
                  placeholder: "your@email.com",
                  icon: FaEnvelope,
                  label: "Email Address",
                },
                {
                  ref: registerPasswordRef,
                  value: registerPassword,
                  setValue: setRegisterPassword,
                  type: showPassword ? "text" : "password",
                  placeholder: "Create strong password",
                  icon: FaLock,
                  label: "Password",
                  showToggle: true,
                },
                {
                  ref: confirmPasswordRef,
                  value: confirmPassword,
                  setValue: setConfirmPassword,
                  type: showConfirmPassword ? "text" : "password",
                  placeholder: "Confirm password",
                  icon: FaLock,
                  label: "Confirm Password",
                  showToggle: true,
                  useConfirmToggle: true,
                },
              ].map((field, index) => (
                <div key={index} className="group">
                  <label className="block text-sm font-semibold mb-2 text-gray-600">{field.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <field.icon className="text-gray-300" />
                    </div>
                    <input
                      type={field.type}
                      ref={field.ref}
                      value={field.value}
                      onChange={(e) => field.setValue(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-400 text-gray-700 placeholder-gray-300 shadow-sm bg-white/70"
                    />
                    {field.showToggle && (
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          field.useConfirmToggle
                            ? setShowConfirmPassword(!showConfirmPassword)
                            : setShowPassword(!showPassword)
                        }
                      >
                        {field.useConfirmToggle ? (showConfirmPassword ? <FaEyeSlash /> : <FaEye />) : (showPassword ? <FaEyeSlash /> : <FaEye />)}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-br from-[#FF8FA3] to-[#FFA6C1]"
              >
                {loading ? "Creating Account..." : "Create Your Account"}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-pink-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 text-sm font-medium text-gray-400 bg-white/80">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuth(true)}
                className="w-full border-2 border-pink-300 py-4 rounded-2xl flex items-center justify-center bg-white/70 hover:bg-white/90"
              >
                <FaGoogle className="mr-3 text-red-500" />
                <span className="font-semibold text-pink-600">Continue with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default HealthAuth;
