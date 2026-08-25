import React, { useState } from 'react';
import { TakeawayItem } from '../types';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, HelpCircle, RefreshCw, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface KeyTakeawaysProps {
  reportTitle: string;
  items: TakeawayItem[];
  defaultRefreshedAt?: string;
  onRefreshNarrative?: () => void;
}

export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({
  reportTitle,
  items,
  defaultRefreshedAt = '2026-08-21 10:45:00 UTC',
  onRefreshNarrative,
}) => {
  const [refreshedAt, setRefreshedAt] = useState(defaultRefreshedAt);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setRefreshedAt(`${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]} UTC`);
      setIsRefreshing(false);
      if (onRefreshNarrative) onRefreshNarrative();
    }, 450);
  };

  return (
    <div id="key-takeaways-section" className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#008768]/10 text-[#008768]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-semibold text-[#002B49]">Key Takeaways &amp; Recommended Actions</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Evidence-based synthesis for <strong className="text-slate-700">{reportTitle}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Analysis refreshed: <strong className="text-slate-700 font-mono">{refreshedAt}</strong></span>
          </div>
          <button
            id="refresh-takeaways-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:opacity-60"
            title="Recalculate and refresh narrative synthesis"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((item, idx) => {
          const isRisk = item.opportunityOrRisk === 'risk';
          const isOpp = item.opportunityOrRisk === 'opportunity';

          return (
            <div
              key={idx}
              className={`rounded-lg border p-4 transition ${
                isRisk
                  ? 'border-amber-200/80 bg-amber-50/40'
                  : isOpp
                  ? 'border-emerald-200/80 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isRisk ? (
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  ) : isOpp ? (
                    <TrendingUp className="h-4 w-4 shrink-0 text-[#008768]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-600" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {isRisk ? 'Risk / Area to Address' : isOpp ? 'Strategic Opportunity' : 'Verified Finding'}
                  </span>
                </div>
                <span className="rounded bg-white/80 px-2 py-0.5 text-[11px] font-mono text-slate-500 border border-slate-200/60">
                  {item.comparisonType.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="mt-2.5">
                <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.whatHappened}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.whyItMatters}</p>
              </div>

              <div className="mt-3 rounded-md bg-white/90 p-2.5 border border-slate-200/70 text-xs">
                <div className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#008768] mt-0.5" />
                  <div>
                    <span className="font-medium text-[#002B49]">Action: </span>
                    <span className="text-slate-700">{item.recommendedAction}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span className="font-mono font-medium text-slate-700">Metric: {item.supportingMetric}</span>
                  {item.dataLimitation && (
                    <span className="flex items-center gap-1 text-slate-500" title={item.dataLimitation}>
                      <HelpCircle className="h-3 w-3 text-slate-400" />
                      <span>Limitation: {item.dataLimitation}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
