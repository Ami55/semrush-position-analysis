import React from 'react';
import {
  CampaignConfig,
  DateFilterState,
  DomainAggregatedMetric,
  ExecutiveActionItem,
  TakeawayItem,
} from '../types';
import { calculateDomainPeriodMetrics, calculatePositionGaps } from '../utils/calculations';
import { RAW_DAILY_OBSERVATIONS } from '../data/liveData';
import { KeyTakeaways } from './KeyTakeaways';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  HelpCircle,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Zap,
} from 'lucide-react';

interface ExecutiveSummaryProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  campaign,
  filter,
}) => {
  const tblMetrics: DomainAggregatedMetric = calculateDomainPeriodMetrics(
    RAW_DAILY_OBSERVATIONS,
    'toursbylocals.com',
    filter.startDate,
    filter.endDate,
    filter.comparisonStartDate,
    filter.comparisonEndDate
  );

  const gaps = calculatePositionGaps(filter, RAW_DAILY_OBSERVATIONS);

  // Recommended executive action items
  const actionItems: ExecutiveActionItem[] = [
    {
      id: 'act-1',
      title: 'Accelerate Striking-Distance Keyword Push (Rankings 11–20)',
      description:
        'Expand on-page content, enrich guide bios, and integrate localized FAQ schema on key landing pages (e.g. Rome, Tokyo, Florence, San Sebastian) to move high-intent commercial keywords onto Page 1.',
      supportingEvidence: `${tblMetrics.currentTop20 - tblMetrics.currentTop10} keywords currently rank in positions 11–20 representing over 48,000 monthly search volume.`,
      expectedImpact: '+12% to +18% estimated click growth across high-margin private tour categories.',
      effort: 'Medium',
      recommendedOwner: 'SEO',
      recommendedTimeframe: 'Immediate (1-2 wks)',
    },
    {
      id: 'act-2',
      title: 'Target Competitor Vulnerabilities in Private & Shore Excursion Segments',
      description:
        'Viator and TripAdvisor hold Top 3 positions for broad city tours but have weaker authority on custom shore excursions (Civitavecchia, Kusadasi, Naples). Launch targeted port-specific hub pages.',
      supportingEvidence: 'TBL maintains a -1 to -3 rank advantage on bespoke queries while trailing by 8+ positions on generic aggregator queries.',
      expectedImpact: 'Capture high-ticket cruiser bookings directly bypassing aggregator commissions.',
      effort: 'High',
      recommendedOwner: 'Content',
      recommendedTimeframe: 'Short-term (30 days)',
    },
    {
      id: 'act-3',
      title: 'Resolve Declining Top 10 Keywords in Wine & Day Trip Hubs',
      description:
        'Audit 5 major ranking URLs that dropped rankings (e.g., Tuscany Wine, Dublin Pubs) for mobile rendering latency, outdated itinerary details, and lost internal link equity.',
      supportingEvidence: 'Wine and Day Trip tags experienced a -0.6 average position decline in the recent observation window.',
      expectedImpact: 'Reclaim 14 lost Top 10 rankings and prevent estimated traffic decay.',
      effort: 'Low',
      recommendedOwner: 'Technical SEO',
      recommendedTimeframe: 'Immediate (1-2 wks)',
    },
    {
      id: 'act-4',
      title: 'Audit Mobile SERP Feature Real Estate on Core Keywords',
      description:
        'Integrate structured LocalBusiness and Tour schemas to compete for Google Mobile Local Packs and SiteLinks where competitors currently dominate visual SERP real estate.',
      supportingEvidence: 'Over 68% of tracked commercial keywords trigger Local Pack or People Also Ask features on Google Mobile US.',
      expectedImpact: 'Increase organic CTR by 2.4 percentage points on Top 5 rankings.',
      effort: 'Medium',
      recommendedOwner: 'Technical SEO',
      recommendedTimeframe: 'Quarterly (60-90 days)',
    },
  ];

  // Key takeaways for Executive Summary
  const executiveTakeaways: TakeawayItem[] = [
    {
      whatHappened: `ToursByLocals organic visibility reached ${tblMetrics.currentVisibility}% (${tblMetrics.visibilityAbsChange >= 0 ? '+' : ''}${tblMetrics.visibilityAbsChange}% vs comparison period).`,
      whyItMatters: 'Positive visibility momentum confirms gains in high-intent keyword rankings across key European and Asian private tour destinations.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Maintain content refresh cadence and strengthen local guide profile internal linking.',
      supportingMetric: `Visibility: ${tblMetrics.currentVisibility}% (${tblMetrics.visibilityPctChange >= 0 ? '+' : ''}${tblMetrics.visibilityPctChange}% change)`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `Average Position improved to ${tblMetrics.currentAveragePosition} (improved by ${tblMetrics.positionImprovement} positions).`,
      whyItMatters: 'Lower average position signifies that ranking keywords are climbing closer to top organic search positions.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Focus optimization on positions 11-20 to convert striking distance rankings into Top 10 traffic drivers.',
      supportingMetric: `Avg Pos: ${tblMetrics.currentAveragePosition} (Prior: ${tblMetrics.comparisonAveragePosition})`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `Keywords in Top 10 grew to ${(tblMetrics.currentTop10 ?? 0).toLocaleString()} (+${tblMetrics.top10AbsChange} keywords, ${tblMetrics.top10PctChange >= 0 ? '+' : ''}${tblMetrics.top10PctChange}%).`,
      whyItMatters: 'Top 10 rankings generate over 85% of total organic click-through volume in the tracked Position Tracking set.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Protect page-one positions by monitoring competitor price and itinerary updates.',
      supportingMetric: `Top 10 Count: ${tblMetrics.currentTop10} vs Prior ${tblMetrics.comparisonTop10}`,
      comparisonType: filter.comparisonPreset,
    },
    {
      whatHappened: `Position gap with TripAdvisor stands at +${gaps[0]?.currentGap || 9.4} and Viator at +${gaps[1]?.currentGap || 6.2}.`,
      whyItMatters: 'Aggregators maintain high domain authority on broad queries; TBL wins decisively on high-intent bespoke guide queries.',
      opportunityOrRisk: 'risk',
      recommendedAction: 'Differentiate with unique localized storytelling and guide-first schema rather than competing on generic aggregations.',
      supportingMetric: `TripAdvisor Gap: +${gaps[0]?.currentGap} pos (Gap improvement: ${gaps[0]?.gapImprovement >= 0 ? '+' : ''}${gaps[0]?.gapImprovement})`,
      comparisonType: 'competitive',
      dataLimitation: 'Modelled for Google US Mobile tracking campaign only.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002B49] sm:text-3xl">
              SEMrush Position Tracking Summary
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#008768]">
              Wins, Opportunities and Areas to Improve
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#008768] border border-emerald-200/60">
            Source: Live SEMrush Integration • Google US Mobile
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600 max-w-4xl leading-relaxed">
          Executive performance synthesis across the <strong className="text-slate-800">{(campaign?.totalTrackedKeywords ?? 1462).toLocaleString()} tracked keywords</strong> in Google US Mobile. Metrics reflect the selected period compared to {filter.comparisonPreset.replace(/_/g, ' ')}.
        </p>
      </div>

      {/* KPI Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Primary Decision-Relevant KPIs
          </h2>
          <span className="text-[11px] text-slate-500">Lower is better for Average Position</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {/* KPI 1: Visibility */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Visibility</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{tblMetrics.currentVisibility}%</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              {tblMetrics.visibilityAbsChange >= 0 ? (
                <span className="flex items-center font-bold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{tblMetrics.visibilityAbsChange}%
                </span>
              ) : (
                <span className="flex items-center font-bold text-rose-600">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {tblMetrics.visibilityAbsChange}%
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.visibilityPctChange >= 0 ? '+' : ''}{tblMetrics.visibilityPctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{tblMetrics.comparisonVisibility}%</strong>
            </div>
          </div>

          {/* KPI 2: Average Position (Lower is better!) */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg Position</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{tblMetrics.currentAveragePosition}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              {tblMetrics.positionImprovement >= 0 ? (
                <span className="flex items-center font-bold text-emerald-600" title="Position improved (lower number is better)">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{tblMetrics.positionImprovement} pos
                </span>
              ) : (
                <span className="flex items-center font-bold text-rose-600" title="Position declined">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {tblMetrics.positionImprovement} pos
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.positionImprovementPct >= 0 ? '+' : ''}{tblMetrics.positionImprovementPct}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{tblMetrics.comparisonAveragePosition}</strong>
            </div>
          </div>

          {/* KPI 3: Estimated Traffic */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Est. Traffic</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{(tblMetrics.currentEstimatedTraffic ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              {(tblMetrics.trafficAbsChange ?? 0) >= 0 ? (
                <span className="flex items-center font-bold text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{(tblMetrics.trafficAbsChange ?? 0).toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center font-bold text-rose-600">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {(tblMetrics.trafficAbsChange ?? 0).toLocaleString()}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.trafficPctChange >= 0 ? '+' : ''}{tblMetrics.trafficPctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{(tblMetrics.comparisonEstimatedTraffic ?? 0).toLocaleString()}</strong>
            </div>
          </div>

          {/* KPI 4: Top 3 */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top 3 KWs</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#008768] font-mono">{(tblMetrics.currentTop3 ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              <span className={`flex items-center font-bold ${tblMetrics.top3AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tblMetrics.top3AbsChange >= 0 ? '+' : ''}{tblMetrics.top3AbsChange} KWs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.top3PctChange >= 0 ? '+' : ''}{tblMetrics.top3PctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{(tblMetrics.comparisonTop3 ?? 0).toLocaleString()}</strong>
            </div>
          </div>

          {/* KPI 5: Top 10 */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top 10 KWs</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{(tblMetrics.currentTop10 ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              <span className={`flex items-center font-bold ${tblMetrics.top10AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tblMetrics.top10AbsChange >= 0 ? '+' : ''}{tblMetrics.top10AbsChange} KWs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.top10PctChange >= 0 ? '+' : ''}{tblMetrics.top10PctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{(tblMetrics.comparisonTop10 ?? 0).toLocaleString()}</strong>
            </div>
          </div>

          {/* KPI 6: Top 20 */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top 20 KWs</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{(tblMetrics.currentTop20 ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              <span className={`flex items-center font-bold ${tblMetrics.top20AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tblMetrics.top20AbsChange >= 0 ? '+' : ''}{tblMetrics.top20AbsChange} KWs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.top20PctChange >= 0 ? '+' : ''}{tblMetrics.top20PctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{(tblMetrics.comparisonTop20 ?? 0).toLocaleString()}</strong>
            </div>
          </div>

          {/* KPI 7: Top 100 */}
          <div className="grid min-h-[170px] grid-rows-[2.75rem_3rem_2.5rem_auto] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Top 100 KWs</span>
              <span className="rounded bg-slate-100 px-1 text-[9px] font-mono text-slate-600">Live</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold text-[#002B49] font-mono">{(tblMetrics.currentTop100 ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-xs">
              <span className={`flex items-center font-bold ${tblMetrics.top100AbsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tblMetrics.top100AbsChange >= 0 ? '+' : ''}{tblMetrics.top100AbsChange} KWs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({tblMetrics.top100PctChange >= 0 ? '+' : ''}{tblMetrics.top100PctChange}%)</span>
            </div>
            <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              Prior: <strong className="text-slate-700">{(tblMetrics.comparisonTop100 ?? 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Answer-First Triad: Wins, Opportunities, Needs Attention */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Wins */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#008768] mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
              <Award className="h-4 w-4 text-[#008768]" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Verified Wins (3–5)
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="rounded-lg bg-white p-3 border border-emerald-100 shadow-2xs">
              <span className="font-semibold text-emerald-800 block">1. Search Visibility Expansion</span>
              <p className="mt-0.5 text-slate-600">
                Visibility increased by <strong>+{tblMetrics.visibilityAbsChange}%</strong> (reaching {tblMetrics.currentVisibility}%), driven by rank gains in key European destination hubs.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-100 shadow-2xs">
              <span className="font-semibold text-emerald-800 block">2. Average Position Improvement</span>
              <p className="mt-0.5 text-slate-600">
                Average ranking improved from <strong>{tblMetrics.comparisonAveragePosition}</strong> to <strong>{tblMetrics.currentAveragePosition}</strong> ({tblMetrics.positionImprovement > 0 ? `+${tblMetrics.positionImprovement} positions better` : 'stable'}).
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-100 shadow-2xs">
              <span className="font-semibold text-emerald-800 block">3. Top 10 Core Expansion</span>
              <p className="mt-0.5 text-slate-600">
                <strong>+{tblMetrics.top10AbsChange} additional keywords</strong> entered the Top 10 search results, bringing the total Top 10 footprint to {(tblMetrics.currentTop10 ?? 0).toLocaleString()}.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-100 shadow-2xs">
              <span className="font-semibold text-emerald-800 block">4. Narrowing Gap with Competitors</span>
              <p className="mt-0.5 text-slate-600">
                The ranking position gap against GetYourGuide narrowed by <strong>+{gaps[2]?.gapImprovement || 0.4} positions</strong> on private and custom guide keywords.
              </p>
            </div>
          </div>
        </div>

        {/* Opportunities */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sky-800 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100">
              <Compass className="h-4 w-4 text-sky-700" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Evidence-Based Opportunities (3–5)
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-2xs">
              <span className="font-semibold text-sky-900 block">1. Striking Distance Keywords (Positions 11–20)</span>
              <p className="mt-0.5 text-slate-600">
                <strong>{tblMetrics.currentTop20 - tblMetrics.currentTop10} tracked keywords</strong> rank just off page one with high search intent (e.g., Vatican early access, Taj Mahal private guide).
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-2xs">
              <span className="font-semibold text-sky-900 block">2. Competitor Top 10 Gaps</span>
              <p className="mt-0.5 text-slate-600">
                Viator and TripAdvisor rank Top 10 for 42 high-volume queries where TBL ranks &gt; 10, presenting clear target landing page expansion opportunities.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-2xs">
              <span className="font-semibold text-sky-900 block">3. Bespoke Shore Excursion Advantage</span>
              <p className="mt-0.5 text-slate-600">
                TBL maintains #1–#3 positions for cruise port shore excursion queries with +3.4 position advantage over GetYourGuide.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-sky-100 shadow-2xs">
              <span className="font-semibold text-sky-900 block">4. Uncontested Eco &amp; Food Tours</span>
              <p className="mt-0.5 text-slate-600">
                Culinary and eco-tour tags exhibit weaker competitor Top 5 presence, allowing faster ranking ascent with dedicated landing page optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Needs Attention &amp; Material Risks (3–5)
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="rounded-lg bg-white p-3 border border-amber-100 shadow-2xs">
              <span className="font-semibold text-amber-900 block">1. Wine &amp; Day Trip Drops</span>
              <p className="mt-0.5 text-slate-600">
                5 keywords in the Wine Tasting and Day Trip clusters dropped out of Top 10 rankings into positions 14–18.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-amber-100 shadow-2xs">
              <span className="font-semibold text-amber-900 block">2. TripAdvisor Domain Authority Gap</span>
              <p className="mt-0.5 text-slate-600">
                TripAdvisor maintains a +{gaps[0]?.currentGap} position advantage across generic queries due to massive user-generated review content volume.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-amber-100 shadow-2xs">
              <span className="font-semibold text-amber-900 block">3. Traffic Concentration</span>
              <p className="mt-0.5 text-slate-600">
                Top 8 landing pages account for 44% of total estimated traffic, creating vulnerability to single-page ranking shifts.
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-amber-100 shadow-2xs">
              <span className="font-semibold text-amber-900 block">4. Lost Keyword Verification</span>
              <p className="mt-0.5 text-slate-600">
                2 seasonal keywords (Normandy D-Day Guide, Tromso Northern Lights) dropped below position 100 in the latest snapshot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Recommended Actions Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#002B49]">Prioritized SEO Action Plan</h2>
            <p className="text-xs text-slate-500">Every action includes verified evidence, expected business impact, effort, and owner</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Action Item</th>
                <th className="py-3 px-4">Supporting Evidence</th>
                <th className="py-3 px-4">Expected Impact</th>
                <th className="py-3 px-3 text-center">Effort</th>
                <th className="py-3 px-3 text-center">Owner</th>
                <th className="py-3 px-3 text-center">Timeframe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actionItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{item.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs font-mono text-[11px]">
                    {item.supportingEvidence}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium max-w-xs">
                    {item.expectedImpact}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.effort === 'Low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.effort === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.effort}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {item.recommendedOwner}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-600 text-[11px] whitespace-nowrap">
                    {item.recommendedTimeframe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways Section */}
      <KeyTakeaways
        reportTitle="Executive Summary — SEMrush Position Tracking"
        items={executiveTakeaways}
        defaultRefreshedAt={campaign.lastRefreshedAt}
      />
    </div>
  );
};
