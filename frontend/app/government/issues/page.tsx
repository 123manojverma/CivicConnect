'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const STATUS_FILTER = ['All', 'Submitted', 'In Progress', 'Resolved'];

export default function GovIssuesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Government') { router.push('/'); return; }
    setUser(u);
    fetchIssues(u.wardId);
  }, [router]);

  useEffect(() => {
    let r = issues;
    if (status !== 'All') r = r.filter(i => i.status === status);
    if (search) r = r.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(r);
  }, [issues, status, search]);

  const fetchIssues = async (wardId: string) => {
    try {
      const res = await api.get(`/issue/ward/${wardId}`);
      setIssues(res.data.issue || []);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (issueId: string, newStatus: string) => {
    setUpdating(issueId);
    try {
      await api.patch(`/issue/${issueId}/status`, { status: newStatus });
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, status: newStatus } : i));
    } catch {}
    setUpdating(null);
  };

  const statusColor: Record<string, string> = { Submitted: '#818cf8', 'In Progress': '#f59e0b', Resolved: '#22c55e' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Government" userName={user.name} />
      <div className="main-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Ward Issues</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{filtered.length} issue{filtered.length !== 1 ? 's' : ''} in your ward</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search issues..." style={{ maxWidth: 300, flex: '1 1 200px' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FILTER.map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{ padding: '10px 18px', borderRadius: 999, fontSize: 13, border: `1px solid ${status === s ? 'var(--cyan)' : 'var(--border)'}`, background: status === s ? 'rgba(6,182,212,0.1)' : 'transparent', color: status === s ? 'var(--cyan)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏙️</div>
            <h3 style={{ fontSize: 20, color: 'var(--text-secondary)' }}>No issues found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(issue => (
              <div key={issue._id} className="card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[issue.status], background: `${statusColor[issue.status]}22`, padding: '4px 12px', borderRadius: 999 }}>{issue.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>▲ {issue.upvotes} upvotes</span>
                      {issue.govMarkedComplete && <span style={{ fontSize: 11, background: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 999 }}>⏳ Awaiting verification ({issue.completionVotes?.length || 0} votes)</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                      <Link href={`/government/issues/${issue._id}`} style={{ color: 'inherit' }}>{issue.title}</Link>
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{issue.description}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {issue.status === 'Submitted' && (
                        <button onClick={() => updateStatus(issue._id, 'In Progress')} disabled={updating === issue._id} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}>
                          {updating === issue._id ? '...' : '⚙️ Start Work'}
                        </button>
                      )}
                      {issue.status === 'In Progress' && !issue.govMarkedComplete && (
                        <Link href={`/government/issues/${issue._id}`} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.3)', display: 'inline-flex' }}>
                          ✅ Mark Complete
                        </Link>
                      )}
                      <Link href={`/government/issues/${issue._id}`} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', display: 'inline-flex' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                  {issue.images?.[0] && (
                    <img src={issue.images[0]} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', flexShrink: 0 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
