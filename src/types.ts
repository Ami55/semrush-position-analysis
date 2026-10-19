export type DomainName = 'example.com' | 'tripadvisor.com' | 'viator.com' | 'getyourguide.com';

export interface CampaignConfig {
  campaignName: string;
  primaryDomain: 'example.com';
  approvedCompetitors: ['tripadvisor.com', 'viator.com', 'getyourguide.com'];
  searchEngine: string;
  market: string;
  language: string;
  device: 'Mobile';
  totalTrackedKeywords: number;
  latestDataDate: string;
  collectionFrequency: 'Daily' | 'Weekly' | 'Daily (90-Day Window)' | string;
  lastRefreshedAt: string;
}

export interface DailyObservation {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) to 6 (Sat) - 3 is Wednesday
  domain: DomainName;
  visibility: number; // e.g. 14.8 (%)
  averagePosition: number; // e.g. 18.4
  estimatedTraffic: number; // daily estimated index/clicks
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  trackedKeywords: number;
}

export type DateRangePreset = 
  | '7d' 
  | '28d' 
  | '30d'
  | '90d'
  | 'current_month' 
  | 'last_month' 
  | 'current_quarter' 
  | 'last_quarter' 
  | 'custom';

export type ComparisonPreset = 
  | 'previous_period' 
  | 'previous_month' 
  | 'previous_quarter' 
  | 'same_period_last_year';

export interface DateFilterState {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  comparisonPreset: ComparisonPreset;
  comparisonStartDate: string;
  comparisonEndDate: string;
  selectedDomains: DomainName[];
}

export interface DomainAggregatedMetric {
  domain: DomainName;
  currentVisibility: number;
  comparisonVisibility: number;
  visibilityAbsChange: number;
  visibilityPctChange: number;

  currentAveragePosition: number;
  comparisonAveragePosition: number;
  positionImprovement: number; // Prev - Curr
  positionImprovementPct: number; // (Prev - Curr) / Prev

  currentEstimatedTraffic: number; // Average daily estimated traffic for period
  comparisonEstimatedTraffic: number;
  trafficAbsChange: number;
  trafficPctChange: number;

  currentTop3: number;
  comparisonTop3: number;
  top3AbsChange: number;
  top3PctChange: number;

  currentTop10: number;
  comparisonTop10: number;
  top10AbsChange: number;
  top10PctChange: number;

  currentTop20: number;
  comparisonTop20: number;
  top20AbsChange: number;
  top20PctChange: number;

  currentTop100: number;
  comparisonTop100: number;
  top100AbsChange: number;
  top100PctChange: number;

  observationCount: number;
  comparisonObservationCount: number;
}

export interface PositionGapData {
  competitor: 'tripadvisor.com' | 'viator.com' | 'getyourguide.com';
  currentGap: number; // PRIMARY Avg Pos - Competitor Avg Pos
  comparisonGap: number;
  gapChange: number; // Current Gap - Prev Gap
  gapImprovement: number; // Prev Gap - Current Gap (Positive = Better)
  primaryCurrentPos: number;
  competitorCurrentPos: number;
  primaryPrevPos: number;
  competitorPrevPos: number;
}

export type KeywordIntent = 'Commercial' | 'Transactional' | 'Informational' | 'Navigational';

export interface KeywordSnapshotRecord {
  id: string;
  keyword: string;
  searchVolume: number;
  keywordDifficulty?: number;
  intent: KeywordIntent;
  tags: string[];
  rankingUrl: string;
  currentPosition: number | null; // null if unranked
  previousPosition: number | null; // null if previously unranked
  positionImprovement: number | null; // Prev - Curr
  isNew: boolean;
  isLost: boolean;
  
  // Competitor Positions
  primaryPosition: number | null;
  tripadvisorPosition: number | null;
  viatorPosition: number | null;
  getyourguidePosition: number | null;
  
  bestCompetitorPosition: number | null;
  keywordPositionGap: number | null; // PRIMARY Pos - Best Competitor Pos
  
  estimatedTraffic?: number;
  serpFeatures?: string[];
}

export interface SnapshotMetadata {
  currentSnapshotDate: string;
  comparisonSnapshotDate: string;
  campaign: string;
  market: string;
  device: string;
  domain: string;
  source: string;
  totalRows: number;
  distinctKeywords: number;
  lastUploadedAt: string;
}

export interface PageAggregatedRecord {
  rankingUrl: string;
  distinctKeywords: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  totalSearchVolume: number;
  estimatedTraffic: number;
  averagePosition: number;
  bestPosition: number;
  primaryTag: string;
}

