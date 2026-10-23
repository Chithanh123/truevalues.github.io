import test from 'node:test';
import assert from 'node:assert/strict';
import { foundationEvidencePanel } from '../js/review-evidence.js';

const fixture = () => ({
  sources: [{id: 'source', title: 'A source', authors: [], url: 'https://example.org/work', verification: 'unverified', note: 'Text not checked.'}],
  items: [{itemId: 'premise', links: [{sourceId: 'source', relation: 'contrast', locator: 'Section pending', note: 'A rival account.'}], openQuestion: 'What would distinguish these readings?'}],
});

test('source panels distinguish proposals from checked text and do not create participant content', () => {
  const evidence = fixture();
  const html = foundationEvidencePanel('premise', evidence);
  assert.match(html, /Unverified source proposal/);
  assert.match(html, /Authorship awaits verification/);
  assert.match(html, /Contrast/);
  assert.match(html, /does not establish that a source endorses/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.equal(foundationEvidencePanel('unknown', evidence), '');
  evidence.sources[0].verification = 'text-checked';
  assert.match(foundationEvidencePanel('premise', evidence), /Source text checked for this draft/);
});

test('source proposals are escaped and unsafe URL schemes or credentials are never linked', () => {
  const evidence = fixture();
  evidence.sources[0].title = '<img src=x onerror=alert(1)>';
  evidence.sources[0].authors = ['<script>bad</script>'];
  evidence.items[0].links[0].note = '<iframe src=evil>';
  evidence.items[0].openQuestion = '" onfocus="bad';
  for (const unsafe of ['javascript:alert(1)', 'data:text/html,bad', 'https://user:secret@example.org/work', 'not a URL']) {
    evidence.sources[0].url = unsafe;
    const html = foundationEvidencePanel('premise', evidence);
    assert.ok(!html.includes('<img') && !html.includes('<script>') && !html.includes('<iframe'));
    assert.ok(!html.includes(`href="${unsafe}`));
    assert.match(html, /&lt;img/);
    assert.match(html, /&quot; onfocus=&quot;bad/);
  }
});
