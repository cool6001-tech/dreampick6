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
- 水(수, water): 기본수 1·6, 상생수 3·8 → 확장: 1,6,11,16,21,26,31,36,41 중 선택
- 火(화, fire):  기본수 2·7, 상생수 9·4 → 확장: 2,7,12,17,22,27,32,37,42 중 선택
- 木(목, earth): 기본수 3·8, 상생수 1·6 → 확장: 3,8,13,18,23,28,33,38,43 중 선택
- 金(금, gold):  기본수 4·9, 상생수 5   → 확장: 4,9,14,19,24,29,34,39,44 중 선택
- 土(토, sky):   기본수 5·10, 상생수 2·7 → 확장: 5,10,15,20,25,30,35,40,45 중 선택
- 중화(default): 오행 순환 균형 선택

번호 선정 절차:
1. 꿈의 art_type으로 주오행 결정
2. 주오행 기본수 계열에서 2개 선택
3. 상생오행 수 계열에서 2개 선택
4. 꿈 속 핵심 요소(사람→土, 동물→木, 하늘·빛→火, 물·비→水, 금속·보석→金)의 오행에서 2개 추가
5. 6개 모두 1~45 범위, 중복 없이 확정

출력 JSON:
{"wealth":재물운0~100정수,"love":애정운0~100정수,"success":성공운0~100정수,"prob":로또당첨확률0~100정수,"lucky_numbers":[1~45중복없는6개정수],"number_reasons":[{"keyword":"오행·키워드 2~4자","reason":"오행 수리학 근거 포함 2~3문장"},{"keyword":"...","reason":"..."},{"keyword":"...","reason":"..."},{"keyword":"...","reason":"..."},{"keyword":"...","reason":"..."},{"keyword":"...","reason":"..."}],"bonus_sets":[{"label":"오행 순환 균형 선택","numbers":[6개정수],"desc":"상생 오행 기준 보조 번호 세트 설명 1문장"},{"label":"순판수 오행 균형","numbers":[6개정수],"desc":"순환수 기준 보조 번호 세트 설명 1문장"},{"label":"오행 순환 선택","numbers":[6개정수],"desc":"오행 순환 기준 보조 번호 세트 설명 1문장"},{"label":"순판수 오행 선택","numbers":[6개정수],"desc":"다양성 기준 보조 번호 세트 설명 1문장"}],"interpretation":"한국어200~300자","art_type":"water|fire|gold|sky|earth|default","image_prompt":"영어 이미지 프롬프트 100자 이내","ohaeng_info":{"main":"주오행 한자+한글","reason":"이 꿈이 해당 오행으로 분류된 이유 1~2문장"}}

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
        max_tokens: 2000,
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
