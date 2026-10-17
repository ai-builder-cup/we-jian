const STATUSES = ['priority', 'met', 'strength', 'not-in-plan'];

// PDF p.14: the plan targets only the biggest gaps; strengths are not retrained.
export function buildPlanPhases(rows, targetJob) {
  const gaps = rows
    .filter((row) => row.status === 'priority')
    .sort((left, right) => left.priorityRank - right.priorityRank);
  const combined = { label: 'Week 4', focus: 'Combined practice', skillId: null };
  if (gaps.length >= 2) {
    return [
      { label: 'Weeks 1–2', focus: gaps[0].label, skillId: gaps[0].skillId },
      { label: 'Week 3', focus: gaps[1].label, skillId: gaps[1].skillId },
      combined,
    ];
  }
  if (gaps.length === 1) {
    return [{ label: 'Weeks 1–3', focus: gaps[0].label, skillId: gaps[0].skillId }, combined];
  }
  return [
    { label: 'Weeks 1–3', focus: `Apply your proven skills to ${targetJob} tasks`, skillId: null },
    combined,
  ];
}

export function normalizeSkillGapPlan(payload) {
  const result = payload?.result || payload;
  if (!result || typeof result.targetJob !== 'string' || !result.targetJob.trim()) {
    throw new Error('The skill-gap plan is missing its target job.');
  }
  if (!Array.isArray(result.skills) || result.skills.length === 0) {
    throw new Error('The skill-gap plan must include the skill gap table.');
  }
  const skills = result.skills.map((row) => {
    const shown = Number(row?.shown);
    const required = Number(row?.required);
    if (!row?.label || !Number.isFinite(shown) || !Number.isFinite(required) || !STATUSES.includes(row.status)) {
      throw new Error('The skill-gap plan contains an invalid skill row.');
    }
    return {
      skillId: String(row.skillId),
      label: String(row.label),
      onetElement: String(row.onetElement || ''),
      importance: Number(row.importance),
      level: Number(row.level),
      required,
      shown,
      gap: Number(row.gap),
      priority: Number(row.priority),
      priorityRank: row.priorityRank ?? null,
      status: row.status,
    };
  });

  const plan = result.plan;
  if (!plan || typeof plan.summary !== 'string' || !Array.isArray(plan.phases) || plan.phases.length === 0) {
    throw new Error('The skill-gap plan is missing its 30-day learning plan.');
  }
  const phases = plan.phases.map((phase, index) => {
    if (!phase || typeof phase.label !== 'string' || !Array.isArray(phase.actions) || phase.actions.length === 0) {
      throw new Error(`Plan step ${index + 1} is incomplete.`);
    }
    return {
      label: phase.label.trim(),
      focus: String(phase.focus || '').trim(),
      actions: phase.actions.map((action) => String(action).trim()).filter(Boolean),
    };
  });

  return {
    targetJob: result.targetJob.trim(),
    occupation: {
      code: String(result.occupation?.code || ''),
      title: String(result.occupation?.title || ''),
      source: String(result.occupation?.source || ''),
    },
    skills,
    priorityCount: skills.filter((row) => row.status === 'priority').length,
    evidence: result.evidence && typeof result.evidence.quote === 'string'
      ? {
          skillLabel: String(result.evidence.skillLabel || ''),
          quote: result.evidence.quote.trim(),
          note: String(result.evidence.note || '').trim(),
        }
      : null,
    plan: {
      summary: plan.summary.trim(),
      phases,
      note: String(plan.note || '').trim(),
    },
    isDemo: result.isDemo === true,
  };
}
