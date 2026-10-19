import React, { useState } from 'react';
import {
  CampaignConfig,
  ComparisonPreset,
  DateFilterState,
  DateRangePreset,
  DomainName,
} from '../types';
import {
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Square,
} from 'lucide-react';

interface GlobalControlsProps {
  campaign: CampaignConfig;
  filter: DateFilterState;
  onFilterChange: (newFilter: DateFilterState) => void;
  observationCount?: number;
  onRefresh?: () => void;
}

export function computeDatesForPreset(
  preset: DateRangePreset,
  compPreset: ComparisonPreset,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; comparisonStartDate: string; comparisonEndDate: string } {
  const latestDate = new Date('2026-08-20T00:00:00Z');

  let startDate: Date;
  let endDate: Date = new Date(latestDate);

  if (preset === '90d') {
    startDate = new Date('2026-05-22T00:00:00Z');
    endDate = new Date(latestDate);
  } else if (preset === '30d' || preset === '28d') {
    startDate = new Date(latestDate);
    startDate.setUTCDate(startDate.getUTCDate() - 29);
  } else if (preset === '7d') {
    startDate = new Date(latestDate);
    startDate.setUTCDate(startDate.getUTCDate() - 6);
  } else if (preset === 'current_month') {
    startDate = new Date('2026-08-01T00:00:00Z');
    endDate = new Date(latestDate);
  } else if (preset === 'last_month') {
    startDate = new Date('2026-07-01T00:00:00Z');
    endDate = new Date('2026-07-31T00:00:00Z');
  } else if (preset === 'current_quarter') {
    startDate = new Date('2026-07-01T00:00:00Z');
    endDate = new Date(latestDate);
  } else if (preset === 'last_quarter') {
    startDate = new Date('2026-05-22T00:00:00Z');
    endDate = new Date('2026-06-30T00:00:00Z');
  } else {
    startDate = customStart ? new Date(customStart) : new Date('2026-05-22T00:00:00Z');
    endDate = customEnd ? new Date(customEnd) : new Date(latestDate);
  }

  // Compute comparison range
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24)) + 1;

  let compStartDate: Date;
  let compEndDate: Date;

  if (compPreset === 'same_period_last_year') {
    compStartDate = new Date(startDate);
    compStartDate.setUTCFullYear(compStartDate.getUTCFullYear() - 1);
    compEndDate = new Date(endDate);
    compEndDate.setUTCFullYear(compEndDate.getUTCFullYear() - 1);
  } else if (compPreset === 'previous_month') {
    compStartDate = new Date(startDate);
    compStartDate.setUTCMonth(compStartDate.getUTCMonth() - 1);
    compEndDate = new Date(endDate);
    compEndDate.setUTCMonth(compEndDate.getUTCMonth() - 1);
  } else if (compPreset === 'previous_quarter') {
    compStartDate = new Date(startDate);
    compStartDate.setUTCMonth(compStartDate.getUTCMonth() - 3);
    compEndDate = new Date(endDate);
    compEndDate.setUTCMonth(compEndDate.getUTCMonth() - 3);
  } else {
    // previous_period
    compEndDate = new Date(startDate);
    compEndDate.setUTCDate(compEndDate.getUTCDate() - 1);
    compStartDate = new Date(compEndDate);
    compStartDate.setUTCDate(compStartDate.getUTCDate() - durationDays + 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    comparisonStartDate: compStartDate.toISOString().split('T')[0],
    comparisonEndDate: compEndDate.toISOString().split('T')[0],
  };
}

