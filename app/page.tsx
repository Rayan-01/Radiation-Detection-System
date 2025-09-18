"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Shield,
  Radio
} from 'lucide-react';
import { RadiationTable } from './components/RadiationTable';
import { RadiationChart } from './components/RadiationChart';

interface RadiationData {
  timestamp: string;
  seconds: number;
  cpm: number;
  avg_cpm: number;
  avg_uSv: number;
  total_events: number;
}

export default function RadiationMonitor() {
  const [data, setData] = useState<RadiationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQgNusyjbTFoIKy0BsQ45-qFoSOX2-cnqmaOlI4zF_c9bYw5YBHlIrvMeRkkBeIz7VQ15qbxvkCTHiT/pub?output=csv';

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      
      const response = await fetch(`/api/radiation-data`);
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      
      // Skip header row
      const dataRows = lines.slice(1).map(line => {
        const [timestamp, seconds, cpm, avg_cpm, avg_uSv, total_events] = line.split(',');
        return {
          timestamp: timestamp?.trim() || '',
          seconds: parseInt(seconds) || 0,
          cpm: parseInt(cpm) || 0,
          avg_cpm: parseFloat(avg_cpm) || 0,
          avg_uSv: parseFloat(avg_uSv) || 0,
          total_events: parseInt(total_events) || 0,
        };
      }).filter(row => row.timestamp); // Filter out empty rows

      setData(dataRows.reverse()); // Show latest data first
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching radiation data:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const getRadiationStatus = () => {
    if (data.length === 0) return { status: 'unknown', color: 'secondary' };
    
    const latest = data[0];
    if (latest.avg_uSv > 1.0) return { status: 'high', color: 'destructive' };
    if (latest.avg_uSv > 0.5) return { status: 'elevated', color: 'warning' };
    return { status: 'normal', color: 'success' };
  };

  const radiationStatus = getRadiationStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 mx-auto">
            <Radio className="h-12 w-12 text-emerald-500" />
          </div>
          <p className="text-slate-400">Initializing Radiation Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Radiation Detection System</h1>
                <p className="text-sm text-slate-400">Real-time Environmental Monitor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge 
                variant={radiationStatus.color as any}
                className="px-3 py-1 font-semibold"
              >
                <Activity className="h-3 w-3 mr-1" />
                {radiationStatus.status.toUpperCase()}
              </Badge>
              
              <Button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {error && (
          <Card className="border-red-800 bg-red-950/50">
            <CardContent className="flex items-center gap-2 pt-6">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">Error: {error}</span>
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Current CPM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {data.length > 0 ? data[0].cpm : '--'}
              </div>
              <p className="text-xs text-slate-400 mt-1">Counts per minute</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg CPM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {data.length > 0 ? data[0].avg_cpm.toFixed(2) : '--'}
              </div>
              <p className="text-xs text-slate-400 mt-1">Average counts/min</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Radiation Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {data.length > 0 ? data[0].avg_uSv.toFixed(3) : '--'}
              </div>
              <p className="text-xs text-slate-400 mt-1">μSv/h average</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {data.length > 0 ? data[0].timestamp : 'No data'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RadiationChart data={data} />
        </div>

        {/* Data Table */}
        <RadiationTable data={data} />
      </div>
    </div>
  );
}