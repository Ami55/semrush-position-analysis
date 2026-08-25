export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const key = (req.body?.key || process.env.SEMRUSH_API_KEY || '').trim().replace(/^['"`]|['"`]$/g, '').trim();
  if (!key) return res.status(400).json({ success: false, errorType: 'MISSING_KEY', errorMessage: 'No SEMrush API key was provided or configured.', testedAt: new Date().toISOString() });
  const started = Date.now();
  try {
    const url = `https://api.semrush.com/?type=domain_ranks&key=${encodeURIComponent(key)}&export_columns=Db,Dn,Rk,Or,Ot,Oc&domain=google.com&database=us`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Semrush-Position-Analysis/1.0' } });
    const text = await response.text();
    const success = response.ok && text.trim().length > 0 && !text.startsWith('ERROR ');
    const latencyMs = Date.now() - started;
    if (success) return res.status(200).json({ success: true, statusCode: response.status, latencyMs, message: 'SEMrush API key verified successfully.', linesReturned: text.trim().split('\n').length, trackingApiAccessible: false, rawSnippet: text.slice(0, 800), testedAt: new Date().toISOString() });
    const invalid = response.status === 401 || response.status === 403 || /WRONG KEY|ERROR 120/i.test(text);
    const noUnits = /NOT ENOUGH UNITS|ERROR 50|quota/i.test(text);
    return res.status(200).json({ success: false, statusCode: response.status, latencyMs, errorType: invalid ? 'INVALID_OR_UNSUBSCRIBED_KEY' : noUnits ? 'INSUFFICIENT_UNITS' : 'API_ERROR', errorMessage: text.slice(0, 500) || 'SEMrush rejected the request.', rawSnippet: text.slice(0, 800), resolutionHint: 'Confirm the key has an active SEMrush API subscription and sufficient API units.', testedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ success: false, latencyMs: Date.now() - started, errorType: 'NETWORK_ERROR', errorMessage: error?.message || 'Could not reach SEMrush.', testedAt: new Date().toISOString() });
  }
}
