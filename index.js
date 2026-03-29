const http = require("http");

const SECRET = "emporos123";

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/") {
      return sendText(res, 200, "Emporos Google otimizado");
    }

    if (!req.url.startsWith("/generate")) {
      return sendText(res, 404, "Not found");
    }

    const url = new URL(req.url, "http://" + req.headers.host);
    const key = url.searchParams.get("key");

    if (key !== SECRET) {
      return sendText(res, 403, "Acesso negado");
    }

    const product = url.searchParams.get("product") || "unknown";
    const lang = url.searchParams.get("lang") || "en";

    const prompt =
      "Create a high-converting Google Ads campaign for this product.\n" +
      "Product: " + product + "\n" +
      "Language: " + lang + "\n" +
      "Rules:\n" +
      "- Only buyer intent keywords\n" +
      "- Do not include review, reviews, free, pdf, download\n" +
      "- Headlines must be concise and ad-friendly\n" +
      "- Descriptions must be concise and conversion-focused\n" +
      "- Return only the requested structured data\n";

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
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                keywords: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                headlines: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                descriptions: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                negative_keywords: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: [
                "keywords",
                "headlines",
                "descriptions",
                "negative_keywords"
              ]
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return sendJson(res, response.status, {
        error: "Erro da API Google",
        details: data
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return sendJson(res, 500, {
        error: "Resposta vazia da IA"
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      return sendJson(res, 500, {
        error: "JSON inválido retornado pela IA",
        raw: text
      });
    }

    return sendJson(res, 200, parsed);
  } catch (err) {
    return sendJson(res, 500, {
      error: "Erro interno",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Emporos rodando na porta " + PORT);
});
