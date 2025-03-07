import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Input from "../UI/Inputs";
import Button from "../UI/Buttons";

const AppointmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    notes: "",
  });

  const [error, setError] = useState({
    field: "",
    message: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: "",
        time: "",
        type: "",
        notes: "",
      });
      setError({
        field: "",
        message: "",
      });
    }
  }, [isOpen]);

  const [loading, setLoading] = useState(false);

  function checkEmptyFields() {
    for (let key in formData) {
        if (!formData[key] || formData[key].trim() === "") {
            setError({
                field: key,
                message: "This field is required!"
            });
            return true;
        }
    }
    return false;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(checkEmptyFields()) return;
    setLoading(true);
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Book Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-0">
          <Input
            Type="PRIMARY"
            type="date"
            labelText="Date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            errorText={error.field === "date" && error.message}
          />

          <Input
            Type="PRIMARY"
            type="time"
            labelText="Time"
            value={formData.time}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, time: e.target.value }))
            }
            errorText={error.field === "time" && error.message}
          />

          <Input
            Type="PRIMARY"
            type="dropdown"
            labelText="Appointment Type"
            options={["in-person", "online"]}
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            errorText={error.field === "type" && error.message}
          />

          <Input
            Type="PRIMARY"
            type="text"
            labelText="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            errorText={error.field === "notes" && error.message}
          />

          <div className="flex gap-4 pt-4">
            <Button type="SECONDARY" extraClasses="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="PRIMARY" extraClasses="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
