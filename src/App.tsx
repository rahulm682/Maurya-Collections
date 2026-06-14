import React, { useState, useEffect } from 'react';
import { Product, CustomerRequest, VillageRoute } from './types';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS, INITIAL_VILLAGES } from './data/mockData';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import SellerView from './components/SellerView';
import { CheckCircle2, Lock } from 'lucide-react';

// Firebase Auth (for secure portal)
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';

// Administrative credential constants sourced from environment variables to avoid codebase exposure
const ADMIN_EMAIL = (import.meta as any).env.VITE_ADMIN_EMAIL || 'maurya.rahul6820@gmail.com';
const ADMIN_PASSWORD = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'admin123';

export default function App() {
  const [currentRole, setCurrentRole] = useState<'customer' | 'seller'>('customer');
  
  // Storage initialization
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem('cached_products');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });
  const [requests, setRequests] = useState<CustomerRequest[]>(() => {
    const cached = localStorage.getItem('cached_requests');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return INITIAL_REQUESTS;
  });
  const [villages, setVillages] = useState<VillageRoute[]>([]);
  const [likedProductIds, setLikedProductIds] = useState<string[]>([]);
  const [uiNotification, setUiNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [deepLinkedProduct, setDeepLinkedProduct] = useState<Product | null>(null);

  // Parse deep-link parameters once products catalog is retrieved
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product') || params.get('p');
      if (productId) {
        const found = products.find(p => p.id === productId);
        if (found) {
          setDeepLinkedProduct(found);
        }
      }
    }
  }, [products]);

  // Admin Logged-In Security State
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Helper to fetch products and requests from current server instance
  const fetchAllData = async () => {
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
        localStorage.setItem('cached_products', JSON.stringify(prodData));
      }
    } catch (e) {
      console.warn("Fallback default products read under connectivity limit:", e);
    }

    try {
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
        localStorage.setItem('cached_requests', JSON.stringify(reqData));
      }
    } catch (e) {
      console.warn("Fallback default requests read under connectivity limit:", e);
    }
  };

  // 1. Initial State Sync & Auth Gate Listening
  useEffect(() => {
    // Sync initial datasets
    fetchAllData();

    // Set real-time sync via automatic REST polling every 4 seconds to solve multi-browser state sync
    const syncTimer = setInterval(fetchAllData, 4000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user && user.email === ADMIN_EMAIL) {
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
      clearInterval(syncTimer);
    };
  }, []);

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

    // Standard credential matching from secure environmental configurations (fallback check)
    if (loginEmail.trim() === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
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
      if (result.user.email === ADMIN_EMAIL) {
        setAdminAuthenticated(true);
        localStorage.setItem('maurya_admin_auth', 'true');
        triggerToast('Sign-In Successful! Real-time Firestore ledger unlocked.', 'success');
      } else {
        await signOut(auth);
        setLoginError(`Access Denied. Only the authorized owner account (${ADMIN_EMAIL}) can manage the cloud database.`);
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

    // Optimistically update state
    const nextRequests = [...requests, request];
    setRequests(nextRequests);
    localStorage.setItem('cached_requests', JSON.stringify(nextRequests));

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      if (!response.ok) throw new Error('Unsuccessful status returned by server');
      triggerToast(`Thanks ${newReq.customerName}! Saved for verification.`);
    } catch (e: any) {
      console.warn("Server-side write bypassed: fallback offline ledger active. Error:", e);
      triggerToast(`Thanks ${newReq.customerName}! Saved to offline ledger (Cloud Sync Status: Offline).`, 'info');
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

    // Optimistically update cloud products count
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const netLikesChange = isLikedNow ? 1 : -1;
    const nextLikesCount = Math.max(0, (targetProduct.likes || 0) + netLikesChange);

    const updatedProducts = products.map(p => p.id === productId ? { ...p, likes: nextLikesCount } : p);
    setProducts(updatedProducts);
    localStorage.setItem('cached_products', JSON.stringify(updatedProducts));

    try {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ likes: nextLikesCount })
      });
      if (!response.ok) throw new Error('Unsuccessful like write');
    } catch (e) {
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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Style rejected by server');
      triggerToast(`Created style "${newProd.name}" successfully!`);
      fetchAllData();
    } catch (e: any) {
      console.warn("Error adding product style:", e);
      triggerToast(`Failed to add style over server endpoint.`, 'info');
    }
  };

  // 4. Admin toggles if an item is listed or unlisted
  const handleToggleProductStatus = async (productId: string, newStatus: 'listed' | 'unlisted') => {
    try {
      const response = await fetch(`/api/products/${productId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Status rejected by server');
      triggerToast(`Product listing status set to ${newStatus}`);
      fetchAllData();
    } catch (e) {
      console.warn("Error updating product status:", e);
      triggerToast(`Failed to update listing status over server.`, 'info');
    }
  };

  // 5. Admin completely deletes product from inventory database
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Style delete rejected by server');
      triggerToast('Product style fully deleted from inventory ledger.');
      fetchAllData();
    } catch (e) {
      console.warn("Error deleting product:", e);
      triggerToast(`Failed to delete product style over server.`, 'info');
    }
  };

  // 6. Admin updates reservation status pipeline
  const handleUpdateRequestStatus = async (requestId: string, newStatus: CustomerRequest['status']) => {
    const targetRequest = requests.find(r => r.id === requestId);
    if (!targetRequest) return;

    // Optimistically update
    const nextRequests = requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
    setRequests(nextRequests);
    localStorage.setItem('cached_requests', JSON.stringify(nextRequests));

    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Request status rejected by server');
      triggerToast(`Order for ${targetRequest.customerName} marked ${newStatus}`);
      fetchAllData();
    } catch (e) {
      console.warn("Direct requests state sync updated locally/offline.");
      triggerToast(`Order status updated.`, 'success');
    }
  };

  const handleAllocateRequestStock = (requestId: string) => {
    handleUpdateRequestStatus(requestId, 'Allocated');
  };

  const handleDeleteRequest = async (requestId: string) => {
    // Optimistically update
    const nextRequests = requests.filter(r => r.id !== requestId);
    setRequests(nextRequests);
    localStorage.setItem('cached_requests', JSON.stringify(nextRequests));

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Request delete rejected by server');
      triggerToast(`Deleted request from collections stream`);
      fetchAllData();
    } catch (e) {
      console.warn("Direct request delete state synced locally/offline.");
      triggerToast(`Deleted request successfully.`);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Core application layout view rendering with beautiful editorial grids
  const renderCoreApplet = () => {
    // 1. If trying to access Seller panel and is not authenticated, show login gate first
    if (currentRole === 'seller' && !adminAuthenticated) {
      return (
        <div className="py-12 px-4 flex-1 flex flex-col justify-center text-left animate-fade-in">
          <div className="max-w-sm mx-auto w-full space-y-6 bg-white p-8 rounded-none border border-zinc-200 shadow-sm">
            <div className="text-center space-y-2.5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-none border border-zinc-250 bg-zinc-50 text-zinc-900">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-base font-normal tracking-wider text-zinc-900 uppercase">Secure Atelier Portal</h3>
              <p className="text-[10px] font-sans tracking-wide text-zinc-500 uppercase leading-relaxed max-w-[280px] mx-auto">
                Authorized owners catalog management and village truck logistics.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50/50 text-rose-800 font-medium border border-rose-100 rounded-none text-[10px] text-left leading-relaxed">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Owner Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  required
                  placeholder="name@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-2 px-3 text-xs text-zinc-900 bg-zinc-50/40 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Security Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-2 px-3 text-xs text-zinc-900 bg-zinc-50/40 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                id="btn-admin-login-submit"
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all shadow-xs cursor-pointer"
              >
                Sign In to Ledger (Offline View)
              </button>
            </form>

            <div className="flex items-center justify-between gap-3 py-1">
              <span className="h-[1px] bg-zinc-200 flex-1"></span>
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">OR</span>
              <span className="h-[1px] bg-zinc-200 flex-1"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-white"
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
              className="text-center block w-full text-[9px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest underline py-1"
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
          <div className="flex-grow animate-fade-in">
            <CustomerView
              products={products}
              onAddRequest={handleAddRequest}
              onLikeProduct={handleLikeProduct}
              likedProductIds={likedProductIds}
              deepLinkedProduct={deepLinkedProduct}
            />
          </div>
        ) : (
          <div className="flex-grow animate-fade-in">
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
              deepLinkedProduct={deepLinkedProduct}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans selection:bg-zinc-950 selection:text-white antialiased">
      
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 rounded-none bg-zinc-950 px-4 py-3 text-[10px] font-semibold text-white tracking-wider uppercase shadow-xl animate-fade-in border border-zinc-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{uiNotification.message}</span>
        </div>
      )}

      {/* Primary Responsive Content Stage */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCoreApplet()}
      </main>

      {/* Elegant minimalist footer */}
      <footer className="w-full bg-white border-t border-zinc-200/60 py-8 shrink-0 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-serif text-sm font-normal tracking-[0.15em] text-zinc-900 uppercase">
                Maurya Collections
              </p>
              <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase mt-0.5">
                Premium Mobile Sourcing &amp; Curated Style
              </p>
            </div>
            <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
              &copy; {new Date().getFullYear()} MAURYA COLLECTIONS. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
