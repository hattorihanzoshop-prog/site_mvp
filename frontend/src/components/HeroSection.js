import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ParticleCanvas from './ParticleCanvas';

export default function HeroSection({ onExplore, onCustomResearch }) {
  const statsRef = useRef(null);
  const [countersVisible, setCountersVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountersVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <ParticleCanvas />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#172a4f_0%,_#0A1628_60%)]" style={{ zIndex: 1 }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[#00B4D8] mb-8 animate-fadeInUp">
            <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse" />
            Data-Driven Insights for Strategic Decisions
          </div>

          <h1
            data-testid="hero-heading"
            className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-white mb-6 font-[Outfit]"
            style={{ animationDelay: '0.1s' }}
          >
            Unlock Market{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-[#3B82F6]">
              Intelligence
            </span>{' '}
            That Drives Growth
          </h1>

          <p
            data-testid="hero-subtitle"
            className="text-lg md:text-xl leading-relaxed text-slate-300 max-w-2xl mb-10 animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            Comprehensive industry reports and market research trusted by Fortune 500 companies and investment firms worldwide.
          </p>

          <div className="flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <button
              data-testid="hero-explore-btn"
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#00B4D8] text-white font-semibold shadow-[0_0_30px_rgba(0,180,216,0.3)] hover:bg-[#0096B4] hover:shadow-[0_0_40px_rgba(0,180,216,0.4)] transition-all"
            >
              Explore Reports <ChevronRight className="w-5 h-5" />
            </button>
            <button
              data-testid="hero-custom-research-btn"
              onClick={onCustomResearch}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold backdrop-blur-md hover:bg-white/10 transition-all"
            >
              Request Custom Research
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          ref={statsRef}
          data-testid="hero-stats"
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: 500, suffix: '+', label: 'Reports Published' },
            { value: 80, suffix: '+', label: 'Industries Covered' },
            { value: 150, suffix: '+', label: 'Countries Analyzed' },
            { value: 98, suffix: '%', label: 'Client Satisfaction' },
          ].map((stat, i) => (
            <div key={stat.label} className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-white font-[Outfit]">
                {countersVisible ? <AnimatedCounter target={stat.value} suffix={stat.suffix} delay={i * 150} /> : '0' + stat.suffix}
              </div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({ target, suffix, delay }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1500;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, delay]);
  return <>{count}{suffix}</>;
}
