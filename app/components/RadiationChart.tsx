"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RadiationData {
  timestamp: string;
  seconds: number;
  cpm: number;
  avg_cpm: number;
  avg_uSv: number;
  total_events: number;
}

interface RadiationChartProps {
  data: RadiationData[];
}

export function RadiationChart({ data }: RadiationChartProps) {
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      // Parse the DD/MM/YYYY HH:mm:ss format
      const [datePart, timePart] = timestamp.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      
      // Create date object with correct format
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
      
      return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      // Fallback: just return the time part if parsing fails
      return timestamp.split(' ')[1]?.substring(0, 5) || timestamp;
    }
  };

  // Prepare chart data - take last 20 points and reverse to show chronologically
  const chartData = data.slice(0, 20).reverse().map(item => ({
    time: formatTimestamp(item.timestamp),
    cpm: item.cpm,
    avg_cpm: item.avg_cpm,
    avg_uSv: item.avg_uSv,
    timestamp: item.timestamp
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg text-white">
          <p className="text-white text-sm mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-white" style={{ color: entry.color }}>
              {`${entry.dataKey === 'avg_uSv' ? 'μSv/h' : entry.dataKey.toUpperCase()}: ${
                entry.dataKey === 'avg_uSv' ? entry.value.toFixed(3) : entry.value.toFixed(1)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50 col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Radiation Levels Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
                tickLine={{ stroke: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={{ stroke: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cpm" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_cpm" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_uSv" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-400">CPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 rounded-full"></div>
            <span className="text-slate-400">Avg CPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-400">μSv/h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}