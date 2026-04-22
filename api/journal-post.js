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
      id: entry.id || Date.now(),
      date: entry.date || new Date().toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
      dreamText: (entry.dreamText || '').slice(0, 100),
      wealth: entry.wealth,
      love: entry.love,
      success: entry.success,
      prob: entry.prob,
      numbers: entry.numbers,
      interp: (entry.interp || '').slice(0, 200),
      artType: entry.artType || 'default',
      imgUrl: entry.imgUrl || null,
    };

    // imgUrl만 업데이트하는 경우 기존 항목 수정
    if (entry.imgUrl && entry.id) {
      // 기존 항목 찾아서 imgUrl만 업데이트
      try {
        const existing = await fetch(`${url}/lrange/dp6_shared_journal/0/99`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const exData = await existing.json();
        const entries = (exData.result || []).map(e => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean);
        const idx = entries.findIndex(e => e.id === entry.id);
        if (idx >= 0) {
          entries[idx].imgUrl = entry.imgUrl;
          await fetch(`${url}/lset/dp6_shared_journal/${idx}/${encodeURIComponent(JSON.stringify(entries[idx]))}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          return res.status(200).json({ ok: true, updated: true });
        }
      } catch(e2) {}
    }

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
