'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api } from '../../../lib/api';

export default function GovIssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const issueId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [issue, setIssue] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionImage, setCompletionImage] = useState('');
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [completionPreview, setCompletionPreview] = useState('');
  const [marking, setMarking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Government') { router.push('/'); return; }
    setUser(u);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompletionFile(file);
      setCompletionPreview(URL.createObjectURL(file));
    }
  };

  const uploadCompletionImage = async (): Promise<string> => {
    if (!completionFile) return '';
    const fd = new FormData();
    fd.append('images', completionFile);
    const res = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.urls[0] || '';
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/issue/${issueId}/status`, { status: newStatus });
      setIssue((prev: any) => ({ ...prev, status: newStatus }));
    } catch {}
    setUpdating(false);
  };

  const markComplete = async () => {
    setMarking(true);
    try {
      let imgUrl = completionImage;
      if (completionFile) imgUrl = await uploadCompletionImage();
      const res = await api.patch(`/issue/${issueId}/gov-complete`, { completionImage: imgUrl });
      setIssue(res.data.issue);
    } catch {}
    setMarking(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const res = await api.post(`/comment/${issueId}`, { content: comment, userName: user.name });
      setComments(prev => [res.data.data, ...prev]);
      setComment('');
    } catch {}
    setCommenting(false);
  };

  const statusColor: Record<string, string> = { Submitted: '#818cf8', 'In Progress': '#f59e0b', Resolved: '#22c55e' };
  const approvedVotes = issue?.completionVotes?.filter((v: any) => v.approved).length || 0;
  const totalVotes = issue?.completionVotes?.length || 0;
  const approvalPct = totalVotes > 0 ? Math.round((approvedVotes / totalVotes) * 100) : 0;

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  if (!issue) return (
    <div className="page">
      <Sidebar role="Government" userName={user?.name || ''} />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>😕</div>
          <h2>Issue not found</h2>
          <Link href="/government/issues" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>← Back</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Sidebar role="Government" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 900 }}>
        <Link href="/government/issues" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>← Back to Issues</Link>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[issue.status], background: `${statusColor[issue.status]}22`, padding: '4px 12px', borderRadius: 999 }}>{issue.status}</span>
            <span className="badge badge-gov">{issue.category}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>▲ {issue.upvotes} upvotes</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{issue.title}</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>{issue.description}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 Ward: {issue.wardId} · 📅 {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          {issue.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              {issue.images.map((img: string, i: number) => (
                <img key={i} src={img} alt="" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {issue.status === 'Submitted' && (
              <button onClick={() => updateStatus('In Progress')} disabled={updating} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}>
                {updating ? '...' : '⚙️ Start Working on This'}
              </button>
            )}
          </div>
        </div>

        {issue.status === 'In Progress' && !issue.govMarkedComplete && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(34,197,94,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--success)' }}>✅ Mark as Complete</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Upload proof of completion. Citizens in this ward will verify if the work is actually done.</p>

            <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--success)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              {completionPreview ? (
                <img src={completionPreview} alt="Completion proof" style={{ maxHeight: 200, borderRadius: 8, maxWidth: '100%' }} />
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Click to upload completion photo</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <button onClick={markComplete} disabled={marking} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, background: 'var(--success)', borderColor: 'var(--success)' }}>
              {marking ? <><span className="spinner"></span> Uploading & notifying...</> : '✅ Mark Complete & Notify Citizens'}
            </button>
          </div>
        )}

        {issue.govMarkedComplete && (
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(245,158,11,0.3)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--warning)' }}>⏳ Awaiting Community Verification</h3>
            {issue.completionImage && <img src={issue.completionImage} alt="Completion" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Community votes</span>
                <span style={{ fontWeight: 600 }}>{approvalPct}% approved ({approvedVotes}/{totalVotes})</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${approvalPct}%`, background: approvalPct >= 50 ? 'var(--success)' : 'var(--warning)', borderRadius: 4, transition: 'width 0.3s' }}></div>
              </div>
            </div>
            {issue.status === 'Resolved' && <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: 14, marginTop: 10 }}>🎉 Verified as resolved by the community!</p>}
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>💬 Comments ({comments.length})</h3>
          <form onSubmit={handleComment} style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add an official comment..." style={{ flex: 1 }} />
            <button type="submit" disabled={commenting || !comment.trim()} className="btn-primary" style={{ flexShrink: 0 }}>Post</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {comments.map(c => (
              <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🏛️</div>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.userName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
