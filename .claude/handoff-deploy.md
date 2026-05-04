# Sub-Agent A: Deploy to Cloudflare Pages + Workers

## MỤC TIÊU
Deploy website thongphan.com lên Cloudflare Pages. Workers API live. Domain thongphan.com trỏ đúng. Tự test end-to-end, tự tìm lỗi, tự sửa đến khi website live hoàn toàn.

## CONTEXT
- Repo: `/Users/rio/thongphan-com/`
- Next.js 16, đã build pass (`npm run build` OK, 7 routes)
- `wrangler.toml` có sẵn nhưng IDs là PLACEHOLDER
- DNS thongphan.com đã trên Cloudflare (verify qua `wrangler` hoặc Cloudflare API)
- Workers code: `workers/api/challenges.ts`, `workers/api/signup.ts`, `workers/api/email-drip.ts`
- D1 schema: `workers/schema.sql`

## BƯỚC THỰC HIỆN

### STEP 1 — Tạo Cloudflare resources
```bash
cd /Users/rio/thongphan-com

# Login nếu chưa
npx wrangler whoami || npx wrangler login

# Tạo D1 database
npx wrangler d1 create thongphan-db
# → Lưu database_id từ output

# Tạo KV
npx wrangler kv:namespace create KV
# → Lưu id

npx wrangler kv:namespace create KV --preview
# → Lưu preview_id
```

### STEP 2 — Điền IDs vào wrangler.toml
Dùng sed hoặc edit trực tiếp để thay toàn bộ `PLACEHOLDER_SET_AFTER_CREATE` bằng IDs thật:
```bash
# Ví dụ (thay YOUR_DB_ID bằng ID thật):
sed -i '' 's/PLACEHOLDER_SET_AFTER_CREATE/YOUR_DB_ID/g' wrangler.toml
# Cẩn thận: database_id và KV id khác nhau — edit thủ công nếu cần
```

### STEP 3 — Apply D1 schema + seed data
```bash
npx wrangler d1 execute thongphan-db --file=workers/schema.sql --remote

# Seed challenge data
npx wrangler d1 execute thongphan-db --remote --command="
INSERT INTO challenges (id, name, slug, title, tagline, description, duration_days, is_active, created_at)
VALUES (
  'brain2-21-days',
  '21 Ngày Brain2',
  'brain2-21-ngay',
  '21 Ngày Brain2 — Xây Bộ Não Thứ 2',
  'Từ 0 đến hệ thống tri thức cá nhân trong 21 ngày',
  'Mỗi sáng 1 email. 15 phút thực hành. Sau 21 ngày bạn có Obsidian vault + AI pipeline.',
  21, 1, datetime(''now'')
);"

# Verify
npx wrangler d1 execute thongphan-db --remote --command="SELECT * FROM challenges;"
```

### STEP 4 — Deploy Workers
```bash
# Challenges API
npx wrangler deploy workers/api/challenges.ts --name=thongphan-challenges-api

# Signup API
npx wrangler deploy workers/api/signup.ts --name=thongphan-signup-api

# Email drip (cron)
npx wrangler deploy workers/api/email-drip.ts --name=thongphan-email-drip
```

**Test Workers sau deploy:**
```bash
# Test challenges endpoint
curl https://thongphan-challenges-api.YOUR_SUBDOMAIN.workers.dev/api/challenges

# Test signup
curl -X POST https://thongphan-signup-api.YOUR_SUBDOMAIN.workers.dev/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","challenge_slug":"brain2-21-ngay"}'
# Expect: {"success":true,"message":"Đăng ký thành công!..."}

# Test duplicate
curl -X POST ... (same payload)
# Expect: error về duplicate email
```

### STEP 5 — Deploy Frontend lên Cloudflare Pages

```bash
# Install @cloudflare/next-on-pages
npm install -D @cloudflare/next-on-pages

# Build cho Cloudflare Pages
npx @cloudflare/next-on-pages

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=thongphan-com
```

