import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const INDUSTRIES = [
  'Technology & IT', 'Healthcare & Pharmaceuticals', 'Financial Services & Banking',
  'Energy & Utilities', 'Manufacturing & Industrial', 'Retail & E-Commerce',
  'Automotive & Transportation', 'Telecommunications', 'Real Estate & Construction',
  'Food & Agriculture', 'Aerospace & Defense', 'Media & Entertainment',
];

const CATEGORIES = ['Market Analysis', 'Industry Forecast', 'Competitive Landscape', 'Company Profiles', 'Regional Report'];

const emptyReport = {
  title: '', industry: '', category: '', description: '', detailed_description: '',
  pages: 0, figures: 0, tables: 0, companies_profiled: 0, regions_covered: 0,
  publish_date: '', report_id: '', price_single: 0, price_multi: 0, price_enterprise: 0,
  key_findings: [''], table_of_contents: [{ chapter: '1', title: '', pages: '' }],
  methodology: '', cover_image: '', featured: false, keywords: [''],
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, 'new' = create, report object = edit
  const [form, setForm] = useState({ ...emptyReport });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports?page=${page}&limit=10`);
      setReports(res.data.reports || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const startCreate = () => {
    setForm({ ...emptyReport, key_findings: [''], table_of_contents: [{ chapter: '1', title: '', pages: '' }], keywords: [''] });
    setEditing('new');
  };

  const startEdit = (report) => {
    setForm({
      ...report,
      key_findings: report.key_findings?.length ? report.key_findings : [''],
      table_of_contents: report.table_of_contents?.length ? report.table_of_contents : [{ chapter: '1', title: '', pages: '' }],
      keywords: report.keywords?.length ? report.keywords : [''],
    });
    setEditing(report);
  };

  const handleSave = async () => {
    if (!form.title || !form.industry || !form.category) {
      toast.error('Title, Industry, and Category are required');
      return;
    }

    const payload = {
      ...form,
      key_findings: form.key_findings.filter(f => f.trim()),
      table_of_contents: form.table_of_contents.filter(t => t.title.trim()),
      keywords: form.keywords.filter(k => k.trim()),
      price_single: parseFloat(form.price_single) || 0,
      price_multi: parseFloat(form.price_multi) || 0,
      price_enterprise: parseFloat(form.price_enterprise) || 0,
      pages: parseInt(form.pages) || 0,
      figures: parseInt(form.figures) || 0,
      tables: parseInt(form.tables) || 0,
      companies_profiled: parseInt(form.companies_profiled) || 0,
      regions_covered: parseInt(form.regions_covered) || 0,
    };
    // Remove id field for create
    delete payload.id;

    try {
      if (editing === 'new') {
        await axios.post(`${API}/admin/reports`, payload);
        toast.success('Report created successfully');
      } else {
        await axios.put(`${API}/admin/reports/${editing.id}`, payload);
        toast.success('Report updated successfully');
      }
      setEditing(null);
      fetchReports();
    } catch (e) {
      toast.error('Failed to save report');
      console.error(e);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`${API}/admin/reports/${reportId}`);
      toast.success('Report deleted');
      fetchReports();
    } catch {
      toast.error('Failed to delete report');
    }
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateListItem = (field, index, value) => {
    setForm(prev => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field, defaultValue) => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
  };

  const removeListItem = (field, index) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const totalPages = Math.ceil(total / 10);

  // ─── Edit/Create Form ───
  if (editing !== null) {
    return (
      <div data-testid="admin-report-form">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-[Outfit]">
            {editing === 'new' ? 'Create Report' : 'Edit Report'}
          </h2>
          <button onClick={() => setEditing(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Basic Info */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Title *</label>
                <input data-testid="report-title-input" value={form.title} onChange={e => updateField('title', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Industry *</label>
                <select value={form.industry} onChange={e => updateField('industry', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none">
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Category *</label>
                <select value={form.category} onChange={e => updateField('category', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:border-[#00B4D8] outline-none">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Short Description</label>
                <textarea rows={2} value={form.description} onChange={e => updateField('description', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Detailed Description</label>
                <textarea rows={5} value={form.detailed_description} onChange={e => updateField('detailed_description', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none resize-none" placeholder="Separate paragraphs with line breaks" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider">Pricing (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Single User License</label>
                <input type="number" step="0.01" value={form.price_single} onChange={e => updateField('price_single', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Multi User License</label>
                <input type="number" step="0.01" value={form.price_multi} onChange={e => updateField('price_multi', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Enterprise License</label>
                <input type="number" step="0.01" value={form.price_enterprise} onChange={e => updateField('price_enterprise', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'pages', label: 'Pages' },
                { key: 'figures', label: 'Figures' },
                { key: 'tables', label: 'Tables' },
                { key: 'companies_profiled', label: 'Companies' },
                { key: 'regions_covered', label: 'Regions' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => updateField(f.key, e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Publish Date</label>
                <input type="date" value={form.publish_date} onChange={e => updateField('publish_date', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Report ID</label>
                <input value={form.report_id} onChange={e => updateField('report_id', e.target.value)} placeholder="Auto-generated if empty" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Cover Image URL</label>
                <input value={form.cover_image} onChange={e => updateField('cover_image', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => updateField('featured', e.target.checked)} className="rounded border-white/20 bg-white/5" />
                <span className="text-sm text-slate-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#F59E0B]" /> Featured Report</span>
              </label>
            </div>
          </div>

          {/* Key Findings */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Key Findings</h3>
              <button onClick={() => addListItem('key_findings', '')} className="text-xs text-[#00B4D8] hover:underline">+ Add Finding</button>
            </div>
            {form.key_findings.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input value={f} onChange={e => updateListItem('key_findings', i, e.target.value)} placeholder={`Finding ${i + 1}`} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
                {form.key_findings.length > 1 && (
                  <button onClick={() => removeListItem('key_findings', i)} className="p-2 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>

          {/* Table of Contents */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Table of Contents</h3>
              <button onClick={() => addListItem('table_of_contents', { chapter: String(form.table_of_contents.length + 1), title: '', pages: '' })} className="text-xs text-[#00B4D8] hover:underline">+ Add Chapter</button>
            </div>
            {form.table_of_contents.map((ch, i) => (
              <div key={i} className="flex gap-2">
                <input value={ch.chapter} onChange={e => updateListItem('table_of_contents', i, { ...ch, chapter: e.target.value })} placeholder="Ch #" className="w-16 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm text-center focus:border-[#00B4D8] outline-none" />
                <input value={ch.title} onChange={e => updateListItem('table_of_contents', i, { ...ch, title: e.target.value })} placeholder="Chapter Title" className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
                <input value={ch.pages} onChange={e => updateListItem('table_of_contents', i, { ...ch, pages: e.target.value })} placeholder="Pages" className="w-24 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none" />
                {form.table_of_contents.length > 1 && (
                  <button onClick={() => removeListItem('table_of_contents', i)} className="p-2 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>

          {/* Methodology */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Methodology</h3>
            <textarea rows={3} value={form.methodology} onChange={e => updateField('methodology', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#00B4D8] outline-none resize-none" />
          </div>

          {/* Keywords */}
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00B4D8] uppercase tracking-wider">Keywords</h3>
              <button onClick={() => addListItem('keywords', '')} className="text-xs text-[#00B4D8] hover:underline">+ Add Keyword</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.keywords.map((k, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input value={k} onChange={e => updateListItem('keywords', i, e.target.value)} placeholder="keyword" className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-[#00B4D8] outline-none" />
                  {form.keywords.length > 1 && (
                    <button onClick={() => removeListItem('keywords', i)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button
              data-testid="save-report-btn"
              onClick={handleSave}
              className="px-8 py-3 rounded-full bg-[#00B4D8] text-white font-semibold text-sm hover:bg-[#0096B4] transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {editing === 'new' ? 'Create Report' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(null)} className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Report List ───
  return (
    <div data-testid="admin-reports-list">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-[Outfit]">Reports</h2>
          <p className="text-sm text-slate-500">{total} total reports</p>
        </div>
        <button
          data-testid="create-report-btn"
          onClick={startCreate}
          className="px-5 py-2.5 rounded-full bg-[#00B4D8] text-white text-sm font-semibold hover:bg-[#0096B4] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Report</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Industry</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Category</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Price</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-500 font-medium">Featured</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} data-testid={`admin-report-row-${report.id}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {report.cover_image && (
                          <img src={report.cover_image} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-[300px]">{report.title}</p>
                          <p className="text-[10px] text-slate-500">{report.report_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{report.industry}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{report.category}</td>
                    <td className="px-4 py-3 text-sm text-[#F59E0B] font-mono text-right">${report.price_single?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {report.featured && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] mx-auto" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          data-testid={`edit-report-${report.id}`}
                          onClick={() => startEdit(report)}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#00B4D8] hover:bg-white/5 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          data-testid={`delete-report-${report.id}`}
                          onClick={() => handleDelete(report.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
