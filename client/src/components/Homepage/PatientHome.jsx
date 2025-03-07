import { useNavigate } from "react-router";
import {
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineUserAdd,
} from "react-icons/hi";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function PatientHome() {
  const navigate = useNavigate();
  const { userInfo, setChatOpen } = useContext(UserContext);

  const services = [
    {
      title: "View Prescriptions",
      description: "Access all your medical prescriptions",
      path: "/prescriptions",
      icon: <HiOutlineClipboardList className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "View Appointments",
      description: "Check your upcoming and past appointments",
      path: "/appointments",
      icon: <HiOutlineCalendar className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Chat with Bot",
      description: "Get quick answers to your health queries",
      path: "/",
      icon: <HiOutlineChatAlt2 className="w-8 h-8 text-green" />,
    },
    {
      title: "Book Appointment",
      description: "Schedule a consultation with a doctor",
      path: "/find-doctor",
      icon: <HiOutlineUserAdd className="w-8 h-8 text-orange-500" />,
    },
  ];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="relative">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome,{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {userInfo.firstName || "Patient"}!
          </span>
        </h1>
        <div className="absolute -top-4 -left-6 w-20 h-20 bg-blue-50 rounded-full filter blur-xl opacity-70 dark:opacity-20"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setChatOpen(true)}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-semibold mb-2">Start ChatBot</h3>
            <p className="opacity-90">
              Get instant answers to your health questions
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
        </button>
        <button
          onClick={() => navigate("/report")}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-green to-green text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-semibold mb-2">Analyze Report</h3>
            <p className="opacity-90">Schedule your next consultation</p>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <div
            key={service.title}
            onClick={() => {
              service.title === "Chat with Bot" && setChatOpen(true) 
              navigate(service.path)
            }}
            className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {service.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Health Quote */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100 dark:bg-blue-900 rounded-full opacity-20"></div>
        <blockquote className="relative z-10 text-[1.2rem] text-center text-background-darkLight2 dark:text-gray-200 font-medium">
          &quot;The greatest wealth is health. Taking care of your health today
          gives you better hope for tomorrow.&quot;
        </blockquote>
      </div>
    </div>
  );
}
