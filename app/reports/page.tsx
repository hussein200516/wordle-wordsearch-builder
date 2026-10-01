'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: string;
    api: string;
  };
  // Added statistics object sent by /api/health endpoint
  statistics?: {
    totalActivities: number;
    wordleCount: number;
    wordSearchCount: number;
    mostUsedType: string;
  };
}

export default function ReportsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.error('Failed to fetch health metrics', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4 text-white">
      {/* Header section with added Back Home button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00b4d8]">System metrics & observability</h1>
          <p className="text-slate-400 text-sm mt-1">Assessment 3. Live api monitoring and Endpoint reporting</p>
        </div>
        <Link 
          href="/" 
          className="px-4 py-2 bg-[#0e1a3a] border border-slate-700 hover:border-slate-500 text-sm rounded-lg text-slate-300 transition-colors"
        >
          ← Back Home
        </Link>
      </div>

      {/* Metrics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0e1a3a] border border-slate-700 p-6 rounded-xl">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">System status</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`h-3 w-3 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xl font-bold text-white capitalize">{loading ? 'checking...' : health?.status || 'offline'}</span>
          </div>
        </div>

        <div className="bg-[#0e1a3a] border border-slate-700 p-6 rounded-xl">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">server Uptime</p>
          <p className="text-2xl font-bold text-white mt-2">{health ? `${Math.floor(health.uptime)}s` : '0s'}</p>
        </div>

        <div className="bg-[#0e1a3a] border border-slate-700 p-6 rounded-xl">
          <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Database connection</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{health ? health.services.database : 'Checking...'}</p>
        </div>
      </div>

      {/* Database Activity Counts from /api/health */}
      {health?.statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0e1a3a] border border-slate-700 p-5 rounded-xl">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Activities</p>
            <p className="text-2xl font-bold text-[#00b4d8] mt-2">{health.statistics.totalActivities}</p>
          </div>
          <div className="bg-[#0e1a3a] border border-slate-700 p-5 rounded-xl">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Wordle Activities</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{health.statistics.wordleCount}</p>
          </div>
          <div className="bg-[#0e1a3a] border border-slate-700 p-5 rounded-xl">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Word Search Activities</p>
            <p className="text-2xl font-bold text-amber-400 mt-2">{health.statistics.wordSearchCount}</p>
          </div>
        </div>
      )}

      {/* Raw payload preview */}
      <div className="bg-[#0e1a3a] border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Health Check Response (/api/health)</h2>
        <pre className="bg-[#070d1f] p-4 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">{loading ? 'Fetching telemetry payload...' : JSON.stringify(health, null, 2)}</pre>
      </div>
    </div>
  );
}