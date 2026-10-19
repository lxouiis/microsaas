import { supabase } from './supabase';

const BUCKET = 'gift-media';

// Uploads a file to Supabase Storage and returns its public URL. Used in
// place of base64-inlining files into config — a config full of base64
// media blows past localStorage's ~5-10MB quota and Vercel's ~4.5MB API
// request body limit; a short URL string doesn't.
export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000', // 1 year — uploaded gift media never changes in place
    upsert: false,
  });

  if (error) {
    const isRlsError = /row-level security/i.test(error.message);
    const hint = isRlsError
      ? `the "${BUCKET}" bucket needs an INSERT policy on storage.objects — "Public bucket" alone only allows reads, not uploads. See SUPABASE_STORAGE_SETUP.md.`
      : `make sure the "${BUCKET}" bucket exists in your Supabase project.`;
    throw new Error(`Upload failed: ${error.message} — ${hint}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
