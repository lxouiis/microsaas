'use server';

import { createClient } from '@supabase/supabase-js';
import type { DesktopConfig } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a server-side client
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Fetch a desktop configuration by its URL slug.
 */
export async function getDesktopBySlug(slug: string): Promise<DesktopConfig | null> {
  const supabase = getSupabaseClient();
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
      if (error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
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
 */
export async function saveDesktop(slug: string, config: DesktopConfig): Promise<{ success: boolean; isMock?: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase is not configured. Mocking save operation.');
    return { success: true, isMock: true };
  }

  try {
    // Check if a desktop with this slug already exists
    const { data: existing, error: fetchError } = await supabase
      .from('desktops')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing slug:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      // Update existing desktop
      const { error: updateError } = await supabase
        .from('desktops')
        .update({
          config,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug);

      if (updateError) {
        console.error('Error updating desktop config:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new desktop
      const { error: insertError } = await supabase
        .from('desktops')
        .insert({
          slug,
          config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting desktop config:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save desktop:', err);
    return { success: false, error: err.message || 'Unknown database error' };
  }
}
