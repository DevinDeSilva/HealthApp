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
import { Download, List, LineChart as LineChartIcon } from "lucide-react";
import { HealthRecordList } from "./HealthRecordList";
import { PressureReading, SugarReading, WeightReading } from "@/types/health";

type ViewMode = "raw" | "weekly" | "monthly" | "yearly";

interface ChartProps {
  data: (PressureReading | SugarReading | WeightReading)[];
  title: string;
  dataKeys: { key: string; color: string; name: string }[];
  viewMode: ViewMode;
  customDot?: boolean;
  onDownload?: () => void;
  type: "pressure" | "sugar" | "weight";
  onRefresh?: () => void;
}

const SUGAR_COLORS: { [key: string]: string } = {
  fasting: "#3b82f6", // Blue
  before_meal: "#f59e0b", // Orange
  after_meal: "#ef4444", // Red
  random: "#10b981", // Green
};

const WEIGHT_METRICS = [
  { id: "value", label: "Total Weight", unit: "kg", color: "#8b5cf6" },
  { id: "fatMass", label: "Fat Mass", unit: "kg", color: "#f59e0b" },
  { id: "fatPercentage", label: "Fat Percentage", unit: "%", color: "#ef4444" },
  { id: "muscleMass", label: "Muscle Mass", unit: "kg", color: "#10b981" },
];

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

