import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getClient() {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { slug, config } = await req.json();

    if (!slug || !config) {
      return NextResponse.json({ success: false, error: 'Missing slug or config' }, { status: 400 });
    }

    const supabase = getClient();
    if (!supabase) {
      console.warn('[save] Supabase not configured — missing env vars');
      return NextResponse.json({ success: false, error: 'Supabase not configured on server' }, { status: 500 });
    }

    const { error } = await supabase
      .from('desktops')
      .upsert(
        { slug, config, updated_at: new Date().toISOString() },
        { onConflict: 'slug' }
      );

    if (error) {
      console.error('[save] Supabase upsert error:', error);
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: 500 });
    }

    console.log(`[save] ✅ Saved desktop: /d/${slug}`);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error('[save] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
