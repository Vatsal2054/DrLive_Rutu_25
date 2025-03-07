import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext";
import DoctorCards from "../components/Homepage/DoctorCard";

export default function FindDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [doctorsInCity, setDoctorsInCity] = useState([]);
    const [showAll, setShowAll] = useState(true);

    const { getDoctors, getDoctorsByCity } = useContext(UserContext);

    useEffect(() => {
        handleGetDoctors();
    }, []);

    async function handleGetDoctors() {
        let res = await getDoctors();
        console.log(res);

        if (res) {
            setDoctors(res);
        }
        res = await getDoctorsByCity();
        console.log(res);
        if (res) {
            setDoctorsInCity(res.doctors);
        }
    }

    return (
        <div className="p-6">
            <div className="flex flex-row justify-between mb-6">
                <h1 className="text-2xl font-bold">Doctors</h1>
                <div className="flex flex-row">
                    <button
                        className={`${showAll ? "bg-primary text-font-white" : "bg-background-grey text-font-darkGrey"} p-2 rounded-md mr-2`}
                        onClick={() => setShowAll(true)}
                    >
                        All Doctors
                    </button>
                    <button
                        className={`${!showAll ? "bg-primary text-font-white" : "bg-background-grey text-font-darkGrey"} p-2 rounded-md mr-2`}
                        onClick={() => setShowAll(false)}
                    >
                        Doctors in your City
                    </button>
                </div>
            </div>
            <DoctorCards doctors={showAll ? doctors : doctorsInCity} />
        </div>
    )
}