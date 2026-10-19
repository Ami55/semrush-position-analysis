import React, { useState, useMemo } from 'react';
import {
  KeywordSnapshotRecord,
  PageAggregatedRecord,
  SnapshotMetadata,
  TakeawayItem,
} from '../../types';
import { ArchivedSnapshotHeader } from './ArchivedSnapshotHeader';
import { KeyTakeaways } from '../KeyTakeaways';
import { extractUrlSlug } from '../../utils/fileParser';
import {
  ArrowUpDown,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';

interface TopPagesReportProps {
  keywords: KeywordSnapshotRecord[];
  metadata: SnapshotMetadata;
  onOpenUploadModal: (target: 'current' | 'comparison') => void;
  onExportProcessedData: () => void;
  onViewFieldMapping: () => void;
  onViewValidationModal: () => void;
}

type SortField = 'distinctKeywords' | 'top10' | 'top3' | 'estimatedTraffic' | 'totalSearchVolume' | 'averagePosition';

export const TopPagesReport: React.FC<TopPagesReportProps> = ({
  keywords,
  metadata,
  onOpenUploadModal,
  onExportProcessedData,
  onViewFieldMapping,
  onViewValidationModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('distinctKeywords');
  const [sortAsc, setSortAsc] = useState(false);

  // Group keywords by ranking URL
  const pageAggregations: PageAggregatedRecord[] = useMemo(() => {
    const pageMap = new Map<string, KeywordSnapshotRecord[]>();

    keywords.forEach((k) => {
      if (!k.rankingUrl) return;
      const existing = pageMap.get(k.rankingUrl) || [];
      existing.push(k);
      pageMap.set(k.rankingUrl, existing);
    });

    const results: PageAggregatedRecord[] = [];

    pageMap.forEach((kwList, url) => {
      const distinctKeywords = kwList.length;
      let top3 = 0;
      let top10 = 0;
      let top20 = 0;
      let top100 = 0;
      let totalSearchVolume = 0;
      let estimatedTraffic = 0;
      let posSum = 0;
      let validPosCount = 0;
      let bestPosition: number | null = null;
      const tagCounts = new Map<string, number>();

      kwList.forEach((k) => {
        totalSearchVolume += k.searchVolume;
        estimatedTraffic += k.estimatedTraffic || 0;

        if (k.primaryPosition !== null && k.primaryPosition > 0) {
          posSum += k.primaryPosition;
          validPosCount++;
          if (bestPosition === null || k.primaryPosition < bestPosition) {
            bestPosition = k.primaryPosition;
          }

          if (k.primaryPosition <= 3) top3++;
          if (k.primaryPosition <= 10) top10++;
          if (k.primaryPosition <= 20) top20++;
          if (k.primaryPosition <= 100) top100++;
        }

        k.tags.forEach((t) => {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        });
      });

      // Find primary tag
      let primaryTag = 'General';
      let maxTagCount = 0;
      tagCounts.forEach((count, tag) => {
        if (count > maxTagCount) {
          maxTagCount = count;
          primaryTag = tag;
        }
      });

      const averagePosition = validPosCount > 0 ? Number((posSum / validPosCount).toFixed(1)) : 0;

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
        bestPosition: bestPosition || 0,
        primaryTag,
      });
    });

    return results;
  }, [keywords]);

  // Filter & Sort
  const filteredAndSortedPages = useMemo(() => {
    const filtered = pageAggregations.filter((p) =>
      p.rankingUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryTag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA = a[sortField] || 0;
      let valB = b[b[sortField] !== undefined ? sortField : 'distinctKeywords'] || 0;

      if (sortField === 'averagePosition') {
        // For average position, lower is better
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }

      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [pageAggregations, searchQuery, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const topPagesTakeaways: TakeawayItem[] = [
    {
      whatHappened: `Identified ${pageAggregations.length} distinct landing pages ranking across the tracked keywords, with top destination hubs (Rome, Tokyo, Paris) ranking for the highest volume of Page 1 terms.`,
      whyItMatters: 'Destination hub pages aggregate authority and serve as prime entry points for organic mobile bookers.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Apply canonical best practices and structured schema markup to shore excursion and day trip sub-pages.',
      supportingMetric: `${pageAggregations.length} Unique Ranking URLs`,
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
            Report 12: Top Ranking Pages
          </h1>
        </div>
        <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Aggregates tracked keyword rankings by landing page URL to reveal which website sections generate the most search engine footprint and commercial visibility.
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

      {/* Main Table Container */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search landing page URL or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing {filteredAndSortedPages.length} landing pages
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-sans font-bold uppercase tracking-wider text-[11px] text-slate-600">
                <th className="py-3 px-4">Landing Page URL</th>
                <th
                  onClick={() => handleSort('distinctKeywords')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Distinct KWs <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('top3')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Top 3 <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('top10')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Top 10 <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('estimatedTraffic')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Est. Traffic <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalSearchVolume')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Total Volume <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('averagePosition')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    Avg Pos <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="py-3 px-3 text-right">Best Pos</th>
                <th className="py-3 px-3">Primary Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedPages.map((page) => (
                <tr key={page.rankingUrl} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 max-w-sm truncate">
                    <a
                      href={page.rankingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#008768] hover:underline flex items-center gap-1.5"
                    >
                      <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-xs">{extractUrlSlug(page.rankingUrl)}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                    </a>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {page.distinctKeywords}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                    {page.top3}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {page.top10}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-700">
                    {(page?.estimatedTraffic ?? 0).toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600">
                    {(page?.totalSearchVolume ?? 0).toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {page.averagePosition}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      #{page.bestPosition || '-'}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                      {page.primaryTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Top Ranking Landing Pages"
        items={topPagesTakeaways}
        defaultRefreshedAt={metadata.lastUploadedAt}
      />
    </div>
  );
};
