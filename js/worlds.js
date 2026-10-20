/**
 * Authored fictional setting briefs for instrument 0.2.0.
 * These working drafts are not country simulations or descriptions of populations.
 * Scenario permissions are stipulated for the fictional task, not claims about
 * present-day law in the country that inspired a setting. External review is pending.
 */

const notes = (housing, other) => ({
  'housing-urgent': housing,
  'housing-planned': housing,
  ...other,
});

export const worlds = [
  {
    id: 'linden',
    name: 'Linden Federation',
    code: 'Lf',
    inspiration: 'A fictional setting inspired by Germany',
    summary: 'A federal parliamentary republic with coalition government, substantial regional powers, and experienced municipal services. Growing cities face housing pressure while some rural districts face longer journeys to services. Residents disagree about spending, development, and how much responsibility each level of government should carry.',
    institutions: [
      { label: 'Government', text: 'A coalition cabinet answers to parliament. Regional governments hold their own responsibilities, and national decisions often require negotiation across levels.' },
      { label: 'Local authority', text: 'Municipal councils approve local budgets. Local leaders propose policy within national law and regional financial oversight.' },
      { label: 'Participation and review', text: 'Residents can organize, petition, and seek independent review. Participation is uneven, and established organizations do not speak for everyone.' },
      { label: 'Resources and variation', text: 'Capable administration coexists with unequal local finances. City growth and rural service access create different priorities within the same federation.' },
    ],
    scenarioNotes: notes(
      'The municipal council must approve your housing proposal, and regional oversight applies to borrowing. The depot is already publicly owned. The same ownership, financing permissions, and approval route apply in both versions of this case.',
      {
        'public-assembly': 'The municipality has a fictional regional authorization to choose among the stated gathering rules. Every option preserves emergency access and an independent appeal; your role is to submit a resident response, not issue a restriction.',
        'water-partnership': 'The rural district council has an approved grant that expressly permits the proposed overseas partnership. Regional auditors review the accounts. Negotiation with neighboring municipalities does not change the budget stated in the case.',
        'community-festival': 'An appointed municipal festival committee receives resident proposals before the council approves funding. Regional cultural support is fixed for this exercise. Long-standing associations, newer residents, and younger people disagree about the program.',
        'service-contract': 'You work in a district service office with delegated authority to compare delivery methods within an approved budget. Procurement review applies to contracted and public options alike; the choice cannot change eligibility for the service.',
        'community-history': 'Your independent association uses its own member-approved exhibition budget. Members, including established and newer residents, approve the program. Its mandate does not give you authority over municipal funds or public curriculum.',
        'public-records': 'Your office has a common legal disclosure floor and an independent review route. The exercise concerns additional access above that floor, under an express regional authorization; no option allows withholding legally required records.',
        'regional-cooperation': 'As head of the coalition cabinet, you recommend an authorized flood-investment package to parliament. Regional governments administer rural projects. The case fixes their agreement and the total budget so the remaining choice concerns allocation.',
      },
    ),
  },
  {
    id: 'alder',
    name: 'Union of Alder',
    code: 'Ua',
    inspiration: 'A fictional setting inspired by the United States',
    summary: 'A federal presidential republic with separately elected national branches, strong state governments, and varied local services. Expanding cities face housing pressure while rural counties debate service access and development. Active civic organizations coexist with differences in wealth, participation, and views about public responsibility.',
    institutions: [
      { label: 'Government', text: 'A separately elected executive and legislature share national power. States retain substantial responsibilities and can adopt different approaches within common national rules.' },
      { label: 'Local authority', text: 'City and county councils approve local budgets. Local leaders work within state law, delegated powers, and financial oversight.' },
      { label: 'Participation and review', text: 'Residents can organize, petition, and challenge decisions through independent review. Access to time, information, and legal help varies between communities.' },
      { label: 'Resources and variation', text: 'Local organizations and technical expertise are significant strengths. Uneven tax bases and distances between rural settlements complicate equal service access.' },
    ],
    scenarioNotes: notes(
      'The city council must approve your housing proposal, and state oversight applies to borrowing. The depot is already publicly owned. The same ownership, financing permissions, and approval route apply in both versions of this case.',
      {
        'public-assembly': 'For this fictional case, state law permits the listed time, noise, and location packages subject to an independent appeal. You are a resident responding to consultation. No option gives you authority to regulate gatherings yourself.',
        'water-partnership': 'The county council has a grant that expressly permits either domestic work or the proposed international partnership. State financial review applies to every package. Other county revenues cannot supplement the fixed grant in this exercise.',
        'community-festival': 'A local committee recommends the publicly funded festival program to the council. Its consultation includes long-standing groups, newer residents, and younger participants. Private events remain possible under every package.',
        'service-contract': 'You work in a county service department under a written delegation to choose between the stated delivery arrangements. The same eligibility, audit, and performance requirements apply whether the provider is public or contracted.',
        'community-history': 'Your independent civic association controls its exhibition through its member mandate. City officials cannot select the theme in this exercise. Members disagree about how inherited narratives and newer experiences should share the space.',
        'public-records': 'State rules establish a disclosure floor and an independent review route. Your delegated choice concerns additional publication or supported access above that floor. Every option must still meet legal disclosure duties.',
        'regional-cooperation': 'As national executive, you propose one of the authorized flood packages to the legislature. State and rural delivery partners have accepted the stated conditions. Funding approval, rather than unilateral spending power, remains with the legislature.',
      },
    ),
  },
  {
    id: 'mere',
    name: 'Kingdom of Mere',
    code: 'Km',
    inspiration: 'A fictional setting inspired by the United Kingdom',
    summary: 'A parliamentary constitutional monarchy with devolved institutions and elected local councils. Dense city regions and dispersed rural communities depend on different combinations of local and national services. Experienced public institutions and voluntary groups face funding pressures, while residents disagree about devolution, public provision, and cultural change.',
    institutions: [
      { label: 'Government', text: 'The cabinet governs through parliamentary confidence. A ceremonial monarch does not make the policy decisions in these scenarios. Devolved administrations hold specified powers.' },
      { label: 'Local authority', text: 'Councils make local decisions within delegated powers. Funding conditions and borrowing approvals involve the relevant national or devolved administration.' },
      { label: 'Participation and review', text: 'Residents use consultations, associations, elected representatives, and review procedures. The ability to take part varies with time, distance, and access to information.' },
      { label: 'Resources and variation', text: 'Established service networks coexist with regional inequality. Urban housing demand and rural transport distances produce competing demands for limited public funds.' },
    ],
    scenarioNotes: notes(
      'Your local council must approve the housing proposal under a fictional delegated land-and-finance authorization. The depot is publicly owned and all packages meet its conditions. This authorization and approval process are identical in both versions.',
      {
        'public-assembly': 'The local council has express authority in this fictional consultation to consider the listed gathering packages. Every package retains emergency access and independent review. Your response is advisory; it does not direct police or council officers.',
        'water-partnership': 'The relevant devolved administration has approved a rural council grant that includes the overseas partnership as an eligible use. Council approval and published accounts are required for all packages, without changing their stated cost.',
        'community-festival': 'The festival committee makes a recommendation through the local council’s published funding process. The case concerns a local civic event, not a royal or national ceremony. Established and newer residents can submit proposals.',
        'service-contract': 'You work for a rural council under a written service-management delegation. The council has already authorized both public delivery and procurement within the stated budget; your decision cannot alter the statutory entitlement being delivered.',
        'community-history': 'Your membership association has editorial responsibility within its inclusive history mission and own fixed budget. Members approve the program. The member mandate, rather than cabinet or council preference, sets your responsibilities.',
        'public-records': 'Your service office must meet the same fictional disclosure floor under every option. An independent review route remains available. The delegated choice concerns how much additional access to provide and how to organize it.',
        'regional-cooperation': 'As head of the cabinet, you recommend an authorized flood-investment package for parliamentary approval. Relevant devolved administrations have accepted the delivery arrangements. The ceremonial monarch plays no part in choosing the allocation.',
      },
    ),
  },
  {
    id: 'hoshima',
    name: 'Hoshima',
    code: 'Ho',
    inspiration: 'A fictional setting inspired by Japan',
    summary: 'A parliamentary constitutional monarchy with national ministries, regional administrations, and elected local councils. Major urban centers attract people and investment while some rural communities adapt to an aging population. Strong technical and disaster-planning networks coexist with unequal local capacity and debates about continuity, participation, and development.',
    institutions: [
      { label: 'Government', text: 'A cabinet answers to parliament, and the monarch has a ceremonial role. National ministries coordinate major programs with regional and municipal institutions.' },
      { label: 'Local authority', text: 'Local executives propose budgets to councils. Regional and national standards shape borrowing, procurement, and service obligations.' },
      { label: 'Participation and review', text: 'Residents organize through many kinds of association and can seek review of official decisions. Generational and regional differences shape who participates and what they prioritize.' },
      { label: 'Resources and variation', text: 'Technical expertise and established infrastructure are strengths. Metropolitan demand, rural distance, and demographic change create different pressures on public resources.' },
    ],
    scenarioNotes: notes(
      'The municipal council must approve the housing package under a fictional regional financing authorization. The publicly owned depot has no unresolved land claims in this case. The same approval, finance, and ownership assumptions apply in both versions.',
      {
        'public-assembly': 'A temporary local consultation explicitly permits the listed gathering-rule proposals, each with emergency access and independent review. Residents and organizers have differing views; no shared national attitude toward public dissent is assumed.',
        'water-partnership': 'A rural municipality has an earmarked grant whose rules permit the overseas water partnership. Regional technical officers have assessed every package as feasible. You recommend an allocation; the council retains approval authority.',
        'community-festival': 'A municipal festival committee invites residents to propose how a fixed civic budget should be used. Participation by established neighborhood groups is important but does not settle the views of younger or newer residents.',
        'service-contract': 'You administer a rural service under an express delegation that permits all listed delivery arrangements. Regional performance standards remain fixed. The exercise does not ask you to infer that public employees must prefer a particular provider.',
        'community-history': 'Your independent urban association is responsible to its members for the exhibition theme. A venue agreement protects its editorial discretion. Members differ in how they interpret local history, migration, and generational change.',
        'public-records': 'Your office has an explicit authorization for discretionary access above the common legal minimum. Required disclosure and independent review remain fixed. Administrative convenience alone cannot remove the rights stipulated in the scenario.',
        'regional-cooperation': 'For this invented case, Hoshima shares one island with a neighboring state, and a river catchment crosses their border. This task-specific geography does not describe Japan. As cabinet leader, you recommend a flood-investment allocation to parliament within a previously approved international cooperation framework. Regional rural authorities have accepted the listed delivery terms. Technical preparedness does not determine which allocation you must prefer.',
      },
    ),
  },
  {
    id: 'namoa',
    name: 'Namoa Republic',
    code: 'Nr',
    inspiration: 'A fictional setting inspired by Fiji',
    summary: 'A parliamentary island republic whose communities differ in language, land relationships, livelihoods, and access to services. The capital region faces housing demand while outer islands face transport costs and climate exposure. Community networks and practical adaptation are strengths, alongside disagreements about representation, land use, and investment priorities.',
    institutions: [
      { label: 'Government', text: 'A cabinet answers to parliament. National agencies work with local councils and community institutions, whose responsibilities and memberships are not identical.' },
      { label: 'Local authority', text: 'Local budgets require council approval and national financial oversight. Customary land interests must be considered where relevant; publicly owned sites are identified explicitly in the scenarios.' },
      { label: 'Participation and review', text: 'Residents participate through civic organizations, councils, and community forums. These bodies contain differing interests, and none is assumed to represent every member of a cultural group.' },
      { label: 'Resources and variation', text: 'Strong local networks coexist with costly inter-island travel and uneven infrastructure. Climate risks matter, but communities also debate everyday services, culture, and economic opportunity.' },
    ],
    scenarioNotes: notes(
      'The depot is already publicly owned, and relevant land permissions are settled for every listed package in this fictional case. Council approval and national borrowing oversight still apply. These land and finance assumptions are identical in both versions.',
      {
        'public-assembly': 'The capital-region council is consulting on the stated lawful gathering packages. Its fictional authorization preserves emergency access and an independent appeal. No choice determines which community is entitled to speak or participate.',
        'water-partnership': 'The rural district’s grant explicitly permits partnership with another island district abroad. Delivery and transport costs are already included in the equal-budget packages. Neither community’s cultural identity determines which allocation you should favor.',
        'community-festival': 'A publicly funded local festival has a committee that must consider proposals from all residents. The case does not assign a single view to any language or community group. Privately supported events remain possible.',
        'service-contract': 'You manage a rural service under a delegation allowing the stated public and contracted arrangements. Transport and access requirements have already been assessed for each. Every option preserves the same service eligibility and appeal rights.',
        'community-history': 'Your independent urban association includes members with different family histories and community ties. It has permission to choose among all exhibition themes under its member mandate. No customary or state institution selects the answer for you.',
        'public-records': 'An express administrative authorization allows the listed levels of additional access above a shared disclosure floor. The case includes a review route under every option, and required records cannot be withheld because travel to the office is difficult.',
        'regional-cooperation': 'For this invented case, Namoa shares one island with a neighboring state, and a river catchment crosses their border. This task-specific geography does not describe Fiji. As cabinet leader, you recommend an authorized flood-investment allocation for parliamentary approval. Island and rural delivery partners have accepted the scenario’s terms. Geography explains delivery conditions, but does not predetermine the domestic or international priority.',
      },
    ),
  },
  {
    id: 'anbinh',
    name: 'An Binh Republic',
    code: 'Ab',
    inspiration: 'A fictional setting inspired by Viet Nam',
    summary: 'A single-party republic with national planning institutions, provincial administrations, and local councils. Industrial cities face housing and environmental pressures while rural areas have varied access to services and changing livelihoods. Administrative coordination and local associations support development, alongside disagreements about land use, representation, and how priorities should be set.',
    institutions: [
      { label: 'Government', text: 'Party institutions shape national direction. The cabinet, legislature, and provincial administrations have distinct formal responsibilities within that governing framework.' },
      { label: 'Local authority', text: 'Local councils and administrative leaders work within provincial and national authorizations. A power granted in a scenario is specific to that fictional decision, not a general claim about local autonomy.' },
      { label: 'Participation and review', text: 'Residents use local consultations, associations, representatives, and complaint procedures. Available channels and their limits are stated for each case; residents are not assumed to share the governing institutions’ preferences.' },
      { label: 'Resources and variation', text: 'Administrative coordination and active community networks coexist with uneven local resources. Industrial growth, migration, agriculture, and service access create different urban and rural priorities.' },
    ],
    scenarioNotes: notes(
      'A fictional provincial pilot expressly authorizes all three packages for this publicly owned depot, including the listed financing. The local council must approve the recommendation within provincial oversight. The pilot authorization is identical in both versions.',
      {
        'public-assembly': 'This fictional local consultation expressly protects the described peaceful campaign and permits all listed regulatory packages, with the stipulated appeal route. Those task permissions are not a statement about assembly law in present-day Viet Nam.',
        'water-partnership': 'Provincial and national agencies have already authorized the rural district’s grant to fund either domestic work or the named overseas partnership. All packages satisfy that authorization. You cannot infer permission for unrelated international spending.',
        'community-festival': 'The local council has authorized a resident consultation on this civic festival’s program. An appointed committee reviews submissions under the same published criteria. This task gives residents a proposal channel, not final control of the public budget.',
        'service-contract': 'You are a non-elected district officer with a written provincial delegation to select among the stated service arrangements. Eligibility, procurement safeguards, and review remain fixed. Following those duties is separate from endorsing a political system.',
        'community-history': 'Your registered civic association has express permission to select any listed exhibition theme through its member process. The exercise grants that limited editorial discretion; it does not imply unrestricted authority over unrelated public exhibitions.',
        'public-records': 'A fictional administrative pilot expressly permits the listed access choices above a common disclosure minimum. Each retains the same complaint and review procedure. These are stipulated task rules rather than a claim about current national disclosure law.',
        'regional-cooperation': 'As cabinet leader, you propose an allocation inside an already authorized flood-cooperation program. Required party-policy, legislative, and provincial approvals remain part of implementation under every option. You do not personally bypass those institutions.',
      },
    ),
  },
  {
    id: 'suryan',
    name: 'Suryan Federation',
    code: 'Sf',
    inspiration: 'A fictional setting inspired by India',
    summary: 'A federal parliamentary republic with strong state institutions, multiple languages, and varied local administrations. Fast-growing cities and rural districts face different service and infrastructure needs. Civic organizations, technical expertise, and electoral participation coexist with unequal resources and disagreement about development, identity, and public responsibility.',
    institutions: [
      { label: 'Government', text: 'The national cabinet answers to parliament. State governments have important powers, and national programs often depend on cooperation with state and local institutions.' },
      { label: 'Local authority', text: 'Urban and rural councils work within state law and delegated budgets. Their actual capacity differs, so each scenario states the resources and authority available for that task.' },
      { label: 'Participation and review', text: 'Residents organize through diverse civic, occupational, linguistic, and community groups and can use review procedures. No group is assumed to hold one view or represent all its members.' },
      { label: 'Resources and variation', text: 'Strong technical and community networks coexist with uneven infrastructure and administrative capacity. Language access, urban growth, and rural distance influence how public services reach people.' },
    ],
    scenarioNotes: notes(
      'The city council recommends and approves the housing package under an express state authorization. Public ownership of the depot and the stated financing permissions are settled for this case. These assumptions remain identical across both versions.',
      {
        'public-assembly': 'The state has expressly authorized the listed municipal gathering packages for this fictional consultation, subject to emergency access and independent review. Residents and organizers are internally diverse; language or community membership does not imply a preferred answer.',
        'water-partnership': 'The rural council’s grant has state and national authorization for the proposed overseas partnership as well as local work. All packages include the access and delivery costs described in the case and must publish the same audited accounts.',
        'community-festival': 'The festival committee invites proposals under the council’s civic funding rules. The scenario does not equate an established custom with a whole religious or linguistic community, and every option preserves equal attendance and participation rights.',
        'service-contract': 'You administer a rural service with a state-approved delegation covering the listed delivery options. Language access and service eligibility are fixed requirements for all providers. You cannot trade those protections for a cheaper arrangement.',
        'community-history': 'Your independent urban association is accountable to a membership containing differing languages, generations, and histories. Its venue agreement permits every proposed theme. No member category is assumed to speak with a single political voice.',
        'public-records': 'Your office has the same fictional legal disclosure floor under all options, with an independent review route. An explicit state authorization permits additional access. Required language support is included in the case’s resource assumptions.',
        'regional-cooperation': 'As national cabinet leader, you recommend an authorized flood package to parliament. Participating states have accepted the delivery arrangements for affected rural districts. The allocation does not give you power to override unrelated state responsibilities.',
      },
    ),
  },
  {
    id: 'mbala',
    name: 'Republic of Mbala',
    code: 'Rm',
    inspiration: 'A fictional setting inspired by the Central African Republic',
    summary: 'A presidential republic where national institutions, local administrations, and community organizations are rebuilding public services. The capital has denser administrative networks than many rural districts, whose access and security conditions vary. Local knowledge and civic cooperation are strengths, while residents disagree about resource distribution, development, cultural life, and how to rebuild trust.',
    institutions: [
      { label: 'Government', text: 'A national executive works with a legislature and territorial administrations. Formal responsibilities and actual delivery capacity can differ across places; the cases identify the authority and resources available.' },
      { label: 'Local authority', text: 'Local leaders work through councils and national authorizations. For the selected cases, funding and delivery arrangements are specified so every listed option is feasible.' },
      { label: 'Participation and review', text: 'Community organizations, local forums, and official procedures provide channels for participation. The scenario states which review routes are functioning; no community is assumed to be politically uniform.' },
      { label: 'Resources and variation', text: 'Local expertise and cooperation support service recovery. Infrastructure, distance, and security conditions vary; neither the capital nor rural communities are defined only by conflict or institutional weakness.' },
    ],
    scenarioNotes: notes(
      'For this fictional city case, the depot has verified public ownership and a funded authorization makes every listed package feasible. Council approval and national finance review apply. These verified land, funding, and delivery assumptions are identical in both versions.',
      {
        'public-assembly': 'The selected city neighborhood has a functioning consultation and review process for the listed peaceful-gathering rules. Every proposal is authorized for this task. Conditions in this neighborhood do not describe security or participation throughout the republic.',
        'water-partnership': 'The selected rural district has verified access, a ring-fenced grant, and an authorized overseas partner. Delivery checks make all listed allocations feasible. The exercise concerns distribution of that grant, not assumptions about aid dependence or local competence.',
        'community-festival': 'A local civic committee and council have an operating public-budget process for this festival. Residents have different interests in heritage and newer activities. The case concerns ordinary cultural funding, without assigning a single tradition or view to the whole republic.',
        'service-contract': 'You work in a rural district where delivery access and provider capacity have been checked. A written authorization permits all listed service arrangements within the funded budget. The common eligibility and review requirements remain enforceable under each option.',
        'community-history': 'Your independent urban association has a secure venue, a defined member mandate, and permission for each exhibition theme. Its members bring differing experiences of civic life. The choice is not a test of loyalty to a national or community narrative.',
        'public-records': 'The selected office has functioning records and a review mechanism for the exercise. A funded administrative authorization permits each listed level of additional access above the common minimum. You should not infer that every office has the same capacity.',
        'regional-cooperation': 'As national executive, you propose one authorized flood-investment package to the legislature. Delivery partners have verified access to the selected rural projects under every option. This defined capacity does not imply uniform conditions across the country.',
      },
    ),
  },
];
