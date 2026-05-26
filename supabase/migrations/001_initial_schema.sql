-- ============================================================
-- Film Projects
-- ============================================================
CREATE TABLE IF NOT EXISTS film_projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  genre       TEXT,
  budget      NUMERIC(12,2),
  status      TEXT        NOT NULL DEFAULT 'development'
                CHECK (status IN ('development','pre-production','production','post-production','completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE film_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_projects_select" ON film_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_projects_insert" ON film_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_projects_update" ON film_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_projects_delete" ON film_projects FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_projects_updated_at
  BEFORE UPDATE ON film_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- Profiles (admin roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================
-- Funding Opportunities
-- ============================================================
CREATE TABLE IF NOT EXISTS funding_opportunities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  amount      NUMERIC(12,2),
  deadline    DATE,
  source      TEXT,
  type        TEXT        NOT NULL DEFAULT 'grant'
                CHECK (type IN ('grant','investment','loan','equity','other')),
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE funding_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_opportunities_select" ON funding_opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_opportunities_insert" ON funding_opportunities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_opportunities_update" ON funding_opportunities
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "admin_opportunities_delete" ON funding_opportunities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );


-- ============================================================
-- Project Funding (tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_funding (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES film_projects(id) ON DELETE CASCADE,
  opportunity_id  UUID        NOT NULL REFERENCES funding_opportunities(id) ON DELETE CASCADE,
  status          TEXT        NOT NULL DEFAULT 'interested'
                    CHECK (status IN ('interested','applied','awarded','rejected')),
  notes           TEXT,
  applied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, opportunity_id)
);

ALTER TABLE project_funding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_pf_select" ON project_funding FOR SELECT USING (
  EXISTS (SELECT 1 FROM film_projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "own_pf_insert" ON project_funding FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM film_projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "own_pf_update" ON project_funding FOR UPDATE USING (
  EXISTS (SELECT 1 FROM film_projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "own_pf_delete" ON project_funding FOR DELETE USING (
  EXISTS (SELECT 1 FROM film_projects WHERE id = project_id AND user_id = auth.uid())
);


-- ============================================================
-- Bootstrap your first admin (run manually after signup):
--   UPDATE profiles SET is_admin = TRUE WHERE user_id = '<your-user-uuid>';
-- ============================================================