function HealthChart({ data, title, dataKeys, viewMode, customDot, onDownload, type, onRefresh }: ChartProps) {
  const [displayType, setDisplayType] = useState<"chart" | "list">("chart");

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
        const validItems = group.items.filter(item => (item as any)[dk.key] !== null && (item as any)[dk.key] !== undefined);
        if (validItems.length > 0) {
          const sum = validItems.reduce((acc, curr) => acc + (curr[dk.key] || 0), 0);
          averaged[dk.key] = Math.round((sum / validItems.length) * 10) / 10;
        } else {
          averaged[dk.key] = null;
        }
      });
      
      return averaged;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data, viewMode, dataKeys]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-[450px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          {viewMode === "raw" && (
            <div className="flex bg-gray-100 rounded-md p-0.5 mr-2">
              <button
                onClick={() => setDisplayType("chart")}
                className={`p-1.5 rounded-md transition-all ${displayType === "chart" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                title="Show Chart"
              >
                <LineChartIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDisplayType("list")}
                className={`p-1.5 rounded-md transition-all ${displayType === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                title="Show List"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-md transition-all shadow-sm"
            >
              <Download className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1 sm:mr-1.5" />
              CSV
            </button>
          )}
        </div>
      </div>

      {viewMode === "raw" && displayType === "list" ? (
        <HealthRecordList type={type} data={data} onDeleteSuccess={onRefresh || (() => {})} />
      ) : (
        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 10 }}
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  if (viewMode === "yearly") return date.getFullYear().toString();
                  if (viewMode === "monthly") return date.toLocaleDateString(undefined, { month: 'short' });
                  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
                }}
              />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
              {viewMode === "raw" && <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
              {dataKeys.map((dk) => (
                <Line
                  key={dk.key}
                  connectNulls
                  type="monotone"
                  dataKey={dk.key}
                  stroke={dk.color}
                  name={dk.name}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  dot={customDot ? <CustomDot /> : { r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function WeightProgressChart({ data, metricId = "value" }: { data: WeightReading[], metricId?: string }) {
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

    // 2. Calculate weekly averages for the selected metric
    const weeklyAverages = Object.keys(groups).map((key) => {
      const group = groups[key];
      const validItems = group.items.filter(item => (item as any)[metricId] !== null && (item as any)[metricId] !== undefined);
      if (validItems.length === 0) return null;
      
      const sum = validItems.reduce((acc, curr) => acc + ((curr as any)[metricId] || 0), 0);
      return {
        timestamp: group.timestamp,
        avg: sum / validItems.length,
      };
    }).filter((item): item is { timestamp: Date, avg: number } => item !== null)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 3. Calculate difference between consecutive weeks (rate of change)
    return weeklyAverages.map((curr, i, arr) => {
      if (i === 0) return null;
      const prev = arr[i - 1];
      const change = curr.avg - prev.avg;
      return {
        timestamp: curr.timestamp.toISOString(),
        change: Math.round(change * 100) / 100,
      };
    }).filter((item): item is { timestamp: string; change: number } => item !== null);
  }, [data, metricId]);

  if (progressData.length === 0) return null;

  const metricLabel = WEIGHT_METRICS.find(m => m.id === metricId)?.label || "Weight";
  const metricUnit = WEIGHT_METRICS.find(m => m.id === metricId)?.unit || "kg";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[400px] sm:h-[450px]">
      <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">Weekly {metricLabel} Change</h3>
      <p className="text-[10px] sm:text-xs text-gray-500 mb-4">Metric change compared to previous week.</p>
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10 }}
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `W${getWeekNumber(date).split('-W')[1]}`;
              }}
            />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
              formatter={(value: any) => [`${value > 0 ? '+' : ''}${value} ${metricUnit}`, "Weekly Change"]}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" />
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
  showOnly,
  onRefresh
}: { 
  pressureData: PressureReading[]; 
  sugarData: SugarReading[]; 
  weightData: WeightReading[]; 
  showOnly?: "pressure" | "sugar" | "weight";
  onRefresh?: () => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("raw");
  const [sugarFilter, setSugarFilter] = useState<string>("all");
  const [weightMetric, setWeightMetric] = useState<string>("value");

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

  const selectedWeightMetric = WEIGHT_METRICS.find(m => m.id === weightMetric) || WEIGHT_METRICS[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {viewMode === "raw" && (!showOnly || showOnly === "sugar") && sugarFilter === "all" && (
            <div className="flex flex-wrap gap-2 sm:gap-3 mr-auto">
              {Object.entries(SUGAR_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center text-[10px] sm:text-xs text-gray-500">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                  <span className="capitalize">{type.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(!showOnly || showOnly === "sugar") && (
              <div className="flex-1 sm:flex-none flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                <label htmlFor="sugar-filter" className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mr-2">Sugar:</label>
                <select 
                  id="sugar-filter"
                  value={sugarFilter}
                  onChange={(e) => setSugarFilter(e.target.value)}
                  className="text-[11px] sm:text-xs font-medium text-gray-600 bg-transparent focus:outline-none w-full"
                >
                  <option value="all">All Types</option>
                  <option value="fasting">Fasting</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="after_meal">After Meal</option>
                  <option value="random">Random</option>
                </select>
              </div>
            )}

            {(!showOnly || showOnly === "weight") && (
              <div className="flex-1 sm:flex-none flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                <label htmlFor="weight-metric" className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mr-2">Metric:</label>
                <select 
                  id="weight-metric"
                  value={weightMetric}
                  onChange={(e) => setWeightMetric(e.target.value)}
                  className="text-[11px] sm:text-xs font-medium text-gray-600 bg-transparent focus:outline-none w-full"
                >
                  {WEIGHT_METRICS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setViewMode("raw")}
            className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${viewMode === "raw" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Records
          </button>
          <button
            onClick={() => setViewMode("weekly")}
            className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${viewMode === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${viewMode === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode("yearly")}
            className={`flex-1 min-w-[70px] px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all ${viewMode === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {(!showOnly || showOnly === "pressure") && (
          <HealthChart
            title="Blood Pressure"
            type="pressure"
            data={pressureData}
            viewMode={viewMode}
            onDownload={() => handleDownload("pressure")}
            onRefresh={onRefresh}
            dataKeys={[
              { key: "systolic", color: "#3b82f6", name: "Systolic" },
              { key: "diastolic", color: "#ef4444", name: "Diastolic" },
            ]}
          />
        )}
        {(!showOnly || showOnly === "sugar") && (
          <HealthChart
            title={`Blood Sugar ${sugarFilter !== "all" ? `(${sugarFilter.replace("_", " ")})` : ""}`}
            type="sugar"
            data={filteredSugarData}
            viewMode={viewMode}
            customDot={true}
            onDownload={() => handleDownload("sugar")}
            onRefresh={onRefresh}
            dataKeys={[{ key: "value", color: sugarFilter !== "all" ? SUGAR_COLORS[sugarFilter] : "#10b981", name: "mg/dL" }]}
          />
        )}
        {(!showOnly || showOnly === "weight") && (
          <>
            <HealthChart
              title={selectedWeightMetric.label}
              type="weight"
              data={weightData}
              viewMode={viewMode}
              onDownload={() => handleDownload("weight")}
              onRefresh={onRefresh}
              dataKeys={[{ key: selectedWeightMetric.id, color: selectedWeightMetric.color, name: `${selectedWeightMetric.label} (${selectedWeightMetric.unit})` }]}
            />
            {viewMode !== "raw" && <WeightProgressChart data={weightData} metricId={weightMetric} />}
          </>
        )}
      </div>
    </div>
  );
}
