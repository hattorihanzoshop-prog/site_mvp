import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';

export default function Header({ cartCount, onCartClick, onSearchClick, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', target: 'hero' },
    { label: 'Reports', target: 'catalog' },
    { label: 'Industries', target: 'industries' },
    { label: 'About', target: 'why-choose-us' },
    { label: 'Contact', target: 'contact' },
  ];

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (onNavigate) onNavigate(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      data-testid="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A1628]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            data-testid="header-logo"
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#3B82F6] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[Outfit]">F</span>
            </div>
            <span className="text-lg font-bold text-white font-[Outfit] tracking-tight group-hover:text-[#00B4D8] transition-colors">
              Flow<span className="text-[#00B4D8]">.</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.target}
                data-testid={`nav-${item.target}`}
                onClick={() => scrollTo(item.target)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              data-testid="search-button"
              onClick={onSearchClick}
              className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              data-testid="cart-button"
              onClick={onCartClick}
              className="relative p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#F59E0B] text-black text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              data-testid="browse-reports-cta"
              onClick={() => scrollTo('catalog')}
              className="hidden md:inline-flex ml-2 px-5 py-2 rounded-full bg-[#00B4D8] text-white text-sm font-semibold hover:bg-[#0096B4] transition-all shadow-[0_0_20px_rgba(0,180,216,0.2)]"
            >
              Browse Reports
            </button>

            {/* Mobile toggle */}
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-300"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A1628]/98 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.target}
                data-testid={`mobile-nav-${item.target}`}
                onClick={() => scrollTo(item.target)}
                className="block w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('catalog')}
              className="w-full mt-2 px-5 py-3 rounded-full bg-[#00B4D8] text-white text-sm font-semibold"
            >
              Browse Reports
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
