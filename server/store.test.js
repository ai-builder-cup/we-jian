import test from 'node:test';
import assert from 'node:assert/strict';
import { getStore, recordOutcome, resetStoreForTests } from './store.js';

test('memory store creates, reads, updates, expires and counts records', async () => {
  resetStoreForTests();
  const store = await getStore();
  assert.equal(store.backend, 'memory');
  const id = await store.create('simulation', { followUp: null }, 60_000);
  assert.equal((await store.get('simulation', id)).followUp, null);
  await store.update('simulation', id, { followUp: { trigger: 'clarity', message: 'Why?' } });
  assert.equal((await store.get('simulation', id)).followUp.message, 'Why?');
  await store.remove('simulation', id);
  assert.equal(await store.get('simulation', id), null);

  const expired = await store.create('questionnaire', {}, -1);
  assert.equal(await store.get('questionnaire', expired), null);

  await recordOutcome('questionnaireResult', { interestCode: 'S-E' });
  await recordOutcome('questionnaireResult', { interestCode: 'I-C' });
  assert.equal(await store.count('questionnaireResult'), 2);
  assert.equal(await store.count('simulationResult'), 0);
});
