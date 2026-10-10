'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { api } from '../lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false, loading: () => <div style={{ height: 300, background: 'var(--bg-card)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div> });

export default function NGODashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ngoIssues, setNgoIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'NGO') { router.push('/'); return; }
    setUser(u);
    fetchData(u);
  }, [router]);

  const fetchData = async (u: any) => {
    try {
      const [issuesRes, notifRes] = await Promise.all([
        api.get(`/issue/ngo/${u.id}`),
        api.get('/notification/unread-count')
      ]);
      setNgoIssues(issuesRes.data.data || []);
      setNotifCount(notifRes.data.count || 0);
    } catch {}
    setLoading(false);
  };

  const donationCategories: Record<string, string> = { Food: '🍽️', Clothes: '👕', Medicine: '💊', Education: '📚', Shelter: '🏠', Water: '💧', Sanitation: '🚽' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  const ngoLocation = user.location?.coordinates ? [user.location.coordinates[1], user.location.coordinates[0]] as [number, number] : null;

  return (
    <div className="page">
      <Sidebar role="NGO" userName={user.name} notifCount={notifCount} />
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🤝</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{user.organizationName || user.name}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {(user.categories || []).map((c: string) => (
                  <span key={c} style={{ fontSize: 12, background: 'rgba(168,85,247,0.1)', color: 'var(--purple)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 999, padding: '2px 10px' }}>
                    {donationCategories[c] || ''} {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '📦', label: 'Aid Requests', value: ngoIssues.length, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
            { icon: '✅', label: 'Completed', value: ngoIssues.filter(i => i.status === 'Resolved').length, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { icon: '⏳', label: 'Pending', value: ngoIssues.filter(i => i.status !== 'Resolved').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>📦 Aid Requests Tagged to You</h2>
              <Link href="/ngo/requests" style={{ fontSize: 13, color: 'var(--accent-light)' }}>View all →</Link>
            </div>
            {ngoIssues.slice(0, 5).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No requests yet. Citizens will tag your NGO when they need help.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ngoIssues.slice(0, 5).map(issue => (
                  <div key={issue._id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.category} · {issue.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📍 Your Location on Map</h2>
            {ngoLocation ? (
              <div className="map-container">
                <MapComponent userLocation={ngoLocation} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
                <p style={{ marginBottom: 16 }}>No location set. Update your profile to appear on the citizen map.</p>
                <Link href="/ngo/profile" className="btn-secondary" style={{ display: 'inline-flex' }}>Update Profile</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