export interface TagAggregatedRecord {
  tag: string;
  distinctKeywords: number;
  visibility: number;
  visibilityChange: number;
  estimatedTraffic: number;
  estimatedTrafficChange: number;
  averagePosition: number;
  positionImprovement: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  searchVolume: number;
}

export interface TakeawayItem {
  whatHappened: string;
  whyItMatters: string;
  opportunityOrRisk: 'opportunity' | 'risk' | 'neutral';
  recommendedAction: string;
  supportingMetric: string;
  comparisonType: 'previous_period' | 'month_over_month' | 'quarter_over_quarter' | 'year_over_year' | 'competitive';
  dataLimitation?: string;
}

export interface ExecutiveActionItem {
  id: string;
  title: string;
  description: string;
  supportingEvidence: string;
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
  recommendedOwner: 'SEO' | 'Content' | 'Technical SEO' | 'Analytics';
  recommendedTimeframe: 'Immediate (1-2 wks)' | 'Short-term (30 days)' | 'Quarterly (60-90 days)';
}

export type ActivePage = 
  | 'cover'
  | 'executive_summary'
  | 'semrush_api'
  | 'visibility_trend'
  | 'visibility_scorecards'
  | 'avg_position_trend'
  | 'avg_position_scorecards'
  | 'position_gaps'
  | 'ranking_distribution'
  | 'estimated_traffic'
  | 'quarterly_comparison'
  | 'monthly_comparison'
  | 'archived_winners_losers'
  | 'archived_keyword_gaps'
  | 'archived_top_pages'
  | 'archived_tags'
  | 'methodology';

export interface FieldMapping {
  keyword: string;
  currentPosition: string;
  previousPosition: string;
  searchVolume: string;
  rankingUrl: string;
  intent: string;
  tags: string;
  tripadvisorPosition: string;
  viatorPosition: string;
  getyourguidePosition: string;
  estimatedTraffic: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  field?: string;
  message: string;
  count?: number;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  distinctKeywords: number;
  blockingErrors: ValidationIssue[];
  warnings: ValidationIssue[];
  detectedCompetitors: string[];
  detectedTags: string[];
  detectedDateRange?: string;
}
export type DomainName = 'toursbylocals.com' | 'tripadvisor.com' | 'viator.com' | 'getyourguide.com';

export interface CampaignConfig {
  campaignName: string;
  primaryDomain: 'toursbylocals.com';
  approvedCompetitors: ['tripadvisor.com', 'viator.com', 'getyourguide.com'];
  searchEngine: string;
  market: string;
  language: string;
  device: 'Mobile';
  totalTrackedKeywords: number;
  latestDataDate: string;
  collectionFrequency: 'Daily' | 'Weekly' | 'Daily (90-Day Window)' | string;
  lastRefreshedAt: string;
}

export interface DailyObservation {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) to 6 (Sat) - 3 is Wednesday
  domain: DomainName;
  visibility: number; // e.g. 14.8 (%)
  averagePosition: number; // e.g. 18.4
  estimatedTraffic: number; // daily estimated index/clicks
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  trackedKeywords: number;
}

export type DateRangePreset = 
  | '7d' 
  | '28d' 
  | '30d'
  | '90d'
  | 'current_month' 
  | 'last_month' 
  | 'current_quarter' 
  | 'last_quarter' 
  | 'custom';

export type ComparisonPreset = 
  | 'previous_period' 
  | 'previous_month' 
  | 'previous_quarter' 
  | 'same_period_last_year';

export interface DateFilterState {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  comparisonPreset: ComparisonPreset;
  comparisonStartDate: string;
  comparisonEndDate: string;
  selectedDomains: DomainName[];
}

export interface DomainAggregatedMetric {
  domain: DomainName;
  currentVisibility: number;
  comparisonVisibility: number;
  visibilityAbsChange: number;
  visibilityPctChange: number;

  currentAveragePosition: number;
  comparisonAveragePosition: number;
  positionImprovement: number; // Prev - Curr
  positionImprovementPct: number; // (Prev - Curr) / Prev

  currentEstimatedTraffic: number; // Average daily estimated traffic for period
  comparisonEstimatedTraffic: number;
  trafficAbsChange: number;
  trafficPctChange: number;

  currentTop3: number;
  comparisonTop3: number;
  top3AbsChange: number;
  top3PctChange: number;

  currentTop10: number;
  comparisonTop10: number;
  top10AbsChange: number;
  top10PctChange: number;

