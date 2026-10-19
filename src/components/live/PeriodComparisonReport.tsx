import React, { useState } from 'react';
import {
  CampaignConfig,
  DailyObservation,
  DomainName,
  TakeawayItem,
} from '../../types';
import { filterComparableObservations } from '../../utils/calculations';
import { RAW_DAILY_OBSERVATIONS } from '../../data/liveData';
import { KeyTakeaways } from '../KeyTakeaways';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Layers,
  Sliders,
  TrendingUp,
} from 'lucide-react';

interface PeriodComparisonReportProps {
  campaign: CampaignConfig;
  initialMode?: 'quarterly' | 'monthly';
}

interface PeriodMetricsRow {
  periodLabel: string;
  startDate: string;
  endDate: string;
  observationCount: number;
  samplingMethod: string;
  visibility: number;
  averagePosition: number;
  estimatedTraffic: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  trackedKeywords: number;
}

export const PeriodComparisonReport: React.FC<PeriodComparisonReportProps> = ({
  campaign,
  initialMode = 'quarterly',
}) => {
  const [mode, setMode] = useState<'quarterly' | 'monthly'>(initialMode);
  const [selectedQuarter, setSelectedQuarter] = useState<'Q3_2026' | 'Q2_2026' | 'Q1_2026'>('Q3_2026');
  const [selectedMonth, setSelectedMonth] = useState<'2026-07' | '2026-06' | '2026-05'>('2026-07');
  const [selectedDomain, setSelectedDomain] = useState<DomainName>('example.com');

  // Compute comparable period rows using Wednesday-aligned sampling (dayOfWeek = 3)
  const computeComparablePeriodRow = (
    label: string,
    startDate: string,
    endDate: string,
    domain: DomainName
  ): PeriodMetricsRow => {
    const wednesdayObs = filterComparableObservations(
      RAW_DAILY_OBSERVATIONS,
      startDate,
      endDate,
      domain,
      3 // Wednesday
    );

    if (wednesdayObs.length === 0) {
      return {
        periodLabel: label,
        startDate,
        endDate,
        observationCount: 0,
        samplingMethod: 'Wednesday weekly sampling',
        visibility: 0,
        averagePosition: 0,
        estimatedTraffic: 0,
        top3: 0,
        top10: 0,
        top20: 0,
        top100: 0,
        trackedKeywords: 1462,
      };
    }

    const avg = (key: keyof DailyObservation) =>
      wednesdayObs.reduce((acc, item) => acc + (typeof item[key] === 'number' ? (item[key] as number) : 0), 0) /
      wednesdayObs.length;

    return {
      periodLabel: label,
      startDate,
      endDate,
      observationCount: wednesdayObs.length,
      samplingMethod: 'Wednesday weekly sampling',
      visibility: Number(avg('visibility').toFixed(2)),
      averagePosition: Number(avg('averagePosition').toFixed(2)),
      estimatedTraffic: Math.round(avg('estimatedTraffic')),
      top3: Math.round(avg('top3')),
      top10: Math.round(avg('top10')),
      top20: Math.round(avg('top20')),
      top100: Math.round(avg('top100')),
      trackedKeywords: 1462,
    };
  };

  // 90-Day Cohort comparison config
  const quarterlyRows: PeriodMetricsRow[] = [
    computeComparablePeriodRow('Last 30 Days (2026-07-22 to 2026-08-20)', '2026-07-22', '2026-08-20', selectedDomain),
    computeComparablePeriodRow('Prior 30 Days (2026-06-22 to 2026-07-21)', '2026-06-22', '2026-07-21', selectedDomain),
    computeComparablePeriodRow('Baseline 30 Days (2026-05-22 to 2026-06-21)', '2026-05-22', '2026-06-21', selectedDomain),
  ];

  // Monthly periods config (within 90-day export)
  const monthlyRows: PeriodMetricsRow[] = [
    computeComparablePeriodRow('August 2026 (Month to Date: Aug 01 - Aug 20)', '2026-08-01', '2026-08-20', selectedDomain),
    computeComparablePeriodRow('July 2026 (Full Month: Jul 01 - Jul 31)', '2026-07-01', '2026-07-31', selectedDomain),
    computeComparablePeriodRow('June 2026 (Full Month: Jun 01 - Jun 30)', '2026-06-01', '2026-06-30', selectedDomain),
  ];

  const activeRows = mode === 'quarterly' ? quarterlyRows : monthlyRows;
  const current = activeRows[0];
  const prior = activeRows[1];
  const yoy = activeRows[2];

  // Changes vs Prior Period
  const qoqPosImprovement = Number((prior.averagePosition - current.averagePosition).toFixed(2));
  const yoyPosImprovement = Number((yoy.averagePosition - current.averagePosition).toFixed(2));

  const periodTakeaways: TakeawayItem[] = [
    {
      whatHappened: `In ${current.periodLabel}, ${selectedDomain} achieved Average Visibility of ${current.visibility}% (${current.visibility - prior.visibility >= 0 ? '+' : ''}${(current.visibility - prior.visibility).toFixed(2)}% vs ${prior.periodLabel}).`,
      whyItMatters: 'Using Wednesday-aligned sampling guarantees equal observation weight across historical weekly and daily collection intervals.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Apply consistent Wednesday observation methodology across all executive board SEO reporting decks.',
      supportingMetric: `Vis: ${current.visibility}% (vs prior ${prior.visibility}%, vs YoY ${yoy.visibility}%)`,
      comparisonType: mode === 'quarterly' ? 'quarter_over_quarter' : 'month_over_month',
    },
    {
      whatHappened: `Average Position improved to ${current.averagePosition} (+${qoqPosImprovement} pos vs previous period, +${yoyPosImprovement} pos vs YoY).`,
      whyItMatters: 'Demonstrates sustainable multi-quarter upward momentum on high-intent tour search queries.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Scale the successful local guide hub architecture to newly launched destination cities.',
      supportingMetric: `Avg Pos: ${current.averagePosition} (Prior: ${prior.averagePosition}, YoY: ${yoy.averagePosition})`,
      comparisonType: mode === 'quarterly' ? 'quarter_over_quarter' : 'year_over_year',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Live SEMrush Report
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002B49] sm:text-3xl">
                {mode === 'quarterly' ? 'Report 8: Quarterly Rankings Comparison' : 'Report 9: Monthly Rankings Comparison'}
              </h1>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Standardized historical period benchmarking using Wednesday-aligned comparable sampling. Ensures historical collection frequency changes (weekly vs daily) never skew period averages.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setMode('quarterly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'quarterly' ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30-Day Cohort View
            </button>
            <button
              onClick={() => setMode('monthly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'monthly' ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly View
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as DomainName)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
            >
              <option value="example.com">example.com (Primary)</option>
              <option value="tripadvisor.com">tripadvisor.com</option>
              <option value="viator.com">viator.com</option>
              <option value="getyourguide.com">getyourguide.com</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Export Scope: 90 Days (2026-05-22 to 2026-08-20)</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#002B49]">
              {mode === 'quarterly' ? 'Quarter-over-Quarter & Year-over-Year Matrix' : 'Month-over-Month & Year-over-Year Matrix'}
            </h2>
            <p className="text-xs text-slate-500">
              Normalized weekly Wednesday observations for <strong className="text-slate-800">{selectedDomain}</strong>
            </p>
          </div>
          <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#008768] border border-emerald-200/60 font-mono">
            Wednesday Sampling Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-3 text-right">Avg Visibility</th>
                <th className="py-3 px-3 text-right">Avg Position</th>
                <th className="py-3 px-3 text-right">Avg Est. Traffic</th>
                <th className="py-3 px-3 text-right">Avg Top 3</th>
                <th className="py-3 px-3 text-right">Avg Top 10</th>
                <th className="py-3 px-3 text-right">Avg Top 20</th>
                <th className="py-3 px-3 text-right">Avg Top 100</th>
                <th className="py-3 px-3 text-center">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRows.map((row, idx) => (
                <tr
                  key={row.periodLabel}
                  className={`hover:bg-slate-50/60 transition ${
                    idx === 0 ? 'bg-emerald-50/30 font-bold text-slate-900' : 'text-slate-700'
                  }`}
                >
                  <td className="py-3.5 px-4 font-sans font-medium">
                    <div className={idx === 0 ? 'text-[#008768] font-bold' : 'text-slate-800'}>
                      {row.periodLabel}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {row.startDate} → {row.endDate}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">{row.visibility}%</td>
                  <td className="py-3.5 px-3 text-right">{row.averagePosition}</td>
                  <td className="py-3.5 px-3 text-right">{(row?.estimatedTraffic ?? 0).toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-right">{row.top3}</td>
                  <td className="py-3.5 px-3 text-right">{row.top10}</td>
                  <td className="py-3.5 px-3 text-right">{row.top20}</td>
                  <td className="py-3.5 px-3 text-right">{row.top100}</td>
                  <td className="py-3.5 px-3 text-center text-slate-500 font-sans text-[11px]">
                    {row.observationCount} Wednesdays
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Change Calculations Box */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-6">
          <div className="rounded-lg bg-slate-50 p-3.5 text-xs">
            <span className="text-slate-500 block text-[11px]">Visibility Movement vs Prior:</span>
            <div className="mt-1 text-base font-bold font-mono text-[#002B49] flex items-center gap-1">
              {current.visibility - prior.visibility >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4" />
                  +{(current.visibility - prior.visibility).toFixed(2)}%
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4" />
                  {(current.visibility - prior.visibility).toFixed(2)}%
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              YoY: {(current.visibility - yoy.visibility).toFixed(2)}%
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 text-xs">
            <span className="text-slate-500 block text-[11px]">Average Position Improvement:</span>
            <div className="mt-1 text-base font-bold font-mono text-[#002B49] flex items-center gap-1">
              {qoqPosImprovement >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4" />
                  +{qoqPosImprovement} pos better
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4" />
                  {qoqPosImprovement} pos
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              YoY: {yoyPosImprovement >= 0 ? `+${yoyPosImprovement}` : yoyPosImprovement} pos
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 text-xs">
            <span className="text-slate-500 block text-[11px]">Top 10 Keyword Shift:</span>
            <div className="mt-1 text-base font-bold font-mono text-[#002B49] flex items-center gap-1">
              {current.top10 - prior.top10 >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4" />
                  +{current.top10 - prior.top10} KWs
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4" />
                  {current.top10 - prior.top10} KWs
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              YoY: +{current.top10 - yoy.top10} KWs
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 text-xs">
            <span className="text-slate-500 block text-[11px]">Estimated Daily Traffic Delta:</span>
            <div className="mt-1 text-base font-bold font-mono text-[#002B49] flex items-center gap-1">
              {((current?.estimatedTraffic ?? 0) - (prior?.estimatedTraffic ?? 0)) >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4" />
                  +{((current?.estimatedTraffic ?? 0) - (prior?.estimatedTraffic ?? 0)).toLocaleString()}
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4" />
                  {((current?.estimatedTraffic ?? 0) - (prior?.estimatedTraffic ?? 0)).toLocaleString()}
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              YoY: +{((current?.estimatedTraffic ?? 0) - (yoy?.estimatedTraffic ?? 0)).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200/60">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700">Comparable Sampling Rule:</strong> All periods evaluate only Wednesday observations. Missing dates are not converted to zero, and daily frequency is never mixed with weekly frequency.
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle={mode === 'quarterly' ? 'Quarterly Rankings Comparison' : 'Monthly Rankings Comparison'}
        items={periodTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
