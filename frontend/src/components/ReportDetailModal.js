import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileText, BarChart3, Table2, Building2, Globe, Calendar, Hash, ShoppingCart, Download, ChevronDown, ChevronRight } from 'lucide-react';

export default function ReportDetailModal({ report, open, onClose, onAddToCart, onSampleDownload, onViewReport, relatedReports }) {
  const [tocOpen, setTocOpen] = useState(false);

  if (!report) return null;

  const specs = [
    { icon: FileText, label: 'Pages', value: report.pages },
    { icon: BarChart3, label: 'Figures/Charts', value: report.figures },
    { icon: Table2, label: 'Tables', value: report.tables },
    { icon: Building2, label: 'Companies Profiled', value: report.companies_profiled },
    { icon: Globe, label: 'Regions Covered', value: report.regions_covered },
    { icon: Calendar, label: 'Published', value: report.publish_date },
    { icon: Hash, label: 'Report ID', value: report.report_id },
  ];

  const licenses = [
    { type: 'single', label: 'Single User License', price: report.price_single, desc: 'For individual use only' },
    { type: 'multi', label: 'Multi User License (up to 5)', price: report.price_multi, desc: 'Share with your team' },
    { type: 'enterprise', label: 'Enterprise / Corporate License', price: report.price_enterprise, desc: 'Organization-wide access' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0F1D32] border-white/10 text-white p-0">
        {/* Hero Image */}
        <div className="relative h-56 overflow-hidden rounded-t-lg">
          <img src={report.cover_image} alt={report.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1D32] via-[#0F1D32]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-xs font-medium border border-[#00B4D8]/30 mb-3">{report.industry}</span>
            <DialogHeader>
              <DialogTitle data-testid="report-detail-title" className="text-2xl md:text-3xl font-bold text-white font-[Outfit] leading-tight">{report.title}</DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 font-[Outfit]">Overview</h3>
            {report.detailed_description.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3">{para}</p>
            ))}
          </div>

          {/* Key Findings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 font-[Outfit]">Key Findings</h3>
            <div className="space-y-2">
              {report.key_findings.map((finding, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-300">{finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TOC */}
          <div>
            <button
              data-testid="toggle-toc"
              onClick={() => setTocOpen(!tocOpen)}
              className="flex items-center gap-2 text-lg font-semibold text-white font-[Outfit] hover:text-[#00B4D8] transition-colors"
            >
              {tocOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              Table of Contents
            </button>
            {tocOpen && (
              <div className="mt-3 space-y-1">
                {report.table_of_contents.map((ch, i) => (
                  <div key={i} className="flex justify-between py-2 px-4 rounded-lg hover:bg-white/5 text-sm">
                    <span className="text-slate-300">Ch. {ch.chapter}: {ch.title}</span>
                    <span className="text-slate-500 text-xs">pp. {ch.pages}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Methodology */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 font-[Outfit]">Methodology</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{report.methodology}</p>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 font-[Outfit]">Report Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="glass rounded-xl p-3 text-center">
                  <spec.icon className="w-4 h-4 text-[#00B4D8] mx-auto mb-1" />
                  <p className="text-xs text-slate-500">{spec.label}</p>
                  <p className="text-sm font-semibold text-white">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 font-[Outfit]">Choose Your License</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {licenses.map((lic) => (
                <div key={lic.type} className="glass rounded-xl p-5 text-center hover:border-[#F59E0B]/30 transition-all border border-white/10">
                  <p className="text-sm font-medium text-slate-300 mb-1">{lic.label}</p>
                  <p className="text-xs text-slate-500 mb-3">{lic.desc}</p>
                  <p className="text-2xl font-bold text-[#F59E0B] font-mono mb-4">${lic.price.toLocaleString()}</p>
                  <button
                    data-testid={`buy-${lic.type}-${report.id}`}
                    onClick={() => { onAddToCart(report, lic.type); onClose(); }}
                    className="w-full py-2.5 rounded-full bg-[#F59E0B] text-black font-semibold text-sm hover:bg-[#D97706] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    <ShoppingCart className="w-4 h-4 inline mr-2" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              data-testid="download-sample-modal"
              onClick={() => onSampleDownload(report)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all"
            >
              <Download className="w-4 h-4" /> Download Free Sample PDF
            </button>
          </div>

          {/* Related Reports */}
          {relatedReports && relatedReports.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 font-[Outfit]">Related Reports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedReports.map((r) => (
                  <div
                    key={r.id}
                    className="glass rounded-xl p-4 cursor-pointer hover:border-[#00B4D8]/30 transition-all border border-white/10"
                    onClick={() => onViewReport(r)}
                    data-testid={`related-report-${r.id}`}
                  >
                    <span className="text-[10px] text-[#00B4D8]">{r.industry}</span>
                    <h4 className="text-sm font-semibold text-white mt-1 line-clamp-2">{r.title}</h4>
                    <p className="text-[#F59E0B] font-mono text-sm mt-2">${r.price_single.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
