"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ViewMode = "raw" | "weekly" | "monthly" | "yearly";

interface ChartProps {
  data: any[];
  title: string;
  dataKeys: { key: string; color: string; name: string }[];
  viewMode: ViewMode;
  customDot?: boolean;
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

function HealthChart({ data, title, dataKeys, viewMode, customDot }: ChartProps) {
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
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {viewMode === "raw" && (!showOnly || showOnly === "sugar") && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(SUGAR_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                <span className="capitalize">{type.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        )}
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
            dataKeys={[
              { key: "systolic", color: "#3b82f6", name: "Systolic" },
              { key: "diastolic", color: "#ef4444", name: "Diastolic" },
            ]}
          />
        )}
        {(!showOnly || showOnly === "sugar") && (
          <HealthChart
            title="Blood Sugar"
            data={sugarData}
            viewMode={viewMode}
            customDot={true}
            dataKeys={[{ key: "value", color: "#10b981", name: "mg/dL" }]}
          />
        )}
        {(!showOnly || showOnly === "weight") && (
          <HealthChart
            title="Weight Trend"
            data={weightData}
            viewMode={viewMode}
            dataKeys={[{ key: "value", color: "#8b5cf6", name: "Weight (kg)" }]}
          />
        )}
      </div>
    </div>
  );
}
