module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
}; 