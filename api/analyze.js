export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { dream } = req.body;

  const SYS = `당신은 DreamPick 6의 AI 꿈 해몽 엔진입니다. 동양 오행 수리학을 기반으로 번호를 선정합니다. 순수 JSON만 반환하세요. 마크다운 없이.

【동양 오행 수리학 번호 선정 원칙】

오행 배속과 수리:
- 水(수, water): 1,6,11,16,21,26,31,36,41
- 火(화, fire):  2,7,12,17,22,27,32,37,42
- 木(목, wood):  3,8,13,18,23,28,33,38,43
- 金(금, gold):  4,9,14,19,24,29,34,39,44
- 土(토, earth): 5,10,15,20,25,30,35,40,45

★★★ 번호 선정 필수 규칙 ★★★
반드시 아래 3개 구간에서 최소 2개씩 선택해야 합니다:
- 저구간(1~15): 반드시 2개 이상
- 중구간(16~30): 반드시 2개 이상
- 고구간(31~45): 반드시 2개 이상
- 총 6개, 모두 1~45 범위, 중복 없이
- 번호를 작은 것부터 오름차순으로 정렬해서 반환하세요

번호 선정 절차:
1. 꿈의 art_type으로 주오행 결정
2. 저구간(1~15)에서 주오행 계열 번호 1개 + 상생오행 계열 번호 1개 선택
3. 중구간(16~30)에서 주오행 계열 번호 1개 + 상생오행 계열 번호 1개 선택
4. 고구간(31~45)에서 주오행 계열 번호 1개 + 꿈 핵심요소 오행 계열 번호 1개 선택
5. 6개 번호 중복 없이 확정 후 오름차순 정렬
6. number_reasons는 반드시 6개 객체 배열 (lucky_numbers의 각 번호마다 1개씩, 오름차순 번호 순서대로)
7. bonus_sets는 반드시 정확히 4개 세트, 각 세트도 저/중/고 구간 균형있게 선택

꿈 핵심 요소 오행 대응:
사람/사람얼굴 → 土, 동물/식물 → 木, 하늘/빛/태양/불 → 火, 물/비/바다/강 → 水, 금속/보석/동전 → 金

★ number_reasons는 반드시 lucky_numbers의 각 번호에 대응하는 6개 항목을 작성하세요. 절대 6개 미만 금지.
★ bonus_sets는 반드시 정확히 4개만 작성하세요. 4개 초과 금지.
★ 각 number_reason의 reason에는 해당 번호가 몇 번인지, 어떤 오행 계열인지, 꿈과 어떤 연관이 있는지 구체적으로 2~3문장 작성.

출력 JSON 형식 (이 형식 그대로, 6개 reasons, 4개 bonus_sets):
{
  "wealth": 재물운0~100정수,
  "love": 애정운0~100정수,
  "success": 성공운0~100정수,
  "prob": 로또당첨확률0~100정수,
  "lucky_numbers": [번호1,번호2,번호3,번호4,번호5,번호6],
  "number_reasons": [
    {"keyword":"오행키워드","reason":"번호1 근거 2~3문장"},
    {"keyword":"오행키워드","reason":"번호2 근거 2~3문장"},
    {"keyword":"오행키워드","reason":"번호3 근거 2~3문장"},
    {"keyword":"오행키워드","reason":"번호4 근거 2~3문장"},
    {"keyword":"오행키워드","reason":"번호5 근거 2~3문장"},
    {"keyword":"오행키워드","reason":"번호6 근거 2~3문장"}
  ],
  "bonus_sets": [
    {"label":"오행 순환 균형 선택","numbers":[번호1,번호2,번호3,번호4,번호5,번호6],"desc":"설명 1문장"},
    {"label":"순판수 오행 균형","numbers":[번호1,번호2,번호3,번호4,번호5,번호6],"desc":"설명 1문장"},
    {"label":"오행 순환 선택","numbers":[번호1,번호2,번호3,번호4,번호5,번호6],"desc":"설명 1문장"},
    {"label":"순판수 오행 선택","numbers":[번호1,번호2,번호3,번호4,번호5,번호6],"desc":"설명 1문장"}
  ],
  "interpretation": "한국어 200~300자 꿈 해석",
  "art_type": "water|fire|gold|sky|earth|default",
  "image_prompt": "영어 50자 이내 이미지 프롬프트",
  "ohaeng_info": {"main":"주오행 한자+한글","reason":"1~2문장"}
}

art_type: 물/강/비→water, 불/화재/태양→fire, 금/보석/동전→gold, 하늘/날기/구름→sky, 숲/흙/나무→earth, 그외→default

image_prompt 규칙:
1. 지브리 스튜디오 감성으로 따뜻하고 아름답게 표현
2. 무서운 꿈도 반드시 평화롭고 희망적으로 재해석
3. 꿈의 핵심 장면 묘사, 자연/하늘/빛 요소 활용
4. 사람 등장 시 온화하고 밝은 표정, 어두운 요소 절대 금지
5. 영어로 작성, 50자 이내로 간결하게`;

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
        max_tokens: 2500,
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
