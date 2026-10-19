# Setting up Supabase Storage for gift media uploads

Uploaded photos/videos (wallpaper, Secret celebration video, background
music, Mixtape tracks) now go to a Supabase Storage bucket instead of being
base64-inlined into the gift's config. One bucket needs to exist first.

## Steps (2 minutes, one-time)

1. Open your Supabase project dashboard → **Storage** (left sidebar)
2. Click **New bucket**
3. Name it exactly: `gift-media`
4. Toggle **Public bucket** → **ON**
5. Click **Create bucket**

**Important — the "Public bucket" toggle only covers reads.** Storage
access is RLS-gated on the `storage.objects` table regardless of the
bucket's public flag, so uploads (INSERT) still need an explicit policy or
every upload fails with *"new row violates row-level security policy"*.
Run this once in the SQL Editor:

```sql
-- Allow anyone (the anon key) to upload into the gift-media bucket
CREATE POLICY "Allow public uploads to gift-media"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'gift-media');

-- Allow anyone to read files from it (should already exist from the
-- "Public bucket" toggle, but this makes it explicit/idempotent)
CREATE POLICY "Allow public reads from gift-media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gift-media');
```

No new env vars needed — uploads go through the browser using your
existing `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

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
