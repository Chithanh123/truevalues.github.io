-- Author-facing content catalog. No participant answers or inferred identities.
PRAGMA foreign_keys = ON;
PRAGMA user_version = 1;

CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;
CREATE TABLE source_files (
  path TEXT PRIMARY KEY, sha256 TEXT NOT NULL CHECK(length(sha256)=64)
) STRICT;
CREATE TABLE roles (id TEXT PRIMARY KEY, label_en TEXT NOT NULL, label_vi TEXT NOT NULL) STRICT;
CREATE TABLE domains (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, left_label TEXT NOT NULL,
  right_label TEXT NOT NULL, interpretation_limit TEXT NOT NULL
) STRICT;
CREATE TABLE clusters (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, research_question TEXT NOT NULL,
  contrast_and_probe TEXT NOT NULL, risks TEXT NOT NULL, source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  bank TEXT NOT NULL CHECK(bank IN ('current','candidate')),
  kind TEXT NOT NULL CHECK(kind IN ('value_statement','foundation_statement','scenario')),
  title TEXT NOT NULL, content_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('implemented_unvalidated','author_draft','probe_only')),
  claim_type TEXT NOT NULL,
  cluster_id TEXT REFERENCES clusters(id), category TEXT,
  domain_id TEXT REFERENCES domains(id), role_id TEXT REFERENCES roles(id),
  locality TEXT CHECK(locality IN ('urban','rural')),
  scoring_mode TEXT NOT NULL CHECK(scoring_mode IN
    ('directional_statement','provisional_scenario','descriptive','comparison_excluded','probe_only')),
  direction INTEGER CHECK(direction IN (-1,1)),
  rationale TEXT NOT NULL, interpretation_limits TEXT NOT NULL,
  source_path TEXT NOT NULL REFERENCES source_files(path), source_section TEXT NOT NULL,
  CHECK((scoring_mode='directional_statement' AND direction IS NOT NULL)
    OR (scoring_mode!='directional_statement' AND direction IS NULL)),
  CHECK(bank!='candidate' OR scoring_mode IN ('descriptive','probe_only')),
  CHECK((status='probe_only')=(scoring_mode='probe_only')),
  CHECK((kind='scenario' AND role_id IS NOT NULL AND locality IS NOT NULL)
    OR (kind!='scenario' AND role_id IS NULL AND locality IS NULL))
) STRICT;
CREATE TABLE item_texts (
  item_id TEXT NOT NULL REFERENCES items(id), language TEXT NOT NULL CHECK(language IN ('en','vi')),
  text TEXT NOT NULL, format TEXT NOT NULL CHECK(format IN ('plain','markdown')),
  review_status TEXT NOT NULL CHECK(review_status='author_draft'),
  usage TEXT NOT NULL CHECK(usage IN ('current_participant','review_only')),
  PRIMARY KEY(item_id,language)
) STRICT;
CREATE TABLE options (
  item_id TEXT NOT NULL REFERENCES items(id), option_id TEXT NOT NULL,
  display_order INTEGER NOT NULL CHECK(display_order>0), current_authored_score INTEGER,
  PRIMARY KEY(item_id,option_id), UNIQUE(item_id,display_order)
) STRICT;
CREATE TABLE option_texts (
  item_id TEXT NOT NULL, option_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('en','vi')),
  label TEXT NOT NULL, description TEXT NOT NULL, tradeoff TEXT NOT NULL,
  PRIMARY KEY(item_id,option_id,language),
  FOREIGN KEY(item_id,option_id) REFERENCES options(item_id,option_id)
) STRICT;
CREATE TABLE reason_notes (
  item_id TEXT NOT NULL REFERENCES items(id), language TEXT NOT NULL CHECK(language IN ('en','vi')),
  notes TEXT NOT NULL, PRIMARY KEY(item_id,language)
) STRICT;
CREATE TABLE variants (
  id TEXT PRIMARY KEY, base_item_id TEXT NOT NULL REFERENCES items(id),
  comparison_item_id TEXT REFERENCES items(id),
  status TEXT NOT NULL CHECK(status IN ('implemented_comparison','editorial_proposal')),
  description TEXT NOT NULL, invariants TEXT NOT NULL, interpretation_limit TEXT NOT NULL,
  translation_status TEXT NOT NULL CHECK(translation_status IN ('author_draft','not_drafted')),
  source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;
CREATE TABLE worlds (id TEXT PRIMARY KEY, name TEXT NOT NULL) STRICT;
CREATE TABLE world_texts (
  world_id TEXT NOT NULL REFERENCES worlds(id), language TEXT NOT NULL CHECK(language IN ('en','vi')),
  name TEXT NOT NULL, summary TEXT NOT NULL, institutions_json TEXT NOT NULL CHECK(json_valid(institutions_json)),
  PRIMARY KEY(world_id,language)
) STRICT;
-- Spoilers kept separately from the fictional brief. This database is researcher material.
CREATE TABLE world_reveals (
  world_id TEXT NOT NULL REFERENCES worlds(id), language TEXT NOT NULL CHECK(language IN ('en','vi')),
  inspiration TEXT NOT NULL, participant_visibility TEXT NOT NULL CHECK(participant_visibility='after_completion'),
  PRIMARY KEY(world_id,language)
) STRICT;
CREATE TABLE scenario_contexts (
  item_id TEXT NOT NULL REFERENCES items(id), world_id TEXT NOT NULL REFERENCES worlds(id),
  status TEXT NOT NULL CHECK(status IN ('authored_unreviewed','needs_authorization_review')),
  note_en TEXT, note_vi TEXT, review_requirement TEXT NOT NULL,
  PRIMARY KEY(item_id,world_id),
  CHECK(status!='needs_authorization_review' OR (note_en IS NULL AND note_vi IS NULL))
) STRICT;
CREATE TABLE outcomes (
  id TEXT PRIMARY KEY, title TEXT NOT NULL,
  claim_kind TEXT NOT NULL CHECK(claim_kind IN
    ('provisional_profile','descriptive_construct','scenario_judgment','comprehension','response_record')),
  intended_interpretation TEXT NOT NULL, evidence_required TEXT NOT NULL,
  unsupported_inferences TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('provisional','author_draft','probe_only')),
  source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;
CREATE TABLE item_outcomes (
  item_id TEXT NOT NULL REFERENCES items(id), outcome_id TEXT NOT NULL REFERENCES outcomes(id),
  relationship TEXT NOT NULL CHECK(relationship IN ('primary','context','probe')),
  rationale TEXT NOT NULL, PRIMARY KEY(item_id,outcome_id)
) STRICT;
CREATE TABLE packages (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, version TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('current_quiz','content_interview','design_budget')),
  status TEXT NOT NULL CHECK(status IN ('implemented_unvalidated','author_draft','unassigned_blueprint')),
  purpose TEXT NOT NULL, audience TEXT NOT NULL,
  target_statements INTEGER NOT NULL CHECK(target_statements>=0),
  target_scenarios INTEGER NOT NULL CHECK(target_scenarios>=0),
  order_status TEXT NOT NULL CHECK(order_status IN ('fixed_current_route','allocation_only','not_selected')),
  language_note TEXT NOT NULL, inference_limit TEXT NOT NULL,
  source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;
CREATE TABLE package_items (
  package_id TEXT NOT NULL REFERENCES packages(id), item_id TEXT NOT NULL REFERENCES items(id),
  presentation_order INTEGER CHECK(presentation_order>0),
  usage TEXT NOT NULL CHECK(usage IN ('primary_task','comprehension_probe')),
  PRIMARY KEY(package_id,item_id), UNIQUE(package_id,presentation_order)
) STRICT;
CREATE TABLE package_outcomes (
  package_id TEXT NOT NULL REFERENCES packages(id), outcome_id TEXT NOT NULL REFERENCES outcomes(id),
  purpose TEXT NOT NULL,
  coverage_scope TEXT NOT NULL CHECK(coverage_scope IN ('linked_items','whole_package')),
  PRIMARY KEY(package_id,outcome_id)
) STRICT;
CREATE TABLE readings (
  id TEXT PRIMARY KEY, bibliographic_proposal TEXT NOT NULL, review_question TEXT NOT NULL,
  verification TEXT NOT NULL CHECK(verification='unverified'),
  source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;
CREATE TABLE cluster_readings (
  cluster_id TEXT NOT NULL REFERENCES clusters(id), reading_id TEXT NOT NULL REFERENCES readings(id),
  relationship TEXT NOT NULL CHECK(relationship='proposed_reading'),
  PRIMARY KEY(cluster_id,reading_id)
) STRICT;
CREATE TABLE item_readings (
  item_id TEXT NOT NULL REFERENCES items(id), reading_id TEXT NOT NULL REFERENCES readings(id),
  relationship TEXT NOT NULL, note TEXT NOT NULL, PRIMARY KEY(item_id,reading_id)
) STRICT;
CREATE TABLE audit_findings (
  item_id TEXT PRIMARY KEY REFERENCES items(id), issue TEXT NOT NULL,
  proposed_disposition TEXT NOT NULL, source_path TEXT NOT NULL REFERENCES source_files(path)
) STRICT;

CREATE VIEW package_summary AS
SELECT p.id, p.title, p.version, p.kind, p.status,
  p.target_statements+p.target_scenarios AS planned_primary_tasks,
  count(i.id) AS assigned_items,
  count(CASE WHEN i.kind!='scenario' THEN 1 END) AS assigned_statements,
  count(CASE WHEN i.kind='scenario' THEN 1 END) AS assigned_scenarios,
  count(CASE WHEN pi.usage='comprehension_probe' THEN 1 END) AS probe_tasks,
  count(en.item_id) AS english_texts, count(vi.item_id) AS vietnamese_drafts,
  CASE WHEN count(i.id)>0 AND count(i.id)=count(vi.item_id) THEN 1 ELSE 0 END AS all_assigned_have_vi_draft,
  p.order_status, p.language_note, p.inference_limit
FROM packages p LEFT JOIN package_items pi ON pi.package_id=p.id
LEFT JOIN items i ON i.id=pi.item_id
LEFT JOIN item_texts en ON en.item_id=i.id AND en.language='en'
LEFT JOIN item_texts vi ON vi.item_id=i.id AND vi.language='vi'
GROUP BY p.id;

CREATE VIEW package_outcome_matrix AS
SELECT p.id AS package_id,p.title AS package_title,o.id AS outcome_id,o.title AS outcome,
  o.claim_kind,o.status,po.purpose,po.coverage_scope,o.intended_interpretation,o.evidence_required,o.unsupported_inferences,
  (SELECT count(*) FROM item_outcomes io JOIN package_items pi ON pi.item_id=io.item_id
   WHERE pi.package_id=p.id AND io.outcome_id=o.id) AS linked_items,
  CASE WHEN po.coverage_scope='whole_package'
       THEN (SELECT count(*) FROM package_items pi WHERE pi.package_id=p.id)
       ELSE (SELECT count(*) FROM item_outcomes io JOIN package_items pi ON pi.item_id=io.item_id
             WHERE pi.package_id=p.id AND io.outcome_id=o.id) END AS applicable_items
FROM package_outcomes po JOIN packages p ON p.id=po.package_id JOIN outcomes o ON o.id=po.outcome_id;

CREATE VIEW package_content AS
SELECT pi.package_id,pi.presentation_order,pi.usage,i.id AS item_id,i.kind,i.bank,i.status,
  i.cluster_id,i.scoring_mode,i.role_id,i.locality,en.text AS english_text,
  vi.text AS vietnamese_draft,i.source_path,i.source_section
FROM package_items pi JOIN items i ON i.id=pi.item_id
LEFT JOIN item_texts en ON en.item_id=i.id AND en.language='en'
LEFT JOIN item_texts vi ON vi.item_id=i.id AND vi.language='vi';

CREATE VIEW review_queue AS
SELECT i.id AS item_id,i.bank,i.status,i.kind,
  CASE WHEN vi.item_id IS NULL THEN 'not_drafted' ELSE 'author_draft' END AS vietnamese_status,
  i.interpretation_limits,af.issue,af.proposed_disposition
FROM items i LEFT JOIN item_texts vi ON vi.item_id=i.id AND vi.language='vi'
LEFT JOIN audit_findings af ON af.item_id=i.id;
