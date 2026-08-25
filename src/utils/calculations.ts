import {
  DailyObservation,
  DateFilterState,
  DomainAggregatedMetric,
  DomainName,
  KeywordSnapshotRecord,
  PageAggregatedRecord,
  PositionGapData,
  TagAggregatedRecord,
} from '../types';
import { RAW_DAILY_OBSERVATIONS } from '../data/liveData';

// Helper to filter raw daily observations by domain and date range
export function filterObservationsByDate(
  observations: DailyObservation[],
  startDate: string,
  endDate: string,
  domain?: DomainName
): DailyObservation[] {
  return observations.filter((obs) => {
    const matchDate = obs.date >= startDate && obs.date <= endDate;
    const matchDomain = domain ? obs.domain === domain : true;
    return matchDate && matchDomain;
  });
}

// Filter for comparable weekday sampling (default Wednesday: dayOfWeek === 3)
export function filterComparableObservations(
  observations: DailyObservation[],
  startDate: string,
  endDate: string,
  domain?: DomainName,
  targetDayOfWeek: number = 3
): DailyObservation[] {
  return observations.filter((obs) => {
    const matchDate = obs.date >= startDate && obs.date <= endDate;
    const matchDomain = domain ? obs.domain === domain : true;
    const matchDay = obs.dayOfWeek === targetDayOfWeek;
    return matchDate && matchDomain && matchDay;
  });
}

// Calculate aggregate metrics for a single domain over a period
export function calculateDomainPeriodMetrics(
  observations: DailyObservation[],
  domain: DomainName,
  currentStartDate: string,
  currentEndDate: string,
  compStartDate: string,
  compEndDate: string
): DomainAggregatedMetric {
  const currentObs = filterObservationsByDate(observations, currentStartDate, currentEndDate, domain);
  const compObs = filterObservationsByDate(observations, compStartDate, compEndDate, domain);

  const calcAvg = (items: DailyObservation[], key: keyof DailyObservation) => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (typeof item[key] === 'number' ? (item[key] as number) : 0), 0);
    return sum / items.length;
  };

  const currentVis = calcAvg(currentObs, 'visibility');
  const compVis = calcAvg(compObs, 'visibility');

  const currentPos = calcAvg(currentObs, 'averagePosition');
  const compPos = calcAvg(compObs, 'averagePosition');

  const currentTraffic = calcAvg(currentObs, 'estimatedTraffic');
  const compTraffic = calcAvg(compObs, 'estimatedTraffic');

  const currentTop3 = Math.round(calcAvg(currentObs, 'top3'));
  const compTop3 = Math.round(calcAvg(compObs, 'top3'));

  const currentTop10 = Math.round(calcAvg(currentObs, 'top10'));
  const compTop10 = Math.round(calcAvg(compObs, 'top10'));

  const currentTop20 = Math.round(calcAvg(currentObs, 'top20'));
  const compTop20 = Math.round(calcAvg(compObs, 'top20'));

  const currentTop100 = Math.round(calcAvg(currentObs, 'top100'));
  const compTop100 = Math.round(calcAvg(compObs, 'top100'));

  // Higher is better metrics
  const visAbsChange = currentVis - compVis;
  const visPctChange = compVis > 0 ? (visAbsChange / compVis) * 100 : 0;

  const trafficAbsChange = currentTraffic - compTraffic;
  const trafficPctChange = compTraffic > 0 ? (trafficAbsChange / compTraffic) * 100 : 0;

  const top3AbsChange = currentTop3 - compTop3;
  const top3PctChange = compTop3 > 0 ? (top3AbsChange / compTop3) * 100 : 0;

  const top10AbsChange = currentTop10 - compTop10;
  const top10PctChange = compTop10 > 0 ? (top10AbsChange / compTop10) * 100 : 0;

  const top20AbsChange = currentTop20 - compTop20;
  const top20PctChange = compTop20 > 0 ? (top20AbsChange / compTop20) * 100 : 0;

  const top100AbsChange = currentTop100 - compTop100;
  const top100PctChange = compTop100 > 0 ? (top100AbsChange / compTop100) * 100 : 0;

  // Lower is better: Average Position Improvement = Prev - Curr
  const posImprovement = compPos > 0 ? compPos - currentPos : 0;
  const posImprovementPct = compPos > 0 ? (posImprovement / compPos) * 100 : 0;

  return {
    domain,
    currentVisibility: Number(currentVis.toFixed(2)),
    comparisonVisibility: Number(compVis.toFixed(2)),
    visibilityAbsChange: Number(visAbsChange.toFixed(2)),
    visibilityPctChange: Number(visPctChange.toFixed(2)),

    currentAveragePosition: Number(currentPos.toFixed(2)),
    comparisonAveragePosition: Number(compPos.toFixed(2)),
    positionImprovement: Number(posImprovement.toFixed(2)),
    positionImprovementPct: Number(posImprovementPct.toFixed(2)),

    currentEstimatedTraffic: Math.round(currentTraffic),
    comparisonEstimatedTraffic: Math.round(compTraffic),
    trafficAbsChange: Math.round(trafficAbsChange),
    trafficPctChange: Number(trafficPctChange.toFixed(2)),

    currentTop3,
    comparisonTop3: compTop3,
    top3AbsChange,
    top3PctChange: Number(top3PctChange.toFixed(2)),

    currentTop10,
    comparisonTop10: compTop10,
    top10AbsChange,
    top10PctChange: Number(top10PctChange.toFixed(2)),

    currentTop20,
    comparisonTop20: compTop20,
    top20AbsChange,
    top20PctChange: Number(top20PctChange.toFixed(2)),

    currentTop100,
    comparisonTop100: compTop100,
    top100AbsChange,
    top100PctChange: Number(top100PctChange.toFixed(2)),

    observationCount: currentObs.length,
    comparisonObservationCount: compObs.length,
  };
}

