import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem('fc_admin', 'true');
      onLogin();
    } catch {
      toast.error('Invalid password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B4D8] to-[#3B82F6] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-[Outfit]">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Flow Consulting Management</p>
        </div>

        <form
          data-testid="admin-login-form"
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 border border-white/10 space-y-4"
        >
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Password</label>
            <input
              data-testid="admin-password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm"
              autoFocus
            />
          </div>
          <button
            data-testid="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#00B4D8] text-white font-semibold text-sm hover:bg-[#0096B4] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          <a href="/" className="hover:text-[#00B4D8] transition-colors">Back to website</a>
        </p>
      </div>
    </div>
  );
}
