'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

export default function CitizenNotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notification/');
      setNotifications(res.data.data || []);
      await api.patch('/notification/mark-read');
    } catch {}
    setLoading(false);
  };

  const typeIcon: Record<string, string> = {
    issue_upvoted: '▲',
    verify_completion: '🏛️',
    issue_resolved: '✅',
    new_issue_in_ward: '📍',
    ngo_request: '🤝'
  };

  const typeBg: Record<string, string> = {
    issue_upvoted: 'rgba(99,102,241,0.1)',
    verify_completion: 'rgba(245,158,11,0.1)',
    issue_resolved: 'rgba(34,197,94,0.1)',
    new_issue_in_ward: 'rgba(6,182,212,0.1)',
    ngo_request: 'rgba(168,85,247,0.1)'
  };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-secondary)' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No notifications yet. They will appear here when issues in your ward are updated.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(n => (
              <div key={n._id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', borderColor: !n.read ? 'var(--border-active)' : 'var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: typeBg[n.type] || 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>{n.message}</p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
