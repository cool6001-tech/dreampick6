export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // LRANGE로 최신 100개 가져오기
    const r = await fetch(`${url}/lrange/dp6_shared_journal/0/99`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await r.json();
    const entries = (data.result || []).map(e => {
      try { return JSON.parse(e); } catch { return null; }
    }).filter(Boolean);

    res.status(200).json({ entries });
  } catch (e) {
    res.status(500).json({ error: e.message, entries: [] });
  }
}
