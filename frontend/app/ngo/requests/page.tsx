'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

export default function NGORequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'NGO') { router.push('/'); return; }
    setUser(u);
    fetchRequests(u);
  }, [router]);

  const fetchRequests = async (u: any) => {
    try {
      const res = await api.get(`/issue/ngo/${u.id}`);
      setRequests(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  const statusColor: Record<string, string> = { Submitted: '#818cf8', 'In Progress': '#f59e0b', Resolved: '#22c55e' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="NGO" userName={user.name} />
      <div className="main-content">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Aid Requests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{requests.length} request{requests.length !== 1 ? 's' : ''} tagged to your NGO</p>
        </div>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 8 }}>No requests yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Citizens will tag your organization when they need the services you offer.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map(req => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor[req.status], background: `${statusColor[req.status]}22`, padding: '4px 12px', borderRadius: 999 }}>{req.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {req.wardId}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{req.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{req.description}</p>
                    {req.images?.length > 0 && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                        {req.images.map((img: string, i: number) => (
                          <img key={i} src={img} alt="" style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
