import { useState, useEffect } from 'react';
import { CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminTransactions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/admin/transactions?page=${page}&limit=20`);
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [page]);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const statusColors = {
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    initiated: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    pending: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    expired: 'bg-red-500/10 text-red-400 border-red-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div data-testid="admin-transactions">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-[Outfit]">Transactions</h2>
          <p className="text-sm text-slate-500">{total} total transactions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-12 text-center">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No transactions yet</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Session ID</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Amount</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Items</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((tx, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]">{tx.session_id}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-[#F59E0B] font-mono font-bold">${tx.amount?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 ml-1 uppercase">{tx.currency}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusColors[tx.payment_status] || statusColors.pending}`}>
                        {tx.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        {tx.items?.map((item, j) => (
                          <p key={j} className="text-[10px] text-slate-400 truncate">{item.title} ({item.license_type})</p>
                        ))}
                        {!tx.items && <p className="text-[10px] text-slate-500">-</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{tx.updated_at ? new Date(tx.updated_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
