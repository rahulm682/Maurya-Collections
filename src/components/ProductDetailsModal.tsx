import React, { useState, useEffect } from 'react';
import { Product, CustomerRequest } from '../types';
import { 
  Heart, Share2, Copy, Check, ShoppingCart, X, 
  Tag, Award, HelpCircle, Layers, MapPin, Sparkles, Trash2, Eye, EyeOff
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  role: 'customer' | 'seller';
  isLiked?: boolean;
  onLikeToggle?: () => void;
  onRequestStyleHold?: () => void;
  // Admin analytics
  requests?: CustomerRequest[];
  onToggleStatus?: (productId: string, newStatus: 'listed' | 'unlisted') => void;
  onDeleteProduct?: (productId: string) => void;
  isInline?: boolean;
}

export default function ProductDetailsModal({
  product,
  onClose,
  role,
  isLiked = false,
  onLikeToggle,
  onRequestStyleHold,
  requests = [],
  onToggleStatus,
  onDeleteProduct,
  isInline = false
}: ProductDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setCopiedLink(false);
    setCopiedMessage(false);
    setConfirmDelete(false);
  }, [product]);

  // Derived Admin stats
  const productRequests = requests.filter(r => r.productId === product.id);
  const activeRequestsCount = productRequests.length;
  const uniqueVillages = Array.from(new Set(productRequests.map(r => r.village.trim().toLowerCase()))).length;

  // Make absolute deep-link URL for sharing using the query parameter structure
  const getShareUrl = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    return `${origin}${path}?product=${product.id}`;
  };

  // Formatted sharing description with premium marketing structure
  const getShareMessage = () => {
    return `🛍️ *Maurya Collections — Premium Mobile Sourcing* 🛍️

Check out this premium sartorial design curated for our next truck route!

✨ *${product.name}*
• *Category:* ${product.category}
• *Gender fit:* ${product.gender}
• *Age group:* ${product.ageGroup}
• *Sizes offered:* ${(product.sizes || []).join(', ')}
• *Colorways:* ${(product.colors || []).join(', ')}
• *Estimated cost range:* ₹${product.priceMin} - ₹${product.priceMax}

👇 View high-res coordinates & book your weekly route hold:
${getShareUrl()}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getShareMessage());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareMessage());
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const hasMultipleImages = product.images && product.images.length > 0;
  const currentImages = product.images || [];

  const detailsContent = (
    <div 
      id={`product-details-container-${product.id}`}
      className={`relative w-full ${isInline ? 'max-w-none' : 'max-w-4xl shadow-2xl my-auto md:max-h-[88vh] md:overflow-hidden'} bg-white rounded-none border border-zinc-200 flex flex-col md:flex-row text-left animate-slide-up`}
    >
      
      {/* Close Button Floating */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 h-9 w-9 bg-zinc-950 text-white rounded-none border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-sm font-light transition-all cursor-pointer"
        title="Close details"
      >
        ✕
      </button>

      {/* LEFT COLUMN: Large Photographer Studio Grid & Carousel */}
      <div className={`w-full md:w-[45%] bg-zinc-50 border-b md:border-b-0 md:border-r border-zinc-150 flex flex-col shrink-0 ${isInline ? '' : 'md:overflow-y-auto'}`}>
          {hasMultipleImages ? (
            <div className="flex-1 flex flex-col justify-center p-6 space-y-4">
              {/* Active full frame image display */}
              <div className="relative aspect-square w-full bg-white border border-zinc-200 overflow-hidden">
                <img
                  src={currentImages[activeImageIndex]}
                  alt={`${product.name} studio`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
                
                {/* Floating Indicators Overlay */}
                <span className="absolute bottom-3 left-3 bg-zinc-950/80 text-[8px] font-mono font-bold tracking-widest text-zinc-300 px-2 py-1 uppercase border border-zinc-800">
                  FRAME {activeImageIndex + 1} / {currentImages.length}
                </span>

                {role === 'customer' && onLikeToggle && (
                  <button
                    type="button"
                    onClick={onLikeToggle}
                    className={`absolute bottom-3 right-3 h-8 w-8 rounded-none flex items-center justify-center border hover:scale-105 active:scale-95 transition-all z-10 ${
                      isLiked 
                        ? 'bg-zinc-950 border-zinc-950 text-white' 
                        : 'bg-white/90 border-zinc-200 text-zinc-900 hover:bg-white'
                    }`}
                    title="Like style"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              {/* Thumbnails Navigation Row (if multiple photographs) */}
              {currentImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square w-full relative border bg-white overflow-hidden transition-all ${
                        idx === activeImageIndex 
                          ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-100' 
                          : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`aspect-square w-full ${product.imageColor || 'bg-zinc-100'} flex flex-col items-center justify-center p-12 text-center`}>
              <span className="text-6xl mb-3">👕</span>
              <p className="font-serif text-sm font-normal text-zinc-800 uppercase tracking-widest">Atelier Sketch</p>
              <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider mt-1">Sourcing Photograph pending</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Style Details, Specifications & Sharing Controls */}
        <div className={`flex-1 p-6 md:p-8 ${isInline ? '' : 'md:overflow-y-auto'} flex flex-col justify-between`}>
          <div className="space-y-6">
            
            {/* Header Identity Category & Silhouette labels */}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-100 border border-zinc-250 px-2 py-0.5 rounded-none font-mono">
                  {product.category}
                </span>
                <span className="inline-flex items-center text-[8px] font-bold uppercase tracking-widest bg-zinc-950 text-white border border-zinc-900 px-2 py-0.5 rounded-none font-mono">
                  {product.gender}
                </span>
                <span className="inline-flex items-center text-[8px] font-bold uppercase tracking-widest bg-white text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-none font-mono">
                  {product.ageGroup}
                </span>
              </div>
              
              <h1 className="font-serif text-xl md:text-2xl font-normal text-zinc-900 uppercase tracking-wide mt-2.5 leading-tight">
                {product.name}
              </h1>
              
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Estimated cost:</span>
                <strong className="text-lg font-mono font-semibold text-zinc-950 tracking-tight">
                  ₹{product.priceMin} - ₹{product.priceMax}
                </strong>
              </div>
            </div>

            {/* Atelier Specification Sheet */}
            <div className="border-t border-zinc-150 pt-5 space-y-3.5">
              <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Boutique Suit Specifications</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-2 border-l border-zinc-200 pl-3">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Sizing Suite</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(product.sizes || []).map((s) => (
                      <span key={s} className="bg-[#FAF9F6] border border-zinc-250 px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-l border-zinc-200 pl-3">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">Color Palette</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(product.colors || []).map((c) => (
                      <span key={c} className="bg-[#FAF9F6] border border-zinc-250 px-2 py-0.5 text-[9px] font-semibold text-zinc-800">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Tools Section */}
            <div className="border-t border-zinc-150 pt-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Sartorial Coordination (Sharing)</h4>
                <span className="text-[8px] font-semibold text-zinc-400 tracking-wider">SHARE TO WHATSAPP READY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-1.5">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-800"
                >
                  <span className="text-sm">💬</span>
                  <span>WhatsApp Line</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-850 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2.5 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-850 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedMessage ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                  <span>{copiedMessage ? 'Copied Text' : 'Copy Specs'}</span>
                </button>
              </div>
            </div>

            {/* ADMIN VISUAL STATE & LOGISTICS DETAILS */}
            {role === 'seller' && (
              <div className="border-t border-zinc-200 pt-5 space-y-4 bg-zinc-50/70 p-4 border border-zinc-150 text-xs font-sans">
                <div className="flex items-center gap-1.5 font-serif text-sm font-normal text-zinc-900 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Rahul Maurya Sourcing Overview</span>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b border-zinc-150 pb-3">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase block font-mono">Total Demands</span>
                    <strong className="text-lg font-semibold text-zinc-950 font-mono mt-0.5 block">{activeRequestsCount}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase block font-mono">Dispersed Roads</span>
                    <strong className="text-lg font-semibold text-zinc-950 font-mono mt-0.5 block">{uniqueVillages} Villages</strong>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-zinc-400 uppercase block font-mono">Faves Likes</span>
                    <strong className="text-lg font-semibold text-zinc-950 font-mono mt-0.5 block">🖤 {product.likes || 0}</strong>
                  </div>
                </div>

                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  {onToggleStatus && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(product.id, (product.status || 'listed') === 'listed' ? 'unlisted' : 'listed')}
                      className={`flex-1 py-2 px-3 text-[9px] font-bold uppercase tracking-widest text-center transition-colors cursor-pointer flex justify-center items-center gap-1.5 border ${
                        product.status === 'listed'
                          ? 'bg-zinc-100 border-zinc-350 text-zinc-700 hover:bg-zinc-200'
                          : 'bg-zinc-950 border-zinc-900 text-white hover:bg-zinc-850'
                      }`}
                    >
                      {product.status === 'listed' ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Unlist Style</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Publish Publicly</span>
                        </>
                      )}
                    </button>
                  )}

                  {onDeleteProduct && (
                    <div className="w-full sm:w-auto shrink-0">
                      {confirmDelete ? (
                        <div className="flex gap-1 animate-fade-in shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProduct(product.id);
                              onClose();
                            }}
                            className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                          >
                            Yes, Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="py-2 px-3 bg-zinc-200 text-zinc-800 text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="py-2 px-3 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-150 text-zinc-500 hover:text-rose-600 text-[9px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
                          title="Delete from stock ledger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Perm Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Core Action Call at Bottom */}
          {role === 'customer' && onRequestStyleHold && (
            <div className="mt-8 pt-5 border-t border-zinc-150 text-left shrink-0">
              <button
                type="button"
                id={`btn-details-hold-${product.id}`}
                onClick={onRequestStyleHold}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Hold Style on Next Route Trip</span>
              </button>
            </div>
          )}

        </div>

      </div>
    );

  if (isInline) {
    return detailsContent;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs p-3 sm:p-6 flex justify-center items-start md:items-center animate-fade-in">
      {detailsContent}
    </div>
  );
}
