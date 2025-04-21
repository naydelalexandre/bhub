// Arquivo com informações do API
module.exports = (req, res) =
  res.json({
    name: 'BrokerBooster API',
    version: '1.0.0',
    description: 'API para acesso ao sistema BrokerBooster',
    supabase: 'Integrado'
  });
};
