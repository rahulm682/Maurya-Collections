import React, { useState, useRef } from 'react';
import { Product, AgeGroup } from '../types';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'likes' | 'reserved'>) => void;
}

export default function CreateProductModal({ isOpen, onClose, onAddProduct }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Product['gender']>('Girls');
  const [ageGroup, setAgeGroup] = useState<Product['ageGroup']>('Kids (5-12)');
  const [category, setCategory] = useState('Frocks & Dresses');
  const [priceMin, setPriceMin] = useState<number>(450);
  const [priceMax, setPriceMax] = useState<number>(600);
  const [stock, setStock] = useState<number>(8);
  const [sizes, setSizes] = useState('6-7Y, 8-9Y, 10-12Y');
  const [colors, setColors] = useState('Sky Pink, Lemon Yellow, Pitch White');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileRead = (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Read files as base64 data URLs
    const readPromises = filesArray.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((base64Strings) => {
        setImages((prev) => [...prev, ...base64Strings]);
      })
      .catch((err) => {
        console.error("Error reading image files:", err);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileRead(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sizeArray = sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorArray = colors.split(',').map(c => c.trim()).filter(Boolean);

    onAddProduct({
      name: name.trim(),
      gender,
      ageGroup,
      category: category.trim(),
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      stock: Number(stock),
      sizes: sizeArray,
      colors: colorArray,
      images: images,
      imageColor: 'bg-indigo-100 text-indigo-800'
    });

    // Reset Form fields
    setName('');
    setGender('Girls');
    setAgeGroup('Kids (5-12)');
    setCategory('Frocks & Dresses');
    setPriceMin(450);
    setPriceMax(600);
    setStock(8);
    setSizes('6-7Y, 8-9Y, 10-12Y');
    setColors('Sky Pink, Lemon Yellow, Pitch White');
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col text-left">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <span className="text-[9px] tracking-widest uppercase font-black text-amber-400 font-mono block">Maurya Collections Ledger</span>
            <h3 className="text-xs font-black uppercase text-white mt-0.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Upload New Clothing Style
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-800 text-slate-305 hover:text-white flex items-center justify-center text-sm font-semibold transition-all hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Modal Form body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-850">
          
          <div className="space-y-3">
            
            {/* Standard inputs */}
            <div>
              <label htmlFor="style-name" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Garment Title / Description *
              </label>
              <input
                type="text"
                id="style-name"
                required
                placeholder="e.g. Traditional Embroidered Silk Lehenga"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-905 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="style-gender" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Gender Selector
                </label>
                <select
                  id="style-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Product['gender'])}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs text-slate-850 focus:bg-white focus:outline-none transition-all font-bold"
                >
                  <option value="Girls">Girls Selection</option>
                  <option value="Boys">Boys Selection</option>
                  <option value="Unisex">Unisex Wear</option>
                </select>
              </div>

              <div>
                <label htmlFor="style-age" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Age Bracket
                </label>
                <select
                  id="style-age"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as Product['ageGroup'])}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs text-slate-855 focus:bg-white focus:outline-none transition-all font-bold"
                >
                  <option value="Baby (0-2)">Baby (0-2 Yrs)</option>
                  <option value="Toddler (2-5)">Toddler (2-5 Yrs)</option>
                  <option value="Kids (5-12)">Kids (5-12 Yrs)</option>
                  <option value="Teens (12-18)">Teens (12-18 Yrs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="style-category" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  id="style-category"
                  required
                  placeholder="e.g. Ethnic, Jumpsuits"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="style-stock" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Initial Stock Count *
                </label>
                <input
                  type="number"
                  id="style-stock"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-905 focus:bg-white focus:outline-none transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* Price ranges */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="style-pricemin" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Min Range Price (₹) *
                </label>
                <input
                  type="number"
                  id="style-pricemin"
                  required
                  min={0}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label htmlFor="style-pricemax" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Max Range Price (₹) *
                </label>
                <input
                  type="number"
                  id="style-pricemax"
                  required
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-mono font-bold"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label htmlFor="style-sizes" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Sizes List (Comma Separated) *
              </label>
              <input
                type="text"
                id="style-sizes"
                required
                placeholder="e.g. 6-7Y, 8-9Y, 10-12Y"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Colors */}
            <div>
              <label htmlFor="style-colors" className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Colors Available (Comma Separated) *
              </label>
              <input
                type="text"
                id="style-colors"
                required
                placeholder="e.g. Crimson Red, Ivory Cream, Sky Blue"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-900 focus:bg-white focus:outline-none transition-all font-medium"
              />
            </div>

            {/* 📸 REAL IMAGE UPLOAD & PREVIEWS AS BASE64 */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Product Photographs (Upload Images) *
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <Upload className="mx-auto h-7 w-7 text-slate-400 mb-2" />
                <p className="text-[11px] font-extrabold text-slate-800">Drag &amp; drop photos here or <span className="text-indigo-600 underline">browse</span></p>
                <p className="text-[9px] text-slate-450 mt-1">Accepts multiple PNG, JPG files. Photos save locally immediately.</p>
              </div>

              {/* Uploaded Base64 Thumbnails */}
              {images.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase block font-mono">Uploaded Previews ({images.length})</span>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((base64Url, idx) => (
                      <div key={idx} className="relative h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden group">
                        <img src={base64Url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 flex items-center justify-center text-[8px] transition-all"
                          title="Remove Photograph"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Modal bottom actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-center"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all text-center"
            >
              Upload Style
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
