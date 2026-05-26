-- Seed: 10 funding opportunities
-- created_by is NULL so service-role inserts work without a real user UUID

INSERT INTO funding_opportunities (title, description, amount, deadline, source, type, is_active)
VALUES
  (
    'Sundance Institute Feature Film Fund',
    'Supports independent filmmakers developing narrative feature films with strong artistic vision. Open to US and international directors.',
    50000.00,
    '2026-09-01',
    'Sundance Institute',
    'grant',
    TRUE
  ),
  (
    'IFP Emerging Narrative Grant',
    'Grants for debut or sophomore narrative feature films at any stage of development. Emphasis on underrepresented voices.',
    25000.00,
    '2026-08-15',
    'Independent Filmmaker Project',
    'grant',
    TRUE
  ),
  (
    'BFI Film Fund – Development',
    'British Film Institute funding for scripts in active development. Projects must have a UK production element.',
    75000.00,
    '2026-07-31',
    'British Film Institute',
    'grant',
    TRUE
  ),
  (
    'Creative Europe MEDIA – Development',
    'EU support for European production companies developing feature films, documentaries, and cross-border co-productions.',
    150000.00,
    '2026-10-15',
    'Creative Europe MEDIA Programme',
    'grant',
    TRUE
  ),
  (
    'Tribeca Film Institute Documentary Fund',
    'Supports feature documentaries that address social justice, human rights, and underreported stories globally.',
    35000.00,
    '2026-06-30',
    'Tribeca Film Institute',
    'grant',
    TRUE
  ),
  (
    'Screen Australia Story Development',
    'Development funding for Australian content creators working on feature films, TV series, and online projects.',
    40000.00,
    '2026-11-01',
    'Screen Australia',
    'grant',
    TRUE
  ),
  (
    'Cinereach Production Grant',
    'Production-stage funding for independent narrative and documentary features with compelling, cinematic storytelling.',
    100000.00,
    '2026-12-01',
    'Cinereach',
    'grant',
    TRUE
  ),
  (
    'Film Independent Spirit Awards Filmmaker Grant',
    'Cash grant awarded to emerging narrative and documentary filmmakers. Recipients gain access to Film Independent membership resources.',
    30000.00,
    '2026-08-01',
    'Film Independent',
    'grant',
    TRUE
  ),
  (
    'Cannes Marché du Film Co-Production Investment',
    'Equity co-financing for international co-productions premiering at Cannes or major festival circuit. Min 50% non-US content required.',
    250000.00,
    '2027-01-15',
    'Cannes International Film Market',
    'equity',
    TRUE
  ),
  (
    'Film Production Bridge Loan',
    'Short-term bridge financing against pre-sold distribution rights or tax credits. Terms 6–18 months, competitive interest rates.',
    500000.00,
    NULL,
    'FilmForge Capital Partners',
    'loan',
    TRUE
  );
