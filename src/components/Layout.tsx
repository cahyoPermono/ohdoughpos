import React, { useState } from 'react';
import { LayoutGrid, ShoppingBag, History, LogOut, Sparkles, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'pos' | 'products' | 'history';
  onTabChange: (tab: 'pos' | 'products' | 'history') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-warm text-earth-800 font-sans selection:bg-accent-gold/30">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gradient-sidebar text-white sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-lg font-bold">Oh! Dough</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-14">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-14 left-0 right-0 bg-gradient-sidebar p-4 shadow-2xl animate-slide-up">
            <nav className="space-y-2">
              <MobileNavItem 
                icon={<ShoppingBag size={20} />} 
                label="Point of Sale" 
                active={activeTab === 'pos'} 
                onClick={() => { onTabChange('pos'); setIsMobileMenuOpen(false); }} 
              />
              <MobileNavItem 
                icon={<LayoutGrid size={20} />} 
                label="Inventory" 
                active={activeTab === 'products'} 
                onClick={() => { onTabChange('products'); setIsMobileMenuOpen(false); }} 
              />
              <MobileNavItem 
                icon={<History size={20} />} 
                label="Transactions" 
                active={activeTab === 'history'} 
                onClick={() => { onTabChange('history'); setIsMobileMenuOpen(false); }} 
              />
            </nav>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <button className="flex items-center gap-3 w-full p-3 rounded-xl text-earth-400 hover:bg-white/5 hover:text-red-400 transition-all font-medium text-sm">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-gradient-sidebar flex-col z-20 shadow-sidebar hidden md:flex shrink-0">
        {/* Brand Header */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-white leading-none tracking-tight">Oh! Dough</h1>
              <p className="text-xs text-earth-400 font-medium tracking-widest mt-1.5 uppercase">Fresh Bakery</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          <div className="px-3 pb-3 pt-2">
            <p className="text-[10px] text-earth-500 font-bold uppercase tracking-widest">Menu</p>
          </div>
          
          <SidebarItem 
            icon={<ShoppingBag size={20} />} 
            label="Point of Sale" 
            active={activeTab === 'pos'} 
            onClick={() => onTabChange('pos')} 
          />
          <SidebarItem 
            icon={<LayoutGrid size={20} />} 
            label="Inventory" 
            active={activeTab === 'products'} 
            onClick={() => onTabChange('products')} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Transactions" 
            active={activeTab === 'history'} 
            onClick={() => onTabChange('history')} 
          />
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-earth-900 font-bold">
              CS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Cashier</p>
              <p className="text-xs text-earth-400 truncate">cashier@ohdough.id</p>
            </div>
          </div>
          
          <button className="flex items-center gap-3 w-full p-3 rounded-xl text-earth-400 hover:bg-white/5 hover:text-red-400 transition-all font-medium text-sm group">
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
         {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-earth-100 px-2 py-2 z-30 safe-area-bottom">
        <div className="flex justify-around items-center">
          <BottomNavItem 
            icon={<ShoppingBag size={22} />} 
            label="POS" 
            active={activeTab === 'pos'} 
            onClick={() => onTabChange('pos')} 
          />
          <BottomNavItem 
            icon={<LayoutGrid size={22} />} 
            label="Inventory" 
            active={activeTab === 'products'} 
            onClick={() => onTabChange('products')} 
          />
          <BottomNavItem 
            icon={<History size={22} />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => onTabChange('history')} 
          />
        </div>
      </nav>
    </div>
  );
}

// Desktop Sidebar Item
function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm relative overflow-hidden group
        ${active 
          ? 'bg-white/10 text-white shadow-inner-light' 
          : 'text-earth-300 hover:bg-white/5 hover:text-white'
        }
      `}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-gold rounded-r-full" />
      )}
      
      <span className={`transition-colors ${active ? 'text-accent-gold' : 'text-earth-400 group-hover:text-earth-200'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      
      {active && (
        <Sparkles size={14} className="text-accent-gold animate-pulse-soft" />
      )}
    </button>
  );
}

// Mobile Nav Item (for slide-out menu)
function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-4 rounded-xl transition-all font-medium text-sm
        ${active 
          ? 'bg-white/10 text-white' 
          : 'text-earth-300 hover:bg-white/5 hover:text-white'
        }
      `}
    >
      <span className={active ? 'text-accent-gold' : 'text-earth-400'}>{icon}</span>
      <span>{label}</span>
      {active && <div className="ml-auto w-2 h-2 rounded-full bg-accent-gold" />}
    </button>
  );
}

// Mobile Bottom Navigation Item
function BottomNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all min-w-[72px]
        ${active 
          ? 'text-earth-800 bg-accent-warm' 
          : 'text-earth-400 hover:text-earth-600'
        }
      `}
    >
      <span className={active ? 'text-accent-copper' : ''}>{icon}</span>
      <span className={`text-[10px] font-semibold mt-1 ${active ? 'text-earth-800' : ''}`}>{label}</span>
    </button>
  );
}
