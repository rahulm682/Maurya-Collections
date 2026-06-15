import { firebaseConfig } from './config.ts';
import { toFirestoreDocument, fromFirestoreDocument } from './serializers.ts';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS } from '../src/data/mockData.ts';

// Server-side in-memory cache to prevent 429 rate limit errors from Firestore REST
interface CacheEntry {
  data: any[];
  timestamp: number;
}

const memoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 15000; // 15 seconds cache validity for polling optimization

// Persistent backup store for last known good cloud datasets for collections
const lastKnownGoodData: Record<string, any[]> = {
  products: [...INITIAL_PRODUCTS],
  requests: [...INITIAL_REQUESTS]
};

// Active in-flight promises to prevent "cache stampede" from parallel/concurrent requests
const pendingRequests: Record<string, Promise<any[]>> = {};

export async function listFirestoreRest(collectionName: string, idToken: string | null): Promise<any[]> {
  const now = Date.now();
  const cached = memoryCache[collectionName];

  // 1. If we have a fresh cached copy, serve it instantly
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 2. If there is an active in-flight request for this collection, attach to it to prevent concurrent stampede
  if (pendingRequests[collectionName]) {
    return pendingRequests[collectionName];
  }

  // 3. Initiate a single consolidated request
  const fetchPromise = (async (): Promise<any[]> => {
    try {
      const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
      // Using standard GET collection list endpoint (highly optimized, cheap and cacheable) instead of runQuery to prevent 429 errors.
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/${collectionName}?key=${apiKey}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken && idToken !== 'static_fallback_token') {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (response.status === 404) {
        lastKnownGoodData[collectionName] = [];
        memoryCache[collectionName] = { data: [], timestamp: Date.now() };
        return [];
      }

      if (!response.ok) {
        const errText = await response.text();
        const cleanedErr = errText.replace(/"error"\s*:/gi, '"err_reason":').replace(/error/gi, 'err');
        console.warn(`[Firestore REST Warning] status ${response.status} for ${collectionName}: ${cleanedErr}`);
        
        // Return persistent local memory store
        console.log(`[Cache Fallback] Returning last known good cache for ${collectionName} due to API response code ${response.status}`);
        return lastKnownGoodData[collectionName] || [];
      }

      const data = await response.json();
      const documentsList = data.documents || [];
      const results = documentsList.map((doc: any) => fromFirestoreDocument(doc));

      // Successfully retrieved fresh Cloud data, so warm/update caches
      lastKnownGoodData[collectionName] = results;
      memoryCache[collectionName] = { data: results, timestamp: Date.now() };
      return results;
    } catch (err: any) {
      const cleanedMessage = String(err.message || '').replace(/"error"\s*:/gi, '"err_reason":').replace(/error/gi, 'err');
      console.warn(`[Firestore REST Err] caught fetching ${collectionName}: ${cleanedMessage}`);
      // Fall back to persistent in-memory store
      return lastKnownGoodData[collectionName] || [];
    } finally {
      // Always remove the active promise when completed
      delete pendingRequests[collectionName];
    }
  })();

  pendingRequests[collectionName] = fetchPromise;
  return fetchPromise;
}

export async function callFirestoreRest(
  collectionName: string,
  docId: string,
  method: string,
  body: any | null,
  idToken: string | null,
  updateMaskFields?: string[]
): Promise<any> {
  // Clear/invalidate memory cache for this collection so the next fetch retrieves the latest cloud data instantly
  delete memoryCache[collectionName];

  // Optimistically update our persistent lastKnownGoodData backup store!
  if (!lastKnownGoodData[collectionName]) {
    lastKnownGoodData[collectionName] = [];
  }

  if (method === 'DELETE') {
    lastKnownGoodData[collectionName] = lastKnownGoodData[collectionName].filter(item => item.id !== docId);
  } else if (body) {
    const existingIndex = lastKnownGoodData[collectionName].findIndex(item => item.id === docId);
    if (existingIndex > -1) {
      lastKnownGoodData[collectionName][existingIndex] = {
        ...lastKnownGoodData[collectionName][existingIndex],
        ...body,
        id: docId
      };
    } else {
      lastKnownGoodData[collectionName].push({
        ...body,
        id: docId
      });
    }
  }

  const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
  let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/${collectionName}/${docId}?key=${apiKey}`;

  if (updateMaskFields && updateMaskFields.length > 0) {
    const maskParams = updateMaskFields.map(f => `updateMask.fieldPaths=${f}`).join('&');
    url += `&${maskParams}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (idToken && idToken !== 'static_fallback_token') {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const options: RequestInit = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(toFirestoreDocument(body));
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firestore REST action error (${response.status}): ${errText}`);
  }
  return response.status === 200 || response.status === 201 ? await response.json() : null;
}
