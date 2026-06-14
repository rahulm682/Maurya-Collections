import React, { useState, useEffect, useMemo } from 'react';
import { Product, Gender, AgeGroup, CustomerRequest } from '../types';
import { 
  Search, Heart, Sparkles, Filter, Check, Clock, 
  AlertTriangle, AlertCircle, ShoppingCart, ChevronLeft, ChevronRight,
  User, Phone, Mail, Map, BookmarkCheck
} from 'lucide-react';
import ProductImageCarousel from './ProductImageCarousel';
import ProductDetailsModal from './ProductDetailsModal';

interface CustomerViewProps {
  products: Product[];
  onAddRequest: (request: Omit<CustomerRequest, 'id' | 'dateRequested' | 'status'>) => void;
  onLikeProduct: (productId: string) => void;
  likedProductIds: string[];
  deepLinkedProduct?: Product | null;
}

export default function CustomerView({
  products,
  onAddRequest,
  onLikeProduct,
  likedProductIds,
  deepLinkedProduct
}: CustomerViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | 'All'>('All');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'likesDesc'>('default');

  // Details Modal selection/view state
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // High performance infinite scroll/lazy load states
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedGender, selectedAge, selectedCategory, sortBy]);

  useEffect(() => {
    if (deepLinkedProduct) {
      setSelectedProductForDetails(deepLinkedProduct);
    }
  }, [deepLinkedProduct]);

  // Form State
  const [reservationProduct, setReservationProduct] = useState<Product | null>(null);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [villageInput, setVillageInput] = useState(''); // free-form text input!
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('Kids (5-12)');
  const [notes, setNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Unique categories helper
  const categories = useMemo(() => {
    const list = new Set<string>();
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p && p.category) list.add(p.category);
      });
    }
    return ['All', ...Array.from(list)];
  }, [products]);

  // Combined filters logic
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    // 1. Filter
    let list = products.filter((p) => {
      if (!p) return false;
      if (p.status === 'unlisted') return false; // Hide unlisted/hidden styles
      const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchGender = selectedGender === 'All' || p.gender === selectedGender;
      const matchAge = selectedAge === 'All' || p.ageGroup === selectedAge;
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchGender && matchAge && matchCat;
    });

    // 2. Sort
    if (sortBy === 'priceAsc') {
      list.sort((a, b) => a.priceMin - b.priceMin);
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => b.priceMax - a.priceMax);
    } else if (sortBy === 'likesDesc') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      // Default: Alphabetical by Name
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [products, searchQuery, selectedGender, selectedAge, selectedCategory, sortBy]);

  useEffect(() => {
    let timerId: any = null;

    const checkScrollLoad = () => {
      if (isLoadingMore || visibleCount >= filteredProducts.length) return;
      if (!observerTarget.current) return;

      const rect = observerTarget.current.getBoundingClientRect();
      // If the top of the sentinel is within 300px of the bottom of the viewport
      if (rect.top <= window.innerHeight + 300 && rect.height > 0) {
        setIsLoadingMore(true);
        timerId = setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + 8, filteredProducts.length));
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
  }, [visibleCount, filteredProducts.length, isLoadingMore, reservationProduct, selectedProductForDetails]);

  const handleOpenReserve = (product: Product) => {
    setReservationProduct(product);
    setSelectedSize((product.sizes || [])[0] || ''); 
    setSelectedColor((product.colors || [])[0] || '');
    setSelectedAgeGroup(product.ageGroup); // Strict restriction! Customers can only fill for product's ageGroup
    setSubmitSuccess(false);
  };

  const handleCloseModal = () => {
    setReservationProduct(null);
    setFullname('');
    setPhone('');
    setEmail('');
    setVillageInput('');
    setSelectedSize('');
    setSelectedColor('');
    setNotes('');
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationProduct || !fullname || !phone || !villageInput) return;

    onAddRequest({
      customerName: fullname.trim(),
      phone: phone.trim(),
      email: email.trim() || 'default@route.co',
      village: villageInput.trim(), // text input
      productId: reservationProduct.id,
      productName: reservationProduct.name,
      requestedSize: selectedSize,      // strictly constrained to product sizes
      requestedColor: selectedColor,    // strictly constrained to product colors
      requestedAgeGroup: selectedAgeGroup, // strictly locked to product age group
      notes: notes.trim()
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      handleCloseModal();
    }, 1800);
  };

  return (
    <div className="py-5">

      {reservationProduct ? (
        <div id="inline-reservation-view" className="space-y-6 text-left animate-fade-in max-w-2xl mx-auto bg-white p-6 sm:p-8 border border-zinc-200">
          
          {/* Header & Back Action */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="group py-2 px-4 border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Collection</span>
            </button>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold">
              📍 HOLD SERVICE DIRECTORY
            </span>
          </div>

          <div className="border-b border-zinc-200 pb-4">
            <span className="text-[8px] tracking-[0.2em] uppercase font-mono text-zinc-500 block font-bold mt-1">Atelier Desk Service</span>
            <h3 className="font-serif text-lg font-normal text-zinc-950 mt-1 uppercase tracking-wider">Garment Sourcing & Hold Request</h3>
            <p className="text-[10px] text-zinc-500 mt-1.5">Submit your sizing and contact details. Rahul Maurya will verify and secure the garment for your next trip of route service.</p>
          </div>

          {/* Success state inline */}
          {submitSuccess ? (
            <div className="py-8 text-center bg-white space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-none border border-emerald-500 bg-emerald-50/50 text-emerald-600">
                <BookmarkCheck className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-base font-normal text-zinc-900 uppercase tracking-wide">Request Registered Successfully</h4>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed max-w-md mx-auto">
                We have successfully cataloged your request for size <strong className="font-mono font-bold text-zinc-900">{selectedSize}</strong> ({selectedColor}) in our route planner! We visit <strong className="text-zinc-900 font-bold">{villageInput}</strong> once a week. We will keep it safe from selling out.
              </p>
              <div className="p-3 bg-zinc-50 border border-zinc-200 text-[10px] font-mono tracking-wider font-semibold text-zinc-800 flex items-center justify-center gap-1.5 uppercase">
                <Clock className="w-4 h-4 text-zinc-600" />
                <span>Rahul Maurya will notify on arrival!</span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="py-2.5 px-6 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-colors"
              >
                Return to Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              
              {/* Product Preview Pane (Left/Top 4 cols) */}
              <div className="md:col-span-4 bg-zinc-50 p-4 border border-zinc-200/85 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold uppercase text-zinc-400 tracking-wider leading-none block mb-2">{reservationProduct.category}</span>
                  <div className="aspect-square w-full rounded-none overflow-hidden bg-zinc-100 border border-zinc-200/50 mb-3">
                    {reservationProduct.images && reservationProduct.images[0] ? (
                      <img src={reservationProduct.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl flex h-full items-center justify-center">👕</span>
                    )}
                  </div>
                  <h4 className="font-serif text-sm font-normal text-zinc-955 leading-tight mb-1">{reservationProduct.name}</h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[8px] font-mono font-bold text-zinc-600 bg-zinc-200/50 px-1.5 py-0.5 uppercase">Fit: {reservationProduct.ageGroup}</span>
                    <span className="text-[8px] font-mono font-bold text-zinc-600 bg-zinc-200/50 px-1.5 py-0.5 uppercase">{reservationProduct.gender}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-205">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block leading-none mb-1">Estimated Range</span>
                  <strong className="text-sm font-bold font-mono text-zinc-950">
                    ₹{reservationProduct.priceMin} - ₹{reservationProduct.priceMax}
                  </strong>
                </div>
              </div>

              {/* Form Pane (Right/Bottom 8 cols) */}
              <form onSubmit={handleReserveSubmit} className="md:col-span-8 space-y-4 text-zinc-800 font-sans">
                
                {/* Name & Email Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reserve-fullname" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      id="reserve-fullname"
                      required
                      placeholder="e.g. Geeta Devi"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-350 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="reserve-email" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" /> Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="reserve-email"
                      placeholder="e.g. customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-350 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Phone & Village Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reserve-phone" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="reserve-phone"
                      required
                      placeholder="e.g. 9876543210"
                      pattern="[0-9]{10}"
                      title="10 Digit Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-350 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="reserve-village" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Map className="w-3 h-3 text-zinc-400" /> Village Name *
                    </label>
                    <input
                      type="text"
                      id="reserve-village"
                      required
                      placeholder="e.g. Rampur"
                      value={villageInput}
                      onChange={(e) => setVillageInput(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-350 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Size & Color Selector Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reserve-size" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      Selected Size *
                    </label>
                    <select
                      id="reserve-size"
                      required
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none transition-all font-mono font-bold animate-none"
                    >
                      {(reservationProduct.sizes || []).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reserve-color" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                      Selected Color *
                    </label>
                    <select
                      id="reserve-color"
                      required
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none transition-all font-semibold"
                    >
                      {reservationProduct.colors?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )) || (
                        <option value="Standard">Standard Color</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Sourcing instructions */}
                <div>
                  <label htmlFor="reserve-notes" className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Sourcing Instructions / Custom Preferences (Optional)
                  </label>
                  <textarea
                    id="reserve-notes"
                    rows={2}
                    placeholder="e.g. Prefer direct dark shade if available"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-none border border-zinc-200 bg-zinc-50 py-2 px-3 text-xs text-zinc-900 placeholder-zinc-350 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Actions bottom */}
                <div className="pt-4 border-t border-zinc-200 flex gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:border-zinc-950 hover:text-zinc-950 rounded-none transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer text-center"
                  >
                    Hold on Next Trip
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : selectedProductForDetails ? (
        <div id="inline-product-details-view" className="space-y-4">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setSelectedProductForDetails(null)}
              className="group py-2 px-4 border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Collection</span>
            </button>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase hidden sm:inline font-bold">
              📍 RAHUL MAURYA EXCLUSIVE DIRECTORY
            </span>
          </div>

          <ProductDetailsModal
            product={selectedProductForDetails}
            onClose={() => setSelectedProductForDetails(null)}
            role="customer"
            isLiked={likedProductIds.includes(selectedProductForDetails.id)}
            onLikeToggle={() => onLikeProduct(selectedProductForDetails.id)}
            onRequestStyleHold={() => {
              const target = selectedProductForDetails;
              setSelectedProductForDetails(null);
              handleOpenReserve(target);
            }}
            isInline={true}
          />
        </div>
      ) : (
        <>
          {/* High-Craft Filter Shelf */}
          <div className="bg-white rounded-none border border-zinc-200 p-6 mb-8 text-left shadow-[0_1px_3px_rgba(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
          <h3 className="font-serif text-sm font-normal text-zinc-900 uppercase tracking-widest">
            Collection Directory
          </h3>
          <span className="text-[9px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-none font-mono tracking-wider uppercase">
            {filteredProducts.length} DESIGNS AVAILABLE
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Custom Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search garments, traditional lehengas, silk frocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 bg-zinc-50/50 py-3 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Gender Switch */}
            <div>
              <label htmlFor="search-gender" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Gender Line</label>
              <select
                id="search-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as Gender | 'All')}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[10px] font-semibold text-zinc-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Genders</option>
                <option value="Girls">Girls Selection</option>
                <option value="Boys">Boys Selection</option>
                <option value="Unisex">Unisex Sets</option>
              </select>
            </div>

            {/* Age Group select */}
            <div>
              <label htmlFor="search-age" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Age Bracket</label>
              <select
                id="search-age"
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value as AgeGroup | 'All')}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[10px] font-semibold text-zinc-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Ages</option>
                <option value="Baby (0-2)">Baby (0-2Y)</option>
                <option value="Toddler (2-5)">Toddler (2-5Y)</option>
                <option value="Kids (5-12)">Kids (5-12Y)</option>
                <option value="Teens (12-18)">Teens (12-18Y)</option>
                <option value="All Age Groups">All Age Groups</option>
              </select>
            </div>

            {/* Category selection */}
            <div>
              <label htmlFor="search-category" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Category</label>
              <select
                id="search-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[10px] font-semibold text-zinc-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort selection */}
            <div>
              <label htmlFor="search-sort" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Sort Sequence</label>
              <select
                id="search-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/50 py-2 px-3 text-[10px] font-semibold text-zinc-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="default">Product Title (A-Z)</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="likesDesc">Most Popular (Likes)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid View */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white border border-dashed rounded-none border-zinc-250 animate-fade-in">
          <AlertCircle className="h-6 w-6 text-zinc-400 mx-auto mb-3 animate-pulse" />
          <h3 className="font-serif text-sm font-normal text-zinc-900 uppercase tracking-widest">No styles cataloged</h3>
          <p className="mt-2 text-[10px] uppercase font-sans tracking-wider text-zinc-500 leading-relaxed">Rahul Maurya RESTOCKS NEW COUTURE ON ROUTE TRIPS. RESET DIRECTORY FILTERS.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.slice(0, visibleCount).map((p) => {
              const isLiked = likedProductIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  id={`customer-product-card-${p.id}`}
                  onClick={() => setSelectedProductForDetails(p)}
                  className="bg-white rounded-none border border-zinc-200/80 overflow-hidden shadow-none hover:border-zinc-900 hover:shadow-xs transition-all duration-300 flex flex-col relative group cursor-pointer"
                >
                  {/* 1. Multiple Photographs interactive display */}
                  <ProductImageCarousel images={p.images} imageColor={p.imageColor} name={p.name} />

                  {/* Like Button overlaid beautifully */}
                  <button
                    type="button"
                    id={`btn-like-${p.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikeProduct(p.id);
                    }}
                    className={`absolute top-3.5 right-3.5 h-8 w-8 rounded-none flex items-center justify-center border hover:scale-105 active:scale-95 transition-all z-10 ${
                      isLiked 
                        ? 'bg-zinc-950 border-zinc-950 text-white' 
                        : 'bg-white/90 border-zinc-200 text-zinc-900 hover:bg-white'
                    }`}
                    aria-label="Like product style"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Fit and gender labels overlay */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                    <span className="inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider uppercase bg-zinc-950 text-white border border-zinc-900">
                      {p.gender}
                    </span>
                    <span className="inline-flex items-center rounded-none bg-white/90 px-2 py-0.5 text-[8px] font-semibold tracking-wider text-zinc-950 border border-zinc-200 uppercase">
                      {p.ageGroup}
                    </span>
                  </div>

                  {/* 2. Text Content & Information Details */}
                  <div className="p-5 flex-1 flex flex-col text-left justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-450 font-sans block">
                        {p.category}
                      </span>
                      <h4 className="font-serif font-normal text-zinc-900 text-sm tracking-wide mt-1 group-hover:text-zinc-750 transition-colors">
                        {p.name}
                      </h4>

                      {/* Restricted Specifications Display */}
                      <div className="mt-3.5 space-y-2 pb-1.5 border-b border-zinc-100/60">
                        <div className="text-[10px] text-zinc-500 flex flex-wrap gap-1.5 items-center">
                          <span className="font-medium tracking-wide text-zinc-400">Sizes fit:</span>
                          {(p.sizes || []).map((s) => (
                            <span key={s} className="bg-zinc-100/90 text-zinc-800 px-1.5 py-0.5 rounded-none font-mono font-bold text-[9px] border border-zinc-200/20">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="text-[10px] text-zinc-500 flex flex-wrap gap-1.5 items-center">
                          <span className="font-medium tracking-wide text-zinc-400">Colors:</span>
                          {(p.colors || []).map((c) => (
                            <span key={c} className="bg-zinc-50 text-zinc-800 border border-zinc-200/50 px-1.5 py-0.5 rounded-none font-semibold text-[9px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions Area with price range displaying beautifully */}
                    <div className="mt-4 pt-1 flex items-center justify-between gap-3 font-sans">
                      <div className="text-left shrink-0">
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block leading-none mb-1">Estimated Range</span>
                        <strong className="text-xs sm:text-sm font-bold font-mono text-zinc-900 tracking-tight leading-normal">
                          ₹{p.priceMin} - ₹{p.priceMax}
                        </strong>
                      </div>

                      <button
                        type="button"
                        id={`btn-reserve-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReserve(p);
                        }}
                        className="py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-none transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        <span>Request Style</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite Scroll Sentinel / Skeleton Loader */}
          <div ref={observerTarget} className="mt-12 border-t border-dashed border-zinc-200 pt-8 text-center flex flex-col items-center justify-center space-y-4">
            {visibleCount < filteredProducts.length ? (
              <>
                <div id="loading-more-spinner" className="flex flex-col items-center justify-center py-2 text-zinc-500 font-mono tracking-widest text-[9px] uppercase gap-2">
                  <span className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin"></span>
                  <span>Weaving further designs...</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 8, filteredProducts.length))}
                  className="py-2.5 px-6 border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-800 transition-all cursor-pointer"
                >
                  Load More Styles
                </button>
              </>
            ) : (
              <p className="text-[8px] tracking-widest uppercase font-mono text-zinc-400">
                📍 End of Maurya Boutique Stock Portfolio — Curated by Rahul Maurya
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )}

    </div>
  );
}
