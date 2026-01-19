import { Plus } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div 
      onClick={() => onAddToCart(product)}
      className="group bg-gradient-card rounded-xl md:rounded-2xl cursor-pointer shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-300 border border-earth-100 hover:border-accent-gold/30 flex flex-col h-full overflow-hidden animate-fade-in touch-feedback"
    >
      {/* Image Container */}
      <div className="aspect-square bg-earth-100 relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
            <span className="text-4xl md:text-6xl group-hover:scale-110 transition-transform duration-500">🥐</span>
          </div>
        )}
        
        {/* Gradient Overlay - Desktop only */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-earth-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Add Button - Desktop only */}
        <div className="hidden md:flex absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-white/95 backdrop-blur-sm text-earth-900 font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm border border-white/50 w-full">
            <Plus size={16} strokeWidth={2.5} />
            <span>Add to Order</span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg bg-white/90 backdrop-blur-sm text-[8px] md:text-[10px] font-bold text-earth-600 uppercase tracking-wider shadow-sm">
            {product.category || 'Bakery'}
          </span>
        </div>
        
        {/* Mobile Add Indicator */}
        <div className="md:hidden absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <Plus size={16} className="text-earth-700" />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="font-serif text-sm md:text-lg font-bold text-earth-900 leading-snug group-hover:text-earth-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between">
          <span className="text-base md:text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
          </span>
          
          {/* Stock indicator - Desktop only */}
          <div className="hidden md:flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            <span className="text-[10px] font-semibold text-earth-400 uppercase">In Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
