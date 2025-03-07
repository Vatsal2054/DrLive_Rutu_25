import { useEffect, useState, useContext, useCallback } from "react";
import { MapPin, Clock, Star, Navigation, Phone, Globe, Info, RefreshCw } from "lucide-react";
import Button from "../components/UI/Buttons";
import Container from "../components/UI/Container";
import { useNavigate } from "react-router";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useParams } from "react-router";
import apiInfo from "../helpers/API/apiInfo";

// API service for pharmacy-related requests
const pharmacyService = {
  getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  },

  async getNearbyPharmacies(lat, lng, radius) {
    try {
      const response = await axios.get(
        `${apiInfo.URL}/pharmacy/pharmacies`,
        {
          ...this.getAuthHeader(),
          params: { lat, lng, radius }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      throw error;
    }
  },

  async getPharmacyDetails(placeId) {
    try {
      const response = await axios.get(
        `${apiInfo.URL}/pharmacy/pharmacies/${placeId}`,
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pharmacy details:", error);
      throw error;
    }
  }
};

const PharmacyPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 22.3072, // Default coordinates for Vadodara
    lng: 73.1812
  });
  const [locationLoaded, setLocationLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);

  // Get user's location only once when component mounts
  useEffect(() => {
    // Check if user is authenticated
    // if (!isAuthenticated) {
    //   navigate("/login");
    //   return;
    // }
    
    if (navigator.geolocation && !locationLoaded) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoaded(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Using default location instead.");
          setLocationLoaded(true); // Mark as loaded even with error
        }
      );
    } else {
      setLocationLoaded(true); // Mark as loaded if geolocation not available
    }
  }, [isAuthenticated, navigate]);

  // Separate effect to fetch pharmacies only when location is ready
  useEffect(() => {
    if (locationLoaded) {
      fetchPharmacies();
    }
  }, [locationLoaded]);

  const fetchPharmacies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await pharmacyService.getNearbyPharmacies(
        currentLocation.lat,
        currentLocation.lng,
        5000 // 5km radius
      );
      
      if (data.success && data.results) {
        setPharmacies(data.results);
      } else {
        setError("Failed to fetch pharmacy data");
        toast.error("Could not load pharmacy data");
      }
    } catch (error) {
      setError("An error occurred while fetching pharmacy data");
      toast.error("Error loading pharmacy data");
    } finally {
      setLoading(false);
    }
  }, [currentLocation.lat, currentLocation.lng]);

  const getDirections = (lat, lng, placeId) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${placeId}`,
      "_blank"
    );
  };

  const getStatusColor = (status, isOpen) => {
    if (status === "OPERATIONAL" && isOpen) {
      return "text-green-500";
    } else if (status === "CLOSED_TEMPORARILY") {
      return "text-orange-500";
    } else {
      return "text-red-500";
    }
  };

  const getStatusText = (status, isOpen) => {
    if (status === "OPERATIONAL" && isOpen) {
      return "Open Now";
    } else if (status === "CLOSED_TEMPORARILY") {
      return "Temporarily Closed";
    } else if (status === "OPERATIONAL" && !isOpen) {
      return "Closed Now";
    } else {
      return "Closed";
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-yellow-500";
    return "text-gray-500";
  };

  const handleViewDetails = async (placeId) => {
    try {
      const data = await pharmacyService.getPharmacyDetails(placeId);
      if (data.success && data.result) {
        navigate(`/pharmacy/${placeId}`, { state: { pharmacy: data.result } });
      } else {
        toast.error("Could not load pharmacy details");
      }
    } catch (error) {
      toast.error("Error loading pharmacy details");
    }
  };

  if (loading && !pharmacies.length) {
    return (
      <div className="p-6 flex flex-col justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Loading nearby pharmacies...</div>
      </div>
    );
  }

  if (error && !pharmacies.length) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <Info className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">{error}</div>
        </div>
        <Button type="PRIMARY" onClick={fetchPharmacies}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Nearby Pharmacies</h1>
          <p className="text-gray-500 mt-1">Finding healthcare services near you</p>
        </div>
        <Button 
          type="SECONDARY" 
          onClick={() => fetchPharmacies()}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      {pharmacies.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
          <Info className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">No pharmacies found nearby</p>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            We couldn't find any pharmacies in your current area. 
            Try expanding your search radius or check your location settings.
          </p>
          <Button 
            type="PRIMARY" 
            extraClasses="mt-6"
            onClick={() => fetchPharmacies()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <Container
              key={pharmacy.id}
              classes="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{pharmacy.name}</h2>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      pharmacy.business_status,
                      pharmacy.opening_hours?.open_now
                    )} bg-opacity-10 bg-current font-medium`}
                  >
                    {getStatusText(pharmacy.business_status, pharmacy.opening_hours?.open_now)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                  {pharmacy.types[0].replace(/_/g, " ").charAt(0).toUpperCase() + 
                   pharmacy.types[0].replace(/_/g, " ").slice(1)}
                  {pharmacy.rating > 0 && (
                    <span className={`ml-2 ${getRatingColor(pharmacy.rating)} flex items-center`}>
                      <Star className="w-4 h-4 mr-1 fill-current" /> 
                      {pharmacy.rating.toFixed(1)}
                      <span className="text-gray-500 ml-1">({pharmacy.user_ratings_total})</span>
                    </span>
                  )}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-gray-500" />
                    <span className="line-clamp-2">{pharmacy.vicinity}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span>
                      {pharmacy.business_status === "OPERATIONAL" 
                        ? (pharmacy.opening_hours?.open_now ? "Currently Open" : "Currently Closed") 
                        : "Temporarily Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 grid grid-cols-2 gap-3">
                <Button
                  type="PRIMARY"
                  onClick={() => getDirections(
                    pharmacy.location.lat,
                    pharmacy.location.lng,
                    pharmacy.place_id
                  )}
                  disabled={pharmacy.business_status !== "OPERATIONAL"}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
                <Button
                  type="SECONDARY"
                  onClick={() => handleViewDetails(pharmacy.place_id)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </div>
            </Container>
          ))}
        </div>
      )}
    </div>
  );
};

