import React from 'react';
import { ShieldAlert, Search } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analyze', label: 'Analyze Transaction' },
    { id: 'customer-behavior', label: 'Customer Behavior' },
    { id: 'fraud-alerts', label: 'Fraud Alerts' },
    { id: 'model-explainability', label: 'Model Explainability' },
    { id: 'experiments', label: 'Experiments & Results' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Brand Wordmark */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 transition-colors">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            FraudGuard AI
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              Adaptive ML
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Behavioral-Aware & Explainable Fraud Detection
          </p>
        </div>
      </button>

      {/* Primary Navigation Links */}
      <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-300">
        {navLinks.map((link) => {
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                isActive
                  ? 'text-indigo-400 font-semibold border-indigo-500'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Primary Quick Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('analyze')}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Analyze Transaction
        </button>
      </div>
    </header>
  );
};
