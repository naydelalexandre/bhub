// Servidor web simples para teste
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Servidor de teste funcionando!</h1>');
});

const port = 8080;
server.listen(port, () => {
  console.log(`Servidor de teste rodando em http://localhost:${port}`);
}); 