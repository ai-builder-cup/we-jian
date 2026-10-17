import { useCallback, useMemo, useState } from 'react';
import { workflowApi } from '../network/workflowApi.js';
import {
  clearSimulationDraft,
  emptySimulationAnswers,
  getSimulationDraft,
  isConversationReviewed,
  isSimulationTaskComplete,
  normalizeSimulationResult,
  saveSimulationDraft,
} from '../business/workSimulationService.js';
import {
  completeProcess,
  getQuestionnaireResult,
  saveSimulationResult,
} from '../business/workflowService.js';

function buildSteps(session) {
  if (!session) return [];
  return session.tasks.flatMap((task, taskIndex) => (
    task.id === 'review-conversations'
      ? session.conversations.map((_, conversationIndex) => ({ taskIndex, conversationIndex }))
      : [{ taskIndex, conversationIndex: null }]
  ));
}

function normalizeSession(payload) {
  if (
    !payload?.id ||
    !Array.isArray(payload.tasks) || payload.tasks.length !== 4 ||
    !Array.isArray(payload.conversations) || payload.conversations.length !== 3 ||
    !Array.isArray(payload.policy) || payload.policy.length === 0 ||
    !Array.isArray(payload.skills) ||
    payload.safetyPolicy?.maximumIntensity !== 'moderate'
  ) {
    throw new Error('The simulation API returned an incomplete scenario.');
  }
  return payload;
}

export function useWorkSimulationPresenter() {
  const initialDraft = useMemo(() => getSimulationDraft(), []);
  const [session, setSession] = useState(initialDraft?.session || null);
  const [answers, setAnswers] = useState(initialDraft?.answers || emptySimulationAnswers);
  const [stepIndex, setStepIndex] = useState(initialDraft?.stepIndex || 0);
  const [phase, setPhase] = useState('intro');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const steps = useMemo(() => buildSteps(session), [session]);
  const step = steps[stepIndex] || null;
  const task = step ? session.tasks[step.taskIndex] : null;
  const conversation = step?.conversationIndex != null ? session.conversations[step.conversationIndex] : null;

  const persist = useCallback((nextSession, nextAnswers, nextStepIndex) => {
    saveSimulationDraft({ session: nextSession, answers: nextAnswers, stepIndex: nextStepIndex });
  }, []);

  const begin = useCallback(async () => {
    if (session) {
      setPhase('active');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const created = normalizeSession(
        await workflowApi.startWorkSimulation(getQuestionnaireResult()?.interestCode || ''),
      );
      const firstAnswers = emptySimulationAnswers();
      setSession(created);
      setAnswers(firstAnswers);
      setStepIndex(0);
      persist(created, firstAnswers, 0);
      setPhase('active');
      setStatus('idle');
    } catch (startError) {
      setError(startError.message);
      setStatus('idle');
    }
  }, [persist, session]);

  const updateAnswer = useCallback((taskId, update) => {
    setAnswers((current) => {
      const next = { ...current, [taskId]: { ...current[taskId], ...update } };
      if (session) persist(session, next, stepIndex);
      return next;
    });
    setError('');
  }, [persist, session, stepIndex]);

  const canContinue = !task
    ? false
    : conversation
      ? isConversationReviewed(answers[task.id], conversation.id)
      : isSimulationTaskComplete(task.id, answers[task.id]);

  const askManager = useCallback(async () => {
    const explanation = answers['manager-explanation'].explanation;
    if (!explanation.trim()) return;
    setStatus('asking');
    setError('');
    try {
      const followUp = await workflowApi.askManager(session.id, explanation);
      if (!followUp?.message) throw new Error('The manager did not reply. Please try again.');
      updateAnswer('manager-explanation', { followUp, followUpReply: '' });
    } catch (askError) {
      setError(askError.message);
    } finally {
      setStatus('idle');
    }
  }, [answers, session, updateAnswer]);

  const back = useCallback(() => {
    setError('');
    if (stepIndex === 0) {
      setPhase('intro');
      return;
    }
    setStepIndex(stepIndex - 1);
    persist(session, answers, stepIndex - 1);
  }, [answers, persist, session, stepIndex]);

  const next = useCallback(async () => {
    if (!canContinue) return;
    setError('');
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      persist(session, answers, stepIndex + 1);
      return;
    }

    setStatus('submitting');
    try {
      const payload = await workflowApi.submitWorkSimulation(session.id, answers);
      if (payload?.completed !== true) {
        throw new Error('The simulation API did not confirm your submission.');
      }
      const scored = { ...normalizeSimulationResult(payload), isDemo: payload.result?.isDemo === true };
      saveSimulationResult(scored);
      completeProcess('work-simulation');
      clearSimulationDraft();
      setResult(scored);
      setPhase('results');
      setStatus('idle');
    } catch (submitError) {
      setError(submitError.message);
      setStatus('idle');
    }
  }, [answers, canContinue, persist, session, stepIndex, steps.length]);

  // Sidebar state per task: done, current, or upcoming.
  const taskStates = (session?.tasks || []).map((item, index) => {
    if (step && index === step.taskIndex) return 'current';
    return isSimulationTaskComplete(item.id, answers[item.id]) ? 'done' : 'upcoming';
  });

  return {
    answers,
    askManager,
    back,
    begin,
    canContinue,
    conversation,
    error,
    hasDraft: Boolean(session),
    isDemo: session?.isDemo === true,
    next,
    phase,
    result,
    session,
    status,
    step,
    stepIndex,
    task,
    taskStates,
    totalSteps: steps.length,
    updateAnswer,
  };
}
