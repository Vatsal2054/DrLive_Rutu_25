import  { useState } from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8080/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err) {
      setError('Failed to analyze file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 mx-auto overflow-y-auto">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {isLoading ? 'Analyzing...' : 'Upload Medical Report'}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
            disabled={isLoading}
          />
        </label>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
};

const MedicalAnalysisDashboard = ({ data }) => {
  const keyStats = [
    {
      title: "Possible Diseases",
      value: data.possible_diseases.length.toString(),
      color: "from-red-500 to-red-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Severity",
      value: data.summary.severity_assessment,
      color: "from-yellow-500 to-yellow-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      title: "Key Findings",
      value: data.summary.key_findings.length.toString(),
      color: "from-blue-500 to-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: "Urgent Attention",
      value: data.summary.urgent_attention,
      color: "from-purple-500 to-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="relative">
        <h1 className="text-4xl font-bold text-gray-800">
          Medical Analysis <span className="text-blue-600">Report</span>
        </h1>
        <div className="absolute -top-4 -left-6 w-20 h-20 bg-blue-50 rounded-full filter blur-xl opacity-70"></div>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Overview</h2>
        <p className="text-gray-600">{data.summary.overview}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyStats.map((stat) => (
          <div
            key={stat.title}
            className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}></div>
            <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}>
              {stat.icon}
            </div>
            <h3 className="text-gray-600 mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Diseases List */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Possible Diseases</h2>
        <div className="space-y-4">
          {data.possible_diseases.map((disease, index) => (
            <div
              key={index}
              className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">
                  {disease.disease}
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    disease.confidence === "high"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {disease.confidence}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{disease.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Key Findings</h2>
        <div className="grid gap-4">
          {data.summary.key_findings.map((finding, index) => (
            <div
              key={index}
              className="p-4 bg-blue-50 rounded-xl text-blue-800 font-medium"
            >
              {finding}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Doctors */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Recommended Specialists</h2>
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-purple-800">Primary: {data.recommended_doctor.primary.specialist}</p>
                <p className="text-purple-600">Urgency: {data.recommended_doctor.primary.urgency}</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-full text-purple-800 font-medium">
                Primary Care
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-blue-800">Secondary: {data.recommended_doctor.secondary.specialist}</p>
                <p className="text-blue-600">Urgency: {data.recommended_doctor.secondary.urgency}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-full text-blue-800 font-medium">
                Secondary Care
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Report = () => {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div>
      {!analysisData ? (
        <FileUpload onAnalysisComplete={setAnalysisData} />
      ) : (
        <MedicalAnalysisDashboard data={analysisData} />
      )}
    </div>
  );
};

export default Report;