  currentTop20: number;
  comparisonTop20: number;
  top20AbsChange: number;
  top20PctChange: number;

  currentTop100: number;
  comparisonTop100: number;
  top100AbsChange: number;
  top100PctChange: number;

  observationCount: number;
  comparisonObservationCount: number;
}

export interface PositionGapData {
  competitor: 'tripadvisor.com' | 'viator.com' | 'getyourguide.com';
  currentGap: number; // TBL Avg Pos - Competitor Avg Pos
  comparisonGap: number;
  gapChange: number; // Current Gap - Prev Gap
  gapImprovement: number; // Prev Gap - Current Gap (Positive = Better)
  tblCurrentPos: number;
  competitorCurrentPos: number;
  tblPrevPos: number;
  competitorPrevPos: number;
}

export type KeywordIntent = 'Commercial' | 'Transactional' | 'Informational' | 'Navigational';

export interface KeywordSnapshotRecord {
  id: string;
  keyword: string;
  searchVolume: number;
  keywordDifficulty?: number;
  intent: KeywordIntent;
  tags: string[];
  rankingUrl: string;
  currentPosition: number | null; // null if unranked
  previousPosition: number | null; // null if previously unranked
  positionImprovement: number | null; // Prev - Curr
  isNew: boolean;
  isLost: boolean;
  
  // Competitor Positions
  tblPosition: number | null;
  tripadvisorPosition: number | null;
  viatorPosition: number | null;
  getyourguidePosition: number | null;
  
  bestCompetitorPosition: number | null;
  keywordPositionGap: number | null; // TBL Pos - Best Competitor Pos
  
  estimatedTraffic?: number;
  serpFeatures?: string[];
}

export interface SnapshotMetadata {
  currentSnapshotDate: string;
  comparisonSnapshotDate: string;
  campaign: string;
  market: string;
  device: string;
  domain: string;
  source: string;
  totalRows: number;
  distinctKeywords: number;
  lastUploadedAt: string;
}

export interface PageAggregatedRecord {
  rankingUrl: string;
  distinctKeywords: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  totalSearchVolume: number;
  estimatedTraffic: number;
  averagePosition: number;
  bestPosition: number;
  primaryTag: string;
}

export interface TagAggregatedRecord {
  tag: string;
  distinctKeywords: number;
  visibility: number;
  visibilityChange: number;
  estimatedTraffic: number;
  estimatedTrafficChange: number;
  averagePosition: number;
  positionImprovement: number;
  top3: number;
  top10: number;
  top20: number;
  top100: number;
  searchVolume: number;
}

export interface TakeawayItem {
  whatHappened: string;
  whyItMatters: string;
  opportunityOrRisk: 'opportunity' | 'risk' | 'neutral';
  recommendedAction: string;
  supportingMetric: string;
  comparisonType: 'previous_period' | 'month_over_month' | 'quarter_over_quarter' | 'year_over_year' | 'competitive';
  dataLimitation?: string;
}

export interface ExecutiveActionItem {
  id: string;
  title: string;
  description: string;
  supportingEvidence: string;
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
  recommendedOwner: 'SEO' | 'Content' | 'Technical SEO' | 'Analytics';
  recommendedTimeframe: 'Immediate (1-2 wks)' | 'Short-term (30 days)' | 'Quarterly (60-90 days)';
}

export type ActivePage = 
  | 'cover'
  | 'executive_summary'
  | 'semrush_api'
  | 'visibility_trend'
  | 'visibility_scorecards'
  | 'avg_position_trend'
  | 'avg_position_scorecards'
  | 'position_gaps'
  | 'ranking_distribution'
  | 'estimated_traffic'
  | 'quarterly_comparison'
  | 'monthly_comparison'
  | 'archived_winners_losers'
  | 'archived_keyword_gaps'
  | 'archived_top_pages'
  | 'archived_tags'
  | 'methodology';

export interface FieldMapping {
  keyword: string;
  currentPosition: string;
  previousPosition: string;
  searchVolume: string;
  rankingUrl: string;
  intent: string;
  tags: string;
  tripadvisorPosition: string;
  viatorPosition: string;
  getyourguidePosition: string;
  estimatedTraffic: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  field?: string;
  message: string;
  count?: number;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  distinctKeywords: number;
  blockingErrors: ValidationIssue[];
  warnings: ValidationIssue[];
  detectedCompetitors: string[];
  detectedTags: string[];
  detectedDateRange?: string;
}
