import React, { useState, useEffect } from 'react';
import { Product, CustomerRequest, VillageRoute } from './types';
import { INITIAL_PRODUCTS, INITIAL_REQUESTS, INITIAL_VILLAGES } from './data/mockData';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import SellerView from './components/SellerView';
import { CheckCircle2, Lock } from 'lucide-react';

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

  // Load from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('route_products');
    const savedRequests = localStorage.getItem('route_requests');
    const savedVillages = localStorage.getItem('route_villages');
    const savedLikes = localStorage.getItem('route_likes');
    const savedAdminAuth = localStorage.getItem('maurya_admin_auth');

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((p: any) => ({
            ...p,
            sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? p.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? p.colors.split(',').map((c: string) => c.trim()).filter(Boolean) : []),
            images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? p.images.split(',').map((i: string) => i.trim()).filter(Boolean) : (p.image ? [p.image] : [])),
            likes: typeof p.likes === 'number' ? p.likes : 0,
            priceMin: typeof p.priceMin === 'number' ? p.priceMin : (typeof p.price === 'number' ? p.price : 0),
            priceMax: typeof p.priceMax === 'number' ? p.priceMax : (typeof p.price === 'number' ? p.price : 0),
            category: p.category || 'Apparel',
            status: p.status === 'unlisted' ? 'unlisted' : 'listed',
          }));
          setProducts(sanitized);
        } else {
          setProducts(INITIAL_PRODUCTS);
          localStorage.setItem('route_products', JSON.stringify(INITIAL_PRODUCTS));
        }
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('route_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedRequests) {
      try {
        const parsed = JSON.parse(savedRequests);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((r: any) => ({
            ...r,
            requestedColor: r.requestedColor || 'Standard',
            requestedSize: r.requestedSize || 'N/A',
            requestedAgeGroup: r.requestedAgeGroup || 'Kids (5-12)',
            village: r.village || 'Rampur',
          }));
          setRequests(sanitized);
        } else {
          setRequests(INITIAL_REQUESTS);
          localStorage.setItem('route_requests', JSON.stringify(INITIAL_REQUESTS));
        }
      } catch (e) {
        setRequests(INITIAL_REQUESTS);
      }
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem('route_requests', JSON.stringify(INITIAL_REQUESTS));
    }

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

    if (savedAdminAuth === 'true') {
      setAdminAuthenticated(true);
    }
  }, []);

  // Persists states helper
  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('route_products', JSON.stringify(updatedProducts));
  };

  const saveRequestsToStorage = (updatedRequests: CustomerRequest[]) => {
    setRequests(updatedRequests);
    localStorage.setItem('route_requests', JSON.stringify(updatedRequests));
  };

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setUiNotification({ message, type });
    setTimeout(() => {
      setUiNotification(null);
    }, 3500);
  };

  // Auth Handler
  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Exact requested admin account credentials
    if (loginEmail.trim() === 'maurya.rahul6820@gmail.com' && loginPassword === 'Rahul@1234') {
      setAdminAuthenticated(true);
      localStorage.setItem('maurya_admin_auth', 'true');
      triggerToast('Welcome back, Rahul Maurya! Secure admin ledger active.', 'success');
      // Reset input
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid Administrator credentials. Please verify your email and password.');
    }
  };

  const handleAdminSignOut = () => {
    setAdminAuthenticated(false);
    localStorage.removeItem('maurya_admin_auth');
    setCurrentRole('customer'); // Return safely to customer shop catalog
    triggerToast('Logged out of Admin Session safely.', 'info');
  };

  // 1. Customer submits interest request
  const handleAddRequest = (newReq: Omit<CustomerRequest, 'id' | 'dateRequested' | 'status'>) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const request: CustomerRequest = {
      ...newReq,
      id: `req-${Date.now()}`,
      dateRequested: formattedDate,
      status: 'Pending'
    };

    const updatedRequests = [request, ...requests];
    saveRequestsToStorage(updatedRequests);
    triggerToast(`Thanks ${newReq.customerName}! Saved for verification.`);
  };

  // 2. Customer likes an item
  const handleLikeProduct = (productId: string) => {
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

    // Update product likes counts
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          likes: Math.max(0, p.likes + (isLikedNow ? 1 : -1))
        };
      }
      return p;
    });
    saveProductsToStorage(updatedProducts);
  };

  // 3. Admin adds a whole new clothing style
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'likes'>) => {
    const product: Product = {
      ...newProd,
      id: `p-${Date.now()}`,
      likes: 0,
      status: 'listed'
    };

    const updatedProducts = [product, ...products];
    saveProductsToStorage(updatedProducts);
    triggerToast(`Created style "${newProd.name}" successfully!`);
  };

  // 4. Admin toggles if an item is listed or unlisted
  const handleToggleProductStatus = (productId: string, newStatus: 'listed' | 'unlisted') => {
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    saveProductsToStorage(updatedProducts);
    triggerToast(`Product listing status set to ${newStatus}`);
  };

  // 5. Admin completely deletes product from inventory
  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    saveProductsToStorage(updatedProducts);
    triggerToast('Product style fully deleted from inventory ledger.');
  };

  // 6. Admin updates reservation status pipeline
  const handleUpdateRequestStatus = (requestId: string, newStatus: CustomerRequest['status']) => {
    const targetRequest = requests.find(r => r.id === requestId);
    if (!targetRequest) return;

    const oldStatus = targetRequest.status;
    if (oldStatus === newStatus) return;

    const updatedRequests = requests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    saveRequestsToStorage(updatedRequests);
    triggerToast(`Order for ${targetRequest.customerName} marked ${newStatus}`);
  };

  const handleAllocateRequestStock = (requestId: string) => {
    handleUpdateRequestStatus(requestId, 'Allocated');
  };

  const handleDeleteRequest = (requestId: string) => {
    const updatedRequests = requests.filter(r => r.id !== requestId);
    saveRequestsToStorage(updatedRequests);
    triggerToast(`Deleted request from collections stream`);
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
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow"
              >
                Sign In to Ledger
              </button>
            </form>

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
            Maurya Collections &copy; 2026 &bull; Real-time rural clothing trucks ledger system &bull; Fully Responsive Edition
          </p>
        </div>
      </footer>
    </div>
  );
}
