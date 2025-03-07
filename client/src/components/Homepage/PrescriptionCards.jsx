import { Calendar, User, Pill, Clock, AlertCircle } from 'lucide-react';
import Container from '../UI/Container';

const PrescriptionCard = ({ prescription }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <Container classes="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-6 space-y-6">
                {/* Header with Doctor and Patient info */}
                <div className="flex flex-col md:flex-row justify-between gap-4 pb-6 border-b">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <User className="w-4 h-4" />
                            <span className="text-sm">Doctor</span>
                        </div>
                        <h3 className="font-medium">
                            Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{prescription.doctor.email}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500">
                            <User className="w-4 h-4" />
                            <span className="text-sm">Patient</span>
                        </div>
                        <h3 className="font-medium">
                            {prescription.user.firstName} {prescription.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{prescription.user.email}</p>
                    </div>
                </div>

                {/* Date Information */}
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(prescription.date)}</span>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Medications
                    </h4>

                    {prescription.prescription.map((med) => (
                        <div
                            key={med._id}
                            className="bg-blue-50 rounded-xl p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <h5 className="font-medium text-blue-900">{med.medicineName}</h5>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Qty: {med.quantity}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <Clock className="w-4 h-4" />
                                    <div className="flex gap-2">
                                        {med.frequency.map((time, index) => (
                                            <span
                                                key={time}
                                                className="bg-blue-100 px-2 py-0.5 rounded-full text-xs"
                                            >
                                                {capitalizeFirst(time)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{capitalizeFirst(med.timing)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default PrescriptionCard;