import React, { useState } from 'react';
import {
  FieldMapping,
  KeywordSnapshotRecord,
  SnapshotMetadata,
  ValidationResult,
} from '../../types';
import {
  autoDetectFieldMapping,
  DEFAULT_FIELD_MAPPING,
  parseCSVString,
  validateKeywordData,
} from '../../utils/fileParser';
import { SEMRUSH_90DAY_EXPORT_CSV } from '../../data/user90DayRaw';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSnapshot: 'current' | 'comparison';
  currentMetadata: SnapshotMetadata;
  onImportSuccess: (
    records: KeywordSnapshotRecord[],
    meta: Partial<SnapshotMetadata>,
    validation: ValidationResult
  ) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  targetSnapshot,
  currentMetadata,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fileType, setFileType] = useState<string>(
    targetSnapshot === 'current' ? 'Current Rankings Snapshot' : 'Comparison Rankings Snapshot'
  );
  const [snapshotDate, setSnapshotDate] = useState<string>('2026-08-21');
  const [campaignName, setCampaignName] = useState<string>('example.com – mobile (ID: 1000000)');
  const [market, setMarket] = useState<string>('United States / Google / English / Mobile');
  const [rawCSVContent, setRawCSVContent] = useState<string>('');
  const [pastedCSV, setPastedCSV] = useState<string>('');
  const [showPasteArea, setShowPasteArea] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>(DEFAULT_FIELD_MAPPING);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedRecords, setParsedRecords] = useState<KeywordSnapshotRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      setRawCSVContent(text);
      const parsed = await parseCSVString(text, file.name);
      setParsedRows(parsed.rows);
      setDetectedHeaders(parsed.headers);

      const autoMap = autoDetectFieldMapping(parsed.headers);
      setMapping(autoMap);

      setIsProcessing(false);
      setStep(2);
    } catch (err: any) {
      alert(`Error parsing file: ${err.message || 'Invalid format'}`);
      setIsProcessing(false);
    }
  };

  const handleProcessPastedText = async () => {
    if (!pastedCSV.trim()) return;
    setIsProcessing(true);
    try {
      const name = 'pasted_semrush_export.csv';
      setFileName(name);
      setRawCSVContent(pastedCSV);
      const parsed = await parseCSVString(pastedCSV, name);
      setParsedRows(parsed.rows);
      setDetectedHeaders(parsed.headers);
      setMapping(autoDetectFieldMapping(parsed.headers));
      setIsProcessing(false);
      setStep(2);
    } catch (err: any) {
      alert(`Error parsing pasted CSV: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleLoad90DaySEMrushData = async () => {
    setIsProcessing(true);
    const fname = 'SEMrush_Position_Tracking_Overview_90Days_20260821.csv';
    setFileName(fname);
    setSnapshotDate('2026-08-21');
    setCampaignName('example.com – mobile (ID: 1000000)');
    setMarket('United States / Google / English / Mobile');

    try {
      const parsed = await parseCSVString(SEMRUSH_90DAY_EXPORT_CSV, fname);
      setParsedRows(parsed.rows);
      setDetectedHeaders(parsed.headers);
      const autoMap = autoDetectFieldMapping(parsed.headers);
      setMapping(autoMap);
      setIsProcessing(false);
      setStep(2);
    } catch (err: any) {
      alert(`Error loading data: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleRunValidation = () => {
    const { validationResult, parsedRecords } = validateKeywordData(parsedRows, mapping);
    setValidation(validationResult);
    setParsedRecords(parsedRecords);
    setStep(4);
  };

  const handleFinalImport = () => {
    if (!validation || !validation.isValid) return;

    onImportSuccess(
      parsedRecords,
      {
        currentSnapshotDate: targetSnapshot === 'current' ? snapshotDate : currentMetadata.currentSnapshotDate,
        comparisonSnapshotDate: targetSnapshot === 'comparison' ? snapshotDate : currentMetadata.comparisonSnapshotDate,
        campaign: campaignName,
        market: market,
        totalRows: validation.totalRows,
        distinctKeywords: validation.distinctKeywords,
        lastUploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      },
      validation
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#002B49] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008768]">
              <FileSpreadsheet className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                SEMrush Position Tracking Upload Wizard
              </h3>
              <p className="text-[11px] text-emerald-300">
                {targetSnapshot === 'current' ? 'Update Current Snapshot' : 'Update Comparison Snapshot'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold">
          {[
            { num: 1, label: '1. File Type' },
            { num: 2, label: '2. Metadata' },
            { num: 3, label: '3. Map Columns' },
            { num: 4, label: '4. Validate' },
            { num: 5, label: '5. Preview & Import' },
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2.5 border-r border-slate-200 last:border-0 ${
                step === s.num
                  ? 'bg-white text-[#008768] font-bold border-b-2 border-b-[#008768]'
                  : step > s.num
                  ? 'text-slate-700 bg-slate-100/60'
                  : 'text-slate-400'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* STEP 1: Select File Type */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 1: Select Export Type &amp; Upload File</h4>
                <p className="text-slate-500 mt-1">
                  Upload an archived SEMrush Position Tracking keyword export (.csv, .tsv, .xlsx).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Export Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800"
                >
                  <option value="Current Rankings Snapshot">Current Rankings Snapshot (Primary keyword-level state)</option>
                  <option value="Comparison Rankings Snapshot">Comparison Rankings Snapshot (Baseline period state)</option>
                  <option value="Pages Export">Pages Export (Landing page aggregate export)</option>
                  <option value="Tags Export">Tags Export (Keyword group export)</option>
                  <option value="Ranking Distribution Export">Ranking Distribution Export</option>
                </select>
              </div>

              {/* Quick Load Your 90-Day SEMrush Export */}
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-md">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span>Your 90-Day SEMrush Position Tracking Export</span>
                  </div>
                  <p className="text-emerald-100 text-[11px]">
                    Campaign: example.com vs TripAdvisor, Viator, GetYourGuide (2026-05-20 to 2026-08-21)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoad90DaySEMrushData}
                  disabled={isProcessing}
                  className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-95 transition whitespace-nowrap cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : 'Load 90-Day Export →'}
                </button>
              </div>

              {/* Upload Drag & Drop Box */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center hover:bg-slate-100/70 transition">
                <Upload className="mx-auto h-7 w-7 text-[#008768]" />
                <span className="mt-2 block font-bold text-slate-800">
                  Drag &amp; drop SEMrush export file here or click to browse
                </span>
                <span className="mt-1 block text-[11px] text-slate-500">
                  Accepts CSV, TSV, or text spreadsheet exports
                </span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#002B49] file:text-white hover:file:bg-[#008768] cursor-pointer"
                />
              </div>

              {/* Paste CSV Text Alternative */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-xs">Or Paste Raw CSV Data Directly</span>
                  <button
                    type="button"
                    onClick={() => setShowPasteArea(!showPasteArea)}
                    className="text-xs text-[#008768] font-bold hover:underline"
                  >
                    {showPasteArea ? 'Hide Text Area' : 'Paste CSV Text'}
                  </button>
                </div>

                {showPasteArea && (
                  <div className="mt-3 space-y-2.5">
                    <textarea
                      rows={5}
                      value={pastedCSV}
                      onChange={(e) => setPastedCSV(e.target.value)}
                      placeholder="Paste your SEMrush CSV content starting with headers (Keyword, *.example.com...)..."
                      className="w-full rounded-lg border border-slate-300 bg-white p-2.5 font-mono text-[11px] text-slate-800 focus:border-[#008768] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleProcessPastedText}
                      disabled={!pastedCSV.trim() || isProcessing}
                      className="rounded-lg bg-[#002B49] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#003d66] disabled:opacity-50 cursor-pointer"
                    >
                      Parse Pasted CSV
                    </button>
                  </div>
                )}
              </div>

              {/* SEMrush Format Note */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600">
                <Info className="h-5 w-5 text-[#008768] shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong>SEMrush Export Compatibility:</strong> Standard Position Tracking export formats with all 1,462 tracked keywords, custom competitors, tags, intent codes, and landing URLs are automatically mapped and validated upon upload.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Read Metadata */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 2: Snapshot Metadata &amp; Parameters</h4>
                <p className="text-slate-500 mt-1">
                  Confirm snapshot capture date and campaign scope for: <strong className="text-slate-800">{fileName}</strong> ({parsedRows.length} rows loaded).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Snapshot Date</label>
                  <input
                    type="date"
                    value={snapshotDate}
                    onChange={(e) => setSnapshotDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Market Scope</label>
                  <input
                    type="text"
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Domain</label>
                  <input
                    type="text"
                    disabled
                    value="example.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 p-2 text-xs font-mono text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Map Columns */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 3: Map Export Columns to Dashboard Schema</h4>
                <p className="text-slate-500 mt-1">
                  Review the auto-detected column mappings. Adjust any fields if headers differ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 max-h-80 overflow-y-auto pr-2">
                {[
                  { key: 'keyword', label: 'Keyword * (Required)', required: true },
                  { key: 'currentPosition', label: 'Current Position * (Required)', required: true },
                  { key: 'previousPosition', label: 'Previous Position' },
                  { key: 'searchVolume', label: 'Search Volume' },
                  { key: 'rankingUrl', label: 'Landing Page / Ranking URL' },
                  { key: 'intent', label: 'Search Intent' },
                  { key: 'tags', label: 'Tags / Keyword Groups' },
                  { key: 'tripadvisorPosition', label: 'Tripadvisor Position' },
                  { key: 'viatorPosition', label: 'Viator Position' },
                  { key: 'getyourguidePosition', label: 'GetYourGuide Position' },
                  { key: 'estimatedTraffic', label: 'Estimated Traffic' },
                ].map((item) => (
                  <div key={item.key} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <label className="block font-bold text-slate-800 text-[11px] mb-1">
                      {item.label}
                    </label>
                    <select
                      value={(mapping as any)[item.key] || ''}
                      onChange={(e) => setMapping({ ...mapping, [item.key]: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white p-1.5 text-xs text-slate-800"
                    >
                      <option value="">-- Unmapped / Not in File --</option>
                      {detectedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Validation Results */}
          {step === 4 && validation && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 4: Data Validation &amp; Integrity Audit</h4>
                <p className="text-slate-500 mt-1">
                  Automated verification of row counts, distinct keywords, competitor presence, and position integrity.
                </p>
              </div>

              {/* Status Banner */}
              <div
                className={`rounded-xl p-4 border flex items-start gap-3 ${
                  validation.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {validation.isValid ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {validation.isValid
                      ? 'File Validation Passed — Ready for Ingestion'
                      : 'Blocking Validation Errors Found'}
                  </span>
                  <span className="text-xs">
                    {validation.isValid
                      ? `Successfully validated ${validation.distinctKeywords} distinct keywords across ${validation.totalRows} records.`
                      : 'Please correct column mappings or file format to proceed.'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Rows</span>
                  <span className="text-base font-bold font-mono text-slate-900">{validation.totalRows}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Distinct KWs</span>
                  <span className="text-base font-bold font-mono text-emerald-700">{validation.distinctKeywords}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Competitors</span>
                  <span className="text-base font-bold font-mono text-slate-900">{validation.detectedCompetitors.length} / 3</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Tags Found</span>
                  <span className="text-base font-bold font-mono text-slate-900">{validation.detectedTags.length}</span>
                </div>
              </div>

              {/* Warnings List */}
              {validation.warnings.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Non-Blocking Warnings ({validation.warnings.length}):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validation.warnings.map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Preview & Final Import */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Step 5: Preview Parsed Dataset</h4>
                <p className="text-slate-500 mt-1">
                  Sample records ready to publish into the archived spreadsheet reports.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-64">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans">
                    <tr>
                      <th className="p-2">Keyword</th>
                      <th className="p-2 text-right">PRIMARY Pos</th>
                      <th className="p-2 text-right">Prev Pos</th>
                      <th className="p-2 text-right">Volume</th>
                      <th className="p-2">Intent</th>
                      <th className="p-2 text-right">Tripadvisor</th>
                      <th className="p-2 text-right">Viator</th>
                      <th className="p-2 text-right">GYG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRecords.slice(0, 8).map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2 font-sans font-medium text-slate-900">{r.keyword}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{r.primaryPosition || '-'}</td>
                        <td className="p-2 text-right text-slate-500">{r.previousPosition || '-'}</td>
                        <td className="p-2 text-right text-slate-600">{r.searchVolume.toLocaleString()}</td>
                        <td className="p-2 font-sans">{r.intent}</td>
                        <td className="p-2 text-right text-slate-600">{r.tripadvisorPosition || '-'}</td>
                        <td className="p-2 text-right text-slate-600">{r.viatorPosition || '-'}</td>
                        <td className="p-2 text-right text-slate-600">{r.getyourguidePosition || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>

            {step === 1 && (
              <button
                type="button"
                disabled={parsedRows.length === 0}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#008768] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007055] disabled:opacity-50"
              >
                <span>Continue to Metadata</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#008768] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007055]"
              >
                <span>Continue to Field Mapping</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleRunValidation}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#008768] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007055]"
              >
                <span>Run Data Validation</span>
                <ShieldCheck className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={!validation?.isValid}
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#008768] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007055] disabled:opacity-50"
              >
                <span>Proceed to Preview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleFinalImport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#002B49] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#008768]"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Confirm &amp; Publish Snapshot</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
