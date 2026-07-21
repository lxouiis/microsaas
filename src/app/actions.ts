'use server';

import { createClient } from '@supabase/supabase-js';
import type { DesktopConfig } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Read client (anon key is fine for public reads)
const getReadClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Write client — uses service_role key to bypass RLS policies
const getWriteClient = () => {
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
};

/**
 * Fetch a desktop configuration by its URL slug.
 */
export async function getDesktopBySlug(slug: string): Promise<DesktopConfig | null> {
  const supabase = getReadClient();
  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to demo data.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('desktops')
      .select('config')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching desktop from Supabase:', error);
      }
      return null;
    }

    return data?.config as DesktopConfig | null;
  } catch (err) {
    console.error('Failed to get desktop:', err);
    return null;
  }
}

/**
 * Save or update a desktop configuration by its URL slug.
 * Uses the service_role key to bypass RLS so writes always succeed.
 */
export async function saveDesktop(
  slug: string,
  config: DesktopConfig
): Promise<{ success: boolean; isMock?: boolean; error?: string }> {
  const supabase = getWriteClient();
  if (!supabase) {
    console.warn('Supabase is not configured. Mocking save operation.');
    return { success: true, isMock: true };
  }

  try {
    // Upsert — insert or update in one call (no extra SELECT needed)
    const { error } = await supabase
      .from('desktops')
      .upsert(
        {
          slug,
          config,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );

    if (error) {
      console.error('Error saving desktop config:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Desktop saved to Supabase: /d/${slug}`);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to save desktop:', err);
    return { success: false, error: err.message || 'Unknown database error' };
  }
}
