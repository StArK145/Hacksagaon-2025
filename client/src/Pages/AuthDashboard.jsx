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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Health Info Panel */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-teal-600 to-teal-800 text-white p-8 flex flex-col">
          <div className="flex items-center mb-10">
            <FaHeartbeat className="text-3xl mr-3" />
            <h1 className="text-3xl font-bold">HealthTrack</h1>
          </div>

          <div className="flex-grow">
            <h2 className="text-2xl font-bold mb-6">
              Track Your Wellness Journey
            </h2>

            <div className="bg-teal-700/30 backdrop-blur-sm p-6 rounded-xl mb-8">
              <div className="flex items-start">
                <div className="bg-teal-500 p-3 rounded-full mr-4">
                  <FaHeartbeat className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Health Insights</h3>
                  <p className="opacity-90">
                    Monitor vital signs, set health goals, and receive
                    personalized insights to optimize your wellbeing.
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="bg-teal-500/20 p-2 rounded-full mr-3">
                  <FaHeartbeat />
                </div>
                Monitor heart rate, blood pressure, and more
              </li>
              <li className="flex items-center">
                <div className="bg-teal-500/20 p-2 rounded-full mr-3">
                  <FaHeartbeat />
                </div>
                Track medication and appointments
              </li>
              <li className="flex items-center">
                <div className="bg-teal-500/20 p-2 rounded-full mr-3">
                  <FaHeartbeat />
                </div>
                Receive data-driven health recommendations
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-teal-500/30">
            <p className="text-sm opacity-80">
              "Your health data is encrypted and protected with the highest
              security standards."
            </p>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="w-full md:w-3/5 p-8">
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-3 px-6 font-medium text-lg relative ${
                activeTab === "login"
                  ? "text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaSignInAlt className="inline mr-2" /> Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`py-3 px-6 font-medium text-lg relative ${
                activeTab === "register"
                  ? "text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaUserPlus className="inline mr-2" /> Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Login Section */}
          {activeTab === "login" && (
            <div>
              <button
                onClick={() => handleGoogleAuth(false)}
                disabled={loading}
                className="w-full mb-6 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center shadow hover:shadow-md"
              >
                <FaGoogle className="text-red-500 text-xl mr-3" />
                Sign in with Google
              </button>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      ref={emailRef}
                      type="email"
                      value={loginEmail}
                      onKeyDown={(e) => handleArrowKeys(e, passwordRef, null)}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      onKeyDown={(e) => handleArrowKeys(e, null, emailRef)}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-gray-400" />
                      ) : (
                        <FaEye className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center shadow-md"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" /> Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-teal-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Registration Section */}
          {activeTab === "register" && (
            <div>
              <button
                onClick={() => handleGoogleAuth(true)}
                disabled={loading}
                className="w-full mb-6 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center shadow hover:shadow-md"
              >
                <FaGoogle className="text-red-500 text-xl mr-3" />
                Sign up with Google
              </button>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      ref={registerEmailRef}
                      type="email"
                      value={registerEmail}
                      onKeyDown={(e) =>
                        handleArrowKeys(e, registerPasswordRef, null)
                      }
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      ref={registerPasswordRef}
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      onKeyDown={(e) =>
                        handleArrowKeys(e, confirmPasswordRef, registerEmailRef)
                      }
                      className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Create a password (min 6 chars)"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-gray-400" />
                      ) : (
                        <FaEye className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use at least 6 characters with a mix of letters and numbers
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      onKeyDown={(e) =>
                        handleArrowKeys(
                          e,
                          termsCheckboxRef,
                          registerPasswordRef
                        )
                      }
                      className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-gray-400" />
                      ) : (
                        <FaEye className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 mr-3 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Privacy Policy
                    </a>
                    , and I consent to the collection of my health data for
                    personalized insights.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center shadow-md"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2" /> Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthAuth;
