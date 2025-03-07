import { createContext } from "react";

export const UserContext = createContext({
    userInfo : {},
    chatOpen: false,
    setChatOpen: () => {},
    role: "",
    currentAppointment: {},
    setAppointment: () => {},
    setUserInfo: () => {},
    pingUser: () => {},
    getDoctors: () => {},
    getDoctorsByCity: () => {},
    getAppointments: () => {},
    bookAppointment: () => {},
    acceptRequest: () => {},
    declineRequest: () => {},
    joinAppointment: () => {},
    submitPrescriptions: () => {},
    logout: () => {},
    updateAppointmentTime: () => {},
    getDashboardInfo: () => {},
})