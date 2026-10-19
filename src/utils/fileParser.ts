import Papa from 'papaparse';
import { FieldMapping, KeywordSnapshotRecord, ValidationIssue, ValidationResult } from '../types';

export const DEFAULT_FIELD_MAPPING: FieldMapping = {
  keyword: 'Keyword',
  currentPosition: 'Position',
  previousPosition: 'Previous position',
  searchVolume: 'Search Volume',
  rankingUrl: 'URL',
  intent: 'Intent',
  tags: 'Tags',
  tripadvisorPosition: 'Tripadvisor Position',
  viatorPosition: 'Viator Position',
  getyourguidePosition: 'GetYourGuide Position',
  estimatedTraffic: 'Estimated Traffic',
};

// Auto-detect matching headers from uploaded CSV/Excel columns
export function autoDetectFieldMapping(headers: string[]): FieldMapping {
  const mapping: FieldMapping = { ...DEFAULT_FIELD_MAPPING };
  const lowerHeaders = headers.map((h) => ({ original: h, lower: h.toLowerCase().trim() }));

  const findMatch = (candidates: string[]) => {
    for (const cand of candidates) {
      const match = lowerHeaders.find((h) => h.lower === cand.toLowerCase() || h.lower.includes(cand.toLowerCase()));
      if (match) return match.original;
    }
    return '';
  };

  // 1. Keyword
  mapping.keyword = findMatch(['keyword', 'query', 'search query', 'term']) || headers[0] || '';

  // 2. Example Travel / Primary domain rank
  const primaryRankHeader = headers.find(h => 
    (h.includes('example.com') || h.includes('example_travel')) && 
    !h.includes('_landing') && 
    !h.includes('_visibility') && 
    !h.includes('_type') && 
    !h.includes('_difference')
  );
  mapping.currentPosition = primaryRankHeader || findMatch(['current position', 'position', 'rank', 'primary position', 'primary rank', 'google position']) || '';

  // 3. Difference / Previous position
  const primaryDiffHeader = headers.find(h => 
    (h.includes('example.com') || h.includes('example_travel')) && 
    h.includes('_difference') && 
    !h.includes('_visibility')
  );
  mapping.previousPosition = primaryDiffHeader || findMatch(['previous position', 'prev position', 'prev rank', 'prior position', 'difference']) || '';

  // 4. Search volume & CPC & URL
  mapping.searchVolume = findMatch(['search volume', 'volume', 'sv', 'monthly searches']) || '';
  
  const primaryLandingHeader = headers.find(h => 
    (h.includes('example.com') || h.includes('example_travel')) && 
    h.includes('_landing')
  );
  mapping.rankingUrl = primaryLandingHeader || findMatch(['landing page', 'ranking url', 'url', 'page url', 'target url']) || '';

  // 5. Intent & Tags
  mapping.intent = findMatch(['intents', 'intent', 'search intent']) || '';
  mapping.tags = findMatch(['tags', 'tag', 'keyword group', 'group']) || '';

  // 6. Competitors
  const taHeader = headers.find(h => 
    (h.includes('tripadvisor.com') || h.includes('tripadvisor')) && 
    !h.includes('_landing') && 
    !h.includes('_visibility') && 
    !h.includes('_type') && 
    !h.includes('_difference')
  );
  mapping.tripadvisorPosition = taHeader || findMatch(['tripadvisor position', 'tripadvisor', 'tripadvisor rank', 'tripadvisor.com']) || '';

  const viatorHeader = headers.find(h => 
    (h.includes('viator.com') || h.includes('viator')) && 
    !h.includes('_landing') && 
    !h.includes('_visibility') && 
    !h.includes('_type') && 
    !h.includes('_difference')
  );
  mapping.viatorPosition = viatorHeader || findMatch(['viator position', 'viator', 'viator rank', 'viator.com']) || '';

  const gygHeader = headers.find(h => 
    (h.includes('getyourguide.com') || h.includes('getyourguide')) && 
    !h.includes('_landing') && 
    !h.includes('_visibility') && 
    !h.includes('_type') && 
    !h.includes('_difference')
  );
  mapping.getyourguidePosition = gygHeader || findMatch(['getyourguide position', 'getyourguide', 'gyg rank', 'getyourguide.com']) || '';

  mapping.estimatedTraffic = findMatch(['estimated traffic', 'traffic', 'est. traffic', 'traffic potential']) || '';

  return mapping;
}

