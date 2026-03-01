import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Calendar, ShoppingCart, Download, Grid3X3, List, ChevronDown } from 'lucide-react';

export default function ReportCatalog({ reports, onViewReport, onAddToCart, onSampleDownload, initialIndustryFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState(initialIndustryFilter || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 9;

  const industries = useMemo(() => [...new Set(reports.map(r => r.industry))].sort(), [reports]);
  const categories = useMemo(() => [...new Set(reports.map(r => r.category))].sort(), [reports]);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase()) && !r.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (industryFilter && r.industry !== industryFilter) return false;
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (priceFilter) {
        const p = r.price_single;
        if (priceFilter === 'under1000' && p >= 1000) return false;
        if (priceFilter === '1000-3000' && (p < 1000 || p > 3000)) return false;
        if (priceFilter === '3000-5000' && (p < 3000 || p > 5000)) return false;
        if (priceFilter === '5000plus' && p < 5000) return false;
      }
      return true;
    });
  }, [reports, searchTerm, industryFilter, categoryFilter, priceFilter]);

  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('');
    setCategoryFilter('');
    setPriceFilter('');
    setCurrentPage(1);
  };

  const hasFilters = searchTerm || industryFilter || categoryFilter || priceFilter;

  return (
    <section id="catalog" className="py-24 md:py-32 relative bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Research Catalog</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit]">
            Explore Our Reports
          </h2>
        </motion.div>

        {/* Filters Bar */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                data-testid="catalog-search"
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] outline-none transition-all text-sm"
              />
            </div>

            <button
              data-testid="toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm"
            >
              <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`flex flex-col lg:flex-row gap-3 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <select
                data-testid="filter-industry"
                value={industryFilter}
                onChange={e => { setIndustryFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="">All Industries</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select
                data-testid="filter-category"
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="">All Types</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select
                data-testid="filter-price"
                value={priceFilter}
                onChange={e => { setPriceFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="">Any Price</option>
                <option value="under1000">Under $1,000</option>
                <option value="1000-3000">$1,000 - $3,000</option>
                <option value="3000-5000">$3,000 - $5,000</option>
                <option value="5000plus">$5,000+</option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-1 border border-white/10 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500">{filtered.length} results</span>
              <button data-testid="clear-filters" onClick={clearFilters} className="text-xs text-[#00B4D8] hover:underline">Clear all</button>
            </div>
          )}
        </div>

        {/* Report Grid/List */}
        {paged.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No reports found matching your criteria.</p>
            <button onClick={clearFilters} className="mt-4 text-[#00B4D8] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {paged.map((report, i) => (
              viewMode === 'grid' ? (
                <ReportGridCard key={report.id} report={report} index={i} onView={onViewReport} onCart={onAddToCart} onSample={onSampleDownload} />
              ) : (
                <ReportListCard key={report.id} report={report} index={i} onView={onViewReport} onCart={onAddToCart} onSample={onSampleDownload} />
              )
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                data-testid={`page-${i + 1}`}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#00B4D8] text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReportGridCard({ report, index, onView, onCart, onSample }) {
  return (
    <motion.div
      data-testid={`catalog-report-${report.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#00B4D8]/40 hover:shadow-[0_0_40px_-10px_rgba(0,180,216,0.15)] flex flex-col"
    >
      <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => onView(report)}>
        <img src={report.cover_image} alt={report.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-[11px] font-medium border border-[#00B4D8]/30">{report.industry}</span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] border border-white/10">{report.category}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00B4D8] transition-colors line-clamp-2 cursor-pointer" onClick={() => onView(report)}>{report.title}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2 flex-1">{report.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{report.pages}p</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.publish_date}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-[#F59E0B] font-mono font-bold">${report.price_single.toLocaleString()}</span>
          <div className="flex gap-2">
            <button data-testid={`sample-${report.id}`} onClick={() => onSample(report)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#00B4D8] transition-all" title="Download Sample">
              <Download className="w-4 h-4" />
            </button>
            <button data-testid={`add-cart-${report.id}`} onClick={() => onCart(report, 'single')} className="p-1.5 rounded-lg text-slate-500 hover:text-[#F59E0B] transition-all" title="Add to Cart">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button data-testid={`view-${report.id}`} onClick={() => onView(report)} className="px-3 py-1.5 rounded-lg bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-medium hover:bg-[#00B4D8]/20 transition-all">
              View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReportListCard({ report, index, onView, onCart, onSample }) {
  return (
    <motion.div
      data-testid={`catalog-report-${report.id}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group flex gap-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-[#00B4D8]/40"
    >
      <div className="w-40 h-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer" onClick={() => onView(report)}>
        <img src={report.cover_image} alt={report.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-[10px] font-medium">{report.industry}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-[10px]">{report.category}</span>
        </div>
        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#00B4D8] transition-colors cursor-pointer truncate" onClick={() => onView(report)}>{report.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-1 mb-2">{report.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{report.pages} pages</span>
            <span>{report.publish_date}</span>
            <span className="text-[#F59E0B] font-mono font-bold">${report.price_single.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onSample(report)} className="p-1.5 rounded-lg text-slate-500 hover:text-[#00B4D8] transition-all"><Download className="w-3.5 h-3.5" /></button>
            <button onClick={() => onCart(report, 'single')} className="p-1.5 rounded-lg text-slate-500 hover:text-[#F59E0B] transition-all"><ShoppingCart className="w-3.5 h-3.5" /></button>
            <button onClick={() => onView(report)} className="px-3 py-1 rounded-lg bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-medium hover:bg-[#00B4D8]/20 transition-all">View</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
