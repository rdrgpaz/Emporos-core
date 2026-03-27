const http = require("http");

const server = http.createServer(async (req, res) => {

  if (req.url.startsWith("/generate")) {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const product = url.searchParams.get("product") || "unknown product";
    const lang = url.searchParams.get("lang") || "en";

    const prompt = `
You are a direct response affiliate marketing expert.

Generate a HIGH-CONVERTING Google Ads campaign for: ${product}

Language: ${lang === "de" ? "German" : "English"}

STRICT RULES:
- ONLY buyer intent keywords
- NO informational queries
- NO "free", "review", "download", "pdf"
- Focus on people ready to BUY

OUTPUT JSON:
{
  "keywords": [],
  "headlines": [],
  "descriptions": []
}
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));

    } catch (err) {
      res.writeHead(500);
      return res.end("Erro ao gerar campanha");
    }
  }

  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Emporos AI running");
  }

  res.writeHead(404);
  res.end("Not found");

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Emporos rodando na porta " + PORT);
});
