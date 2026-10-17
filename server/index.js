import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { HttpError } from './httpError.js';
import { geminiBackend } from './gemini.js';
import { getStore, recordOutcome } from './store.js';
import {
  assessSimulation,
  debriefSimulation,
  estimateJobRequirements,
  explainBaziReflection,
  explainQuestionnaire,
  managerFollowUp,
  parseCv,
  recommendCareerDirections,
  writeLearningPlan,
} from './agents.js';
import {
  calculateQuestionnaireResult,
  createQuestionnaireSession,
  getAnswerMap,
  getQuestionnaireSession,
  removeQuestionnaireSession,
} from './questionnaire.js';
import { SAFETY_POLICY, SIMULATION_SCENARIO, SIMULATION_SKILLS } from '../src/business/simulationScenario.js';
import { buildSkillGapTable, validateSimulationAnswers } from '../src/business/workSimulationService.js';
import { buildPlanPhases } from '../src/business/skillGapPlanService.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxCvBytes = 10 * 1024 * 1024;
const maxRequestBytes = 15 * 1024 * 1024;
const rateWindowMs = 15 * 60 * 1000;
const rateLimit = 30;
const simulationLifetimeMs = 24 * 60 * 60 * 1000;
const rateWindowByIp = new Map();

function readJson(request, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, 'The request is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('error', reject);
    request.on('end', () => {
      if (size === 0) {
        reject(new HttpError(400, 'A JSON request body is required.'));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'The request body must contain valid JSON.'));
      }
    });
  });
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(data));
}

function enforceRateLimit(request) {
  const ip = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  if (rateWindowByIp.size > 1000) {
    for (const [key, value] of rateWindowByIp) {
      if (now - value.startedAt >= rateWindowMs) rateWindowByIp.delete(key);
    }
  }
  const current = rateWindowByIp.get(ip);
  if (!current || now - current.startedAt >= rateWindowMs) {
    rateWindowByIp.set(ip, { startedAt: now, count: 1 });
    return;
  }
  current.count += 1;
  if (current.count > rateLimit) {
    throw new HttpError(429, 'Too many AI requests. Please wait a few minutes and try again.');
  }
}

async function getSimulationSession(sessionId) {
  const store = await getStore();
  const session = await store.get('simulation', sessionId);
  if (!session) {
    throw new HttpError(404, 'This simulation session has expired. Please start a new simulation.');
  }
  return session;
}

function requireJourneyInputs({ cvProfile, questionnaireResult, simulationResult }, purpose) {
  if (
    !cvProfile ||
    typeof cvProfile.summary !== 'string' ||
    !questionnaireResult?.interestCode ||
    !Array.isArray(simulationResult?.skills) ||
    simulationResult.skills.length === 0
  ) {
    throw new HttpError(400, `CV, questionnaire, and simulation results are required to ${purpose}.`);
  }
}

