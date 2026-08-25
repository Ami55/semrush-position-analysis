import React from 'react';
import { ActivePage, CampaignConfig, SnapshotMetadata } from '../types';
import {
  Activity,
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Compass,
  FileSpreadsheet,
  Globe,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Sliders,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface CoverPageProps {
  campaign?: CampaignConfig;
  snapshotMeta?: SnapshotMetadata;
  onNavigate: (page: ActivePage) => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  campaign,
  snapshotMeta,
  onNavigate,
}) => {
  const defaultCampaign: CampaignConfig = {
    campaignName: 'toursbylocals.com – mobile',
    primaryDomain: 'toursbylocals.com',
    approvedCompetitors: ['tripadvisor.com', 'viator.com', 'getyourguide.com'],
    searchEngine: 'Google',
    market: 'United States',
    language: 'English',
    device: 'Mobile',
    totalTrackedKeywords: 1462,
    latestDataDate: '2026-08-20',
    collectionFrequency: 'Daily (90-Day Window)',
    lastRefreshedAt: '2026-08-21 10:45:00 UTC',
  };

  const activeCamp = campaign || defaultCampaign;

  return (
    <div className="space-y-8">
      {/* Executive Cover Card */}
      <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-200">
        {/* Dark Blue Upper Band */}
        <div className="bg-[#002B49] px-8 pt-12 pb-14 text-white sm:px-12 sm:pt-16 sm:pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-sm border border-white/15">
              <ShieldCheck className="h-4 w-4" />
              Executive SEO Intelligence Report
            </div>
            <div className="text-right text-xs text-slate-300 font-mono">
              Market: {activeCamp.market} • {activeCamp.device}
            </div>
          </div>

          <div className="mt-8 max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#008768] text-xs font-bold text-white shadow-xs">
                SM
              </span>
              <span className="text-sm font-semibold tracking-wider uppercase text-emerald-300">SemanticMapper</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight">
              SEMrush Position Tracking
            </h1>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-emerald-400 sm:text-3xl">
              Search Visibility &amp; Keyword Intelligence
            </h2>
            <p className="mt-4 text-base font-normal text-slate-200 sm:text-lg sm:leading-relaxed max-w-2xl">
              Performance analysis, competitor search visibility benchmarking, ranking distribution movements, and verified keyword snapshot opportunities across Google US Mobile results.
            </p>
          </div>

          {/* Quick Metric Badges in Hero */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-4xl">
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
              <span className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">Campaign</span>
              <span className="mt-1 block text-sm font-bold text-white font-mono truncate">{activeCamp.campaignName}</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
              <span className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">Tracked Keywords</span>
              <span className="mt-1 block text-lg font-bold text-emerald-400 font-mono">{(activeCamp.totalTrackedKeywords ?? 1462).toLocaleString()}</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
              <span className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">Engine &amp; Device</span>
              <span className="mt-1 block text-sm font-bold text-white font-mono">{activeCamp.searchEngine} • {activeCamp.device}</span>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
              <span className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider">Competitors</span>
              <span className="mt-1 block text-xs font-bold text-white font-mono truncate">Tripadvisor, Viator, GYG</span>
            </div>
          </div>
        </div>

        {/* Mint-Green Lower Section */}
        <div className="bg-[#008768] px-8 py-8 text-white sm:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Verified Data Source Separation</h3>
              <p className="text-xs text-emerald-50 max-w-xl leading-relaxed">
                Domain-level aggregate trends are served directly via continuous SEMrush data sync. In-depth keyword-level movements and ranking gap distributions use authenticated, validated spreadsheet exports.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                id="cover-jump-archived-btn"
                onClick={() => onNavigate('archived_winners_losers')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900/80 text-white px-4 py-2.5 text-xs font-bold border border-emerald-400/30 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span>Explore 90-Day Keyword Analysis</span>
                <ArrowRight className="h-4 w-4 text-emerald-300" />
              </button>
              <button
                id="cover-jump-exec-summary-btn"
                onClick={() => onNavigate('executive_summary')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#002B49] shadow transition hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                <span>Open Executive Summary</span>
                <ArrowRight className="h-4 w-4 text-[#008768]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Table of Contents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#002B49]">Table of Contents</h2>
            <p className="text-xs text-slate-500">Jump directly into any section or operational report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Section 1: Executive Overview */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-2.5 text-[#008768] mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/80">
                <LayoutDashboard className="h-4 w-4 text-[#008768]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Executive Summary</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Answer-first synthesis: Wins, Opportunities, Areas to Improve, decision-relevant KPI strip, and prioritized action plan.
            </p>
            <button
              onClick={() => onNavigate('executive_summary')}
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-[#008768]"
            >
              <span>View Executive Summary</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Section 2: Live SEMrush Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 text-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                  <Activity className="h-4 w-4 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Live SEMrush Reports</h3>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                7 Reports
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Continuous domain-level visibility, average position curves, position gap vs competitors, cumulative ranking distributions, and quarterly/monthly sampling tables.
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('visibility_trend')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Visibility Trends &amp; Scorecards</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('position_gaps')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Position Gap vs Competitors</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('ranking_distribution')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Ranking Distribution (Top 3/10/20/100)</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('quarterly_comparison')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <span>Quarterly &amp; Monthly Comparisons</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Section 3: Archived Spreadsheet Reports */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 text-amber-900">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                  <FileSpreadsheet className="h-4 w-4 text-amber-700" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">Archived Exports</h3>
              </div>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-800">
                4 Reports
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Granular keyword movements, competitor head-to-head gaps, high-performing landing pages, and category tag distributions from validated snapshot files.
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('archived_winners_losers')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-amber-900 hover:bg-amber-100/60"
              >
                <span>Keyword Winners &amp; Losers</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => onNavigate('archived_keyword_gaps')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-amber-900 hover:bg-amber-100/60"
              >
                <span>Competitor Keyword Gaps</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => onNavigate('archived_top_pages')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-amber-900 hover:bg-amber-100/60"
              >
                <span>Top Ranking Landing Pages</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => onNavigate('archived_tags')}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-amber-900 hover:bg-amber-100/60"
              >
                <span>Performance by Tag</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Specification Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#002B49] uppercase tracking-wider mb-4">
          Position Tracking Campaign Scope
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          <div className="border-l-2 border-[#008768] pl-3">
            <span className="text-slate-400 block text-[11px]">Primary Domain</span>
            <span className="font-semibold text-slate-800">{campaign.primaryDomain}</span>
          </div>
          <div className="border-l-2 border-slate-300 pl-3">
            <span className="text-slate-400 block text-[11px]">Search Engine</span>
            <span className="font-semibold text-slate-800">{campaign.searchEngine}</span>
          </div>
          <div className="border-l-2 border-slate-300 pl-3">
            <span className="text-slate-400 block text-[11px]">Target Market</span>
            <span className="font-semibold text-slate-800">{campaign.market}</span>
          </div>
          <div className="border-l-2 border-slate-300 pl-3">
            <span className="text-slate-400 block text-[11px]">Language</span>
            <span className="font-semibold text-slate-800">{campaign.language}</span>
          </div>
          <div className="border-l-2 border-slate-300 pl-3">
            <span className="text-slate-400 block text-[11px]">Device Target</span>
            <span className="font-semibold text-slate-800">{campaign.device}</span>
          </div>
          <div className="border-l-2 border-emerald-500 pl-3">
            <span className="text-slate-400 block text-[11px]">Approved Competitors</span>
            <span className="font-semibold text-slate-800">Tripadvisor, Viator, GYG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
