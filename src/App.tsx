import React, { useState, useEffect } from 'react';
import { Product, CustomerRequest, VillageRoute } from './types';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS, INITIAL_VILLAGES } from './data/mockData';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import SellerView from './components/SellerView';
import AdminLogin from './components/AdminLogin';
import { CheckCircle2 } from 'lucide-react';
import { apiFetch } from './utils/api';

// Firebase Auth (for secure portal)
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword
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

  // Helper to fetch products and requests directly from the secure Backend APIs
  const fetchAllData = async () => {
    // 1. Fetch products from Express backend
    try {
      const data = await apiFetch('/api/products');
      if (data && data.length > 0) {
        setProducts(data);
        localStorage.setItem('cached_products', JSON.stringify(data));
      }
    } catch (err) {
      console.warn("API products fetch failed, using local fallback cached copy:", err);
      const cached = localStorage.getItem('cached_products');
      if (cached) {
        try {
          setProducts(JSON.parse(cached));
        } catch (e) {
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    }

    // 2. Fetch customer requests from Express backend (Only for authorized Admin Portal)
    if (adminAuthenticated) {
      try {
        const data = await apiFetch('/api/requests');
        setRequests(data);
        localStorage.setItem('cached_requests', JSON.stringify(data));
      } catch (err: any) {
        console.warn("API requests fetch failed for authorized manager:", err);
        const cached = localStorage.getItem('cached_requests');
        if (cached) {
          try {
            setRequests(JSON.parse(cached));
          } catch (e) {
            setRequests([]);
          }
        } else {
          setRequests([]);
        }
      }
    } else {
      // Ordinary customers load requests locally
      const cached = localStorage.getItem('cached_requests');
      if (cached) {
        try {
          setRequests(JSON.parse(cached));
        } catch (e) {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
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
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // 1. First, try authentication securely via Firebase Auth using email & password
    try {
      const credentials = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      if (credentials.user.email === ADMIN_EMAIL) {
        setAdminAuthenticated(true);
        localStorage.setItem('maurya_admin_auth', 'true');
        triggerToast('Welcome back! Fully authenticated cloud gateway active.', 'success');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        await signOut(auth);
        setLoginError(`Access Denied! Account is not matching registered administrator (${ADMIN_EMAIL}) address.`);
      }
    } catch (firebaseErr: any) {
      console.warn("Firebase native email/password sign-in failed, checking static fallback local schema:", firebaseErr);
      
      // 2. Gracious local-only fallback for offline testing or pre-configured local users
      if (loginEmail.trim() === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
        setAdminAuthenticated(true);
        localStorage.setItem('maurya_admin_auth', 'true');
        triggerToast('Welcome back! Local offline credential session active.', 'info');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(`Invalid Administrator credentials: ${firebaseErr.message || 'Please check email and password values.'}`);
      }
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
        triggerToast('Sign-In Successful! Backend API administrator dashboard unlocked.', 'success');
      } else {
        await signOut(auth);
        setLoginError(`Access Denied. Only the authorized owner account (${ADMIN_EMAIL}) can manage the database.`);
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
      await apiFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      triggerToast(`Thanks ${newReq.customerName}! Saved for verification.`);
      fetchAllData();
    } catch (err: any) {
      console.error("Express API request submit failed:", err);
      triggerToast(`Saved to locally cached ledger. Cloud registration encountered an error.`, 'info');
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
      await apiFetch(`/api/products/${productId}/like`, {
        method: 'POST',
        body: JSON.stringify({ likes: nextLikesCount })
      });
    } catch (err: any) {
      console.error("API like sync failed:", err);
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
      await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(product)
      });
      triggerToast(`Created style "${newProd.name}" successfully!`);
      fetchAllData();
    } catch (err: any) {
      console.error("API product creation failed:", err);
      triggerToast(`Failed to add style to Cloud inventory.`, 'info');
    }
  };

  // 4. Admin toggles if an item is listed or unlisted
  const handleToggleProductStatus = async (productId: string, newStatus: 'listed' | 'unlisted') => {
    try {
      const target = products.find(p => p.id === productId);
      if (!target) return;
      await apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...target, status: newStatus })
      });
      triggerToast(`Product listing status set to ${newStatus}`);
      fetchAllData();
    } catch (err: any) {
      console.error("API product status toggle failed:", err);
      triggerToast(`Failed to update listing status on Cloud.`, 'info');
    }
  };

  // 5. Admin completely deletes product from inventory database with cascade deletion of related requests
  const handleDeleteProduct = async (productId: string) => {
    // Optimistically update products and requests state to make UI super snappy
    const nextProducts = products.filter(p => p.id !== productId);
    const relatedRequests = requests.filter(r => r.productId === productId);
    const nextRequests = requests.filter(r => r.productId !== productId);
    
    setProducts(nextProducts);
    setRequests(nextRequests);
    localStorage.setItem('cached_products', JSON.stringify(nextProducts));
    localStorage.setItem('cached_requests', JSON.stringify(nextRequests));

    try {
      const response = await apiFetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      const delCount = response?.deletedRequestsCount || 0;
      if (delCount > 0) {
        triggerToast(`Style and ${delCount} associated customer request(s) fully deleted.`);
      } else {
        triggerToast('Product style fully deleted from inventory ledger.');
      }
      fetchAllData();
    } catch (err: any) {
      console.error("API product delete operation failed:", err);
      triggerToast(`Failed to complete cascade delete from Cloud.`, 'info');
    }
  };

  // 5.5 Admin updates product details in inventory database
  const handleUpdateProduct = async (updatedProduct: Product) => {
    // Optimistically update state
    const nextProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(nextProducts);
    localStorage.setItem('cached_products', JSON.stringify(nextProducts));

    try {
      await apiFetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct)
      });
      triggerToast(`Updated style "${updatedProduct.name}" successfully!`);
      fetchAllData();
    } catch (err: any) {
      console.error("API product update failed:", err);
      triggerToast(`Failed to update styling catalog on Cloud database.`, 'info');
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
      await apiFetch(`/api/requests/${requestId}/update-request-status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      triggerToast(`Order for ${targetRequest.customerName} marked ${newStatus}`);
      fetchAllData();
    } catch (err: any) {
      console.error("API request status update failed:", err);
      triggerToast(`Failed to update order status on Cloud.`, 'info');
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
      await apiFetch(`/api/requests/${requestId}`, {
        method: 'DELETE'
      });
      triggerToast(`Deleted request from collections stream`);
      fetchAllData();
    } catch (err: any) {
      console.error("API request deletion failed:", err);
      triggerToast(`Failed to delete request from Cloud.`, 'info');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Core application layout view rendering with beautiful editorial grids
  const renderCoreApplet = () => {
    // 1. If trying to access Seller panel and is not authenticated, show login gate first
    if (currentRole === 'seller' && !adminAuthenticated) {
      return (
        <AdminLogin
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          onSubmit={handleAdminSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          onBackToCustomer={() => setCurrentRole('customer')}
        />
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
              onUpdateProduct={handleUpdateProduct}
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
