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
  const [pressureInputMode, setPressureInputMode] = useState<"manual" | "bulk">("manual");
  const [bulkPressureInput, setBulkPressureInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [customDate, setCustomDate] = useState(defaultDate || "");

  async function handlePressureSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const dateObj = customDate ? new Date(customDate) : undefined;
    
    let systolic: number;
    let diastolic: number;
    let pulse: number | undefined;

    if (pressureInputMode === "bulk") {
      const lines = bulkPressureInput.trim().split("\n").filter(l => l.trim());
      if (lines.length === 0) {
        setMessage({ text: "Please enter at least one reading", type: "error" });
        setLoading(false);
        return;
      }

      let totalSystolic = 0;
      let totalDiastolic = 0;
      let totalPulse = 0;
      let pulseCount = 0;
      let validLines = 0;

      for (const line of lines) {
        const parts = line.trim().split(/\s+/).map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          totalSystolic += parts[0];
          totalDiastolic += parts[1];
          validLines++;
          if (parts.length >= 3 && !isNaN(parts[2])) {
            totalPulse += parts[2];
            pulseCount++;
          }
        }
      }

      if (validLines === 0) {
        setMessage({ text: "Invalid bulk input format. Use: systolic diastolic [pulse]", type: "error" });
        setLoading(false);
        return;
      }

      systolic = Math.ceil(totalSystolic / validLines);
      diastolic = Math.ceil(totalDiastolic / validLines);
      pulse = pulseCount > 0 ? Math.ceil(totalPulse / pulseCount) : undefined;
    } else {
      systolic = Number(formData.get("systolic"));
      diastolic = Number(formData.get("diastolic"));
      pulse = formData.get("pulse") ? Number(formData.get("pulse")) : undefined;
    }

    try {
      const result = await logPressure(
        systolic,
        diastolic,
        pulse,
        dateObj
      );

      if (result?.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: `Pressure reading logged! (${systolic}/${diastolic}${pulse ? " Pulse: " + pulse : ""})`, type: "success" });
        form.reset();
        setBulkPressureInput("");
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
        dateObj,
        formData.get("fatMass") ? Number(formData.get("fatMass")) : undefined,
        formData.get("fatPercentage") ? Number(formData.get("fatPercentage")) : undefined,
        formData.get("muscleMass") ? Number(formData.get("muscleMass")) : undefined
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
          className={`flex-1 py-3 sm:py-4 text-center font-medium flex items-center justify-center text-xs sm:text-sm ${activeTab === "pressure" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          Pressure
        </button>
        <button
          onClick={() => { setActiveTab("sugar"); setMessage(null); }}
          className={`flex-1 py-3 sm:py-4 text-center font-medium flex items-center justify-center text-xs sm:text-sm ${activeTab === "sugar" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Droplets className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          Sugar
        </button>
        <button
          onClick={() => { setActiveTab("weight"); setMessage(null); }}
          className={`flex-1 py-3 sm:py-4 text-center font-medium flex items-center justify-center text-xs sm:text-sm ${activeTab === "weight" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Scale className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
          Weight
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {/* Date Selector */}
        <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Date & Time
          </label>
          <input 
            type="datetime-local" 
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p className="mt-1 text-[10px] text-gray-400 italic">Leave empty for current time</p>
        </div>

        {message && (
          <p className={`mb-4 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        {activeTab === "pressure" && (
          <form onSubmit={handlePressureSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">
                {pressureInputMode === "manual" ? "Manual Entry" : "Bulk Entry"}
              </h3>
              <button
                type="button"
                onClick={() => setPressureInputMode(pressureInputMode === "manual" ? "bulk" : "manual")}
                className="text-xs text-blue-600 hover:underline"
              >
                {pressureInputMode === "manual" ? "Switch to Bulk" : "Switch to Manual"}
              </button>
            </div>

            {pressureInputMode === "manual" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Systolic</label>
                    <input name="systolic" type="number" required placeholder="120" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diastolic</label>
                    <input name="diastolic" type="number" required placeholder="80" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pulse (BPM) - Optional</label>
                  <input name="pulse" type="number" placeholder="72" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Readings (one per line: sys dia pulse)
                </label>
                <textarea
                  value={bulkPressureInput}
                  onChange={(e) => setBulkPressureInput(e.target.value)}
                  placeholder={"107 74 64\n106 75 65\n110 72 70"}
                  rows={5}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm font-mono"
                />
                <p className="mt-1 text-[10px] text-gray-500 italic">
                  Average will be calculated and rounded up.
                </p>
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm">
              Log Blood Pressure
            </button>
          </form>
        )}

        {activeTab === "sugar" && (
          <form onSubmit={handleSugarSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sugar Level (mg/dL)</label>
              <input name="value" type="number" step="0.1" required placeholder="95.0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reading Type</label>
              <select name="type" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm bg-white">
                <option value="fasting">Fasting</option>
                <option value="before_meal">Before Meal</option>
                <option value="after_meal">After Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm">
              Log Blood Sugar
            </button>
          </form>
        )}

        {activeTab === "weight" && (
          <form onSubmit={handleWeightSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input name="value" type="number" step="0.1" required placeholder="75.5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-medium text-gray-700 truncate">Fat (kg)</label>
                <input name="fatMass" type="number" step="0.1" placeholder="15" className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md text-gray-900 text-xs sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-medium text-gray-700 truncate">Fat %</label>
                <input name="fatPercentage" type="number" step="0.1" placeholder="20" className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md text-gray-900 text-xs sm:text-sm" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-medium text-gray-700 truncate">Muscle</label>
                <input name="muscleMass" type="number" step="0.1" placeholder="55" className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md text-gray-900 text-xs sm:text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-sm">
              Log Weight Reading
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
