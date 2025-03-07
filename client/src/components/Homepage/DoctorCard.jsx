import { Phone, Mail, MapPin } from 'lucide-react';
import { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import Button from '../UI/Buttons';
import Container from '../UI/Container';
import AppointmentModal from '../Appointment/AppointmentModal';

const DoctorCards = ({ doctors }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const { bookAppointment } = useContext(UserContext);

    if (!doctors?.length) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No doctors found
            </div>
        );
    }

    const handleBookAppointment = (id) => {
        setSelectedDoctor(id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data) => {
        const res = await bookAppointment({
            ...data,
            doctorId: selectedDoctor
        });
        
        if (res) {
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <Container 
                        key={doctor._id} 
                        classes="p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                        <div className="flex flex-col h-full space-y-6">
                            {/* Header Section */}
                            <div className="flex items-center gap-4">
                                {doctor.avatar ? (
                                    <img
                                        src={doctor.avatar}
                                        alt={`${doctor.firstName} ${doctor.lastName}`}
                                        className="w-14 h-14 rounded-full object-cover bg-gray-100"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-xl font-semibold text-gray-600">
                                            {doctor.firstName[0]}{doctor.lastName[0]}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 flex justify-center">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-gray-700">{doctor.email}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 flex justify-center">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-gray-700">{doctor.phone}</span>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 flex justify-center pt-1">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-gray-700">
                                        {doctor.address.street}, {doctor.address.city},{' '}
                                        {doctor.address.state} {doctor.address.zip}
                                    </span>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Experience</span>
                                    <span className="font-medium text-gray-900">{doctor.experience} years</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Working at</span>
                                    <span className="font-medium text-gray-900">{doctor.workingPlace}</span>
                                </div>
                            </div>

                            {/* Button Section */}
                            <div className="mt-auto pt-4">
                                <Button
                                    type={doctor.isAvailable ? "PRIMARY" : "SECONDARY"}
                                    disabled={!doctor.isAvailable}
                                    classes={`w-full py-2.5 text-sm font-medium ${!doctor.isAvailable ? 'bg-gray-200 text-gray-500' : ''}`}
                                    onClick={() => handleBookAppointment(doctor._id)}
                                >
                                    {doctor.isAvailable ? 'Book Appointment' : 'Not Available'}
                                </Button>
                            </div>
                        </div>
                    </Container>
                ))}
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDoctor(null);
                }}
                onSubmit={handleSubmit}
            />
        </>
    );
};

export default DoctorCards;