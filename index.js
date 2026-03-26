import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Emporos is alive 🚀");
});

app.post("/generate", async (req, res) => {
  const { product } = req.body;

  const prompt = `
You are a direct response affiliate marketing expert.

Generate HIGH-INTENT Google Ads campaign for the product: ${product}

Rules:
- ONLY buyer intent keywords
- NO informational or curiosity traffic
- NO words like: free, review, pdf, download
- Focus on purchase intent

Output:
1. 10 keywords
2. 3 ad headlines
3. 2 descriptions
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();

  res.json(data);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Emporos running on port " + PORT);
});
