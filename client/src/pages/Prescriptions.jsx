import { useEffect, useState } from "react";
import getApi from "../helpers/API/getApi";
import PrescriptionCard from "../components/Homepage/PrescriptionCards";

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        handleFetchPrescriptions();
    }, []);

    async function handleFetchPrescriptions() {
        const res = await getApi("/prescription/");
        if (res.status === 200) {
            console.log(res);
            console.log("Prescriptions fetched successfully");
            setPrescriptions(res.data.data);
        }
    }

    return (
        <>  
            <div className="p-6 text-2xl font-[700]">
                Prescriptions
            </div>
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                {prescriptions.map((prescription) => (
                    <PrescriptionCard
                        key={prescription._id}
                        prescription={prescription}
                    />
                ))}
            </div>
        </>
    )
}