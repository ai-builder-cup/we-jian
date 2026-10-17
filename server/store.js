// Session and journey storage.
// Production (Cloud Run, STORE=firestore): Cloud Firestore through the service account. Sessions survive
//   restarts and work across instances; completed journeys are kept as anonymous records.
// Local development and tests: in-memory maps with the same interface.
import { randomUUID } from 'node:crypto';

const COLLECTIONS = {
  questionnaire: 'questionnaireSessions',
  simulation: 'simulationSessions',
  questionnaireResult: 'questionnaireResults',
  simulationResult: 'simulationResults',
};

function memoryStore() {
  const maps = Object.fromEntries(Object.keys(COLLECTIONS).map((kind) => [kind, new Map()]));
  return {
    backend: 'memory',
    async create(kind, data, ttlMs) {
      const id = randomUUID();
      maps[kind].set(id, { ...data, createdAt: Date.now(), expireAt: ttlMs ? Date.now() + ttlMs : null });
      return id;
    },
    async get(kind, id) {
      const doc = typeof id === 'string' ? maps[kind].get(id) : null;
      if (!doc) return null;
      if (doc.expireAt && doc.expireAt <= Date.now()) {
        maps[kind].delete(id);
        return null;
      }
      return { ...doc };
    },
    async update(kind, id, patch) {
      const doc = maps[kind].get(id);
      if (doc) maps[kind].set(id, { ...doc, ...patch });
    },
    async remove(kind, id) {
      maps[kind].delete(id);
    },
    async count(kind) {
      return maps[kind].size;
    },
  };
}

async function firestoreStore() {
  const { Firestore, Timestamp } = await import('@google-cloud/firestore');
  const db = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || undefined,
    ignoreUndefinedProperties: true,
  });
  const col = (kind) => db.collection(COLLECTIONS[kind]);
  return {
    backend: 'firestore',
    async create(kind, data, ttlMs) {
      const ref = col(kind).doc();
      // expireAt doubles as a Firestore TTL field, so old sessions are deleted automatically once the policy is on.
      await ref.set({
        ...data,
        createdAt: Timestamp.now(),
        expireAt: ttlMs ? Timestamp.fromMillis(Date.now() + ttlMs) : null,
      });
      return ref.id;
    },
    async get(kind, id) {
      if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
      const snap = await col(kind).doc(id).get();
      if (!snap.exists) return null;
      const doc = snap.data();
      if (doc.expireAt && doc.expireAt.toMillis() <= Date.now()) return null;
      return { ...doc, createdAt: doc.createdAt?.toMillis?.() ?? doc.createdAt };
    },
    async update(kind, id, patch) {
      await col(kind).doc(id).set(patch, { merge: true });
    },
    async remove(kind, id) {
      await col(kind).doc(id).delete();
    },
    async count(kind) {
      const snap = await col(kind).count().get();
      return snap.data().count;
    },
  };
}

let storePromise = null;
export function getStore() {
  if (!storePromise) {
    storePromise = process.env.STORE === 'firestore' ? firestoreStore() : Promise.resolve(memoryStore());
  }
  return storePromise;
}

// For tests: start from an empty in-memory store.
export function resetStoreForTests() {
  storePromise = Promise.resolve(memoryStore());
}

// Anonymous outcome records: scores only. No CV content, no free-text answers, no names.
export async function recordOutcome(kind, data) {
  try {
    const store = await getStore();
    await store.create(kind, data);
  } catch (error) {
    console.warn(`Could not save ${kind} record: ${error.message}`);
  }
}
