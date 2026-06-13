import React, { useState, useMemo } from 'react';
import { Product, Gender, AgeGroup, CustomerRequest } from '../types';
import { 
  Search, Heart, Sparkles, Filter, Check, Clock, 
  AlertTriangle, AlertCircle, ShoppingCart, ChevronLeft, ChevronRight,
  User, Phone, Mail, Map, BookmarkCheck
} from 'lucide-react';
import ProductImageCarousel from './ProductImageCarousel';

interface CustomerViewProps {
  products: Product[];
  onAddRequest: (request: Omit<CustomerRequest, 'id' | 'dateRequested' | 'status'>) => void;
  onLikeProduct: (productId: string) => void;
  likedProductIds: string[];
}

export default function CustomerView({
  products,
  onAddRequest,
  onLikeProduct,
  likedProductIds
}: CustomerViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | 'All'>('All');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
    return products.filter((p) => {
      if (!p) return false;
      if (p.status === 'unlisted') return false; // Hide seasonal/unlisted styles
      const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchGender = selectedGender === 'All' || p.gender === selectedGender;
      const matchAge = selectedAge === 'All' || p.ageGroup === selectedAge;
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchGender && matchAge && matchCat;
    });
  }, [products, searchQuery, selectedGender, selectedAge, selectedCategory]);

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
      {/* Brand Elegant Welcome Plate */}
      <div className="mb-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 text-white shadow-xl relative overflow-hidden">
        {/* Decorative ambient background accents */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative text-left">
          <div className="inline-flex items-center space-x-1 bg-amber-500/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-400 mb-3 border border-amber-400/20 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Weekly Village Route Service</span>
          </div>
          <h2 className="text-xl font-black tracking-tight leading-tight uppercase">
            Maurya Collections
          </h2>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-xl">
            View real-time stock directly from our delivery truck. Select clothes, lock in your exact size/color, and we will bring them to your village on visit day!
          </p>
        </div>
      </div>

      {/* High-Craft Filter Shelf */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 mb-6 shadow-xs text-left">
        <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-normal">
            Browse Clothes
          </h3>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
            {filteredProducts.length} Items Listed
          </span>
        </div>
        
        <div className="space-y-3">
          {/* Custom Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-450" />
            </div>
            <input
              type="text"
              placeholder="Search items, frocks, lehengas, tops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Gender Switch */}
            <div>
              <select
                id="search-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as Gender | 'All')}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-bold text-slate-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Genders</option>
                <option value="Girls">Girls Selection</option>
                <option value="Boys">Boys Selection</option>
                <option value="Unisex">Unisex Sets</option>
              </select>
            </div>

            {/* Age Group select */}
            <div>
              <select
                id="search-age"
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value as AgeGroup | 'All')}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-bold text-slate-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Ages (0-18Y)</option>
                <option value="Baby (0-2)">Baby (0-2Y)</option>
                <option value="Toddler (2-5)">Toddler (2-5Y)</option>
                <option value="Kids (5-12)">Kids (5-12Y)</option>
                <option value="Teens (12-18)">Teens (12-18Y)</option>
              </select>
            </div>

            {/* Category selection */}
            <div>
              <select
                id="search-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-bold text-slate-800 focus:bg-white focus:outline-none transition-all"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid View */}
      {filteredProducts.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 border border-dashed rounded-2xl border-slate-200">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-900 uppercase">No matching styles found</h3>
          <p className="mt-1 text-[11px] text-slate-550">We restock new clothing every Sunday. Relax filters and check again!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const isLiked = likedProductIds.includes(p.id);

            return (
              <div
                key={p.id}
                id={`customer-product-card-${p.id}`}
                className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs hover:border-amber-400/80 transition-all duration-200 flex flex-col relative"
              >
                {/* 1. Multiple Photographs interactive display */}
                <ProductImageCarousel images={p.images} imageColor={p.imageColor} name={p.name} />

                {/* Like Button overlaid beautifully */}
                <button
                  type="button"
                  id={`btn-like-${p.id}`}
                  onClick={() => onLikeProduct(p.id)}
                  className={`absolute top-3.5 right-3.5 h-8.5 w-8.5 rounded-full flex items-center justify-center border hover:scale-105 active:scale-95 transition-all shadow-md z-10 ${
                    isLiked 
                      ? 'bg-rose-500 border-rose-600 text-white' 
                      : 'bg-white/95 border-slate-200 text-rose-500'
                  }`}
                  aria-label="Like product style"
                >
                  <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Fit and gender labels overlay */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1 z-10">
                  <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[9px] font-black uppercase shadow-xs bg-slate-900 text-amber-400 border border-slate-800`}>
                    {p.gender}
                  </span>
                  <span className="inline-flex items-center rounded bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-950 shadow-xs">
                    {p.ageGroup}
                  </span>
                </div>

                {/* 2. Text Content & Information Details */}
                <div className="p-4 flex-1 flex flex-col text-left justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                      {p.category}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mt-0.5">
                      {p.name}
                    </h4>

                    {/* Restricted Specifications Display */}
                    <div className="mt-2.5 space-y-2">
                      <div className="text-[11px] font-medium text-slate-600 flex flex-wrap gap-1.5 items-center">
                        <span className="font-bold text-slate-400">Sizes fit:</span>
                        {(p.sizes || []).map((s) => (
                          <span key={s} className="bg-slate-100 text-slate-850 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] font-medium text-slate-600 flex flex-wrap gap-1.5 items-center">
                        <span className="font-bold text-slate-400">Available colors:</span>
                        {(p.colors || []).map((c) => (
                          <span key={c} className="bg-amber-50 text-amber-900 border border-amber-200/50 px-1.5 py-0.5 rounded font-bold text-[9px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>


                  </div>

                  {/* Actions Area with price range displaying beautifully */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-left font-serif shrink-0">
                      <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest block leading-none">Price Range</span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-normal">
                        ₹{p.priceMin} - ₹{p.priceMax}
                      </strong>
                    </div>

                    <button
                      type="button"
                      id={`btn-reserve-${p.id}`}
                      onClick={() => handleOpenReserve(p)}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-amber-400" />
                      <span>Request Product</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Form Modal */}
      {reservationProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity">
          <div className="relative w-full max-w-sm overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col shrink-0 animate-slide-up text-left">
            
            {/* Header of Modal styling */}
            <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] tracking-widest uppercase font-black text-amber-400 font-mono block">Maurya Customer Care</span>
                <h3 className="text-xs font-black text-white mt-0.5 uppercase">Interested Reservation Form</h3>
              </div>
              <button
                type="button"
                id="btn-close-modal"
                onClick={handleCloseModal}
                className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-sm font-semibold transition-all hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Success state inline */}
            {submitSuccess ? (
              <div className="p-8 text-center bg-white flex-1 overflow-y-auto">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 animate-bounce">
                  <BookmarkCheck className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase">Reservation Registered!</h4>
                <p className="text-[11px] text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  We have cataloged your interest for size <strong className="font-mono font-bold">{selectedSize}</strong> ({selectedColor}) in our route planner! We visit <strong className="text-indigo-650 font-bold">{villageInput}</strong> once a week. We will keep it safe from selling out.
                </p>
                <div className="mt-4 bg-amber-50 px-3 py-2 rounded-xl text-[10px] font-bold text-amber-800 border border-amber-200 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Rahul Maurya will notify on arrival!</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReserveSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-slate-800">
                {/* Visual feedback of the chosen Product */}
                <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <div className="h-10 w-10 rounded overflow-hidden shadow-xs bg-slate-200 shrink-0">
                    {reservationProduct.images && reservationProduct.images[0] ? (
                      <img src={reservationProduct.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl flex h-full items-center justify-center">👕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase text-amber-600 tracking-wider leading-none">{reservationProduct.category}</p>
                    <h5 className="text-xs font-black text-slate-950 truncate mt-0.5">{reservationProduct.name}</h5>
                    <p className="text-[10px] font-bold text-slate-650 mt-0.5">Price: ₹{reservationProduct.priceMin} - ₹{reservationProduct.priceMax}</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-2.5 text-left">
                  
                  {/* Name field */}
                  <div>
                    <label htmlFor="reserve-fullname" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-600" /> Full Name *
                    </label>
                    <input
                      type="text"
                      id="reserve-fullname"
                      required
                      placeholder="e.g. Geeta Devi"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Phone number */}
                  <div>
                    <label htmlFor="reserve-phone" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-600" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="reserve-phone"
                      required
                      placeholder="e.g. 9876543210 (10 digit)"
                      pattern="[0-9]{10}"
                      title="10 Digit Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email input */}
                  <div>
                    <label htmlFor="reserve-email" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-600" /> Email Address
                    </label>
                    <input
                      type="email"
                      id="reserve-email"
                      placeholder="e.g. customer@gmail.com (Optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Village as Text Input */}
                  <div>
                    <label htmlFor="reserve-village" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Map className="w-3 h-3 text-amber-600" /> Village Name (Text input) *
                    </label>
                    <input
                      type="text"
                      id="reserve-village"
                      required
                      placeholder="e.g. Rampur Route 1"
                      value={villageInput}
                      onChange={(e) => setVillageInput(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* RESTRICTED SELECTS (Mandated limits) */}
                  <div className="grid grid-cols-2 gap-2">
                    
                    {/* Size selector strictly limited */}
                    <div>
                      <label htmlFor="reserve-size" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">
                        Fits Size *
                      </label>
                      <select
                        id="reserve-size"
                        required
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-bold"
                      >
                        {(reservationProduct.sizes || []).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color selector strictly limited */}
                    <div>
                      <label htmlFor="reserve-color" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">
                        Select Color *
                      </label>
                      <select
                        id="reserve-color"
                        required
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-bold"
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

                  {/* Age group locked constraint */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">
                      Fits Age Group (Locked to Style Specification)
                    </label>
                    <div className="bg-slate-100/90 text-[11px] font-extrabold text-slate-800 py-2 px-3 rounded-lg border border-slate-200/40">
                      🔒 {reservationProduct.ageGroup}
                    </div>
                  </div>

                  {/* notes */}
                  <div>
                    <label htmlFor="reserve-notes" className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 block">
                      Information / Custom details (Optional)
                    </label>
                    <textarea
                      id="reserve-notes"
                      rows={2}
                      placeholder="Any information regarding color preference variations."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1 px-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition-all resize-none"
                    />
                  </div>

                </div>

                {/* Footer confirm */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm transition-all"
                  >
                    Hold on Next Trip
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
