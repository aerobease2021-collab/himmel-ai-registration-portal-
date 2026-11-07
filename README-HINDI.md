# Himmel AI Registration Portal — Setup Guide (Hindi)

Aapko code likhne ki zarurat nahi. Is project ko ek baar Vercel aur Supabase se connect karna hoga.

## Is project mein kya hai?
- Vendor / Company registration form
- Freelancer registration form
- Database mein form submissions
- Private document storage (company profile / CV)
- Admin login: `/admin`
- Admin dashboard: submissions dekhna, document open karna aur status update karna
- Mobile-friendly Himmel AI branding

## Step 1 — Supabase account aur project
1. https://supabase.com par jaiye aur free account banaiye.
2. `New project` par click kijiye.
3. Project name `himmel-ai-registration` rakhiye.
4. Strong database password banaiye aur safe jagah save kijiye.
5. Region India ke liye Mumbai available ho to Mumbai select kijiye.
6. Project create hone ke baad left menu mein `SQL Editor` kholiye.
7. Is folder ki `supabase/schema.sql` file ka poora text copy karke SQL Editor mein paste kijiye aur `Run` dabaiye.

## Step 2 — Supabase API keys
1. Supabase mein `Project Settings` > `API` (ya `API Keys`) kholiye.
2. Project URL copy kijiye.
3. `anon` / `publishable` public key copy kijiye. **Secret / service_role key kabhi Vercel public environment variable mein mat daliye.**
4. Dono values agle step ke liye rakhiye.

## Step 3 — Vercel par project deploy
1. https://vercel.com par jaiye. `Continue with GitHub` se login karna easiest hai.
2. Agar GitHub account nahi hai, https://github.com par free account banaiye.
3. GitHub mein `New repository` banaiye: `himmel-ai-registration-portal`.
4. Is ZIP ko extract karke project ke saare files repository mein upload kijiye. `supabase` folder bhi upload karna hai.
5. Vercel mein `Add New` > `Project` > apni GitHub repository `Import` kijiye.
6. Framework Next.js detect hona chahiye. `Deploy` se pehle `Environment Variables` mein ye add kijiye:
   - `NEXT_PUBLIC_SUPABASE_URL` = aapka Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = aapki Supabase anon / publishable key
7. `Deploy` dabaiye. Build complete hone par Vercel temporary website URL dega.

## Step 4 — Admin account banana
1. Supabase > Authentication > Users > `Add user` / `Create new user` par jaiye.
2. Apna business email aur strong password se admin user banaiye.
3. User create hone ke baad uska UUID copy kijiye.
4. Supabase > SQL Editor mein ye query chalaiye (UUID ko apne actual UUID se replace karein):

```sql
insert into public.admin_users (user_id)
values ('PASTE-ADMIN-USER-UUID-HERE');
```

5. Ab apni website ke URL ke aage `/admin` lagaiye. Example: `https://your-project.vercel.app/admin`
6. Supabase mein banaye admin email/password se login kijiye.

## Step 5 — Custom domain connect karna
1. Vercel project > Settings > Domains kholiye.
2. Aapka khud ka domain ya subdomain enter kijiye, jaise `forms.yourdomain.com`.
3. Vercel jo DNS records dikhaye, unhe domain provider (GoDaddy etc.) mein add kijiye.
4. DNS verify hone ke baad custom domain active ho jayega. Exact records Vercel aapko dikhayega; unhe guess karke enter na karein.

## Important security notes
- Supabase `service_role` / secret key ko kabhi browser code ya `NEXT_PUBLIC_` variable mein mat rakhein.
- Admin account sirf trusted team member ke liye banayein.
- SQL policies public ko sirf submission aur file upload allow karti hain; registrations read karna admin allowlist tak restricted hai.
- Launch se pehle apne business privacy notice aur data retention policy add karna recommended hai.
- Form mein Aadhaar, PAN, bank details ya unnecessary sensitive personal data abhi collect na karein.
- Form submission aur admin login ko live launch se pehle test karein.

## Local test (optional)
Node.js install hone ke baad project folder mein terminal kholkar:
```bash
npm install
npm run dev
```
Phir `http://localhost:3000` open karein.
