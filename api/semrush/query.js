export const config = { maxDuration: 30 };

function parseTable(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((value) => value.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
  return { headers, rows };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const key = (req.body?.key || process.env.SEMRUSH_API_KEY || '').trim();
  if (!key) return res.status(400).json({ success: false, error: 'Missing SEMrush API Key' });
  const { type = 'domain_ranks', domain = 'example.com', phrase = '', database = 'us', display_limit = 20 } = req.body || {};
  const limit = Math.min(Math.max(Number(display_limit) || 20, 1), 100);
  let url;
  if (type === 'domain_ranks') url = `https://api.semrush.com/?type=domain_ranks&key=${encodeURIComponent(key)}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${encodeURIComponent(domain)}&database=${encodeURIComponent(database)}`;
  else if (type === 'domain_organic') url = `https://api.semrush.com/?type=domain_organic&key=${encodeURIComponent(key)}&display_limit=${limit}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td&domain=${encodeURIComponent(domain)}&database=${encodeURIComponent(database)}`;
  else if (type === 'phrase_this' && phrase) url = `https://api.semrush.com/?type=phrase_this&key=${encodeURIComponent(key)}&phrase=${encodeURIComponent(phrase)}&database=${encodeURIComponent(database)}&export_columns=Ph,Nq,Cp,Co,Nr,Td`;
  else if (type === 'tracking_campaigns') url = `https://api.semrush.com/tracking/v1/campaigns?key=${encodeURIComponent(key)}`;
  else return res.status(400).json({ success: false, error: 'Unsupported or incomplete query type' });
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Semrush-Position-Analysis/1.0', Accept: type === 'tracking_campaigns' ? 'application/json' : 'text/plain' } });
    const text = await response.text();
    if (!response.ok || text.startsWith('ERROR ')) return res.status(400).json({ success: false, error: text.trim().slice(0, 500) || `SEMrush returned status ${response.status}` });
    if (type === 'tracking_campaigns') {
      const data = JSON.parse(text);
      const rows = Array.isArray(data) ? data : data?.campaigns || data?.data || [];
      const headers = rows[0] ? Object.keys(rows[0]) : [];
      return res.status(200).json({ success: true, type, totalRows: rows.length, headers, rows });
    }
    const { headers, rows } = parseTable(text);
    return res.status(200).json({ success: true, type, totalRows: rows.length, headers, rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error?.message || 'SEMrush API request failed.' });
  }
}
