module.exports = (req, res) =
  res.json({
    status: "online",
    name: "BrokerBooster API",
    timestamp: new Date().toISOString()
  });
};
