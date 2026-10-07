// Read-only connectivity check for third-party services.
// Usage: vercel env pull .env.local && pnpm check:services
// Prints pass / fail / not configured per service. Never prints values.
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const env = process.env;
const checks = [
  {
    name: 'Supabase',
    needs: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    run: () =>
      fetch(`${env.VITE_SUPABASE_URL}/auth/v1/health`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } }),
  },
  {
    name: 'Upstash Redis',
    needs: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    run: () =>
      fetch(`${env.UPSTASH_REDIS_REST_URL}/ping`, { headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` } }),
  },
  {
    name: 'Anthropic',
    needs: ['ANTHROPIC_API_KEY'],
    run: () =>
      fetch('https://api.anthropic.com/v1/models?limit=1', {
        headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      }),
  },
];

let failed = false;
for (const c of checks) {
  const missing = c.needs.filter((k) => !env[k]);
  if (missing.length) {
    console.log(`- ${c.name}: not configured (missing ${missing.join(', ')})`);
    continue;
  }
  try {
    const res = await c.run();
    console.log(`${res.ok ? '✓' : '✗'} ${c.name}: HTTP ${res.status}`);
    failed ||= !res.ok;
  } catch (err) {
    console.log(`✗ ${c.name}: ${err.cause?.code ?? err.message}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