async function handleApi(request, response, url) {
  const route = `${request.method} ${url.pathname}`;
  if (
    request.method !== 'GET' &&
    !request.headers['content-type']?.toLowerCase().includes('application/json')
  ) {
    throw new HttpError(415, 'API requests must use application/json.');
  }

  if (route === 'POST /api/cv/parse') {
    enforceRateLimit(request);
    const body = await readJson(request, maxRequestBytes);
    if (typeof body.base64 !== 'string' || !body.base64 || !/^[A-Za-z0-9+/]+=*$/.test(body.base64)) {
      throw new HttpError(400, 'The uploaded PDF could not be read. Please choose a valid PDF.');
    }
    const pdf = Buffer.from(body.base64, 'base64');
    if (pdf.length === 0 || pdf.length > maxCvBytes) {
      throw new HttpError(413, 'Your PDF must be 10 MB or smaller.');
    }
    if (pdf.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new HttpError(400, 'The uploaded file is not a valid PDF.');
    }
    const profile = await parseCv(pdf.toString('base64'));
    sendJson(response, 200, { profile, isDemo: false });
    return;
  }

  // Anonymous counts for the demo ("N students have completed the questionnaire").
  if (route === 'GET /api/stats') {
    const store = await getStore();
    const [questionnaires, simulations] = await Promise.all([
      store.count('questionnaireResult'), store.count('simulationResult'),
    ]);
    sendJson(response, 200, { storage: store.backend, questionnairesCompleted: questionnaires, simulationsCompleted: simulations });
    return;
  }

  // Optional BaZi reflection: rephrases labels the BROWSER already computed.
  //
  // The request carries no birth date, no pillars, and no chart data, because
  // the engine runs client-side. Nothing here is stored: a reflection is not an
  // outcome, and keeping it would turn an optional cultural note into a record
  // attached to a person.
  if (route === 'POST /api/bazi/explanation') {
    enforceRateLimit(request);
    const body = await readJson(request);
    const reflection = body?.reflection;
    if (!reflection || typeof reflection !== 'object' || typeof reflection.driver !== 'string') {
      throw new HttpError(400, 'A computed reflection is required.');
    }
    // Defence in depth: even though the client sends only labels, anything that
    // looks like chart data is refused rather than forwarded to Gemini.
    const FORBIDDEN = ['pillars', 'year', 'month', 'day', 'hour', 'stem', 'branch', 'weights', 'date', 'birth'];
    const present = FORBIDDEN.filter((key) => key in reflection);
    if (present.length > 0) {
      throw new HttpError(400, `A reflection must not include chart or birth data: ${present.join(', ')}.`);
    }
    // Wrapped in an object, not sent bare. requireText returns a plain string,
    // and a bare JSON string has no field for the client to read — it reads
    // `.explanation`, finds undefined, and falls back to the composed reading
    // without a single error anywhere. Gemini ran, was paid for, and was thrown
    // away silently. Guarded by server/bazi.test.js.
    const explanation = await explainBaziReflection(reflection);
    sendJson(response, 200, { explanation });
    return;
  }

  // Fixed item bank: no AI involved in the questions (PDF p.19).
  if (route === 'GET /api/questionnaire/questions') {
    // Anything other than the two known audiences falls back to the student wording.
    const userType = url.searchParams.get('userType') === 'professional' ? 'professional' : 'student';
    sendJson(response, 200, await createQuestionnaireSession(userType));
    return;
  }

  if (route === 'POST /api/questionnaire/submissions') {
    enforceRateLimit(request);
    const body = await readJson(request);
    await getQuestionnaireSession(body.sessionId);
    const scored = calculateQuestionnaireResult(getAnswerMap(body));
    // Scores never depend on Gemini: if the explanation fails, return the scores without it.
    let explanation = '';
    try {
      explanation = await explainQuestionnaire(scored);
    } catch (error) {
      console.warn(`Questionnaire explanation unavailable: ${error.message}`);
    }
    await removeQuestionnaireSession(body.sessionId);
    await recordOutcome('questionnaireResult', {
      scoringVersion: scored.scoringVersion,
      interestCode: scored.interestCode,
      topTypes: scored.topTypes,
      flags: scored.flags,
      interestScores: Object.fromEntries(scored.chart.map(({ id, value }) => [id, value])),
      readiness: Object.fromEntries(scored.readiness.dimensions.map(({ id, value }) => [id, value])),
      workValues: scored.goals.workValues || [],
      topJobs: scored.jobs.top.map(({ key, match }) => ({ key, match })),
    });
    sendJson(response, 200, { result: { ...scored, explanation, isDemo: false } });
    return;
  }

  // Fixed scenario: the same for every student (PDF p.20).
  if (route === 'POST /api/work-simulation/sessions') {
    const body = await readJson(request);
    const store = await getStore();
    const sessionId = await store.create('simulation', { followUp: null }, simulationLifetimeMs);
    sendJson(response, 201, {
      ...SIMULATION_SCENARIO,
      id: sessionId,
      skills: SIMULATION_SKILLS.map(({ id, label }) => ({ id, label })),
      safetyPolicy: SAFETY_POLICY,
      interestCode: typeof body.interestCode === 'string' ? body.interestCode.slice(0, 20) : '',
      isDemo: false,
    });
    return;
  }

  const managerTurn = url.pathname.match(/^\/api\/work-simulation\/sessions\/([^/]+)\/manager-turn$/);
  if (request.method === 'POST' && managerTurn) {
    enforceRateLimit(request);
    const sessionId = decodeURIComponent(managerTurn[1]);
    await getSimulationSession(sessionId);
    const body = await readJson(request);
    if (typeof body.explanation !== 'string' || !body.explanation.trim() || body.explanation.length > 3000) {
      throw new HttpError(400, 'Write your answer to the manager (up to 3,000 characters) first.');
    }
    const followUp = await managerFollowUp(body.explanation);
    await (await getStore()).update('simulation', sessionId, { followUp });
    sendJson(response, 200, followUp);
    return;
  }

  const simulationSubmission = url.pathname.match(/^\/api\/work-simulation\/sessions\/([^/]+)\/submissions$/);
  if (request.method === 'POST' && simulationSubmission) {
    enforceRateLimit(request);
    const sessionId = decodeURIComponent(simulationSubmission[1]);
    const session = await getSimulationSession(sessionId);
    if (!session.followUp) {
      throw new HttpError(400, 'Answer the manager’s follow-up question before submitting.');
    }
    const body = await readJson(request);
    // The server's own record of the manager question is graded, not the client copy.
    const answers = body.answers && {
      ...body.answers,
      'manager-explanation': { ...body.answers['manager-explanation'], followUp: session.followUp },
    };
    try {
      validateSimulationAnswers(answers);
    } catch (error) {
      throw new HttpError(400, error.message);
    }
    const assessment = await assessSimulation(answers, session.followUp);
    const summary = await debriefSimulation(assessment);
    await (await getStore()).remove('simulation', sessionId);
    await recordOutcome('simulationResult', {
      overallScore: assessment.overallScore,
      skills: Object.fromEntries(assessment.skills.map(({ id, score }) => [id, score])),
      evidenceMissing: assessment.skills.filter((skill) => skill.evidenceMissing).map((skill) => skill.id),
    });
    sendJson(response, 200, { completed: true, result: { ...assessment, summary, isDemo: false } });
    return;
  }

  if (route === 'POST /api/career-directions/recommendations') {
    enforceRateLimit(request);
    const body = await readJson(request);
    requireJourneyInputs(body, 'rank career directions');
    const recommendations = await recommendCareerDirections(body);
    sendJson(response, 200, {
      ...recommendations,
      rankingBasis: [
        'Interests from the questionnaire (RIASEC)',
        'Skill scores from the simulation',
        'Each job’s requirements from ISCO-08 and O*NET data (estimated by Gemini until the job database is connected)',
      ],
      baziNote: 'Shown alongside; never affects the ranking.',
      isDemo: false,
    });
    return;
  }

  if (route === 'POST /api/skill-gap-plan') {
    enforceRateLimit(request);
    const body = await readJson(request);
    requireJourneyInputs(body, 'prepare your skill gap and plan');
    const targetJob = typeof body.targetJob === 'string' ? body.targetJob.trim().slice(0, 120) : '';
    if (!targetJob) {
      throw new HttpError(400, 'Choose a career direction before preparing your skill gap.');
    }
    const { occupation, requirements } = await estimateJobRequirements(targetJob);
    const skills = buildSkillGapTable(body.simulationResult.skills, requirements);
    const phases = buildPlanPhases(skills, targetJob);
    const focusRows = skills.filter((row) => row.status === 'priority').sort((a, b) => a.priorityRank - b.priorityRank);
    const evidenceRow = focusRows[0] || [...skills].sort((a, b) => b.shown - a.shown)[0];
    const evidenceSkill = body.simulationResult.skills.find((skill) => skill.id === evidenceRow.skillId);
    const evidence = {
      skillLabel: evidenceRow.label,
      quote: String(evidenceSkill?.evidence || ''),
    };
    const plan = await writeLearningPlan({
      targetJob,
      phases,
      focusRows: focusRows.slice(0, 2),
      strengths: skills.filter((row) => row.status === 'strength').map((row) => row.label),
      evidence,
    });
    sendJson(response, 200, {
      result: {
        targetJob,
        occupation: { ...occupation, source: 'O*NET ratings estimated by Gemini; replace with O*NET database values.' },
        skills,
        evidence: { ...evidence, note: plan.evidenceNote },
        plan: {
          summary: plan.summary,
          phases: plan.phases,
          note: 'The plan targets only the biggest gaps. Strengths are not retrained.',
        },
        isDemo: false,
      },
    });
    return;
  }

  throw new HttpError(404, 'API endpoint not found.');
}

