import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCareerDirections } from './careerDirectionsService.js';
import { MOCK_CAREER_DIRECTIONS } from '../network/mockData.js';

test('demo recommendations follow the PDF p.13 top five and include fifteen more paths', () => {
  const recommendations = normalizeCareerDirections(MOCK_CAREER_DIRECTIONS);
  assert.deepEqual(
    recommendations.directions.map((direction) => direction.title),
    [
      'Customer Success Specialist',
      'AI Quality Evaluator',
      'Account Executive (B2B)',
      'Talent Acquisition (HR)',
      'Community & Partnerships',
    ],
  );
  assert.equal(recommendations.exploreMore.length, 15);
  assert.match(recommendations.baziNote, /never affects the ranking/i);
});

test('career recommendation response requires ranked evidence and 15 additional directions', () => {
  const valid = MOCK_CAREER_DIRECTIONS;
  assert.throws(
    () => normalizeCareerDirections({ ...valid, directions: valid.directions.slice(1) }),
    /exactly five/i,
  );
  assert.throws(
    () => normalizeCareerDirections({ ...valid, exploreMore: [] }),
    /15 additional/i,
  );
  assert.throws(
    () => normalizeCareerDirections({
      ...valid,
      directions: valid.directions.map((direction, index) => (index === 0 ? { ...direction, evidence: ' ' } : direction)),
    }),
    /evidence/i,
  );
});
