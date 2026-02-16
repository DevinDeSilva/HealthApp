"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, AlertCircle } from "lucide-react";

export function DataExport() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [exportType, setExportType] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = `/api/health/export?start=${startDate}&end=${endDate}&type=${exportType}`;
      window.location.href = url;
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      // Small timeout to show loading state
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex items-center mb-4">
        <FileSpreadsheet className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Export Health Data</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Select a date range to download your health records as a CSV file compatible with Excel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Type</label>
          <select 
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
          >
            <option value="all">All Records</option>
            <option value="pressure">Blood Pressure Only</option>
            <option value="sugar">Blood Sugar Only</option>
            <option value="weight">Weight Only</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium transition-colors
          ${isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? "Preparing File..." : "Download CSV Report"}
      </button>

      <div className="mt-4 flex items-start p-3 bg-blue-50 rounded-md border border-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
        <p className="text-[11px] text-blue-700">
          The exported file will contain your readings sorted chronologically. 
          Use this for personal records or to share with your healthcare provider.
        </p>
      </div>
    </div>
  );
}
