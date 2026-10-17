import { useCallback, useEffect, useState } from 'react';
import { careerDirectionsApi } from '../network/careerDirectionsApi.js';
import { normalizeCareerDirections } from '../business/careerDirectionsService.js';
import {
  getCareerDirections,
  getCvProfile,
  getQuestionnaireResult,
  getSimulationResult,
  getTargetDirection,
  saveCareerDirections,
  saveTargetDirection,
} from '../business/workflowService.js';

export function useCareerDirectionsPresenter() {
  const [state, setState] = useState({ status: 'loading', recommendations: null, error: '' });
  const [selected, setSelected] = useState(() => getTargetDirection());
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const cached = getCareerDirections();
    if (cached && attempt === 0) {
      setState({ status: 'ready', recommendations: cached, error: '' });
      setSelected((current) => current || cached.directions[0]?.title || null);
      return () => { active = false; };
    }
    const questionnaireResult = getQuestionnaireResult();
    const simulationResult = getSimulationResult();
    if (!questionnaireResult || !simulationResult) {
      setState({
        status: 'error',
        recommendations: null,
        error: 'Complete the questionnaire and work simulation to see your career directions.',
      });
      return () => { active = false; };
    }

    setState({ status: 'loading', recommendations: null, error: '' });
    careerDirectionsApi
      .getRecommendations(questionnaireResult, simulationResult, getCvProfile())
      .then(normalizeCareerDirections)
      .then((recommendations) => {
        if (!active) return;
        saveCareerDirections(recommendations);
        setSelected(recommendations.directions[0]?.title || null);
        setState({ status: 'ready', recommendations, error: '' });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', recommendations: null, error: error.message });
      });

    return () => { active = false; };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const confirmSelection = useCallback(() => {
    if (selected) saveTargetDirection(selected);
  }, [selected]);

  return { ...state, selected, select: setSelected, confirmSelection, retry };
}
