export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    await fetch(`${url}/del/dp6_shared_journal`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    res.status(200).send('<h2>✅ 공유 일지 초기화 완료!</h2><p>이제 dreampick6.com으로 돌아가서 테스트하세요.</p>');
  } catch (e) {
    res.status(500).send('<h2>❌ 오류: ' + e.message + '</h2>');
  }
}
