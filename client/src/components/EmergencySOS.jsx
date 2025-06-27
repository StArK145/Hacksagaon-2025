import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import emailjs from "@emailjs/browser";

// Init using env variable
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

const EmergencySOS = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const sendSOS = () => {
    setLoading(true);
    const contact = userData?.emergencyContacts?.[0];

    if (!userData?.name || !contact?.email) {
      alert("User name or emergency contact not found.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const staticMap = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=600x300&markers=color:red%7C${lat},${lng}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`;

        const templateParams = {
          name: userData.name,
          message: "🚨 Emergency! SOS triggered!",
          timestamp: new Date().toLocaleString(),
          location: locationLink,
          location_image: staticMap,
          to_email: contact.email,
        };

        emailjs
          .send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams
          )
          .then(() => {
            alert(`🚨 SOS sent to ${contact.email}`);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            alert("❌ Failed to send SOS email.");
            setLoading(false);
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("❌ Location access denied or unavailable.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main SOS Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-gradient-to-br from-red-500 to-orange-500"></div>
          
          {/* Alert Icon */}
          <div className="relative mb-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency SOS</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Press the button below to send an emergency alert with your location to your emergency contact
            </p>
          </div>

          {/* Emergency Contact Info */}
          {userData?.emergencyContacts?.[0] && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
              </div>
              <p className="text-gray-800 font-semibold text-sm">
                {userData.emergencyContacts[0].name || userData.emergencyContacts[0].email}
              </p>
              <p className="text-gray-500 text-xs">{userData.emergencyContacts[0].email}</p>
            </div>
          )}

          {/* SOS Button */}
          <button
            onClick={sendSOS}
            disabled={loading || !userData?.emergencyContacts?.[0]}
            className={`
              relative w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 transform
              ${loading 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              }
              text-white focus:outline-none focus:ring-4 focus:ring-red-300
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending SOS...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                </svg>
                Send Emergency Alert
              </div>
            )}
          </button>

          {/* Warning Text */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
              </svg>
              <p className="text-yellow-800 text-xs leading-relaxed">
                <strong>Important:</strong> Only use this feature in genuine emergencies. 
                Your location will be shared with your emergency contact.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Make sure you have location services enabled for accurate positioning
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;