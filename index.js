const http = require("http");

const server = http.createServer((req, res) => {

  // rota principal
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Emporos is alive");
  }

  // rota de teste
  if (req.url === "/generate") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      message: "Emporos pronto para gerar campanhas"
    }));
  }

  // qualquer outra coisa
  res.writeHead(404);
  res.end("Not found");

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Rodando na porta " + PORT);
});
