import { Calendar, Clock, User, Video, MapPin } from "lucide-react";
import Button from "../UI/Buttons";
import UpdateTimeModal from "./UpdateTimeModal";


const AppointmentCard = ({
  appointment,
  role,
  onDelete,
  onUpdate,
  onAccept,
  onDecline,
}) => {
  const { type, date, time, doctorName, status, notes } = appointment;

  

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Status Badge */}
      <div
        className={`${getStatusColor()} text-sm px-3 py-1 rounded-full self-start mb-4 capitalize`}
      >
        {status}
      </div>

      {/* Appointment Type Icon */}
      <div className="mb-4">
        {type === "online" ? (
          <Video className="w-6 h-6 text-blue-500" />
        ) : (
          <MapPin className="w-6 h-6 text-green-500" />
        )}
      </div>

      {/* Appointment Details */}
      <div className="flex flex-col gap-2 flex-grow">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{time}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{doctorName}</span>
        </div>

        {notes && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{notes}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        {role === "patient" ? (
          <>
            <Button
              type="SECONDARY"
              extraClasses="flex-1"
              onClick={() => onUpdate(appointment)}
            >
              Update
            </Button>
            <Button
              type="DANGER"
              extraClasses="flex-1"
              onClick={() => onDelete(appointment._id)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              type="PRIMARY"
              extraClasses="flex-1"
              onClick={() => onAccept(appointment._id)}
              disabled={status !== "pending"}
            >
              Accept
            </Button>
            <Button
              type="DANGER"
              extraClasses="flex-1"
              onClick={() => onDecline(appointment._id)}
              disabled={status !== "pending"}
            >
              Decline
            </Button>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default AppointmentCard;
