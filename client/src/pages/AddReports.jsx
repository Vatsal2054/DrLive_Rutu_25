import { useState } from "react";
import { Upload } from "lucide-react";
import Button from "../components/UI/Buttons";
import Container from "../components/UI/Container";
import toast from "react-hot-toast";
import axios from "axios";

const REPORT_TYPES = ["Reports", "Xray", "City-Scan", "Blood-report", "Other"];

const ALLOWED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
};

const AddReports = () => {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      return "File size should be less than 10MB";
    }

    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return "File type not supported. Please upload PDF, JPG, JPEG or PNG files";
    }

    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !reportType) {
      toast.error("Please select a file and report type");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("reportType", reportType);

      const response = await axios.post(
        'http://localhost:3000/report/add',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Report uploaded successfully");
        setFile(null);
        setReportType("");
        e.target.reset();
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message || "Error uploading report";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Medical Report</h1>

      <Container classes="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
              required
            >
              <option value="">Select Report Type</option>
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum file size: 10MB
                  </p>
                  {file && (
                    <p className="mt-2 text-sm text-green-500">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </label>
            </div>
          </div>

          <Button type="PRIMARY" extraClasses="w-full" disabled={loading}>
            {loading ? "Uploading..." : "Upload Report"}
          </Button>
        </form>
      </Container>
    </div>
  );
};

export default AddReports;
