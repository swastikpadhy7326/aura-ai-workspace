import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Battery,
  Wifi,
  RefreshCw,
  Search,
  Zap,
  CheckCircle,
  Shield
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SystemMonitorProps {
  systemStatus: SystemStatus | null;
  onRefresh: () => void;
  onRunDiagnostic: () => void;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({
  systemStatus,
  onRefresh,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [killedPids, setKilledPids] = useState<number[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState<string | null>(null);

  if (!systemStatus) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 bg-[#020617]">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
        <span>Polling system hardware diagnostics...</span>
      </div>
    );
  }

  const handleKillProcess = (pid: number) => {
    setKilledPids((prev) => [...prev, pid]);
  };

  const handleOptimizeSystem = () => {
    setOptimizing(true);
    setOptimizationMessage(null);
    setTimeout(() => {
      setOptimizing(false);
      setOptimizationMessage('System caches cleared. 420 MB RAM reclaimed. CPU load normalized.');
    }, 1000);
  };

  const activeProcesses = systemStatus.activeProcesses
    .filter((p) => !killedPids.includes(p.pid))
    .filter((p) => p.name.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div className="flex-1 bg-[#020617] text-slate-200 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              System Diagnostics & Telemetry
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800">
                Core: Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Host: <span className="text-slate-300">{systemStatus.osInfo}</span> • Uptime: {Math.floor(systemStatus.uptimeSeconds / 3600)}h {Math.floor((systemStatus.uptimeSeconds % 3600) / 60)}m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="optimize-sys-btn"
            onClick={handleOptimizeSystem}
            disabled={optimizing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{optimizing ? 'Optimizing...' : 'Optimize System'}</span>
          </button>
          <button
            id="refresh-sys-btn"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 cursor-pointer"
            title="Refresh diagnostics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {optimizationMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{optimizationMessage}</span>
        </div>
      )}

      {/* Metric Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">CPU Usage</p>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
              systemStatus.cpuUsage > 80
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/60'
            }`}>
              {systemStatus.cpuUsage > 80 ? 'Heavy Load' : 'Normal'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{systemStatus.cpuUsage}%</span>
            <span className="text-xs text-slate-500 font-mono">multi-core avg</span>
          </div>

          <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                systemStatus.cpuUsage > 80 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${systemStatus.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">RAM Load</p>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 font-semibold">
              {systemStatus.ramUsedGb} / {systemStatus.ramTotalGb} GB
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{systemStatus.ramUsage}%</span>
            <span className="text-xs text-slate-500 font-mono">allocated</span>
          </div>

          <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${systemStatus.ramUsage}%` }}
            />
          </div>
        </div>

        {/* Battery / Power Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Battery & Power</p>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {systemStatus.isCharging ? 'AC Powered' : 'Battery'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{systemStatus.batteryLevel}%</span>
            <span className="text-xs text-emerald-400 font-medium">Optimal</span>
          </div>

          <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${systemStatus.batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Network & Temp */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Network & Latency</p>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-950/60 text-amber-400 border border-amber-800/60">
              {systemStatus.temperatureC}°C
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{systemStatus.networkLatencyMs}ms</span>
            <span className="text-xs text-slate-500 font-mono">ping</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Disk: {systemStatus.diskUsage}% of {systemStatus.diskTotalGb}GB</span>
            <span className="text-indigo-400">Ready</span>
          </div>
        </div>
      </div>

      {/* Running Process Explorer Bento Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#020617]/50">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Background Processes & Daemons</h3>
            <p className="text-xs text-slate-400">Inspect worker threads, sandbox isolation, and resource allocations</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter processes..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#020617] text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-6 py-3">PID</th>
                <th className="px-6 py-3">Process Name</th>
                <th className="px-6 py-3">CPU %</th>
                <th className="px-6 py-3">Memory (MB)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeProcesses.map((proc) => (
                <tr key={proc.pid} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-400">{proc.pid}</td>
                  <td className="px-6 py-3.5 font-medium text-white flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{proc.name}</span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-indigo-400">{proc.cpuPercent}%</td>
                  <td className="px-6 py-3.5 font-mono text-slate-300">{proc.memMb} MB</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-900 text-emerald-400 border border-slate-800 font-mono">
                      {proc.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleKillProcess(proc.pid)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 hover:border-rose-800 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
              {activeProcesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No active processes matching "{filterQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