export const GlobalControls: React.FC<GlobalControlsProps> = ({
  campaign,
  filter,
  onFilterChange,
  observationCount = 60,
  onRefresh,
}) => {
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    const dates = computeDatesForPreset(preset, filter.comparisonPreset);
    onFilterChange({
      ...filter,
      preset,
      ...dates,
    });
  };

  const handleComparisonChange = (comparisonPreset: ComparisonPreset) => {
    const dates = computeDatesForPreset(filter.preset, comparisonPreset, filter.startDate, filter.endDate);
    onFilterChange({
      ...filter,
      comparisonPreset,
      ...dates,
    });
  };

  const toggleDomain = (domain: DomainName) => {
    // Example Travel is always included
    if (domain === 'example.com') return;

    let newDomains: DomainName[];
    if (filter.selectedDomains.includes(domain)) {
      if (filter.selectedDomains.length === 1) return; // keep at least 1
      newDomains = filter.selectedDomains.filter((d) => d !== domain);
    } else {
      newDomains = [...filter.selectedDomains, domain];
    }

    onFilterChange({
      ...filter,
      selectedDomains: newDomains,
    });
  };

  const allDomains: { id: DomainName; label: string; color: string }[] = [
    { id: 'example.com', label: 'Example Travel (Primary)', color: '#008768' },
    { id: 'tripadvisor.com', label: 'Tripadvisor', color: '#00aa6c' },
    { id: 'viator.com', label: 'Viator', color: '#e84c3d' },
    { id: 'getyourguide.com', label: 'GetYourGuide', color: '#ff5533' },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Upper Control Bar: Date Preset, Comparison, Domain Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Period:
          </span>
          {(
            [
              { id: '90d', label: '90 Days (Full Export)' },
              { id: '30d', label: '30 Days' },
              { id: '7d', label: '7 Days' },
              { id: 'current_month', label: 'August 2026' },
              { id: 'last_month', label: 'July 2026' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              id={`preset-btn-${item.id}`}
              onClick={() => handlePresetChange(item.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                filter.preset === item.id
                  ? 'bg-[#002B49] text-white shadow-sm font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Comparison Preset & Domain Select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Comparison Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">vs:</span>
            <select
              id="comparison-select"
              value={filter.comparisonPreset}
              onChange={(e) => handleComparisonChange(e.target.value as ComparisonPreset)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="previous_period">Previous Period (Sequential)</option>
              <option value="previous_month">Previous Month</option>
              <option value="previous_quarter">Previous Quarter</option>
            </select>
          </div>

          {/* Competitor Benchmark Toggle */}
          <div className="relative">
            <button
              id="domain-filter-dropdown-btn"
              onClick={() => setShowDomainDropdown(!showDomainDropdown)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Competitors ({filter.selectedDomains.length})</span>
            </button>

            {showDomainDropdown && (
              <div className="absolute right-0 z-30 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-1.5 mb-1.5 border-b border-slate-100">
                  Select Benchmark Domains
                </div>
                <div className="space-y-1">
                  {allDomains.map((d) => {
                    const isSelected = filter.selectedDomains.includes(d.id);
                    const isPRIMARY = d.id === 'example.com';
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDomain(d.id)}
                        disabled={isPRIMARY}
                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition ${
                          isPRIMARY ? 'bg-emerald-50/60 cursor-default' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className={`font-medium ${isPRIMARY ? 'text-[#008768] font-bold' : 'text-slate-700'}`}>
                          {d.label}
                        </span>
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#008768]" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Selected Period:</span>
            <span className="font-semibold font-mono text-slate-800">
              {filter.startDate} → {filter.endDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Comparison:</span>
            <span className="font-semibold font-mono text-slate-700">
              {filter.comparisonStartDate} → {filter.comparisonEndDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Latest Complete:</span>
            <span className="font-mono font-medium text-emerald-700">{campaign.latestDataDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Campaign:</span>
            <span className="font-medium text-slate-700">{campaign.campaignName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Tracked KWs:</span>
            <span className="font-mono font-semibold text-slate-800">
              {(campaign?.totalTrackedKeywords ?? 1462).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Observations:</span>
            <span className="font-mono font-medium text-slate-700">{observationCount} days</span>
            <span className="text-[10px] text-slate-400 font-normal">(90d export)</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Sync: {campaign.lastRefreshedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
