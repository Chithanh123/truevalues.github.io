/**
 * Authored explanations for a descriptive reading of instrument 0.4.0.
 * These are conditional interpretations of recorded answers, not validated
 * traits, political identities, causal accounts, or a new scoring rubric.
 * Positive/negative follow the existing value-item direction solely to name
 * a response pattern. The premise items remain independent and unscored.
 */
export const interpretationThemes = {
  'ownership-provision-control': {
    positive: {
      title: 'Public responsibility and control',
      meaning: 'Your directional answers favor a greater public role on the economic questions where you took a side. Depending on the statement, that can concern collective responsibility, broad access, or continuing public control. Any recorded decisions add a practical distinction between funding a service, owning it, and operating it.',
    },
    negative: {
      title: 'More room for choice and non-public provision',
      meaning: 'Your directional answers give more room to provider competition, individual choice, or limits on direct public provision. They do not settle whether essential access should be guaranteed: a service can remain publicly funded or regulated while another organization operates it.',
    },
    mixed: {
      title: 'Different priorities for different economic questions',
      meaning: 'Your directional answers point both ways across ownership, funding, access, and provider choice. That can express a distinction between what society should guarantee and how a service should be organized. The answers alone do not establish one overall position or why you made that distinction.',
    },
    neutral: {
      title: 'The general economic tradeoff remains open',
      meaning: 'Neutral responses do not identify a preferred balance between public responsibility and provider choice. Your concrete decisions can still show which arrangements you accepted in particular cases; they do not turn neutrality into a centrist identity.',
    },
    question: 'Which responsibility should stay public even when ownership or day-to-day operation changes?',
  },
  'freedoms-contestable-power': {
    positive: {
      title: 'Protection against discretionary restrictions',
      meaning: 'Your directional answers put greater weight on protecting peaceful activity and limiting or reviewing official restrictions. The political question is how power must justify interference, including when managing a shared space would be easier with stronger controls.',
    },
    negative: {
      title: 'More room for managing disruption',
      meaning: 'Your directional answers give greater room to official discretion or restrictions used to manage disruption. The relevant distinction is between giving officials room to act and deciding which safeguards should govern that discretion.',
    },
    mixed: {
      title: 'Freedom and public management pull in different directions',
      meaning: 'Your answers support different sides of the tradeoff between peaceful activity and official management. A useful distinction is whether you accept a restriction itself, require independent review, or object to broad discretion. Those positions need not move together.',
    },
    neutral: {
      title: 'No general restriction rule expressed',
      meaning: 'Your neutral responses leave open when disruption justifies a new restriction. The gathering case asks about one concrete boundary, under a peaceful setting where emergency access and an appeal route are preserved.',
    },
    question: 'Would your decision change if the same restriction could be imposed without an effective appeal?',
  },
  'transparency-access': {
    positive: {
      title: 'Access despite administrative cost',
      meaning: 'Your directional answers favor making non-sensitive decisions inspectable even when doing so adds work. In the practical exercise, the remaining question is how far to go beyond the common legal disclosure floor and how people can make use of the information.',
    },
    negative: {
      title: 'Administrative burden has greater weight',
      meaning: 'Your directional answers give administrative workload more weight when deciding how much non-sensitive information to make accessible. The practical exercise still requires every option to meet the same disclosure duties; its request-based option does not authorize secrecy or unlawful withholding.',
    },
    mixed: {
      title: 'Access and workload are judged separately',
      meaning: 'Your two answers point in different directions on access and the burden of publication. They leave room for a distinction between supporting transparency generally and deciding how much extra administrative work it should require. Two statements cannot resolve that distinction by themselves.',
    },
    neutral: {
      title: 'The general publication threshold remains open',
      meaning: 'Neutral answers leave the acceptable cost of additional access unspecified. Your records decision can still indicate whether you selected request-based access, easier navigation, or publication without an individual request under the fixed staffing limits.',
    },
    question: 'What makes transparency useful to you: available files, understandable explanations, or the ability to scrutinize a decision without making a request?',
  },
  'belonging-obligations-cooperation': {
    positive: {
      title: 'Responsibilities and cooperation across borders',
      meaning: 'Your directional answers give greater weight to obligations beyond national membership or to shared arrangements for cross-border problems. Moral concern for people elsewhere and the practical benefits of cooperation are distinct grounds for that stance; the selected reasons help show which you explicitly named.',
    },
    negative: {
      title: 'Domestic responsibility and retained discretion',
      meaning: 'Your directional answers give greater weight to responsibilities toward domestic residents or to retaining national control over resources. They leave open how much cooperation you would accept when shared benefits are clear; domestic priority does not by itself mean refusing every international arrangement.',
    },
    mixed: {
      title: 'Obligations, benefits, and authority are separated',
      meaning: 'Your answers point both ways across helping people elsewhere, cooperating on shared problems, and retaining national discretion. Those are different questions: accepting a joint project need not imply equal obligations to everyone, and recognizing outside needs need not settle who should make the decision.',
    },
    neutral: {
      title: 'No general border priority expressed',
      meaning: 'Neutral responses leave the general balance between domestic duties and wider obligations open. The two allocations can still show how you divided a fixed budget in specific local and national roles, without establishing a universal rule.',
    },
    question: 'Would you support the same allocation if its benefit came mainly from helping others, rather than from a shared practical gain?',
  },
  'continuity-inclusion': {
    positive: {
      title: 'A shared culture that can change',
      meaning: 'Your directional answers give greater weight to revising public culture as membership changes or making room for previously absent practices or voices. The relevant emphasis depends on which statements you answered. These answers leave open whether change should replace an established program, share its space, or happen gradually.',
    },
    negative: {
      title: 'Continuity in shared cultural life',
      meaning: 'Your directional answers give greater weight to preserving inherited customs and a continuing place for established practices. The cultural cases concern the use of a limited program budget and exhibition space, not whether residents have equal legal rights or may organize their own activities.',
    },
    mixed: {
      title: 'Continuity alongside opportunities for change',
      meaning: 'Your directional answers give weight both to inherited practices and to changing representation. That combination raises a practical question about what should be protected, what should be open to revision, and who should decide; it does not identify a single pace of reform.',
    },
    neutral: {
      title: 'The general cultural priority remains open',
      meaning: 'Neutral answers do not choose a general rule for preserving or revising public traditions. The festival and exhibition decisions can show how you allocated scarce cultural space in those cases, without establishing your view of social change as a whole.',
    },
    question: 'Which part of an inherited practice deserves continuity, and what would justify changing its public support?',
  },
  'knowledge-judgment': {
    question: 'When experience, inherited practice, and publicly examined evidence conflict, how would you decide which claim should guide action?',
  },
  'care-ecological-dependence': {
    question: 'What concrete institutional responsibility follows from the care needs or ecological dependencies you recognize?',
  },
};

