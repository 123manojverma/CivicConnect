'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍽️', Clothes: '👕', Medicine: '💊', Water: '💧', Other: '📦'
};

export default function NGODonationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWard, setFilterWard] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'NGO') { router.push('/'); return; }
    setUser(u);
    fetchDonations(u, false);
  }, [router]);

  const fetchDonations = async (u: any, byWard: boolean) => {
    setLoading(true);
    try {
      const params = byWard && u.wardId ? `?wardId=${u.wardId}` : '';
      const res = await api.get(`/donation/available${params}`);
      setDonations(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  const handleFilterToggle = () => {
    const next = !filterWard;
    setFilterWard(next);
    fetchDonations(user, next);
  };

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await api.patch(`/donation/${id}/claim`, { ngoName: user.organizationName || user.name });
      setDonations(prev => prev.filter(d => d._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not claim donation.');
    }
    setClaimingId(null);
  };

  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/donation/${id}/complete`);
      setDonations(prev => prev.map(d => d._id === id ? { ...d, status: 'Completed' } : d));
    } catch {}
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="NGO" userName={user.organizationName || user.name} />
      <div className="main-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>🤲 Available Donations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Citizens are offering surplus food, clothes and more. Claim and deliver to those in need.</p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={handleFilterToggle}
            style={{ padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1px solid ${filterWard ? 'var(--accent)' : 'var(--border)'}`, background: filterWard ? 'var(--accent-glow)' : 'transparent', color: filterWard ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
            {filterWard ? '📍 My Ward Only' : '🌐 All Areas'}
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {donations.length} donation{donations.length !== 1 ? 's' : ''} available
          </span>
          <button onClick={() => fetchDonations(user, filterWard)}
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>
        ) : donations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No donations available right now. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {donations.map(d => (
              <div key={d._id} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {CATEGORY_ICONS[d.category] || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {d.donorName}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', color: 'var(--success)', flexShrink: 0 }}>
                    Available
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.description}</p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12 }}>
                    <span style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)' }}>
                      📦 {d.quantity}
                    </span>
                    <span style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)' }}>
                      🏷️ {d.category}
                    </span>
                    <span style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)' }}>
                      📍 {d.address}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Posted {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {d.wardId && <> &nbsp;·&nbsp; Ward: {d.wardId}</>}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => handleClaim(d._id)}
                  disabled={claimingId === d._id}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 14 }}>
                  {claimingId === d._id
                    ? <><span className="spinner"></span> Claiming...</>
                    : '✅ Claim This Donation'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
