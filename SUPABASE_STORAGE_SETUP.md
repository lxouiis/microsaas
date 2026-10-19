# Setting up Supabase Storage for gift media uploads

Uploaded photos/videos (wallpaper, Secret celebration video, background
music, Mixtape tracks) now go to a Supabase Storage bucket instead of being
base64-inlined into the gift's config. One bucket needs to exist first.

## Steps (2 minutes, one-time)

1. Open your Supabase project dashboard → **Storage** (left sidebar)
2. Click **New bucket**
3. Name it exactly: `gift-media`
4. Toggle **Public bucket** → **ON** (the app reads these files directly via
   public URL — no auth, same model as the `desktops` table's public reads)
5. Click **Create bucket**

That's it — no RLS policies needed for the bucket itself when "Public
bucket" is on; Supabase handles public read access automatically. Uploads
still go through the browser using your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(already configured if you followed the main Supabase setup), so no new env
vars are needed either.

## Why this exists

Before this, uploaded files were base64-encoded and stored directly inside
the gift's JSON config. That silently broke Publish once a file pushed the
whole config past `localStorage`'s ~5-10MB quota or Vercel's ~4.5MB API
request body limit — with real file storage, config only holds a short URL
string, so this ceiling is gone in practice.

## Verifying it worked

After creating the bucket, try uploading a file anywhere in `/create` (e.g.
Appearance → Upload Photo or Video). It should show "Uploading…" briefly,
then succeed. If you see an alert like *"Upload failed: ... bucket does not
exist"*, double check the bucket name is exactly `gift-media` and that
Public bucket is enabled.
