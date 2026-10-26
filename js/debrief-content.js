/**
 * Author-draft navigation for the descriptive debrief, compatible with
 * instrument 0.4.0. These connections organize existing answers for reflection;
 * they are not validated constructs, scores, causal explanations, or matches
 * to political traditions. A comparison item remains a recorded comparison.
 * Empty scenario arrays mark a real coverage gap rather than implied evidence.
 */
export const debriefVersion = '1.1.0';

export const debriefThemes = [
  {
    id: 'ownership-provision-control',
    title: 'Ownership, provision and control',
    question: 'Who should own, fund and have a say in essential services?',
    statementIds: [
      'economic-ownership',
      'economic-market',
      'economic-services',
      'economic-user-charges',
      'economic-access',
      'economic-choice',
    ],
    foundationIds: [
      'premise-economic-power',
      'premise-property-independence',
      'premise-workplace-control',
    ],
    scenarioIds: ['housing-urgent', 'service-contract', 'housing-planned'],
    readingNote: 'Funding, ownership, access and decision rights are different questions. The housing packages also differ in delivery time, housing numbers and repair funding. A cooperative choice does not establish a middle political position; the repeated housing answer remains a separate comparison.',
    reflectionPrompt: 'Which mattered most in a decision: who owns the service, who can access it, who controls it, or what it can deliver within the stated limits?',
  },
  {
    id: 'freedoms-contestable-power',
    title: 'Freedoms and contesting power',
    question: 'What limits and review should apply when someone can restrict others?',
    statementIds: [
      'civil-dissent',
      'civil-discretion',
      'civil-review',
      'civil-management',
    ],
    foundationIds: [
      'premise-own-good',
      'premise-nondomination',
      'premise-contestable-power',
    ],
    scenarioIds: ['public-assembly'],
    readingNote: 'Protecting a choice, limiting uncontrolled power and making a decision open to challenge can involve different reasons. The single gathering situation does not show how those reasons would apply to workplaces, households or other institutions.',
    reflectionPrompt: 'Did the gathering decision turn on the restriction itself, its effect on other residents, or the ability to challenge it?',
  },
  {
    id: 'transparency-access',
    title: 'Transparency and access to records',
    question: 'How should an office make its decisions understandable and accessible?',
    statementIds: ['civil-records', 'civil-withholding'],
    foundationIds: [],
    scenarioIds: ['public-records'],
    readingNote: 'The records exercise keeps the same legal disclosure floor under every option. Its choices concern additional access, useful information and staff capacity. The two general statements are still included in the older civil summary, but this reading treats their transparency questions separately from public-order restrictions.',
    reflectionPrompt: 'What mattered most: how much information is available, how usable it is, or which other work the office would have to postpone?',
  },
  {
    id: 'belonging-obligations-cooperation',
    title: 'Belonging, obligations and cooperation',
    question: 'How do community ties and responsibilities relate to cooperation?',
    statementIds: [
      'diplomatic-obligation',
      'diplomatic-domestic',
      'diplomatic-coordination',
      'diplomatic-discretion',
      'diplomatic-shared-rules',
      'diplomatic-responsibility',
    ],
    foundationIds: [
      'premise-personal-agency',
      'premise-social-relations',
      'premise-inherited-obligations',
    ],
    scenarioIds: ['water-partnership', 'regional-cooperation'],
    readingNote: 'How relationships shape political interests is separate from which obligations those relationships create. Helping people elsewhere, gaining a shared practical benefit and accepting joint rules can also involve different commitments. The two decisions do not establish which account of agency or belonging explains an answer.',
    reflectionPrompt: 'In each decision, what weight did you give to duties to residents, needs elsewhere, shared benefits and who retains decision authority?',
  },
  {
    id: 'continuity-inclusion',
    title: 'Continuity and inclusion',
    question: 'What should a shared institution preserve, and who should help change it?',
    statementIds: [
      'societal-tradition',
      'societal-revision',
      'societal-continuity',
      'societal-emerging',
      'societal-inherited',
      'societal-new-voices',
    ],
    foundationIds: ['premise-gradual-reform'],
    scenarioIds: ['community-festival', 'community-history'],
    readingNote: 'Preserving a practice, allowing participation and replacing a program are distinct choices. These two situations concern cultural programs; they do not establish a general view of social change or whether gradual reform would be preferred in other institutions.',
    reflectionPrompt: 'Were you protecting an inherited practice, opening a decision process, representing a group, or managing the costs of a change?',
  },
  {
    id: 'knowledge-judgment',
    title: 'Knowledge and judgment',
    question: 'Which sources of knowledge can inform political judgment?',
    statementIds: [],
    foundationIds: [
      'premise-dispersed-knowledge',
      'premise-inherited-knowledge',
      'premise-situated-knowledge',
      'premise-testable-explanations',
    ],
    scenarioIds: [],
    readingNote: 'These premises concern different sources of insight and the revision of explanations. This edition has no dedicated situation comparing those sources, so these answers do not show how a conflict between them would be resolved or who should have final decision authority.',
    reflectionPrompt: 'If practical experience, an established practice and a public study pointed in different directions, what would help you decide which to trust?',
  },
  {
    id: 'care-ecological-dependence',
    title: 'Care and ecological dependence',
    question: 'How do care needs and ecological dependence enter political thinking?',
    statementIds: [],
    foundationIds: ['premise-care-obligations', 'premise-ecological-dependence'],
    scenarioIds: [],
    readingNote: 'Care obligations and ecological dependence ask different questions, with only one premise about each. This edition has no dedicated care-allocation or ecological-standing situation. These answers alone do not identify a preferred care system, environmental policy or view about the moral standing of nature.',
    reflectionPrompt: 'What additional situation would help you explain what recognizing a care obligation or ecological dependence should mean in practice?',
  },
];
