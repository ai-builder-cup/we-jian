// Fixed scenario and rubric (PDF p.12 and p.20): the same for every student.
// Gemini only plays the manager (choosing triggers from this list) and grades against this rubric.

export const SIMULATION_SKILLS = [
  { id: 'evaluation', label: 'Evaluating AI output', onetElement: 'Critical Thinking' },
  { id: 'policy', label: 'Attention to policy', onetElement: 'Judgment and Decision Making' },
  { id: 'problemSolving', label: 'Problem solving', onetElement: 'Complex Problem Solving' },
  { id: 'communication', label: 'Communicating to non-technical people', onetElement: 'Speaking' },
];

export const MANAGER_TRIGGERS = [
  'follow-up "why" question',
  'conflicting information',
  'incomplete data',
  'time pressure',
  'skeptical manager',
];

export const SAFETY_POLICY = {
  maximumIntensity: 'moderate',
  prohibitedTopics: ['personal attacks', 'ethnic identity', 'religious identity', 'racial identity'],
  debriefRequired: true,
};

export const SIMULATION_SCENARIO = {
  id: 'ai-quality-evaluator-v1',
  title: 'AI Quality Evaluator',
  durationMinutes: 15,
  policy: [
    'Full refund only if the item has not shipped.',
    'Over 3 days late: shipping voucher + priority delivery.',
  ],
  conversations: [
    {
      id: 'conversation-1',
      customer: 'My order is 5 days late and already shipped. I want a refund.',
      chatbot: "Of course, we'll process a full refund today.",
    },
    {
      id: 'conversation-2',
      customer: 'My package is 2 days late. Can you send it faster?',
      chatbot: "I've added a shipping voucher and priority delivery for you.",
    },
    {
      id: 'conversation-3',
      customer: "It's been 5 days and my order still hasn't shipped. What can you do?",
      chatbot: 'I can process a refund. There is nothing else I can offer.',
    },
  ],
  tasks: [
    {
      id: 'review-conversations',
      title: 'Find errors in 3 chatbot conversations',
      instruction: 'Compare the chatbot reply with the policy. What did it get wrong, and what should it have done?',
    },
    {
      id: 'escalation-decision',
      title: 'Decide which to escalate to a human',
      instruction: 'Pick the conversations a human agent should take over, then explain your reasoning.',
    },
    {
      id: 'rewrite-instructions',
      title: 'Write improved chatbot instructions',
      instruction: 'Write short instructions that would stop the chatbot from repeating these mistakes.',
    },
    {
      id: 'manager-explanation',
      title: 'Explain to a non-technical manager',
      instruction: 'Your manager has a question. Answer in plain language, without technical terms.',
      managerOpening: 'Why not just shut the chatbot down?',
    },
  ],
  rubric: {
    evaluation:
      'Errors to find: (1) conversation 1 promised a full refund although the item has shipped; it should offer a shipping voucher + priority delivery because it is over 3 days late. (2) conversation 2 gave a voucher + priority delivery although 2 days late is not over 3 days. (3) conversation 3 correctly allows a refund (not shipped) but missed the voucher + priority delivery for being over 3 days late. 5 = all three errors and correct fixes; 4 = all three errors, a fix incomplete; 3 = two errors; 2 = one error; 1 = none.',
    policy:
      'Applies both rules precisely across the reviews, escalation reasoning, and rewritten instructions. 5 = both rules stated and applied correctly with no contradictions; 3 = one rule applied correctly or minor inaccuracies; 1 = contradicts the policy, e.g. approves a refund for a shipped item.',
    problemSolving:
      'Escalation decision and reasoning. 5 = escalates where a customer received a wrong promise or needs a correction a human should handle, keeps the chatbot running with fixes rather than an all-or-nothing response, and names risks and a next step; 3 = reasonable choice with thin reasoning; 1 = unsafe choice or no reasoning.',
    communication:
      'Manager explanation and follow-up reply. 5 = plain language, no jargon, a clear recommendation and next step, calmly addresses the concern; 3 = understandable but vague or partly technical; 1 = unclear or does not answer the question.',
  },
};

export const SIMULATION_TASK_IDS = SIMULATION_SCENARIO.tasks.map((task) => task.id);
