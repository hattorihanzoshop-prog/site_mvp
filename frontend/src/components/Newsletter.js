import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/newsletter`, { email });
      if (res.data.status === 'existing') {
        toast.info('You are already subscribed!');
      } else {
        toast.success('Successfully subscribed! Welcome aboard.');
      }
      setEmail('');
    } catch {
      toast.error('Subscription failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section id="newsletter" className="py-24 md:py-32 relative bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="w-14 h-14 rounded-2xl bg-[#00B4D8]/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-[#00B4D8]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-[Outfit] mb-4">
            Stay Ahead of the Market
          </h2>
          <p className="text-base text-slate-400 mb-8 max-w-xl mx-auto">
            Get free monthly industry insights and report previews delivered to your inbox
          </p>

          <form data-testid="newsletter-form" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              data-testid="newsletter-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-slate-500 focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] outline-none text-sm"
            />
            <button
              data-testid="newsletter-submit"
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-full bg-[#00B4D8] text-white font-semibold text-sm hover:bg-[#0096B4] transition-all shadow-[0_0_20px_rgba(0,180,216,0.2)] disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="text-xs text-slate-600 mt-4">We respect your privacy. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
}
