export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.SEMRUSH_API_KEY?.trim();
  if (!key) return res.status(200).json({ configured: false, source: 'none', message: 'No SEMRUSH_API_KEY environment variable configured.' });
  const maskedKey = key.length > 8 ? `${key.slice(0, 4)}••••••••${key.slice(-4)}` : '••••••••';
  return res.status(200).json({ configured: true, source: 'env', maskedKey, message: 'SEMRUSH_API_KEY is configured in Vercel.' });
}
