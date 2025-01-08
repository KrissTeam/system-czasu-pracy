const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'system-czasu-pracy',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

