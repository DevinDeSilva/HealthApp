"use client";

import { useState } from "react";
import { Trash2, AlertCircle, Calendar, Clock } from "lucide-react";
import { deletePressure, deleteSugar, deleteWeight, bulkDeleteReadings } from "@/app/actions/health";
import { PressureReading, SugarReading, WeightReading } from "@/types/health";

interface RecordListProps {
  type: "pressure" | "sugar" | "weight";
  data: (PressureReading | SugarReading | WeightReading)[];
  onDeleteSuccess: () => void;
}

export function HealthRecordList({ type, data, onDeleteSuccess }: RecordListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [olderThan, setOlderThan] = useState(30);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    
    setIsDeleting(id);
    let result;
    if (type === "pressure") result = await deletePressure(id);
    else if (type === "sugar") result = await deleteSugar(id);
    else result = await deleteWeight(id);

    if (result.success) {
      onDeleteSuccess();
    } else {
      alert(result.error || "Failed to delete");
    }
    setIsDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete all ${type} records older than ${olderThan} days?`)) return;
    
    const result = await bulkDeleteReadings(type, olderThan);
    if (result.success) {
      alert(`Successfully deleted ${result.count} records`);
      onDeleteSuccess();
      setShowBulkDelete(false);
    } else {
      alert(result.error || "Failed to delete");
    }
  };

  const sortedData = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recent Records</h4>
        <button
          onClick={() => setShowBulkDelete(!showBulkDelete)}
          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Bulk Cleanup
        </button>
      </div>

      {showBulkDelete && (
        <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-4">
          <p className="text-xs text-red-800 mb-2">Delete records older than:</p>
          <div className="flex items-center gap-2">
            <select
              value={olderThan}
              onChange={(e) => setOlderThan(Number(e.target.value))}
              className="text-xs border-red-200 rounded px-2 py-1 focus:ring-red-500 focus:border-red-500"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Delete Older Records
            </button>
            <button
              onClick={() => setShowBulkDelete(false)}
              className="text-gray-500 text-xs hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedData.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-4 text-center">No records found.</p>
        ) : (
          <div className="space-y-2">
            {sortedData.map((record) => (
              <div key={record.id} className="bg-white border border-gray-100 rounded-lg p-3 flex justify-between items-center hover:border-blue-100 transition-colors shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-gray-500 text-[10px]">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(record.timestamp).toLocaleDateString()}
                    <Clock className="h-3 w-3 ml-2 mr-1" />
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {type === "pressure" && (
                      <span>{(record as PressureReading).systolic}/{(record as PressureReading).diastolic} <span className="text-gray-400 text-xs font-normal">mmHg</span> {(record as PressureReading).pulse && <span className="ml-2">❤️ {(record as PressureReading).pulse}</span>}</span>
                    )}
                    {type === "sugar" && (
                      <span>{(record as SugarReading).value} <span className="text-gray-400 text-xs font-normal">mg/dL</span> <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600 capitalize">{(record as SugarReading).type.replace("_", " ")}</span></span>
                    )}
                    {type === "weight" && (
                      <div className="flex flex-col">
                        <span>{(record as WeightReading).value} <span className="text-gray-400 text-xs font-normal">kg</span></span>
                        {((record as WeightReading).fatPercentage || (record as WeightReading).muscleMass) && (
                          <div className="flex gap-2 mt-0.5">
                            {(record as WeightReading).fatPercentage && <span className="text-[10px] text-orange-600">Fat: {(record as WeightReading).fatPercentage}%</span>}
                            {(record as WeightReading).muscleMass && <span className="text-[10px] text-green-600">Muscle: {(record as WeightReading).muscleMass}kg</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  disabled={isDeleting === record.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Delete record"
                >
                  <Trash2 className={`h-4 w-4 ${isDeleting === record.id ? "animate-pulse" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
