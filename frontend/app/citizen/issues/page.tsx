'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvotes: number;
  wardId: string;
  createdAt: string;
  images: string[];
  govMarkedComplete: boolean;
  completionVotes: any[];
  reportedBy: string;
}

const STATUS_FILTER = ['All', 'Submitted', 'In Progress', 'Resolved'];
const CAT_ICONS: Record<string, string> = { Road: '🛣️', Water: '💧', Electricity: '⚡', Sanitation: '🗑️', Parks: '🌳', Drainage: '🌊', Lighting: '💡', Other: '📍' };

export default function IssuesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
    fetchIssues(u.wardId);
  }, [router]);

  useEffect(() => {
    let result = issues;
    if (status !== 'All') result = result.filter(i => i.status === status);
    if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [issues, status, search]);

  const fetchIssues = async (wardId: string) => {
    try {
      const res = await api.get(`/issue/ward/${wardId}`);
      setIssues(res.data.issue || []);
    } catch {}
    setLoading(false);
  };

  const handleUpvote = async (issueId: string) => {
    const u = JSON.parse(localStorage.getItem('cc_user') || '{}');
    try {
      const res = await api.patch(`/issue/${issueId}/upvote`, { userId: u.id });
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, upvotes: res.data.issue.upvotes } : i));
    } catch {}
  };

  const handleVote = async (issueId: string, approved: boolean) => {
    setVoting(issueId);
    try {
      const res = await api.post(`/issue/${issueId}/vote-completion`, { approved });
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, ...res.data.issue } : i));
    } catch {}
    setVoting(null);
  };

  const statusColor: Record<string, string> = { Submitted: '#818cf8', 'In Progress': '#f59e0b', Resolved: '#22c55e' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} />
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Issues in Your Ward</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{filtered.length} issue{filtered.length !== 1 ? 's' : ''} found</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search issues..." style={{ maxWidth: 300, flex: '1 1 200px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {STATUS_FILTER.map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{ padding: '10px 18px', borderRadius: 999, fontSize: 13, border: `1px solid ${status === s ? 'var(--accent)' : 'var(--border)'}`, background: status === s ? 'var(--accent-glow)' : 'transparent', color: status === s ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏙️</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No issues found</h3>
            <p style={{ marginBottom: 24 }}>Be the first to report an issue in your ward.</p>
            <Link href="/citizen/report" className="btn-primary">📝 Report Issue</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(issue => (
              <div key={issue._id} className="issue-card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {CAT_ICONS[issue.category] || '📍'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <Link href={`/citizen/issues/${issue._id}`} style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4 }}>{issue.title}</Link>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[issue.status], background: `${statusColor[issue.status]}22`, padding: '4px 12px', borderRadius: 999, flexShrink: 0, whiteSpace: 'nowrap' }}>{issue.status}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{issue.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {issue.wardId}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏷️ {issue.category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {new Date(issue.createdAt).toLocaleDateString('en-IN')}</span>
                      <button onClick={() => handleUpvote(issue._id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent-glow)', border: '1px solid var(--border-active)', borderRadius: 999, padding: '4px 12px', color: 'var(--accent-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        ▲ {issue.upvotes}
                      </button>
                      {issue.images?.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📸 {issue.images.length} photo{issue.images.length !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>

                {issue.govMarkedComplete && issue.status !== 'Resolved' && !issue.completionVotes?.find((v: any) => v.userId === user.id) && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--warning)', marginBottom: 10, fontWeight: 500 }}>🏛️ Government has marked this as complete. Do you verify?</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => handleVote(issue._id, true)} disabled={voting === issue._id} className="btn-success">
                        {voting === issue._id ? '...' : '✅ Yes, it\'s fixed'}
                      </button>
                      <button onClick={() => handleVote(issue._id, false)} disabled={voting === issue._id} className="btn-danger">
                        {voting === issue._id ? '...' : '❌ Not yet'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
