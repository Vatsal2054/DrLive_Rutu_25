import { useContext, useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  Mic,
  Volume2,
  VolumeX
} from "lucide-react";
import AppointmentModal from "../components/Appointment/AppointmentModal";
import axios from "axios";
import { UserContext } from "../context/UserContext";

// Define the API base URL with a fallback
const API_BASE_URL ="https://drlive-rutu-25.onrender.com";

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased to 15 seconds
  headers: {
    "Content-Type": "application/json",
  }
});

// Add retry interceptor with improved error handling
api.interceptors.response.use(
  response => response, 
  async (error) => {
    const config = error.config;
    
    // Only retry on network errors or 5xx server errors
    if (!config._retry && 
        (error.code === 'ERR_NETWORK' || 
         !error.response || 
         (error.response && error.response.status >= 500))) {
      
      config._retry = true;
      console.log('Retrying request after error:', error.message);
      
      try {
        // Wait for 1.5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 1500));
        return await api(config);
      } catch (retryError) {
        console.error('Retry failed:', retryError.message);
        return Promise.reject(retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

const MedicalChatModal = () => {
  const { chatOpen, setChatOpen } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "agent",
      text: "Welcome to our Medical Assistant! 👋",
      time: "Now",
    },
    {
      id: 2,
      type: "agent",
      text: "Please describe your symptoms in detail, and I'll help you find the right specialist.",
      time: "Now",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState(null);
  
  // Speech related states
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const recognition = useRef(null);
  const synth = window.speechSynthesis ? window.speechSynthesis : null;
  const messagesEndRef = useRef(null);

  const { bookAppointment } = useContext(UserContext);

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a simple health check (if endpoint exists) or just a HEAD request
        await api.get('/health');
        console.log('API connection successful');
        setError(null);
      } catch (err) {
        console.error('API connection failed:', err.message);
        setError('Unable to connect to the medical service. Please try again later.');
      }
    };
    
    checkConnection();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  // Update recognition language when language selection changes
  useEffect(() => {
    if (recognition.current) {
      recognition.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleListening = () => {
    if (!recognition.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (data) => {
    try {
      console.log("Appointment data:", data);

      const res = await bookAppointment({
        ...data,
        doctorId: selectedDoctor,
      });
      
      if (res) {
        setModalOpen(false);
        
        // Add confirmation message
        const confirmationMessage = {
          id: messages.length + 1,
          type: "agent",
          text: `Your appointment has been scheduled successfully! You'll receive a confirmation shortly.`,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages(prev => [...prev, confirmationMessage]);
      }
    } catch (err) {
      console.error("Appointment booking error:", err);
      alert("There was a problem booking your appointment. Please try again.");
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        type: "user",
        text: newMessage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      try {
        console.log("Sending message:", newMessage);
        // Make API call to get recommendations
        const response = await api.post("/recommend", {
          symptoms: newMessage,
          language: selectedLanguage
        });

        const data = response.data;
        console.log("API response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Add system response with recommendations
        const systemResponse = {
          id: messages.length + 2,
          type: "agent",
          text: `Based on your symptoms, I recommend consulting a ${data.recommended_specialty}. They specialize in ${data.specialty_description}.`,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, systemResponse]);

        if (data.precautions_and_recommendations) {
          const precautionsMessage = {
            id: messages.length + 3,
            type: "agent",
            precautions: data.precautions_and_recommendations,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, precautionsMessage]);
        }

        // Add available doctors message
        if (data.available_doctors && data.available_doctors.length > 0) {
          const doctorsMessage = {
            id: messages.length + 4,
            type: "agent",
            text: "Here are the available specialists near you:",
            doctors: data.available_doctors,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, doctorsMessage]);
        } else {
          const noDoctorsMessage = {
            id: messages.length + 4,
            type: "agent",
            text: "I couldn't find any specialists available at the moment. Please try again later or contact our support team for assistance.",
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, noDoctorsMessage]);
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = {
          id: messages.length + 2,
          type: "agent",
          error: true,
          text: `Sorry, I encountered an error: ${error.message || "Please try again."}`,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setError(error.message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Speech synthesis functions
  const toggleAudio = (messageIndex) => {
    if (!synth) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }
    
    if (audioEnabled && currentSpeakingIndex === messageIndex) {
      synth.cancel();
      setAudioEnabled(false);
      setCurrentSpeakingIndex(null);
      setHighlightIndex(0);
    } else {
      // Stop any current speech
      if (audioEnabled) {
        synth.cancel();
      }
      
      // Start new speech
      const message = messages[messageIndex];
      if (message.text) {
        speakText(message.text, messageIndex);
      }
    }
  };

  const speakText = (text, messageIndex) => {
    if (!synth) return;
    
    if (currentSpeakingIndex !== null) {
      synth.cancel();
      setCurrentSpeakingIndex(null);
      setHighlightIndex(0);
      setAudioEnabled(false);
      return;
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = selectedLanguage;
    speech.rate = 1;
    speech.pitch = 1;

    // Word boundary event for highlighting - not all browsers support this
    if ('onboundary' in speech) {
      speech.onboundary = (event) => {
        if (event.name === 'word') {
          setHighlightIndex(prev => prev + 1);
        }
      };
    }

    speech.onend = () => {
      setCurrentSpeakingIndex(null);
      setHighlightIndex(0);
      setAudioEnabled(false);
    };

    setCurrentSpeakingIndex(messageIndex);
    setHighlightIndex(0);
    setAudioEnabled(true);
    synth.speak(speech);
  };

  const createWordSpans = (text) => {
    if (!text) return '';
    
    return text.split(' ').map((word, index) => (
      <span
        key={index}
        className={`tts-word ${highlightIndex === index && currentSpeakingIndex !== null ? 'highlighted' : ''}`}
      >
        {word}{' '}
      </span>
    ));
  };

  const renderPrecautions = (precautions) => {
    if (!precautions) return null;
    
    return (
      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
        {precautions.initial_assessment && (
          <div className="border-b border-blue-200 pb-2">
            <p className="font-semibold text-blue-800">Initial Assessment</p>
            <p className="text-sm text-blue-600">
              Severity:{" "}
              <span className="font-medium">
                {precautions.initial_assessment.severity}
              </span>
            </p>
            {precautions.initial_assessment.immediate_action_required && (
              <p className="text-sm text-red-600 font-bold mt-1">
                <AlertCircle className="inline-block w-4 h-4 mr-1" />
                Immediate action may be required
              </p>
            )}
            {precautions.initial_assessment.seek_emergency && (
              <p className="text-sm text-red-600 font-bold mt-1 bg-red-100 p-1 rounded">
                <AlertCircle className="inline-block w-4 h-4 mr-1" />
                Seek emergency care immediately
              </p>
            )}
          </div>
        )}
        
        {precautions.precautions && precautions.precautions.length > 0 && (
          <div className="border-b border-blue-200 pb-2">
            <p className="font-semibold text-blue-800">Precautions</p>
            <ul className="mt-1 space-y-2">
              {precautions.precautions.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{item.category}</span>
                  <ul className="ml-4 list-disc">
                    {item.measures.map((measure, idx) => (
                      <li key={idx} className="text-blue-700">{measure}</li>
                    ))}
                  </ul>
                  <span className="text-xs inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Priority: {item.priority}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {precautions.lifestyle_recommendations && precautions.lifestyle_recommendations.length > 0 && (
          <div className="border-b border-blue-200 pb-2">
            <p className="font-semibold text-blue-800">Lifestyle Recommendations</p>
            <ul className="mt-1 space-y-2">
              {precautions.lifestyle_recommendations.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{item.area}</span>
                  <ul className="ml-4 list-disc">
                    {item.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-blue-700">{suggestion}</li>
                    ))}
                  </ul>
                  <span className="text-xs inline-block mt-1 px-2 py-0.5 rounded bg-green-100 text-green-800">
                    Duration: {item.duration}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {precautions.home_remedies && precautions.home_remedies.length > 0 && (
          <div className="border-b border-blue-200 pb-2">
            <p className="font-semibold text-blue-800">Home Remedies</p>
            <ul className="mt-1 space-y-2">
              {precautions.home_remedies.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{item.remedy}</span>
                  <p className="text-blue-700 ml-4">{item.instructions}</p>
                  {item.caution && (
                    <p className="text-red-500 text-xs mt-1">
                      <AlertCircle className="inline-block w-3 h-3 mr-1" />
                      {item.caution}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {precautions.when_to_seek_emergency && precautions.when_to_seek_emergency.length > 0 && (
          <div className="bg-red-50 p-2 rounded-lg border border-red-200">
            <p className="font-semibold text-red-800 flex items-center">
              <AlertCircle className="inline-block w-4 h-4 mr-1" />
              When to Seek Emergency Care
            </p>
            <ul className="mt-1 space-y-1 ml-5 list-disc">
              {precautions.when_to_seek_emergency.map((item, index) => (
                <li key={index} className="text-sm text-red-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDoctorCard = (doctor, index) => {
    return (
      <div 
        key={index}
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
          selectedDoctor === doctor.doctorId 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
        }`}
        onClick={() => setSelectedDoctor(doctor.doctorId)}
      >
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <Stethoscope className="text-blue-600 w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.degree}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>{doctor.experience} years experience</span>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{doctor.location}</span>
            </div>
          </div>
        </div>
        {selectedDoctor === doctor.doctorId && (
          <div className="mt-2 text-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
            >
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Book Appointment
            </button>
          </div>
        )}
      </div>
    );
  };

  // Language selection options
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "zh-CN", name: "Chinese" },
    { code: "ja-JP", name: "Japanese" },
    { code: "hi-IN", name: "Hindi" },
  ];

  return (
    <>
      {/* Main Chat Modal */}
      <div
        className={`fixed bottom-4 right-4 w-96 sm:w-96 rounded-xl bg-white shadow-xl transition-all duration-300 z-50 flex flex-col ${
          chatOpen
            ? "h-96 sm:h-[550px] opacity-100"
            : "h-0 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-semibold">Medical Assistant</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <select
              className="text-xs bg-blue-500 border-none rounded p-1 text-white"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-3 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.type === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : message.error
                    ? "bg-red-100 text-red-800"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs">
                    {message.type === "user" ? "You" : "Medical Assistant"}
                  </span>
                  <div className="flex items-center space-x-1">
                    {message.type === "agent" && message.text && (
                      <button
                        onClick={() => toggleAudio(index)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {audioEnabled && currentSpeakingIndex === index ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    <span className="text-xs opacity-70">{message.time}</span>
                  </div>
                </div>
                
                {message.text && (
                  <div className={currentSpeakingIndex === index ? "tts-active" : ""}>
                    {audioEnabled && currentSpeakingIndex === index
                      ? createWordSpans(message.text)
                      : message.text}
                  </div>
                )}
                
                {message.precautions && renderPrecautions(message.precautions)}
                
                {message.doctors && (
                  <div className="mt-3 space-y-2">
                    {message.doctors.map((doctor, idx) => renderDoctorCard(doctor, idx))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex space-x-2 justify-center items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-0"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Describe your symptoms..."
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <button
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              className={`ml-2 p-2 rounded-full ${
                isLoading || !newMessage.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleSend}
              disabled={isLoading || !newMessage.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            This is a medical assistant for informational purposes only. Always consult a healthcare professional for medical advice.
          </div>
        </div>
      </div>

      {/* Chat Trigger Button (when closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 z-50 flex items-center space-x-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium">Chat with Medical Assistant</span>
        </button>
      )}

      {/* Appointment Modal */}
      {modalOpen && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Global Styles for TTS highlighting */}
      <style >{`
        .tts-word.highlighted {
          background-color: rgba(59, 130, 246, 0.2);
          border-radius: 2px;
        }
        
        .tts-active {
          line-height: 1.8;
        }
      `}</style>
    </>
  );
};

export default MedicalChatModal;