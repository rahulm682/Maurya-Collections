import { firebaseConfig } from './config.ts';
import { toFirestoreDocument, fromFirestoreDocument } from './serializers.ts';

export async function listFirestoreRest(collectionName: string, idToken: string | null): Promise<any[]> {
  const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (idToken && idToken !== 'static_fallback_token') {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const payload = {
    structuredQuery: {
      from: [{ collectionId: collectionName }]
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firestore REST query error (${response.status}): ${errText}`);
  }
  const data = await response.json();
  return (data || [])
    .filter((item: any) => item.document)
    .map((item: any) => fromFirestoreDocument(item.document));
}

export async function callFirestoreRest(
  collectionName: string,
  docId: string,
  method: string,
  body: any | null,
  idToken: string | null,
  updateMaskFields?: string[]
): Promise<any> {
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
