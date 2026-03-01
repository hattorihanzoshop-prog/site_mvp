import { useState, useEffect, useCallback } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturedReports from './components/FeaturedReports';
import ReportCatalog from './components/ReportCatalog';
import ReportDetailModal from './components/ReportDetailModal';
import IndustriesSection from './components/IndustriesSection';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import ClientLogos from './components/ClientLogos';
import CustomResearchCTA from './components/CustomResearchCTA';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchOverlay from './components/SearchOverlay';
import SampleDownloadModal from './components/SampleDownloadModal';
import AdminPage from './components/admin/AdminPage';

const API = '/api';

function MainPage() {
  const [reports, setReports] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fc_cart') || '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sampleReport, setSampleReport] = useState(null);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Persist cart
  useEffect(() => {
    localStorage.setItem('fc_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, industriesRes] = await Promise.all([
          axios.get(`${API}/reports?limit=50`),
          axios.get(`${API}/industries`),
        ]);
        setReports(reportsRes.data.reports || []);
        setIndustries(industriesRes.data || []);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    };
    fetchData();
  }, []);

  // Handle payment return
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      pollPaymentStatus(sessionId);
      searchParams.delete('payment');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled');
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    if (attempts >= 5) {
      toast.info('Payment is being processed. Check your email for confirmation.');
      return;
    }
    try {
      const res = await axios.get(`${API}/checkout/status/${sessionId}`);
      if (res.data.payment_status === 'paid') {
        toast.success('Payment successful! Your reports are ready for download.');
        setCart([]);
        return;
      }
      if (res.data.status === 'expired') {
        toast.error('Payment session expired. Please try again.');
        return;
      }
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch {
      toast.error('Error checking payment status.');
    }
  };

  const addToCart = useCallback((report, licenseType) => {
    const exists = cart.find(c => c.id === report.id && c.license_type === licenseType);
    if (exists) {
      toast.info('This report is already in your cart');
      return;
    }
    setCart(prev => [...prev, { ...report, license_type: licenseType }]);
    toast.success(`Added to cart: ${report.title}`, { description: `License: ${licenseType}` });
  }, [cart]);

  const removeFromCart = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    toast.info('Removed from cart');
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(c => ({ report_id: c.id, license_type: c.license_type }));
      const res = await axios.post(`${API}/checkout`, {
        items,
        origin_url: window.location.origin,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      toast.error('Checkout failed. Please try again.');
      console.error('Checkout error:', e);
    }
  };

  const viewReport = useCallback((report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  }, []);

  const handleSampleDownload = useCallback((report) => {
    setSampleReport(report);
    setSampleOpen(true);
  }, []);

  const handleIndustryClick = useCallback((industryName) => {
    setIndustryFilter(industryName);
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const featuredReports = reports.filter(r => r.featured);
  const relatedReports = selectedReport
    ? reports.filter(r => r.industry === selectedReport.industry && r.id !== selectedReport.id).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Header
        cartCount={cart.length}
        onCartClick={() => setCartOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />

      <HeroSection
        onExplore={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
        onCustomResearch={() => document.getElementById('custom-research')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <FeaturedReports
        reports={featuredReports}
        onViewReport={viewReport}
        onAddToCart={addToCart}
      />

      <ReportCatalog
        reports={reports}
        onViewReport={viewReport}
        onAddToCart={addToCart}
        onSampleDownload={handleSampleDownload}
        initialIndustryFilter={industryFilter}
      />

      <IndustriesSection
        industries={industries}
        onIndustryClick={handleIndustryClick}
      />

      <HowItWorks />
      <WhyChooseUs />
      <ClientLogos />
      <CustomResearchCTA />
      <Newsletter />
      <Footer />

      {/* Modals & Drawers */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onViewReport={viewReport}
        reports={reports}
      />

      <ReportDetailModal
        report={selectedReport}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAddToCart={addToCart}
        onSampleDownload={handleSampleDownload}
        onViewReport={viewReport}
        relatedReports={relatedReports}
      />

      <SampleDownloadModal
        report={sampleReport}
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1D32',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F8FAFC',
          },
        }}
      />
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
