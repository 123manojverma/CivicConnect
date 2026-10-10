'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/app/lib/api';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  role: 'Citizen' | 'Government' | 'NGO';
  userName: string;
  notifCount?: number;
}

const CITIZEN_NAV: NavItem[] = [
  { href: '/citizen', icon: '🏠', label: 'Dashboard' },
  { href: '/citizen/report', icon: '📝', label: 'Report Issue' },
  { href: '/citizen/issues', icon: '📋', label: 'All Issues' },
  { href: '/citizen/donate', icon: '🤲', label: 'Donate Surplus' },
  { href: '/citizen/ngo-map', icon: '🗺️', label: 'Find NGOs' },
  { href: '/citizen/notifications', icon: '🔔', label: 'Notifications' },
];

const GOVERNMENT_NAV: NavItem[] = [
  { href: '/government', icon: '🏠', label: 'Dashboard' },
  { href: '/government/issues', icon: '📋', label: 'Ward Issues' },
  { href: '/government/notifications', icon: '🔔', label: 'Notifications' },
];

const NGO_NAV: NavItem[] = [
  { href: '/ngo', icon: '🏠', label: 'Dashboard' },
  { href: '/ngo/donations', icon: '🤲', label: 'Available Donations' },
  { href: '/ngo/requests', icon: '📦', label: 'Aid Requests' },
  { href: '/ngo/profile', icon: '⚙️', label: 'Profile' },
  { href: '/ngo/notifications', icon: '🔔', label: 'Notifications' },
];

const ROLE_NAV = { Citizen: CITIZEN_NAV, Government: GOVERNMENT_NAV, NGO: NGO_NAV };
const ROLE_COLOR = { Citizen: 'var(--orange)', Government: 'var(--cyan)', NGO: 'var(--purple)' };
const ROLE_BADGE = { Citizen: 'badge-citizen', Government: 'badge-gov', NGO: 'badge-ngo' };

export default function Sidebar({ role, userName, notifCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const navItems = ROLE_NAV[role];

  const handleLogout = () => {
    // Fire-and-forget — don't block on server response
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
    router.push('/');
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌆</div>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk' }}>CivicConnect</span>
        </Link>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: ROLE_COLOR[role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {role === 'Citizen' ? '👤' : role === 'Government' ? '🏛️' : '🤝'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div className={`badge ${ROLE_BADGE[role]}`} style={{ marginTop: 4 }}>{role}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            style={{ position: 'relative' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
            {item.label === 'Notifications' && notifCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{notifCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}
