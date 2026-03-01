import { useState } from 'react';
import { LayoutDashboard, FileText, Inbox, CreditCard, LogOut, ChevronLeft, ExternalLink } from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminReports from './AdminReports';
import AdminSubmissions from './AdminSubmissions';
import AdminTransactions from './AdminTransactions';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'submissions', label: 'Submissions', icon: Inbox },
  { key: 'transactions', label: 'Transactions', icon: CreditCard },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('fc_admin') === 'true');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('fc_admin');
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} flex-shrink-0 border-r border-white/5 bg-[#060E1A] flex flex-col transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#3B82F6] flex items-center justify-center">
                <span className="text-white font-bold text-xs font-[Outfit]">F</span>
              </div>
              <span className="text-sm font-bold text-white font-[Outfit]">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              data-testid={`admin-nav-${item.key}`}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.key
                  ? 'bg-[#00B4D8]/10 text-[#00B4D8]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/5 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>View Site</span>}
          </a>
          <button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'submissions' && <AdminSubmissions />}
          {activeTab === 'transactions' && <AdminTransactions />}
        </div>
      </main>
    </div>
  );
}
