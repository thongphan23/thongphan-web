# Cloudflare Workers Deployment Guide

> Backend API for thongphan.com — Challenges, Signup, Email Drip

---

## 📁 Structure

```
workers/
├── schema.sql              # D1 database schema
├── api/
│   ├── challenges.ts       # GET /api/challenges, GET /api/challenges/:slug
│   ├── signup.ts           # POST /api/signup
│   └── email-drip.ts       # Cron worker (sends drip emails)
└── README.md               # This file
```

---

## 🚀 Deployment Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Create D1 Database

```bash
# Create database
wrangler d1 create thongphan-db

# Output will show database_id — copy it to wrangler.toml
# Replace all instances of "PLACEHOLDER_SET_AFTER_CREATE" in [[d1_databases]] sections
```

### 3. Run Database Schema

```bash
# Execute schema.sql to create tables
wrangler d1 execute thongphan-db --file=./workers/schema.sql

# Verify tables created
wrangler d1 execute thongphan-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 4. Create KV Namespace

```bash
# Production KV
wrangler kv:namespace create KV

# Preview KV (for testing)
wrangler kv:namespace create KV --preview

# Copy the IDs to wrangler.toml [[kv_namespaces]] sections
```

### 5. Create R2 Bucket (optional, for media storage)

```bash
wrangler r2 bucket create thongphan-media
wrangler r2 bucket create thongphan-media-preview
```

### 6. Deploy Workers

```bash
# Deploy challenges API
wrangler deploy --config wrangler.toml --name thongphan-challenges-api

# Deploy signup API
wrangler deploy --config wrangler.toml --name thongphan-signup-api

# Deploy email-drip worker (with cron)
wrangler deploy --config wrangler.toml --name thongphan-email-drip
```

### 7. Set up Routes (via Cloudflare Dashboard)

Go to Cloudflare Dashboard → Workers & Pages → Routes:

```
thongphan.com/api/challenges*  → thongphan-challenges-api
thongphan.com/api/signup       → thongphan-signup-api
```

Email drip worker runs on cron (no route needed).

---

## 🧪 Testing

### Test Challenges API

```bash
# Get all challenges
curl https://thongphan.com/api/challenges

# Get single challenge by slug
curl https://thongphan.com/api/challenges/21-ngay-brain2
```

### Test Signup API

```bash
curl -X POST https://thongphan.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "challenge_slug": "21-ngay-brain2",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

### Test Email Drip (Manual Trigger)

```bash
# Trigger email drip manually (for testing)
curl -X POST https://thongphan.com/api/email-drip/trigger
```

### Check D1 Data

```bash
# List all signups
wrangler d1 execute thongphan-db --command="SELECT * FROM challenge_signups"

# Check email queue
wrangler d1 execute thongphan-db --command="SELECT * FROM email_queue WHERE status='pending' LIMIT 10"

# Check sent emails
wrangler d1 execute thongphan-db --command="SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10"
```

---

## 📊 API Contracts

### GET /api/challenges

**Response:**
```json
[
  {
    "id": "brain2-21",
    "slug": "21-ngay-brain2",
    "title": "21 Ngày Brain2",
    "tagline": "Xây bộ não thứ hai trong 3 tuần",
    "description": "Challenge 21 ngày...",
    "duration_days": 21,
    "is_active": 1,
    "created_at": "2026-05-04T01:00:00Z"
  }
]
```

### GET /api/challenges/:slug

**Response:**
```json
{
  "id": "brain2-21",
  "slug": "21-ngay-brain2",
  "title": "21 Ngày Brain2",
  "tagline": "Xây bộ não thứ hai trong 3 tuần",
  "description": "Challenge 21 ngày...",
  "duration_days": 21,
  "is_active": 1,
  "created_at": "2026-05-04T01:00:00Z"
}
```

### POST /api/signup

**Request:**
```json
{
  "challenge_slug": "21-ngay-brain2",
  "name": "Nguyễn Văn A",
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng ký thành công! Check email để nhận bài đầu tiên.",
  "signup_id": "uuid-here"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email này đã đăng ký challenge rồi"
}
```

---

## 🔧 Maintenance

### View Worker Logs

```bash
# Tail logs for challenges API
wrangler tail thongphan-challenges-api

# Tail logs for email drip
wrangler tail thongphan-email-drip
```

### Update Schema

```bash
# Add new migration
wrangler d1 execute thongphan-db --command="ALTER TABLE challenges ADD COLUMN new_field TEXT"
```

### Clear KV Cache

```bash
# List all keys
wrangler kv:key list --namespace-id=YOUR_KV_ID

# Delete specific key
wrangler kv:key delete "challenges:all" --namespace-id=YOUR_KV_ID
```

---

## 🔐 MailChannels Setup

MailChannels works natively on Cloudflare Workers without API key.

**DKIM Setup (required for production):**

1. Go to Cloudflare Dashboard → DNS
2. Add TXT record:
   ```
   Name: mailchannels._domainkey
   Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
   ```
3. Update `email-drip.ts` with correct `dkim_domain` and `dkim_selector`

**SPF Record:**
```
Name: @
Type: TXT
Value: v=spf1 include:relay.mailchannels.net ~all
```

---

## 📝 Notes

- **Cron schedule:** Email drip runs every hour (`0 * * * *`)
- **Email timing:** Day 1 sends immediately, Day 2+ sends at 9 AM Vietnam time
- **Cache TTL:** Challenge data cached for 1 hour in KV
- **Rate limits:** MailChannels free tier = 10,000 emails/month
- **D1 limits:** Free tier = 5 GB storage, 5M reads/day, 100K writes/day

---

## 🐛 Troubleshooting

**Problem: Worker not receiving requests**
- Check Routes in Cloudflare Dashboard
- Verify zone_name matches your domain
- Check DNS is proxied (orange cloud)

**Problem: D1 database not found**
- Verify database_id in wrangler.toml matches `wrangler d1 list` output
- Re-deploy worker after updating wrangler.toml

**Problem: Emails not sending**
- Check `wrangler tail thongphan-email-drip` for errors
- Verify DKIM/SPF records in DNS
- Check email_queue table for failed emails

**Problem: CORS errors**
- Verify CORS_HEADERS in worker code
- Check browser console for specific error
- Test with curl to isolate frontend vs backend issue

---

**Deployment checklist:**
- [ ] D1 database created and schema applied
- [ ] KV namespace created
- [ ] Database IDs updated in wrangler.toml
- [ ] All 3 workers deployed
- [ ] Routes configured in Cloudflare Dashboard
- [ ] DKIM/SPF records added to DNS
- [ ] Test all 3 endpoints with curl
- [ ] Verify cron trigger in Workers dashboard
