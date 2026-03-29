const http = require("http");

const SECRET = "emporos123";

const server = http.createServer(async (req, res) => {

  if (req.url.startsWith("/generate")) {

    const url = new URL(req.url, "http://" + req.headers.host);
    const key = url.searchParams.get("key");

    if (key !== SECRET) {
      res.writeHead(403);
      return res.end("Acesso negado");
    }

    const product = url.searchParams.get("product") || "unknown";
    const lang = url.searchParams.get("lang") || "en";

    const prompt = `
Generate a HIGH-CONVERTING Google Ads campaign.

Product: ${product}
Language: ${lang}

STRICT RULES:
- Only buyer intent keywords
- No "free", "review", "pdf", "download"
- Focus on people ready to buy

RETURN ONLY JSON in this format:

{
  "keywords": [],
  "headlines": [],
  "descriptions": [],
  "negative_keywords": []
}
`;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GOOGLE_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(text);

    } catch (err) {
      res.writeHead(500);
      return res.end("Erro ao gerar campanha");
    }
  }

  if (req.url === "/") {
    res.writeHead(200);
    return res.end("Emporos Google otimizado");
  }

  res.writeHead(404);
  res.end("Not found");

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Rodando...");
});
