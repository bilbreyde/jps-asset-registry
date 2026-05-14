const { container } = require('../shared/cosmos');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

module.exports = async function (context, req) {
  const { id } = context.bindingData;
  const c = container();

  try {
    if (req.method === 'GET') {
      const { resource } = await c.item(id, id).read();
      context.res = { headers: JSON_HEADERS, body: resource };

    } else if (req.method === 'PUT') {
      const updated = { ...req.body, id, updatedAt: new Date().toISOString() };
      const { resource } = await c.items.upsert(updated);
      context.res = { headers: JSON_HEADERS, body: resource };

    } else if (req.method === 'DELETE') {
      await c.item(id, id).delete();
      context.res = { status: 204 };
    }
  } catch (err) {
    const status = err.code === 404 ? 404 : 500;
    context.log.error(`assets/${id} error:`, err.message);
    context.res = {
      status,
      headers: JSON_HEADERS,
      body: { error: err.message },
    };
  }
};