function contentType(filePath) {
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

async function main() {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.argv[2] === 'production';
  const port = Number(process.env.PORT || 5173);
  let vite = null;

  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      try {
        await handleApi(request, response, url);
      } catch (error) {
        if (!error.statusCode || error.statusCode >= 500) {
          console.error(`API request failed (${request.method} ${url.pathname}): ${error.message}`);
        }
        if (!response.headersSent && !response.destroyed) {
          const statusCode = error.statusCode || 500;
          sendJson(response, statusCode, {
            error: statusCode === 500
              ? 'The server could not complete the request.'
              : error.message,
          });
        }
      }
      return;
    }

    if (!isProduction) {
      vite.middlewares(request, response, (error) => {
        if (error && !response.headersSent) {
          response.writeHead(500);
          response.end('Development server error.');
        }
      });
      return;
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const assetPath = path.resolve(rootDir, 'dist', `.${requestedPath}`);
    const distPath = path.resolve(rootDir, 'dist');
    if (assetPath.startsWith(`${distPath}${path.sep}`)) {
      try {
        const fileStat = await stat(assetPath);
        if (fileStat.isFile()) {
          response.writeHead(200, { 'Content-Type': contentType(assetPath) });
          response.end(await readFile(assetPath));
          return;
        }
      } catch {
        // Missing client paths fall through to the SPA entry point.
      }
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await readFile(path.join(distPath, 'index.html')));
  });

  if (!isProduction) {
    // Dev only: production serves the built files and must not need dev dependencies.
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      configFile: path.join(rootDir, 'vite.config.js'),
      root: rootDir,
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`We.Jian server listening on http://localhost:${port}`);
    if (geminiBackend() === 'vertex' && !process.env.GOOGLE_CLOUD_PROJECT) {
      console.warn('GOOGLE_CLOUD_PROJECT is not set; AI-powered actions will return a setup error.');
    }
  });
}

main().catch((error) => {
  console.error(`Could not start We.Jian server: ${error.message}`);
  process.exitCode = 1;
});
