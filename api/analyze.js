export default async function handler(req, res) {
  // CORS 헤더 설정 (모바일 포함 모든 브라우저 대응)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { dream } = req.body;

  const SYS = `당신은 DreamPick 6의 AI 꿈 해몽 엔진입니다. 동양 오행 수리학을 기반으로 번호를 선정합니다. 순수 JSON만 반환하세요. 마크다운 없이.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "interpretation": "꿈 해석 텍스트",
  "wealth": 85,
  "love": 70,
  "success": 90,
  "prob": 75,
  "lucky_numbers": [3, 15, 23, 38, 42, 45],
  "number_reasons": ["이유1", "이유2", "이유3", "이유4", "이유5", "이유6"],
  "image_prompt": "dream scene description in English",
  "art_type": "default"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYS,
        messages: [{ role: 'user', content: dream }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
