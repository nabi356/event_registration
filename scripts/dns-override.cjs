/**
 * Process-level DNS resolver fix, loaded BEFORE any application code.
 *
 * This machine's default resolver is 127.0.0.1, which refuses connections, so
 * `mongodb+srv://` SRV lookups fail with ECONNREFUSED. Node's `dns.setServers()`
 * must be applied to the real `node:dns` module; doing it from application code
 * is unreliable under Turbopack, which can hand the app a bundled shim of `dns`
 * that mongoose never sees.
 *
 * Preloading this with `node --require` guarantees the override lands on the
 * genuine module before anything else initialises.
 */
try {
  const dns = require('node:dns');
  const before = dns.getServers();
  if (!before.includes('8.8.8.8') && !before.includes('1.1.1.1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log(
      `[dns-override] resolver: ${before.join(', ') || 'none'} -> 8.8.8.8, 1.1.1.1`
    );
  }
} catch (err) {
  // Non-fatal: environments with a healthy resolver still start normally.
  console.warn('[dns-override] skipped:', err && err.message);
}
