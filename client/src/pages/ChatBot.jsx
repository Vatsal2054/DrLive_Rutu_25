import { useContext, useState } from "react";
import {
  Send,
  X,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  Info,
} from "lucide-react";
import AppointmentModal from "../components/Appointment/AppointmentModal";
import { UserContext } from "../context/UserContext";

const MedicalChatModal = () => {
  const { chatOpen, setChatOpen } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "agent",
      text: "Welcome to our Medical Assistant! 👋",
      time: "Yesterday",
    },
    {
      id: 2,
      type: "agent",
      text: "I can help you with medical concerns and provide health-related information. How can I assist you today?",
      time: "Yesterday",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const { bookAppointment } = useContext(UserContext);

  const handleSubmit = async (data) => {
    const res = bookAppointment({
      ...data,
      doctorId: selectedDoctor,
    });
    if (res) {
      setModalOpen(false);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      setIsLoading(true);
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

      try {
        const response = await fetch("http://127.0.0.1:8080/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symptoms: newMessage }),
        });

        const data = await response.json();
        console.log("Response:", data);

        // Handle different response types
        if (data.type === "non_medical") {
          // Handle conversational or general responses
          const conversationResponse = {
            id: messages.length + 2,
            type: "agent",
            text: data.response.response,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, conversationResponse]);
        } else if (data.type === "medical") {
          // Add specialty recommendation
          const specialtyResponse = {
            id: messages.length + 2,
            type: "agent",
            text: `Based on your description, I recommend consulting a ${data.recommended_specialty}. ${data.specialty_description}`,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, specialtyResponse]);

          // Add precautions if available
          if (data.precautions_and_recommendations) {
            const precautionsMessage = {
              id: messages.length + 3,
              type: "agent",
              precautions: data.precautions_and_recommendations,
              urgency: data.urgency,
              time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
            };
            setMessages((prev) => [...prev, precautionsMessage]);
          }

          // Add available doctors if any
          if (data.available_doctors?.length > 0) {
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
          }
        } else if (data.type === "general_advice") {
          // Handle general health advice
          const adviceResponse = {
            id: messages.length + 2,
            type: "agent",
            generalAdvice: data.response,
            time: new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          };
          setMessages((prev) => [...prev, adviceResponse]);
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = {
          id: messages.length + 2,
          type: "agent",
          error: true,
          text: "Sorry, I encountered an error. Please try again.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      setNewMessage("");
      setIsLoading(false);
    }
  };

  const renderGeneralAdvice = (advice) => {
    return (
      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
        <div className="border-b border-blue-200 pb-2">
          <p className="font-semibold text-blue-800">Recommendations</p>
          <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
            {advice.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
        {advice.self_care && (
          <div>
            <p className="font-semibold text-blue-800">Self-Care Measures</p>
            <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
              {advice.self_care.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {advice.when_to_see_doctor && (
          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-700">
              <Info size={16} />
              <p className="font-semibold">When to See a Doctor</p>
            </div>
            <ul className="list-disc list-inside text-sm text-yellow-600 mt-1">
              {advice.when_to_see_doctor.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderPrecautions = (precautions, urgency) => {
    const urgencyColors = {
      immediate: "bg-red-50 border-red-200 text-red-700",
      soon: "bg-yellow-50 border-yellow-200 text-yellow-700",
      not_urgent: "bg-blue-50 border-blue-200 text-blue-700",
      none: "bg-gray-50 border-gray-200 text-gray-700"
    };

    return (
      <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
        {urgency && (
          <div className={`p-2 rounded border ${urgencyColors[urgency]}`}>
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} />
              <span className="font-medium">
                {urgency === "immediate"
                  ? "Seek immediate medical attention"
                  : urgency === "soon"
                    ? "Medical attention recommended soon"
                    : "Non-urgent medical advice"}
              </span>
            </div>
          </div>
        )}

        {precautions.initial_assessment && (
          <div className="border-b border-blue-200 pb-2">
            <p className="font-semibold text-blue-800">Initial Assessment</p>
            <p className="text-sm text-blue-600">
              Severity:{" "}
              <span className="font-medium">
                {precautions.initial_assessment.severity}
              </span>
            </p>
          </div>
        )}

        {precautions.precautions && (
          <div>
            <p className="font-semibold text-blue-800 mb-2">
              Recommended Precautions:
            </p>
            <div className="space-y-2">
              {precautions.precautions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-2 rounded border border-blue-200"
                >
                  <p className="text-sm font-medium text-blue-700">
                    {item.category}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {item.measures.map((measure, i) => (
                      <li key={i}>{measure}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Toggle modal
  const toggleModal = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <>
      {/* Chat Toggle Button - Fixed at bottom right */}
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg 
          hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 
          focus:ring-blue-500 focus:ring-offset-2 z-50"
      >
        <MessageCircle size={24} />
      </button>

      {/* Modal Backdrop */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
          justify-center p-4 z-50"
        >
          {/* Modal Content */}
          <div className="relative w-full max-w-lg animate-fade-in-up">
            {/* Close Button */}
            <button
              onClick={toggleModal}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg 
                hover:bg-gray-100 transition-all duration-200 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 z-50"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Your existing chat component */}
            <div className="w-full bg-white rounded-xl shadow-2xl border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Medical Assistant</h2>
                      <p className="text-blue-100 text-sm">
                        AI-Powered Healthcare Support
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-green-400"></span>
                    <span className="text-sm text-blue-100">Online</span>
                  </div>
                </div>
              </div>
              {/* Chat Messages */}
              <div className="h-[32rem] overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"
                      } animate-fade-in-up`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${message.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                    >
                      {message.text && <p className="text-sm">{message.text}</p>}
                      {message.precautions && renderPrecautions(message.precautions, message.urgency)}
                      {message.generalAdvice && renderGeneralAdvice(message.generalAdvice)}
                      {message.doctors && (
                        <div className="mt-4 space-y-3">
                          {message.doctors.map((doctor) => (
                            <div
                              key={doctor.doctorId}
                              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Doctor card content remains the same */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {doctor.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {doctor.degree}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 text-blue-500">
                                  <Calendar size={16} />
                                  <span className="text-sm">
                                    {doctor.experience}y exp
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <MapPin size={14} />
                                  <span>{doctor.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock size={14} />
                                  <span>Available Today</span>
                                </div>
                              </div>

                              <button
                                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                          py-2 px-4 text-sm font-medium transition-colors duration-200 
                          flex items-center justify-center space-x-2"
                                onClick={() => {
                                  setModalOpen(true);
                                  setSelectedDoctor(doctor.doctorId);
                                }}
                              >
                                <Calendar size={16} />
                                <span>Book Appointment</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{message.time}</span>
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex space-x-2 p-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                  </div>
                )}
              </div>
              {/* Input Area */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Describe your symptoms in detail..."
                    className="flex-1 p-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:bg-white transition-all duration-200"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className={`p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                      transition-all duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <AppointmentModal
        chatOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default MedicalChatModal;
