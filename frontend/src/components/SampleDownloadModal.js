import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Download, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SampleDownloadModal({ report, open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/sample-download`, { email, report_id: report.id });
      // Trigger download
      const link = document.createElement('a');
      link.href = `${API}/sample-download/${report.id}/pdf`;
      link.download = `FlowConsulting_Sample_${report.report_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Sample PDF is downloading!');
      onClose();
      setEmail('');
    } catch {
      toast.error('Download failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0F1D32] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-[Outfit] flex items-center gap-2">
            <Download className="w-5 h-5 text-[#00B4D8]" />
            Download Sample Report
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm text-slate-400 mb-2">Report:</p>
          <p className="text-sm font-medium text-white mb-4">{report.title}</p>
          <p className="text-sm text-slate-400 mb-4">
            Enter your email to receive a free preview containing the table of contents, executive summary, and key findings.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                data-testid="sample-email-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-[#00B4D8] outline-none text-sm"
              />
            </div>
            <button
              data-testid="download-sample-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#00B4D8] text-white font-semibold text-sm hover:bg-[#0096B4] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Preparing...' : 'Download Sample PDF'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
