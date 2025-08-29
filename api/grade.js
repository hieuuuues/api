// /pages/api/grade.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // 👇 Thêm CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Cho preflight request
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, answer } = req.body;

    const prompt = `
    Câu hỏi: ${question}
    Câu trả lời: ${answer}

    Yêu cầu: Chấm điểm câu trả lời theo thang 0-10 và đưa ra nhận xét ngắn gọn.
    Trả về JSON dạng:
    { "score": số, "feedback": "chuỗi" }
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content);
    } catch {
      result = {
        score: 0,
        feedback: completion.choices[0].message.content,
      };
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
