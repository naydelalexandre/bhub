// Servidor web simples para teste com Express
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Servidor de teste com Express funcionando!</h1>');
});

const port = 8888;
app.listen(port, '127.0.0.1', () => {
  console.log(`Servidor de teste rodando em http://127.0.0.1:${port}`);
}); 