import { Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="border-t border-white/5 bg-[#060E1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#3B82F6] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-[Outfit]">F</span>
              </div>
              <span className="text-lg font-bold text-white font-[Outfit]">Flow<span className="text-[#00B4D8]">.</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Premium market intelligence and industry reports trusted by Fortune 500 companies worldwide.
            </p>
          </div>

          {/* Reports */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-[Outfit]">Reports</h4>
            <ul className="space-y-2">
              {[
                { label: 'Browse All', action: () => scrollTo('catalog') },
                { label: 'Featured', action: () => scrollTo('featured') },
                { label: 'New Releases', action: () => scrollTo('catalog') },
                { label: 'Bestsellers', action: () => scrollTo('catalog') },
              ].map(item => (
                <li key={item.label}>
                  <button onClick={item.action} className="text-sm text-slate-500 hover:text-[#00B4D8] transition-colors">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-[Outfit]">Industries</h4>
            <ul className="space-y-2">
              {['Technology', 'Healthcare', 'Finance', 'Energy', 'Manufacturing'].map(ind => (
                <li key={ind}>
                  <button onClick={() => scrollTo('industries')} className="text-sm text-slate-500 hover:text-[#00B4D8] transition-colors">{ind}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-[Outfit]">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Our Analysts', 'Methodology', 'Careers'].map(item => (
                <li key={item}>
                  <button onClick={() => scrollTo('why-choose-us')} className="text-sm text-slate-500 hover:text-[#00B4D8] transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 font-[Outfit]">Support</h4>
            <ul className="space-y-2">
              {['Contact Us', 'FAQ', 'Licensing Terms', 'Refund Policy', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <button onClick={() => scrollTo('contact')} className="text-sm text-slate-500 hover:text-[#00B4D8] transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">&copy; 2025 Flow Consulting. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {[Linkedin, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" data-testid={`social-${i}`} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-[#00B4D8] hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="px-2 py-1 rounded bg-white/5">Visa</span>
              <span className="px-2 py-1 rounded bg-white/5">MC</span>
              <span className="px-2 py-1 rounded bg-white/5">PayPal</span>
              <span className="px-2 py-1 rounded bg-white/5">Wire</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
