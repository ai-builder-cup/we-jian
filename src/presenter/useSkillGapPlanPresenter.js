import { useCallback, useEffect, useState } from 'react';
import { skillGapPlanApi } from '../network/skillGapPlanApi.js';
import { normalizeSkillGapPlan } from '../business/skillGapPlanService.js';
import {
  getCvProfile,
  getQuestionnaireResult,
  getSimulationResult,
  getSkillGapPlan,
  getTargetDirection,
  saveSkillGapPlan,
} from '../business/workflowService.js';

export function useSkillGapPlanPresenter() {
  const [state, setState] = useState({ status: 'loading', plan: null, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const targetJob = getTargetDirection();
    const cached = getSkillGapPlan();
    if (cached && cached.targetJob === targetJob && attempt === 0) {
      setState({ status: 'ready', plan: cached, error: '' });
      return () => { active = false; };
    }
    const questionnaireResult = getQuestionnaireResult();
    const simulationResult = getSimulationResult();
    if (!targetJob || !questionnaireResult || !simulationResult) {
      setState({ status: 'error', plan: null, error: 'Choose a career direction first to see your skill gap and 30-day plan.' });
      return () => { active = false; };
    }

    setState({ status: 'loading', plan: null, error: '' });
    skillGapPlanApi
      .getPlan({ targetJob, questionnaireResult, simulationResult, cvProfile: getCvProfile() })
      .then(normalizeSkillGapPlan)
      .then((plan) => {
        if (!active) return;
        saveSkillGapPlan(plan);
        setState({ status: 'ready', plan, error: '' });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', plan: null, error: error.message });
      });

    return () => { active = false; };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}
