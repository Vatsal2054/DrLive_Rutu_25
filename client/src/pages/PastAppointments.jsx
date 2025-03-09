import React, { useState, useEffect, useContext } from 'react';
import { CalendarDays, Clock, User, MapPin, VideoIcon, CheckCircle, FileText } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const PastAppointments = ({ userId, isDoctor = false }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { getPastAppointments } = useContext(UserContext);

    const fetchPastAppointments = async () => {
        try {
            setLoading(true);
            const response = await getPastAppointments(userId, isDoctor);
            setAppointments(response);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to fetch past appointments');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPastAppointments();
    }, [userId, isDoctor]);

    // Format date to a more readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background-redTranslucent p-4 rounded-lg text-font-dark">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="bg-background-greyLight p-6 rounded-lg shadow-sm text-center">
                <p className="text-font-darkGrey text-lg">No past appointments found</p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="p-6 text-2xl font-[700]">
                Past Appointments
            </div>

            <div className="px-6 py-0 grid gap-4 md:grid-cols-2">
                {appointments.map((appointment) => (
                    <div
                        key={appointment._id}
                        className="bg-white border border-border-light rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="bg-primaryLight p-4 border-b border-border-light">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <CalendarDays className="text-primary" size={18} />
                                    <span className="font-medium text-font-dark">{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="text-primary" size={18} />
                                    <span className="text-font-dark">{appointment.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex items-start space-x-3">
                                <User className="text-primaryDark mt-1 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-sm text-font-grey">
                                        {isDoctor ? 'Patient' : 'Doctor'}
                                    </p>
                                    <p className="font-medium text-font-dark">
                                        {isDoctor ? appointment.userId?.name : appointment.doctorId?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {appointment.type === 'online' ? (
                                    <VideoIcon className="text-primaryDark flex-shrink-0" size={18} />
                                ) : (
                                    <MapPin className="text-primaryDark flex-shrink-0" size={18} />
                                )}
                                <p className="text-font-dark capitalize">
                                    {appointment.type === 'online' ? 'Online Consultation' : 'In-person Visit'}
                                </p>
                            </div>

                            {appointment.notes && (
                                <div className="flex items-start space-x-3 pt-2">
                                    <FileText className="text-primaryDark mt-1 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm text-font-grey">Notes</p>
                                        <p className="text-font-dark">{appointment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-background-greyLight px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="text-green" size={16} />
                                <span className="text-sm font-medium text-green">Completed</span>
                            </div>

                            <button
                                className="px-4 py-1.5 text-sm bg-primaryTranslucentHover hover:bg-primaryTranslucent text-primary font-medium rounded-md transition-colors duration-200"
                                onClick={() => window.open(`/appointment-details/${appointment._id}`, '_blank')}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PastAppointments;