**Nếu lỗi với next-on-pages:** Thử static export thay thế:
```js
// next.config.js — thêm:
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // static export
}
```
Sau đó:
```bash
npm run build
npx wrangler pages deploy out --project-name=thongphan-com
```

**Lưu ý:** Nếu dùng `output: 'export'`, các dynamic routes (`/blog/[slug]`, `/challenges/[slug]`) cần `generateStaticParams`. Kiểm tra:
```bash
# app/blog/[slug]/page.tsx — thêm nếu chưa có:
export async function generateStaticParams() {
  const fs = require('fs')
  const path = require('path')
  const files = fs.readdirSync(path.join(process.cwd(), 'content/blog'))
  return files.filter(f => f.endsWith('.md')).map(f => ({ slug: f.replace('.md', '') }))
}

# app/challenges/[slug]/page.tsx — thêm nếu chưa có:
export async function generateStaticParams() {
  return [{ slug: 'brain2-21-ngay' }]
}
```

### STEP 6 — Kết nối custom domain
```bash
# Thêm custom domain vào Cloudflare Pages
# Vào Cloudflare Dashboard → Pages → thongphan-com → Custom domains
# Add: thongphan.com và www.thongphan.com

# Hoặc qua wrangler:
npx wrangler pages domain add thongphan.com --project-name=thongphan-com
```

Cloudflare sẽ tự cập nhật DNS CNAME. Verify:
```bash
curl -I https://thongphan.com
# Expect: 200 OK
```

### STEP 7 — Update NEXT_PUBLIC_API_URL
Sau khi Workers deployed, update env var trên Cloudflare Pages:
```bash
npx wrangler pages secret put NEXT_PUBLIC_API_URL --project-name=thongphan-com
# Nhập: https://thongphan-signup-api.YOUR_SUBDOMAIN.workers.dev
```
Redeploy Pages sau khi set env var.

## QA VÒNG SAU KHI DEPLOY

### Vòng 1 — Smoke test live URL
```bash
curl -s https://thongphan.com | grep -c "Thương hiệu cá nhân"
# Expect: >= 1

curl -s https://thongphan.com/blog | grep -c "bài viral"
# Expect: >= 1

curl -s https://thongphan.com/about | grep -c "Co-Founder"
# Expect: >= 1

curl -s https://thongphan.com/challenges | grep -c "Brain2"
# Expect: >= 1

curl -I https://thongphan.com/chat
# Expect: 200
```

### Vòng 2 — Test signup flow end-to-end
```bash
curl -X POST https://thongphan.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"QA Test","email":"qa@thongphan.com","challenge_slug":"brain2-21-ngay"}'
# Expect: success

# Verify trong D1
npx wrangler d1 execute thongphan-db --remote --command="SELECT * FROM challenge_signups WHERE email='qa@thongphan.com';"
# Expect: 1 row

# Test duplicate
curl -X POST ... (same payload)
# Expect: error duplicate
```

### Vòng 3 — Performance check
```bash
curl -w "@-" -o /dev/null -s https://thongphan.com <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
# Expect: time_total < 1.0s
```

### Vòng 4 — Bug hunt
Nếu gặp bất kỳ lỗi nào trong QA:
1. Check Cloudflare Pages logs: `npx wrangler pages deployment tail`
2. Check Workers logs: `npx wrangler tail thongphan-signup-api`
3. Sửa → redeploy → test lại
4. Lặp đến khi tất cả vòng QA pass

## DONE CONDITION
- [ ] `curl https://thongphan.com` → 200, HTML có content đúng
- [ ] `curl https://thongphan.com/blog` → 200
- [ ] `curl https://thongphan.com/about` → 200
- [ ] `curl https://thongphan.com/challenges` → 200
- [ ] POST /api/signup → success + D1 có record
- [ ] POST /api/signup (duplicate) → error message đúng
- [ ] `curl https://thongphan.com/api/challenges` → JSON array challenges

## KẾT QUẢ PHIÊN
<!-- Ghi vào đây: URLs deployed, bugs gặp, bugs đã fix, final status -->
