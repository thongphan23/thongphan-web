/**
 * Cloudflare Worker: GET /api/challenges
 * Returns list of active challenges or single challenge by slug
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  duration_days: number;
  is_active: number;
  created_at: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? 'https://thongphan.com'
    : '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const challengesWorker = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: CORS_HEADERS }
      );
    }

    try {
      // Route: GET /api/challenges/:slug
      const pathMatch = url.pathname.match(/^\/api\/challenges\/([^\/]+)$/);
      if (pathMatch) {
        const slug = pathMatch[1];
        return await getChallengeBySlug(slug, env);
      }

      // Route: GET /api/challenges (list all active)
      if (url.pathname === '/api/challenges') {
        return await getAllChallenges(env);
      }

      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: CORS_HEADERS }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  },
};

export default challengesWorker

/**
 * Get all active challenges
 */
async function getAllChallenges(env: Env): Promise<Response> {
  // Try KV cache first (TTL: 1 hour)
  const cacheKey = 'challenges:all';
  const cached = await env.KV.get(cacheKey, 'json');

  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' },
    });
  }

  // Query D1
  const result = await env.DB.prepare(
    'SELECT * FROM challenges WHERE is_active = 1 ORDER BY created_at DESC'
  ).all<Challenge>();

  const challenges = result.results || [];

  // Cache for 1 hour
  await env.KV.put(cacheKey, JSON.stringify(challenges), { expirationTtl: 3600 });

  return new Response(JSON.stringify(challenges), {
    headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' },
  });
}

/**
 * Get single challenge by slug
 */
async function getChallengeBySlug(slug: string, env: Env): Promise<Response> {
  // Try KV cache first (TTL: 1 hour)
  const cacheKey = `challenge:${slug}`;
  const cached = await env.KV.get(cacheKey, 'json');

  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' },
    });
  }

  // Query D1
  const result = await env.DB.prepare(
    'SELECT * FROM challenges WHERE slug = ? AND is_active = 1'
  ).bind(slug).first<Challenge>();

  if (!result) {
    return new Response(
      JSON.stringify({ error: 'Challenge not found' }),
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Cache for 1 hour
  await env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });

  return new Response(JSON.stringify(result), {
    headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' },
  });
}