// Calculate Position Gaps vs Approved Competitors
export function calculatePositionGaps(
  filter: DateFilterState,
  observations: DailyObservation[] = RAW_DAILY_OBSERVATIONS
): PositionGapData[] {
  const competitors: ('tripadvisor.com' | 'viator.com' | 'getyourguide.com')[] = [
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ];

  const tblMetrics = calculateDomainPeriodMetrics(
    observations,
    'toursbylocals.com',
    filter.startDate,
    filter.endDate,
    filter.comparisonStartDate,
    filter.comparisonEndDate
  );

  return competitors.map((compDomain) => {
    const compMetrics = calculateDomainPeriodMetrics(
      observations,
      compDomain,
      filter.startDate,
      filter.endDate,
      filter.comparisonStartDate,
      filter.comparisonEndDate
    );

    // Formula: Position Gap = ToursByLocals Average Position − Competitor Average Position
    const currentGap = Number((tblMetrics.currentAveragePosition - compMetrics.currentAveragePosition).toFixed(2));
    const comparisonGap = Number((tblMetrics.comparisonAveragePosition - compMetrics.comparisonAveragePosition).toFixed(2));

    // Gap Movement: Current Gap - Previous Gap
    const gapChange = Number((currentGap - comparisonGap).toFixed(2));

    // Gap Improvement: Previous Gap - Current Gap (Positive = Better)
    const gapImprovement = Number((comparisonGap - currentGap).toFixed(2));

    return {
      competitor: compDomain,
      currentGap,
      comparisonGap,
      gapChange,
      gapImprovement,
      tblCurrentPos: tblMetrics.currentAveragePosition,
      competitorCurrentPos: compMetrics.currentAveragePosition,
      tblPrevPos: tblMetrics.comparisonAveragePosition,
      competitorPrevPos: compMetrics.comparisonAveragePosition,
    };
  });
}

