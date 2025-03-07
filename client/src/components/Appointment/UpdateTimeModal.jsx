import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../UI/Buttons';
import Input from '../UI/Inputs';

const UpdateTimeModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        date: '',
        time: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        field: '',
        message: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({ date: '', time: '' });
            setError({ field: '', message: '' });
        }
    }, [isOpen]);

    const checkEmptyFields = () => {
        for (let key in formData) {
            if (!formData[key] || formData[key].trim() === '') {
                setError({
                    field: key,
                    message: 'This field is required!'
                });
                return true;
            }
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (checkEmptyFields()) return;
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold mb-6">Update Appointment Time</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        Type="PRIMARY"
                        type="date"
                        labelText="New Date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        errorText={error.field === 'date' && error.message}
                    />

                    <Input
                        Type="PRIMARY"
                        type="time"
                        labelText="New Time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        errorText={error.field === 'time' && error.message}
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="SECONDARY"
                            extraClasses="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="PRIMARY"
                            extraClasses="flex-1"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Time"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTimeModal;