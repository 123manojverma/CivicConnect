'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('cc_user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'Citizen') router.push('/citizen');
        else if (u.role === 'Government') router.push('/government');
        else if (u.role === 'NGO') router.push('/ngo');
      } catch {}
    }
  }, [router]);

  const features = [
    { icon: '📍', title: 'Report Issues', desc: 'Snap a photo, pin the location, and report civic problems in seconds with AI-assisted descriptions.' },
    { icon: '🗺️', title: 'NGO Map', desc: 'Find the nearest NGOs offering food, clothes, medicine and more — visualized on an interactive map.' },
    { icon: '🏛️', title: 'Government Tracking', desc: 'Issues go directly to the concerned ward authority. Track progress from submitted to resolved.' },
    { icon: '✅', title: 'Community Verification', desc: 'When government marks work done, your ward votes to verify. Democracy at the micro-level.' },
    { icon: '🤖', title: 'AI-Powered', desc: 'Gemini AI helps write clear issue descriptions and analyzes uploaded images automatically.' },
    { icon: '🔔', title: 'Live Notifications', desc: 'Get notified when issues in your area are upvoted, resolved, or need your verification.' },
  ];

  const stats = [
    { value: '12K+', label: 'Issues Reported' },
    { value: '340+', label: 'NGOs Registered' },
    { value: '89%', label: 'Resolution Rate' },
    { value: '50+', label: 'Cities Active' },
  ];

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌆</div>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk' }}>CivicConnect</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn-secondary" style={{ padding: '10px 20px' }}>Sign In</Link>
          <Link href="/auth/register" className="btn-primary" style={{ padding: '10px 20px' }}>Get Started</Link>
        </div>
      </nav>

      <div style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center', maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-glow)', border: '1px solid var(--border-active)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: 'var(--accent-light)' }}>
          <span className="glow-dot"></span>
          Powering civic change across India
        </div>
        <h1 style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}>
          Your City. Your Voice.<br />
          <span className="gradient-text">Your Responsibility.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.8 }}>
          CivicConnect bridges the gap between citizens, government, and NGOs. Report problems, find help, and watch your city transform — together.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register" className="btn-primary" style={{ fontSize: 16, padding: '16px 36px' }}>
            🚀 Start Reporting
          </Link>
          <Link href="/auth/login" className="btn-secondary" style={{ fontSize: 16, padding: '16px 36px' }}>
            Sign In
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Space Grotesk' }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '80px 24px' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Everything You Need</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 60, fontSize: 16 }}>Designed for citizens, trusted by government, loved by NGOs.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="card fade-in" style={{ borderRadius: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))', border: '1px solid var(--border)', margin: '0 24px 80px', borderRadius: 24, padding: 60, textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ready to make a difference?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>Join thousands of citizens who are making their city better, one report at a time.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register?role=Citizen" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>I&apos;m a Citizen</Link>
          <Link href="/auth/register?role=NGO" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 15 }}>Register as NGO</Link>
          <Link href="/auth/register?role=Government" className="btn-secondary" style={{ padding: '14px 32px', fontSize: 15 }}>Government Login</Link>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2024 CivicConnect. Built for a better India. 🇮🇳
      </footer>
    </div>
  );
}
