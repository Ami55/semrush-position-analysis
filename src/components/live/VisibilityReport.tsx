import React, { useState } from 'react';
import {
  CampaignConfig,
  DateFilterState,
  DomainAggregatedMetric,
  DomainName,
  TakeawayItem,
} from '../../types';
import { calculateDomainPeriodMetrics, filterObservationsByDate } from '../../utils/calculations';
import { RAW_DAILY_OBSERVATIONS } from '../../data/liveData';
import { KeyTakeaways } from '../KeyTakeaways';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Info,
  Layers,
  Percent,
  Sliders,
  TrendingUp,
} from 'lucide-react';

interface VisibilityReportProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
}

export const VisibilityReport: React.FC<VisibilityReportProps> = ({
  campaign,
  filter,
}) => {
  const [activeDomains, setActiveDomains] = useState<DomainName[]>([
    'example.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ]);

  const domainColors: Record<DomainName, { color: string; label: string; strokeWidth: number }> = {
    'example.com': { color: '#008768', label: 'Example Travel (Primary)', strokeWidth: 3.5 },
    'tripadvisor.com': { color: '#00aa6c', label: 'Tripadvisor', strokeWidth: 2 },
    'viator.com': { color: '#e84c3d', label: 'Viator', strokeWidth: 2 },
    'getyourguide.com': { color: '#ff7700', label: 'GetYourGuide', strokeWidth: 2 },
  };

  const toggleDomainLine = (domain: DomainName) => {
    if (activeDomains.includes(domain)) {
      if (activeDomains.length === 1) return;
      setActiveDomains(activeDomains.filter((d) => d !== domain));
    } else {
      setActiveDomains([...activeDomains, domain]);
    }
  };

  // Prepare chart time-series data for the selected period
  const rawCurrentObs = filterObservationsByDate(
    RAW_DAILY_OBSERVATIONS,
    filter.startDate,
    filter.endDate
  );

  // Group by date
  const dateMap = new Map<string, Record<string, any>>();
  for (const obs of rawCurrentObs) {
    if (!dateMap.has(obs.date)) {
      dateMap.set(obs.date, { date: obs.date });
    }
    dateMap.get(obs.date)![obs.domain] = obs.visibility;
  }
  const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Compute domain scorecards
  const domains: DomainName[] = [
    'example.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ];

  const domainScorecards: DomainAggregatedMetric[] = domains.map((domain) =>
    calculateDomainPeriodMetrics(
      RAW_DAILY_OBSERVATIONS,
      domain,
      filter.startDate,
      filter.endDate,
      filter.comparisonStartDate,
      filter.comparisonEndDate
    )
  );

  const primaryScorecard = domainScorecards.find((d) => d.domain === 'example.com')!;

  // Key takeaways for visibility report
  const visibilityTakeaways: TakeawayItem[] = [
    {
      whatHappened: `Example Travel achieved an average Visibility of ${primaryScorecard.currentVisibility}%, an absolute gain of ${primaryScorecard.visibilityAbsChange >= 0 ? '+' : ''}${primaryScorecard.visibilityAbsChange}% vs comparison period.`,
      whyItMatters: 'Higher Visibility reflects a larger proportion of tracked keywords climbing into the click-driving Top 3 and Top 10 positions.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Protect momentum by auditing high-performing landing pages and expanding city-guide schema coverage.',
      supportingMetric: `PRIMARY: ${primaryScorecard.currentVisibility}% (Prior: ${primaryScorecard.comparisonVisibility}%)`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `TripAdvisor leads total market visibility at ${domainScorecards.find(d => d.domain === 'tripadvisor.com')?.currentVisibility}%, while Viator stands at ${domainScorecards.find(d => d.domain === 'viator.com')?.currentVisibility}%.`,
      whyItMatters: 'Aggregators maintain broad footprint across high-volume general destination keywords.',
      opportunityOrRisk: 'neutral',
      recommendedAction: 'Focus SEO on high-margin bespoke, private guide, and customized shore excursion clusters where PRIMARY out-converts aggregators.',
      supportingMetric: `Market Leader Gap: ${(domainScorecards.find(d => d.domain === 'tripadvisor.com')?.currentVisibility || 0) - primaryScorecard.currentVisibility}%`,
      comparisonType: 'competitive',
      dataLimitation: 'Based on 1,462 tracked keywords in Google US Mobile campaign.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Live SEMrush Report
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002B49] sm:text-3xl">
                Visibility Trend &amp; Scorecards
              </h1>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Shows how Example Travel’ organic search visibility changes over time compared with key competitors across the keywords tracked in SEMrush. Higher visibility indicates stronger ranking positions and greater potential to earn clicks from the tracked keyword set.
            </p>
          </div>
        </div>
      </div>

      {/* Report 2: Visibility Scorecards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Report 2: Domain Visibility Scorecards
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            vs {filter.comparisonPreset.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainScorecards.map((sc) => {
            const isPRIMARY = sc.domain === 'example.com';
            const isPositive = sc.visibilityAbsChange >= 0;

            return (
              <div
                key={sc.domain}
                className={`rounded-xl border p-5 transition ${
                  isPRIMARY
                    ? 'border-[#008768] bg-emerald-50/20 shadow-md ring-1 ring-[#008768]/20'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isPRIMARY ? 'text-[#008768]' : 'text-slate-800'
                    }`}
                  >
                    {isPRIMARY ? '★ Example Travel' : sc.domain}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600">
                    Live
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#002B49] font-mono">
                    {sc.currentVisibility}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">vis score</span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  {isPositive ? (
                    <span className="flex items-center font-bold text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                      +{sc.visibilityAbsChange}%
                    </span>
                  ) : (
                    <span className="flex items-center font-bold text-rose-600">
                      <ArrowDownRight className="h-4 w-4" />
                      {sc.visibilityAbsChange}%
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500">
                    ({sc.visibilityPctChange >= 0 ? '+' : ''}{sc.visibilityPctChange}%)
                  </span>
                  <span className={`ml-auto text-[10px] font-semibold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isPositive ? 'Improved' : 'Declined'}
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Previous Period:</span>
                  <strong className="font-mono text-slate-700">{sc.comparisonVisibility}%</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report 1: Visibility Trend Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#002B49]">
              Report 1: Visibility Time-Series Trend
            </h2>
            <p className="text-xs text-slate-500">
              Daily SEMrush visibility index (%) across selected period. Example Travel is highlighted.
            </p>
          </div>

          {/* Toggleable Competitors */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Toggle Domains:</span>
            {domains.map((d) => {
              const active = activeDomains.includes(d);
              const info = domainColors[d];
              return (
                <button
                  key={d}
                  onClick={() => toggleDomainLine(d)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? 'border border-slate-300 bg-slate-100 text-slate-800 shadow-2xs font-semibold'
                      : 'border border-transparent text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: active ? info.color : '#cbd5e1' }}
                  />
                  <span>{d.replace('.com', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm text-xs">
                        <div className="font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 font-mono">
                          {label}
                        </div>
                        <div className="space-y-1">
                          {payload.map((entry: any) => (
                            <div
                              key={entry.name}
                              className={`flex items-center justify-between gap-4 font-mono ${
                                entry.name === 'example.com' ? 'font-bold text-[#008768]' : 'text-slate-600'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}:
                              </span>
                              <span>{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
                formatter={(val) => (
                  <span className={val === 'example.com' ? 'font-bold text-[#008768]' : 'text-slate-600'}>
                    {val}
                  </span>
                )}
              />
              {activeDomains.map((d) => (
                <Line
                  key={d}
                  type="monotone"
                  dataKey={d}
                  name={d}
                  stroke={domainColors[d].color}
                  strokeWidth={domainColors[d].strokeWidth}
                  dot={chartData.length <= 14}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Methodology note */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200/60">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700">SEMrush Visibility Calculation:</strong> Visibility is an index based on click-through rate (CTR) that represents a domain's likelihood of earning clicks across the tracked 1,462 keyword set in Google Mobile US. Higher is better. It is never summed over time; period values represent daily observation averages.
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Visibility Trend & Scorecards"
        items={visibilityTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
