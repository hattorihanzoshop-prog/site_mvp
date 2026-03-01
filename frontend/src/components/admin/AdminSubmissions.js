import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Microscope, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { key: 'newsletter', label: 'Newsletter', icon: Mail },
  { key: 'contact', label: 'Contact', icon: MessageSquare },
  { key: 'research', label: 'Research Requests', icon: Microscope },
  { key: 'downloads', label: 'Sample Downloads', icon: Download },
];

export default function AdminSubmissions() {
  const [tab, setTab] = useState('newsletter');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/admin/submissions?submission_type=${tab}&page=${page}&limit=20`);
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [tab, page]);

  const currentData = data?.[tab];
  const items = currentData?.items || [];
  const total = currentData?.total || 0;

  return (
    <div data-testid="admin-submissions">
      <h2 className="text-2xl font-bold text-white font-[Outfit] mb-6">Submissions</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button
            key={t.key}
            data-testid={`tab-${t.key}`}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.key ? 'bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-slate-500">No {tab} submissions yet</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            {tab === 'newsletter' && <NewsletterTable items={items} />}
            {tab === 'contact' && <ContactTable items={items} />}
            {tab === 'research' && <ResearchTable items={items} />}
            {tab === 'downloads' && <DownloadsTable items={items} />}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-xs text-slate-500">{total} total entries</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={items.length < 20} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsletterTable({ items }) {
  return (
    <table className="w-full">
      <thead><tr className="border-b border-white/10">
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Subscribed At</th>
      </tr></thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            <td className="px-4 py-3 text-sm text-white">{item.email}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{item.subscribed_at ? new Date(item.subscribed_at).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ContactTable({ items }) {
  return (
    <table className="w-full">
      <thead><tr className="border-b border-white/10">
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Name</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Subject</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Message</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Date</th>
      </tr></thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            <td className="px-4 py-3 text-sm text-white">{item.name}</td>
            <td className="px-4 py-3 text-xs text-slate-300">{item.email}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{item.subject}</td>
            <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{item.message}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResearchTable({ items }) {
  return (
    <table className="w-full">
      <thead><tr className="border-b border-white/10">
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Name</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Company</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Industry</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Budget</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Description</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Date</th>
      </tr></thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            <td className="px-4 py-3">
              <p className="text-sm text-white">{item.name}</p>
              <p className="text-[10px] text-slate-500">{item.email}</p>
            </td>
            <td className="px-4 py-3 text-xs text-slate-300">{item.company}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{item.industry}</td>
            <td className="px-4 py-3 text-xs text-[#F59E0B]">{item.budget}</td>
            <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{item.description}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DownloadsTable({ items }) {
  return (
    <table className="w-full">
      <thead><tr className="border-b border-white/10">
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Email</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Report ID</th>
        <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Downloaded At</th>
      </tr></thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
            <td className="px-4 py-3 text-sm text-white">{item.email}</td>
            <td className="px-4 py-3 text-xs text-[#00B4D8]">{item.report_id}</td>
            <td className="px-4 py-3 text-xs text-slate-400">{item.downloaded_at ? new Date(item.downloaded_at).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
