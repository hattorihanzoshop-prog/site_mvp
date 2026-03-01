import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Flow Consulting's AI market report was instrumental in shaping our $2B investment strategy. The depth of analysis and accuracy of projections exceeded every other research firm we've worked with.",
    name: "Sarah Chen",
    title: "Chief Strategy Officer",
    company: "Meridian Capital Partners",
    rating: 5,
  },
  {
    quote: "We've subscribed to their enterprise package for three years running. The quarterly updates and analyst support have become integral to our strategic planning process.",
    name: "Michael Okafor",
    title: "VP of Market Intelligence",
    company: "Atlas Global Industries",
    rating: 5,
  },
  {
    quote: "The custom research deliverable was exceptional — tailored exactly to our market entry needs with actionable recommendations that saved us months of internal analysis.",
    name: "Elena Rodriguez",
    title: "Director of Business Development",
    company: "NovaTech Solutions",
    rating: 5,
  },
];

const logos = [
  'Meridian Capital', 'Atlas Global', 'NovaTech', 'Vertex Labs', 'Pinnacle Corp',
  'Apex Industries', 'Zenith Group', 'Quantum Holdings', 'Stellar Dynamics', 'Nexus Ventures',
  'Prism Analytics', 'Forge Capital', 'Summit Partners', 'Vanguard Research', 'Catalyst Fund',
];

export default function ClientLogos() {
  return (
    <section id="social-proof" className="py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Social Proof</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit]">Trusted by Industry Leaders</h2>
        </motion.div>

        {/* Logo marquee */}
        <div className="relative mb-20">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A1628] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A1628] to-transparent z-10" />
          <div className="overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...logos, ...logos].map((name, i) => (
                <div key={i} className="inline-flex items-center justify-center mx-8 min-w-[140px]">
                  <div className="px-6 py-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-sm font-medium text-slate-500 tracking-wide">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              data-testid={`testimonial-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-2xl p-6 border border-white/10"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.title}, {t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
