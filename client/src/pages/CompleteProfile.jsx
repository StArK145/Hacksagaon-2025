import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  FaUser,
  FaWeight,
  FaRulerVertical,
  FaHeartbeat,
  FaPhone,
  FaPlus,
  FaTrash,
  FaCalculator,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";

export const CompleteProfile = () => {
  // Initialize with default arrays to prevent undefined errors
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    phone: "",
    countryCode: "+91", // default India
    diseases: [],
    emergencyContacts: [],
  });

  const [newDisease, setNewDisease] = useState({
    type: "current",
    name: "",
    diagnosisDate: "",
  });
  const [newEmergencyContact, setNewEmergencyContact] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    countryCode: "+91", // default India
  });

  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigateTO = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              name: data.name || "",
              age: data.age || "",
              height: data.height || "",
              weight: data.weight || "",
              phone: data.phone || "",
              countryCode: data.countryCode || "",
              diseases: data.diseases || [],
              emergencyContacts: data.emergencyContacts || [],
            });

            // Set profile completion status
            setIsProfileComplete(data.isProfileComplete || false);
          }
        } catch (error) {
          console.error("Error fetching profile: ", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [auth]);

  useEffect(() => {
    if (profile.height && profile.weight) {
      calculateBmi();
    }
  }, [profile.height, profile.weight]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiseaseChange = (e) => {
    const { name, value } = e.target;
    setNewDisease((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setNewEmergencyContact((prev) => ({ ...prev, [name]: value }));
  };

  const addDisease = () => {
    if (newDisease.name) {
      setProfile((prev) => ({
        ...prev,
        diseases: [...(prev.diseases || []), newDisease],
      }));
      setNewDisease({ type: "current", name: "", diagnosisDate: "" });
    }
  };

  const removeDisease = (index) => {
    setProfile((prev) => ({
      ...prev,
      diseases: (prev.diseases || []).filter((_, i) => i !== index),
    }));
  };

  const addEmergencyContact = () => {
    if (newEmergencyContact.name && newEmergencyContact.phone) {
      const currentContacts = profile.emergencyContacts || [];

      if (currentContacts.length < 2) {
        setProfile((prev) => ({
          ...prev,
          emergencyContacts: [...currentContacts, newEmergencyContact],
        }));
        setNewEmergencyContact({
          name: "",
          phone: "",
          relationship: "",
          email: "",
        });
      }
    }
  };

  const removeEmergencyContact = (index) => {
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: (prev.emergencyContacts || []).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const calculateBmi = () => {
    const heightInMeters = profile.height / 100;
    const bmiValue = (
      profile.weight /
      (heightInMeters * heightInMeters)
    ).toFixed(1);
    setBmi(bmiValue);

    if (bmiValue < 18.5) {
      setBmiCategory("Underweight");
    } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
      setBmiCategory("Normal weight");
    } else if (bmiValue >= 25 && bmiValue <= 29.9) {
      setBmiCategory("Overweight");
    } else {
      setBmiCategory("Obesity");
    }
  };

  const saveProfile = async () => {
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);

      // Save profile data AND set isProfileComplete to true
      await setDoc(
        docRef,
        {
          ...profile,
          isProfileComplete: true,
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      setSuccess(true);
      setIsProfileComplete(true);
      navigateTO("/dashboard");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile: ", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 md:p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <FaUser className="mr-3" /> Health Profile
              </h1>
              <p className="mt-2 opacity-90">
                {isProfileComplete
                  ? "Your health profile is complete! You can update it anytime."
                  : "Complete your health profile to get personalized insights"}
              </p>
            </div>

            {isProfileComplete && (
              <div className="bg-teal-500/20 px-3 py-1 rounded-full flex items-center">
                <FaCheckCircle className="mr-2" />
                <span className="text-sm">Profile Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUser className="mr-2 text-teal-600" /> Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        value={profile.countryCode}
                        onChange={handleInputChange}
                        className="px-2 py-2 border rounded-l-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+92">🇵🇰 +92</option>
                        {/* Add more as needed */}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-t border-b border-r rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Calculator */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCalculator className="mr-2 text-teal-600" /> BMI Calculator
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className=" text-gray-700 mb-2 flex items-center">
                      <FaRulerVertical className="mr-2" /> Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={profile.height}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className=" text-gray-700 mb-2 flex items-center">
                      <FaWeight className="mr-2" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={profile.weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="75"
                    />
                  </div>
                </div>

                {bmi && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Your BMI</p>
                      <p className="text-3xl font-bold text-teal-600">{bmi}</p>
                      <p
                        className={`mt-1 font-medium ${
                          bmiCategory === "Underweight"
                            ? "text-blue-500"
                            : bmiCategory === "Normal weight"
                            ? "text-green-500"
                            : bmiCategory === "Overweight"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {bmiCategory}
                      </p>
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            bmiCategory === "Underweight"
                              ? "bg-blue-500 w-1/4"
                              : bmiCategory === "Normal weight"
                              ? "bg-green-500 w-2/4"
                              : bmiCategory === "Overweight"
                              ? "bg-yellow-500 w-3/4"
                              : "bg-red-500 w-full"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Disease History */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaHeartbeat className="mr-2 text-teal-600" /> Health Conditions
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Condition Type
                  </label>
                  <select
                    name="type"
                    value={newDisease.type}
                    onChange={handleDiseaseChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="current">Current Condition</option>
                    <option value="past">Past Condition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Condition Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newDisease.name}
                    onChange={handleDiseaseChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Diabetes, Hypertension"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    {newDisease.type === "current"
                      ? "Diagnosis Date"
                      : "Recovery Date"}
                  </label>
                  <input
                    type="date"
                    name="diagnosisDate"
                    value={newDisease.diagnosisDate}
                    onChange={handleDiseaseChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                onClick={addDisease}
                className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center"
              >
                <FaPlus className="mr-2" /> Add Condition
              </button>

              {/* Disease List */}
              {profile.diseases && profile.diseases.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Your Health Conditions:
                  </h3>
                  <div className="space-y-3">
                    {profile.diseases.map((disease, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          disease.type === "current"
                            ? "bg-red-50 border-l-4 border-red-500"
                            : "bg-blue-50 border-l-4 border-blue-500"
                        }`}
                      >
                        <div>
                          <span className="font-medium">{disease.name}</span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              disease.type === "current"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {disease.type === "current" ? "Current" : "Past"}
                          </span>
                          {disease.diagnosisDate && (
                            <p className="text-sm text-gray-600 mt-1">
                              {disease.type === "current"
                                ? "Diagnosed: "
                                : "Recovered: "}
                              {disease.diagnosisDate}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeDisease(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPhone className="mr-2 text-teal-600" /> Emergency Contacts
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Max 2)
              </span>
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              {(!profile.emergencyContacts ||
                profile.emergencyContacts.length < 2) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newEmergencyContact.name}
                      onChange={handleEmergencyContactChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        value={newEmergencyContact.countryCode}
                        onChange={handleEmergencyContactChange}
                        className="px-2 py-2 border rounded-l-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+880">🇧🇩 +880</option>
                        <option value="+92">🇵🇰 +92</option>
                        {/* Add more as needed */}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={newEmergencyContact.phone}
                        onChange={handleEmergencyContactChange}
                        className="w-full px-4 py-2 border-t border-b border-r rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newEmergencyContact.email}
                      onChange={handleEmergencyContactChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="relationship"
                      value={newEmergencyContact.relationship}
                      onChange={handleEmergencyContactChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Spouse, Parent, etc."
                    />
                  </div>
                </div>
              )}

              {!profile.emergencyContacts ||
              profile.emergencyContacts.length < 2 ? (
                <button
                  onClick={addEmergencyContact}
                  className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Contact
                </button>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  You've reached the maximum of 2 emergency contacts
                </p>
              )}

              {/* Contact List */}
              {profile.emergencyContacts &&
                profile.emergencyContacts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-700 mb-3">
                      Your Emergency Contacts:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.emergencyContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg border border-teal-100 flex justify-between items-start"
                        >
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {contact.name}
                            </h4>
                            <p className="text-gray-600 mt-1">
                              {contact.countryCode} {contact.phone}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                              Email: {contact.email}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              Relationship: {contact.relationship}
                            </p>
                          </div>
                          <button
                            onClick={() => removeEmergencyContact(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg flex items-center shadow-md transition duration-300"
            >
              {saving ? (
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
                  {isProfileComplete ? "Updating..." : "Completing Profile..."}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isProfileComplete ? "Update Profile" : "Complete Profile"}
                </>
              )}
            </button>
          </div>

          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
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
              {isProfileComplete
                ? "Profile updated successfully!"
                : "Profile completed successfully!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
