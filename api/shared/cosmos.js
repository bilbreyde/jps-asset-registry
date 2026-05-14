const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const DATABASE  = process.env.COSMOS_DATABASE  || 'jps-assets';
const CONTAINER = process.env.COSMOS_CONTAINER || 'assets';

module.exports = {
  container: () => client.database(DATABASE).container(CONTAINER),
};
