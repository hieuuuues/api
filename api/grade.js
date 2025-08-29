export default async function handler(req, res) {
  // ✅ Fix CORS
  res.setHeader("Access-Control-Allow-Origin", "https://wordwhizzy.io.vn"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Missing question or answer" });
    }

    // ✅ Gọi OpenAI để chấm
    const prompt = `
You are an IELTS examiner. Grade the following answer on a scale of 0 to 9.
Question: ${question}
Answer: ${answer}
Give feedback in 2-3 sentences and a final band score.
    `;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      })
    });

    const data = await aiResponse.json();

    const feedback = data?.choices?.[0]?.message?.content || "No feedback generated.";

    res.status(200).json({
      question,
      answer,
      feedback
    });

  } catch (error) {
    console.error("Error grading:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
