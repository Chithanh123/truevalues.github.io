/**
 * Candidate premises for descriptive research, not an ideology classifier.
 * Lens associations identify relevant debates, not who must agree with an item.
 * Participants see neutral premise wording; author labels belong in review.
 */
export const foundations = {
  reviewStatus: 'author-draft',
  aims: [
    'Explore how beliefs about people, social relations, power, and nature shape political judgments before reducing those judgments to policy positions.',
    'Separate assumptions about social reality from moral priorities, ways of knowing, and proposed institutions.',
    'Represent disagreements within and across political traditions through overlapping interpretive lenses rather than mutually exclusive identity labels.',
    'Develop a larger, independently reviewed English–Vietnamese statement bank, then investigate how stated premises relate to decisions under specified roles and constraints.',
  ],
  categories: [
    { id: 'ontology', label: 'People and social reality', description: 'Assumptions about what people and societies are like, and which relations help explain political life.' },
    { id: 'normative', label: 'Moral priorities', description: 'Claims about what deserves protection or counts as a good reason for political action.' },
    { id: 'epistemology', label: 'Knowledge and judgment', description: 'Assumptions about how people can know what is happening and whose knowledge should inform decisions.' },
    { id: 'institutions', label: 'Organizing power', description: 'Claims about arrangements that could put political principles into practice.' },
  ],
  lenses: [
    {
      id: 'classical-liberal', label: 'Classical liberal approaches',
      description: 'Often begin with persons as agents entitled to equal basic liberties, with property and limited government as safeguards against coercion.',
      cautions: 'Classical liberals disagree about social obligations, historical injustice, democracy, and how much public provision liberty requires.',
    },
    {
      id: 'social-liberal', label: 'Social liberal approaches',
      description: 'Connect personal liberty and plural ways of living with the social conditions people need to exercise meaningful choice.',
      cautions: 'Social liberals differ over redistribution, state capacity, the limits of markets, and which opportunities should be guaranteed.',
    },
    {
      id: 'social-democratic', label: 'Social democratic approaches',
      description: 'Emphasize political equality, organized labor, and shared provision while allowing substantial room for markets and private ownership.',
      cautions: 'Social democracy contains competing accounts of class, growth, welfare, ownership, and the reach of economic democracy.',
    },
    {
      id: 'democratic-socialist', label: 'Democratic socialist approaches',
      description: 'Treat concentrated economic control as a barrier to democracy and seek forms of social ownership or democratic control of production.',
      cautions: 'Democratic socialists disagree about markets, planning, workplace governance, the state, and paths of change.',
    },
    {
      id: 'marxist', label: 'Marxist approaches',
      description: 'Analyze political life through historically changing relations of production, class power, and conflict over control of social resources.',
      cautions: 'Marxist traditions differ over the state, agency, culture, gender, ecology, democracy, and revolutionary or reformist strategy.',
    },
    {
      id: 'conservative', label: 'Conservative approaches',
      description: 'Often emphasize inherited obligations, the limits of deliberate design, and practical knowledge carried by established institutions.',
      cautions: 'Conservative traditions vary across societies and disagree about hierarchy, markets, religion, national identity, and the scope of reform.',
    },
    {
      id: 'libertarian', label: 'Libertarian approaches',
      description: 'Give special weight to freedom from coercion and the possibility of voluntary coordination beyond centralized authority.',
      cautions: 'Right and left libertarians disagree sharply about property, inherited advantage, capitalism, and what makes an arrangement voluntary.',
    },
    {
      id: 'republican', label: 'Republican approaches',
      description: 'Understand freedom partly as protection against dependence on power that others can exercise without effective contest or control.',
      cautions: 'Republican refers to a political tradition, not a party; its variants disagree about civic participation, property, and economic dependence.',
    },
    {
      id: 'communitarian', label: 'Communitarian approaches',
      description: 'Emphasize how relationships, shared practices, and particular communities help form identities and obligations.',
      cautions: 'Community does not imply unanimity; communitarian approaches differ over dissent, exclusion, plural membership, and inherited authority.',
    },
    {
      id: 'feminist', label: 'Feminist approaches',
      description: 'Examine how gendered power, care, dependence, and intersecting social relations shape political standing and everyday life.',
      cautions: 'Feminism includes liberal, socialist, radical, care-centered, intersectional, and other approaches with substantive disagreements.',
    },
    {
      id: 'ecological', label: 'Ecological political approaches',
      description: 'Place ecological dependence, limits, and relations with the non-human world at the center of political explanation and obligation.',
      cautions: 'Ecological approaches disagree about growth, technology, markets, human-centered ethics, and how environmental burdens should be shared.',
    },
    {
      id: 'decolonial', label: 'Decolonial and anti-colonial approaches',
      description: 'Investigate how colonial histories and continuing hierarchies shape authority, knowledge, political membership, and claims to self-determination.',
      cautions: 'These are distinct, internally varied traditions; no single item represents Indigenous perspectives or all formerly colonized societies.',
    },
    {
      id: 'anarchist', label: 'Anarchist approaches',
      description: 'Question the necessity and legitimacy of imposed hierarchies and explore self-management, mutual aid, and voluntary association.',
      cautions: 'Anarchist traditions differ about property, coordination, organization, and how to confront durable inequalities without centralized rule.',
    },
  ],
  items: [
    {
      id: 'premise-personal-agency', category: 'ontology',
      text: 'An individual can form political commitments that are independent of the social groups they belong to.',
      lenses: ['classical-liberal', 'social-liberal', 'communitarian', 'marxist'],
      rationale: 'Explores the relative independence of agency from group membership. Agreement may concern the possibility of dissent rather than an individualist account of society.',
    },
    {
      id: 'premise-social-relations', category: 'ontology',
      text: 'A person’s political interests are formed through their relationships with other people.',
      lenses: ['communitarian', 'feminist', 'marxist', 'social-liberal'],
      rationale: 'Explores a relational account of interests. Social influence, identity formation, and economic dependence are rival interpretations; it is not the reverse of personal agency.',
    },
    {
      id: 'premise-economic-power', category: 'ontology',
      text: 'Control over productive resources is a central source of lasting political power.',
      lenses: ['marxist', 'democratic-socialist', 'social-democratic', 'republican'],
      rationale: 'Explores the explanatory importance of economic power. Respondents may instead be describing corruption, lobbying, or one particular economy.',
    },
    {
      id: 'premise-ecological-dependence', category: 'ontology',
      text: 'Human societies cannot be understood separately from the ecological systems that sustain them.',
      lenses: ['ecological', 'decolonial', 'marxist'],
      rationale: 'Explores ecological embeddedness as an explanatory premise. Factual assent or concern about a recent disaster need not imply a broader ecological philosophy.',
    },
    {
      id: 'premise-own-good', category: 'normative',
      text: 'Each person should be free to pursue their own idea of a good life, provided they respect the same freedom for others.',
      lenses: ['classical-liberal', 'social-liberal', 'libertarian', 'anarchist'],
      rationale: 'Explores equal freedom among different ways of living. The meaning of respect and the social conditions of freedom remain open.',
    },
    {
      id: 'premise-nondomination', category: 'normative',
      text: 'Freedom requires protection from another person’s power to interfere in one’s life at will.',
      lenses: ['republican', 'feminist', 'anarchist', 'democratic-socialist'],
      rationale: 'Explores freedom as protection against uncontrolled power. Participants may read interference as actual harm rather than a standing capacity to dominate.',
    },
    {
      id: 'premise-care-obligations', category: 'normative',
      text: 'Dependence on care creates obligations that political institutions should recognize.',
      lenses: ['feminist', 'communitarian', 'social-democratic', 'social-liberal'],
      rationale: 'Explores care and dependency as grounds of obligation. Family responsibility, public provision, and recognition of unpaid work may lead to different readings.',
    },
    {
      id: 'premise-inherited-obligations', category: 'normative',
      text: 'Membership in a community can create obligations that a person did not choose.',
      lenses: ['conservative', 'communitarian', 'decolonial', 'classical-liberal'],
      rationale: 'Explores unchosen obligations. Agreement might refer to mutual support, historic repair, customary authority, or legal duties; it does not establish support for hierarchy.',
    },
    {
      id: 'premise-dispersed-knowledge', category: 'epistemology',
      text: 'Knowledge needed to coordinate a society is too dispersed for any central authority to fully possess it.',
      lenses: ['classical-liberal', 'libertarian', 'anarchist', 'conservative'],
      rationale: 'Explores dispersed knowledge. Limits of information do not by themselves settle whether markets, public planning, or participatory coordination work better.',
    },
    {
      id: 'premise-inherited-knowledge', category: 'epistemology',
      text: 'Long-established practices can contain useful knowledge that their participants cannot fully explain.',
      lenses: ['conservative', 'communitarian', 'decolonial', 'ecological'],
      rationale: 'Explores tacit knowledge in inherited practice. Useful knowledge does not establish the legitimacy of every tradition or immunity from criticism.',
    },
    {
      id: 'premise-situated-knowledge', category: 'epistemology',
      text: 'People who experience a form of exclusion have knowledge of it that outside observers may miss.',
      lenses: ['feminist', 'decolonial', 'marxist', 'social-liberal'],
      rationale: 'Explores the contribution of situated experience. It does not claim that experience is infallible or that everyone within a group has the same knowledge.',
    },
    {
      id: 'premise-testable-explanations', category: 'epistemology',
      text: 'A political explanation should be open to revision when publicly examinable evidence contradicts it.',
      lenses: ['social-liberal', 'social-democratic', 'marxist', 'ecological'],
      rationale: 'Explores fallibility and public scrutiny of explanatory claims. Social desirability and differing access to recognized evidence may explain agreement; moral commitments are not reducible to empirical tests.',
    },
    {
      id: 'premise-property-independence', category: 'institutions',
      text: 'Widely distributed private property is an important safeguard against dependence on government.',
      lenses: ['classical-liberal', 'libertarian', 'republican', 'conservative'],
      rationale: 'Explores an institutional argument for property. Distribution, the kind of property, and dependence on private actors require separate follow-up items.',
    },
    {
      id: 'premise-workplace-control', category: 'institutions',
      text: 'People who work in an enterprise should share control over its major decisions.',
      lenses: ['democratic-socialist', 'marxist', 'social-democratic', 'anarchist'],
      rationale: 'Explores economic democracy. Consultation, co-determination, cooperative ownership, and full worker control are different institutional interpretations.',
    },
    {
      id: 'premise-contestable-power', category: 'institutions',
      text: 'People subject to an institution’s power should have an effective way to contest its decisions.',
      lenses: ['republican', 'social-liberal', 'feminist', 'decolonial'],
      rationale: 'Explores contestability across public and private power. Courts, direct participation, appeals, and collective organization may implement the principle differently.',
    },
    {
      id: 'premise-gradual-reform', category: 'institutions',
      text: 'Reform should usually change established institutions gradually enough to preserve the functions on which people rely.',
      lenses: ['conservative', 'social-democratic', 'communitarian', 'democratic-socialist'],
      rationale: 'Explores continuity in institutional change. Risk tolerance, feasibility, and assumptions about the severity of current injustice may matter more than attachment to tradition.',
    },
  ],
};
