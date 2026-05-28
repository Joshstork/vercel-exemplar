-- ============================================================
-- Project Audit Log
-- ============================================================
CREATE TABLE IF NOT EXISTS project_audit (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL,
  action      TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by  UUID,
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_audit_select" ON project_audit;
CREATE POLICY "own_audit_select" ON project_audit
  FOR SELECT USING (changed_by = auth.uid());

DROP POLICY IF EXISTS "admin_audit_select" ON project_audit;
CREATE POLICY "admin_audit_select" ON project_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE OR REPLACE FUNCTION log_film_project_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO project_audit (project_id, action, changed_by, new_data)
    VALUES (NEW.id, 'INSERT', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO project_audit (project_id, action, changed_by, old_data, new_data)
    VALUES (NEW.id, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO project_audit (project_id, action, changed_by, old_data)
    VALUES (OLD.id, 'DELETE', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS film_projects_audit ON film_projects;
CREATE TRIGGER film_projects_audit
  AFTER INSERT OR UPDATE OR DELETE ON film_projects
  FOR EACH ROW EXECUTE FUNCTION log_film_project_audit();

-- ============================================================
-- Project Match Scores
-- ============================================================
CREATE TABLE IF NOT EXISTS project_match_scores (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES film_projects(id) ON DELETE CASCADE,
  opportunity_id   UUID NOT NULL REFERENCES funding_opportunities(id) ON DELETE CASCADE,
  score            INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  calculated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, opportunity_id)
);

ALTER TABLE project_match_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their match scores" ON project_match_scores;
CREATE POLICY "Users can view their match scores"
  ON project_match_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM film_projects
      WHERE film_projects.id = project_id
        AND film_projects.user_id = auth.uid()
    )
  );
