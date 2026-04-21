export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { dream } = req.body;

  const SYS = `당신은 DreamPick 6의 AI 꿈 해몽 엔진입니다. 동양 오행 수리학을 기반으로 번호를 선정합니다. 순수 JSON만 반환하세요. 마크다운 없이.`;

  const prompt = `Dream: ${dream}

오행 수리학으로 꿈을 해몽하고 로또 번호 6개를 추천해줘.
반드시 아래 JSON 형식으로만 응답:
{
  "interpretation": "꿈 해석 텍스트 200-300자",
  "wealth": 85,
  "love": 70,
  "success": 90,
  "prob": 75,
  "lucky_numbers": [3, 15, 23, 38, 42, 45],
  "art_type": "water or fire or gold or sky or earth",
  "ohaeng_info": {"main": "주오행 한자+한글", "reason": "이 꿈이 해당 오행인 이유 1-2문장"},
  "number_reasons": [
    {"keyword": "오행·번호 예:水·1번", "reason": "오행 수리학 근거 2-3문장"},
    {"keyword": "...", "reason": "..."},
    {"keyword": "...", "reason": "..."},
    {"keyword": "...", "reason": "..."},
    {"keyword": "...", "reason": "..."},
    {"keyword": "...", "reason": "..."}
  ],
  "bonus_sets": [
    {"label": "상생 보조 1세트", "numbers": [1,2,3,4,5,6], "desc": "간단설명"},
    {"label": "상생 보조 2세트", "numbers": [1,2,3,4,5,6], "desc": "간단설명"},
    {"label": "상생 보조 3세트", "numbers": [1,2,3,4,5,6], "desc": "간단설명"},
    {"label": "상생 보조 4세트", "numbers": [1,2,3,4,5,6], "desc": "간단설명"}
  ],
  "image_prompt": "dream scene description in English"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYS,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  let text = data.content?.[0]?.text || '';
  text = text.replace(/```json|```/g, '').trim();
  res.status(200).json({ result: text });
}
