import { CampaignConfig, DailyObservation, DomainName } from '../types';

export const CAMPAIGN_METADATA: CampaignConfig = {
  campaignName: 'example.com – mobile',
  primaryDomain: 'example.com',
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

// Generate deterministic historical time-series data for the 90-day export window (2026-05-22 to 2026-08-20)
function generateHistoricalObservations(): DailyObservation[] {
  const observations: DailyObservation[] = [];
  const domains: DomainName[] = [
    'example.com',
    'tripadvisor.com',
    'viator.com',
    'getyourguide.com',
  ];

  const startDate = new Date('2026-05-22T00:00:00Z');
  const endDate = new Date('2026-08-20T00:00:00Z');

  // Baseline domain profile metrics calibrated to 1,462 tracked keyword set
  const profiles: Record<DomainName, { baseVis: number; basePos: number; baseTraffic: number; top3: number; top10: number; top20: number; top100: number }> = {
    'example.com': { baseVis: 13.6, basePos: 18.8, baseTraffic: 18400, top3: 112, top10: 384, top20: 790, top100: 1340 },
    'tripadvisor.com': { baseVis: 41.2, basePos: 9.4, baseTraffic: 62500, top3: 490, top10: 1080, top20: 1320, top100: 1445 },
    'viator.com': { baseVis: 34.1, basePos: 12.6, baseTraffic: 51200, top3: 360, top10: 920, top20: 1240, top100: 1430 },
    'getyourguide.com': { baseVis: 28.5, basePos: 15.2, baseTraffic: 39100, top3: 270, top10: 760, top20: 1110, top100: 1410 },
  };

  const currentDate = new Date(startDate);
  let dayIndex = 0;

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getUTCDay();

    // 90-day trend progression
    const primaryTrend = Math.sin(dayIndex / 25) * 0.5 + (dayIndex / 90) * 1.4;
    const generalCycle = Math.sin(dayIndex / 10) * 0.2;

    for (const domain of domains) {
      const p = profiles[domain];
      let visMod = 0;
      let posMod = 0;

      if (domain === 'example.com') {
        visMod = primaryTrend + generalCycle;
        posMod = -(primaryTrend * 0.8) - generalCycle * 0.3; // lower position is better
      } else if (domain === 'tripadvisor.com') {
        visMod = Math.cos(dayIndex / 30) * 0.5 - (dayIndex / 120) * 0.4 + generalCycle * 0.4;
        posMod = (dayIndex / 140) * 0.3 - generalCycle * 0.2;
      } else if (domain === 'viator.com') {
        visMod = Math.sin(dayIndex / 35) * 0.6 + generalCycle * 0.5;
        posMod = -Math.sin(dayIndex / 35) * 0.4 - generalCycle * 0.2;
      } else {
        visMod = Math.cos(dayIndex / 28) * 0.5 + (dayIndex / 100) * 0.6 + generalCycle * 0.3;
        posMod = -(dayIndex / 110) * 0.4 - generalCycle * 0.3;
      }

      // Noise generator for micro-fluctuations (deterministic)
      const noise = (Math.sin(dayIndex * 13 + domain.length * 7) * 0.15);

      const visibility = Number(Math.max(1, p.baseVis + visMod + noise).toFixed(2));
      const averagePosition = Number(Math.max(1, p.basePos + posMod - noise * 0.8).toFixed(2));
      const trafficMultiplier = visibility / p.baseVis;
      const estimatedTraffic = Math.round(p.baseTraffic * trafficMultiplier * (1 + noise * 0.05));

      const ratio = visibility / p.baseVis;
      const top3 = Math.round(p.top3 * ratio);
      const top10 = Math.round(p.top10 * ratio);
      const top20 = Math.round(p.top20 * Math.min(1.2, ratio * 0.95));
      const top100 = Math.min(1462, Math.round(p.top100 * Math.min(1.05, ratio * 0.98)));

      observations.push({
        date: dateStr,
        dayOfWeek,
        domain,
        visibility,
        averagePosition,
        estimatedTraffic,
        top3,
        top10,
        top20,
        top100,
        trackedKeywords: 1462,
      });
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    dayIndex++;
  }

  return observations;
}

export const RAW_DAILY_OBSERVATIONS: DailyObservation[] = generateHistoricalObservations();
