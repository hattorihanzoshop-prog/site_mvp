import { motion } from 'framer-motion';
import { FileText, Calendar, ShoppingCart } from 'lucide-react';

export default function FeaturedReports({ reports, onViewReport, onAddToCart }) {
  if (!reports || reports.length === 0) return null;

  return (
    <section id="featured" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Featured Reports</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit]">
            Our Most In-Demand Market Intelligence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.slice(0, 6).map((report, i) => (
            <motion.div
              key={report.id}
              data-testid={`featured-report-${report.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-[#00B4D8]/40 hover:shadow-[0_0_40px_-10px_rgba(0,180,216,0.2)] flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={report.cover_image}
                  alt={report.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-xs font-medium border border-[#00B4D8]/30">
                  {report.industry}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3
                  className="text-lg font-bold text-white mb-2 group-hover:text-[#00B4D8] transition-colors line-clamp-2 cursor-pointer"
                  onClick={() => onViewReport(report)}
                >
                  {report.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">{report.description}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{report.pages} pages</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{report.publish_date}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[#F59E0B] font-mono font-bold text-lg">${report.price_single.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      data-testid={`add-cart-featured-${report.id}`}
                      onClick={() => onAddToCart(report, 'single')}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-[#F59E0B] hover:border-[#F59E0B]/30 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`view-report-featured-${report.id}`}
                      onClick={() => onViewReport(report)}
                      className="px-4 py-2 rounded-lg bg-[#00B4D8]/10 text-[#00B4D8] text-sm font-medium hover:bg-[#00B4D8]/20 transition-all"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
