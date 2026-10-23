/**
 * Bibliographic proposals for author review, separate from the participant bank.
 * The listed pages could not be retrieved in this environment. Their titles,
 * authorship, sections, and relevance require verification before citation use.
 * Links mark proposed debates to investigate, never endorsements of an item.
 */
const proposedSource = (id, title, url) => ({
  id,
  title,
  authors: [],
  url,
  locator: 'Entry or article; precise section pending source access and review.',
  accessed: '2026-10-22',
  verification: 'unverified',
  note: 'Unverified bibliographic proposal. Retrieval was blocked by an HTTP 403 proxy response on the recorded attempt date. Title, authorship, sections, and the proposed conceptual relationship have not been checked against the page text.',
});

export const foundationEvidence = {
  evidenceVersion: 1,
  instrumentId: 'political-context-pilot',
  instrumentVersion: '0.4.0',
  reviewStatus: 'author-draft',
  sources: [
    proposedSource('sep-liberalism', 'Liberalism — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/liberalism/'),
    proposedSource('sep-communitarianism', 'Communitarianism — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/communitarianism/'),
    proposedSource('sep-marx', 'Karl Marx — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/marx/'),
    proposedSource('sep-environmental-ethics', 'Environmental Ethics — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/ethics-environmental/'),
    proposedSource('sep-republicanism', 'Republicanism — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/republicanism/'),
    proposedSource('sep-feminist-epistemology', 'Feminist Social Epistemology — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/feminist-social-epistemology/'),
    proposedSource('sep-conservatism', 'Conservatism — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/conservatism/'),
    proposedSource('sep-socialism', 'Socialism — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/socialism/'),
    proposedSource('iep-care-ethics', 'Care Ethics — Internet Encyclopedia of Philosophy', 'https://iep.utm.edu/care-ethics/'),
    proposedSource('hayek-knowledge', 'The Use of Knowledge in Society — proposed Econlib article', 'https://www.econlib.org/library/Essays/hykKnw.html'),
    proposedSource('sep-popper', 'Karl Popper — Stanford Encyclopedia of Philosophy', 'https://plato.stanford.edu/entries/popper/'),
    proposedSource('sep-property', 'Property and Ownership — proposed Stanford Encyclopedia of Philosophy entry', 'https://plato.stanford.edu/entries/property/'),
  ],
  items: [
    {
      itemId: 'premise-personal-agency',
      links: [
        { sourceId: 'sep-liberalism', relation: 'background', locator: 'Proposed topic: individual agency and accounts of the person; section unverified.', note: 'Investigate how different liberal accounts connect agency with social conditions. This is an author-proposed reading route, not a claim that the entry supports the item wording.' },
        { sourceId: 'sep-communitarianism', relation: 'contrast', locator: 'Proposed topic: socially constituted selves; section unverified.', note: 'Look for challenges to strongly independent accounts of political agency while distinguishing social formation from an inability to dissent.' },
      ],
      openQuestion: 'Does “independent” mean the possibility of dissent, independence of justification, or a person wholly uninfluenced by social relations?',
    },
    {
      itemId: 'premise-social-relations',
      links: [
        { sourceId: 'sep-communitarianism', relation: 'background', locator: 'Proposed topic: social relationships and identity; section unverified.', note: 'Check which accounts concern the formation of interests, rather than assuming all accounts of community make the same ontological claim.' },
        { sourceId: 'sep-liberalism', relation: 'contrast', locator: 'Proposed topic: individual and social conceptions of persons; section unverified.', note: 'Compare liberal approaches that recognize social formation with approaches that give agency a different justificatory role; this need not be an opposing pair.' },
      ],
      openQuestion: 'Would readers distinguish the causal formation of interests from obligations owed to a community?',
    },
    {
      itemId: 'premise-economic-power',
      links: [
        { sourceId: 'sep-marx', relation: 'background', locator: 'Proposed topic: production, class, and political power; section unverified.', note: 'Investigate accounts linking control of production to durable political power, including disagreements about causal priority and historical scope.' },
        { sourceId: 'sep-property', relation: 'contrast', locator: 'Proposed topic: property, independence, and political justification; section unverified.', note: 'Compare the power created by concentrated ownership with arguments that distributed ownership protects independence. The claims may both hold under different distributions.' },
      ],
      openQuestion: 'Does agreement concern a general account of power, one instance of lobbying, or the distribution of ownership?',
    },
    {
      itemId: 'premise-ecological-dependence',
      links: [
        { sourceId: 'sep-environmental-ethics', relation: 'background', locator: 'Proposed topic: human relations with ecological systems; section unverified.', note: 'Investigate human-centered and non-human-centered approaches without treating ecological dependence alone as endorsement of a complete environmental ethic.' },
      ],
      openQuestion: 'Can an item distinguish an explanatory account of social-ecological relations from commonplace factual agreement or a moral priority?',
    },
    {
      itemId: 'premise-own-good',
      links: [
        { sourceId: 'sep-liberalism', relation: 'background', locator: 'Proposed topic: liberty and diverse conceptions of a good life; section unverified.', note: 'Check the variety of arguments for equal freedom and the conditions under which choice is considered meaningful.' },
        { sourceId: 'sep-communitarianism', relation: 'contrast', locator: 'Proposed topic: community, the good, and individual choice; section unverified.', note: 'Investigate criticism of abstract choice and possible shared commitments, without assuming communitarian approaches reject equal freedom.' },
      ],
      openQuestion: 'What do participants understand “respect the same freedom” to require when choices impose costs or depend on unequal resources?',
    },
    {
      itemId: 'premise-nondomination',
      links: [
        { sourceId: 'sep-republicanism', relation: 'background', locator: 'Proposed topic: freedom as non-domination; section unverified.', note: 'Check distinctions between actual interference and an uncontrolled capacity to interfere before finalizing the item’s explanatory gloss.' },
        { sourceId: 'sep-liberalism', relation: 'contrast', locator: 'Proposed topic: different accounts of liberty; section unverified.', note: 'Compare the roles of non-interference and non-domination without assigning a single definition to all liberal approaches.' },
      ],
      openQuestion: 'Do readers recognize dependence on another actor’s discretionary power even if that actor does not currently interfere?',
    },
    {
      itemId: 'premise-care-obligations',
      links: [
        { sourceId: 'iep-care-ethics', relation: 'background', locator: 'Proposed topic: care, dependency, and political obligation; section unverified.', note: 'Investigate whether care-based arguments ground recognition, public provision, relational duties, or different combinations; no single institutional conclusion is assumed.' },
      ],
      openQuestion: 'Does the item elicit recognition of dependency, family responsibility, the standing of care workers, or a particular welfare policy?',
    },
    {
      itemId: 'premise-inherited-obligations',
      links: [
        { sourceId: 'sep-communitarianism', relation: 'background', locator: 'Proposed topic: membership and unchosen obligations; section unverified.', note: 'Look for distinctions between obligations from membership and approval of any existing community authority.' },
        { sourceId: 'sep-liberalism', relation: 'contrast', locator: 'Proposed topic: consent, obligation, and individual freedom; section unverified.', note: 'Compare arguments about consent and special obligations. The map does not assume that liberal approaches deny every unchosen duty.' },
      ],
      openQuestion: 'Which community and kind of obligation do respondents imagine: mutual aid, legal duty, historic repair, or inherited authority?',
    },
    {
      itemId: 'premise-dispersed-knowledge',
      links: [
        { sourceId: 'hayek-knowledge', relation: 'background', locator: 'Proposed topic: dispersed information and social coordination; passage unverified.', note: 'Verify the proposed article and the scope of its knowledge argument before attributing it to any item wording or institutional conclusion.' },
        { sourceId: 'sep-socialism', relation: 'contrast', locator: 'Proposed topic: market, planning, and decentralized coordination debates; section unverified.', note: 'Investigate socialist responses and decentralized alternatives rather than assuming every socialist model requires a single center to possess all knowledge.' },
      ],
      openQuestion: 'Does a limit on central knowledge imply a preference for markets, participatory planning, polycentric institutions, or none of these by itself?',
    },
    {
      itemId: 'premise-inherited-knowledge',
      links: [
        { sourceId: 'sep-conservatism', relation: 'background', locator: 'Proposed topic: inherited practice and limits of deliberate design; section unverified.', note: 'Check accounts of practical or tacit knowledge while keeping knowledge claims distinct from the legitimacy of inherited hierarchy.' },
        { sourceId: 'hayek-knowledge', relation: 'background', locator: 'Proposed topic: knowledge beyond explicit central description; passage unverified.', note: 'Investigate a related but distinct knowledge argument; dispersed information and knowledge embedded in longstanding practice must not be treated as identical.' },
      ],
      openQuestion: 'Can readers recognize useful tacit knowledge while also endorsing criticism and revision of the practice that carries it?',
    },
    {
      itemId: 'premise-situated-knowledge',
      links: [
        { sourceId: 'sep-feminist-epistemology', relation: 'background', locator: 'Proposed topic: social location, experience, and knowledge; section unverified.', note: 'Investigate distinctions among a social standpoint, particular experiences, and claims of epistemic advantage. Do not infer infallibility or uniform group knowledge.' },
      ],
      openQuestion: 'Does “may miss” refer to additional evidence, interpretive resources, credibility, or a general claim about whose judgments prevail?',
    },
    {
      itemId: 'premise-testable-explanations',
      links: [
        { sourceId: 'sep-popper', relation: 'background', locator: 'Proposed topic: fallibility and criticism of explanatory claims; section unverified.', note: 'Investigate the reach and limitations of revisability arguments before extending them to political explanations; moral commitments are not automatically empirical hypotheses.' },
        { sourceId: 'sep-feminist-epistemology', relation: 'contrast', locator: 'Proposed topic: public knowledge practices and credibility; section unverified.', note: 'Ask who can produce recognized evidence and whose experiences are considered examinable. This comparison does not assert rejection of evidence or revisability.' },
      ],
      openQuestion: 'Does the item measure a distinctive epistemic commitment, socially desirable assent, or disagreement about what counts as public evidence?',
    },
    {
      itemId: 'premise-property-independence',
      links: [
        { sourceId: 'sep-property', relation: 'background', locator: 'Proposed topic: ownership, liberty, and independence; section unverified.', note: 'Investigate the form and distribution of property involved, rather than treating any private ownership as an equivalent safeguard.' },
        { sourceId: 'sep-socialism', relation: 'contrast', locator: 'Proposed topic: private economic power and social ownership; section unverified.', note: 'Compare dependence on government with dependence on private actors and potential shared-ownership alternatives. The item itself does not resolve those comparisons.' },
      ],
      openQuestion: 'Which property and distribution do respondents imagine, and does the same arrangement create dependence on employers, landlords, or lenders?',
    },
    {
      itemId: 'premise-workplace-control',
      links: [
        { sourceId: 'sep-socialism', relation: 'background', locator: 'Proposed topic: economic democracy and control of production; section unverified.', note: 'Check distinctions between consultation, co-determination, cooperative ownership, and worker self-management before selecting more precise variants.' },
        { sourceId: 'sep-property', relation: 'contrast', locator: 'Proposed topic: decision rights and justifications of ownership; section unverified.', note: 'Investigate alternative claims about ownership, consent, and authority inside an enterprise, without assuming a single property theory.' },
      ],
      openQuestion: 'How much control does “share control” imply, and whose interests and rights should matter alongside those of current workers?',
    },
    {
      itemId: 'premise-contestable-power',
      links: [
        { sourceId: 'sep-republicanism', relation: 'background', locator: 'Proposed topic: contestation and control of power; section unverified.', note: 'Investigate how effective contestation relates to non-domination and how the argument applies across public and private institutions.' },
      ],
      openQuestion: 'Do participants imagine a formal appeal, practical access to review, democratic control, collective organization, or a veto over decisions?',
    },
    {
      itemId: 'premise-gradual-reform',
      links: [
        { sourceId: 'sep-conservatism', relation: 'background', locator: 'Proposed topic: continuity, practical judgment, and reform; section unverified.', note: 'Investigate arguments about preserving useful functions separately from moral approval of the status quo.' },
        { sourceId: 'sep-socialism', relation: 'contrast', locator: 'Proposed topic: reform, transformation, and institutional alternatives; section unverified.', note: 'Look for disagreement within socialist approaches about paths of change; do not treat socialism as uniformly opposed to gradual reform.' },
      ],
      openQuestion: 'Would responses change with the severity of existing injustice, the reliability of replacement institutions, or the costs of waiting?',
    },
  ],
};
