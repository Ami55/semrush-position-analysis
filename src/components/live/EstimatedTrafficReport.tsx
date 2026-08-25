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
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
  Info,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface EstimatedTrafficReportProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
}

export const EstimatedTrafficReport: React.FC<EstimatedTrafficReportProps> = ({
  campaign,
  filter,
}) => {
  const [activeDomains, setActiveDomains] = useState<DomainName[]>([
    'toursbylocals.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ]);

  const domainColors: Record<DomainName, { color: string; strokeWidth: number }> = {
    'toursbylocals.com': { color: '#008768', strokeWidth: 3.5 },
    'tripadvisor.com': { color: '#00aa6c', strokeWidth: 2 },
    'viator.com': { color: '#e84c3d', strokeWidth: 2 },
    'getyourguide.com': { color: '#ff7700', strokeWidth: 2 },
  };

  const domains: DomainName[] = [
    'toursbylocals.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ];

  const rawCurrentObs = filterObservationsByDate(
    RAW_DAILY_OBSERVATIONS,
    filter.startDate,
    filter.endDate
  );

  const dateMap = new Map<string, Record<string, any>>();
  for (const obs of rawCurrentObs) {
    if (!dateMap.has(obs.date)) {
      dateMap.set(obs.date, { date: obs.date });
    }
    dateMap.get(obs.date)![obs.domain] = obs.estimatedTraffic;
  }
  const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

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

  const tbl = domainMetrics.find((d) => d.domain === 'toursbylocals.com') || domainMetrics[0];

  const trafficTakeaways: TakeawayItem[] = [
    {
      whatHappened: `ToursByLocals averaged ${(tbl?.currentEstimatedTraffic ?? 0).toLocaleString()} daily estimated traffic index points (+${(tbl?.trafficAbsChange ?? 0).toLocaleString()}, ${(tbl?.trafficPctChange ?? 0) >= 0 ? '+' : ''}${tbl?.trafficPctChange ?? 0}% vs prior period).`,
      whyItMatters: 'Modelled traffic growth reflects ranking improvements on high-volume search queries.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Align promotional tour inventory with the top 10 highest-traffic landing pages.',
      supportingMetric: `Avg Daily Est Traffic: ${(tbl?.currentEstimatedTraffic ?? 0).toLocaleString()} vs Prior ${(tbl?.comparisonEstimatedTraffic ?? 0).toLocaleString()}`,
      comparisonType: filter.comparisonPreset,
      dataLimitation: 'SEMrush Estimated Traffic is a modelled statistical index, not actual Google Analytics session traffic.',
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
                Report 7: Estimated Traffic Comparison
              </h1>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Compare the traffic potential estimated by SEMrush for the tracked keyword set. For multi-observation periods, metrics represent average daily estimated traffic.
            </p>
          </div>
        </div>

        {/* Required Caveat Box */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Required Methodological Caveat:</strong>
            SEMrush Estimated Traffic is a modelled estimate based on the tracked keyword set, ranking positions and expected click-through rates. It is not actual organic traffic from Google Analytics or Google Search Console.
          </div>
        </div>
      </div>

      {/* Domain Scorecards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Average Estimated Daily Traffic Index
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            vs {filter.comparisonPreset.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainMetrics.map((dm) => {
            const isTBL = dm.domain === 'toursbylocals.com';
            const isPositive = dm.trafficAbsChange >= 0;

            return (
              <div
                key={dm.domain}
                className={`rounded-xl border p-5 transition ${
                  isTBL
                    ? 'border-[#008768] bg-emerald-50/20 shadow-md ring-1 ring-[#008768]/20'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isTBL ? 'text-[#008768]' : 'text-slate-800'}`}>
                    {isTBL ? '★ ToursByLocals' : dm.domain}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600">
                    Live
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#002B49] font-mono">
                    {(dm?.currentEstimatedTraffic ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">index / day</span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  {isPositive ? (
                    <span className="flex items-center font-bold text-emerald-600">
                      <ArrowUpRight className="h-4 w-4" />
                      +{((dm?.trafficAbsChange ?? 0)).toLocaleString()}
                    </span>
                  ) : (
                    <span className="flex items-center font-bold text-rose-600">
                      <ArrowDownRight className="h-4 w-4" />
                      {((dm?.trafficAbsChange ?? 0)).toLocaleString()}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500">
                    ({dm.trafficPctChange >= 0 ? '+' : ''}{dm.trafficPctChange}%)
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Previous Average:</span>
                  <strong className="font-mono text-slate-700">
                    {(dm?.comparisonEstimatedTraffic ?? 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#002B49]">
              Estimated Traffic Potential Trend
            </h2>
            <p className="text-xs text-slate-500">
              Daily modelled click potential calculated from tracked ranking positions and search volume.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (activeDomains.includes(d)) {
                    if (activeDomains.length > 1) setActiveDomains(activeDomains.filter((item) => item !== d));
                  } else {
                    setActiveDomains([...activeDomains, d]);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  activeDomains.includes(d)
                    ? 'border border-slate-300 bg-slate-100 text-slate-800 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: activeDomains.includes(d) ? domainColors[d].color : '#cbd5e1' }}
                />
                <span>{d.replace('.com', '')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm text-xs font-mono">
                        <div className="font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 font-sans">
                          {label}
                        </div>
                        {payload.map((entry: any) => (
                          <div
                            key={entry.name}
                            className={`flex items-center justify-between gap-4 ${
                              entry.name === 'toursbylocals.com' ? 'font-bold text-[#008768]' : 'text-slate-600'
                            }`}
                          >
                            <span>{entry.name}:</span>
                            <span>{Number(entry.value || 0).toLocaleString()} traffic</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }} />
              {activeDomains.map((d) => (
                <Line
                  key={d}
                  type="monotone"
                  dataKey={d}
                  name={d}
                  stroke={domainColors[d].color}
                  strokeWidth={domainColors[d].strokeWidth}
                  dot={chartData.length <= 14}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Estimated Traffic Potential"
        items={trafficTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
