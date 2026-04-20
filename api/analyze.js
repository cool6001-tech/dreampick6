export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { dream } = req.body;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: dream }]
    })
  });
  
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  res.status(200).json({ result: text });
}
