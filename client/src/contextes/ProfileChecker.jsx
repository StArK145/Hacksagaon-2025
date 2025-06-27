import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const ProfileChecker = ({ redirectToProfile = "/complete-profile", fallback = "/" }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [shouldRedirectToProfile, setShouldRedirectToProfile] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(docRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.isProfileComplete) {
            setIsAllowed(true);
          } else {
            setShouldRedirectToProfile(true);
          }
        } else {
          // If user doc doesn't exist, treat as incomplete
          setShouldRedirectToProfile(true);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  if (shouldRedirectToProfile) return <Navigate to={redirectToProfile} replace />;
  if (!isAllowed) return <Navigate to={fallback} replace />;

  return <Outlet />;
};

export default ProfileChecker;
