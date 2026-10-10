'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { api } from '../lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false, loading: () => <div style={{ height: 400, background: 'var(--bg-card)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div> });

export default function GovernmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [stats, setStats] = useState({ submitted: 0, inProgress: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Government') { router.push('/'); return; }
    setUser(u);
    fetchData(u);
  }, [router]);

  const fetchData = async (u: any) => {
    try {
      const [issuesRes, notifRes] = await Promise.all([
        api.get(`/issue/ward/${u.wardId}`),
        api.get('/notification/unread-count')
      ]);
      const data = issuesRes.data.issue || [];
      setIssues(data);
      setStats({
        total: data.length,
        submitted: data.filter((i: any) => i.status === 'Submitted').length,
        inProgress: data.filter((i: any) => i.status === 'In Progress').length,
        resolved: data.filter((i: any) => i.status === 'Resolved').length
      });
      setNotifCount(notifRes.data.count || 0);
    } catch {}
    setLoading(false);
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Government" userName={user.name} notifCount={notifCount} />
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏛️</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700 }}>Government Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Ward: <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{user.wardId || 'All Wards'}</span></p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '📋', label: 'Total Issues', value: stats.total, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
            { icon: '📤', label: 'Needs Attention', value: stats.submitted, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
            { icon: '⚙️', label: 'In Progress', value: stats.inProgress, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: '✅', label: 'Resolved', value: stats.resolved, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🗺️ Issues Map</h2>
            <div className="map-container">
              <MapComponent issues={issues.filter((i: any) => i.location?.coordinates)} />
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>⚠️ Urgent Issues</h2>
              <Link href="/government/issues" style={{ fontSize: 13, color: 'var(--accent-light)' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {issues.filter((i: any) => i.status === 'Submitted').slice(0, 5).map((issue: any) => (
                <Link key={issue._id} href={`/government/issues/${issue._id}`} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', alignItems: 'center', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-active)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🚨</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>▲ {issue.upvotes} upvotes · {issue.category}</div>
                  </div>
                </Link>
              ))}
              {issues.filter((i: any) => i.status === 'Submitted').length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  No pending issues!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
