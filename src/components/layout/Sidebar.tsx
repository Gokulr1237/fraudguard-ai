import React from 'react';
import {
  LayoutDashboard,
  SearchCheck,
  UserCheck,
  AlertTriangle,
  Binary,
  FlaskConical,
  Settings,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  systemStatus?: {
    status: string;
    pipelineMode: string;
    modelVersion: string;
    database?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  systemStatus,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Metrics & transaction overview',
    },
    {
      id: 'analyze',
      label: 'Analyze Transaction',
      icon: SearchCheck,
      desc: 'Inference & alert explanations',
    },
    {
      id: 'customer-behavior',
      label: 'Customer Behavior',
      icon: UserCheck,
      desc: 'Customer baselines & history',
    },
    {
      id: 'fraud-alerts',
      label: 'Fraud Alerts',
      icon: AlertTriangle,
      desc: 'Flagged transactions & triage',
    },
    {
      id: 'model-explainability',
      label: 'Model Explainability',
      icon: Binary,
      desc: 'SHAP values & feature importance',
    },
    {
      id: 'experiments',
      label: 'Experiments & Results',
      icon: FlaskConical,
      desc: 'Class imbalance & model metrics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      desc: 'Adaptive thresholds & weights',
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Research Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-sm font-medium whitespace-nowrap leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-900 space-y-3">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Engine Status
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              Live Model Mode
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Model Pipeline:</span>
              <span className="text-slate-300 font-mono">v2.4 Adaptive</span>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <span className="text-slate-300 font-mono">INR (₹)</span>
            </div>
            <div className="flex justify-between">
              <span>Geocoding:</span>
              <span className="text-slate-300">India (Domestic)</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-center">
          Academic Research Framework
        </div>
      </div>
    </aside>
  );
};
