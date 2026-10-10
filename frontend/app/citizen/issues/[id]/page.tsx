'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '../../../lib/api';

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const issueId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [issue, setIssue] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    setUser(JSON.parse(stored));
    fetchAll();
  }, [issueId]);

  const fetchAll = async () => {
    try {
      const [issueRes, commentsRes] = await Promise.all([
        api.get(`/issue/${issueId}`),
        api.get(`/comment/${issueId}`)
      ]);
      setIssue(issueRes.data.data);
      setComments(commentsRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const handleUpvote = async () => {
    const u = JSON.parse(localStorage.getItem('cc_user') || '{}');
    try {
      const res = await api.patch(`/issue/${issueId}/upvote`, { userId: u.id });
      setIssue((prev: any) => ({ ...prev, upvotes: res.data.issue.upvotes }));
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const res = await api.post(`/comment/${issueId}`, { content: comment, userName: user.name, userAvatar: user.avatar });
      setComments(prev => [res.data.data, ...prev]);
      setComment('');
    } catch {}
    setCommenting(false);
  };

  const handleVote = async (approved: boolean) => {
    setVoting(true);
    try {
      const res = await api.post(`/issue/${issueId}/vote-completion`, { approved });
      setIssue(res.data.issue);
    } catch {}
    setVoting(false);
  };

  const statusColor: Record<string, string> = { Submitted: '#818cf8', 'In Progress': '#f59e0b', Resolved: '#22c55e' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  if (!issue) return (
    <div className="page">
      <Sidebar role="Citizen" userName={user?.name || ''} />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>😕</div>
          <h2>Issue not found</h2>
          <Link href="/citizen/issues" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>← Back to Issues</Link>
        </div>
      </div>
    </div>
  );

  const approvedVotes = issue.completionVotes?.filter((v: any) => v.approved).length || 0;
  const totalVotes = issue.completionVotes?.length || 0;
  const approvalPct = totalVotes > 0 ? Math.round((approvedVotes / totalVotes) * 100) : 0;
  const hasVoted = issue.completionVotes?.find((v: any) => v.userId === user.id);

  return (
    <div className="page">
      <Sidebar role={user.role} userName={user.name} />
      <div className="main-content" style={{ maxWidth: 900 }}>
        <Link href="/citizen/issues" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>← Back to Issues</Link>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[issue.status], background: `${statusColor[issue.status]}22`, padding: '4px 12px', borderRadius: 999 }}>{issue.status}</span>
                <span className="badge badge-submitted">{issue.category}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{issue.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>📍 Ward: {issue.wardId} · 📅 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button onClick={handleUpvote} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'var(--accent-glow)', border: '2px solid var(--border-active)', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>▲</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-light)' }}>{issue.upvotes}</span>
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>{issue.description}</p>

          {issue.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {issue.images.map((img: string, i: number) => (
                <img key={i} src={img} alt={`Issue photo ${i + 1}`} style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
              ))}
            </div>
          )}
        </div>

        {issue.govMarkedComplete && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(245,158,11,0.3)', background: 'var(--warning-bg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--warning)', marginBottom: 12 }}>🏛️ Government Marked as Complete</h3>
            {issue.completionImage && <img src={issue.completionImage} alt="Completion proof" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Community Approval</span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{approvalPct}% ({approvedVotes}/{totalVotes})</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${approvalPct}%`, background: 'var(--warning)', borderRadius: 4, transition: 'width 0.3s' }}></div>
              </div>
            </div>
            {!hasVoted && issue.status !== 'Resolved' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleVote(true)} disabled={voting} className="btn-success">{voting ? '...' : '✅ Work is done!'}</button>
                <button onClick={() => handleVote(false)} disabled={voting} className="btn-danger">{voting ? '...' : '❌ Not fixed yet'}</button>
              </div>
            )}
            {hasVoted && <p style={{ fontSize: 13, color: 'var(--success)' }}>✅ You have already voted</p>}
            {issue.status === 'Resolved' && <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)', marginTop: 8 }}>🎉 Issue verified as Resolved by the community!</p>}
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>💬 Comments ({comments.length})</h3>
          <form onSubmit={handleComment} style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." style={{ flex: 1 }} />
            <button type="submit" disabled={commenting || !comment.trim()} className="btn-primary" style={{ flexShrink: 0 }}>
              {commenting ? <span className="spinner"></span> : 'Post'}
            </button>
          </form>
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No comments yet. Start the conversation!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {comments.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid var(--border-active)' }}>👤</div>
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.userName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
