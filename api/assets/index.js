const { container } = require('../shared/cosmos');
const { randomUUID } = require('crypto');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function b64Decode(str) {
  try { return Buffer.from(str, 'base64url').toString('utf8'); } catch { return undefined; }
}

function b64Encode(str) {
  if (!str) return null;
  return Buffer.from(str, 'utf8').toString('base64url');
}

module.exports = async function (context, req) {
  const c = container();

  try {
    if (req.method === 'GET') {
      const rawPage  = parseInt(req.query.pageSize, 10);
      const pageSize = Math.min(isNaN(rawPage) ? 50 : Math.max(1, rawPage), 200);
      const tokenRaw = req.query.continuationToken;
      const token    = tokenRaw ? b64Decode(tokenRaw) : undefined;
      const q        = (req.query.q          || '').trim();
      const dept     = (req.query.department || '').trim();
      const type     = (req.query.type       || '').trim();
      const status   = (req.query.status     || '').trim();
      const isFirst  = !tokenRaw;

      const conditions  = [];
      const parameters  = [];

      if (q) {
        conditions.push(
          '(CONTAINS(LOWER(c.ciName),@q) OR CONTAINS(LOWER(c.assetTag),@q) OR ' +
          'CONTAINS(LOWER(c.serialNumber),@q) OR CONTAINS(LOWER(c.location),@q) OR ' +
          'CONTAINS(LOWER(c.Department),@q))'
        );
        parameters.push({ name: '@q', value: q.toLowerCase() });
      }
      if (dept)   { conditions.push('c.Department = @dept');   parameters.push({ name: '@dept',   value: dept });   }
      if (type)   { conditions.push('c.assetType = @type');    parameters.push({ name: '@type',   value: type });   }
      if (status) { conditions.push('c.assetType = @status');  parameters.push({ name: '@status', value: status }); }

      const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

      const countSpec = { query: `SELECT VALUE COUNT(1) FROM c${where}`, parameters };
      // ORDER BY c._ts requires a composite index when combined with a WHERE clause.
      // Use it only for the unfiltered case where the default _ts range index suffices.
      const pageSpec  = { query: `SELECT * FROM c${where}${where ? '' : ' ORDER BY c._ts DESC'}`, parameters };

      const pageOptions = { maxItemCount: pageSize };
      if (token) pageOptions.continuationToken = token;

      const promises = [
        c.items.query(countSpec).fetchAll().then(r => r.resources[0] ?? 0),
        c.items.query(pageSpec, pageOptions).fetchNext(),
      ];

      if (isFirst) {
        promises.push(
          c.items
            .query('SELECT DISTINCT VALUE c.Department FROM c WHERE IS_DEFINED(c.Department) AND c.Department != null')
            .fetchAll()
            .then(r => r.resources.filter(Boolean).sort())
        );
      }

      const results     = await Promise.all(promises);
      const count       = results[0];
      const pageResult  = results[1];
      const departments = isFirst ? results[2] : undefined;

      const body = {
        assets:            pageResult.resources ?? [],
        count,
        continuationToken: pageResult.hasMoreResults ? b64Encode(pageResult.continuationToken) : null,
        hasMore:           pageResult.hasMoreResults,
        ...(isFirst && { departments }),
      };

      context.res = { headers: JSON_HEADERS, body };

    } else if (req.method === 'POST') {
      const asset = { ...req.body, id: randomUUID(), createdAt: new Date().toISOString() };
      const { resource } = await c.items.create(asset);
      context.res = { status: 201, headers: JSON_HEADERS, body: resource };
    }
  } catch (err) {
    context.log.error('assets error:', err.message);
    context.res = { status: 500, headers: JSON_HEADERS, body: { error: err.message } };
  }
};
