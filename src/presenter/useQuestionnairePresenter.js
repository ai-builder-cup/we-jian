import { useCallback, useState } from 'react';
import { questionnaireApi } from '../network/questionnaireApi.js';
import {
  isAnswerComplete,
  normalizeQuestions,
  normalizeResult,
  sectionProgress,
} from '../business/questionnaireService.js';
import {
  completeProcess,
  getCvProfile,
  saveQuestionnaireResult,
} from '../business/workflowService.js';

export function useQuestionnairePresenter() {
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const payload = await questionnaireApi.getQuestions(getCvProfile()?.userType);
      setQuestions(normalizeQuestions(payload));
      setSessionId(payload.sessionId || '');
      setIsDemo(payload.isDemo === true);
      setAnswers({});
      setIndex(0);
      setResult(null);
      setStatus('ready');
    } catch (loadError) {
      setError(loadError.message);
      setStatus('error');
    }
  }, []);

  const setAnswer = useCallback((questionId, answer) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }, []);

  const currentQuestion = questions[index];
  const canContinue = currentQuestion
    ? isAnswerComplete(currentQuestion, answers[currentQuestion.id])
    : false;

  const next = useCallback(async () => {
    if (!currentQuestion || !canContinue) return;
    if (index < questions.length - 1) {
      setDirection('forward');
      setIndex((current) => current + 1);
      return;
    }

    setStatus('submitting');
    setError('');
    try {
      const payload = await questionnaireApi.submitAnswers(
        questions.map((question) => ({
          questionId: question.id,
          answer: answers[question.id],
        })),
        sessionId,
      );
      const normalizedResult = { ...normalizeResult(payload), isDemo: payload?.result?.isDemo === true };
      setResult(normalizedResult);
      saveQuestionnaireResult(normalizedResult);
      completeProcess('sample-questionnaire');
      setStatus('result');
    } catch (submitError) {
      setError(submitError.message);
      setStatus('ready');
    }
  }, [answers, canContinue, currentQuestion, index, questions, sessionId]);

  const back = useCallback(() => {
    setDirection('back');
    setIndex((current) => Math.max(0, current - 1));
    setError('');
  }, []);

  return {
    answers,
    back,
    canContinue,
    currentQuestion,
    direction,
    error,
    index,
    isDemo,
    load,
    next,
    progress: questions.filter((question) =>
      isAnswerComplete(question, answers[question.id]),
    ).length,
    questions,
    result,
    section: sectionProgress(questions, index),
    status,
    total: questions.length,
    setAnswer,
  };
}
