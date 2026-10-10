'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('cc_user');
    if (u) {
      try {
        const user = JSON.parse(u);
        redirectByRole(user.role);
      } catch {}
    }
  }, []);

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
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      localStorage.setItem('cc_user', JSON.stringify(user));
      localStorage.setItem('cc_token', token);
      redirectByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
      
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌆</div>
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk' }}>CivicConnect</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Sign in to your account to continue</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
