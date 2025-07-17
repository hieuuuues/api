export default async function handler(req, res) {
  // ✅ Thêm header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Trả về sớm nếu là request OPTIONS (tiền kiểm tra CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu OPENAI_API_KEY' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: req.body.messages || [
          { role: 'user', content: 'Bạn có thể làm gì?' }
        ],
      }),
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Lỗi gọi OpenAI', chiTiet: error.message });
  }
}
