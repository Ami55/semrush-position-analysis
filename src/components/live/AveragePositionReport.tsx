import React, { useState } from 'react';
import {
  CampaignConfig,
  DateFilterState,
  DomainAggregatedMetric,
  DomainName,
  PositionGapData,
  TakeawayItem,
} from '../../types';
import {
  calculateDomainPeriodMetrics,
  calculatePositionGaps,
  filterObservationsByDate,
} from '../../utils/calculations';
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
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Flame,
  Info,
  Sliders,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface AveragePositionReportProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
}

export const AveragePositionReport: React.FC<AveragePositionReportProps> = ({
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

  const toggleDomainLine = (domain: DomainName) => {
    if (activeDomains.includes(domain)) {
      if (activeDomains.length === 1) return;
      setActiveDomains(activeDomains.filter((d) => d !== domain));
    } else {
      setActiveDomains([...activeDomains, domain]);
    }
  };

  // Observations for chart
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
    dateMap.get(obs.date)![obs.domain] = obs.averagePosition;
  }
  const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Compute domain scorecards
  const domains: DomainName[] = [
    'toursbylocals.com',
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

  const tblScorecard = domainScorecards.find((d) => d.domain === 'toursbylocals.com')!;
  const gaps: PositionGapData[] = calculatePositionGaps(filter, RAW_DAILY_OBSERVATIONS);

  // Takeaways
  const avgPosTakeaways: TakeawayItem[] = [
    {
      whatHappened: `ToursByLocals Average Position improved to ${tblScorecard.currentAveragePosition} (up ${tblScorecard.positionImprovement} rank positions from ${tblScorecard.comparisonAveragePosition}).`,
      whyItMatters: 'Lower Average Position values indicate stronger search rankings closer to top page-one positions.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Target striking distance positions 11-20 to push the overall domain average position below 18.0.',
      supportingMetric: `Current: ${tblScorecard.currentAveragePosition} vs Prior: ${tblScorecard.comparisonAveragePosition}`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `The competitive ranking gap vs GetYourGuide narrowed by ${gaps[2]?.gapImprovement >= 0 ? '+' : ''}${gaps[2]?.gapImprovement} positions to +${gaps[2]?.currentGap}.`,
      whyItMatters: 'Closing the gap against major OTA aggregators demonstrates accelerating authority in curated local tours.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Amplify guide credentials and authentic photo galleries to reinforce high user engagement signals.',
      supportingMetric: `GYG Gap: +${gaps[2]?.currentGap} pos (prior +${gaps[2]?.comparisonGap})`,
      comparisonType: 'competitive',
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
                Average Position &amp; Competitor Gaps
              </h1>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
              Shows how the average ranking position of ToursByLocals and key competitors changes over time across the tracked keyword set. Lower Average Position values indicate stronger search rankings. Position 1 is top.
            </p>
          </div>
        </div>
      </div>

      {/* Report 4: Average Position Scorecards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Report 4: Average Position Scorecards (Lower is Better)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            vs {filter.comparisonPreset.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainScorecards.map((sc) => {
            const isTBL = sc.domain === 'toursbylocals.com';
            // Position improvement = Previous - Current. Positive = Green (better ranking)
            const isImproved = sc.positionImprovement >= 0;

            return (
              <div
                key={sc.domain}
                className={`rounded-xl border p-5 transition ${
                  isTBL
                    ? 'border-[#008768] bg-emerald-50/20 shadow-md ring-1 ring-[#008768]/20'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isTBL ? 'text-[#008768]' : 'text-slate-800'
                    }`}
                  >
                    {isTBL ? '★ ToursByLocals' : sc.domain}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600">
                    Live
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#002B49] font-mono">
                    {sc.currentAveragePosition}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">avg rank</span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  {isImproved ? (
                    <span className="flex items-center font-bold text-emerald-600" title="Improved: lower number is higher search rank">
                      <ArrowUpRight className="h-4 w-4" />
                      +{sc.positionImprovement} pos
                    </span>
                  ) : (
                    <span className="flex items-center font-bold text-rose-600" title="Declined: higher number is lower rank">
                      <ArrowDownRight className="h-4 w-4" />
                      {sc.positionImprovement} pos
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500">
                    ({sc.positionImprovementPct >= 0 ? '+' : ''}{sc.positionImprovementPct}%)
                  </span>
                  <span className={`ml-auto text-[10px] font-semibold ${isImproved ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isImproved ? 'Improved' : 'Declined'}
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Previous Average:</span>
                  <strong className="font-mono text-slate-700">{sc.comparisonAveragePosition}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report 5: Position Gap vs Competitors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Report 5: Position Gap vs Competitors
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Gap = Primary Domain Avg Pos − Competitor Avg Pos (Smaller positive gap = improvement)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {gaps.map((gap) => {
            // Gap improvement = Previous Gap - Current Gap. Positive = Green.
            const isGapImproved = gap.gapImprovement >= 0;

            return (
              <div
                key={gap.competitor}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    TBL vs {gap.competitor.replace('.com', '')}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isGapImproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isGapImproved ? 'Gap Narrowing' : 'Gap Expanding'}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#002B49] font-mono">
                    +{gap.currentGap}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">pos behind</span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                  <span
                    className={`flex items-center font-bold ${
                      isGapImproved ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isGapImproved ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {gap.gapImprovement >= 0 ? '+' : ''}{gap.gapImprovement} pos improvement
                  </span>
                </div>

                <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 font-mono">
                  <div className="flex justify-between">
                    <span>TBL Rank: <strong>{gap.tblCurrentPos}</strong></span>
                    <span>Competitor: <strong>{gap.competitorCurrentPos}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Previous Gap: +{gap.comparisonGap}</span>
                    <span>Gap Shift: {gap.gapChange > 0 ? `+${gap.gapChange}` : gap.gapChange}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report 3: Average Position Trend Chart (Inverted Y-Axis) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#002B49]">
                Report 3: Average Position Time-Series Trend
              </h2>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Inverted Axis: Top = Rank #1
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Curves near top represent stronger search engine rankings (Position 1 is best).
            </p>
          </div>

          {/* Toggleable Domains */}
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Chart with Inverted Y-Axis */}
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
                reversed={true} // Position 1 near top!
                domain={[5, 25]}
                tickFormatter={(val) => `Pos ${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm text-xs">
                        <div className="font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 font-mono">
                          {label} (Lower is better)
                        </div>
                        <div className="space-y-1">
                          {payload.map((entry: any) => (
                            <div
                              key={entry.name}
                              className={`flex items-center justify-between gap-4 font-mono ${
                                entry.name === 'toursbylocals.com' ? 'font-bold text-[#008768]' : 'text-slate-600'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}:
                              </span>
                              <span>Position {entry.value}</span>
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
                  <span className={val === 'toursbylocals.com' ? 'font-bold text-[#008768]' : 'text-slate-600'}>
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

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200/60">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700">Average Position Rule:</strong> SEMrush Average Position is the unweighted or weighted mean ranking position of all tracked keywords in the campaign for a given domain on mobile Google US. It is never summed across days; period values reflect true daily averages. Lower values are superior.
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Average Position & Competitor Benchmark"
        items={avgPosTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
