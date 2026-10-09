// Standalone Seed Script
const url = process.env.SEED_URL || 'http://localhost:3000/api/seed';

async function main() {
  console.log(`Triggering database seed at ${url}...`);
  try {
    const res = await fetch(url, { method: 'POST' });
    const json = await res.json();
    console.log('Seed response:', json);
  } catch (err) {
    console.error('Failed to trigger seed via HTTP:', err.message);
    console.log('Please make sure dev server is running or call /api/seed in browser/curl.');
  }
}

main();
