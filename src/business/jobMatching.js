// Fixed-formula job matching against the curated growth-job bank. No AI involved.
// The formula itself lives in riasecFit.js, shared with the full ISCO-08 occupation map.
import { JOBS } from './jobBank.js';
import { MATCH_METHOD, fitLabel, jobFit } from './riasecFit.js';

export { MATCH_METHOD, fitLabel, jobFit };
const TOP_MATCHES = 5;
const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 };

export function matchJobs(scores, maxPerType, { lowConfidence = false } = {}) {
  const ranked = JOBS
    .filter((job) => job.riasec)
    .map((job) => {
      const fit = jobFit(scores, job.riasec, maxPerType);
      return {
        key: job.key,
        title: job.title_en,
        riasec: job.riasec,
        fit,
        match: fitLabel(fit),
        horizon: job.horizon,
        confidence: job.confidence,
        why: job.why_en,
        majors: job.majors,
        regionalNotes: job.regional_notes,
        sources: job.sources,
      };
    })
    // Equal fit: better-evidenced jobs first, then alphabetical so results are stable.
    .sort((a, b) => b.fit - a.fit
      || (CONFIDENCE_ORDER[a.confidence] ?? 3) - (CONFIDENCE_ORDER[b.confidence] ?? 3)
      || a.title.localeCompare(b.title))
    .map((job, index) => ({ ...job, rank: index + 1 }));
  return {
    method: MATCH_METHOD,
    top: ranked.slice(0, TOP_MATCHES),
    candidates: ranked.slice(0, 12).map(({ title, riasec, match }) => ({ title, riasec, match })),
    of: ranked.length,
    lowConfidence,
  };
}
