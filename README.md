# C.A.R.E.S. Website (React + Supabase)

Public pages: Home, About Us, Volunteer (Youth / Senior Citizens), Events & Gallery, Contact Us & Donations.
Admin (`/#/admin`): Dashboard, Donations, Volunteers, Events & Gallery, Messages & Settings.

## 1. Set up the database (Supabase, free)
1. Sign up at supabase.com with caresngo.taloja@gmail.com and create a project (Mumbai region if offered).
2. Open **SQL Editor > New query**, paste all of `supabase/schema.sql`, press **Run**.
3. Open **Authentication > Users > Add user**: email `caresngo.taloja@gmail.com`, a strong password, tick "Auto confirm".
4. In the SQL Editor run:
   `insert into public.profiles (user_id, role) select id, 'admin' from auth.users where email = 'caresngo.taloja@gmail.com';`
5. Open **Project Settings > API** and copy the Project URL and the `anon public` key.

## 2. Run on your computer
```
npm install
copy .env.example to .env and paste the two values
npm run dev
```

## 3. Put it online (free)
1. Upload this folder to a GitHub repository (do NOT upload `.env`).
2. On netlify.com or vercel.com choose "Import from GitHub". Build command: `npm run build`. Output folder: `dist`.
3. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's settings, then deploy.
4. The site opens on a free link such as `cares-taloja.netlify.app`.

## 4. After going live
Log in at `your-link/#/admin`, then **Messages & Settings > Website settings** and fill phone, WhatsApp, address, UPI ID, QR, bank details, registration and 80G. Everything updates without touching code.

## Privacy notes
- Visitors can only submit forms; only logged-in staff can read volunteer, donation and message data (Row Level Security).
- Uploaded photos are resized and their GPS data is removed. Avoid clear photos of children's faces unless parents have given written permission.
- Donations are not processed on the site. UPI/bank payments go directly to the NGO; staff mark them as Verified after checking the bank statement.
