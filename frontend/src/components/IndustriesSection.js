import { motion } from 'framer-motion';
import { Monitor, Heart, Landmark, Zap, Factory, ShoppingBag, Car, Radio, Building2, Wheat, Plane, Film } from 'lucide-react';

const ICON_MAP = {
  Monitor, Heart, Landmark, Zap, Factory, ShoppingBag, Car, Radio, Building2, Wheat, Plane, Film
};

export default function IndustriesSection({ industries, onIndustryClick }) {
  return (
    <section id="industries" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Coverage</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit]">
            Industries We Cover
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {industries.map((ind, i) => {
            const Icon = ICON_MAP[ind.icon] || Monitor;
            return (
              <motion.button
                key={ind.name}
                data-testid={`industry-${ind.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onIndustryClick(ind.name)}
                className="group glass rounded-2xl p-5 text-center hover:border-[#00B4D8]/40 hover:shadow-[0_0_30px_-10px_rgba(0,180,216,0.2)] transition-all duration-300 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#00B4D8]/20 transition-all">
                  <Icon className="w-6 h-6 text-[#00B4D8]" />
                </div>
                <p className="text-sm font-medium text-white mb-1">{ind.name}</p>
                <p className="text-xs text-slate-500">{ind.report_count} report{ind.report_count !== 1 ? 's' : ''}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
