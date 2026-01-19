import { useMemo } from 'react';
import { Trash2, ChevronRight, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import type { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  isProcessing: boolean;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout, isProcessing }: CartProps) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <div className="h-full flex flex-col bg-white shadow-xl z-10 w-full">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-sidebar" />
        <div className="relative p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-2xl font-bold">Current Order</h2>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <ShoppingBag size={14} />
              <span className="text-sm font-bold">{itemCount}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-earth-300">
            <span className="font-mono">#{new Date().toISOString().slice(0,10).replace(/-/g,'')}-001</span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
              Walk-in Customer
            </span>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 400 20" className="w-full h-5 text-white fill-current">
            <path d="M0,20 Q100,0 200,10 Q300,20 400,5 L400,20 L0,20 Z" />
          </svg>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-earth-50/50">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-earth-300 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-earth-100 flex items-center justify-center">
              <ShoppingBag size={32} className="text-earth-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-earth-500 mb-1">No items yet</p>
              <p className="text-sm text-earth-400">Tap products to add them</p>
            </div>
          </div>
        ) : items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex gap-4 p-4 bg-white rounded-2xl border border-earth-100 shadow-card hover:shadow-card-hover hover:border-accent-gold/30 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Product Image */}
            <div className="w-16 h-16 bg-earth-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              {item.product.image_url ? 
                <img src={item.product.image_url} className="w-full h-full object-cover" alt="" /> : 
                <span className="text-2xl">🥐</span>
              }
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-bold text-earth-900 text-sm truncate mb-0.5">{item.product.name}</h4>
              <p className="text-earth-500 text-xs font-medium">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.product.price)} × {item.quantity}
              </p>
              <p className="text-sm font-bold text-earth-700 mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.product.price * item.quantity)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                className="p-1.5 text-earth-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
              
              <div className="flex items-center gap-1 bg-earth-100 rounded-lg p-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, -1); }}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-earth-600 hover:bg-white hover:text-earth-900 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-all"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-6 text-center text-earth-900">{item.quantity}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 1); }}
                  className="w-7 h-7 flex items-center justify-center text-earth-600 hover:bg-white hover:text-earth-900 rounded-md transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 bg-white border-t border-earth-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
        {/* Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-earth-500">Subtotal ({itemCount} items)</span>
            <span className="text-earth-700 font-medium">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-earth-500">Tax (0%)</span>
            <span className="text-earth-700 font-medium">Rp0</span>
          </div>
          <div className="h-px bg-earth-100" />
          <div className="flex justify-between items-center">
            <span className="font-serif text-lg text-earth-900">Total</span>
            <span className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button 
          onClick={onCheckout}
          disabled={isProcessing || items.length === 0}
          className="w-full bg-gradient-button text-white h-14 rounded-2xl font-bold text-base shadow-button hover:shadow-button-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group relative overflow-hidden"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 transition-opacity" />
          
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <>
              <Sparkles size={18} className="opacity-70" />
              <span>Complete Order</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