export const premiseMeanings = {
  'premise-personal-agency': {
    agree: 'You allow for political agency that can depart from group membership. This leaves room for dissent and self-direction while remaining compatible with the idea that social relationships influence a person.',
    disagree: 'You did not endorse independence from group membership in this formulation. The answer leaves open whether your concern is social influence, material dependence, or the extent of independence being claimed.',
  },
  'premise-social-relations': {
    agree: 'You treat relationships as part of how political interests are formed. This points toward examining social connections and dependencies when explaining interests, without denying that people can question their groups.',
    disagree: 'You did not endorse this relational account of political interests. The answer does not show whether you favor another explanation or think the statement gives relationships too broad a role.',
  },
  'premise-economic-power': {
    agree: 'You regard control of productive resources as important to explaining lasting political power. This makes ownership and economic dependence relevant questions when assessing who can influence collective decisions.',
    disagree: 'You did not give control of productive resources a central explanatory role as proposed here. That leaves room for other accounts of lasting power, but this answer does not identify which account you would use.',
  },
  'premise-ecological-dependence': {
    agree: 'You treat ecological systems as part of the conditions that sustain social life. This adds a material dependence to political explanation; it does not by itself choose an environmental policy or grant moral standing to nature.',
    disagree: 'You did not endorse the claim that understanding societies requires this ecological framing. That response does not establish indifference to environmental damage or a preferred environmental policy.',
  },
  'premise-own-good': {
    agree: 'You accept room for different ways of living under a reciprocal freedom principle. The practical boundary still depends on what respecting others means and which conditions make that freedom possible.',
    disagree: 'You did not endorse this formulation of reciprocal freedom to pursue a good life. The answer does not identify which limits, duties, or conditions you think the formulation misses.',
  },
  'premise-nondomination': {
    agree: 'You see uncontrolled power over someone as a problem for freedom even when it is not being exercised at that moment. This makes safeguards against dependence and arbitrary interference politically relevant.',
    disagree: 'You did not endorse protection from another person’s power to interfere at will as a requirement of freedom. This leaves your preferred account of freedom open, including whether you distinguish actual interference from the capacity to interfere.',
  },
  'premise-care-obligations': {
    agree: 'You recognize care dependence as a source of political obligation. This brings the needs of people receiving care and those providing it into institutional reasoning, while leaving the division of family, community, and public responsibilities open.',
    disagree: 'You did not endorse care dependence as a ground for institutional obligation in this formulation. That does not identify whether you dispute the obligation, its political form, or how responsibilities should be divided.',
  },
  'premise-inherited-obligations': {
    agree: 'You accept that some community obligations can arise without an individual choosing them. Consent is therefore not the only possible source of obligation in this answer; the content and limits of those duties remain open.',
    disagree: 'You did not accept that community membership can create obligations a person did not choose. This does not settle whether you recognize duties grounded in harm, need, reciprocity, or other reasons.',
  },
  'premise-dispersed-knowledge': {
    agree: 'You recognize a limit to what any central authority can know. That makes the use of local and distributed knowledge a coordination problem, but it does not choose between markets, public planning, or participation as the solution.',
    disagree: 'You did not endorse this stated limit on central knowledge. The answer does not establish that you favor centralized decisions; it leaves open what knowledge an authority would need and how it could obtain it.',
  },
  'premise-inherited-knowledge': {
    agree: 'You recognize that established practices may carry useful knowledge beyond what participants can fully explain. This gives inherited experience a possible evidential role without making every tradition justified or immune to criticism.',
    disagree: 'You did not endorse the proposed value of knowledge embedded in established practice. This does not establish opposition to all tradition; the disagreement may concern usefulness, explanation, or how such knowledge should be assessed.',
  },
  'premise-situated-knowledge': {
    agree: 'You recognize direct experience of exclusion as a possible source of insight that outsiders lack. This supports considering whose experience is heard, without making experience infallible or assuming everyone in a group agrees.',
    disagree: 'You did not endorse the claim that experiencing exclusion supplies knowledge outsiders may miss. The answer leaves open how you would weigh experience against other evidence or assess what an outside observer can know.',
  },
  'premise-testable-explanations': {
    agree: 'You support revising political explanations when publicly examinable evidence contradicts them. This sets a standard for explanatory claims; it does not make moral commitments reducible to empirical tests.',
    disagree: 'You did not endorse this rule for revising political explanations. The response alone cannot tell whether the issue is the rule, access to public evidence, or what you count as a political explanation.',
  },
  'premise-property-independence': {
    agree: 'You see widely distributed private property as a possible protection against dependence on government. The distribution and kind of property matter here; the answer does not settle dependence on employers or other private owners.',
    disagree: 'You did not endorse distributed private property as an important safeguard against government dependence as proposed here. This leaves open other protections for independence and does not establish opposition to all private property.',
  },
  'premise-workplace-control': {
    agree: 'You support workers having a share in major enterprise decisions. This introduces a question of decision rights inside economic institutions, beyond whether a service is publicly or privately owned; the degree and form of control remain unspecified.',
    disagree: 'You did not endorse workers sharing control of major enterprise decisions. This does not tell us what consultation, bargaining rights, or other protections you would support.',
  },
  'premise-contestable-power': {
    agree: 'You require an effective way for people to challenge decisions made by institutions with power over them. This makes accountability and avenues of appeal relevant across institutions, while leaving their form open.',
    disagree: 'You did not endorse a general requirement for effective contest of institutional decisions. The answer does not identify which institutions or decisions you would exempt, or what other safeguards you would require.',
  },
  'premise-gradual-reform': {
    agree: 'You give continuity of relied-on functions weight when changing institutions. This is a condition on how reform proceeds; it does not by itself favor retaining every existing institution or practice.',
    disagree: 'You did not endorse gradual change as the usual way to preserve relied-on functions. That leaves open which circumstances would justify faster change and does not establish a preference for disruption itself.',
  },
};

