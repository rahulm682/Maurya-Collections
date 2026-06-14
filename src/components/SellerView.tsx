import React, { useState, useEffect, useMemo } from 'react';
import { Product, CustomerRequest, VillageRoute, AgeGroup } from '../types';
import { 
  Plus, Search, Check, Minus, RefreshCw, MapPin, 
  AlertTriangle, Truck, Trash2, Package, Tag, 
  IndianRupee, PhoneCall, Mail, Layers, Calendar, HelpCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import CreateProductModal from './CreateProductModal';
import ProductDetailsModal from './ProductDetailsModal';

interface SellerViewProps {
  products: Product[];
  requests: CustomerRequest[];
  villages: VillageRoute[];
  onAddProduct: (product: Omit<Product, 'id' | 'likes'>) => void;
  onToggleProductStatus: (productId: string, newStatus: 'listed' | 'unlisted') => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateRequestStatus: (requestId: string, newStatus: CustomerRequest['status']) => void;
  onAllocateRequestStock: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  deepLinkedProduct?: Product | null;
}

export default function SellerView({
  products,
  requests,
  villages,
  onAddProduct,
  onToggleProductStatus,
  onDeleteProduct,
  onUpdateRequestStatus,
  onAllocateRequestStock,
  onDeleteRequest,
  deepLinkedProduct
}: SellerViewProps) {
  const [currentTab, setCurrentTab] = useState<'requests' | 'routes' | 'products'>('requests');
  
  // Product filters
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'listed' | 'unlisted'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'requests' | 'likes' | 'villages'>('name');
  
  // Details Modal selection/view state
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // Village filtering for requests
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('All');
  const [selectedRequestStatusFilter, setSelectedRequestStatusFilter] = useState<string>('All');
  const [requestsSortBy, setRequestsSortBy] = useState<'newest' | 'oldest' | 'customerName'>('newest');

  // High performance infinite scroll/lazy load states
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // High performance infinite scroll/lazy load states for demands
  const [visibleRequestsCount, setVisibleRequestsCount] = useState(10);
  const [isLoadingMoreRequests, setIsLoadingMoreRequests] = useState(false);
  const requestsObserverTarget = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(12);
    setVisibleRequestsCount(10);
  }, [productSearch, statusFilter, sortBy, currentTab, selectedVillageFilter, selectedRequestStatusFilter, requestsSortBy]);

  useEffect(() => {
    if (deepLinkedProduct) {
      setSelectedProductForDetails(deepLinkedProduct);
    }
  }, [deepLinkedProduct]);
  
  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Unique villages list from request submissions
  const submissionVillages = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.village) set.add(r.village);
    });
    return Array.from(set);
  }, [requests]);

  // Combined route requests check with Village & Status filtering and Sorting
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // 1. Village filter
    if (selectedVillageFilter !== 'All') {
      result = result.filter(
        (r) => r.village.toLowerCase() === selectedVillageFilter.toLowerCase()
      );
    }

    // 2. Status filter
    if (selectedRequestStatusFilter !== 'All') {
      result = result.filter(
        (r) => r.status.toLowerCase() === selectedRequestStatusFilter.toLowerCase()
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (requestsSortBy === 'customerName') {
        return a.customerName.localeCompare(b.customerName);
      }
      
      // Extract timestamps if present in IDs format 'req-timestamp'
      const timeVal = (idStr: string, dateStr: string) => {
        if (idStr.startsWith('req-')) {
          const parts = idStr.split('-');
          const num = parseInt(parts[parts.length - 1]);
          if (!isNaN(num)) return num;
        }
        return new Date(dateStr).getTime() || 0;
      };

      const timeA = timeVal(a.id, a.dateRequested);
      const timeB = timeVal(b.id, b.dateRequested);

      if (requestsSortBy === 'newest') {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
    });

    return result;
  }, [requests, selectedVillageFilter, selectedRequestStatusFilter, requestsSortBy]);

  // Under-stocked alerts are disabled as stock tracking is removed from the app
  const procurementAlerts: any[] = [];

  // Combined product catalog search, status filter, and dynamic sorting
  const filteredProductsList = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    // 1. Search text filter
    let list = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.ageGroup.toLowerCase().includes(q)
      );
    });

    // 2. Status listing filter
    if (statusFilter !== 'all') {
      list = list.filter((p) => {
        const currentStatus = p.status || 'listed';
        return currentStatus === statusFilter;
      });
    }

    // 3. Compute popularity stats
    const listWithStats = list.map((p) => {
      const matchRequests = requests.filter((r) => r.productId === p.id);
      const uniqueVils = Array.from(new Set(matchRequests.map((r) => r.village.trim().toLowerCase())));
      return {
        ...p,
        totalRequests: matchRequests.length,
        totalLikes: p.likes || 0,
        totalVillages: uniqueVils.length
      };
    });

    // 4. Sort selection logic
    if (sortBy === 'name') {
      listWithStats.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'requests') {
      listWithStats.sort((a, b) => b.totalRequests - a.totalRequests);
    } else if (sortBy === 'likes') {
      listWithStats.sort((a, b) => b.totalLikes - a.totalLikes);
    } else if (sortBy === 'villages') {
      listWithStats.sort((a, b) => b.totalVillages - a.totalVillages);
    }

    return listWithStats;
  }, [products, productSearch, statusFilter, sortBy, requests]);

  useEffect(() => {
    let timerId: any = null;

    const checkScrollLoad = () => {
      if (isLoadingMore || visibleCount >= filteredProductsList.length) return;
      if (!observerTarget.current) return;

      const rect = observerTarget.current.getBoundingClientRect();
      // If the top of the sentinel is within 300px of the bottom of the viewport
      if (rect.top <= window.innerHeight + 300 && rect.height > 0) {
        setIsLoadingMore(true);
        timerId = setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 8, filteredProductsList.length));
          setIsLoadingMore(false);
        }, 300);
      }
    };

    // Check immediately on render
    checkScrollLoad();

    // Listen on multiple levels to catch all potential scroll events (window, document, or custom frame)
    window.addEventListener('scroll', checkScrollLoad, { passive: true });
    window.addEventListener('resize', checkScrollLoad);
    document.addEventListener('scroll', checkScrollLoad, { passive: true });

    // Ultimate fallback for sandboxed iframes where scroll events might not propagate: periodic layout checks
    const intervalId = setInterval(checkScrollLoad, 300);

    return () => {
      window.removeEventListener('scroll', checkScrollLoad);
      window.removeEventListener('resize', checkScrollLoad);
      document.removeEventListener('scroll', checkScrollLoad);
      clearInterval(intervalId);
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [visibleCount, filteredProductsList.length, isLoadingMore, currentTab, showAddProductModal, selectedProductForDetails]);

  useEffect(() => {
    let timerId: any = null;

    const checkRequestsScrollLoad = () => {
      if (isLoadingMoreRequests || visibleRequestsCount >= filteredRequests.length) return;
      if (!requestsObserverTarget.current) return;

      const rect = requestsObserverTarget.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 300 && rect.height > 0) {
        setIsLoadingMoreRequests(true);
        timerId = setTimeout(() => {
          setVisibleRequestsCount((prev) => Math.min(prev + 10, filteredRequests.length));
          setIsLoadingMoreRequests(false);
        }, 300);
      }
    };

    checkRequestsScrollLoad();

    window.addEventListener('scroll', checkRequestsScrollLoad, { passive: true });
    window.addEventListener('resize', checkRequestsScrollLoad);
    document.addEventListener('scroll', checkRequestsScrollLoad, { passive: true });

    const intervalId = setInterval(checkRequestsScrollLoad, 300);

    return () => {
      window.removeEventListener('scroll', checkRequestsScrollLoad);
      window.removeEventListener('resize', checkRequestsScrollLoad);
      document.removeEventListener('scroll', checkRequestsScrollLoad);
      clearInterval(intervalId);
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [visibleRequestsCount, filteredRequests.length, isLoadingMoreRequests, currentTab]);

  return (
    <div className="py-6 font-sans">
      {/* Visual Analytics Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left animate-fade-in">
        
        <div className="bg-zinc-950 text-white p-6 rounded-none border border-zinc-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Pending Demands Ledger</span>
              <RefreshCw className="h-3 w-3 text-zinc-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-3xl font-mono font-semibold tracking-tight mt-2.5">
              {requests.filter(r => r.status === 'Pending').length}
            </p>
          </div>
          <span className="text-[8px] font-bold text-zinc-400 font-mono tracking-wider uppercase mt-4 block">Waiting Route Packing</span>
        </div>

        <div className="bg-white p-6 rounded-none border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Allocated on Route Trip</span>
            <p className="text-3xl font-mono font-semibold tracking-tight mt-2.5 text-zinc-900">
              {requests.filter(r => r.status === 'Allocated').length}
            </p>
          </div>
          <span className="text-[8px] font-bold text-zinc-500 font-mono tracking-wider uppercase mt-4 block">Locked Inside Truck</span>
        </div>

        <div className="bg-white p-6 rounded-none border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Active Style Templates</span>
              <Package className="h-4 w-4 text-zinc-450" />
            </div>
            <p className="text-3xl font-mono font-semibold tracking-tight mt-2.5 text-zinc-900">{products.length}</p>
          </div>
          <span className="text-[8px] font-bold text-zinc-500 font-mono tracking-wider uppercase mt-4 block">Mobile Collection catalog</span>
        </div>

      </div>

      {/* Intelligent Procurement Tasks Alert */}
      {procurementAlerts.length > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/45 p-4 text-left">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                Warehouse Procurement List
              </h4>
              <p className="text-[10px] text-rose-800/80 mt-0.5 leading-relaxed">
                The following styles have been requested by villagers but truck stock is insufficient. Pack additional pieces before starting your route journey!
              </p>
              
              <div className="mt-3 overflow-hidden rounded-xl border border-rose-200 bg-white">
                <table className="min-w-full divide-y divide-rose-100 text-[10px] font-medium">
                  <thead className="bg-rose-50 text-[9px] text-rose-900 font-bold uppercase tracking-wider text-left">
                    <tr>
                      <th className="px-3 py-2">Requested Item</th>
                      <th className="px-3 py-2">Customer &amp; Village</th>
                      <th className="px-3 py-2">Fitted Size / Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 text-slate-800 text-left">
                    {procurementAlerts.map(({ request, product }) => (
                      <tr key={request.id}>
                        <td className="px-3 py-2 font-bold truncate max-w-[120px]">{product?.name}</td>
                        <td className="px-3 py-2">
                          <strong>{request.customerName}</strong>
                          <span className="text-slate-400 block font-mono">{request.village}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">{request.requestedSize}</span>
                          <span className="text-slate-450 block text-[9px] italic mt-0.5">{request.requestedColor}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="mb-6 flex space-x-1.5 border-b border-zinc-200 font-sans">
        <button
          type="button"
          onClick={() => setCurrentTab('requests')}
          className={`pb-3 px-3.5 text-[10px] font-bold uppercase tracking-widest relative transition-all ${
            currentTab === 'requests'
              ? 'text-zinc-950 border-b-2 border-zinc-950'
              : 'text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Active Demands ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('routes')}
          className={`pb-3 px-3.5 text-[10px] font-bold uppercase tracking-widest relative transition-all ${
            currentTab === 'routes'
              ? 'text-zinc-950 border-b-2 border-zinc-950'
              : 'text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Logistics Routes
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('products')}
          className={`pb-3 px-3.5 text-[10px] font-bold uppercase tracking-widest relative transition-all ${
            currentTab === 'products'
              ? 'text-zinc-950 border-b-2 border-zinc-950'
              : 'text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Atelier Styles Catalogue
        </button>
      </div>

      {/* Switch panels */}

      {/* 1. Requests Area */}
      {currentTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 border border-zinc-200 rounded-none text-left space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-serif text-sm font-normal text-zinc-900 uppercase tracking-wider">Demands Ledger Controls</h4>
                <p className="text-[9px] font-mono uppercase text-[#e4a853] mt-0.5 font-bold">Refine, sort, and manage village customer requests physically.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('products');
                  setShowAddProductModal(true);
                }}
                className="py-2 px-4 bg-zinc-950 hover:bg-zinc-850 text-white text-[9px] font-bold uppercase tracking-widest rounded-none flex items-center justify-center gap-1.5 transition-all self-start md:self-auto cursor-pointer shadow-xs border border-zinc-950"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Style</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
              {/* 1. Village Filter */}
              <div>
                <label htmlFor="req-filter-village" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Village Outlet
                </label>
                <select
                  id="req-filter-village"
                  value={selectedVillageFilter}
                  onChange={(e) => setSelectedVillageFilter(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-1.5 px-2 text-xs text-zinc-800 bg-[#FAF9F6] focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-all uppercase font-mono font-medium"
                >
                  <option value="All">All Village Outlets</option>
                  {submissionVillages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Status Filter */}
              <div>
                <label htmlFor="req-filter-status" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Status Pipeline
                </label>
                <select
                  id="req-filter-status"
                  value={selectedRequestStatusFilter}
                  onChange={(e) => setSelectedRequestStatusFilter(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-1.5 px-2 text-xs text-zinc-800 bg-[#FAF9F6] focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-all uppercase font-mono font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* 3. Sort Order */}
              <div>
                <label htmlFor="req-sort" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Sort Demands By
                </label>
                <select
                  id="req-sort"
                  value={requestsSortBy}
                  onChange={(e) => setRequestsSortBy(e.target.value as any)}
                  className="block w-full rounded-none border border-zinc-200 py-1.5 px-2 text-xs text-zinc-800 bg-[#FAF9F6] focus:bg-white focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-all uppercase font-mono font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="customerName">Customer Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-16 text-center bg-white border border-dashed rounded-none border-zinc-250 animate-fade-in">
              <Package className="h-6 w-6 text-zinc-400 mx-auto mb-3" />
              <h3 className="font-serif text-sm font-normal text-zinc-900 uppercase tracking-widest">No matching demands</h3>
              <p className="mt-1 text-[10px] tracking-wider uppercase text-zinc-500 font-mono">When villagers submit request forms, logs appear here immediately.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-fade-in">
                {filteredRequests.slice(0, visibleRequestsCount).map((req) => {
                  const product = products.find((p) => p.id === req.productId);
                  const canAllocate = !!product;

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-none border transition-all duration-200 bg-white hover:border-zinc-900 ${
                        req.status === 'Allocated' ? 'border-l-4 border-l-zinc-900' :
                        req.status === 'Delivered' ? 'bg-zinc-50/50 opacity-75' :
                        'border-zinc-200'
                      }`}
                    >
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-start justify-between font-sans">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h4 className="font-serif text-sm font-normal text-zinc-900">{req.customerName}</h4>
                              <span className="bg-zinc-100 text-[9px] font-mono text-zinc-850 font-bold px-1.5 py-0.5 rounded-none border border-zinc-200/50">
                                📞 {req.phone}
                              </span>
                            </div>
                            {req.email && req.email !== 'default@route.co' && (
                              <p className="text-[9px] font-semibold text-zinc-400 font-mono mt-0.5">{req.email}</p>
                            )}
                            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1.5 leading-none">
                              <span className="inline-block h-1.5 w-1.5 bg-zinc-950"></span>
                              Village Route: <strong className="text-zinc-900 tracking-wide font-semibold">{req.village}</strong>
                            </p>
                          </div>
                          
                          <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider font-mono border ${
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-250/50' :
                            req.status === 'Allocated' ? 'bg-zinc-950 text-white border-zinc-900' :
                            req.status === 'Delivered' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' :
                            'bg-rose-50 text-rose-805 border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        {/* Item description */}
                        <div className="bg-zinc-50 p-3.5 rounded-none border border-zinc-150">
                          <p className="text-[11px] font-medium text-zinc-650 leading-relaxed">
                            Garment Style: <strong className="text-zinc-950 font-semibold">{req.productName}</strong>
                          </p>
                          <div className="flex space-x-3 mt-1.5">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">Size Fit: <strong className="bg-[#FAF9F6] border border-zinc-200 px-1.5 py-0.5 text-zinc-800 font-bold">{req.requestedSize}</strong></span>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">Color Variant: <strong className="bg-[#FAF9F6] border border-zinc-200 px-1.5 py-0.5 text-zinc-805 font-bold">{req.requestedColor}</strong></span>
                          </div>
                          {req.notes && (
                            <div className="text-[10px] font-mono font-medium text-zinc-500 mt-2 bg-white/70 p-2.5 border border-zinc-150 leading-relaxed uppercase tracking-wide">
                              &ldquo;{req.notes}&rdquo;
                            </div>
                          )}
                        </div>
                        {/* Operation Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-100 pt-4 mt-2 gap-3 font-sans">
                          <span className="text-[9px] font-mono text-zinc-400">BOOKED ON: {req.dateRequested}</span>
                          
                          <div className="flex items-center justify-end gap-2.5">
                            {/* Dropdown status update */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Status:</span>
                              <select
                                id={`status-dropdown-${req.id}`}
                                value={req.status}
                                onChange={(e) => onUpdateRequestStatus(req.id, e.target.value as any)}
                                className="text-[9px] font-bold uppercase tracking-wider rounded-none border border-zinc-250 bg-[#FAF9F6] py-1 px-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer font-mono text-zinc-800"
                              >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Allocated">Allocated</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              id={`delete-request-btn-${req.id}`}
                              onClick={() => onDeleteRequest(req.id)}
                              className="p-1 px-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-none transition-colors border border-zinc-200"
                              title="Delete Request"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Infinite Scroll Sentinel / Active Demands Loader */}
              <div ref={requestsObserverTarget} className="mt-12 border-t border-dashed border-zinc-200 pt-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
                {visibleRequestsCount < filteredRequests.length ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-2 text-zinc-500 font-mono tracking-widest text-[9px] uppercase gap-2">
                      <span className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin"></span>
                      <span>Reviewing demands ledger...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVisibleRequestsCount((prev) => Math.min(prev + 10, filteredRequests.length))}
                      className="py-2.5 px-6 border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all cursor-pointer"
                    >
                      Load More Demands
                    </button>
                  </>
                ) : (
                  <p className="text-[8px] tracking-widest uppercase font-mono text-zinc-400">
                    📍 End of Demands ledger — Rahul Maurya Admin Panel
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. Routes Area */}
      {currentTab === 'routes' && (
        <div className="bg-white p-6 rounded-none border border-zinc-200 text-left space-y-4 font-sans animate-fade-in shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-zinc-900" />
            <h4 className="font-serif text-sm font-normal uppercase tracking-wider text-zinc-900">Weekly Truck Route Logistics</h4>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide leading-relaxed max-w-2xl">
            Schedules for mobile store road trips. Below, review the outstanding garment requests booked for each village community.
          </p>

          <div className="space-y-3 pt-2">
            {villages.map((v) => {
              const count = requests.filter(r => r.village.toLowerCase() === v.name.toLowerCase()).length;
              return (
                <div key={v.id} className="p-4 border rounded-none border-zinc-150 bg-zinc-50/50 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    <h5 className="font-serif text-sm font-normal text-zinc-900 tracking-wide">{v.name}</h5>
                    <p className="text-[9px] font-medium tracking-widest text-zinc-500 mt-1 uppercase flex items-center gap-1">
                      <span>🔄 Every {v.visitDay} Session</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono hover:border-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-none text-zinc-800 font-bold uppercase tracking-wider">
                      {count} requested holds
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Available Products Catalog Area */}
      {currentTab === 'products' && (
        selectedProductForDetails ? (
          <div id="inline-seller-product-details" className="space-y-6 text-left animate-fade-in w-full">
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <button
                type="button"
                onClick={() => setSelectedProductForDetails(null)}
                className="group py-2 px-4 border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Catalog</span>
              </button>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold">
                📍 SELLER ATELIER DIRECTORY
              </span>
            </div>

            <ProductDetailsModal
              product={selectedProductForDetails}
              onClose={() => setSelectedProductForDetails(null)}
              role="seller"
              requests={requests}
              onToggleStatus={onToggleProductStatus}
              onDeleteProduct={onDeleteProduct}
              isInline={true}
            />
          </div>
        ) : showAddProductModal ? (
          <div id="inline-add-product-form" className="space-y-6 text-left animate-fade-in w-full">
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="group py-2 px-4 border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Catalog</span>
              </button>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold">
                📍 UPLOAD STYLE LEDGER
              </span>
            </div>

            <CreateProductModal
              isOpen={showAddProductModal}
              onClose={() => setShowAddProductModal(false)}
              onAddProduct={(prod) => {
                onAddProduct(prod);
                setShowAddProductModal(false);
              }}
              isInline={true}
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans text-left">
          {/* Top Filter and Sorting System */}
          <div className="flex flex-col gap-5 bg-white p-6 border rounded-none border-zinc-200 text-left shadow-[0_1px_3px_rgba(0,0,0,0.01)] animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Filter */}
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Sartorial Search:</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search styles, frocks, lehengas..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="block w-full rounded-none border border-zinc-200 py-2.5 pl-9 pr-3 text-xs text-zinc-900 bg-zinc-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium transition-all"
                  />
                  <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Public Catalog State Filter:</label>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-2.5 px-3 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium cursor-pointer"
                >
                  <option value="all">Display All Styles (Archive + Public)</option>
                  <option value="listed">Publicly Listed Items Only</option>
                  <option value="unlisted">Unlisted (Stored / Hidden) Only</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Sort Inventory Ledger By:</label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="block w-full rounded-none border border-zinc-200 py-2.5 px-3 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium cursor-pointer"
                >
                  <option value="name">Product Name (A - Z)</option>
                  <option value="requests">Active Demand Popularity</option>
                  <option value="likes">Customer Favorites (Likes)</option>
                  <option value="villages">Road Dispersion (Unique Villages)</option>
                </select>
              </div>
            </div>

            {/* Sub Counter bar */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 flex-wrap gap-3">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">
                Showing <strong className="text-zinc-900 font-bold">{filteredProductsList.length}</strong> styles matching selection
              </span>
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Style</span>
              </button>
            </div>
          </div>

          {filteredProductsList.length === 0 ? (
            <div className="p-16 text-center bg-white border border-dashed rounded-none border-zinc-200 animate-fade-in col-span-full">
              <Package className="h-6 w-6 text-zinc-400 mx-auto mb-3" />
              <h3 className="font-serif text-sm font-normal text-zinc-900 uppercase tracking-widest">No matching designs</h3>
              <p className="mt-1 text-[10px] tracking-wider uppercase text-zinc-500 font-mono">Modify terms or clear fields to view atelier stock.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredProductsList.slice(0, visibleCount).map((p) => {
                const hasImage = p.images && p.images.length > 0;
                const pStatus = p.status || 'listed';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductForDetails(p)}
                    className="p-5 bg-white border border-zinc-200 rounded-none flex flex-col justify-between hover:border-zinc-900 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.01)] group cursor-pointer"
                  >
                    <div>
                      {/* Product identity header */}
                      <div className="flex gap-4 items-start mb-4">
                        {hasImage ? (
                          <img
                            src={p.images[0]}
                            referrerPolicy="no-referrer"
                            alt={p.name}
                            className="w-14 h-14 rounded-none object-cover shrink-0 border border-zinc-150 group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-none ${p.imageColor || 'bg-zinc-50'} flex items-center justify-center shrink-0 border border-zinc-150 text-zinc-400`}>
                            <Tag className="h-4 w-4" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-55 hover:bg-zinc-100 px-1.5 py-0.5 rounded-none border border-zinc-205">
                              {p.category}
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-105 text-zinc-800 px-1.5 py-0.5 rounded-none">
                              {p.gender}
                            </span>
                          </div>
                          <h4 className="font-serif text-xs font-normal text-zinc-900 truncate mt-1.5" title={p.name}>
                            {p.name}
                          </h4>
                          <p className="text-[10px] font-medium text-zinc-700 tracking-wide font-mono mt-0.5">
                            ₹{p.priceMin} - ₹{p.priceMax}
                          </p>
                        </div>
                      </div>

                      {/* Details specs list */}
                      <div className="border-t border-zinc-100 pt-3 pb-2.5 space-y-2 text-[10px] text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Age Segment:</span>
                          <span className="text-zinc-850 font-semibold tracking-wide bg-zinc-100 px-1.5 py-0.5 rounded-none">{p.ageGroup}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Sizes Offered:</span>
                          <span className="text-zinc-850 font-bold font-mono">{(p.sizes || []).join(', ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Color Palette:</span>
                          <span className="text-zinc-855 font-bold">{(p.colors || []).join(', ')}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-2.5 pb-1">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Likes count:</span>
                          <span className="text-zinc-900 font-bold flex items-center gap-0.5">
                            🖤 {p.totalLikes} Faves
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Custom holds:</span>
                          <span className="font-mono font-bold text-zinc-950 bg-zinc-100 px-1.5 py-0.5 rounded-none border border-zinc-200/50">
                            ✨ {p.totalRequests} Demands
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Village Dispersion:</span>
                          <span className="text-zinc-855 font-mono font-bold">📍 {p.totalVillages} Villages</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-2.5">
                          <span className="text-zinc-400 uppercase tracking-wider text-[8px] font-bold">Atelier Display:</span>
                          {pStatus === 'listed' ? (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200/50 font-mono">
                              Publicly Listed
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 px-1.5 py-0.5 border border-zinc-200 font-mono">
                              Hidden Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-4 h-8 flex items-center border-t border-zinc-100 pt-3" onClick={(e) => e.stopPropagation()}>
                      {deletingProductId === p.id ? (
                        <div className="flex gap-2 w-full items-center justify-between bg-zinc-50 border border-zinc-200 p-1 px-1.5 rounded-none animate-fade-in">
                          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider">Perm delete style?</span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(p.id);
                                setDeletingProductId(null);
                              }}
                              className="py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(null)}
                              className="py-1 px-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[9px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center w-full">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleProductStatus(p.id, pStatus === 'listed' ? 'unlisted' : 'listed');
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-none border text-[9px] font-bold uppercase tracking-widest text-center transition-all cursor-pointer ${
                              pStatus === 'listed'
                                ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                                : 'bg-zinc-950 border-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                          >
                            {pStatus === 'listed' ? 'Unlist Draft' : 'Make Public'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingProductId(p.id)}
                            className="py-1.5 px-2 bg-zinc-50 border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-650 rounded-none transition-all cursor-pointer"
                            title="Delete product permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-rose-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel / Seller Stock Loader */}
            <div ref={observerTarget} className="mt-12 border-t border-dashed border-zinc-200 pt-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
              {visibleCount < filteredProductsList.length ? (
                <>
                  <div className="flex flex-col items-center justify-center py-2 text-zinc-500 font-mono tracking-widest text-[9px] uppercase gap-2">
                    <span className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin"></span>
                    <span>Reviewing stock ledger...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 8, filteredProductsList.length))}
                    className="py-2.5 px-6 border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all cursor-pointer"
                  >
                    Load More Styles
                  </button>
                </>
              ) : (
                <p className="text-[8px] tracking-widest uppercase font-mono text-zinc-400">
                  📍 End of Sourced stock inventory — Rahul Maurya Admin Panel
                </p>
              )}
            </div>
          </>
        )}
        </div>
      )
    )}

    </div>
  );
}
