import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Navigation, Clock, Phone } from 'lucide-react';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearbyHospitalsOSM = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          setError("Location access denied.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      if (!location) return;

      const { lat, lon } = location;
      const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json];(
        node["amenity"="hospital"](around:20000,${lat},${lon});
        way["amenity"="hospital"](around:20000,${lat},${lon});
        relation["amenity"="hospital"](around:20000,${lat},${lon});
      );out center;`;

      try {
        const res = await fetch(overpassURL);
        const data = await res.json();

        const elements = data.elements
          .map((el) => {
            const name = el.tags?.name || "Unnamed Hospital";
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            return { name, lat, lon };
          })
          .filter((h) => h.lat && h.lon);

        const destinations = elements.map((h) => `${h.lat},${h.lon}`).join('|');

        let enriched = [];

        try {
          const proxyURL = `http://localhost:5000/api/distance?origins=${lat},${lon}&destinations=${destinations}`;
          const distRes = await fetch(proxyURL);
          const distData = await distRes.json();

          enriched = elements.map((hospital, index) => {
            const distanceObj = distData.rows[0]?.elements[index];
            let distanceKm = haversineDistance(lat, lon, hospital.lat, hospital.lon);

            if (distanceObj?.status === "OK") {
              distanceKm = distanceObj.distance.value / 1000;
            }

            return { ...hospital, distance: distanceKm };
          });
        } catch (err) {
          console.warn("Distance API failed, using fallback.", err);
          enriched = elements.map((hospital) => ({
            ...hospital,
            distance: haversineDistance(lat, lon, hospital.lat, hospital.lon),
          }));
        }

        const filtered = enriched
          .filter((h) => h.distance <= 20)
          .sort((a, b) => a.distance - b.distance);

        setHospitals(filtered);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch hospitals or distances.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [location]);

  // --- UI Rendering (unchanged from your version)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nearby Hospitals</h1>
              <p className="text-gray-600">Within 20 km of your location</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin h-12 w-12 border-b-2 border-blue-600 mb-4 rounded-full"></div>
            <p className="text-gray-600">Loading nearby hospitals...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hospitals found</h3>
            <p className="text-gray-500">No hospitals were found within 20 km of your location.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center text-gray-600 mb-6">
              <Navigation className="w-4 h-4 mr-2" />
              <span>Found {hospitals.length} hospitals nearby</span>
            </div>

            {hospitals.map((hospital, index) => (
              <div
                key={index}
                className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="w-6 h-6 text-red-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {hospital.distance.toFixed(2)} km away
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <a
                        href={`https://www.google.com/maps?q=${hospital.lat},${hospital.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View on Map
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                      <span className="text-green-700 text-sm font-medium">Open 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white shadow-sm border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Emergency: 108</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyHospitalsOSM;
