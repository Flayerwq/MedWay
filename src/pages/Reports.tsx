import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, Trash2, Loader2, Eye } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !user) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('medical-reports').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('medical-reports').getPublicUrl(path);

      await supabase.from('reports').insert({
        user_id: user.id,
        title: title.trim(),
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
      });

      setTitle('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await fetchReports();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteReport = async (report: Report) => {
    const path = report.file_url.split('/medical-reports/')[1];
    if (path) await supabase.storage.from('medical-reports').remove([path]);
    await supabase.from('reports').delete().eq('id', report.id);
    setReports((prev) => prev.filter((r) => r.id !== report.id));
  };

  return (
    <div className="app-page page-fade max-w-5xl">
      <section className="app-card-muted p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Reports</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Medical Reports</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Upload and manage your medical documents in one consistent workspace.</p>
      </section>

      <form onSubmit={upload} className="app-card mt-8 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-xl border border-[#1f5d4f] bg-primary/10 p-2">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          Upload Report
        </h2>
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Report Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blood Test Results" required />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">File (PDF / Image)</Label>
            <Input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>
        </div>
        <Button type="submit" variant="default" disabled={uploading}>
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload</>}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : reports.length === 0 ? (
        <div className="app-card mt-8 py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="app-card flex items-center gap-4 p-4 transition-colors hover:bg-[#232323]">
              <div className="rounded-2xl border border-[#1f5d4f] bg-primary/10 p-2.5">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.file_name} | {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                  <a href={r.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                  <a href={r.file_url} download><Download className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary" onClick={() => deleteReport(r)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