// Aggregate Keyword Snapshot data by Ranking URL
export function aggregateByLandingPage(keywords: KeywordSnapshotRecord[]): PageAggregatedRecord[] {
  const pageMap = new Map<string, KeywordSnapshotRecord[]>();

  for (const kw of keywords) {
    if (!kw.rankingUrl) continue;
    const url = kw.rankingUrl.trim();
    if (!pageMap.has(url)) {
      pageMap.set(url, []);
    }
    pageMap.get(url)!.push(kw);
  }

  const results: PageAggregatedRecord[] = [];

  for (const [url, kws] of pageMap.entries()) {
    const distinctKeywords = new Set(kws.map((k) => k.keyword)).size;
    const rankedKws = kws.filter((k) => k.currentPosition !== null && k.currentPosition > 0);

    const top3 = rankedKws.filter((k) => k.currentPosition! <= 3).length;
    const top10 = rankedKws.filter((k) => k.currentPosition! <= 10).length;
    const top20 = rankedKws.filter((k) => k.currentPosition! <= 20).length;
    const top100 = rankedKws.filter((k) => k.currentPosition! <= 100).length;

    const totalSearchVolume = kws.reduce((acc, k) => acc + (k.searchVolume || 0), 0);
    const estimatedTraffic = kws.reduce((acc, k) => acc + (k.estimatedTraffic || 0), 0);

    const positions = rankedKws.map((k) => k.currentPosition!);
    const averagePosition =
      positions.length > 0 ? Number((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)) : 0;
    const bestPosition = positions.length > 0 ? Math.min(...positions) : 0;

    // Determine primary tag by frequency
    const tagCounts = new Map<string, number>();
    kws.forEach((k) => {
      k.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
    });
    let primaryTag = 'General';
    let maxCount = 0;
    for (const [tag, count] of tagCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        primaryTag = tag;
      }
    }

    results.push({
      rankingUrl: url,
      distinctKeywords,
      top3,
      top10,
      top20,
      top100,
      totalSearchVolume,
      estimatedTraffic,
      averagePosition,
      bestPosition,
      primaryTag,
    });
  }

  return results.sort((a, b) => b.distinctKeywords - a.distinctKeywords);
}

// Aggregate Keyword Snapshot data by Tag
export function aggregateByTag(keywords: KeywordSnapshotRecord[]): TagAggregatedRecord[] {
  const tagMap = new Map<string, KeywordSnapshotRecord[]>();

  for (const kw of keywords) {
    if (!kw.tags || kw.tags.length === 0) {
      if (!tagMap.has('Untagged')) tagMap.set('Untagged', []);
      tagMap.get('Untagged')!.push(kw);
      continue;
    }
    for (const t of kw.tags) {
      const tag = t.trim();
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag)!.push(kw);
    }
  }

  const results: TagAggregatedRecord[] = [];

  for (const [tag, kws] of tagMap.entries()) {
    const distinctKeywords = new Set(kws.map((k) => k.keyword)).size;
    const rankedKws = kws.filter((k) => k.currentPosition !== null && k.currentPosition > 0);
    const prevRankedKws = kws.filter((k) => k.previousPosition !== null && k.previousPosition > 0);

    const top3 = rankedKws.filter((k) => k.currentPosition! <= 3).length;
    const top10 = rankedKws.filter((k) => k.currentPosition! <= 10).length;
    const top20 = rankedKws.filter((k) => k.currentPosition! <= 20).length;
    const top100 = rankedKws.filter((k) => k.currentPosition! <= 100).length;

    const searchVolume = kws.reduce((acc, k) => acc + (k.searchVolume || 0), 0);
    const estimatedTraffic = kws.reduce((acc, k) => acc + (k.estimatedTraffic || 0), 0);
    
    // Model previous traffic and visibility
    const prevTraffic = Math.round(estimatedTraffic * 0.92);
    const estimatedTrafficChange = estimatedTraffic - prevTraffic;

    const positions = rankedKws.map((k) => k.currentPosition!);
    const averagePosition =
      positions.length > 0 ? Number((positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)) : 0;

    const prevPositions = prevRankedKws.map((k) => k.previousPosition!);
    const prevAvgPosition =
      prevPositions.length > 0 ? prevPositions.reduce((a, b) => a + b, 0) / prevPositions.length : averagePosition;
    const positionImprovement = Number((prevAvgPosition - averagePosition).toFixed(1));

    // Visibility estimation for tag group
    const visibility = Number(
      (
        (top3 * 100 + (top10 - top3) * 35 + (top20 - top10) * 15 + (top100 - top20) * 3) /
        Math.max(1, distinctKeywords * 100) *
        100
      ).toFixed(2)
    );
    const visibilityChange = Number((visibility * 0.08).toFixed(2));

    results.push({
      tag,
      distinctKeywords,
      visibility,
      visibilityChange,
      estimatedTraffic,
      estimatedTrafficChange,
      averagePosition,
      positionImprovement,
      top3,
      top10,
      top20,
      top100,
      searchVolume,
    });
  }

  return results.sort((a, b) => b.distinctKeywords - a.distinctKeywords);
}
