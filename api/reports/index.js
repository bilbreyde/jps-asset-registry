const { container } = require('../shared/cosmos');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function groupBy(c, field, limit) {
  const spec = {
    query:
      `SELECT c.${field} AS label, COUNT(1) AS count ` +
      `FROM c ` +
      `WHERE IS_DEFINED(c.${field}) AND c.${field} != null ` +
      `GROUP BY c.${field}`,
  };
  const { resources } = await c.items.query(spec).fetchAll();
  const sorted = resources
    .filter(r => r.label != null && r.label !== '')
    .sort((a, b) => b.count - a.count);
  return limit ? sorted.slice(0, limit) : sorted;
}

module.exports = async function (context, req) {
  const c = container();
  try {
    const [byType, byDepartment, byLocation, byFloor] = await Promise.all([
      groupBy(c, 'assetType'),
      groupBy(c, 'Department', 15),
      groupBy(c, 'location',   15),
      groupBy(c, 'floor'),
    ]);

    context.res = {
      headers: JSON_HEADERS,
      body: { byType, byDepartment, byLocation, byFloor },
    };
  } catch (err) {
    context.log.error('reports error:', err.message);
    context.res = { status: 500, headers: JSON_HEADERS, body: { error: err.message } };
  }
};
