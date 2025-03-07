import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
} from "react-icons/hi";

export default function DoctorHome() {
  const [dashboardInfo, setDashboardInfo] = useState({
    stats: [
      { title: "Today's Appointments", value: 0 },
      { title: "Pending Appointments", value: 0 },
      { title: "Total Patients", value: 0 },
      { title: "Completed Appointments", value: 0 },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo, getDashboardInfo } = useContext(UserContext);

  useEffect(() => {
    handleGetDashboardInfo();
  }, []);

  async function handleGetDashboardInfo() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getDashboardInfo();
      if (res) {
        setDashboardInfo(res);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard information");
    } finally {
      setIsLoading(false);
    }
  }

  const appointments = [
    { time: "09:00 AM", patient: "John Doe", status: "Confirmed" },
    { time: "10:30 AM", patient: "Jane Smith", status: "Pending" },
    { time: "02:00 PM", patient: "Robert Johnson", status: "Confirmed" },
  ];

  const statCards = [
    {
      title: dashboardInfo.stats[0].title,
      value: dashboardInfo.stats[0].value,
      icon: HiOutlineCalendar,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: dashboardInfo.stats[1].title,
      value: dashboardInfo.stats[1].value,
      icon: HiOutlineClock,
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      title: dashboardInfo.stats[2].title,
      value: dashboardInfo.stats[2].value,
      icon: HiOutlineUsers,
      gradient: "from-emerald-400 to-emerald-500",
    },
    {
      title: dashboardInfo.stats[3].title,
      value: dashboardInfo.stats[3].value,
      icon: HiOutlineCheckCircle,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-32 rounded-2xl"></div>
          ))}
        </div>
        <div className="bg-gray-100 h-64 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={handleGetDashboardInfo}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="relative">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome,{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Dr. {userInfo?.firstName || "Doctor"}!
          </span>
        </h1>
        <div className="absolute -top-4 -left-6 w-20 h-20 bg-blue-50 rounded-full filter blur-xl opacity-70 dark:opacity-20"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}
            ></div>
            <div
              className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white mb-4`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 mb-2">
              {card.title}
            </h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Today&apos;s Appointments
        </h2>
        <div className="space-y-2">
          {dashboardInfo.appointments.length > 0 ? (
            dashboardInfo.appointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 text-gray-600 dark:text-gray-300 font-medium">
                    {apt.time}
                  </div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {apt.patient}
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    apt.status === "approved"
                      ? "bg-green text-emerald-100 dark:bg-green-800 dark:text-green-100"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                  }`}
                >
                  {apt.status}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No appointments scheduled for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
