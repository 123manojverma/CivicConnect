'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const CATEGORIES = ['Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Drainage', 'Lighting', 'Other'];

export default function ReportIssuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Road',
    latitude: '', longitude: '', wardId: '',
    images: [] as string[]
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
    setForm(f => ({ ...f, wardId: u.wardId || '' }));
  }, [router]);

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
        setLocationLoading(false);
      },
      () => setLocationLoading(false)
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
    const urls = selected.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const res = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.urls;
    } catch {
      throw new Error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateAIDescription = async () => {
    if (!form.title || !form.category) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-description', {
        title: form.title, category: form.category, location: `Ward ${form.wardId}`
      });
      setForm(f => ({ ...f, description: res.data.description }));
    } catch {}
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) { setError('Please capture your location first.'); return; }
    setLoading(true);
    setError('');
    try {
      const imageUrls = await uploadImages();
      await api.post('/issue/create', {
        title: form.title,
        description: form.description,
        category: form.category,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        wardId: form.wardId,
        userId: user.id,
        images: imageUrls
      });
      setSuccess(true);
      setTimeout(() => router.push('/citizen/issues'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(msg === 'A similar issue already exists nearby.' ? '⚠️ A similar issue is already reported nearby. Try upvoting it instead!' : msg || 'Failed to submit issue.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  if (success) {
    return (
      <div className="page">
        <Sidebar role="Citizen" userName={user.name} />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>✅</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Issue Reported!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your issue has been submitted to the authorities. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Report a Civic Issue</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Help make your community better by reporting problems to the authorities.</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📋 Issue Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Issue Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Large pothole near bus stop on MG Road" required />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <button type="button" key={cat} onClick={() => setForm({ ...form, category: cat })}
                      style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, border: `1px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`, background: form.category === cat ? 'var(--accent-glow)' : 'transparent', color: form.category === cat ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label">Description</label>
                  <button type="button" onClick={generateAIDescription} disabled={aiLoading || !form.title}
                    style={{ fontSize: 12, color: 'var(--accent-light)', background: 'var(--accent-glow)', border: '1px solid var(--border-active)', borderRadius: 8, padding: '4px 12px', cursor: form.title ? 'pointer' : 'not-allowed', opacity: form.title ? 1 : 0.5 }}>
                    {aiLoading ? '⏳ Generating...' : '✨ AI Generate'}
                  </button>
                </div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." rows={4} style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Ward ID *</label>
                <input type="text" value={form.wardId} onChange={e => setForm({ ...form, wardId: e.target.value })} placeholder="e.g. WARD-MUM-042" required />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📍 Location</h3>
            <button type="button" onClick={getLocation} disabled={locationLoading} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              {locationLoading ? <><span className="spinner"></span> Getting location...</> : '📍 Capture My Location'}
            </button>
            {form.latitude && (
              <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--success)', textAlign: 'center' }}>
                ✅ Location captured: {parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📸 Photos (optional, up to 5)</h3>
            <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Click to upload photos</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG up to 10MB each</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border)' }} />
                    <button type="button" onClick={() => { const f = [...files]; f.splice(i, 1); setFiles(f); const p2 = [...previews]; p2.splice(i, 1); setPreviews(p2); }}
                      style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16 }}>
            {loading || uploading ? <><span className="spinner"></span> {uploading ? 'Uploading images...' : 'Submitting...'}</> : '🚀 Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}