export interface RawParsedFile {
  fileName: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export function parseCSVString(csvText: string, fileName: string = 'export.csv'): Promise<RawParsedFile> {
  return new Promise((resolve, reject) => {
    // Strip leading metadata/preamble lines if this is a SEMrush export with header comments
    let cleanedCsv = csvText.trim();
    const lines = cleanedCsv.split('\n');
    
    // Check if first few lines contain metadata banner (e.g. ID:, Report type:, etc.)
    const keywordHeaderIndex = lines.findIndex(l => l.toLowerCase().startsWith('keyword,') || l.toLowerCase().includes('keyword,*.'));
    if (keywordHeaderIndex > 0) {
      cleanedCsv = lines.slice(keywordHeaderIndex).join('\n');
    }

    Papa.parse<Record<string, any>>(cleanedCsv, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({
          fileName,
          headers,
          rows: results.data,
          totalRows: results.data.length,
        });
      },
      error: (err: Error) => {
        reject(err);
      },
    });
  });
}

// Validate rows against field mapping and SEMrush Position Tracking rules
export function validateKeywordData(
  rows: Record<string, any>[],
  mapping: FieldMapping
): { validationResult: ValidationResult; parsedRecords: KeywordSnapshotRecord[] } {
  const blockingErrors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const parsedRecords: KeywordSnapshotRecord[] = [];

  const seenKeywords = new Set<string>();
  const duplicateKeywords = new Set<string>();
  let blankKeywordCount = 0;
  let invalidPositionCount = 0;
  let missingUrlCount = 0;

  const detectedTags = new Set<string>();
  const detectedCompetitors: string[] = [];

  if (mapping.tripadvisorPosition) detectedCompetitors.push('tripadvisor.com');
  if (mapping.viatorPosition) detectedCompetitors.push('viator.com');
  if (mapping.getyourguidePosition) detectedCompetitors.push('getyourguide.com');

  if (!mapping.keyword) {
    blockingErrors.push({
      type: 'error',
      field: 'keyword',
      message: 'Keyword column mapping is required.',
    });
  }

  if (!mapping.currentPosition) {
    blockingErrors.push({
      type: 'error',
      field: 'currentPosition',
      message: 'Current Position column mapping is required.',
    });
  }

  rows.forEach((row, idx) => {
    const rawKeyword = row[mapping.keyword];
    const keyword = typeof rawKeyword === 'string' ? rawKeyword.trim() : String(rawKeyword || '').trim();

    if (!keyword) {
      blankKeywordCount++;
      return;
    }

    if (seenKeywords.has(keyword.toLowerCase())) {
      duplicateKeywords.add(keyword);
    } else {
      seenKeywords.add(keyword.toLowerCase());
    }

    // Parse positions
    const parsePos = (val: any): number | null => {
      if (val === undefined || val === null || val === '' || val === '-' || val === '>' || val === '0') return null;
      const num = Number(String(val).replace(/[^0-9.]/g, ''));
      if (isNaN(num) || num <= 0 || num > 100) return null;
      return Math.round(num);
    };

    const currentPos = parsePos(row[mapping.currentPosition]);
    const prevPos = mapping.previousPosition ? parsePos(row[mapping.previousPosition]) : null;

    if (row[mapping.currentPosition] && currentPos === null && row[mapping.currentPosition] !== '-' && row[mapping.currentPosition] !== '0') {
      invalidPositionCount++;
    }

    const rawUrl = mapping.rankingUrl ? row[mapping.rankingUrl] : '';
    const rankingUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!rankingUrl && currentPos !== null && currentPos <= 20) {
      missingUrlCount++;
    }

    const searchVol = mapping.searchVolume ? Number(String(row[mapping.searchVolume]).replace(/[^0-9]/g, '')) || 0 : 0;
    const estTraffic = mapping.estimatedTraffic ? Number(String(row[mapping.estimatedTraffic]).replace(/[^0-9]/g, '')) || 0 : 0;

    // Parse intent from letters or words (e.g., 'i', 'c', 't', 'n', 'i|c', 'Commercial', etc.)
    const rawIntent = mapping.intent ? String(row[mapping.intent] || '').trim().toLowerCase() : '';
    let intent: 'Commercial' | 'Transactional' | 'Informational' | 'Navigational' = 'Commercial';
    if (rawIntent.includes('trans') || rawIntent.includes('t') && !rawIntent.includes('inform')) {
      intent = 'Transactional';
    } else if (rawIntent.includes('info') || rawIntent === 'i' || rawIntent.startsWith('i|')) {
      intent = 'Informational';
    } else if (rawIntent.includes('nav') || rawIntent === 'n') {
      intent = 'Navigational';
    } else if (rawIntent.includes('comm') || rawIntent === 'c') {
      intent = 'Commercial';
    }

    // Parse Tags
    const rawTags = mapping.tags ? String(row[mapping.tags] || '') : '';
    const tags = rawTags
      ? rawTags
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : ['General'];
    tags.forEach((t) => detectedTags.add(t));

    // Competitor positions
    const tripadvisorPos = mapping.tripadvisorPosition ? parsePos(row[mapping.tripadvisorPosition]) : null;
    const viatorPos = mapping.viatorPosition ? parsePos(row[mapping.viatorPosition]) : null;
    const gygPos = mapping.getyourguidePosition ? parsePos(row[mapping.getyourguidePosition]) : null;

    const competitorPositions = [tripadvisorPos, viatorPos, gygPos].filter((p): p is number => p !== null && p > 0);
    const bestCompetitorPosition = competitorPositions.length > 0 ? Math.min(...competitorPositions) : null;

    // Check if the previous position column actually stored a diff (like in SEMrush overview difference column)
    const rawPrevVal = mapping.previousPosition ? row[mapping.previousPosition] : undefined;
    let positionImprovement: number | null = null;
    let computedPrevPos: number | null = prevPos;

    if (mapping.previousPosition && mapping.previousPosition.includes('_difference')) {
      // It's a SEMrush difference column
      const diffNum = Number(String(rawPrevVal).replace(/[^0-9.-]/g, ''));
      if (!isNaN(diffNum)) {
        positionImprovement = diffNum;
        if (currentPos !== null) {
          computedPrevPos = Math.max(1, currentPos + diffNum);
        }
      }
    } else if (currentPos !== null && prevPos !== null) {
      positionImprovement = prevPos - currentPos; // Standard rank diff (positive = improved)
    }

    const isNew = currentPos !== null && computedPrevPos === null;
    const isLost = currentPos === null && computedPrevPos !== null;

    let keywordPositionGap: number | null = null;
    if (currentPos !== null && bestCompetitorPosition !== null) {
      keywordPositionGap = currentPos - bestCompetitorPosition; // Positive = PRIMARY ranks worse
    }

    // Calculate CTR estimated traffic if not provided
    let finalEstTraffic = estTraffic;
    if (finalEstTraffic === 0 && searchVol > 0 && currentPos !== null) {
      const ctrMap: Record<number, number> = {
        1: 0.32,
        2: 0.16,
        3: 0.10,
        4: 0.07,
        5: 0.05,
        6: 0.04,
        7: 0.03,
        8: 0.025,
        9: 0.02,
        10: 0.015,
      };
      const ctr = currentPos <= 10 ? (ctrMap[currentPos] || 0.02) : currentPos <= 20 ? 0.008 : 0.002;
      finalEstTraffic = Math.round(searchVol * ctr);
    }

    // Keyword difficulty
    const kd = row['Keyword Difficulty'] ? Number(String(row['Keyword Difficulty']).replace(/[^0-9]/g, '')) || undefined : undefined;

    parsedRecords.push({
      id: `parsed-${idx}-${keyword.replace(/\s+/g, '-').slice(0, 14)}`,
      keyword,
      searchVolume: searchVol,
      keywordDifficulty: kd,
      intent,
      tags,
      rankingUrl: rankingUrl || 'https://www.example.com/',
      currentPosition: currentPos,
      previousPosition: computedPrevPos,
      positionImprovement,
      isNew,
      isLost,
      primaryPosition: currentPos,
      tripadvisorPosition: tripadvisorPos,
      viatorPosition: viatorPos,
      getyourguidePosition: gygPos,
      bestCompetitorPosition,
      keywordPositionGap,
      estimatedTraffic: finalEstTraffic,
    });
  });

  if (blankKeywordCount > 0) {
    warnings.push({
      type: 'warning',
      field: 'keyword',
      message: `Encountered ${blankKeywordCount} empty keyword rows (ignored).`,
      count: blankKeywordCount,
    });
  }

  if (duplicateKeywords.size > 0) {
    warnings.push({
      type: 'warning',
      field: 'keyword',
      message: `Found ${duplicateKeywords.size} duplicate keywords. De-duplicated to distinct keywords.`,
      count: duplicateKeywords.size,
    });
  }

  if (missingUrlCount > 0) {
    warnings.push({
      type: 'warning',
      field: 'rankingUrl',
      message: `${missingUrlCount} ranked keywords are missing a specific landing page URL.`,
      count: missingUrlCount,
    });
  }

  if (detectedCompetitors.length < 3) {
    warnings.push({
      type: 'warning',
      field: 'competitors',
      message: `Only ${detectedCompetitors.length} approved competitors detected. Full gap benchmark requires TripAdvisor, Viator, and GetYourGuide.`,
    });
  }

  const validationResult: ValidationResult = {
    isValid: blockingErrors.length === 0,
    totalRows: rows.length,
    distinctKeywords: seenKeywords.size,
    blockingErrors,
    warnings,
    detectedCompetitors,
    detectedTags: Array.from(detectedTags),
  };

  return {
    validationResult,
    parsedRecords,
  };
}

