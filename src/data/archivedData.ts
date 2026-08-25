import { KeywordSnapshotRecord, SnapshotMetadata } from '../types';
import { SEMRUSH_90DAY_EXPORT_CSV } from './user90DayRaw';
import Papa from 'papaparse';
import { autoDetectFieldMapping, validateKeywordData } from '../utils/fileParser';

// Parse the user's actual 90-day SEMrush Position Tracking CSV
function getInitialUserRecords(): KeywordSnapshotRecord[] {
  try {
    const parsed = Papa.parse<Record<string, any>>(SEMRUSH_90DAY_EXPORT_CSV, {
      header: true,
      skipEmptyLines: 'greedy',
    });
    const headers = parsed.meta.fields || [];
    const mapping = autoDetectFieldMapping(headers);
    const { parsedRecords } = validateKeywordData(parsed.data, mapping);
    if (parsedRecords && parsedRecords.length > 0) {
      return parsedRecords;
    }
  } catch (e) {
    console.error('Failed to parse 90-day SEMrush CSV:', e);
  }
  return [];
}

const PARSED_USER_RECORDS = getInitialUserRecords();

export const DEFAULT_SNAPSHOT_METADATA: SnapshotMetadata = {
  currentSnapshotDate: '2026-08-21',
  comparisonSnapshotDate: '2026-05-20',
  campaign: 'toursbylocals.com – mobile (ID: 2392444)',
  market: 'United States / Google / English / Mobile',
  device: 'Mobile',
  domain: 'toursbylocals.com',
  source: 'SEMrush Position Tracking 90-Day Export (1,462 Tracked Keywords)',
  totalRows: 1462,
  distinctKeywords: 1462,
  lastUploadedAt: '2026-08-21 18:45:00 UTC',
};

// Purely derived from the user's actual SEMrush CSV export (no legacy mock data)
export const DEFAULT_KEYWORD_SNAPSHOT: KeywordSnapshotRecord[] = PARSED_USER_RECORDS;
