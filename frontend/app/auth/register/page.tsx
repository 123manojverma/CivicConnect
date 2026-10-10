'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

const CATEGORIES = ['Food', 'Clothes', 'Medicine', 'Education', 'Shelter', 'Water', 'Sanitation'];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get('role') as any) || 'Citizen';

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: defaultRole,
    wardId: '', organizationName: '', phone: '',
    latitude: '', longitude: '', categories: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    const u = localStorage.getItem('cc_user');
    if (u) {
      try {
        const user = JSON.parse(u);
        if (user.role === 'Citizen') router.push('/citizen');
        else if (user.role === 'Government') router.push('/government');
        else if (user.role === 'NGO') router.push('/ngo');
      } catch {}
    }
  }, [router]);

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat]
    }));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
      });
    }
  };

  const redirectByRole = (role: string) => {
    if (role === 'Citizen') router.push('/citizen');
    else if (role === 'Government') router.push('/government');
    else if (role === 'NGO') router.push('/ngo');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        name: form.name, email: form.email, password: form.password,
        role: form.role, wardId: form.wardId, phone: form.phone
      };
      if (form.role === 'NGO') {
        payload.organizationName = form.organizationName;
        payload.categories = form.categories;
        if (form.latitude && form.longitude) {
          payload.latitude = parseFloat(form.latitude);
          payload.longitude = parseFloat(form.longitude);
        }
      }
      const res = await api.post('/auth/register', payload);
      const { user, token } = res.data.data;
      localStorage.setItem('cc_user', JSON.stringify(user));
      localStorage.setItem('cc_token', token);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'Citizen', icon: '👤', label: 'Citizen', desc: 'Report issues & find help' },
    { value: 'NGO', icon: '🤝', label: 'NGO', desc: 'Provide aid & resources' },
    { value: 'Government', icon: '🏛️', label: 'Government', desc: 'Manage & resolve issues' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <div style={{ position: 'fixed', top: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌆</div>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk' }}>CivicConnect</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Join the civic revolution</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {roles.map(r => (
                <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value as any })}
                  style={{ padding: '16px 8px', borderRadius: 12, border: `2px solid ${form.role === r.value ? 'var(--accent)' : 'var(--border)'}`, background: form.role === r.value ? 'var(--accent-glow)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.role === r.value ? 'var(--accent-light)' : 'var(--text-secondary)' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" minLength={6} required />
            </div>
            <div className="form-group">
              <label className="form-label">Ward ID / Area Code</label>
              <input type="text" value={form.wardId} onChange={e => setForm({ ...form, wardId: e.target.value })} placeholder="e.g. WARD-MUM-042" />
            </div>

            {form.role === 'NGO' && (
              <>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input type="text" value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} placeholder="NGO Name" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: 10 }}>Services Offered</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORIES.map(cat => (
                      <button type="button" key={cat} onClick={() => toggleCategory(cat)}
                        style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, border: `1px solid ${form.categories.includes(cat) ? 'var(--accent)' : 'var(--border)'}`, background: form.categories.includes(cat) ? 'var(--accent-glow)' : 'transparent', color: form.categories.includes(cat) ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={getLocation} className="btn-secondary" style={{ justifyContent: 'center' }}>
                  📍 Use My Location
                </button>
                {form.latitude && <p style={{ fontSize: 12, color: 'var(--success)', textAlign: 'center' }}>📍 Location captured: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</p>}
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? <><span className="spinner"></span> Creating account...</> : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner"></span></div>}>
      <RegisterForm />
    </Suspense>
  );
}
