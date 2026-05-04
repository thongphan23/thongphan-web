/**
 * Cloudflare Worker: Email Drip Campaign (Cron Trigger)
 * Runs every hour, checks email_queue for pending emails, sends via MailChannels
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  MAILCHANNELS_API_KEY?: string; // Optional, MailChannels works without API key on CF Workers
}

interface EmailQueueItem {
  id: string;
  signup_id: string;
  day: number;
  subject: string;
  body: string;
  scheduled_at: string;
}

interface Signup {
  name: string;
  email: string;
  challenge_id: string;
}

export default {
  /**
   * Cron trigger: runs every hour
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Email drip cron triggered at:', new Date().toISOString());

    try {
      await processPendingEmails(env);
    } catch (error) {
      console.error('Email drip error:', error);
    }
  },

  /**
   * Manual trigger via HTTP (for testing)
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/trigger' && request.method === 'POST') {
      // Manual trigger for testing
      await processPendingEmails(env);
      return new Response(JSON.stringify({ success: true, message: 'Email drip triggered' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Email Drip Worker', { status: 200 });
  },
};

/**
 * Process all pending emails that are due
 */
async function processPendingEmails(env: Env): Promise<void> {
  const now = new Date().toISOString();

  // Get all pending emails where scheduled_at <= now
  const result = await env.DB.prepare(
    `SELECT id, signup_id, day, subject, body, scheduled_at
     FROM email_queue
     WHERE status = 'pending' AND scheduled_at <= ?
     ORDER BY scheduled_at ASC
     LIMIT 100`
  ).bind(now).all<EmailQueueItem>();

  const emails = result.results || [];

  if (emails.length === 0) {
    console.log('No pending emails to send');
    return;
  }

  console.log(`Processing ${emails.length} pending emails`);

  // Process each email
  for (const email of emails) {
    try {
      await sendEmail(email, env);
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);
    }
  }
}

/**
 * Send single email via MailChannels
 */
async function sendEmail(emailItem: EmailQueueItem, env: Env): Promise<void> {
  // Get signup details
  const signup = await env.DB.prepare(
    'SELECT name, email, challenge_id FROM challenge_signups WHERE id = ?'
  ).bind(emailItem.signup_id).first<Signup>();

  if (!signup) {
    console.error(`Signup not found: ${emailItem.signup_id}`);
    await markEmailFailed(emailItem.id, 'Signup not found', env);
    return;
  }

  // Check if unsubscribed
  const isUnsubscribed = await env.DB.prepare(
    'SELECT is_unsubscribed FROM challenge_signups WHERE id = ?'
  ).bind(emailItem.signup_id).first<{ is_unsubscribed: number }>();

  if (isUnsubscribed?.is_unsubscribed === 1) {
    console.log(`User unsubscribed, skipping email: ${signup.email}`);
    await markEmailFailed(emailItem.id, 'User unsubscribed', env);
    return;
  }

  // Personalize email body
  const personalizedBody = emailItem.body.replace('{{name}}', signup.name);

  // Send via MailChannels API
  const mailChannelsResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: signup.email, name: signup.name }],
          dkim_domain: 'thongphan.com',
          dkim_selector: 'mailchannels',
        },
      ],
      from: {
        email: 'hi@thongphan.com',
        name: 'Thông Phan',
      },
      subject: emailItem.subject,
      content: [
        {
          type: 'text/html',
          value: personalizedBody,
        },
      ],
    }),
  });

  if (!mailChannelsResponse.ok) {
    const errorText = await mailChannelsResponse.text();
    console.error('MailChannels error:', errorText);
    await markEmailFailed(emailItem.id, `MailChannels error: ${errorText}`, env);
    return;
  }

  // Mark as sent
  const sentAt = new Date().toISOString();

  await env.DB.batch([
    // Update email_queue status
    env.DB.prepare(
      'UPDATE email_queue SET status = ?, sent_at = ? WHERE id = ?'
    ).bind('sent', sentAt, emailItem.id),

    // Insert into email_logs
    env.DB.prepare(
      'INSERT INTO email_logs (id, signup_id, day, sent_at, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), emailItem.signup_id, emailItem.day, sentAt, 'sent'),

    // Update current_day in challenge_signups
    env.DB.prepare(
      'UPDATE challenge_signups SET current_day = ? WHERE id = ?'
    ).bind(emailItem.day, emailItem.signup_id),
  ]);

  console.log(`Email sent successfully: ${emailItem.id} to ${signup.email}`);
}

/**
 * Mark email as failed
 */
async function markEmailFailed(emailId: string, errorMessage: string, env: Env): Promise<void> {
  await env.DB.prepare(
    'UPDATE email_queue SET status = ?, error_message = ? WHERE id = ?'
  ).bind('failed', errorMessage, emailId).run();
}
