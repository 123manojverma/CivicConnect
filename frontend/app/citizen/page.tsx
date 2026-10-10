'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '../lib/api';

interface Issue {
  _id: string;
  title: string;
  category: string;
  status: string;
  upvotes: number;
  wardId: string;
  createdAt: string;
  govMarkedComplete: boolean;
  completionVotes: any[];
}

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({ submitted: 0, inProgress: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
    fetchData(u);
  }, [router]);

  const fetchData = async (u: any) => {
    try {
      const [issuesRes, notifRes] = await Promise.all([
        api.get(`/issue/ward/${u.wardId}`),
        api.get('/notification/unread-count')
      ]);
      const data: Issue[] = issuesRes.data.issue || [];
      setIssues(data.slice(0, 5));
      setStats({
        total: data.length,
        submitted: data.filter(i => i.status === 'Submitted').length,
        inProgress: data.filter(i => i.status === 'In Progress').length,
        resolved: data.filter(i => i.status === 'Resolved').length
      });
      setNotifCount(notifRes.data.count || 0);
    } catch {}
    setLoading(false);
  };

  const statusColor: Record<string, string> = {
    Submitted: 'var(--accent-light)',
    'In Progress': 'var(--warning)',
    Resolved: 'var(--success)'
  };

  if (loading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;
  }

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} notifCount={notifCount} />
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ward: <span style={{ color: 'var(--accent-light)', fontWeight: 500 }}>{user.wardId || 'Not assigned'}</span></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '📋', label: 'Total Issues', value: stats.total, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
            { icon: '📤', label: 'Submitted', value: stats.submitted, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
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
          <Link href="/citizen/report" style={{ background: 'linear-gradient(135deg, var(--accent), #4f46e5)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            <div style={{ fontSize: 40 }}>📝</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Report an Issue</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Potholes, leaks, lights — report anything</div>
            </div>
          </Link>
          <Link href="/citizen/ngo-map" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(6,182,212,0.3))', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            <div style={{ fontSize: 40 }}>🗺️</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Find NGOs Near You</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Food, clothes, medicine & more</div>
            </div>
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Issues in Your Ward</h2>
            <Link href="/citizen/issues" style={{ color: 'var(--accent-light)', fontSize: 13, fontWeight: 500 }}>View all →</Link>
          </div>
          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏙️</div>
              <p>No issues in your ward yet. Be the first to report!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {issues.map(issue => (
                <Link key={issue._id} href={`/citizen/issues/${issue._id}`} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {issue.category === 'Road' ? '🛣️' : issue.category === 'Water' ? '💧' : issue.category === 'Electricity' ? '⚡' : '📍'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{issue.category} • {new Date(issue.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[issue.status], background: `${statusColor[issue.status]}22`, padding: '3px 10px', borderRadius: 999 }}>{issue.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>▲ {issue.upvotes}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
