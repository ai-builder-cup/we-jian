import { Suspense, lazy, useCallback, useState } from 'react';
import {
  canAccessProcess,
  getCvProfile,
  isProcessComplete,
  resetJourney,
} from '../business/workflowService.js';
import { LoadingState } from './components.jsx';
import { HomeScreen } from './HomeScreen.jsx';
import { CvUploadScreen } from './CvUploadScreen.jsx';
import { QuestionnaireScreen } from './QuestionnaireScreen.jsx';
import { ResultScreen } from './ResultScreen.jsx';
import { WorkSimulationScreen } from './WorkSimulationScreen.jsx';
import { CareerDirectionsScreen } from './CareerDirectionsScreen.jsx';
import { SkillGapPlanScreen } from './SkillGapPlanScreen.jsx';
// Loaded on demand. The reflection pulls in a full Chinese-calendar library,
// and it is optional: most people never open it, so it must not sit in the
// bundle everyone downloads before they can upload a CV.
const BaziReflectionScreen = lazy(() => import('./BaziReflectionScreen.jsx')
  .then((module) => ({ default: module.BaziReflectionScreen })));

export default function App() {
  const [screen, setScreen] = useState(() => (getCvProfile() ? 'home' : 'cv-upload'));
  const [result, setResult] = useState(null);
  const hasProfile = Boolean(getCvProfile());

  const goHome = useCallback(() => setScreen(getCvProfile() ? 'home' : 'cv-upload'), []);
  const showResult = useCallback((questionnaireResult) => {
    setResult(questionnaireResult);
    setScreen('questionnaire-result');
  }, []);

  function openProcess(processId) {
    if (canAccessProcess(processId)) setScreen(processId);
  }

  function startOver() {
    if (!window.confirm('Reset your journey? This removes your CV profile and results from this browser.')) return;
    resetJourney();
    setResult(null);
    setScreen('cv-upload');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="wordmark" onClick={goHome} aria-label="We.Jian home">
          <span className="brand-mark">W.</span>
          <span>We.Jian</span>
        </button>
        <span className="topbar-caption">Human Potential Navigator</span>
        {hasProfile && screen !== 'cv-upload' && (
          <button className="reset-button" onClick={startOver} title="Reset and upload a new CV">
            <span aria-hidden="true">↺</span> Reset
          </button>
        )}
      </header>
      <main key={screen} className="main-content">
        {screen === 'cv-upload' && <CvUploadScreen onSuccess={() => setScreen('home')} />}
        {screen === 'home' && (
          <HomeScreen
            isComplete={isProcessComplete}
            canAccess={canAccessProcess}
            onOpen={openProcess}
            onOpenBazi={() => setScreen('bazi-reflection')}
          />
        )}
        {screen === 'sample-questionnaire' && <QuestionnaireScreen onFinish={goHome} onResult={showResult} />}
        {screen === 'questionnaire-result' && (
          <ResultScreen
            result={result}
            onFinish={goHome}
            onBack={() => setScreen('sample-questionnaire')}
            onOpenBazi={() => setScreen('bazi-reflection')}
          />
        )}
        {screen === 'work-simulation' && <WorkSimulationScreen onBack={goHome} />}
        {screen === 'career-directions' && (
          <CareerDirectionsScreen onBack={goHome} onContinue={() => setScreen('skill-gap-plan')} />
        )}
        {screen === 'skill-gap-plan' && (
          <SkillGapPlanScreen onBack={goHome} onChangeDirection={() => setScreen('career-directions')} />
        )}
        {/* Optional and OUTSIDE the quest flow on purpose: anything inside the
            journey reads as something that counts toward the outcome. */}
        {screen === 'bazi-reflection' && (
          <Suspense fallback={<LoadingState label="Opening the reflection…" />}>
            <BaziReflectionScreen onBack={goHome} />
          </Suspense>
        )}
      </main>
      <footer className="site-footer">
        <span>Evidence, not guesswork. Clarity, not fear.</span>
        <span>© We.Jian</span>
      </footer>
    </div>
  );
}
