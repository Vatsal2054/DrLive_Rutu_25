import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PatientSignUp from "./pages/PatientSignUp";
import DoctorSignUp from "./pages/DoctorSignUp";
import SignUp from "./pages/Signup";
import Appointment from "./pages/Appointment";
import FindDoctors from "./pages/FindDoctors";
import Chat from "./pages/ChatBot";
import Profile from "./pages/Profile";
import MeetingRoom from "./pages/MeetingRoom";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Prescriptions from "./pages/Prescriptions";
import PastAppointments from "./pages/PastAppointments";
import { PharmacyDetailPage, PharmacyPage } from "./pages/PharmacyPage";
import AddReport from "./pages/AddReports";
import GetReports from "./pages/GetReports";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointment />} />
            <Route path="/find-doctor" element={<FindDoctors />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/report" element={<Report />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointment-history" element={<PastAppointments />} />
            <Route path="/pharmacy-near-me" element={<PharmacyPage />} />
            <Route path="/pharmacy-near-me/:placeId" element={<PharmacyDetailPage />} />
            <Route path="/upload-report" element={<AddReport />} />
            <Route path="/GetReports" element={<GetReports />} />
            {/* <Route path="/" /> */}
          </Route>
          <Route path="/meeting/:roomId" element={<MeetingRoom />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/patient" element={<PatientSignUp />} />
          <Route path="/signup/doctor" element={<DoctorSignUp />} />
          
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
