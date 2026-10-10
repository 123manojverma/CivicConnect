'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

export default function GovNotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Government') { router.push('/'); return; }
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

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Government" userName={user.name} />
      <div className="main-content" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontSize: 20, color: 'var(--text-secondary)' }}>All caught up!</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(n => (
              <div key={n._id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', borderColor: !n.read ? 'rgba(6,182,212,0.4)' : 'var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>{n.message}</p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 6 }}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
