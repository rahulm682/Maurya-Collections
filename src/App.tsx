import React, { useState, useEffect } from 'react';
import { Product, CustomerRequest, VillageRoute } from './types';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS, INITIAL_VILLAGES } from './data/mockData';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import SellerView from './components/SellerView';
import { CheckCircle2, Lock } from 'lucide-react';

// Firebase imports
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, testConnection } from './firebase';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'customer' | 'seller'>('customer');
  
  // Storage initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [villages, setVillages] = useState<VillageRoute[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [uiNotification, setUiNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Admin Logged-In Security State
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // 1. Initial State Sync & Auth Gate Listening
  useEffect(() => {
    // Probe Firestore server connection to trace any missing credentials upfront
    testConnection();

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'maurya.rahul6820@gmail.com') {
        setAdminAuthenticated(true);
        localStorage.setItem('maurya_admin_auth', 'true');
      } else {
        const savedAdminAuth = localStorage.getItem('maurya_admin_auth');
        if (savedAdminAuth === 'true') {
          // Guard for local testing fallback credentials
          setAdminAuthenticated(true);
        } else {
          setAdminAuthenticated(false);
        }
      }
    });

    // Populate static route villages and member wishlist likes
    const savedVillages = localStorage.getItem('route_villages');
    const savedLikes = localStorage.getItem('route_likes');

    if (savedVillages) {
      try {
        setVillages(JSON.parse(savedVillages));
      } catch (e) {
        setVillages(INITIAL_VILLAGES);
      }
    } else {
      setVillages(INITIAL_VILLAGES);
      localStorage.setItem('route_villages', JSON.stringify(INITIAL_VILLAGES));
    }

    if (savedLikes) {
      try {
        setLikedProductIds(JSON.parse(savedLikes));
      } catch (e) {
        setLikedProductIds([]);
      }
    }

    return () => {
      unsubAuth();
    };
  }, []);

  // 2. Dynamic Real-time Collections listening from Firestore DB
  useEffect(() => {
    console.log("Setting up live database listeners...");

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetchedProducts: Product[] = [];
      snapshot.forEach((docSnap) => {
        fetchedProducts.push(docSnap.data() as Product);
      });

      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      } else {
        // Fallback to memory configuration until master sync
        setProducts(INITIAL_PRODUCTS);
      }
    }, (error) => {
      console.warn("Products listener failed, fallback to local seeds. Details:", error.message);
      setProducts(INITIAL_PRODUCTS);
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const fetchedRequests: CustomerRequest[] = [];
      snapshot.forEach((docSnap) => {
        fetchedRequests.push(docSnap.data() as CustomerRequest);
      });
      setRequests(fetchedRequests);
    }, (error) => {
      console.warn("Requests listener failed, waiting for auth. Details:", error.message);
    });

    return () => {
      unsubProducts();
      unsubRequests();
    };
  }, []);

  // 3. Auto-seed Empty Database when Admin authenticates to Real Connection
  useEffect(() => {
    if (!adminAuthenticated || auth.currentUser?.email !== 'maurya.rahul6820@gmail.com') return;

    const checkAndSeed = async () => {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          triggerToast('Empty cloud database. Seeding master styles into Firestore...', 'info');
          for (const prod of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', prod.id), prod);
          }
          triggerToast('Firestore Database successfully initialized!', 'success');
        }

        const reqSnap = await getDocs(collection(db, 'requests'));
        if (reqSnap.empty) {
          for (const req of INITIAL_REQUESTS) {
            await setDoc(doc(db, 'requests', req.id), req);
          }
        }
      } catch (err) {
        console.warn('Real Database seeding check skipped or non-admin mode:', err);
      }
    };
    checkAndSeed();
  }, [adminAuthenticated]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setUiNotification({ message, type });
    setTimeout(() => {
      setUiNotification(null);
    }, 3500);
  };

  // Auth Handlers (Credential mode and Google DB Auth)
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Standard credential matching (Sets local auth context state)
    if (loginEmail.trim() === 'maurya.rahul6820@gmail.com' && loginPassword === 'Rahul@1234') {
      setAdminAuthenticated(true);
      localStorage.setItem('maurya_admin_auth', 'true');
      triggerToast('Welcome back, Rahul Maurya! Local credential view active.', 'success');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid Administrator credentials. Please verify your email and password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === 'maurya.rahul6820@gmail.com') {
        setAdminAuthenticated(true);
        localStorage.setItem('maurya_admin_auth', 'true');
        triggerToast('Sign-In Successful! Real-time Firestore ledger unlocked.', 'success');
      } else {
        await signOut(auth);
        setLoginError('Access Denied. Only the authorized owner account (maurya.rahul6820@gmail.com) can manage the cloud database.');
      }
    } catch (err: any) {
      setLoginError(`Google Authentication failed: ${err.message}`);
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase Auth signout error:', err);
    }
    setAdminAuthenticated(false);
    localStorage.removeItem('maurya_admin_auth');
    setCurrentRole('customer'); // Return safely to customer shop catalog
    triggerToast('Logged out of Admin Session safely.', 'info');
  };

  // 1. Customer submits interest reservation request
  const handleAddRequest = async (newReq: Omit<CustomerRequest, 'id' | 'dateRequested' | 'status'>) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const id = `req-${Date.now()}`;
    
    const request: CustomerRequest = {
      ...newReq,
      id,
      dateRequested: formattedDate,
      status: 'Pending'
    };

    try {
      await setDoc(doc(db, 'requests', id), request);
      triggerToast(`Thanks ${newReq.customerName}! Saved for verification.`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `requests/${id}`);
    }
  };

  // 2. Customer likes/unlikes an item
  const handleLikeProduct = async (productId: string) => {
    let isLikedNow = false;
    const updatedLikes = [...likedProductIds];
    const index = updatedLikes.indexOf(productId);
    
    if (index > -1) {
      updatedLikes.splice(index, 1);
    } else {
      updatedLikes.push(productId);
      isLikedNow = true;
    }

    setLikedProductIds(updatedLikes);
    localStorage.setItem('route_likes', JSON.stringify(updatedLikes));

    // Optimistically update cloud products
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const netLikesChange = isLikedNow ? 1 : -1;
    const nextLikesCount = Math.max(0, (targetProduct.likes || 0) + netLikesChange);

    try {
      await updateDoc(doc(db, 'products', productId), {
        likes: nextLikesCount
      });
    } catch (e) {
      // If permission is denied because they are a non-admin, Firestore rules permit
      // public updates ONLY on the 'likes' attribute. Let's process or handle failures.
      console.warn("Failed syncing likes count directly, likely offline or permission limit. Fallback locally.");
    }
  };

  // 3. Admin adds a whole new clothing style to product line
  const handleAddProduct = async (newProd: Omit<Product, 'id' | 'likes'>) => {
    const id = `p-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      likes: 0,
      status: 'listed'
    };

    try {
      await setDoc(doc(db, 'products', id), product);
      triggerToast(`Created style "${newProd.name}" successfully!`);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${id}`);
    }
  };

  // 4. Admin toggles if an item is listed or unlisted
  const handleToggleProductStatus = async (productId: string, newStatus: 'listed' | 'unlisted') => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: newStatus
      });
      triggerToast(`Product listing status set to ${newStatus}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${productId}`);
    }
  };

  // 5. Admin completely deletes product from inventory database
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      triggerToast('Product style fully deleted from inventory ledger.');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${productId}`);
    }
  };

  // 6. Admin updates reservation status pipeline
  const handleUpdateRequestStatus = async (requestId: string, newStatus: CustomerRequest['status']) => {
    const targetRequest = requests.find(r => r.id === requestId);
    if (!targetRequest) return;

    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: newStatus
      });
      triggerToast(`Order for ${targetRequest.customerName} marked ${newStatus}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `requests/${requestId}`);
    }
  };

  const handleAllocateRequestStock = (requestId: string) => {
    handleUpdateRequestStatus(requestId, 'Allocated');
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      triggerToast(`Deleted request from collections stream`);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `requests/${requestId}`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Core application layout view rendering inside device simulator or fluid layout
  const renderCoreApplet = () => {
    // 1. If trying to access Seller panel and is not authenticated, show login gate first
    if (currentRole === 'seller' && !adminAuthenticated) {
      return (
        <div className="py-8 px-4 flex-1 flex flex-col justify-center bg-slate-50 text-left">
          <div className="max-w-xs mx-auto w-full space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center space-y-2">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                <Lock className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Maurya Collections Secure Admin</h3>
              <p className="text-[10px] text-slate-500">Only authorized owners can review reservations and coordinate truck logistics.</p>
            </div>

            {loginError && (
              <div className="p-2.5 bg-rose-50 text-rose-850 font-semibold border border-rose-150 rounded-lg text-[10px] text-left leading-normal">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleAdminSignIn} className="space-y-3">
              <div>
                <label htmlFor="login-email" className="block text-[9px] font-bold text-slate-650 uppercase tracking-widest mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  required
                  placeholder="name@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-205 py-1.5 px-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-[9px] font-bold text-slate-650 uppercase tracking-widest mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-205 py-1.5 px-2.5 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950"
                />
              </div>

              <button
                type="submit"
                id="btn-admin-login-submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow cursor-pointer"
              >
                Sign In to Ledger (Offline View)
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 py-1">
              <span className="h-px bg-slate-200 flex-1"></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">OR</span>
              <span className="h-px bg-slate-200 flex-1"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer bg-white"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentRole('customer')}
              className="text-center block w-full text-[9px] font-bold text-indigo-650 hover:underline py-1"
            >
              ← Back to Customer Catalog
            </button>
          </div>
        </div>
      );
    }

    // 2. Standard View Dispatch
    return (
      <div className="flex-grow overflow-x-hidden flex flex-col">
        {currentRole === 'customer' ? (
          <div className="px-4 flex-grow">
            <CustomerView
              products={products}
              onAddRequest={handleAddRequest}
              onLikeProduct={handleLikeProduct}
              likedProductIds={likedProductIds}
            />
          </div>
        ) : (
          <div className="px-4 flex-grow">
            <SellerView
              products={products}
              requests={requests}
              villages={villages}
              onAddProduct={handleAddProduct}
              onToggleProductStatus={handleToggleProductStatus}
              onDeleteProduct={handleDeleteProduct}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onAllocateRequestStock={handleAllocateRequestStock}
              onDeleteRequest={handleDeleteRequest}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-amber-400 antialiased">
      
      {/* Dynamic Responsive Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        pendingRequestsCount={pendingRequests.length}
        adminAuthenticated={adminAuthenticated}
        onLogout={handleAdminSignOut}
      />

      {/* Global Toast Alerts */}
      {uiNotification && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-[11px] font-bold text-white shadow-2xl animate-slide-up border border-slate-800">
          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{uiNotification.message}</span>
        </div>
      )}

      {/* Primary Responsive Content Stage */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {renderCoreApplet()}
      </div>

      {/* Elegant minimalist footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 shrink-0 mt-auto">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-[10px] font-mono text-slate-400">
            Maurya Collections &copy; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
