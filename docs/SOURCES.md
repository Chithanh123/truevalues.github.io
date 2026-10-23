# Foundation source-verification queue

This author-draft map accompanies instrument **0.4.0**. It is separate from the participant question bank and changes neither the 49-item route nor any score. The data are in `js/foundation-evidence.js`; `scripts/validate-evidence.js` checks their structure and item references.

The initial queue links all sixteen premise statements to twelve proposed readings, including alternatives to investigate. These are proposed entry points into relevant debates, not an assertion that a source endorses the exact wording, that every member of a tradition agrees, or that the list represents political thought comprehensively.

## What was actually checked

On **22 October 2026**, requests were attempted for all twelve listed pages: ten proposed Stanford Encyclopedia of Philosophy entries, one Internet Encyclopedia of Philosophy entry, and one Econlib article. Every request failed at the environment proxy with an HTTP 403 tunnel response. No page text or byline was retrieved.

Accordingly, all twelve records are **`unverified`**, with empty author lists and section locators explicitly pending access. Titles and URLs are bibliographic proposals, not checked citations. The `accessed` date records the unsuccessful access attempt for these unverified rows; it must not be read as a successful retrieval date. Every conceptual link and open question is an author proposal requiring source review. No quotations or claimed passage findings are included.

The mechanical validator confirms identities, full item coverage, URL syntax, required fields, and permitted verification states. It cannot verify that a URL resolves, that a byline or title is correct, that a passage says what an annotation proposes, or that a premise is a valid political measure. Its successful exit is not a completed literature review.

## Proposed readings

Authorship and precise sections remain to be verified for every row below.

| Proposed reading | Proposed review use |
| --- | --- |
| [Liberalism](https://plato.stanford.edu/entries/liberalism/) | Accounts of agency, liberty, diverse good lives, consent, and social conditions. |
| [Communitarianism](https://plato.stanford.edu/entries/communitarianism/) | Social formation, identity, membership, and unchosen obligations; possible contrasts with abstract accounts of agency. |
| [Karl Marx](https://plato.stanford.edu/entries/marx/) | Production, class, durable power, and competing interpretations of economic explanation. |
| [Environmental Ethics](https://plato.stanford.edu/entries/ethics-environmental/) | Social-ecological relations and distinctions between explanatory dependence and moral standing. |
| [Republicanism](https://plato.stanford.edu/entries/republicanism/) | Non-domination, the capacity to interfere, and institutional contestation. |
| [Feminist Social Epistemology](https://plato.stanford.edu/entries/feminist-social-epistemology/) | Situated experience, knowledge practices, credibility, and access to recognized evidence. |
| [Conservatism](https://plato.stanford.edu/entries/conservatism/) | Inherited practice, practical judgment, continuity, and arguments about institutional change. |
| [Socialism](https://plato.stanford.edu/entries/socialism/) | Economic democracy, ownership, planning, decentralized alternatives, and paths of change. |
| [Care Ethics](https://iep.utm.edu/care-ethics/) | Dependency, relationships, recognition, and possible political obligations. |
| [The Use of Knowledge in Society](https://www.econlib.org/library/Essays/hykKnw.html) | The proposed argument about dispersed knowledge and its institutional reach. |
| [Karl Popper](https://plato.stanford.edu/entries/popper/) | Fallibility, criticism, and the scope of revisability claims. |
| [Property and Ownership](https://plato.stanford.edu/entries/property/) | Ownership, independence, distribution, authority, and alternative justifications. |

These short descriptions are questions to check, not summaries of retrieved pages. A `contrast` link identifies a potentially useful comparison; it does not claim a source directly refutes an item or treats the traditions as opposites.

## Verification procedure

1. Open the proposed page and confirm its actual title, author attribution, publisher, and a stable edition or revision date where available. Correct or reject the bibliographic proposal as needed.
2. Record an exact section heading, stable fragment link, or page locator for the relevant discussion. Read surrounding material and note the argument’s scope, qualifications, and internal disagreements.
3. Replace the proposed relationship with a source-grounded paraphrase. Distinguish the source’s argument from a criticism it reports, a later interpretation, and the reviewer’s own inference. Record a reason when a proposed link is rejected.
4. Use `metadata-checked` only after the bibliographic record is checked; use `text-checked` only after the relevant passage and its context are read. Populate author attribution for checked rows. These states describe source checking, not expert endorsement, independent human review, or measurement validity.
5. Invite independent reviewers familiar with different viewpoints to contest the item wording, source interpretation, omitted alternatives, and tradition associations. Keep those findings separate from automated test results.

The source map is intentionally not part of the strict participant instrument schema. Adding or correcting reviewer reading proposals does not silently reinterpret saved participant responses. Changes to participant wording or scoring still require their own instrument version policy.
