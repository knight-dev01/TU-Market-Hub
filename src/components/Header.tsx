import { useState } from 'react';
import { Menu, X, ShoppingBag, ShieldCheck, User, Sparkles } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => void;
  isAdmin: boolean;
  user: FirebaseUser | null;
  onLoginClick: () => void;
  cartCount: number;
  onCartToggle: () => void;
}

export default function Header({
  currentView,
  onViewChange,
  isAdmin,
  user,
  onLoginClick,
  cartCount,
  onCartToggle
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', value: 'home' as const },
    { label: 'Browse Shop', value: 'shop' as const },
    { label: 'About Us', value: 'about' as const },
    { label: 'Contact', value: 'contact' as const }
  ];

  const handleNavClick = (view: 'home' | 'shop' | 'about' | 'contact' | 'admin') => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-white border-b border-gray-150 shadow-xs backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex-shrink-0 cursor-pointer flex items-center space-x-2.5" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-md bg-emerald-brand flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg sm:text-xl tracking-wider text-slate-brand leading-none">
                TU <span className="text-emerald-brand">MARKET</span> HUB
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = currentView === item.value;
              return (
                <button
                  key={item.value}
                  id={`nav-link-${item.value}`}
                  onClick={() => handleNavClick(item.value)}
                  className={`relative font-semibold text-xs tracking-widest transition-colors py-2 uppercase ${
                    isActive ? 'text-emerald-brand' : 'text-slate-brand/70 hover:text-emerald-brand'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-emerald-brand rounded-sm" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Icons & Actions */}
          <div id="header-actions" className="hidden md:flex items-center space-x-5">
            {/* My Order Drafter/Cart Icon */}
            <button
              id="cart-trigger"
              onClick={onCartToggle}
              className="relative p-2.5 rounded-md hover:bg-gray-100 text-slate-brand/80 hover:text-emerald-brand transition-colors cursor-pointer border border-gray-100"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-brand/70" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-brand text-white font-mono font-bold text-[9px] rounded-md flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard Indicator or Login */}
            {user ? (
              <div className="flex items-center space-x-3 bg-emerald-brand/5 px-4 py-2 rounded-md border border-emerald-brand/15">
                <div className="w-6 h-6 rounded-md bg-emerald-brand/10 flex items-center justify-center">
                  {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-brand" /> : <User className="w-4 h-4 text-emerald-brand" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-brand leading-none truncate max-w-[90px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-emerald-brand uppercase font-bold mt-0.5">
                    {isAdmin ? 'System Admin' : 'Seller'}
                  </span>
                </div>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="text-[10px] bg-emerald-brand hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-md cursor-pointer leading-none uppercase tracking-wider flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Stall</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-login"
                onClick={onLoginClick}
                className="text-xs font-bold text-emerald-brand hover:text-white border border-emerald-brand/30 hover:bg-emerald-brand rounded-md py-2.5 px-5 transition-all cursor-pointer uppercase tracking-wider"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Right Controls Menu */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Mobile Cart Icon */}
            <button
              onClick={onCartToggle}
              className="relative p-2 text-slate-brand/80 hover:text-emerald-brand cursor-pointer border border-gray-100 rounded-md"
            >
              <ShoppingBag className="w-5 h-5 text-slate-brand/70" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-brand text-white font-mono font-bold text-[9px] rounded-md flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-brand/80 hover:text-emerald-brand focus:outline-none cursor-pointer border border-gray-100 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-150 bg-white shadow-xl animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navItems.map((item) => {
              const isActive = currentView === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleNavClick(item.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-emerald-brand/10 text-emerald-brand border-l-4 border-emerald-brand font-bold'
                      : 'text-slate-brand/80 hover:bg-gray-100 hover:text-emerald-brand'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            <hr className="border-gray-100 my-2" />

            {/* Admin Area Link for Mobile */}
            {user ? (
              <div className="px-4 py-3 bg-emerald-brand/5 border border-emerald-brand/15 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-brand/90 mb-0.5 leading-none">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[9px] font-mono text-emerald-brand font-bold uppercase tracking-wider mb-0 leading-none">
                    {isAdmin ? 'System Admin' : 'Seller Stall'}
                  </p>
                </div>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="bg-emerald-brand hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg leading-none cursor-pointer uppercase tracking-wider"
                >
                  My Store
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center bg-emerald-brand/5 border border-emerald-brand/30 text-emerald-brand font-bold text-sm tracking-wide rounded-lg py-3 hover:bg-emerald-brand hover:text-white transition-all cursor-pointer uppercase"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
