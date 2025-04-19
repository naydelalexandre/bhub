// Servidor simples para testes na porta 3001
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
      <title>BrokerBooster - Teste de Atualizações</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #3b82f6; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .feature { font-weight: bold; color: #1f2937; }
      </style>
    </head>
    <body>
      <h1>BrokerBooster - Atualizações Implementadas</h1>
      
      <div class="card">
        <h2>1. Chat de Equipe para o Gerente</h2>
        <p><span class="feature">Status:</span> Implementado ✅</p>
        <p>
          Adicionamos um chat de equipe que permite ao gerente se comunicar com todos os corretores simultaneamente.
          O chat aparece no canto inferior direito da tela do gerente.
        </p>
      </div>
      
      <div class="card">
        <h2>2. Atividades sem Clientes</h2>
        <p><span class="feature">Status:</span> Implementado ✅</p>
        <p>
          Simplificamos o formulário de atividades removendo os campos de cliente e imóvel, 
          focando apenas na tarefa, responsável e prazo.
        </p>
      </div>
      
      <div class="card">
        <h2>3. Gráficos Avançados</h2>
        <p><span class="feature">Status:</span> Implementado ✅</p>
        <p>
          Criamos o componente EnhancedPerformanceChart com visualizações mais detalhadas, 
          incluindo gráficos de área, pizza, barras e radar para análise de desempenho.
        </p>
      </div>
      
      <p>
        <strong>Nota:</strong> Para ver as implementações completas, é necessário iniciar o servidor
        principal na porta correta e resolver os conflitos de portas.
      </p>
    </body>
  </html>
  `);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
}); 