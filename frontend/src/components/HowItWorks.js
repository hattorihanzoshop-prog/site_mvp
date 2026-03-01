import { motion } from 'framer-motion';
import { Search, CreditCard, Download, BarChart3 } from 'lucide-react';

const steps = [
  { icon: Search, num: '01', title: 'Browse', desc: 'Explore our extensive catalog of 500+ industry reports' },
  { icon: CreditCard, num: '02', title: 'Select License', desc: 'Choose the right license type for your organization' },
  { icon: Download, num: '03', title: 'Purchase', desc: 'Secure checkout with instant digital delivery' },
  { icon: BarChart3, num: '04', title: 'Access Insights', desc: 'Download your report and start making data-driven decisions' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-sm text-[#00B4D8] uppercase tracking-widest font-medium mb-3">Process</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit]">How It Works</h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#00B4D8]/20 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                data-testid={`step-${step.num}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10 w-20 h-20 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-6 group hover:border-[#00B4D8]/40 transition-all">
                  <step.icon className="w-8 h-8 text-[#00B4D8]" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#F59E0B] text-black text-xs font-bold flex items-center justify-center">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-[Outfit]">{step.title}</h3>
                <p className="text-sm text-slate-400 max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
