"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HealthLoggingForm } from "@/components/HealthLoggingForm";
import { HealthCharts } from "@/components/HealthCharts";
import { LayoutDashboard, PenLine, Activity, Droplets, Scale, History } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"log" | "historic" | "trends">("log");
  const [activeTrend, setActiveTrend] = useState<"pressure" | "sugar" | "weight">("pressure");
  const [data, setData] = useState<{
    pressureReadings: any[];
    sugarReadings: any[];
    weightReadings: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData);
      }
    } catch (error) {
      console.error("Failed to fetch health data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "trends") {
      fetchData();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Main Tabs">
              <button
                onClick={() => setActiveTab("log")}
                className={`
                  shrink-0 py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === "log" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                <PenLine className="h-5 w-5 mr-2" />
                Log Current
              </button>
              <button
                onClick={() => setActiveTab("historic")}
                className={`
                  shrink-0 py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === "historic" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                <History className="h-5 w-5 mr-2" />
                Log Historic
              </button>
              <button
                onClick={() => setActiveTab("trends")}
                className={`
                  shrink-0 py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === "trends" 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                View Trends
              </button>
            </nav>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "log" && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Current Reading</h2>
              <HealthLoggingForm onSuccess={fetchData} />
            </div>
          )}

          {activeTab === "historic" && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Historic Reading</h2>
              <HealthLoggingForm 
                onSuccess={fetchData} 
                defaultDate={new Date(Date.now() - 86400000).toISOString().slice(0, 16)} 
              />
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-12">
              <div>
                {/* Secondary Tabs for Trends */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <button
                    onClick={() => setActiveTrend("pressure")}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${activeTrend === "pressure" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Blood Pressure
                  </button>
                  <button
                    onClick={() => setActiveTrend("sugar")}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${activeTrend === "sugar" ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                  >
                    <Droplets className="h-4 w-4 mr-2" />
                    Blood Sugar
                  </button>
                  <button
                    onClick={() => setActiveTrend("weight")}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${activeTrend === "weight" ? "bg-purple-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Weight
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : data ? (
                  <div className="grid grid-cols-1 gap-8">
                    {activeTrend === "pressure" && (
                      <HealthCharts 
                        pressureData={data.pressureReadings}
                        sugarData={[]}
                        weightData={[]}
                        showOnly="pressure"
                      />
                    )}
                    {activeTrend === "sugar" && (
                      <HealthCharts 
                        pressureData={[]}
                        sugarData={data.sugarReadings}
                        weightData={[]}
                        showOnly="sugar"
                      />
                    )}
                    {activeTrend === "weight" && (
                      <HealthCharts 
                        pressureData={[]}
                        sugarData={[]}
                        weightData={data.weightReadings}
                        showOnly="weight"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No health data recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
