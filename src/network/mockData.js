// Dummy API responses, used only when VITE_USE_MOCK_DATA=true. Figures follow the PDF examples.

export const MOCK_CV_PROFILE = {
  summary: 'Final-year business student with part-time customer support and campus event coordination experience.',
  skills: ['Customer support', 'Communication', 'Problem solving', 'Event coordination', 'Spreadsheets'],
  experience: [
    'Part-time customer service assistant handling daily customer queries.',
    'Coordinated a campus career fair with a team of 8 volunteers.',
  ],
  education: ['Bachelor of Business Administration (final year)'],
  careerInterests: ['Customer success', 'Operations', 'People operations'],
};

export const MOCK_QUESTIONNAIRE_EXPLANATION =
  'Your strongest interests are Social and Enterprising: you may enjoy work that involves helping people and moving ideas forward. Your readiness answers show real curiosity about your options. Treat this as a starting point to explore, not a final answer.';

export const MOCK_MANAGER_FOLLOW_UP = {
  trigger: 'follow-up "why" question',
  message: 'But customers are already upset. Why is fixing the chatbot safer than switching it off until it is perfect?',
};

export const MOCK_SIMULATION_RESULT = {
  overallScore: 3.3,
  skills: [
    {
      id: 'evaluation',
      label: 'Evaluating AI output',
      score: 3,
      max: 5,
      evidence: 'the order already shipped so a full refund is not allowed',
      rationale: 'Found the refund error and one more, but missed the missing voucher in conversation 3.',
      ratingChecks: [3, 3, 4],
    },
    {
      id: 'policy',
      label: 'Attention to policy',
      score: 3,
      max: 5,
      evidence: 'offer a shipping voucher and priority delivery when it is late',
      rationale: 'Applied the refund rule; the late-delivery rule was missing the "over 3 days" condition.',
      ratingChecks: [3, 2, 3],
    },
    {
      id: 'problemSolving',
      label: 'Problem solving',
      score: 3,
      max: 5,
      evidence: 'a human should call this customer and correct the refund promise',
      rationale: 'Sensible escalation, but no risks or alternatives named.',
      ratingChecks: [3, 3, 3],
    },
    {
      id: 'communication',
      label: 'Communicating to non-technical people',
      score: 4,
      max: 5,
      evidence: 'most customers still get fast answers, we just fix the two rules it got wrong',
      rationale: 'Plain language and a clear recommendation.',
      ratingChecks: [4, 4, 4],
    },
  ],
  strongestSkills: ['Communicating to non-technical people'],
  developmentAreas: ['Evaluating AI output', 'Attention to policy', 'Problem solving'],
  distressConcern: false,
  summary:
    'Your clearest strength is explaining decisions in plain language. Next, practise checking each chatbot reply against both policy rules before deciding what to do.',
};

export const MOCK_CAREER_DIRECTIONS = {
  directions: [
    {
      rank: 1,
      title: 'Customer Success Specialist',
      match: 'High',
      interestFit: 'Social–Enterprising interests + communication 4/5',
      evidence: 'most customers still get fast answers, we just fix the two rules it got wrong',
    },
    {
      rank: 2,
      title: 'AI Quality Evaluator',
      match: 'High',
      interestFit: 'Evaluating AI output 3/5',
      evidence: 'the order already shipped so a full refund is not allowed',
    },
    {
      rank: 3,
      title: 'Account Executive (B2B)',
      match: 'Medium',
      interestFit: 'Enterprising interest + stayed calm under manager pressure',
      evidence: 'a human should call this customer and correct the refund promise',
    },
    {
      rank: 4,
      title: 'Talent Acquisition (HR)',
      match: 'Medium',
      interestFit: 'Social interest + communication 4/5',
      evidence: 'Coordinated a campus career fair with a team of 8 volunteers.',
    },
    {
      rank: 5,
      title: 'Community & Partnerships',
      match: 'Medium',
      interestFit: 'Social–Enterprising interests',
      evidence: 'Customer success',
    },
  ],
  exploreMore: [
    'Customer Experience Associate',
    'Client Onboarding Specialist',
    'Recruitment Coordinator',
    'People Operations Assistant',
    'Learning & Development Coordinator',
    'Student Success Advisor',
    'Sales Development Representative',
    'Community Manager',
    'Event Coordinator',
    'Partnerships Associate',
    'Service Operations Associate',
    'Project Coordinator',
    'UX Research Assistant',
    'Market Research Assistant',
    'Technical Support Specialist',
  ],
  rankingBasis: [
    'Interests from the questionnaire (RIASEC)',
    'Skill scores from the simulation',
    'Each job’s requirements from ISCO-08 and O*NET data',
  ],
  baziNote: 'Shown alongside; never affects the ranking.',
  isDemo: true,
};

export const MOCK_SKILL_GAP_PLAN = {
  targetJob: 'Customer Success Specialist',
  occupation: {
    code: '43-4051.00',
    title: 'Customer Service Representatives',
    source: 'Example values from the PDF (p.15); real values come from the O*NET database.',
  },
  skills: [
    { skillId: 'evaluation', label: 'Evaluating AI output', onetElement: 'Critical Thinking', importance: 3.9, level: 3.6, required: 3, shown: 3, gap: 0, priority: 0, status: 'met', priorityRank: null },
    { skillId: 'policy', label: 'Attention to policy', onetElement: 'Judgment and Decision Making', importance: 3.8, level: 4.5, required: 4, shown: 3, gap: 1, priority: 3.8, status: 'priority', priorityRank: 1 },
    { skillId: 'problemSolving', label: 'Problem solving', onetElement: 'Complex Problem Solving', importance: 3.5, level: 4.4, required: 4, shown: 3, gap: 1, priority: 3.5, status: 'priority', priorityRank: 2 },
    { skillId: 'communication', label: 'Communicating to non-technical people', onetElement: 'Speaking', importance: 4.2, level: 4.6, required: 4, shown: 4, gap: 0, priority: 0, status: 'strength', priorityRank: null },
  ],
  evidence: {
    skillLabel: 'Attention to policy',
    quote: 'offer a shipping voucher and priority delivery when it is late',
    note: 'Policy only allows the voucher when an order is more than 3 days late.',
  },
  plan: {
    summary: 'Four weeks to sharpen policy checks and problem solving, then one mini simulation before you re-simulate.',
    phases: [
      { label: 'Weeks 1–2', focus: 'Attention to policy', actions: ['Check 10 customer cases against the SOP and flag the violations.'] },
      { label: 'Week 3', focus: 'Problem solving', actions: ['Write 2 alternative solutions for each complaint, with their risks.'] },
      { label: 'Week 4', focus: 'Combined practice', actions: ['One mini simulation, then ready to re-simulate.'] },
    ],
    note: 'The plan targets only the biggest gaps. Strengths are not retrained.',
  },
  isDemo: true,
};
