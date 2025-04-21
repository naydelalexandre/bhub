// Arquivo da API principal
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

module.exports = (req, res) =
  res.json({
    status: 'ok',
    message: 'BrokerBooster API',
    timestamp: new Date().toISOString(),
    endpoints: ['/api', '/api/status', '/api/info']
  });
};
