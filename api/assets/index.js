const { container } = require('../shared/cosmos');
const { randomUUID } = require('crypto');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

module.exports = async function (context, req) {
  const c = container();

  try {
    if (req.method === 'GET') {
      const { resources } = await c.items
        .query('SELECT * FROM c ORDER BY c._ts DESC')
        .fetchAll();

      context.res = { headers: JSON_HEADERS, body: resources };

    } else if (req.method === 'POST') {
      const asset = {
        ...req.body,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };

      const { resource } = await c.items.create(asset);
      context.res = { status: 201, headers: JSON_HEADERS, body: resource };
    }
  } catch (err) {
    context.log.error('assets error:', err.message);
    context.res = {
      status: 500,
      headers: JSON_HEADERS,
      body: { error: err.message },
    };
  }
};
