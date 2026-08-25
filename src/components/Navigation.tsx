import React from 'react';
import { ActivePage, CampaignConfig } from '../types';
import {
  Activity,
  BarChart2,
  Calendar,
  Compass,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  Home,
  Key,
  Layers,
  LayoutDashboard,
  Percent,
  Sliders,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  campaign?: CampaignConfig;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: ActivePage;
  label: string;
  category: 'core' | 'live' | 'archived' | 'meta';
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'cover', label: 'Cover & Index', category: 'core', icon: Home },
  { id: 'executive_summary', label: 'Executive Summary', category: 'core', icon: LayoutDashboard },

  // Live SEMrush Reports (Dark grey text / badge)
  { id: 'visibility_trend', label: 'Visibility Trend', category: 'live', icon: TrendingUp },
  { id: 'visibility_scorecards', label: 'Visibility Scorecards', category: 'live', icon: Percent },
  { id: 'avg_position_trend', label: 'Average Position Trend', category: 'live', icon: Activity },
  { id: 'avg_position_scorecards', label: 'Average Position Scorecards', category: 'live', icon: BarChart2 },
  { id: 'position_gaps', label: 'Position Gap Benchmark', category: 'live', icon: Flame },
  { id: 'ranking_distribution', label: 'Ranking Distribution', category: 'live', icon: Layers },
  { id: 'estimated_traffic', label: 'Estimated Traffic Potential', category: 'live', icon: Zap },
  { id: 'quarterly_comparison', label: 'Quarterly Ranking Comparison', category: 'live', icon: Calendar },
  { id: 'monthly_comparison', label: 'Monthly Ranking Comparison', category: 'live', icon: Calendar },

  // Archived Spreadsheet Reports (Amber text / badge)
  { id: 'archived_winners_losers', label: 'Winners & Losers', category: 'archived', icon: TrendingDown },
  { id: 'archived_keyword_gaps', label: 'Competitor Keyword Gaps', category: 'archived', icon: Compass },
  { id: 'archived_top_pages', label: 'Top Ranking Pages', category: 'archived', icon: Globe },
  { id: 'archived_tags', label: 'Performance by Tag', category: 'archived', icon: Sliders },

  // Methodology & Definitions (Mint / Blue)
  { id: 'methodology', label: 'Methodology & Definitions', category: 'meta', icon: HelpCircle },
];

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  campaign,
  onCloseMobile,
}) => {
  const handleClick = (id: ActivePage) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#002B49] text-white">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#001f35] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008768] text-white font-bold text-sm shadow">
            SM
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">SemanticMapper</h1>
            <p className="text-[11px] font-medium text-emerald-400">SEMrush Position Intelligence</p>
          </div>
        </div>
      </div>

      {/* Legend Box */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-3.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Report Data Source Legend
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            <span className="text-slate-300 text-[11px]">Live SEMrush report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-amber-300 text-[11px]">Archived snapshot export</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-300 text-[11px]">Executive / Methodology</span>
          </div>
        </div>
      </div>

      {/* Table of Contents Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Core & Executive */}
        <div>
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Overview
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'core').map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleClick(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#008768] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live SEMrush Reports */}
        <div>
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Reports
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
              Auto-Sync
            </span>
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'live').map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Archived Spreadsheet Reports */}
        <div>
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Archived Exports
            </span>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
              Snapshot
            </span>
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'archived').map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm font-semibold'
                      : 'text-amber-200/90 hover:bg-amber-500/15 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Methodology & Help */}
        <div>
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Documentation
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.filter((i) => i.category === 'meta').map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleClick(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#008768] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Integration / API Gateway (Reserved for future key) */}
        <div className="pt-2">
          <button
            id="nav-btn-semrush-api-footer"
            onClick={() => handleClick('semrush_api')}
            className={`flex w-full items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-left text-[11px] transition ${
              activePage === 'semrush_api'
                ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Key className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">SEMrush API Gateway</span>
            </div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400 font-mono">
              Future Key
            </span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 bg-[#001f35] p-3 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Campaign Scope:</span>
          <span className="font-mono text-emerald-400 font-medium">US Mobile</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          Tracking {(campaign?.totalTrackedKeywords ?? 1462).toLocaleString()} keywords in Google US
        </div>
      </div>
    </div>
  );
};
