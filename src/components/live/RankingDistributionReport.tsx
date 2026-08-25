import React from 'react';
import {
  CampaignConfig,
  DateFilterState,
  DomainAggregatedMetric,
  DomainName,
  TakeawayItem,
} from '../../types';
import { calculateDomainPeriodMetrics } from '../../utils/calculations';
import { RAW_DAILY_OBSERVATIONS } from '../../data/liveData';
import { KeyTakeaways } from '../KeyTakeaways';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface RankingDistributionReportProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
}

export const RankingDistributionReport: React.FC<RankingDistributionReportProps> = ({
  campaign,
  filter,
}) => {
  const domains: DomainName[] = [
    'toursbylocals.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ];

  const domainMetrics: DomainAggregatedMetric[] = domains.map((domain) =>
    calculateDomainPeriodMetrics(
      RAW_DAILY_OBSERVATIONS,
      domain,
      filter.startDate,
      filter.endDate,
      filter.comparisonStartDate,
      filter.comparisonEndDate
    )
  );

  const tbl = domainMetrics.find((d) => d.domain === 'toursbylocals.com')!;

  // Prepare grouped bar chart data (Cumulative buckets: Top 3, Top 10, Top 20, Top 100)
  const chartData = [
    {
      bucket: 'Top 3 Keywords',
      'toursbylocals.com': tbl.currentTop3,
      'tripadvisor.com': domainMetrics.find((d) => d.domain === 'tripadvisor.com')?.currentTop3 || 0,
      'viator.com': domainMetrics.find((d) => d.domain === 'viator.com')?.currentTop3 || 0,
      'getyourguide.com': domainMetrics.find((d) => d.domain === 'getyourguide.com')?.currentTop3 || 0,
    },
    {
      bucket: 'Top 10 Keywords',
      'toursbylocals.com': tbl.currentTop10,
      'tripadvisor.com': domainMetrics.find((d) => d.domain === 'tripadvisor.com')?.currentTop10 || 0,
      'viator.com': domainMetrics.find((d) => d.domain === 'viator.com')?.currentTop10 || 0,
      'getyourguide.com': domainMetrics.find((d) => d.domain === 'getyourguide.com')?.currentTop10 || 0,
    },
    {
      bucket: 'Top 20 Keywords',
      'toursbylocals.com': tbl.currentTop20,
      'tripadvisor.com': domainMetrics.find((d) => d.domain === 'tripadvisor.com')?.currentTop20 || 0,
      'viator.com': domainMetrics.find((d) => d.domain === 'viator.com')?.currentTop20 || 0,
      'getyourguide.com': domainMetrics.find((d) => d.domain === 'getyourguide.com')?.currentTop20 || 0,
    },
    {
      bucket: 'Top 100 Keywords',
      'toursbylocals.com': tbl.currentTop100,
      'tripadvisor.com': domainMetrics.find((d) => d.domain === 'tripadvisor.com')?.currentTop100 || 0,
      'viator.com': domainMetrics.find((d) => d.domain === 'viator.com')?.currentTop100 || 0,
      'getyourguide.com': domainMetrics.find((d) => d.domain === 'getyourguide.com')?.currentTop100 || 0,
    },
  ];

  const distributionTakeaways: TakeawayItem[] = [
    {
      whatHappened: `ToursByLocals holds ${tbl.currentTop3} keywords in Top 3 (+${tbl.top3AbsChange} vs prior) and ${tbl.currentTop10} keywords in Top 10 (+${tbl.top10AbsChange} vs prior).`,
      whyItMatters: 'Rankings in Top 3 and Top 10 drive the vast majority of mobile travel search conversions.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Focus on advancing the ${tbl.currentTop20 - tbl.currentTop10} keywords ranking in Top 20 into the Top 10.',
      supportingMetric: `Top 3: ${tbl.currentTop3} (${tbl.top3PctChange >= 0 ? '+' : ''}${tbl.top3PctChange}%), Top 10: ${tbl.currentTop10} (${tbl.top10PctChange >= 0 ? '+' : ''}${tbl.top10PctChange}%)`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `In Top 100 visibility, ToursByLocals indexes ${tbl.currentTop100} of 1,462 tracked keywords (${((tbl.currentTop100 / 1462) * 100).toFixed(1)}% market coverage).`,
      whyItMatters: 'Strong broad indexation provides a healthy funnel base for continuous rank elevation.',
      opportunityOrRisk: 'neutral',
      recommendedAction: 'Improve click-through rates by optimizing mobile title tags with localized pricing & private guide callouts.',
      supportingMetric: `Top 100: ${tbl.currentTop100} / 1,462 KWs`,
      comparisonType: filter.comparisonPreset,
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
                Report 6: Ranking Distribution — TBL vs Competitors
              </h1>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Compares the number of tracked keywords ranking within the Top 3, Top 10, Top 20 and Top 100 results for ToursByLocals and its main competitors. Ranking buckets are cumulative and must not be added together.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Domain Distribution KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Primary Domain Cumulative Ranking Buckets
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Average weekly keywords across period
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Top 3 */}
          <div className="rounded-xl border border-[#008768] bg-emerald-50/20 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#008768]">Keywords in Top 3</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">Prime CTR</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#002B49] font-mono">{tbl.currentTop3}</span>
              <span className="text-xs text-slate-400">/ 1,462 KWs</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`flex items-center font-bold ${tbl.top3AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tbl.top3AbsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {tbl.top3AbsChange >= 0 ? '+' : ''}{tbl.top3AbsChange} KWs
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({tbl.top3PctChange >= 0 ? '+' : ''}{tbl.top3PctChange}%)
              </span>
            </div>
            <div className="mt-3 border-t border-emerald-100 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Prior Average:</span>
              <strong className="font-mono text-slate-700">{tbl.comparisonTop3}</strong>
            </div>
          </div>

          {/* Top 10 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Keywords in Top 10</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">Page 1</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#002B49] font-mono">{tbl.currentTop10}</span>
              <span className="text-xs text-slate-400">/ 1,462 KWs</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`flex items-center font-bold ${tbl.top10AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tbl.top10AbsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {tbl.top10AbsChange >= 0 ? '+' : ''}{tbl.top10AbsChange} KWs
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({tbl.top10PctChange >= 0 ? '+' : ''}{tbl.top10PctChange}%)
              </span>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Prior Average:</span>
              <strong className="font-mono text-slate-700">{tbl.comparisonTop10}</strong>
            </div>
          </div>

          {/* Top 20 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Keywords in Top 20</span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold text-sky-800">Striking</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#002B49] font-mono">{tbl.currentTop20}</span>
              <span className="text-xs text-slate-400">/ 1,462 KWs</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`flex items-center font-bold ${tbl.top20AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tbl.top20AbsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {tbl.top20AbsChange >= 0 ? '+' : ''}{tbl.top20AbsChange} KWs
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({tbl.top20PctChange >= 0 ? '+' : ''}{tbl.top20PctChange}%)
              </span>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Prior Average:</span>
              <strong className="font-mono text-slate-700">{tbl.comparisonTop20}</strong>
            </div>
          </div>

          {/* Top 100 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Keywords in Top 100</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">Total Ranked</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#002B49] font-mono">{tbl.currentTop100}</span>
              <span className="text-xs text-slate-400">/ 1,462 KWs</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`flex items-center font-bold ${tbl.top100AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tbl.top100AbsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {tbl.top100AbsChange >= 0 ? '+' : ''}{tbl.top100AbsChange} KWs
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({tbl.top100PctChange >= 0 ? '+' : ''}{tbl.top100PctChange}%)
              </span>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Prior Average:</span>
              <strong className="font-mono text-slate-700">{tbl.comparisonTop100}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart: TBL vs Competitors */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-base font-bold text-[#002B49]">
            Cumulative Ranking Distribution vs Competitors
          </h2>
          <p className="text-xs text-slate-500">
            Number of keywords ranking within cumulative buckets (Top 3 ⊂ Top 10 ⊂ Top 20 ⊂ Top 100).
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 2500]} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value || 0).toLocaleString()} Keywords`,
                  name === 'toursbylocals.com' ? '★ ToursByLocals' : name,
                ]}
                contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              <Bar dataKey="toursbylocals.com" name="toursbylocals.com" fill="#008768" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tripadvisor.com" name="tripadvisor.com" fill="#00aa6c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="viator.com" name="viator.com" fill="#e84c3d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="getyourguide.com" name="getyourguide.com" fill="#ff7700" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor Breakdown Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-2.5 px-4">Domain</th>
                <th className="py-2.5 px-4 text-right">Top 3</th>
                <th className="py-2.5 px-4 text-right">Top 10</th>
                <th className="py-2.5 px-4 text-right">Top 20</th>
                <th className="py-2.5 px-4 text-right">Top 100</th>
                <th className="py-2.5 px-4 text-right">Total Tracked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {domainMetrics.map((dm) => {
                const isTBL = dm.domain === 'toursbylocals.com';
                return (
                  <tr
                    key={dm.domain}
                    className={`hover:bg-slate-50/60 transition ${
                      isTBL ? 'bg-emerald-50/30 font-bold text-[#008768]' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans font-medium">
                      {isTBL ? '★ toursbylocals.com' : dm.domain}
                    </td>
                    <td className="py-2.5 px-4 text-right">{(dm.currentTop3 ?? 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">{(dm.currentTop10 ?? 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">{(dm.currentTop20 ?? 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right">{(dm.currentTop100 ?? 0).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400">1,462</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200/60">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700">Cumulative Buckets Rule:</strong> Top 3, Top 10, Top 20 and Top 100 in SEMrush are nested cumulative sets (e.g. keywords in Top 3 are also part of Top 10). They must never be added together.
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Ranking Distribution — Cumulative Buckets"
        items={distributionTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
