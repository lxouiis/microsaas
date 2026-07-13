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

-- ENABLE PUBLIC WRITE POLICY (Anyone can publish/update their desktops)
-- Note: In a real production SaaS, you would restrict inserts/updates to authenticated users (owner_id matching auth.uid()).
-- For this MVP, anyone can write so the setup is instant.
CREATE POLICY "Allow public insert to desktops" 
ON public.desktops 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to desktops" 
ON public.desktops 
FOR UPDATE 
USING (true)
WITH CHECK (true);
