"use client";

import { useState } from "react";
import { logPressure, logSugar, logWeight } from "@/app/actions/health";
import { Activity, Droplets, Scale, Calendar } from "lucide-react";

export function HealthLoggingForm({ 
  onSuccess, 
  defaultDate 
}: { 
  onSuccess?: () => void;
  defaultDate?: string; // Expects YYYY-MM-DDTHH:mm format
}) {
  const [activeTab, setActiveTab] = useState<"pressure" | "sugar" | "weight">("pressure");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [customDate, setCustomDate] = useState(defaultDate || "");

  async function handlePressureSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const dateObj = customDate ? new Date(customDate) : undefined;
    
    try {
      const result = await logPressure(
        Number(formData.get("systolic")),
        Number(formData.get("diastolic")),
        formData.get("pulse") ? Number(formData.get("pulse")) : undefined,
        dateObj
      );

      if (result?.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Pressure reading logged!", type: "success" });
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: "Failed to log reading", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSugarSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const dateObj = customDate ? new Date(customDate) : undefined;

    try {
      const result = await logSugar(
        Number(formData.get("value")), 
        formData.get("type") as string,
        dateObj
      );

      if (result?.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Sugar reading logged!", type: "success" });
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: "Failed to log reading", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleWeightSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const dateObj = customDate ? new Date(customDate) : undefined;

    try {
      const result = await logWeight(
        Number(formData.get("value")),
        dateObj
      );

      if (result?.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Weight logged!", type: "success" });
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
      setMessage({ text: "Failed to log weight", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div className="flex border-b">
        <button
          onClick={() => { setActiveTab("pressure"); setMessage(null); }}
          className={`flex-1 py-4 text-center font-medium flex items-center justify-center ${activeTab === "pressure" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Activity className="h-5 w-5 mr-2" />
          Pressure
        </button>
        <button
          onClick={() => { setActiveTab("sugar"); setMessage(null); }}
          className={`flex-1 py-4 text-center font-medium flex items-center justify-center ${activeTab === "sugar" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Droplets className="h-5 w-5 mr-2" />
          Sugar
        </button>
        <button
          onClick={() => { setActiveTab("weight"); setMessage(null); }}
          className={`flex-1 py-4 text-center font-medium flex items-center justify-center ${activeTab === "weight" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Scale className="h-5 w-5 mr-2" />
          Weight
        </button>
      </div>

      <div className="p-6">
        {/* Date Selector */}
        <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Date & Time
          </label>
          <input 
            type="datetime-local" 
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-[10px] text-gray-400 italic">Leave empty to use current time</p>
        </div>

        {message && (
          <p className={`mb-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        {activeTab === "pressure" && (
          <form onSubmit={handlePressureSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Systolic (mmHg)</label>
                <input name="systolic" type="number" required placeholder="120" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diastolic (mmHg)</label>
                <input name="diastolic" type="number" required placeholder="80" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pulse (BPM) - Optional</label>
              <input name="pulse" type="number" placeholder="72" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              Log Blood Pressure
            </button>
          </form>
        )}

        {activeTab === "sugar" && (
          <form onSubmit={handleSugarSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sugar Level (mg/dL)</label>
              <input name="value" type="number" step="0.1" required placeholder="95.0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reading Type</label>
              <select name="type" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900">
                <option value="fasting">Fasting</option>
                <option value="before_meal">Before Meal</option>
                <option value="after_meal">After Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              Log Blood Sugar
            </button>
          </form>
        )}

        {activeTab === "weight" && (
          <form onSubmit={handleWeightSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input name="value" type="number" step="0.1" required placeholder="75.5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              Log Weight
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
