import React, { useState } from 'react';
import {
  ActivePage,
  CampaignConfig,
  DateFilterState,
  DomainName,
  FieldMapping,
  KeywordSnapshotRecord,
  SnapshotMetadata,
  ValidationResult,
} from './types';
import { CAMPAIGN_METADATA, RAW_DAILY_OBSERVATIONS } from './data/liveData';
import { DEFAULT_KEYWORD_SNAPSHOT, DEFAULT_SNAPSHOT_METADATA } from './data/archivedData';
import { DEFAULT_FIELD_MAPPING, exportKeywordsToCSV } from './utils/fileParser';
import { Navigation } from './components/Navigation';
import { GlobalControls } from './components/GlobalControls';
import { CoverPage } from './components/CoverPage';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { VisibilityReport } from './components/live/VisibilityReport';
import { AveragePositionReport } from './components/live/AveragePositionReport';
import { RankingDistributionReport } from './components/live/RankingDistributionReport';
import { EstimatedTrafficReport } from './components/live/EstimatedTrafficReport';
import { PeriodComparisonReport } from './components/live/PeriodComparisonReport';
import { WinnersLosersReport } from './components/archived/WinnersLosersReport';
import { KeywordGapsReport } from './components/archived/KeywordGapsReport';
import { TopPagesReport } from './components/archived/TopPagesReport';
import { TagsReport } from './components/archived/TagsReport';
import { MethodologyReport } from './components/MethodologyReport';
import { UploadModal } from './components/archived/UploadModal';
import { FieldMappingModal } from './components/modals/FieldMappingModal';
import { ValidationReportModal } from './components/modals/ValidationReportModal';
import { SemrushApiTester } from './components/SemrushApiTester';
import { Menu, RefreshCw, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('executive_summary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Campaign configuration
  const [campaign, setCampaign] = useState<CampaignConfig>(CAMPAIGN_METADATA);

  // Global live date filter
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    preset: '90d',
    startDate: '2026-05-22',
    endDate: '2026-08-20',
    comparisonPreset: 'previous_month',
    comparisonStartDate: '2026-06-01',
    comparisonEndDate: '2026-06-30',
    selectedDomains: [
      'example.com',
      'tripadvisor.com',
      'viator.com',
      'getyourguide.com',
    ],
  });

  // Archived spreadsheet state
  const [archivedKeywords, setArchivedKeywords] = useState<KeywordSnapshotRecord[]>(
    DEFAULT_KEYWORD_SNAPSHOT
  );
  const [snapshotMetadata, setSnapshotMetadata] = useState<SnapshotMetadata>(
    DEFAULT_SNAPSHOT_METADATA
  );
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>(DEFAULT_FIELD_MAPPING);
  const [lastValidation, setLastValidation] = useState<ValidationResult | undefined>(undefined);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'current' | 'comparison'>('current');
  const [fieldMappingModalOpen, setFieldMappingModalOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  const handleOpenUpload = (target: 'current' | 'comparison') => {
    setUploadTarget(target);
    setUploadModalOpen(true);
  };

  const handleImportSuccess = (
    newRecords: KeywordSnapshotRecord[],
    newMeta: Partial<SnapshotMetadata>,
    validation: ValidationResult
  ) => {
    setArchivedKeywords(newRecords);
    setSnapshotMetadata((prev) => ({
      ...prev,
      ...newMeta,
    }));
    setLastValidation(validation);
  };

  const handleExportCSV = () => {
    exportKeywordsToCSV(
      archivedKeywords,
      `example_travel_semrush_keywords_${snapshotMetadata.currentSnapshotDate}.csv`
    );
  };

  const handleRefreshLiveData = () => {
    setCampaign((prev) => ({
      ...prev,
      lastRefreshedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    }));
  };

  // Determine if current page is an Archived Report (where global date control is hidden)
  const isArchivedPage = [
    'archived_winners_losers',
    'archived_keyword_gaps',
    'archived_top_pages',
    'archived_tags',
  ].includes(activePage);

  const isCoverPage = activePage === 'cover';

  const totalDailyObservations = Math.floor(RAW_DAILY_OBSERVATIONS.length / 4);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-800 lg:bg-[#002B49]">
        <Navigation
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          campaign={campaign}
        />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#002B49]">
            <div className="absolute right-2 top-3 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Navigation
              activePage={activePage}
              onNavigate={(page) => {
                setActivePage(page);
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              campaign={campaign}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Mobile Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-[#002B49] px-4 text-white lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-center">
            <span className="text-sm font-bold tracking-tight">SemanticMapper</span>
            <span className="block text-[10px] text-emerald-400 font-mono">SEMrush Intelligence</span>
          </div>
          <button
            onClick={handleRefreshLiveData}
            className="rounded-lg p-2 text-slate-300 hover:text-white"
            title="Refresh Live Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </header>

        {/* Global Controls Filter Bar (for live reports) */}
        {!isCoverPage && !isArchivedPage && (
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs sm:px-8">
            <GlobalControls
              filter={dateFilter}
              onFilterChange={setDateFilter}
              campaign={campaign}
              observationCount={totalDailyObservations}
              onRefresh={handleRefreshLiveData}
            />
          </div>
        )}

        {/* Page View Container */}
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10 max-w-7xl w-full mx-auto">
          {/* Cover Page */}
          {activePage === 'cover' && (
            <CoverPage
              campaign={campaign}
              snapshotMeta={snapshotMetadata}
              onNavigate={(page) => setActivePage(page)}
            />
          )}

          {/* Executive Summary */}
          {activePage === 'executive_summary' && (
            <ExecutiveSummary campaign={campaign} filter={dateFilter} />
          )}

          {/* SEMrush Direct API Gateway & Live Test Suite (Reserved / Optional) */}
          {activePage === 'semrush_api' && (
            <SemrushApiTester onBack={() => setActivePage('executive_summary')} />
          )}

          {/* Visibility Reports */}
          {(activePage === 'visibility_scorecards' || activePage === 'visibility_trend') && (
            <VisibilityReport campaign={campaign} filter={dateFilter} />
          )}

          {/* Average Position Reports & Position Gaps */}
          {(activePage === 'avg_position_trend' ||
            activePage === 'avg_position_scorecards' ||
            activePage === 'position_gaps') && (
            <AveragePositionReport campaign={campaign} filter={dateFilter} />
          )}

          {/* Ranking Distribution */}
          {activePage === 'ranking_distribution' && (
            <RankingDistributionReport campaign={campaign} filter={dateFilter} />
          )}

          {/* Estimated Traffic */}
          {activePage === 'estimated_traffic' && (
            <EstimatedTrafficReport campaign={campaign} filter={dateFilter} />
          )}

          {/* Period Comparisons */}
          {activePage === 'quarterly_comparison' && (
            <PeriodComparisonReport campaign={campaign} initialMode="quarterly" />
          )}
          {activePage === 'monthly_comparison' && (
            <PeriodComparisonReport campaign={campaign} initialMode="monthly" />
          )}

          {/* Archived Spreadsheet Reports */}
          {activePage === 'archived_winners_losers' && (
            <WinnersLosersReport
              keywords={archivedKeywords}
              metadata={snapshotMetadata}
              onOpenUploadModal={handleOpenUpload}
              onExportProcessedData={handleExportCSV}
              onViewFieldMapping={() => setFieldMappingModalOpen(true)}
              onViewValidationModal={() => setValidationModalOpen(true)}
            />
          )}

          {activePage === 'archived_keyword_gaps' && (
            <KeywordGapsReport
              keywords={archivedKeywords}
              metadata={snapshotMetadata}
              onOpenUploadModal={handleOpenUpload}
              onExportProcessedData={handleExportCSV}
              onViewFieldMapping={() => setFieldMappingModalOpen(true)}
              onViewValidationModal={() => setValidationModalOpen(true)}
            />
          )}

          {activePage === 'archived_top_pages' && (
            <TopPagesReport
              keywords={archivedKeywords}
              metadata={snapshotMetadata}
              onOpenUploadModal={handleOpenUpload}
              onExportProcessedData={handleExportCSV}
              onViewFieldMapping={() => setFieldMappingModalOpen(true)}
              onViewValidationModal={() => setValidationModalOpen(true)}
            />
          )}

          {activePage === 'archived_tags' && (
            <TagsReport
              keywords={archivedKeywords}
              metadata={snapshotMetadata}
              onOpenUploadModal={handleOpenUpload}
              onExportProcessedData={handleExportCSV}
              onViewFieldMapping={() => setFieldMappingModalOpen(true)}
              onViewValidationModal={() => setValidationModalOpen(true)}
            />
          )}

          {/* Methodology & Data Dictionary */}
          {activePage === 'methodology' && (
            <MethodologyReport onNavigate={(page) => setActivePage(page)} />
          )}
        </main>

        {/* Global Page Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white/90 py-5 px-4 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#008768] text-[10px] font-bold text-white shadow-xs">
                SM
              </span>
              <span className="font-semibold text-[#002B49]">SemanticMapper</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">SEMrush Position Tracking Intelligence</span>
            </div>
            <div className="text-center sm:text-right text-slate-500 text-[11px]">
              © 2026 SemanticMapper Inc. Developed by <span className="font-semibold text-slate-700">Ami - SEO Girl</span>. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        targetSnapshot={uploadTarget}
        currentMetadata={snapshotMetadata}
        onImportSuccess={handleImportSuccess}
      />

      {/* Field Mapping Modal */}
      <FieldMappingModal
        isOpen={fieldMappingModalOpen}
        onClose={() => setFieldMappingModalOpen(false)}
        currentMapping={fieldMapping}
        onSaveMapping={setFieldMapping}
      />

      {/* Validation Report Modal */}
      <ValidationReportModal
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        validationResult={lastValidation}
        metadata={snapshotMetadata}
      />
    </div>
  );
}
