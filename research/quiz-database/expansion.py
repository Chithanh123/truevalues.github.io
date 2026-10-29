"""Import and render the authored October 2026 expansion; no participant scoring."""

import json
import re

VERSION = 'draft-2026-10-27'
SOURCE_PATH = 'research/quiz-database/expansion/sources.json'
CONTENT_FILES = {
    'care-family.json': ((13, 14, 21), (7, 8, 15)),
    'authority-digital.json': ((15, 16, 22), (9, 10, 16)),
    'commons-work.json': ((17, 18, 23), (11, 12, 17)),
    'base-superstructure.json': ((19, 20), (13, 14)),
    'international-relations.json': ((24,), (18,)),
}
PACKETS = {
    'D': ((13, 14), (7, 8)), 'E': ((15, 16), (9, 10)),
    'F': ((17, 18), (11, 12)), 'G': ((19, 20), (13, 14)),
    'H': ((21, 22), (15, 16)), 'I': ((23,), (17,)),
    'J': ((24,), (18,)),
}
PATHS = [SOURCE_PATH, 'research/quiz-database/expansion.py'] + [
    'research/quiz-database/expansion/' + filename for filename in CONTENT_FILES
]


def require(condition, message):
    if not condition:
        raise ValueError('Expansion: ' + message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def paired(value):
    return isinstance(value, dict) and all(nonempty(value.get(lang)) for lang in ('en', 'vi'))


def load(root):
    ledger = json.loads((root / SOURCE_PATH).read_text(encoding='utf-8'))
    require(ledger['version'] == VERSION, 'unexpected source-ledger version')
    readings = ledger['readings']
    require(readings and len({r['id'] for r in readings}) == len(readings) and
            all(re.fullmatch(r'EX-R\d{2}', r['id']) for r in readings),
            'expansion readings need unique IDs')
    known_readings = {r['id'] for r in readings}
    for reading in readings:
        require(all(nonempty(reading.get(field)) for field in
                    ('bibliographic_proposal', 'review_question', 'relevance', 'limits', 'retrieval_note')),
                'source metadata is incomplete: ' + reading['id'])
        require(reading['verification'] in ('unverified', 'passage_inspected'), 'unknown source status')
        require(reading['retrieval_status'] in ('blocked', 'not_attempted', 'retrieved'), 'unknown retrieval status')
        require(reading['source_kind'] in ('normative', 'theoretical', 'empirical', 'methodological'), 'unknown source kind')
        require(reading['access_date'] is None or re.fullmatch(r'\d{4}-\d{2}-\d{2}', reading['access_date']),
                'invalid source access date')
        inspected = reading['verification'] == 'passage_inspected'
        require(bool(reading['passages']) == inspected, 'passages and inspection status disagree: ' + reading['id'])
        require(not inspected or (reading['retrieval_status'] == 'retrieved' and reading['access_date']),
                'inspection needs a dated retrieval')
        for passage in reading['passages']:
            require(all(nonempty(passage.get(field)) for field in ('locator', 'excerpt', 'url')),
                    'inspected passage lacks a locator, excerpt, or URL')
            require(re.fullmatch(r'[0-9a-f]{64}', passage['sha256']) is not None,
                    'inspected passage needs the retrieved file SHA-256')
    packets = []
    for filename, (cluster_numbers, scene_numbers) in CONTENT_FILES.items():
        path = 'research/quiz-database/expansion/' + filename
        packet = json.loads((root / path).read_text(encoding='utf-8'))
        require(packet['version'] == VERSION, 'unexpected content version: ' + filename)
        require(len(packet['clusters']) == len(cluster_numbers) and
                {c['id'] for c in packet['clusters']} == {f'CR-{n:02}' for n in cluster_numbers},
                'incorrect cluster allocation: ' + filename)
        require(len(packet['scenarios']) == len(scene_numbers) and
                {s['id'] for s in packet['scenarios']} == {f'CR-S{n:02}' for n in scene_numbers},
                'incorrect scenario allocation: ' + filename)
        item_ids = set()
        expected_outcomes = {}
        for cluster in packet['clusters']:
            require(all(nonempty(cluster.get(field)) for field in
                        ('title', 'research_question', 'contrast_and_probe', 'risks')), 'incomplete cluster')
            require(cluster['tradition_tensions'], 'cluster needs explicit competing readings')
            for tension in cluster['tradition_tensions']:
                require(all(nonempty(tension.get(field)) for field in
                            ('lens', 'argument', 'internal_disagreement')), 'incomplete tradition caveat')
            require([s['id'] for s in cluster['statements']] == [cluster['id'] + c for c in 'ABCD'],
                    'cluster must contain four distinct propositions')
            linked = set()
            for statement in cluster['statements']:
                require(all(nonempty(statement.get(field)) for field in
                            ('claim_type', 'en', 'vi', 'distinction', 'rival_reading', 'probe')),
                        'incomplete bilingual statement: ' + statement['id'])
                require(statement['reading_ids'] and set(statement['reading_ids']) <= known_readings,
                        'statement has an unknown or absent reading link')
                item_ids.add(statement['id'])
                linked.add(statement['id'])
            expected_outcomes['DEBATE-' + cluster['id'][3:]] = linked
            require(cluster['reading_ids'] and set(cluster['reading_ids']) <= known_readings,
                    'cluster has an unknown or absent reading link')
        for scene in packet['scenarios']:
            require(scene['cluster_id'] in {c['id'] for c in packet['clusters']}, 'scenario cluster outside packet')
            require(paired(scene['briefing']) and paired(scene['personal_preference_prompt']),
                    'scenario briefing and preference prompt need both language drafts')
            require([o['id'] for o in scene['options']] == list('ABC'), 'scenario needs exactly three ordered options')
            for option in scene['options']:
                require(all(paired(option[field]) for field in ('label', 'description', 'tradeoff')),
                        'scenario option needs complete bilingual wording')
                require('score' not in option, 'candidate option must not carry a score')
            require(4 <= len(scene['reasons']['en']) <= 6 and
                    len(scene['reasons']['en']) == len(scene['reasons']['vi']), 'reason drafts must be paired')
            require(all(nonempty(reason) for language in ('en', 'vi') for reason in scene['reasons'][language]),
                    'empty reason draft')
            require(scene['variant']['translation_status'] == 'not_drafted', 'variant is an editorial proposal')
            require(all(nonempty(scene['variant'].get(field)) for field in
                        ('id', 'description', 'invariants', 'interpretation_limit')), 'incomplete variant')
            require(scene['comprehension_probes'] and all(nonempty(p) for p in scene['comprehension_probes']),
                    'scenario needs comprehension probes')
            require(nonempty(scene['interpretation_limits']), 'scenario lacks interpretation limits')
            require(scene['reading_ids'] and set(scene['reading_ids']) <= known_readings,
                    'scenario has an unknown or absent reading link')
            item_ids.add(scene['id'])
            expected_outcomes['SCENARIO-' + scene['id'][4:]] = {scene['id']}
        require(len(packet['outcomes']) == len(expected_outcomes) and
                {o['id'] for o in packet['outcomes']} == set(expected_outcomes),
                'expected one outcome per cluster and one per scenario')
        for outcome in packet['outcomes']:
            require(set(outcome['item_ids']) == expected_outcomes[outcome['id']] and
                    len(outcome['item_ids']) == len(set(outcome['item_ids'])), 'incorrect intended-outcome links')
            require(all(nonempty(outcome.get(field)) for field in
                        ('title', 'intended_interpretation', 'evidence_required', 'unsupported_inferences')),
                    'incomplete outcome meaning or limits')
            expected_kind = 'descriptive_construct' if outcome['id'].startswith('DEBATE-') else 'scenario_judgment'
            require(outcome['claim_kind'] == expected_kind, 'outcome must remain descriptive')
        packets.append((path, packet))
    return packets, ledger


def scene_markdown(scene, language):
    lines = [scene['briefing'][language]]
    for option in scene['options']:
        lines += [f'**{option["id"]} — {option["label"][language]}**',
                  option['description'][language], option['tradeoff'][language]]
    label = 'Optional reason for your choice' if language == 'en' else 'Lý do lựa chọn (không bắt buộc)'
    lines += [f'**{label}:**', '\n'.join('- ' + reason for reason in scene['reasons'][language]),
              scene['personal_preference_prompt'][language]]
    return '\n\n'.join(lines)


def add(db, packets, ledger, insert, add_text):
    for reading in ledger['readings']:
        insert(db, 'readings', **{k: reading[k] for k in
                                 ('id', 'bibliographic_proposal', 'review_question', 'verification')}, source_path=SOURCE_PATH)
        insert(db, 'reading_evidence', reading_id=reading['id'], **{k: reading[k] for k in
               ('url', 'source_kind', 'relevance', 'limits', 'retrieval_status', 'access_date', 'retrieval_note')})
        for number, passage in enumerate(reading['passages'], 1):
            insert(db, 'reading_passages', reading_id=reading['id'], passage_number=number, **passage)
    for path, packet in packets:
        ids = []
        for cluster in packet['clusters']:
            insert(db, 'clusters', **{k: cluster[k] for k in
                   ('id', 'title', 'research_question', 'contrast_and_probe', 'risks')}, source_path=path)
            for order, tension in enumerate(cluster['tradition_tensions'], 1):
                insert(db, 'cluster_tensions', cluster_id=cluster['id'], display_order=order, **tension)
            for reading_id in cluster['reading_ids']:
                insert(db, 'cluster_readings', cluster_id=cluster['id'], reading_id=reading_id, relationship='proposed_reading')
            for statement in cluster['statements']:
                item_id = statement['id']
                ids.append(item_id)
                insert(db, 'items', id=item_id, bank='candidate', kind='foundation_statement',
                       title=cluster['title'] + ': ' + item_id, content_version=VERSION, status='author_draft',
                       claim_type=statement['claim_type'], cluster_id=cluster['id'], scoring_mode='descriptive',
                       rationale=statement['distinction'], interpretation_limits=cluster['risks'],
                       source_path=path, source_section=item_id)
                for language in ('en', 'vi'):
                    add_text(db, item_id, language, statement[language])
                insert(db, 'statement_review', item_id=item_id, rival_reading=statement['rival_reading'],
                       comprehension_probe=statement['probe'])
                for reading_id in statement['reading_ids']:
                    insert(db, 'item_readings', item_id=item_id, reading_id=reading_id, relationship='conceptual_background',
                           note='Author-proposed connection; inspect source status and limits separately. This is not source endorsement or item validation.')
        for scene in packet['scenarios']:
            item_id = scene['id']
            ids.append(item_id)
            insert(db, 'items', id=item_id, bank='candidate', kind='scenario', title=scene['title'],
                   content_version=VERSION, status='author_draft', claim_type='role_action', cluster_id=scene['cluster_id'],
                   role_id=scene['role_id'], locality=scene['locality'], scoring_mode='descriptive',
                   rationale='Explore the stated priority and chosen mechanism with reasons retained separately.',
                   interpretation_limits=scene['interpretation_limits'], source_path=path, source_section=item_id)
            for language in ('en', 'vi'):
                add_text(db, item_id, language, scene_markdown(scene, language), 'markdown')
                insert(db, 'reason_notes', item_id=item_id, language=language, notes='\n'.join(scene['reasons'][language]))
                insert(db, 'scenario_preference_prompts', item_id=item_id, language=language,
                       prompt=scene['personal_preference_prompt'][language])
            for order, option in enumerate(scene['options'], 1):
                insert(db, 'options', item_id=item_id, option_id=option['id'], display_order=order)
                for language in ('en', 'vi'):
                    insert(db, 'option_texts', item_id=item_id, option_id=option['id'], language=language,
                           **{k: option[k][language] for k in ('label', 'description', 'tradeoff')})
            for order, probe in enumerate(scene['comprehension_probes'], 1):
                insert(db, 'scenario_probes', item_id=item_id, display_order=order, probe=probe)
            insert(db, 'variants', base_item_id=item_id, status='editorial_proposal', source_path=path, **scene['variant'])
            for reading_id in scene['reading_ids']:
                insert(db, 'item_readings', item_id=item_id, reading_id=reading_id, relationship='conceptual_background',
                       note='Author-proposed conceptual connection. The fictional permissions and quantities are not historical or legal claims from this source.')
            for (world_id,) in db.execute('SELECT id FROM worlds').fetchall():
                insert(db, 'scenario_contexts', item_id=item_id, world_id=world_id, status='needs_authorization_review',
                       review_requirement='Write and review this fictional world wrapper: confirm the assigned role can choose every package, '
                       'hold resources and safeguards constant, reconcile both languages, and withhold explicit country correspondence until debrief. '
                       'No national legal accuracy, reviewed authorization, or equivalence is established by this queue entry.')
        for outcome in packet['outcomes']:
            insert(db, 'outcomes', **{k: v for k, v in outcome.items() if k != 'item_ids'}, status='author_draft', source_path=path)
            for item_id in outcome['item_ids']:
                insert(db, 'item_outcomes', item_id=item_id, outcome_id=outcome['id'], relationship='primary',
                       rationale='Preserve this authored distinction and the separate evidence and interpretation limits.')
    clusters = {c['id']: (path, c) for path, packet in packets for c in packet['clusters']}
    for suffix, (cluster_numbers, scene_numbers) in PACKETS.items():
        selected = [clusters[f'CR-{number:02}'] for number in cluster_numbers]
        statement_count, scenario_count = len(cluster_numbers) * 4, len(scene_numbers)
        task_count = statement_count + scenario_count
        pid = 'REVIEW-' + suffix
        insert(db, 'packages', id=pid, title='Content interview ' + suffix + ': ' + ' / '.join(c['title'] for _, c in selected),
               version=VERSION, kind='content_interview', status='author_draft',
               purpose='Review omitted distinctions, competing reasons, bilingual comprehension, and situated choices before assessment adoption.',
               audience='Bilingual English–Vietnamese adults after source, language, and pilot-readiness review.',
               target_statements=statement_count, target_scenarios=scenario_count, order_status='allocation_only',
               language_note=f'All {task_count} primary tasks have English and Vietnamese author drafts; independent translation reconciliation is pending.',
               inference_limit=f'The {task_count} primary tasks exclude reasons, probes, briefing and debrief. No validated ideology classification, '
               'causal interpretation, measured information gain, or equivalent-form claim.', source_path='research/quiz-database/expansion.py')
        ids = [f'CR-{number:02}{letter}' for number in cluster_numbers for letter in 'ABCD'] + [f'CR-S{number:02}' for number in scene_numbers]
        for item_id in ids:
            insert(db, 'package_items', package_id=pid, item_id=item_id, usage='primary_task')
        outcome_ids = [f'DEBATE-{number:02}' for number in cluster_numbers] + [f'SCENARIO-{number:02}' for number in scene_numbers]
        for outcome_id in outcome_ids:
            insert(db, 'package_outcomes', package_id=pid, outcome_id=outcome_id, coverage_scope='linked_items',
                   purpose='Explore the linked draft content without constructing a new score.')
        insert(db, 'package_outcomes', package_id=pid, outcome_id='REVIEW-COMPREHENSION', coverage_scope='whole_package',
               purpose='Observe interpretation, factual understanding, and competing readings throughout this draft packet.')


def reading_links(ids):
    return ', '.join(f'[{reading_id}](source-evidence.md#{reading_id.lower()})' for reading_id in ids)


def export(directory, packets, ledger):
    sources = ['# Source evidence for the question-bank expansion', '',
               'This ledger distinguishes inspected passages from unverified reading proposals. Reading a passage does not '
               'validate a question, confirm a political interpretation, or establish an author’s endorsement. Legacy reading proposals remain unverified.', '',
               '[Question candidates](expansion-candidates.md) · [Catalog guide](../README.md)', '']
    for reading in ledger['readings']:
        sources += [f'## {reading["id"]}', '', reading['bibliographic_proposal'], '',
                    f'**Status:** `{reading["verification"]}` · **Source kind:** `{reading["source_kind"]}` · '
                    f'**Retrieval:** `{reading["retrieval_status"]}` · **Access date:** {reading["access_date"] or "not accessed"}', '',
                    f'[Proposed source or discovery link]({reading["url"]})' if reading['url'] else 'Bibliographic citation only; no verified online source link.', '',
                    f'**Review question:** {reading["review_question"]}', '',
                    f'**Relevance to drafting:** {reading["relevance"]}', '', f'**Limits:** {reading["limits"]}', '',
                    f'**Retrieval record:** {reading["retrieval_note"]}', '']
        for passage in reading['passages']:
            sources += [f'### {passage["locator"]}', '',
                        '\n'.join('> ' + line for line in passage['excerpt'].splitlines()), '',
                        f'[Inspected text]({passage["url"]}) · Retrieved-file SHA-256: `{passage["sha256"]}`.', '']
    (directory / 'source-evidence.md').write_text('\n'.join(sources), encoding='utf-8')
    all_clusters = {c['id']: c for _, packet in packets for c in packet['clusters']}
    all_scenes = {s['id']: s for _, packet in packets for s in packet['scenarios']}
    all_outcomes = {o['id']: o for _, packet in packets for o in packet['outcomes']}
    lines = [f'# Expansion candidates: {sum(len(c["statements"]) for c in all_clusters.values())} statements and {len(all_scenes)} situations', '',
             f'Prepared 27 October 2026. These English–Vietnamese author drafts add {len(all_clusters)} disputes to the research bank. '
             'The 60 additional draft questions are included in the combined 109-item assessment without scores; they have not undergone independent language or participant review.', '',
             'Four statements within a dispute are separate claims, not an ordered ideological axis. Tradition names appear only in author notes. '
             'The scenarios supply fictional powers and resource constraints; eight world-specific wrappers per scenario remain unwritten and require review.', '',
             '[Source evidence](source-evidence.md) · [Packages and outcomes](package-overview.md) · [Catalog guide](../README.md)', '']
    for suffix, (cluster_numbers, scene_numbers) in PACKETS.items():
        packet = {
            'clusters': [all_clusters[f'CR-{n:02}'] for n in cluster_numbers],
            'scenarios': [all_scenes[f'CR-S{n:02}'] for n in scene_numbers],
            'outcomes': [all_outcomes[f'DEBATE-{n:02}'] for n in cluster_numbers] +
                        [all_outcomes[f'SCENARIO-{n:02}'] for n in scene_numbers],
        }
        statements, scenes = len(cluster_numbers) * 4, len(scene_numbers)
        lines += [f'## REVIEW-{suffix}', '',
                  f'{statements} statements plus {scenes} situations: {statements + scenes} primary tasks. Reasons, probes, briefing, language switching, and debrief add burden. '
                  'This is a review allocation; presentation order and equivalent forms have not been established.', '']
        for cluster in packet['clusters']:
            lines += [f'### {cluster["id"]} — {cluster["title"]}', '', cluster['research_question'], '',
                      '**Competing arguments and disagreements within traditions:**', '']
            for tension in cluster['tradition_tensions']:
                lines += [f'- **{tension["lens"]}:** {tension["argument"]} Internal disagreement: {tension["internal_disagreement"]}']
            lines += ['', f'**Reading connections:** {reading_links(cluster["reading_ids"])}', '']
            for statement in cluster['statements']:
                lines += [f'#### {statement["id"]} · {statement["claim_type"]}', '',
                          f'**EN:** {statement["en"]}', '', f'**VI — author draft:** {statement["vi"]}', '',
                          f'**Added distinction:** {statement["distinction"]}', '', f'**Rival reading:** {statement["rival_reading"]}', '',
                          f'**Comprehension probe:** {statement["probe"]}', '',
                          f'**Reading connections:** {reading_links(statement["reading_ids"])}', '']
            lines += [f'**Compare and probe:** {cluster["contrast_and_probe"]}', '', f'**Risks:** {cluster["risks"]}', '']
        for scene in packet['scenarios']:
            lines += [f'### {scene["id"]} — {scene["title"]}', '',
                      f'Role: `{scene["role_id"]}` · Locality: `{scene["locality"]}` · Cluster: `{scene["cluster_id"]}`', '',
                      '#### English participant draft', '', scene_markdown(scene, 'en'), '',
                      '#### Vietnamese participant draft', '', scene_markdown(scene, 'vi'), '',
                      '#### Author review', '', f'**Limits:** {scene["interpretation_limits"]}', '',
                      '**Comprehension probes:**', '']
            lines += ['- ' + probe for probe in scene['comprehension_probes']]
            variant = scene['variant']
            lines += ['', f'**Editorial variant {variant["id"]}:** {variant["description"]}', '',
                      f'**Held constant:** {variant["invariants"]}', '', f'**Variant limits:** {variant["interpretation_limit"]}', '',
                      'The alternate form and its translation are not drafted; this is a controlled-change proposal.', '',
                      f'**Reading connections:** {reading_links(scene["reading_ids"])}', '']
        lines += ['### Intended assessment outcomes', '']
        for outcome in packet['outcomes']:
            lines += [f'#### {outcome["id"]} — {outcome["title"]}', '',
                      f'Linked items: {", ".join(outcome["item_ids"])}.', '', outcome['intended_interpretation'], '',
                      f'**Required evidence:** {outcome["evidence_required"]}', '',
                      f'**Unsupported inferences:** {outcome["unsupported_inferences"]}', '']
    (directory / 'expansion-candidates.md').write_text('\n'.join(lines), encoding='utf-8')