// Pharmacy detail page component
const PharmacyDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId } = useParams();
  const [pharmacy, setPharmacy] = useState(location.state?.pharmacy || null);
  const [loading, setLoading] = useState(!pharmacy);

  useEffect(() => {
    if (!pharmacy && placeId) {
      loadPharmacyDetails();
    }
  }, [placeId, pharmacy]);

  const loadPharmacyDetails = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getPharmacyDetails(placeId);
      if (data.success && data.result) {
        setPharmacy(data.result);
      } else {
        toast.error("Could not load pharmacy details");
        navigate("/pharmacies");
      }
    } catch (error) {
      toast.error("Error loading pharmacy details");
      navigate("/pharmacies");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, isOpen) => {
    let colorClass = "bg-gray-100 text-gray-600";
    let text = "Unknown Status";
    
    if (status === "OPERATIONAL" && isOpen) {
      colorClass = "bg-green-100 text-green-700";
      text = "Open Now";
    } else if (status === "CLOSED_TEMPORARILY") {
      colorClass = "bg-orange-100 text-orange-700";
      text = "Temporarily Closed";
    } else if (status === "OPERATIONAL" && !isOpen) {
      colorClass = "bg-red-100 text-red-700";
      text = "Closed Now";
    } else if (status === "CLOSED_PERMANENTLY") {
      colorClass = "bg-red-100 text-red-700";
      text = "Permanently Closed";
    }
    
    return (
      <span className={`${colorClass} px-3 py-1 rounded-full text-sm font-medium`}>
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-medium text-gray-700">Loading pharmacy details...</div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <Info className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Pharmacy information not found</div>
        </div>
        <Button type="PRIMARY" onClick={() => navigate("/pharmacies")}>
          Back to Pharmacies
        </Button>
      </div>
    );
  }

  return (
    <Container classes="max-w-4xl mx-auto my-8 p-0 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-6">
        <Button 
          type="SECONDARY" 
          onClick={() => navigate("/pharmacies")} 
          extraClasses="mb-4"
        >
          &larr; Back to Pharmacies
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {pharmacy.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(
                pharmacy.business_status, 
                pharmacy.opening_hours?.open_now
              )}
              
              {pharmacy.rating && (
                <div className="flex items-center text-gray-600">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.round(pharmacy.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2">
                    {pharmacy.rating.toFixed(1)}
                    <span className="text-gray-500 ml-1">({pharmacy.user_ratings_total || 0})</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            type="PRIMARY" 
            onClick={() => getDirections(
              pharmacy.geometry.location.lat,
              pharmacy.geometry.location.lng,
              pharmacy.place_id
            )}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Contact Information
            </h2>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {pharmacy.formatted_address || pharmacy.vicinity}
                </span>
              </div>
              
              {pharmacy.formatted_phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a 
                    href={`tel:${pharmacy.formatted_phone_number}`}
                    className="text-blue-600 hover:underline"
                  >
                    {pharmacy.formatted_phone_number}
                  </a>
                </div>
              )}
              
              {pharmacy.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a 
                    href={pharmacy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-xs"
                  >
                    {pharmacy.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Business Hours
            </h2>
            {pharmacy.opening_hours?.weekday_text ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <ul className="space-y-2 divide-y divide-gray-200 dark:divide-gray-600">
                  {pharmacy.opening_hours.weekday_text.map((day, index) => {
                    const [dayName, hours] = day.split(': ');
                    const isToday = new Date().getDay() === (index + 1) % 7;
                    
                    return (
                      <li 
                        key={index} 
                        className={`flex justify-between py-2 ${isToday ? 'font-medium' : ''}`}
                      >
                        <span className={isToday ? 'text-blue-600' : ''}>
                          {dayName}
                          {isToday && ' (Today)'}
                        </span>
                        <span>{hours}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-500">
                Hours information not available
              </div>
            )}
          </div>
        </div>
        
        {pharmacy.reviews && pharmacy.reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-blue-500" />
              Customer Reviews
            </h2>
            <div className="space-y-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {pharmacy.reviews.slice(0, 3).map((review, index) => (
                <div 
                  key={index} 
                  className={`${index < pharmacy.reviews.length - 1 ? 'border-b border-gray-200 dark:border-gray-600 pb-4' : ''}`}
                >
                  <div className="flex items-center mb-3">
                    <img 
                      src={review.profile_photo_url || "/api/placeholder/36/36"} 
                      alt={review.author_name} 
                      className="w-9 h-9 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{review.author_name}</p>
                      <div className="flex items-center">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(review.time * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{review.text}</p>
                </div>
              ))}
              
              {pharmacy.reviews.length > 3 && (
                <div className="text-center pt-2">
                  <a 
                    href={pharmacy.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    View all {pharmacy.reviews.length} reviews on Google
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export { PharmacyPage, PharmacyDetailPage };