import { useState, useEffect } from 'react';
import { BarChart3, FileText, Mail, MessageSquare, Microscope, Download, CreditCard, DollarSign } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/admin/stats`);
        setStats(res.data);
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { icon: FileText, label: 'Total Reports', value: stats?.reports || 0, color: '#00B4D8' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${(stats?.total_revenue || 0).toLocaleString()}`, color: '#F59E0B' },
    { icon: CreditCard, label: 'Paid Orders', value: stats?.paid_transactions || 0, color: '#10B981' },
    { icon: BarChart3, label: 'All Transactions', value: stats?.total_transactions || 0, color: '#3B82F6' },
    { icon: Mail, label: 'Newsletter Subs', value: stats?.newsletter_subscribers || 0, color: '#8B5CF6' },
    { icon: Microscope, label: 'Research Requests', value: stats?.research_requests || 0, color: '#EC4899' },
    { icon: MessageSquare, label: 'Contact Messages', value: stats?.contact_requests || 0, color: '#F97316' },
    { icon: Download, label: 'Sample Downloads', value: stats?.sample_downloads || 0, color: '#06B6D4' },
  ];

  return (
    <div data-testid="admin-dashboard">
      <h2 className="text-2xl font-bold text-white font-[Outfit] mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-[Outfit]">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