export function extractUrlSlug(rawUrl: string): string {
  if (!rawUrl) return '/';
  try {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlObj = new URL(trimmed);
      const slug = urlObj.pathname + urlObj.search;
      return slug.startsWith('/') ? slug : `/${slug}`;
    }
    // If it's a domain path like example.com/Rome-Tours
    const withoutDomain = trimmed.replace(/^https?:\/\//i, '').replace(/^(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/|$)/i, '/');
    const finalSlug = withoutDomain.startsWith('/') ? withoutDomain : `/${withoutDomain}`;
    return finalSlug === '' ? '/' : finalSlug;
  } catch {
    const clean = rawUrl.replace(/^https?:\/\/[^/]+/i, '');
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
}

export function exportKeywordsToCSV(records: KeywordSnapshotRecord[], filename: string = 'semrush_processed_keywords.csv'): void {
  const csvData = records.map((r) => ({
    Keyword: r.keyword,
    'Current Position': r.currentPosition ?? '-',
    'Previous Position': r.previousPosition ?? '-',
    'Position Improvement': r.positionImprovement ?? (r.isNew ? 'NEW' : r.isLost ? 'LOST' : 0),
    'Search Volume': r.searchVolume,
    'Landing Page URL': r.rankingUrl,
    Intent: r.intent,
    Tags: r.tags.join('; '),
    'Tripadvisor Position': r.tripadvisorPosition ?? '-',
    'Viator Position': r.viatorPosition ?? '-',
    'GetYourGuide Position': r.getyourguidePosition ?? '-',
    'Estimated Traffic': r.estimatedTraffic ?? 0,
  }));

  const csvString = Papa.unparse(csvData);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

