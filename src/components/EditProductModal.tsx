import React, { useState, useRef, useEffect } from 'react';
import { Product, AgeGroup } from '../types';
import { Upload, X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdateProduct: (product: Product) => void;
  isInline?: boolean;
}

export default function EditProductModal({ isOpen, onClose, product, onUpdateProduct, isInline = false }: EditProductModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Product['gender']>('Girls');
  const [ageGroup, setAgeGroup] = useState<Product['ageGroup']>('Kids (5-12)');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if product changes or is loaded
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setGender(product.gender || 'Girls');
      setAgeGroup(product.ageGroup || 'Kids (5-12)');
      setCategory(product.category || '');
      setPriceMin(product.priceMin || 0);
      setPriceMax(product.priceMax || 0);
      setSizes((product.sizes || []).join(', '));
      setColors((product.colors || []).join(', '));
      setImages(product.images || []);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions keeping aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string); // fallback
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileRead = (files: FileList) => {
    const filesArray = Array.from(files);
    
    // Read and compress files as base64 data URLs
    const readPromises = filesArray.map((file) => compressImage(file));

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

    onUpdateProduct({
      ...product,
      name: name.trim(),
      gender,
      ageGroup,
      category: category.trim(),
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      sizes: sizeArray,
      colors: colorArray,
      images: images,
    });

    onClose();
  };

  const formContent = (
    <div className={`relative w-full ${isInline ? 'max-w-xl' : 'max-w-md max-h-[92vh]'} overflow-hidden rounded-none bg-white shadow-xl border border-zinc-200 flex flex-col text-left animate-slide-up`}>
      
      {/* Modal Header */}
      <div className="p-5 px-6 border-b border-zinc-205 bg-zinc-950 text-white flex justify-between items-center shrink-0">
        <div>
          <span className="text-[8px] tracking-widest uppercase font-mono font-bold text-zinc-400 block">Maurya Collections Log</span>
          <h3 className="text-xs font-serif font-normal uppercase tracking-wider text-white mt-1 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            Edit Style Details
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-none border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs font-normal transition-all hover:bg-zinc-900"
        >
          ✕
        </button>
      </div>

      {/* Modal Form body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-zinc-800">
        
        <div className="space-y-4">
          
          {/* Standard inputs */}
          <div>
            <label htmlFor="edit-style-name" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Garment Title / Description *
            </label>
            <input
              type="text"
              id="edit-style-name"
              required
              placeholder="e.g. Traditional Embroidered Silk Lehenga"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-style-gender" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Gender Selector
              </label>
              <select
                id="edit-style-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Product['gender'])}
                className="block w-full rounded-none border border-zinc-200 bg-white py-2 px-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-semibold cursor-pointer"
              >
                <option value="Girls">Girls Selection</option>
                <option value="Boys">Boys Selection</option>
                <option value="Unisex">Unisex Wear</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-style-age" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Age Bracket
              </label>
              <select
                id="edit-style-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as Product['ageGroup'])}
                className="block w-full rounded-none border border-zinc-200 bg-white py-2 px-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-semibold cursor-pointer"
              >
                <option value="Baby (0-2)">Baby (0-2 Yrs)</option>
                <option value="Toddler (2-5)">Toddler (2-5 Yrs)</option>
                <option value="Kids (5-12)">Kids (5-12 Yrs)</option>
                <option value="Teens (12-18)">Teens (12-18 Yrs)</option>
                <option value="All Age Groups">All Age Groups</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <label htmlFor="edit-style-category" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Category *
              </label>
              <input
                type="text"
                id="edit-style-category"
                required
                placeholder="e.g. Ethnic, Jumpsuits"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>

          {/* Price ranges */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-style-pricemin" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Min Range (₹) *
              </label>
              <input
                type="number"
                id="edit-style-pricemin"
                required
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-mono font-bold"
              />
            </div>

            <div>
              <label htmlFor="edit-style-pricemax" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Max Range (₹) *
              </label>
              <input
                type="number"
                id="edit-style-pricemax"
                required
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-mono font-bold"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label htmlFor="edit-style-sizes" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Sizes List (Comma Separated) *
            </label>
            <input
              type="text"
              id="edit-style-sizes"
              required
              placeholder="e.g. 6-7Y, 8-9Y, 10-12Y"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
          </div>

          {/* Colors */}
          <div>
            <label htmlFor="edit-style-colors" className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Colors Available (Comma Separated) *
            </label>
            <input
              type="text"
              id="edit-style-colors"
              required
              placeholder="e.g. Crimson Red, Ivory Cream, Sky Blue"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="block w-full rounded-none border border-zinc-200 bg-zinc-50/20 py-2 px-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
          </div>

          {/* 📸 REAL IMAGE UPLOAD & PREVIEWS AS BASE64 */}
          <div>
            <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Atelier Photography (Local File Upload) *
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed p-6 text-center cursor-pointer transition-all rounded-none ${
                isDragging
                  ? 'border-zinc-900 bg-zinc-50/80'
                  : 'border-zinc-200 hover:border-zinc-900 bg-zinc-50/30'
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
              
              <Upload className="mx-auto h-5 w-5 text-zinc-400 mb-2" />
              <p className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Drag &amp; drop photos here or <span className="text-zinc-950 underline">browse</span></p>
              <p className="text-[9px] text-zinc-400 mt-1 uppercase tracking-wide font-mono">png or jpeg format. Saves immediately.</p>
            </div>

            {/* Uploaded Base64 Thumbnails */}
            {images.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[8px] font-bold text-zinc-400 uppercase block font-mono tracking-wider">Uploaded Previews ({images.length})</span>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((base64Url, idx) => (
                    <div key={idx} className="relative h-14 rounded-none bg-zinc-100 border border-zinc-250 overflow-hidden group">
                      <img src={base64Url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-0 right-0 h-5 w-5 bg-zinc-950 text-white hover:bg-rose-600 flex items-center justify-center text-[9px] transition-colors rounded-none"
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
        <div className="pt-5 border-t border-zinc-200 flex gap-3 shrink-0 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-none border border-zinc-300 text-[10px] font-bold uppercase tracking-widest text-zinc-650 hover:bg-zinc-50 hover:border-zinc-900 text-center transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none shadow-xs transition-colors text-center"
          >
            Save Changes
          </button>
        </div>

      </form>

    </div>
  );

  if (isInline) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs transition-opacity overflow-y-auto animate-fade-in">
      {formContent}
    </div>
  );
}
