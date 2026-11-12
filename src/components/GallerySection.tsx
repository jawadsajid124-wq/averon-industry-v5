import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Plus, 
  ExternalLink, 
  Eye, 
  X, 
  Image as ImageIcon,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { GalleryPhoto, User } from '../types/index.ts';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  user: User | null;
  onOpenOwnerGallery?: () => void;
  onQuickUpload?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  photos,
  user,
  onOpenOwnerGallery,
  onQuickUpload,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const categories = ['All', 'Watches', 'Wallets', 'Sunglasses', 'Perfumes', 'Accessories', 'Atelier'];

  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const isOwner = Boolean(
    user && (user.role === 'super_owner' || user.role === 'owner' || user.role === 'admin')
  );

  return (
    <section id="gallery-section" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-tech text-cyan-400 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold">
              MAISON ARCHIVES & ATELIER
            </span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide">
            AVERON Gallery & Visual Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5 max-w-xl">
            Explore authentic captures of limited-production pieces, metallurgical details, and bespoke client commissions.
          </p>
        </div>

        {/* Owner Controls (Exclusively for Authorized Owners) */}
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenOwnerGallery}
              className="px-3.5 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-950/70 text-cyan-300 font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Owner: Google Photos Vault</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
          const count = cat === 'All' ? photos.length : photos.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-tech uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-black/30 text-black font-bold' : 'bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compact Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="py-12 text-center text-slate-500 font-tech text-xs">
          No captures recorded in the {activeCategory} category yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative luxury-glass rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.6)] aspect-square flex flex-col justify-end"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Tag / Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-0.5 rounded text-[9px] font-tech uppercase font-bold tracking-wider bg-black/70 border border-slate-700 text-cyan-300 backdrop-blur-md">
                  {photo.category}
                </span>
              </div>

              {photo.source === 'google_photos' && (
                <div className="absolute top-2 right-2 z-10" title="Imported via Google Photos">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-tech uppercase font-bold tracking-wider bg-blue-950/80 border border-blue-500/40 text-blue-300 backdrop-blur-md">
                    Google Photos
                  </span>
                </div>
              )}

              {/* Details Overlay on Hover/Touch */}
              <div className="relative z-10 p-2.5 sm:p-3 text-left">
                <h4 className="font-cinzel text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {photo.title}
                </h4>
                {photo.caption && (
                  <p className="text-[10px] text-slate-300 line-clamp-1 font-sans mt-0.5">
                    {photo.caption}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                  <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>View</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#090b10] border border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-tech uppercase font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  {selectedPhoto.category}
                </span>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-full max-h-[60vh] object-contain"
              />
            </div>

            {/* Footer / Description */}
            <div className="p-4 bg-[#07090e] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="text-slate-300 font-sans text-xs">
                  {selectedPhoto.caption || 'Authentic AVERON INDUSTRY visual capture.'}
                </p>
                <p className="text-[10px] font-tech text-slate-500 mt-0.5">
                  Archived on {new Date(selectedPhoto.uploadedAt).toLocaleDateString()} · {selectedPhoto.source === 'google_photos' ? 'Google Photos Vault' : 'Atelier Direct Capture'}
                </p>
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-tech text-xs uppercase tracking-wider shrink-0"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
