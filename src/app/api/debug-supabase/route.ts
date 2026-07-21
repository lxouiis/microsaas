import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const keyUsed = serviceKey ? 'service_role' : (anonKey ? 'anon' : 'NONE');
  const key = serviceKey || anonKey;

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Missing env vars', url: !!url, key: !!key });
  }

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const testSlug = `api-test-${Date.now()}`;
    const { error } = await client
      .from('desktops')
      .upsert({ slug: testSlug, config: { test: true }, updated_at: new Date().toISOString() }, { onConflict: 'slug' });

    if (error) {
      return NextResponse.json({ ok: false, keyUsed, error: error.message, code: error.code });
    }

    // clean up test row
    await client.from('desktops').delete().eq('slug', testSlug);

    return NextResponse.json({ ok: true, keyUsed, message: 'Supabase upsert works!' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
