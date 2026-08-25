import React from 'react';
import { ActivePage } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Database,
  HelpCircle,
  Info,
  Key,
  Layers,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MethodologyReportProps {
  onNavigate?: (page: ActivePage) => void;
}

export const MethodologyReport: React.FC<MethodologyReportProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            SEMrush Reference Manual
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#002B49] sm:text-3xl">
            Report 14: Data Dictionary &amp; Methodology
          </h1>
        </div>
        <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive reference guide detailing SEO formulas, mathematical logic, aggregation rules, collection frequency normalization and data governance principles used across this executive dashboard.
        </p>
      </div>

      {/* Section 1: Core Metrics Dictionary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[#008768]" />
          <h2 className="text-base font-bold text-[#002B49]">
            1. SEMrush Metric Definitions &amp; Formulas
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* SEMrush Visibility */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">SEMrush Visibility (%)</h3>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                0% – 100%
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              A composite index calculated by SEMrush representing click-through potential based on keyword search volume and current Google SERP position. 100% visibility means a domain ranks #1 on all tracked keywords.
            </p>
            <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200">
              Formula: Composite CTR weight (Pos 1 = 100%, Pos 2 = 70%, ..., Pos &gt; 30 = 0%)
            </div>
          </div>

          {/* Average Position */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Average Position</h3>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                Lower is Better
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              The arithmetic average ranking position of all tracked keywords where a domain is indexed. Lower values denote stronger search engine prominence (Rank 1 is top).
            </p>
            <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200">
              Position Improvement = Comparison Avg Pos − Current Avg Pos
            </div>
          </div>

          {/* Position Gap */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Position Gap vs Competitor</h3>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                Benchmark
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              The rank disparity between ToursByLocals and a target competitor. Positive gaps indicate TBL ranks behind the competitor; negative gaps indicate TBL holds the ranking advantage.
            </p>
            <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200">
              Position Gap = TBL Avg Pos − Competitor Avg Pos
            </div>
          </div>

          {/* Estimated Traffic */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Estimated Traffic Potential</h3>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Modelled Metric
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Modelled search click volume derived from search volume and historical CTR curves. Crucial note: this is a SEMrush theoretical model, not actual Google Analytics session traffic.
            </p>
            <div className="mt-3 rounded bg-white p-2.5 font-mono text-[11px] text-slate-700 border border-slate-200">
              Period Value = Average Daily Est Traffic across period (Never Summed)
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Mathematical Rules & Integrity Directives */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-[#008768]" />
          <h2 className="text-base font-bold text-[#002B49]">
            2. Core Data Integrity &amp; Aggregation Directives
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-4 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm mb-1">
                Rule 1: Cumulative Buckets (Top 3, Top 10, Top 20, Top 100) Must Never Be Summed
              </strong>
              In SEMrush Position Tracking, ranking distributions are nested cumulative sets. Keywords in Top 3 are also by definition part of Top 10, Top 20, and Top 100. Adding these buckets together produces a mathematically invalid number.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-4 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm mb-1">
                Rule 2: Wednesday-Aligned Comparable Sampling for Historical Benchmarking
              </strong>
              Historical SEMrush collection frequency shifted from weekly observations to daily observations in recent years. To prevent daily periods from skewing multi-period aggregations, all historical quarterly and monthly comparisons evaluate only Wednesday weekly snapshots (`dayOfWeek = 3`).
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-4 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm mb-1">
                Rule 3: Missing Observations Are Never Converted to Zero
              </strong>
              If a domain or competitor has no recorded ranking on a specific observation date, the system excludes that record from the mean rather than substituting position 0, which would distort search averages.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-4 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-sm mb-1">
                Rule 4: Multi-Tag Overlap Disclosures
              </strong>
              In keyword group exports, a single query (e.g. "private tour guide rome") routinely belongs to multiple tags ("Rome Tours", "Local Guides", "Europe"). Distinct keywords must be calculated within each tag independently and not summed across tags.
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Architecture Distinction */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-[#008768]" />
          <h2 className="text-base font-bold text-[#002B49]">
            3. Two-Tier Data Architecture: Live Feed vs Archived Snapshots
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
          <div className="rounded-xl bg-slate-900 p-5 text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Live SEMrush Reports (Dark/Slate Theme)
            </div>
            <p className="leading-relaxed text-slate-400 mb-3">
              Driven by continuous daily position tracking observations. Fully responsive to the global top navigation date filters and comparison presets (QoQ, MoM, YoY, Custom).
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
              <li>Report 1: Executive Visibility Scorecards</li>
              <li>Report 2: Visibility Over Time Chart</li>
              <li>Report 3: Average Position Trend (Inverted Axis)</li>
              <li>Report 4: Average Position Scorecards</li>
              <li>Report 5: Primary Domain Position Gap vs Competitors</li>
              <li>Report 6: Cumulative Ranking Distribution</li>
              <li>Report 7: Estimated Traffic Comparison</li>
              <li>Report 8 &amp; 9: Quarterly &amp; Monthly Comparisons</li>
            </ul>
          </div>

          <div className="rounded-xl bg-amber-50 p-5 border border-amber-300 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              Archived Spreadsheet Reports (Warm Amber Theme)
            </div>
            <p className="leading-relaxed text-amber-900/80 mb-3">
              Independent keyword-level snapshots ingested via SEMrush CSV/Excel exports. Locked to specific snapshot capture dates with an interactive 5-step upload and audit wizard.
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-900 font-mono text-[11px]">
              <li>Report 10: Keyword Winners &amp; Losers</li>
              <li>Report 11: TBL vs Competitor Keyword Gaps</li>
              <li>Report 12: Top Ranking Landing Pages</li>
              <li>Report 13: Keyword Performance by Tag</li>
              <li>Visible Snapshot Metadata Header on every view</li>
              <li>Client-side Data Export &amp; Custom Field Mapping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: Direct API Gateway (Future Provisioning) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-5 w-5 text-slate-600" />
              <h2 className="text-base font-bold text-[#002B49]">
                4. SEMrush API Direct Integration (Optional / Future Key)
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              If your organization acquires a SEMrush Business Plan API key in the future, the built-in API Gateway tester can verify the token, check endpoint authorization, and run real-time domain &amp; position tracking queries.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('semrush_api')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 px-4 py-2 text-xs font-semibold shrink-0 transition"
            >
              <Key className="h-3.5 w-3.5 text-slate-600" />
              <span>Open SEMrush API Gateway</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
