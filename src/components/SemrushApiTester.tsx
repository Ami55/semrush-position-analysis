import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  Database,
  ArrowRight,
  Clock,
  ShieldCheck,
  Code,
  Search,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { DomainName } from '../types';

interface TestResult {
  success: boolean;
  statusCode?: number;
  latencyMs?: number;
  message?: string;
  errorType?: string;
  errorMessage?: string;
  resolutionHint?: string;
  rawResponse?: string;
  linesReturned?: number;
  trackingApiAccessible?: boolean;
  campaignsCount?: number;
  campaigns?: any[];
  rawSnippet?: string;
  testedAt?: string;
}

interface StatusResponse {
  configured: boolean;
  source?: string;
  maskedKey?: string;
  message?: string;
}

interface QueryResult {
  success: boolean;
  type?: string;
  totalRows?: number;
  headers?: string[];
  rows?: Record<string, string>[];
  error?: string;
}

interface SemrushApiTesterProps {
  onBack?: () => void;
}

export const SemrushApiTester: React.FC<SemrushApiTesterProps> = ({ onBack }) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);
  
  // Test state
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Live Query Explorer state
  const [queryType, setQueryType] = useState<'domain_ranks' | 'domain_organic' | 'phrase_this' | 'tracking_campaigns'>('domain_ranks');
  const [targetDomain, setTargetDomain] = useState<string>('example.com');
  const [targetPhrase, setTargetPhrase] = useState<string>('private tour guide');
  const [targetDatabase, setTargetDatabase] = useState<string>('us');
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'tester' | 'explorer' | 'docs'>('tester');

  // Load server key status on mount
  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/semrush/status');
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
      }
    } catch {
      setStatus({ configured: false, message: 'Could not connect to local server backend.' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTestKey = async (overrideKey?: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const payload: { key?: string } = {};
      const keyToSend = overrideKey !== undefined ? overrideKey : apiKeyInput.trim();
      if (keyToSend) {
        payload.key = keyToSend;
      }

      const res = await fetch('/api/semrush/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: TestResult = await res.json();
      setTestResult(data);
      checkKeyStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        errorType: 'NETWORK_ERROR',
        errorMessage: err.message || 'Failed to reach SEMrush API endpoint through backend proxy.',
        testedAt: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRunQuery = async () => {
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const payload: any = {
        type: queryType,
        database: targetDatabase,
      };

      if (apiKeyInput.trim()) {
        payload.key = apiKeyInput.trim();
      }

      if (queryType === 'domain_ranks' || queryType === 'domain_organic') {
        payload.domain = targetDomain.trim();
        payload.display_limit = 15;
      } else if (queryType === 'phrase_this') {
        payload.phrase = targetPhrase.trim();
      }

      const res = await fetch('/api/semrush/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Query execution failed.',
      });
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Informational Banner about Future API Key */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <Key className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>Reserved for Future Key:</strong> The direct SEMrush API is completely optional. Your dashboard is currently powered by your verified 90-day Position Tracking CSV export. If you acquire a SEMrush Business API key later, you can test and activate it here.
          </span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg bg-white border border-blue-200 px-3 py-1.5 font-semibold text-blue-800 hover:bg-blue-100/50 shrink-0 transition"
          >
            ← Back to Executive Summary
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">SEMrush API Connection &amp; Live Test Suite</h1>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Optional Integration
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Authenticate, test endpoints, check latency, and execute live SEMrush organic research and position tracking queries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => checkKeyStatus()}
              disabled={statusLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'tester'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            1. Key Verification &amp; Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'explorer'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="h-4 w-4" />
            2. Live Query Explorer
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code className="h-4 w-4" />
            3. Setup &amp; Documentation
          </button>
        </div>
      </div>

      {/* TAB 1: Key Tester & Diagnostics */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Key Input & Trigger */}
          <div className="lg:col-span-1 space-y-6">
            {/* Backend Status Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Environment Status</h2>
              <div className="mt-3">
                {statusLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Checking environment variable...
                  </div>
                ) : status?.configured ? (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Key Detected in Environment</div>
                      <div className="text-xs font-mono text-emerald-700 mt-0.5">{status.maskedKey}</div>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        Loaded via <code className="font-mono font-semibold">SEMRUSH_API_KEY</code>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">No Environment Key Found</div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        You can test a key directly below or add it to your environment secrets.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Input Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">Test Your SEMrush API Key</h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter your SEMrush API key to run a live handshake and check authorization.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SEMrush API Key (V4 or standard)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder={status?.configured ? 'Using environment key (or paste to override)' : 'Paste SEMrush API key here...'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    {apiKeyInput && (
                      <button
                        onClick={() => setApiKeyInput('')}
                        className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleTestKey()}
                    disabled={testing || (!apiKeyInput.trim() && !status?.configured)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Running Live Diagnostics...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Run Connection Test
                      </>
                    )}
                  </button>

                  {status?.configured && (
                    <button
                      onClick={() => handleTestKey('')}
                      disabled={testing}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Test Environment Key
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostics Output */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs min-h-[420px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Diagnostic Results</h2>
                  <p className="text-xs text-slate-500">Real-time HTTP response from api.semrush.com</p>
                </div>
                {testResult?.testedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Tested: {new Date(testResult.testedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="mt-5">
                {!testResult && !testing && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Key className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">No Test Executed Yet</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm">
                      Click <span className="font-semibold text-orange-600">"Run Connection Test"</span> on the left to verify your SEMrush API key and test server responsiveness.
                    </p>
                  </div>
                )}

                {testing && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <RefreshCw className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                    <h3 className="text-sm font-bold text-slate-800">Contacting SEMrush API...</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Sending handshake request to <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">api.semrush.com</code>
                    </p>
                  </div>
                )}

                {testResult && (
                  <div className="space-y-5">
                    {/* Status Badge */}
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-4 ${
                        testResult.success
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-rose-200 bg-rose-50 text-rose-900'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-sm">
                          {testResult.success
                            ? 'Authentication Succeeded: Key is Active'
                            : `Authentication Failed (${testResult.errorType || 'ERROR'})`}
                        </div>
                        <p className="mt-1 text-xs">
                          {testResult.message || testResult.errorMessage}
                        </p>
                        {testResult.resolutionHint && (
                          <div className="mt-2.5 rounded border border-rose-300 bg-rose-100/60 p-2 text-xs font-normal text-rose-950">
                            <strong>Why this happens:</strong> {testResult.resolutionHint}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold text-slate-500">HTTP Status</div>
                        <div className="mt-1 font-mono text-base font-bold text-slate-800">
                          {testResult.statusCode || 200}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold text-slate-500">Round-Trip Latency</div>
                        <div className="mt-1 font-mono text-base font-bold text-slate-800">
                          {testResult.latencyMs} ms
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold text-slate-500">Lines Received</div>
                        <div className="mt-1 font-mono text-base font-bold text-slate-800">
                          {testResult.linesReturned ?? 0}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="text-[11px] font-semibold text-slate-500">Tracking API</div>
                        <div className="mt-1 font-mono text-xs font-bold text-slate-800">
                          {testResult.trackingApiAccessible ? 'Available' : 'Restricted / Base'}
                        </div>
                      </div>
                    </div>

                    {/* Raw Response Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700">Raw SEMrush Response</span>
                        <span className="text-[10px] text-slate-400 font-mono">api.semrush.com/</span>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-48">
                        <pre>{testResult.rawSnippet || testResult.rawResponse || JSON.stringify(testResult, null, 2)}</pre>
                      </div>
                    </div>

                    {/* Next Action recommendation */}
                    {testResult.success ? (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
                        <div className="text-xs text-emerald-800">
                          <span className="font-bold">Next Step:</span> Test live queries on your domains in the <strong>Live Query Explorer</strong> tab.
                        </div>
                        <button
                          onClick={() => setActiveTab('explorer')}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          Open Explorer <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                        <span className="font-bold">Troubleshooting:</span> Verify that your key has active API units in SEMrush under <em>Subscription Info &gt; API Units</em>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Query Explorer */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">SEMrush Live Query Engine</h2>
                <p className="text-xs text-slate-500">Query real-time organic rankings, search volumes, and domain metrics.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Database:</span>
                <select
                  value={targetDatabase}
                  onChange={(e) => setTargetDatabase(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="us">Google US (us)</option>
                  <option value="uk">Google UK (uk)</option>
                  <option value="ca">Google Canada (ca)</option>
                  <option value="au">Google Australia (au)</option>
                  <option value="de">Google Germany (de)</option>
                  <option value="fr">Google France (fr)</option>
                  <option value="it">Google Italy (it)</option>
                  <option value="es">Google Spain (es)</option>
                </select>
              </div>
            </div>

            {/* Query Controls Grid */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Query Type</label>
                <select
                  value={queryType}
                  onChange={(e: any) => setQueryType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-none"
                >
                  <option value="domain_ranks">Domain Overview / Ranks (domain_ranks)</option>
                  <option value="domain_organic">Domain Organic Top Keywords (domain_organic)</option>
                  <option value="phrase_this">Keyword Overview / Volume (phrase_this)</option>
                  <option value="tracking_campaigns">Position Tracking Projects List</option>
                </select>
              </div>

              {(queryType === 'domain_ranks' || queryType === 'domain_organic') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Domain</label>
                  <input
                    type="text"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    placeholder="e.g. example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              {queryType === 'phrase_this' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Keyword Phrase</label>
                  <input
                    type="text"
                    value={targetPhrase}
                    onChange={(e) => setTargetPhrase(e.target.value)}
                    placeholder="e.g. private tour guide rome"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-end">
                <button
                  onClick={handleRunQuery}
                  disabled={queryLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#008768] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#007055] transition disabled:opacity-50"
                >
                  {queryLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Executing Query...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Execute SEMrush Query
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Query Output</h3>
                <p className="text-xs text-slate-500">
                  {queryResult?.totalRows ? `${queryResult.totalRows} records returned from SEMrush` : 'Run a query to inspect parsed live data'}
                </p>
              </div>
            </div>

            {queryResult?.error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                <span className="font-bold">Query Error:</span> {queryResult.error}
              </div>
            )}

            {queryResult?.rows && queryResult.rows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      {queryResult.headers?.map((header) => (
                        <th key={header} className="px-3.5 py-2.5">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {queryResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        {queryResult.headers?.map((header) => (
                          <td key={header} className="px-3.5 py-2 text-slate-800 max-w-xs truncate">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!queryResult && !queryLoading && (
              <div className="py-12 text-center text-xs text-slate-400">
                Select parameters above and execute to pull live SEMrush data.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Documentation & Instructions */}
      {activeTab === 'docs' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">How to Connect SEMrush API</h2>
            <p className="text-xs text-slate-500 mt-1">
              Follow these instructions to locate your SEMrush API key and configure seamless live synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 font-bold text-xs mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-800">Locate Your Key in SEMrush</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Log into your SEMrush account and navigate to <strong>My Profile &gt; Subscription Info &gt; API Keys</strong>. Copy your Version 4 API key.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 font-bold text-xs mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-800">Test Live Handshake</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Paste your key in the <strong>Key Verification &amp; Diagnostics</strong> tab to verify authentication, check latency, and confirm unit quota.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700 font-bold text-xs mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-800">Persist to Environment</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Set <code className="font-mono text-emerald-700 font-semibold">SEMRUSH_API_KEY</code> in the Settings Secrets panel to enable persistent automated updates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
