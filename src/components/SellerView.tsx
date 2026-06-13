import React, { useState, useMemo } from 'react';
import { Product, CustomerRequest, VillageRoute, AgeGroup } from '../types';
import { 
  Plus, Search, Check, RefreshCw, MapPin, 
  AlertTriangle, Truck, Trash2, Package, Tag, 
  IndianRupee, PhoneCall, Mail, Layers, Calendar, HelpCircle
} from 'lucide-react';
import CreateProductModal from './CreateProductModal';

interface SellerViewProps {
  products: Product[];
  requests: CustomerRequest[];
  villages: VillageRoute[];
  onAddProduct: (product: Omit<Product, 'id' | 'likes' | 'reserved'>) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdateRequestStatus: (requestId: string, newStatus: CustomerRequest['status']) => void;
  onAllocateRequestStock: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

export default function SellerView({
  products,
  requests,
  villages,
  onAddProduct,
  onUpdateStock,
  onUpdateRequestStatus,
  onAllocateRequestStock,
  onDeleteRequest
}: SellerViewProps) {
  const [currentTab, setCurrentTab] = useState<'requests' | 'routes'>('requests');
  
  // Village filtering for requests
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('All');
  
  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Unique villages list from request submissions
  const submissionVillages = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.village) set.add(r.village);
    });
    return Array.from(set);
  }, [requests]);

  // Combined route requests check
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (selectedVillageFilter === 'All') return true;
      return r.village.toLowerCase() === selectedVillageFilter.toLowerCase();
    });
  }, [requests, selectedVillageFilter]);

  // Under-stocked alerts (Disappointments list)
  const procurementAlerts = useMemo(() => {
    const alerts: { request: CustomerRequest; product: Product | undefined; reason: string }[] = [];
    requests.forEach((r) => {
      if (r.status === 'Pending') {
        const product = products.find((p) => p.id === r.productId);
        if (!product) return;
        
        const remainingStock = product.stock - product.reserved;
        if (product.stock === 0) {
          alerts.push({ request: r, product, reason: 'Completely OUT OF STOCK in warehouse shelf! Procure this item first.' });
        } else if (remainingStock <= 0) {
          alerts.push({ request: r, product, reason: 'Physical stock allocated to other villagers. Bring another piece!' });
        }
      }
    });
    return alerts;
  }, [requests, products]);

  return (
    <div className="py-5">
      {/* Visual Analytics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Route Orders</span>
            <RefreshCw className="h-3 w-3 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <p className="text-2xl font-black mt-1">
            {requests.filter(r => r.status === 'Pending').length}
          </p>
          <span className="text-[9px] font-bold text-amber-300 font-mono tracking-tighter uppercase">Needs Allocation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Allocated on Routes</span>
          <p className="text-2xl font-black mt-1 text-slate-900">
            {requests.filter(r => r.status === 'Allocated').length}
          </p>
          <span className="text-[9px] font-bold text-emerald-600 font-mono tracking-tighter uppercase">Loaded in Truck</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Stock Ledger</span>
            <Package className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <p className="text-2xl font-black mt-1 text-slate-900">{products.length} Garments</p>
          <span className="text-[9px] font-bold text-slate-450 font-mono">Mobile collection styles</span>
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
      <div className="mb-4 flex space-x-1 border-b border-slate-150">
        <button
          type="button"
          onClick={() => setCurrentTab('requests')}
          className={`pb-2.5 px-3 text-[11px] font-black uppercase tracking-wider relative ${
            currentTab === 'requests'
              ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold'
              : 'text-slate-450 hover:text-slate-900 font-bold'
          }`}
        >
          Demands
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('routes')}
          className={`pb-2.5 px-3 text-[11px] font-black uppercase tracking-wider relative ${
            currentTab === 'routes'
              ? 'text-slate-900 border-b-2 border-slate-900 font-extrabold'
              : 'text-slate-450 hover:text-slate-900 font-bold'
          }`}
        >
          Visit Routes
        </button>
      </div>

      {/* Switch panels */}

      {/* 1. Requests Area */}
      {currentTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 border rounded-xl border-slate-150 text-left">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Sort by Customer Village:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedVillageFilter('All')}
                  className={`py-1 px-2.5 rounded text-[10px] font-black uppercase ${
                    selectedVillageFilter === 'All'
                      ? 'bg-slate-900 text-amber-400'
                      : 'bg-white border text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Inputs
                </button>
                {submissionVillages.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVillageFilter(v)}
                    className={`py-1 px-2.5 rounded text-[10px] font-bold ${
                      selectedVillageFilter.toLowerCase() === v.toLowerCase()
                        ? 'bg-slate-900 text-amber-400 font-black'
                        : 'bg-white border text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all self-start sm:self-center cursor-pointer"
            >
              <Plus className="h-4 w-4 text-amber-400" />
              <span>Upload Style</span>
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border rounded-xl border-dashed border-slate-200">
              <Package className="h-8 w-8 text-slate-350 mx-auto mb-2" />
              <h3 className="text-xs font-bold text-slate-850 uppercase">No booking records found</h3>
              <p className="mt-1 text-[11px] text-slate-500">When people submit interest forms from Rampur, they show here immediately.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {filteredRequests.map((req) => {
                const product = products.find((p) => p.id === req.productId);
                const isOutOfStock = product ? product.stock === 0 : true;
                const canAllocate = product && (product.stock - product.reserved) > 0;

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border transition-all bg-white hover:border-slate-300 ${
                      req.status === 'Allocated' ? 'border-l-4 border-l-emerald-600' :
                      req.status === 'Delivered' ? 'bg-slate-50/60 opacity-75' :
                      'border-slate-150'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-905 text-sm">{req.customerName}</h4>
                            <span className="bg-slate-100 text-[10px] text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              📞 {req.phone}
                            </span>
                          </div>
                          {req.email && req.email !== 'default@route.co' && (
                            <p className="text-[9px] font-bold text-slate-450 font-mono mt-0.5">{req.email}</p>
                          )}
                          <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Village: <strong className="text-slate-900">{req.village}</strong>
                          </p>
                        </div>
                        
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Allocated' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Delivered' ? 'bg-slate-100 text-slate-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          ● {req.status}
                        </span>
                      </div>

                      {/* Item description */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        <p className="text-[11px] font-medium text-slate-650 leading-snug">
                          Item: <strong className="text-slate-950 font-black">{req.productName}</strong>
                        </p>
                        <div className="flex space-x-2 mt-1">
                          <span className="text-[10px] font-mono font-bold">Size: <strong className="bg-white px-1 py-0.5 border rounded text-slate-800">{req.requestedSize}</strong></span>
                          <span className="text-[10px] font-mono font-bold">Color: <strong className="bg-white px-1 py-0.5 border rounded text-slate-800">{req.requestedColor}</strong></span>
                        </div>
                        {req.notes && (
                          <p className="text-[10px] text-indigo-700/80 italic mt-1.5 bg-indigo-50/20 px-1 py-0.5">
                            &ldquo;{req.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Operation Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                        <span className="text-[9px] font-mono text-slate-400">Date: {req.dateRequested}</span>
                        
                        <div className="flex gap-1">
                          {req.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => onAllocateRequestStock(req.id)}
                              disabled={!canAllocate}
                              className={`py-1 px-2.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                                canAllocate
                                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border'
                              }`}
                            >
                              <Check className="h-3 w-3" />
                              <span>Lock Stock</span>
                            </button>
                          )}

                          {req.status === 'Allocated' && (
                            <button
                              type="button"
                              onClick={() => onUpdateRequestStatus(req.id, 'Delivered')}
                              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black uppercase flex items-center gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Handover Paid</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteRequest(req.id)}
                            className="p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Cancel Request"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Routes Area */}
      {currentTab === 'routes' && (
        <div className="bg-white p-4 border rounded-2xl border-slate-150 text-left space-y-3.5">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4.5 w-4.5 text-amber-600" />
            <h4 className="text-xs font-black uppercase text-slate-900">Weekly Route Schedule</h4>
          </div>
          <p className="text-[10px] text-slate-550 leading-relaxed">
            These are the standard schedules you visit on weekly tracks. You can coordinate and view how many locks or order demands are outstanding on each village route instantly.
          </p>

          <div className="space-y-3 pt-2">
            {villages.map((v) => {
              const count = requests.filter(r => r.village.toLowerCase() === v.name.toLowerCase()).length;
              return (
                <div key={v.id} className="p-3 border rounded-xl bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">{v.name}</h5>
                    <p className="text-[11px] text-amber-700 font-bold mt-0.5 flex items-center gap-1 inline-block">
                      <span>🔄 Every {v.visitDay}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-white border px-2 py-1 rounded-lg text-slate-600 font-bold block">
                      {count} requested
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modular Product Upload Dialog with Preview Support */}
      <CreateProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={onAddProduct}
      />

    </div>
  );
}
