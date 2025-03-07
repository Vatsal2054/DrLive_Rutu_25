import { useState } from "react";
import Button from "../UI/Buttons";

const Prescription = ({ prescriptions, addPrescription, isDoctor }) => {
    const [medicineName, setMedicineName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [frequency, setFrequency] = useState([]);
    const [timing, setTiming] = useState("Before meal");

    const handleFrequencyChange = (value) => {
        setFrequency(prev =>
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : prev.length < 3 ? [...prev, value] : prev
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (medicineName && quantity && frequency.length > 0) {
            addPrescription({ medicineName, quantity, frequency, timing });
            setMedicineName("");
            setQuantity("");
            setFrequency([]);
            setTiming("Before meal");
        }
    };

    return (
        <div className="p-4 h-full border rounded-lg shadow-lg bg-white flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-semibold mb-2">Prescriptions</h2>
                <ul className="mb-4 text-sm">
                    {prescriptions.map((prescription, index) => (
                        <li key={index} className="border-b py-2">
                            <strong>{prescription.medicineName}</strong> - {prescription.quantity} - {prescription.frequency.join(", ")} - {prescription.timing}
                        </li>
                    ))}
                </ul>
            </div>
            {isDoctor && (
                <form onSubmit={handleSubmit} className="space-y-2">
                    <input
                        type="text"
                        placeholder="Medicine Name"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <div className="flex gap-2">
                        {['morning', 'afternoon', 'evening'].map((time) => (
                            <label key={time} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={frequency.includes(time)}
                                    onChange={() => handleFrequencyChange(time)}
                                    className="mr-1"
                                />
                                {time}
                            </label>
                        ))}
                    </div>
                    <select
                        value={timing}
                        onChange={(e) => setTiming(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="before meal">Before Meal</option>
                        <option value="with meal">During Meal</option>
                        <option value="after meal">After Meal</option>
                    </select>
                    <Button
                        type="PRIMARY"
                        classes="w-full"
                        onClick={handleSubmit}
                    >
                        Add Prescription
                    </Button>
                </form>
            )}
        </div>
    );
};

export default Prescription;
