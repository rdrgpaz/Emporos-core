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

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "user",
              content: "Generate high-converting buyer intent ads for " + product + " in " + lang
            }
          ],
          max_tokens: 300
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
    res.writeHead(200);
    return res.end("Emporos seguro");
  }

  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Rodando...");
});
