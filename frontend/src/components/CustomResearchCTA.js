import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const INDUSTRIES_LIST = [
  'Technology & IT', 'Healthcare & Pharmaceuticals', 'Financial Services & Banking',
  'Energy & Utilities', 'Manufacturing & Industrial', 'Retail & E-Commerce',
  'Automotive & Transportation', 'Telecommunications', 'Real Estate & Construction',
  'Food & Agriculture', 'Aerospace & Defense', 'Media & Entertainment', 'Other'
];

const BUDGETS = ['Under $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000+'];

export default function CustomResearchCTA() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', industry: '', description: '', budget: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.industry || !form.description || !form.budget) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/custom-research`, form);
      toast.success('Research request submitted! Our team will contact you within 24 hours.');
      setForm({ name: '', email: '', company: '', phone: '', industry: '', description: '', budget: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section id="custom-research" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#172a4f_0%,_#0A1628_60%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm text-[#F59E0B] uppercase tracking-widest font-medium mb-3">Custom Research</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-[Outfit] mb-6">Need a Custom Report?</h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Our research team can build tailored market intelligence for your specific business needs. From market entry strategies to competitive analysis — we've got you covered.
            </p>
            <div className="space-y-3">
              {['Market entry & expansion strategies', 'Competitive landscape deep-dives', 'Technology assessment & due diligence', 'Custom data collection & analysis'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            data-testid="custom-research-form"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-8 border border-white/10 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input data-testid="cr-name" type="text" placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm" />
              <input data-testid="cr-email" type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input data-testid="cr-company" type="text" placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm" />
              <input data-testid="cr-phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm" />
            </div>
            <select data-testid="cr-industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none appearance-none cursor-pointer">
              <option value="">Industry of Interest *</option>
              {INDUSTRIES_LIST.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
            <textarea data-testid="cr-description" rows={4} placeholder="Research Topic / Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm resize-none" />
            <select data-testid="cr-budget" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none appearance-none cursor-pointer">
              <option value="">Budget Range *</option>
              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button data-testid="cr-submit" type="submit" disabled={loading} className="w-full py-3.5 rounded-full bg-[#F59E0B] text-black font-bold text-sm hover:bg-[#D97706] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Request Custom Research'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
