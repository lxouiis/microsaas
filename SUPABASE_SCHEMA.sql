-- CREATE THE DESKTOPS TABLE
CREATE TABLE IF NOT EXISTS public.desktops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CREATE AN INDEX ON THE SLUG COLUMN FOR LIGHTNING-FAST LOOKUPS
CREATE INDEX IF NOT EXISTS desktops_slug_idx ON public.desktops (slug);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.desktops ENABLE ROW LEVEL SECURITY;

-- ENABLE PUBLIC READ POLICY (Anyone can view desktops by slug)
CREATE POLICY "Allow public read access to desktops"
ON public.desktops
FOR SELECT
USING (true);

-- NOTE ON WRITES: the app's /api/save-desktop route always writes using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely — the app never
-- needs the anon (public) key to insert or update a row. Deliberately NOT
-- adding public INSERT/UPDATE policies here: the anon key is exposed
-- client-side (NEXT_PUBLIC_SUPABASE_ANON_KEY), so a public write policy
-- would let anyone call Supabase's REST API directly and overwrite any
-- slug's config, bypassing the app entirely. With no write policy and RLS
-- enabled, anon-key writes are rejected by default; only the service-role
-- key (server-side only) can write. If you ever need the browser to write
-- directly (no server round-trip), add a scoped policy then — e.g. requiring
-- a per-gift edit token stored in the row, or real user auth with
-- owner_id = auth.uid() — rather than reopening this to everyone.
