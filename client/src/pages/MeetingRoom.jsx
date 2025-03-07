import { JaaSMeeting } from '@jitsi/react-sdk';
import { useContext, useState } from 'react';
import PrescriptionWindow from '../components/Appointment/Prescription';
import { useNavigate, useParams } from 'react-router';
import { UserContext } from '../context/UserContext';
import { PiArrowLeft } from 'react-icons/pi';
import Button from '../components/UI/Buttons';

const MeetingRoom = () => {
    const roomId = useParams();

    const [prescriptions, setPrescriptions] = useState([]);
    const [isLive, setIsLive] = useState(true);

    const { role, submitPrescriptions, currentAppointment } = useContext(UserContext);

    const navigate = useNavigate();

    const addPrescription = (newPrescription) => {
        setPrescriptions([...prescriptions, newPrescription]);
    };

    async function handleEndMeeting(){
        setIsLive(false);
        console.table(prescriptions);
        console.log(currentAppointment);
        
        const res = await submitPrescriptions({
            userId: currentAppointment,
            prescription: prescriptions
        });
        if(res){
            console.log("Prescriptions submitted successfully");
            navigate("/");
        }
    }

    return (
        <div className='flex h-screen flex-col'>
            <header className='w-[100vw] h-auto flex flex-row gap-4 border-b border-gray-300'>
                <button onClick={() => navigate(-1)} className="p-4 bg-white border-r border-gray-300">
                    <PiArrowLeft className="text-2xl" />
                </button>
                <h1 className="text-2xl font-bold p-4 bg-white border-b border-gray-300">Meeting Room</h1>
            </header>
            <div className="flex h-full">
                {/* Video Call Section */}
                <div className={`${role === "doctor" ? "w-2/3" : "w-full"}`}>
                    {isLive ?
                        <JaaSMeeting
                            appId='vpaas-magic-cookie-7dc025d1c3ac4118bc6da81156ac8ee3'
                            roomName={roomId}

                            getIFrameRef={(iframeRef) => {
                                iframeRef.style.height = '100%';
                            }}
                            onReadyToClose={() => {
                                console.log('Meeting has ended');
                                setIsLive(false);
                            }}
                        />
                        :
                        <div className="flex items-center justify-center h-full bg-gray-800 text-white text-2xl">
                            {role === "doctor" ? "Waiting for patient to join" : "Meeting has ended"}
                        </div>
                    }
                </div>

                {role === "doctor" &&
                    <div className="w-1/3 p-2 h-full flex flex-col bg-white">
                        <div className="flex-1 border-gray-300 p-4 overflow-auto">
                            <PrescriptionWindow
                                prescriptions={prescriptions}
                                addPrescription={role === "doctor" ? addPrescription : null}
                                isDoctor={role === "doctor"}
                            />
                        </div>
                        <div className="px-4 mb-2">
                            <Button
                                type={"DANGER"}
                                classes={"w-full p-4 "}
                                onClick={() => handleEndMeeting()}
                            >
                                End Meeting
                            </Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default MeetingRoom;
