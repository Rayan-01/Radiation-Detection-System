"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Database } from 'lucide-react';

interface RadiationData {
  timestamp: string;
  seconds: number;
  cpm: number;
  avg_cpm: number;
  avg_uSv: number;
  total_events: number;
}

interface RadiationTableProps {
  data: RadiationData[];
}

export function RadiationTable({ data }: RadiationTableProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredData = data.filter(row =>
    row.timestamp.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getRadiationBadge = (uSv: number) => {
    if (uSv > 1.0) return <Badge variant="destructive">High</Badge>;
    if (uSv > 0.5) return <Badge variant="secondary">Elevated</Badge>;
    return <Badge variant="outline">Normal</Badge>;
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-500" />
            Radiation Data Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-slate-400">
              {filteredData.length} records
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by timestamp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 bg-slate-800/50">
                <TableHead className="text-white">Timestamp</TableHead>
                <TableHead className="text-white text-right">Seconds</TableHead>
                <TableHead className="text-white text-right">CPM</TableHead>
                <TableHead className="text-white text-right">Avg CPM</TableHead>
                <TableHead className="text-white text-right">μSv/h</TableHead>
                <TableHead className="text-white text-right">Total Events</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm text-white">
                    {row.timestamp}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {row.seconds}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-white">
                    {row.cpm}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {row.avg_cpm.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-white">
                    {row.avg_uSv.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right text-white">
                    {row.total_events}
                  </TableCell>
                  <TableCell>
                    {getRadiationBadge(row.avg_uSv)}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="text-center text-white py-8">
                    {search ? 'No matching records found' : 'No data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-white">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors text-white"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}