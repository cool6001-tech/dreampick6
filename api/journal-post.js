export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const { entry } = req.body;

    if (!entry) return res.status(400).json({ error: 'No entry' });

    // 저장할 항목 (개인정보 없이 꿈 내용 + 결과만)
    const safe = {
      id: Date.now(),
      date: new Date().toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
      dreamText: (entry.dreamText || '').slice(0, 100),
      wealth: entry.wealth,
      love: entry.love,
      success: entry.success,
      prob: entry.prob,
      numbers: entry.numbers,
      interp: (entry.interp || '').slice(0, 200),
      artType: entry.artType || 'default',
    };

    // Redis List 앞에 추가
    await fetch(`${url}/lpush/dp6_shared_journal/${encodeURIComponent(JSON.stringify(safe))}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    // 100개 초과분 잘라내기
    await fetch(`${url}/ltrim/dp6_shared_journal/0/99`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
