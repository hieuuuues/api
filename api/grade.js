export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  const prompt = `
  Bạn là giám khảo IELTS Speaking.
  Câu hỏi: "${question}"
  Câu trả lời: "${answer}"
  Hãy:
  - Chấm điểm 0–9
  - Nhận xét ngắn gọn
  Trả về JSON như sau:
  {
    "score": số điểm,
    "feedback": "nhận xét"
  }
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { raw: content };
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
}
