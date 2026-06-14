import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  limit
} from 'firebase/firestore';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS } from './src/data/mockData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Load Firebase Config of the Applet
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Initialize Firebase using Client Web SDK
  console.log(`Initializing Cloud Firebase Web SDK with Project: ${firebaseConfig.projectId}, Database ID: ${firebaseConfig.firestoreDatabaseId}`);
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // Auto-seed empty database helper on boot using Web SDK
  try {
    const productsCol = collection(db, 'products');
    const prodSnap = await getDocs(query(productsCol, limit(1)));
    if (prodSnap.empty) {
      console.log('Firestore empty. Auto-seeding default products...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      console.log('Products auto-seeding completed!');
    } else {
      console.log('Products collection already seeded.');
    }

    const requestsCol = collection(db, 'requests');
    const reqSnap = await getDocs(query(requestsCol, limit(1)));
    if (reqSnap.empty) {
      console.log('Firestore empty. Auto-seeding default requests...');
      for (const req of INITIAL_REQUESTS) {
        await setDoc(doc(db, 'requests', req.id), req);
      }
      console.log('Requests auto-seeding completed!');
    } else {
      console.log('Requests collection already seeded.');
    }
  } catch (err) {
    console.warn('Auto-seeding skipped/warned:', err);
  }

  // 1. GET ALL PRODUCTS
  app.get('/api/products', async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts: any[] = [];
      snapshot.forEach((docSnap) => {
        fetchedProducts.push(docSnap.data());
      });
      if (fetchedProducts.length === 0) {
        return res.json(INITIAL_PRODUCTS);
      }
      res.json(fetchedProducts);
    } catch (e: any) {
      console.error('Error fetching products:', e);
      res.status(500).json({ error: e.message || 'Error fetching products' });
    }
  });

  // 2. GET ALL RESERVATION REQUESTS
  app.get('/api/requests', async (req, res) => {
    try {
      const snapshot = await getDocs(collection(db, 'requests'));
      const fetchedRequests: any[] = [];
      snapshot.forEach((docSnap) => {
        fetchedRequests.push(docSnap.data());
      });
      res.json(fetchedRequests);
    } catch (e: any) {
      console.error('Error fetching requests:', e);
      res.status(500).json({ error: e.message || 'Error fetching requests' });
    }
  });

  // 3. SUBMIT A NEW DEPOSIT RESERVATION
  app.post('/api/requests', async (req, res) => {
    try {
      const newReq = req.body;
      if (!newReq || !newReq.id) {
        return res.status(400).json({ error: 'Missing request body or ID.' });
      }
      await setDoc(doc(db, 'requests', newReq.id), newReq);
      res.json({ success: true, request: newReq });
    } catch (e: any) {
      console.error('Error saving request:', e);
      res.status(500).json({ error: e.message || 'Error saving request' });
    }
  });

  // 4. INCREMENT or DECREMENT WISHLIST LIKES COUNT
  app.post('/api/products/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { likes } = req.body;
      if (likes === undefined || typeof likes !== 'number') {
        return res.status(400).json({ error: 'Likes count must be a number' });
      }
      await updateDoc(doc(db, 'products', id), { likes });
      res.json({ success: true, id, likes });
    } catch (e: any) {
      console.error('Error updating likes:', e);
      res.status(500).json({ error: e.message || 'Error updating likes' });
    }
  });

  // 5. UPLOAD NEW CLOTHING STYLE
  app.post('/api/products', async (req, res) => {
    try {
      const product = req.body;
      if (!product || !product.id) {
        return res.status(400).json({ error: 'Missing product payload or id.' });
      }
      await setDoc(doc(db, 'products', product.id), product);
      res.json({ success: true, product });
    } catch (e: any) {
      console.error('Error saving product style:', e);
      res.status(500).json({ error: e.message || 'Error saving product style' });
    }
  });

  // 6. TOGGLE PRODUCT LISTING (Listed/Unlisted)
  app.post('/api/products/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing status attribute' });
      }
      await updateDoc(doc(db, 'products', id), { status });
      res.json({ success: true, id, status });
    } catch (e: any) {
      console.error('Error updating listing status:', e);
      res.status(500).json({ error: e.message || 'Error updating listing status' });
    }
  });

  // 7. REMOVE PRODUCT STYLE COMPLETELY FROM CATALOG
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteDoc(doc(db, 'products', id));
      res.json({ success: true, id });
    } catch (e: any) {
      console.error('Error removing product:', e);
      res.status(500).json({ error: e.message || 'Error removing product' });
    }
  });

  // 8. UPDATE RESERVATION PIPELINE STATUS
  app.post('/api/requests/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Missing pipeline status attribute' });
      }
      await updateDoc(doc(db, 'requests', id), { status });
      res.json({ success: true, id, status });
    } catch (e: any) {
      console.error('Error updating request status:', e);
      res.status(500).json({ error: e.message || 'Error updating request status' });
    }
  });

  // 9. PURGE RESERVATION ENTRY FROM LEDGER
  app.delete('/api/requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteDoc(doc(db, 'requests', id));
      res.json({ success: true, id });
    } catch (e: any) {
      console.error('Error purging request:', e);
      res.status(500).json({ error: e.message || 'Error purging request' });
    }
  });

  // Vite Middleware for standard full-stack routing integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
