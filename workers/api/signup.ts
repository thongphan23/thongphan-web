/**
 * Cloudflare Worker: POST /api/signup
 * Handle challenge signup with validation, D1 insert, and email queue
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

interface SignupRequest {
  challenge_slug: string;
  name: string;
  email: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? 'https://thongphan.com'
    : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: CORS_HEADERS }
      );
    }

    try {
      // Parse request body
      const body = await request.json() as SignupRequest;

      // Validate input
      const validation = validateSignupRequest(body);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      // Process signup
      const result = await processSignup(body, env);

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: CORS_HEADERS,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  },
};

/**
 * Validate signup request
 */
function validateSignupRequest(body: any): { valid: boolean; error?: string } {
  if (!body.challenge_slug || typeof body.challenge_slug !== 'string') {
    return { valid: false, error: 'challenge_slug is required' };
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return { valid: false, error: 'Tên phải có ít nhất 2 ký tự' };
  }

  if (!body.email || typeof body.email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return { valid: false, error: 'Email không hợp lệ' };
  }

  return { valid: true };
}

/**
 * Process signup: check challenge exists, check duplicate, insert signup, queue emails
 */
async function processSignup(
  data: SignupRequest,
  env: Env
): Promise<{ success: boolean; message: string; signup_id?: string }> {
  const { challenge_slug, name, email } = data;

  // Step 1: Get challenge by slug
  const challenge = await env.DB.prepare(
    'SELECT id, duration_days FROM challenges WHERE slug = ? AND is_active = 1'
  ).bind(challenge_slug).first<{ id: string; duration_days: number }>();

  if (!challenge) {
    return { success: false, message: 'Challenge không tồn tại hoặc đã đóng' };
  }

  // Step 2: Check if email already signed up for this challenge
  const existing = await env.DB.prepare(
    'SELECT id FROM challenge_signups WHERE challenge_id = ? AND email = ?'
  ).bind(challenge.id, email).first();

  if (existing) {
    return { success: false, message: 'Email này đã đăng ký challenge rồi' };
  }

  // Step 3: Insert signup
  const signupId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO challenge_signups (id, challenge_id, name, email, current_day, signed_up_at)
     VALUES (?, ?, ?, ?, 0, ?)`
  ).bind(signupId, challenge.id, name, email, now).run();

  // Step 4: Queue emails for all days
  await queueDripEmails(signupId, challenge.duration_days, now, env);

  // Step 5: Invalidate cache
  await env.KV.delete(`challenge:${challenge_slug}`);

  return {
    success: true,
    message: 'Đăng ký thành công! Check email để nhận bài đầu tiên.',
    signup_id: signupId,
  };
}

/**
 * Queue drip emails for all days of the challenge
 */
async function queueDripEmails(
  signupId: string,
  durationDays: number,
  signupTime: string,
  env: Env
): Promise<void> {
  const signupDate = new Date(signupTime);

  // Prepare batch insert for email_queue
  const statements: D1PreparedStatement[] = [];

  for (let day = 1; day <= durationDays; day++) {
    const emailId = crypto.randomUUID();

    // Schedule email: day 1 = now, day 2 = +1 day, etc.
    const scheduledDate = new Date(signupDate);
    scheduledDate.setDate(scheduledDate.getDate() + (day - 1));
    scheduledDate.setHours(9, 0, 0, 0); // Send at 9 AM Vietnam time

    const scheduledAt = scheduledDate.toISOString();

    const subject = `[Brain2] Ngày ${day}/${durationDays}`;
    const body = `Placeholder email content for day ${day}. Will be replaced with actual content.`;

    statements.push(
      env.DB.prepare(
        `INSERT INTO email_queue (id, signup_id, day, subject, body, scheduled_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`
      ).bind(emailId, signupId, day, subject, body, scheduledAt)
    );
  }

  // Execute batch insert
  await env.DB.batch(statements);
}
