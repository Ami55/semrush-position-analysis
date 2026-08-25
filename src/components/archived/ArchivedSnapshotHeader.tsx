import React, { useState } from 'react';
import { SnapshotMetadata, ValidationResult } from '../../types';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Upload,
} from 'lucide-react';

interface ArchivedSnapshotHeaderProps {
  metadata: SnapshotMetadata;
  validationResult?: ValidationResult;
  onOpenUploadModal: (target: 'current' | 'comparison') => void;
  onExportProcessedData: () => void;
  onViewFieldMapping: () => void;
  onViewValidationModal: () => void;
}

export const ArchivedSnapshotHeader: React.FC<ArchivedSnapshotHeaderProps> = ({
  metadata,
  validationResult,
  onOpenUploadModal,
  onExportProcessedData,
  onViewFieldMapping,
  onViewValidationModal,
}) => {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm">
      {/* Upper snapshot identity */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Data Snapshot
            </span>
            <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
              Source: {metadata.source}
            </span>
            <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
              Status: This is not a live daily feed.
            </span>
          </div>

          <h2 className="mt-2.5 text-base font-bold text-amber-950">
            Archived Position Tracking Snapshot
          </h2>
          <p className="mt-0.5 text-xs text-amber-900/80">
            Current snapshot: <strong className="font-mono text-amber-950">{metadata.currentSnapshotDate}</strong> • Comparison snapshot: <strong className="font-mono text-amber-950">{metadata.comparisonSnapshotDate}</strong>
          </p>
          <div className="mt-1 text-[11px] font-medium text-amber-800">
            Campaign: <span className="font-mono">{metadata.campaign}</span> • Market: <span className="font-mono">{metadata.market}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="replace-current-snapshot-btn"
            onClick={() => onOpenUploadModal('current')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-2xs transition hover:bg-amber-100/60 active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 text-amber-700" />
            <span>Replace Current Snapshot</span>
          </button>

          <button
            id="replace-comparison-snapshot-btn"
            onClick={() => onOpenUploadModal('comparison')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition hover:bg-amber-100/60 active:scale-95"
          >
            <Upload className="h-3.5 w-3.5 text-amber-600" />
            <span>Replace Comparison Snapshot</span>
          </button>

          <button
            id="download-processed-data-btn"
            onClick={onExportProcessedData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download Processed Data</span>
          </button>

          <button
            id="view-field-mapping-btn"
            onClick={onViewFieldMapping}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            title="Inspect or adjust field mappings"
          >
            <Settings2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Field Mapping</span>
          </button>

          <button
            id="view-validation-results-btn"
            onClick={onViewValidationModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            title="View validation report and data integrity checks"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Validation Results</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="mt-3.5 flex items-center justify-between border-t border-amber-200/80 pt-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-700" />
          <span className="font-semibold">
            Changing the live dashboard date control does not change this report.
          </span>
        </div>
        <div className="text-[11px] font-mono text-amber-800">
          Loaded {metadata.distinctKeywords} distinct keywords ({metadata.totalRows} records)
        </div>
      </div>
    </div>
  );
};
