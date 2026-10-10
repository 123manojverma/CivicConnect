'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const CATEGORIES = ['Food', 'Clothes', 'Medicine', 'Education', 'Shelter', 'Water', 'Sanitation'];

export default function NGOProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ phone: '', organizationName: '', wardId: '', categories: [] as string[], latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'NGO') { router.push('/'); return; }
    setUser(u);
    setForm({
      phone: u.phone || '',
      organizationName: u.organizationName || '',
      wardId: u.wardId || '',
      categories: u.categories || [],
      latitude: u.location?.coordinates?.[1]?.toString() || '',
      longitude: u.location?.coordinates?.[0]?.toString() || ''
    });
  }, [router]);

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat]
    }));
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
      setLocating(false);
    }, () => setLocating(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { phone: form.phone, organizationName: form.organizationName, wardId: form.wardId, categories: form.categories };
      if (form.latitude && form.longitude) {
        payload.location = { type: 'Point', coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)] };
      }
      const res = await api.put('/auth/profile', payload);
      const updated = { ...user, ...payload };
      localStorage.setItem('cc_user', JSON.stringify(updated));
      setUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setLoading(false);
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="NGO" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>NGO Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Update your organization details so citizens can find and contact you.</p>

        {success && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: 'var(--success)' }}>
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>📋 Organization Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input type="text" value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} placeholder="Your NGO Name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ward ID</label>
                  <input type="text" value={form.wardId} onChange={e => setForm({ ...form, wardId: e.target.value })} placeholder="WARD-XXX-000" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>🎁 Services Offered</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Select what your NGO provides — citizens will filter NGOs by these categories.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button type="button" key={cat} onClick={() => toggleCategory(cat)}
                  style={{ padding: '9px 18px', borderRadius: 999, fontSize: 13, border: `1px solid ${form.categories.includes(cat) ? 'var(--purple)' : 'var(--border)'}`, background: form.categories.includes(cat) ? 'rgba(168,85,247,0.15)' : 'transparent', color: form.categories.includes(cat) ? 'var(--purple)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: form.categories.includes(cat) ? 600 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>📍 Location</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Set your NGO location so it appears on the citizen map.</p>
            <button type="button" onClick={getLocation} disabled={locating} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              {locating ? <><span className="spinner"></span> Getting location...</> : '📍 Update My Location'}
            </button>
            {form.latitude && (
              <p style={{ fontSize: 13, color: 'var(--success)', textAlign: 'center' }}>✅ Location set: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, background: 'var(--purple)' }}>
            {loading ? <><span className="spinner"></span> Saving...</> : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
