import React, { useState, useMemo } from 'react';
import {
  KeywordSnapshotRecord,
  SnapshotMetadata,
  TakeawayItem,
} from '../../types';
import { ArchivedSnapshotHeader } from './ArchivedSnapshotHeader';
import { KeyTakeaways } from '../KeyTakeaways';
import { extractUrlSlug } from '../../utils/fileParser';
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Filter,
  Flame,
  HelpCircle,
  Layers,
  Search,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

interface KeywordGapsReportProps {
  keywords: KeywordSnapshotRecord[];
  metadata: SnapshotMetadata;
  onOpenUploadModal: (target: 'current' | 'comparison') => void;
  onExportProcessedData: () => void;
  onViewFieldMapping: () => void;
  onViewValidationModal: () => void;
}

type GapView = 'competitor_top10' | 'striking_distance' | 'tbl_advantage' | 'uncontested' | 'all';

export const KeywordGapsReport: React.FC<KeywordGapsReportProps> = ({
  keywords,
  metadata,
  onOpenUploadModal,
  onExportProcessedData,
  onViewFieldMapping,
  onViewValidationModal,
}) => {
  const [activeView, setActiveView] = useState<GapView>('competitor_top10');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minVolume, setMinVolume] = useState<number>(0);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    keywords.forEach((k) => k.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [keywords]);

  // Helper to compute best competitor pos
  const getBestCompetitorPos = (k: KeywordSnapshotRecord): number | null => {
    const validPositions = [k.tripadvisorPosition, k.viatorPosition, k.getyourguidePosition].filter(
      (p): p is number => p !== null && p > 0
    );
    if (validPositions.length === 0) return null;
    return Math.min(...validPositions);
  };

  // Classify each record
  const classifiedKeywords = useMemo(() => {
    return keywords.map((k) => {
      const bestComp = getBestCompetitorPos(k);
      const tblPos = k.tblPosition;

      // Position gap = TBL Pos - Best Competitor Pos.
      // Positive = TBL ranks worse. Negative = TBL ranks better.
      let positionGap: number | null = null;
      if (tblPos !== null && bestComp !== null) {
        positionGap = tblPos - bestComp;
      } else if (tblPos === null && bestComp !== null) {
        positionGap = 101 - bestComp; // Unranked fallback representation
      } else if (tblPos !== null && bestComp === null) {
        positionGap = tblPos - 101;
      }

      // Check view memberships
      const isCompTop10TBLOutside = (bestComp !== null && bestComp <= 10) && (tblPos === null || tblPos > 10);
      const isStrikingDistance = tblPos !== null && tblPos >= 11 && tblPos <= 20;
      const isTBLAdvantage = tblPos !== null && (bestComp === null || tblPos < bestComp);
      const isUncontested = (tblPos === null || tblPos > 10) && (bestComp === null || bestComp > 10);

      let opportunityType = 'Standard';
      if (isTBLAdvantage) opportunityType = 'TBL Advantage';
      else if (isStrikingDistance) opportunityType = 'Striking Distance (Page 2)';
      else if (isCompTop10TBLOutside) opportunityType = 'Competitor Threat (Top 10)';
      else if (isUncontested) opportunityType = 'Uncontested Opportunity';

      return {
        ...k,
        bestCompetitorPos: bestComp,
        positionGap,
        isCompTop10TBLOutside,
        isStrikingDistance,
        isTBLAdvantage,
        isUncontested,
        opportunityType,
      };
    });
  }, [keywords]);

  // Filtered keywords
  const filteredRecords = useMemo(() => {
    return classifiedKeywords.filter((k) => {
      if (activeView === 'competitor_top10' && !k.isCompTop10TBLOutside) return false;
      if (activeView === 'striking_distance' && !k.isStrikingDistance) return false;
      if (activeView === 'tbl_advantage' && !k.isTBLAdvantage) return false;
      if (activeView === 'uncontested' && !k.isUncontested) return false;

      if (searchQuery && !k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) && !k.rankingUrl.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedIntent !== 'all' && k.intent !== selectedIntent) return false;
      if (selectedTag !== 'all' && !k.tags.includes(selectedTag)) return false;
      if (k.searchVolume < minVolume) return false;

      return true;
    });
  }, [classifiedKeywords, activeView, searchQuery, selectedIntent, selectedTag, minVolume]);

  const countCompTop10 = classifiedKeywords.filter((k) => k.isCompTop10TBLOutside).length;
  const countStriking = classifiedKeywords.filter((k) => k.isStrikingDistance).length;
  const countAdvantage = classifiedKeywords.filter((k) => k.isTBLAdvantage).length;
  const countUncontested = classifiedKeywords.filter((k) => k.isUncontested).length;

  const gapTakeaways: TakeawayItem[] = [
    {
      whatHappened: `Identified ${countStriking} striking-distance keywords ranking on Page 2 (Positions 11–20) representing high near-term traffic upside.`,
      whyItMatters: 'Page 2 keywords require far less authority to push into Top 10 compared to unranked terms.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Add internal links from high-authority city landing pages to these striking distance tour URLs.',
      supportingMetric: `${countStriking} KWs in Striking Distance (Pos 11-20)`,
      comparisonType: 'competitive',
    },
    {
      whatHappened: `Found ${countCompTop10} high-intent queries where competitors dominate Top 10 while ToursByLocals ranks on page 2 or deeper.`,
      whyItMatters: 'Competitor dominance in shore excursions and day trips siphons high-converting mobile search traffic.',
      opportunityOrRisk: 'risk',
      recommendedAction: 'Enhance port transfer details and private custom itinerary highlights to outrank generic aggregator listings.',
      supportingMetric: `${countCompTop10} Keywords with Competitor Top 10`,
      comparisonType: 'competitive',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Archived Spreadsheet Report
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#002B49] sm:text-3xl">
            Report 11: TBL vs Competitor Keyword Gaps
          </h1>
        </div>
        <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Compares ToursByLocals ranking positions against key competitors on a keyword-by-keyword basis to uncover immediate opportunities, competitive advantages and content gaps.
        </p>
      </div>

      {/* Snapshot Header */}
      <ArchivedSnapshotHeader
        metadata={metadata}
        onOpenUploadModal={onOpenUploadModal}
        onExportProcessedData={onExportProcessedData}
        onViewFieldMapping={onViewFieldMapping}
        onViewValidationModal={onViewValidationModal}
      />

      {/* Strategic Views & Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Strategic Views Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'competitor_top10', label: 'Competitor Top 10, TBL Outside', count: countCompTop10, icon: Target, color: 'text-amber-800 bg-amber-100' },
              { id: 'striking_distance', label: 'TBL Striking Distance (Pos 11–20)', count: countStriking, icon: Zap, color: 'text-sky-800 bg-sky-100' },
              { id: 'tbl_advantage', label: 'TBL Competitive Advantage', count: countAdvantage, icon: Award, color: 'text-emerald-800 bg-emerald-100' },
              { id: 'uncontested', label: 'Uncontested Opportunities', count: countUncontested, icon: Sparkles, color: 'text-purple-800 bg-purple-100' },
              { id: 'all', label: 'All Tracked Gaps', count: keywords.length, icon: Layers, color: 'text-slate-700 bg-slate-100' },
            ].map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as any)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#002B49] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{v.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : v.color}`}>
                    {v.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing {filteredRecords.length} keywords
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">All Search Intents</option>
              <option value="Commercial">Commercial</option>
              <option value="Transactional">Transactional</option>
              <option value="Informational">Informational</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">All Category Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value={0}>Any Search Volume</option>
              <option value={1000}>Min 1,000 / mo</option>
              <option value={5000}>Min 5,000 / mo</option>
              <option value={10000}>Min 10,000 / mo</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-sans font-bold uppercase tracking-wider text-[11px] text-slate-600">
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-3 text-right">Volume</th>
                <th className="py-3 px-3">Intent</th>
                <th className="py-3 px-3 text-right">TBL Pos</th>
                <th className="py-3 px-3 text-right">TripAdvisor</th>
                <th className="py-3 px-3 text-right">Viator</th>
                <th className="py-3 px-3 text-right">GetYourGuide</th>
                <th className="py-3 px-3 text-right">Best Competitor</th>
                <th className="py-3 px-3 text-right">Position Gap</th>
                <th className="py-3 px-4">Ranking URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No keywords found matching this gap criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const hasTBLAdvantage = r.isTBLAdvantage;
                  const isBehind = r.positionGap !== null && r.positionGap > 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {r.keyword}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {(r?.searchVolume ?? 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                          {r.intent}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold">
                        {r.tblPosition !== null ? (
                          <span
                            className={`inline-block rounded px-2 py-0.5 ${
                              r.tblPosition <= 3
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.tblPosition <= 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-800'
                            }`}
                          >
                            Pos {r.tblPosition}
                          </span>
                        ) : (
                          <span className="text-slate-400">&gt; 100</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600">
                        {r.tripadvisorPosition !== null ? `Pos ${r.tripadvisorPosition}` : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600">
                        {r.viatorPosition !== null ? `Pos ${r.viatorPosition}` : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600">
                        {r.getyourguidePosition !== null ? `Pos ${r.getyourguidePosition}` : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        {r.bestCompetitorPos !== null ? `Pos ${r.bestCompetitorPos}` : <span className="text-slate-300">None &lt;100</span>}
                      </td>

                      <td className="py-3 px-3 text-right font-bold">
                        {hasTBLAdvantage ? (
                          <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-800">
                            {r.positionGap !== null ? `${r.positionGap} pos` : 'TBL Ahead'}
                          </span>
                        ) : isBehind ? (
                          <span className="inline-block rounded bg-rose-100 px-2 py-0.5 text-[11px] text-rose-800">
                            +{r.positionGap} pos behind
                          </span>
                        ) : (
                          <span className="text-slate-400">Tied</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                        <a
                          href={r.rankingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#008768] hover:underline flex items-center gap-1"
                        >
                          <span className="truncate font-mono text-xs">{extractUrlSlug(r.rankingUrl)}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="TBL vs Competitor Keyword Gaps"
        items={gapTakeaways}
        defaultRefreshedAt={metadata.lastUploadedAt}
      />
    </div>
  );
};
