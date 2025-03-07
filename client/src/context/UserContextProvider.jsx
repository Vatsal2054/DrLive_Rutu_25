import { useState } from "react";
import { UserContext } from "./UserContext";
import getApi from "../helpers/API/getApi";
import postApi from "../helpers/API/postApi";
import putApi from "../helpers/API/putApi";
import toast from "react-hot-toast";

export default function UserContextProvider({ children }) {
    const [userInfo, setUserInfo] = useState({});
    const [currentAppointment, setCurrentAppointment] = useState({});
    const [chatOpen, setChatOpen] = useState(false);

    
    function setUserData(data){
        setUserInfo(data);
    }

    async function handlePingUser(){
        console.log("Pinging User...")
        const res = await getApi("/auth/ping");
        console.log(res);
        if(res.status === 200){
            console.log("Authorized User");
            setUserInfo(res.data.data);
            return true;
        }
        return false;
    }

    async function handleGetDoctors(){
        const res = await getApi("/doctor/getDoctor");
        console.log(res);
        if(res.status === 200){
            console.log("Doctors fetched successfully");
            return res.data.data;
        }
        return false;
    }
    
    async function handleGetDoctorsByCity(){
        const res = await getApi("/doctor/getDoctorBycity");
        console.log(res);
        if(res.status === 200){
            console.log("Doctors fetched successfully");
            return res.data.data;
        }
        return false;
    }

    async function handleGetPatientAppointments(){
        const res = await getApi("/appointment/");
        console.log(res);
        if(res.status === 200){
            console.log("Appointments fetched successfully");
            return res.data.data;
        }
        return false;
    }

    async function handleGetDoctorAppointments(){
        const res = await getApi("/appointment/appointments");
        console.log(res);
        if(res.status === 200){
            console.log("Appointments fetched successfully");
            return res.data.data;
        }
        return false;
    }

    async function handleGetAppointments(){
        let res;
        if(userInfo.role === "doctor"){
            res = await handleGetDoctorAppointments();
        } else {
            res = await handleGetPatientAppointments();
        }
        console.log(res);
        if(res){
            console.log("Appointments fetched successfully");
            return res;
        }
        return false;
    }

    async function handleBookAppointment(data){
        const res = await postApi("/appointment/", data);
        console.log(res);
        if(res.status === 200){
            toast.success("Appointment booked successfully");
            console.log("Appointment booked successfully");
            return true;
        }
        return false
    }

    async function handleAcceptAppointment(appointmentId){
        const res = await putApi(`/appointment/approve/${appointmentId}`);
        console.log(res);
        if(res.status === 200){
            toast.success("Appointment accepted successfully");
            console.log("Appointment accepted successfully");
            return true;
        }
        return false;
    }

    async function handleDeclineAppointment(appointmentId){
        const res = await putApi(`/appointment/decline/${appointmentId}`);
        console.log(res);
        if(res.status === 200){
            toast.success("Appointment declined successfully");
            console.log("Appointment declined successfully");
            return true;
        }
        return false;
    }

    async function handleJoinAppointment(appointmentId){
        const res = await getApi(`/appointment/join/${appointmentId}`);
        console.log(res);
        if(res.status === 200){
            // toast.success("Appointment joined successfully");
            console.log("Appointment joined successfully");
            return res.data.data;
        }
        return false;
    }

    async function handleSubmitPrescriptions(data){
        const res = await postApi("/prescription/", data);
        console.log(res);
        if(res.status === 200){
            toast.success("Prescriptions submitted successfully");
            console.log("Prescriptions submitted successfully");
            return res.data.data;
        }
        return false;
    }

    async function handleLogout(){
        const res = await getApi("/auth/logout");
        console.log(res);
        if(res.status === 200){
            console.log("Logged out successfully");
            setUserInfo({});
            return true;
        }
        return false;
    }

    async function handleUpdateAppointmentTime(data){
        console.log(data._id);
        
        const res = await putApi(`/appointment/${data._id}`, data);
        console.log(res);
        if(res.status === 200){
            toast.success("Appointment time updated successfully");
            console.log("Appointment time updated successfully");
            return true;
        }
    }

    async function handleGetDashboardInfo(){
        if(userInfo.role === "patient"){
            return;
        }
        const res = await getApi("/doctor/");
        console.log(res);
        if(res.status === 200){
            console.log("Dashboard info fetched successfully");
            return res.data.data;
        }
        return false
    }

    const ctxValue = {
        userInfo: userInfo,
        setUserInfo: setUserData,
        chatOpen: chatOpen,
        setChatOpen: setChatOpen,
        role: userInfo.role,
        currentAppointment: currentAppointment,
        setAppointment: setCurrentAppointment,
        pingUser: handlePingUser,
        getDoctors: handleGetDoctors,
        getDoctorsByCity: handleGetDoctorsByCity,
        getAppointments: handleGetAppointments,
        bookAppointment: handleBookAppointment,
        acceptRequest: handleAcceptAppointment,
        declineRequest: handleDeclineAppointment,
        joinAppointment: handleJoinAppointment,
        submitPrescriptions: handleSubmitPrescriptions,
        logout: handleLogout,
        updateAppointmentTime: handleUpdateAppointmentTime,
        getDashboardInfo: handleGetDashboardInfo
    }

    return (
        <UserContext.Provider value={ctxValue}>
            {children}
        </UserContext.Provider>
    )
}