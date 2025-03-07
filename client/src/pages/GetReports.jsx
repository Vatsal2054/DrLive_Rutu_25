import { useState, useEffect } from "react";
import axios from "axios";
import Container from "../components/UI/Container";
import toast from "react-hot-toast";
import { FileText, Download } from "lucide-react";

const GetReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/report/getReports`,
        { withCredentials: true }
      );
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.response?.data?.message || "Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadReport = async (link, fileName) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/${link}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
        console.log(error);
        
      toast.error("Error downloading file");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Reports</h1>

      <Container classes="max-w-4xl mx-auto">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium">{report.reportType}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uploaded on {formatDate(report.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => downloadReport(report.link, report.fileName)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Download Report"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default GetReports;