const housingMeanings = {
  sell: 'This package exchanges continuing public ownership and long-term control over rents on this site for immediate repair funding, rent assistance, and more market-rent homes. Accepting that exchange in this case does not establish a general preference to sell public assets.',
  municipal: 'This package retains public ownership and creates below-market housing while accepting a longer delivery period, fewer homes than a sale, and later funding for some repairs. It commits to continuing public control under the stated borrowing limit.',
  cooperative: 'This package combines public land ownership with cooperative housing and an affordability covenant. It limits public borrowing while accepting fewer homes and less immediate repair funding; this is a distinct institutional arrangement, not evidence of a centrist ideology.',
};

export const decisionMeanings = {
  'housing-urgent': { ...housingMeanings },
  'housing-planned': { ...housingMeanings },
  'public-assembly': {
    relocate: 'The response accepts a new location restriction on peaceful gatherings to obtain more predictable quiet. It reduces the campaign’s public visibility while retaining emergency access, an appeal route, and the three-month review.',
    conditions: 'The response preserves the visible meeting place while accepting new limits on timing and amplified sound. It combines continued access with enforceable conditions; it is not the absence of a position on freedom.',
    existing: 'The response relies on enforcing existing noise rules and rejects additional location or closing-time restrictions. It preserves more freedom of use while accepting that some lawful disruption may continue.',
  },
  'water-partnership': {
    local: 'The allocation directs the whole grant to residents within the local mandate, leaving the proposed international project unfunded by this grant. Both districts have needs, and neither faces an immediate health emergency.',
    shared: 'The allocation funds work in both districts and reserves most of the grant for local upgrades. It accepts smaller projects on each side rather than fully funding either proposal.',
    partnership: 'The allocation commits most of the grant to the joint project and knowledge exchange while retaining a smaller local program. It accepts more delayed local upgrades in a setting without an immediate health emergency.',
  },
  'community-festival': {
    established: 'The proposal protects established customs’ claim on a fixed public festival budget. New activities must seek other resources, while attendance, participation, and residents’ legal rights remain unchanged.',
    balanced: 'The proposal guarantees space for established customs and opens the rest to new activities. It manages competing claims through reserved shares, with less funding for each than it requested.',
    open: 'The proposal removes a reserved funding share for established customs and applies the same published criteria to current proposals. It allows the program to change while accepting that some long-standing activities may lose public funding.',
  },
  'service-contract': {
    contracted: 'The arrangement uses competitive selection and contract monitoring to deliver a publicly specified service. Routes, affordable fares, rights, and standards remain fixed; the change concerns who operates the service and how public oversight is exercised.',
    mixed: 'The arrangement keeps a directly operated public core and buys additional capacity through contracts. It shares operational responsibilities while accepting the administrative work of coordinating two delivery arrangements.',
    public: 'The arrangement keeps operational control, staffing, and maintenance inside the public organization. It accepts direct management responsibilities under the same budget, routes, fares, and performance standards as the alternatives.',
  },
  'community-history': {
    heritage: 'The program gives this exhibition’s limited space to continuity and deeper treatment of established themes. Newer accounts receive little space in this cycle, while membership and access remain open.',
    paired: 'The program makes established and underrepresented accounts visible together. It accepts less depth for each in exchange for shared exhibition space, under the same documentation standards and member approval.',
    'new-accounts': 'The program uses this exhibition cycle to make previously absent experiences visible. Established themes remain in the archive but wait for further work; the decision changes this association’s program, not public curriculum.',
  },
  'public-records': {
    'on-request': 'The plan preserves staff capacity for other improvements while leaving residents to identify and request additional records. It keeps all mandatory disclosures and appeal rights; it does not authorize withholding a legally required record.',
    summaries: 'The plan adds explanations and a searchable route into the records while keeping some detailed access request-based. It improves navigation without committing the staff time required for proactive publication of all eligible files.',
    proactive: 'The plan makes cleared decision material available for scrutiny without an individual request. It accepts less staff time for other optional improvements, with the same privacy checks and legal disclosure floor.',
  },
  'regional-cooperation': {
    domestic: 'The package directs this fund to immediate domestic works while retaining existing cross-border communications. It leaves the proposed joint prevention program unfunded by this contribution; it does not end all cooperation.',
    combined: 'The package combines domestic construction with a contribution to shared monitoring and prevention. It accepts reduced funding for each package instead of fully funding either proposal.',
    joint: 'The package commits most of the fund to shared prevention and upstream data access. It accepts fewer immediate domestic works while retaining a smaller domestic allocation and the same audit and approval requirements.',
  },
};
