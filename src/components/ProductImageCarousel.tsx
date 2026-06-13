import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageCarouselProps {
  images: string[];
  imageColor: string;
  name: string;
}

export default function ProductImageCarousel({ images, imageColor, name }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className={`h-48 w-full ${imageColor} flex items-center justify-center relative`}>
        <div className="text-center">
          <span className="text-4xl select-none">👕</span>
          <p className="text-[10px] font-bold text-slate-800 opacity-60 mt-1 uppercase tracking-wider font-mono">Boutique Wardrobe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 w-full relative bg-slate-900 overflow-hidden group">
      {/* Primary active image */}
      <img
        src={images[currentIndex]}
        alt={`${name} photo ${currentIndex + 1}`}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-all duration-300 transform group-hover:scale-105"
      />

      {/* Navigation arrows (if multiple photographs exist) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90"
            aria-label="Next photograph"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Image numbering and slide counts */}
      <span className="absolute bottom-2.5 left-2.5 bg-slate-950/80 text-[9px] font-extrabold text-amber-400 font-mono tracking-tight px-1.5 py-0.5 rounded backdrop-blur-xs">
        📸 {currentIndex + 1} / {images.length}
      </span>

      {/* Floating Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 right-0 left-0 flex justify-center space-x-1.5 pointer-events-none">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
