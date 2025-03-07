import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import PatientHome from "../components/Homepage/PatientHome";
import DoctorHome from "../components/Homepage/DoctorHome";

export default function Dashboard(){
    const { role } = useContext(UserContext);

    if(role === "patient"){
        return <PatientHome />;
    } else if (role === "doctor"){
        return <DoctorHome />;
    }
}