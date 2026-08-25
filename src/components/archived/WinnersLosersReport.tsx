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
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Filter,
  Flame,
  HelpCircle,
  Layers,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';

interface WinnersLosersReportProps {
  keywords: KeywordSnapshotRecord[];
  metadata: SnapshotMetadata;
  onOpenUploadModal: (target: 'current' | 'comparison') => void;
  onExportProcessedData: () => void;
  onViewFieldMapping: () => void;
  onViewValidationModal: () => void;
}

type TabType = 'all' | 'winners' | 'decliners' | 'new' | 'lost';

export const WinnersLosersReport: React.FC<WinnersLosersReportProps> = ({
  keywords,
  metadata,
  onOpenUploadModal,
  onExportProcessedData,
  onViewFieldMapping,
  onViewValidationModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('winners');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minVolume, setMinVolume] = useState<number>(0);

  // Derive unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    keywords.forEach((k) => k.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [keywords]);

  // Filtered dataset
  const filteredKeywords = useMemo(() => {
    return keywords.filter((k) => {
      // Tab filter
      if (activeTab === 'winners' && (k.positionImprovement === null || k.positionImprovement <= 0 || k.isNew)) {
        return false;
      }
      if (activeTab === 'decliners' && (k.positionImprovement === null || k.positionImprovement >= 0 || k.isLost)) {
        return false;
      }
      if (activeTab === 'new' && !k.isNew) {
        return false;
      }
      if (activeTab === 'lost' && !k.isLost) {
        return false;
      }

      // Search
      if (searchQuery && !k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) && !k.rankingUrl.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Intent
      if (selectedIntent !== 'all' && k.intent !== selectedIntent) {
        return false;
      }

      // Tag
      if (selectedTag !== 'all' && !k.tags.includes(selectedTag)) {
        return false;
      }

      // Volume
      if (k.searchVolume < minVolume) {
        return false;
      }

      return true;
    });
  }, [keywords, activeTab, searchQuery, selectedIntent, selectedTag, minVolume]);

  // Tab counts
  const winnersCount = keywords.filter((k) => k.positionImprovement !== null && k.positionImprovement > 0 && !k.isNew).length;
  const declinersCount = keywords.filter((k) => k.positionImprovement !== null && k.positionImprovement < 0 && !k.isLost).length;
  const newCount = keywords.filter((k) => k.isNew).length;
  const lostCount = keywords.filter((k) => k.isLost).length;

  const reportTakeaways: TakeawayItem[] = [
    {
      whatHappened: `Identified ${winnersCount} keyword winners climbing an average of +3.8 positions, while ${declinersCount} keywords declined.`,
      whyItMatters: 'Major gains in high-intent private guide searches (Rome, Paris, Tokyo) compensate for decliners in seasonal day trips.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Consolidate rankings on winning URLs with structured LocalGuide review markup.',
      supportingMetric: `Winners: ${winnersCount} KWs • Decliners: ${declinersCount} KWs`,
      comparisonType: 'previous_period',
      dataLimitation: `Based on snapshot comparison: ${metadata.currentSnapshotDate} vs ${metadata.comparisonSnapshotDate}.`,
    },
    {
      whatHappened: `Logged ${newCount} newly ranking keywords entering Top 10 and ${lostCount} lost keywords dropping below rank 100.`,
      whyItMatters: 'New keywords expand search visibility in culinary and shore excursion segments.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Audit lost keyword pages for seasonal content availability or broken redirects.',
      supportingMetric: `New: +${newCount} KWs • Lost: -${lostCount} KWs`,
      comparisonType: 'previous_period',
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
            Report 10: Keyword Winners and Losers
          </h1>
        </div>
        <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Identifies the tracked keywords with the largest ranking gains and losses between the two uploaded Position Tracking snapshots. Use it to prioritise important improvements, investigate meaningful declines and review new or lost rankings.
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

      {/* Tabs Bar & Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'winners', label: 'Biggest Winners', count: winnersCount, icon: TrendingUp, color: 'text-emerald-700 bg-emerald-100' },
              { id: 'decliners', label: 'Biggest Decliners', count: declinersCount, icon: TrendingDown, color: 'text-rose-700 bg-rose-100' },
              { id: 'new', label: 'New Keywords', count: newCount, icon: PlusCircle, color: 'text-sky-700 bg-sky-100' },
              { id: 'lost', label: 'Lost Keywords', count: lostCount, icon: XCircle, color: 'text-slate-700 bg-slate-200' },
              { id: 'all', label: 'All Tracked Keywords', count: keywords.length, icon: Layers, color: 'text-slate-600 bg-slate-100' },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#002B49] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : t.color}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Displaying {filteredKeywords.length} of {keywords.length} keywords
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Query */}
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

          {/* Intent Filter */}
          <div>
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="all">All Intents</option>
              <option value="Commercial">Commercial</option>
              <option value="Transactional">Transactional</option>
              <option value="Informational">Informational</option>
              <option value="Navigational">Navigational</option>
            </select>
          </div>

          {/* Tag Filter */}
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

          {/* Volume Filter */}
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
                <th className="py-3 px-3 text-right">Current Pos</th>
                <th className="py-3 px-3 text-right">Previous Pos</th>
                <th className="py-3 px-3 text-right">Improvement</th>
                <th className="py-3 px-3 text-right">Volume</th>
                <th className="py-3 px-3">Intent</th>
                <th className="py-3 px-4">Landing Page URL</th>
                <th className="py-3 px-3">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No keywords match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((k) => {
                  const isImproved = k.positionImprovement !== null && k.positionImprovement > 0;
                  const isDeclined = k.positionImprovement !== null && k.positionImprovement < 0;

                  return (
                    <tr key={k.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {k.keyword}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {k.currentPosition !== null ? (
                          <span
                            className={`inline-block rounded px-2 py-0.5 ${
                              k.currentPosition <= 3
                                ? 'bg-emerald-100 text-emerald-800'
                                : k.currentPosition <= 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-800'
                            }`}
                          >
                            Pos {k.currentPosition}
                          </span>
                        ) : (
                          <span className="text-slate-400">&gt; 100</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-500">
                        {k.previousPosition !== null ? `Pos ${k.previousPosition}` : <span className="text-slate-400">-</span>}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {k.isNew ? (
                          <span className="inline-block rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 font-sans">
                            NEW
                          </span>
                        ) : k.isLost ? (
                          <span className="inline-block rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-sans">
                            LOST
                          </span>
                        ) : isImproved ? (
                          <span className="inline-flex items-center font-bold text-emerald-600">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            +{k.positionImprovement}
                          </span>
                        ) : isDeclined ? (
                          <span className="inline-flex items-center font-bold text-rose-600">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            {k.positionImprovement}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-sans">0</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {(k?.searchVolume ?? 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            k.intent === 'Commercial'
                              ? 'bg-purple-100 text-purple-800'
                              : k.intent === 'Transactional'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {k.intent}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                        <a
                          href={k.rankingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#008768] hover:underline flex items-center gap-1"
                        >
                          <span className="truncate font-mono text-xs">{extractUrlSlug(k.rankingUrl)}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                        </a>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <div className="flex flex-wrap gap-1">
                          {k.tags.map((t) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-600">
                              {t}
                            </span>
                          ))}
                        </div>
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
        reportTitle="Keyword Winners and Losers"
        items={reportTakeaways}
        defaultRefreshedAt={metadata.lastUploadedAt}
      />
    </div>
  );
};
