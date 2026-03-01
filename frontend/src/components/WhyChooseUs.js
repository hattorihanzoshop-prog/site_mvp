import { motion } from 'framer-motion';
import { Users, Database, Target, Wrench, RefreshCw, Headphones } from 'lucide-react';

const features = [
  { icon: Users, title: 'Expert Analysts', desc: 'Our team includes PhDs and industry veterans with 15+ years of experience' },
  { icon: Database, title: 'Proprietary Data', desc: 'Access exclusive datasets from primary research across 150+ countries' },
  { icon: Target, title: 'Actionable Insights', desc: 'Every report includes strategic recommendations, not just data' },
  { icon: Wrench, title: 'Custom Research', desc: 'Tailored reports designed to answer your specific business questions' },
  { icon: RefreshCw, title: 'Regular Updates', desc: 'Reports updated quarterly to reflect latest market dynamics' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Personal analyst support included with every enterprise license' },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - sticky text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-32"
          >
            <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Why Us</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit] mb-6">
              Why Leading Companies Trust Flow Consulting
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              We combine rigorous research methodology with deep industry expertise to deliver market intelligence that drives real business outcomes.
            </p>
          </motion.div>

          {/* Right - feature cards */}
          <div className="space-y-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                data-testid={`feature-${feat.title.toLowerCase().replace(/\s+/g, '-')}`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass rounded-2xl p-6 flex gap-5 items-start hover:border-[#00B4D8]/30 transition-all border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B4D8]/20 transition-all">
                  <feat.icon className="w-6 h-6 text-[#00B4D8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1 font-[Outfit]">{feat.title}</h3>
                  <p className="text-sm text-slate-400">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
