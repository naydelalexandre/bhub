// Arquivo de status da API
module.exports = (req, res) =
  res.json({
    status: 'ok',
    message: 'Status da API funcionando!',
    timestamp: new Date().toISOString()
  });
};
