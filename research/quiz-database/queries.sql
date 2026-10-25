-- Run against generated/quiz-packages.sqlite3 in any SQLite client.
-- These queries inspect authored content; they never classify a participant.

-- 1. Planned and actually assigned tasks, with language and probe coverage.
SELECT id, title, status, planned_primary_tasks, assigned_items,
       assigned_statements, assigned_scenarios, probe_tasks,
       english_texts, vietnamese_drafts, order_status
FROM package_summary
ORDER BY id;

-- 2. What REVIEW-A is intended to explore, and what it cannot establish.
SELECT package_id, outcome_id, outcome, claim_kind, status, coverage_scope, linked_items, applicable_items,
       purpose, intended_interpretation, evidence_required, unsupported_inferences
FROM package_outcome_matrix
WHERE package_id = 'REVIEW-A'
ORDER BY outcome_id;

-- 3. Review packet A wording. A null order means allocation only, not a fixed sequence.
SELECT package_id, presentation_order, item_id, usage, status,
       english_text, vietnamese_draft, source_path, source_section
FROM package_content
WHERE package_id = 'REVIEW-A'
ORDER BY presentation_order IS NULL, presentation_order, item_id;

-- 4. Items whose Vietnamese participant wording has not been drafted.
SELECT item_id, kind, status, vietnamese_status, interpretation_limits
FROM review_queue
WHERE vietnamese_status = 'not_drafted'
ORDER BY item_id;

-- 5. Held probes and their permitted outcome relationships.
SELECT i.id AS item_id, i.title, i.status, i.scoring_mode,
       pi.package_id, pi.usage, io.relationship,
       o.id AS outcome_id, o.claim_kind, o.intended_interpretation
FROM items i
LEFT JOIN package_items pi ON pi.item_id = i.id
LEFT JOIN item_outcomes io ON io.item_id = i.id
LEFT JOIN outcomes o ON o.id = io.outcome_id
WHERE i.status = 'probe_only'
ORDER BY i.id, pi.package_id, o.id;

-- 6. The future budget has a target, but no selected items or fixed outcomes.
SELECT p.id, p.status, p.target_statements, p.target_scenarios,
       (SELECT count(*) FROM package_items pi WHERE pi.package_id = p.id) AS assigned_items,
       (SELECT count(*) FROM package_outcomes po WHERE po.package_id = p.id) AS assigned_outcomes,
       p.inference_limit
FROM packages p
WHERE p.id = 'FUTURE-24';

-- 7. Authored versus still-unwritten scenario contexts in each fictional world.
SELECT w.id AS world_id, w.name, sc.status, count(*) AS scenario_cells,
       count(sc.note_en) AS english_contexts, count(sc.note_vi) AS vietnamese_contexts
FROM scenario_contexts sc
JOIN worlds w ON w.id = sc.world_id
GROUP BY w.id, w.name, sc.status
ORDER BY w.id, sc.status;

-- 8. Inspect current authored aggregation eligibility, keeping exclusions visible.
-- Domain links and option scores alone do not determine eligibility.
SELECT coalesce(d.id, 'no_domain') AS domain_id,
       coalesce(d.title, 'Descriptive premises without a domain aggregate') AS domain,
       sum(CASE WHEN i.scoring_mode = 'directional_statement' THEN 1 ELSE 0 END)
         AS directional_statements,
       sum(CASE WHEN i.scoring_mode = 'provisional_scenario' THEN 1 ELSE 0 END)
         AS provisionally_scored_scenarios,
       sum(CASE WHEN i.kind = 'scenario' AND i.scoring_mode = 'descriptive' THEN 1 ELSE 0 END)
         AS descriptive_scenarios,
       sum(CASE WHEN i.scoring_mode = 'comparison_excluded' THEN 1 ELSE 0 END)
         AS excluded_comparisons,
       sum(CASE WHEN i.kind = 'foundation_statement' THEN 1 ELSE 0 END)
         AS descriptive_foundation_items
FROM items i
LEFT JOIN domains d ON d.id = i.domain_id
WHERE i.bank = 'current'
GROUP BY d.id, d.title
ORDER BY domain_id;
