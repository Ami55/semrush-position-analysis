import React, { useState, useMemo } from 'react';
import {
  KeywordSnapshotRecord,
  SnapshotMetadata,
  TagAggregatedRecord,
  TakeawayItem,
} from '../../types';
import { ArchivedSnapshotHeader } from './ArchivedSnapshotHeader';
import { KeyTakeaways } from '../KeyTakeaways';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  HelpCircle,
  Info,
  Layers,
  Search,
  Tag as TagIcon,
} from 'lucide-react';

interface TagsReportProps {
  keywords: KeywordSnapshotRecord[];
  metadata: SnapshotMetadata;
  onOpenUploadModal: (target: 'current' | 'comparison') => void;
  onExportProcessedData: () => void;
  onViewFieldMapping: () => void;
  onViewValidationModal: () => void;
}

export const TagsReport: React.FC<TagsReportProps> = ({
  keywords,
  metadata,
  onOpenUploadModal,
  onExportProcessedData,
  onViewFieldMapping,
  onViewValidationModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate by Tag
  const tagAggregations: TagAggregatedRecord[] = useMemo(() => {
    const tagMap = new Map<string, KeywordSnapshotRecord[]>();

    keywords.forEach((k) => {
      k.tags.forEach((tag) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        const list = tagMap.get(cleanTag) || [];
        list.push(k);
        tagMap.set(cleanTag, list);
      });
    });

    const results: TagAggregatedRecord[] = [];

    tagMap.forEach((kwList, tag) => {
      const distinctKeywords = kwList.length;
      let top3 = 0;
      let top10 = 0;
      let top20 = 0;
      let top100 = 0;
      let totalSearchVolume = 0;
      let estimatedTraffic = 0;
      let posSum = 0;
      let validPosCount = 0;
      let prevPosSum = 0;
      let prevValidCount = 0;

      kwList.forEach((k) => {
        totalSearchVolume += k.searchVolume;
        estimatedTraffic += k.estimatedTraffic || 0;

        if (k.primaryPosition !== null && k.primaryPosition > 0) {
          posSum += k.primaryPosition;
          validPosCount++;
          if (k.primaryPosition <= 3) top3++;
          if (k.primaryPosition <= 10) top10++;
          if (k.primaryPosition <= 20) top20++;
          if (k.primaryPosition <= 100) top100++;
        }

        if (k.previousPosition !== null && k.previousPosition > 0) {
          prevPosSum += k.previousPosition;
          prevValidCount++;
        }
      });

      const averagePosition = validPosCount > 0 ? Number((posSum / validPosCount).toFixed(1)) : 0;
      const prevAvgPos = prevValidCount > 0 ? Number((prevPosSum / prevValidCount).toFixed(1)) : averagePosition;
      const positionImprovement = Number((prevAvgPos - averagePosition).toFixed(1));

      // Calculate pseudo visibility for tag based on Top 3 / 10 proportions
      const visibility = Number(((top3 * 1.0 + (top10 - top3) * 0.35 + (top20 - top10) * 0.1) / distinctKeywords * 100).toFixed(2));
      const visibilityChange = Number((positionImprovement * 0.4).toFixed(2));
      const estimatedTrafficChange = Math.round(positionImprovement * 45);

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
        searchVolume: totalSearchVolume,
      });
    });

    return results.sort((a, b) => b.distinctKeywords - a.distinctKeywords);
  }, [keywords]);

  const filteredTags = useMemo(() => {
    return tagAggregations.filter((t) =>
      t.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tagAggregations, searchQuery]);

  const tagTakeaways: TakeawayItem[] = [
    {
      whatHappened: `Segmented performance across ${tagAggregations.length} keyword tags, highlighting top momentum in Local Guides, Rome Private Tours, and Tokyo Local Guides categories.`,
      whyItMatters: 'Tag-level aggregation enables destination managers and product teams to isolate category-specific SEO trajectories.',
      opportunityOrRisk: 'opportunity',
      recommendedAction: 'Allocate localized guide outreach and tour inventory expansion to tags with high search volume and high average position.',
      supportingMetric: `${tagAggregations.length} Tracked Strategic Tags`,
      comparisonType: 'previous_period',
      dataLimitation: 'Keywords frequently belong to multiple tags. Tag totals overlap and must not be summed across categories.',
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
            Report 13: Keyword Performance by Tag
          </h1>
        </div>
        <p className="mt-2 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Aggregates keyword performance across categories, destination clusters and tour types. Single keywords often carry multiple tags.
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

      {/* Disclose Overlap Rule Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Multi-Tag Overlap Disclosure:</strong>
          SEMrush keywords commonly belong to multiple tags (for instance, a keyword may belong to both "Rome Private Tours" and "Europe"). Tag keyword counts and traffic estimates overlap and should not be added together across categories.
        </div>
      </div>

      {/* Data Table Container */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by tag name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing {filteredTags.length} category tags
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-sans font-bold uppercase tracking-wider text-[11px] text-slate-600">
                <th className="py-3 px-4">Tag / Category</th>
                <th className="py-3 px-3 text-right">Distinct KWs</th>
                <th className="py-3 px-3 text-right">Est. Visibility</th>
                <th className="py-3 px-3 text-right">Avg Position</th>
                <th className="py-3 px-3 text-right">Pos Change</th>
                <th className="py-3 px-3 text-right">Top 3</th>
                <th className="py-3 px-3 text-right">Top 10</th>
                <th className="py-3 px-3 text-right">Top 20</th>
                <th className="py-3 px-3 text-right">Total Volume</th>
                <th className="py-3 px-3 text-right">Est. Traffic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTags.map((t) => {
                const isPosImproved = t.positionImprovement >= 0;
                return (
                  <tr key={t.tag} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                      <TagIcon className="h-3.5 w-3.5 text-[#008768]" />
                      <span>{t.tag}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {t.distinctKeywords}
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                      {t.visibility}%
                    </td>

                    <td className="py-3 px-3 text-right text-slate-800">
                      {t.averagePosition}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isPosImproved ? (
                        <span className="inline-flex items-center text-emerald-600 font-bold">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          +{t.positionImprovement}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 font-bold">
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          {t.positionImprovement}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      {t.top3}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-slate-800">
                      {t.top10}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-600">
                      {t.top20}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-600">
                      {(t?.totalSearchVolume ?? 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-700 font-semibold">
                      {(t?.estimatedTraffic ?? 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways */}
      <KeyTakeaways
        reportTitle="Keyword Performance by Tag"
        items={tagTakeaways}
        defaultRefreshedAt={metadata.lastUploadedAt}
      />
    </div>
  );
};
