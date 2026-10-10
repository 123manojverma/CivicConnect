'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const CATEGORIES = ['Food', 'Clothes', 'Medicine', 'Water', 'Other'];
const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍽️', Clothes: '👕', Medicine: '💊', Water: '💧', Other: '📦'
};

export default function DonatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'offer' | 'my'>('offer');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Food',
    quantity: '', address: ''
  });
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
  }, [router]);

  useEffect(() => {
    if (tab === 'my' && user) fetchMyDonations();
  }, [tab, user]);

  const fetchMyDonations = async () => {
    setLoadingMy(true);
    try {
      const res = await api.get('/donation/my');
      setMyDonations(res.data.data || []);
    } catch {}
    setLoadingMy(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim()) { setError('Please enter a pickup address.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/donation', {
        ...form,
        donorName: user.name,
        wardId: user.wardId
      });
      setSuccess(true);
      setForm({ title: '', description: '', category: 'Food', quantity: '', address: '' });
      setTimeout(() => { setSuccess(false); setTab('my'); }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post donation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/donation/${id}`);
      setMyDonations(d => d.filter(x => x._id !== id));
    } catch {}
  };

  const statusColor: Record<string, string> = {
    Available: 'var(--success)',
    Claimed: 'var(--orange)',
    Completed: 'var(--text-muted)'
  };
  const statusBg: Record<string, string> = {
    Available: 'rgba(34,197,94,0.1)',
    Claimed: 'rgba(251,146,60,0.1)',
    Completed: 'rgba(100,116,139,0.1)'
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>🤲 Donate Surplus</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Offer leftover food, clothes, or essentials — NGOs will collect and deliver to those in need.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-card)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
          {(['offer', 'my'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-secondary)'
              }}>
              {t === 'offer' ? '➕ New Offer' : '📋 My Offers'}
            </button>
          ))}
        </div>

        {tab === 'offer' && (
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Post a Donation Offer</h3>

            {success && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, fontSize: 14, color: 'var(--success)', textAlign: 'center' }}>
                ✅ Donation posted! NGOs in your area will see it shortly.
              </div>
            )}
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Category Picker */}
              <div className="form-group">
                <label className="form-label">What are you donating? *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <button type="button" key={cat} onClick={() => setForm({ ...form, category: cat })}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 20px', borderRadius: 12, border: `2px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`, background: form.category === cat ? 'var(--accent-glow)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', minWidth: 80 }}>
                      <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[cat]}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: form.category === cat ? 'var(--accent-light)' : 'var(--text-secondary)' }}>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={`e.g. ${form.category === 'Food' ? 'Cooked dal and rice for 10 people' : form.category === 'Clothes' ? 'Winter jackets and sweaters' : 'Surplus items'}`}
                  required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Quantity / Amount *</label>
                  <input type="text" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 5 kg, 10 pieces, 3 bags" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Address *</label>
                  <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Street, locality, landmark" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Any extra details — condition, best time to collect, packaging, etc." rows={3}
                  style={{ resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
                {loading ? <><span className="spinner"></span> Posting...</> : '🤲 Post Donation Offer'}
              </button>
            </form>
          </div>
        )}

        {tab === 'my' && (
          <div>
            {loadingMy ? (
              <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 36, height: 36 }}></span></div>
            ) : myDonations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🤲</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>You haven't posted any donation offers yet.</p>
                <button onClick={() => setTab('offer')} className="btn-primary" style={{ marginTop: 20 }}>Post your first offer</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {myDonations.map(d => (
                  <div key={d._id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {CATEGORY_ICONS[d.category] || '📦'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{d.title}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: statusBg[d.status], color: statusColor[d.status] }}>
                              {d.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            📦 {d.quantity} &nbsp;·&nbsp; 📍 {d.address}
                          </div>
                          {d.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.description}</div>}
                          {d.claimedByName && (
                            <div style={{ fontSize: 12, color: 'var(--orange)', marginTop: 6 }}>
                              🤝 Claimed by <strong>{d.claimedByName}</strong>
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                            Posted {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      {d.status === 'Available' && (
                        <button onClick={() => handleCancel(d._id)}
                          style={{ flexShrink: 0, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
