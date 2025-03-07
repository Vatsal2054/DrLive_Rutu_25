import { useContext } from 'react';
import {
    Mail, Phone, MapPin, User, Calendar, Droplet,
    Ruler, Weight, AlertCircle, Hospital, GraduationCap,
    Building, Clock
} from 'lucide-react';
import { UserContext } from "../context/UserContext";

const Profile = () => {
    const { userInfo } = useContext(UserContext);

    if (!userInfo) return (
        <div className="flex items-center justify-center h-96 text-gray-500">
            No user data available.
        </div>
    );

    const {
        firstName, lastName, email, phone, role, avatar, gender,
        address, dob, bloodGroup, height, weight,
        allergies, specialization, experience, degree, workingPlace
    } = userInfo;

    const InfoItem = ({ icon: Icon, label, value }) => (
        value && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-gray-900 dark:text-gray-100">{value}</p>
                </div>
            </div>
        )
    );

    return (
        <div className="w-full h-[100%]">
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                {/* Header Section with full width background */}
                <div className="relative">
                    <div className="w-full h-48 bg-blue-600"></div>
                    <div className="absolute top-[15%] left-6 flex items-end gap-6">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`${firstName} ${lastName}`}
                                className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-xl bg-white shadow-lg flex items-center justify-center text-blue-600 text-4xl font-bold">
                                {firstName[0]}{lastName[0]}
                            </div>
                        )}
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-white">
                                {firstName} {lastName}
                            </h2>
                            <span className="inline-block px-3 py-1 mt-2 text-sm font-medium bg-white/20 text-white rounded-full">
                                {role === "doctor" ? "Doctor" : "Patient"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="pt-4 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <InfoItem icon={Mail} label="Email" value={email} />
                        <InfoItem icon={Phone} label="Phone" value={phone} />
                        <InfoItem
                            icon={MapPin}
                            label="Address"
                            value={`${address.street}, ${address.city}, ${address.state} ${address.zip}`}
                        />
                        <InfoItem icon={User} label="Gender" value={gender} />

                        {role === "patient" && (
                            <>
                                <InfoItem icon={Calendar} label="Date of Birth" value={dob} />
                                <InfoItem icon={Droplet} label="Blood Group" value={bloodGroup} />
                                <InfoItem icon={Ruler} label="Height" value={height} />
                                <InfoItem icon={Weight} label="Weight" value={weight} />
                                <InfoItem icon={AlertCircle} label="Allergies" value={allergies} />
                            </>
                        )}

                        {role === "doctor" && (
                            <>
                                <InfoItem icon={Hospital} label="Specialization" value={specialization} />
                                <InfoItem icon={Clock} label="Experience" value={`${experience} years`} />
                                <InfoItem icon={GraduationCap} label="Degree" value={degree} />
                                <InfoItem icon={Building} label="Working at" value={workingPlace} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;