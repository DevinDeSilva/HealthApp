"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Download } from "lucide-react";

type ViewMode = "raw" | "weekly" | "monthly" | "yearly";

interface ChartProps {
  data: any[];
  title: string;
  dataKeys: { key: string; color: string; name: string }[];
  viewMode: ViewMode;
  customDot?: boolean;
  onDownload?: () => void;
}

const SUGAR_COLORS: { [key: string]: string } = {
  fasting: "#3b82f6", // Blue
  before_meal: "#f59e0b", // Orange
  after_meal: "#ef4444", // Red
  random: "#10b981", // Green
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.isAveraged) {
    return <circle cx={cx} cy={cy} r={4} fill={props.stroke} />;
  }
  
  const color = SUGAR_COLORS[payload.type] || props.stroke;
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function HealthChart({ data, title, dataKeys, viewMode, customDot, onDownload }: ChartProps) {
  const processedData = useMemo(() => {
    if (viewMode === "raw") return data;

    const groups: { [key: string]: { items: any[]; timestamp: Date } } = {};

    data.forEach((item) => {
      const date = new Date(item.timestamp);
      let key = "";
      if (viewMode === "weekly") {
        key = getWeekNumber(date);
      } else if (viewMode === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        key = `${date.getFullYear()}`;
      }
      
      if (!groups[key]) {
        groups[key] = { items: [], timestamp: date };
      }
      groups[key].items.push(item);
    });

    return Object.keys(groups).map((key) => {
      const group = groups[key];
      const averaged: any = { timestamp: group.timestamp.toISOString(), isAveraged: true };
      
      dataKeys.forEach((dk) => {
        const sum = group.items.reduce((acc, curr) => acc + (curr[dk.key] || 0), 0);
        averaged[dk.key] = Math.round((sum / group.items.length) * 10) / 10;
      });
      
      return averaged;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data, viewMode, dataKeys]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[450px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-md transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download CSV
          </button>
        )}
      </div>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => {
                const date = new Date(tick);
                if (viewMode === "yearly") return date.getFullYear().toString();
                if (viewMode === "monthly") return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                return date.toLocaleDateString();
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => {
                const date = new Date(label);
                if (viewMode === "yearly") return `Year ${date.getFullYear()}`;
                if (viewMode === "monthly") return `Month ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
                if (viewMode === "weekly") return `Week of ${date.toLocaleDateString()}`;
                return date.toLocaleString();
              }}
              formatter={(value: any, name: any, props: any) => {
                const label = props.payload.isAveraged ? `Avg ${name}` : name;
                const typeInfo = !props.payload.isAveraged && props.payload.type 
                  ? ` (${props.payload.type.replace("_", " ")})` 
                  : "";
                return [`${value}${typeInfo}`, label];
              }}
            />
            {viewMode === "raw" && <Legend />}
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                name={dk.name}
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={customDot ? <CustomDot /> : true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface WeightReading {
  timestamp: string | Date;
  value: number;
}

function WeightProgressChart({ data }: { data: WeightReading[] }) {
  const progressData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 1. Group by week
    const groups: { [key: string]: { items: any[]; timestamp: Date } } = {};
    data.forEach((item) => {
      const date = new Date(item.timestamp);
      const key = getWeekNumber(date);
      if (!groups[key]) {
        groups[key] = { items: [], timestamp: date };
      }
      groups[key].items.push(item);
    });

    // 2. Calculate weekly averages
    const weeklyAverages = Object.keys(groups).map((key) => {
      const group = groups[key];
      const sum = group.items.reduce((acc, curr) => acc + (curr.value || 0), 0);
      return {
        timestamp: group.timestamp,
        avg: sum / group.items.length,
      };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 3. Calculate difference between consecutive weeks (rate of change)
    return weeklyAverages.map((curr, i, arr) => {
      if (i === 0) return null;
      const prev = arr[i - 1];
      const change = curr.avg - prev.avg;
      return {
        timestamp: curr.timestamp.toISOString(),
        change: Math.round(change * 100) / 100, // Two decimal places for better precision
      };
    }).filter((item): item is { timestamp: string; change: number } => item !== null);
  }, [data]);

  if (progressData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[450px]">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Weekly Weight Change (kg)</h3>
      <p className="text-xs text-gray-500 mb-4">Positive means weight gain, negative means weight loss compared to previous week.</p>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `W${getWeekNumber(date).split('-W')[1]}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
              formatter={(value: any) => [`${value > 0 ? '+' : ''}${value} kg`, "Weekly Change"]}
            />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="change" radius={[4, 4, 0, 0]}>
              {progressData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.change > 0 ? "#ef4444" : "#10b981"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthCharts({ 
  pressureData, 
  sugarData, 
  weightData,
  showOnly
}: { 
  pressureData: any[]; 
  sugarData: any[]; 
  weightData: any[]; 
  showOnly?: "pressure" | "sugar" | "weight";
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("raw");
  const [sugarFilter, setSugarFilter] = useState<string>("all");

  const filteredSugarData = useMemo(() => {
    if (sugarFilter === "all") return sugarData;
    return sugarData.filter(d => d.type === sugarFilter);
  }, [sugarData, sugarFilter]);

  const handleDownload = (type: string) => {
    let url = `/api/health/export?type=${type}`;
    if (type === "sugar" && sugarFilter !== "all") {
      url += `&sugarFilter=${sugarFilter}`;
    }
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {viewMode === "raw" && (!showOnly || showOnly === "sugar") && sugarFilter === "all" && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(SUGAR_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                  <span className="capitalize">{type.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
          
          {(!showOnly || showOnly === "sugar") && (
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
              <label htmlFor="sugar-filter" className="text-[10px] font-bold text-gray-400 uppercase mr-2">Sugar Filter:</label>
              <select 
                id="sugar-filter"
                value={sugarFilter}
                onChange={(e) => setSugarFilter(e.target.value)}
                className="text-xs font-medium text-gray-600 bg-transparent focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="fasting">Fasting</option>
                <option value="before_meal">Before Meal</option>
                <option value="after_meal">After Meal</option>
                <option value="random">Random</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex bg-gray-100 rounded-md p-1 ml-auto">
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "raw" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Records
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Weekly Avg
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Monthly Avg
          </button>
          <button
            onClick={() => setViewMode("yearly")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Yearly Avg
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {(!showOnly || showOnly === "pressure") && (
          <HealthChart
            title="Blood Pressure"
            data={pressureData}
            viewMode={viewMode}
            onDownload={() => handleDownload("pressure")}
            dataKeys={[
              { key: "systolic", color: "#3b82f6", name: "Systolic" },
              { key: "diastolic", color: "#ef4444", name: "Diastolic" },
            ]}
          />
        )}
        {(!showOnly || showOnly === "sugar") && (
          <HealthChart
            title={`Blood Sugar ${sugarFilter !== "all" ? `(${sugarFilter.replace("_", " ")})` : ""}`}
            data={filteredSugarData}
            viewMode={viewMode}
            customDot={true}
            onDownload={() => handleDownload("sugar")}
            dataKeys={[{ key: "value", color: sugarFilter !== "all" ? SUGAR_COLORS[sugarFilter] : "#10b981", name: "mg/dL" }]}
          />
        )}
        {(!showOnly || showOnly === "weight") && (
          <>
            <HealthChart
              title="Weight Trend"
              data={weightData}
              viewMode={viewMode}
              onDownload={() => handleDownload("weight")}
              dataKeys={[{ key: "value", color: "#8b5cf6", name: "Weight (kg)" }]}
            />
            <WeightProgressChart data={weightData} />
          </>
        )}
      </div>
    </div>
  );
}
