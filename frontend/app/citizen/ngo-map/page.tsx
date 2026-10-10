'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import { api } from '../../lib/api';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false, loading: () => (
  <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 16 }}>
    <div style={{ textAlign: 'center' }}>
      <span className="spinner" style={{ width: 40, height: 40 }}></span>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading map...</p>
    </div>
  </div>
)});

const CATEGORIES = ['All', 'Food', 'Clothes', 'Medicine', 'Education', 'Shelter', 'Water', 'Sanitation'];

export default function NGOMapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ngos, setNgos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cc_user');
    if (!stored) { router.push('/auth/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'Citizen') { router.push('/'); return; }
    setUser(u);
    fetchAllNGOs();
  }, [router]);

  useEffect(() => {
    if (category === 'All') setFiltered(ngos);
    else setFiltered(ngos.filter(n => n.categories?.includes(category)));
  }, [ngos, category]);

  const fetchAllNGOs = async () => {
    try {
      const res = await api.get('/ngo/all');
      setNgos(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  const findNearby = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation([lat, lng]);
      try {
        const res = await api.get(`/ngo/nearby?latitude=${lat}&longitude=${lng}&maxDistance=20000${category !== 'All' ? `&category=${category}` : ''}`);
        setFiltered(res.data.data || []);
      } catch {}
      setLocating(false);
    }, () => setLocating(false));
  };

  const donationCategories: Record<string, string> = { Food: '🍽️', Clothes: '👕', Medicine: '💊', Education: '📚', Shelter: '🏠', Water: '💧', Sanitation: '🚽' };

  if (loading || !user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><span className="spinner" style={{ width: 40, height: 40 }}></span></div>;

  return (
    <div className="page">
      <Sidebar role="Citizen" userName={user.name} />
      <div className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>NGO Map</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find NGOs near you offering food, clothes, medicine and more.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`, background: category === cat ? 'var(--accent-glow)' : 'transparent', color: category === cat ? 'var(--accent-light)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat !== 'All' ? (donationCategories[cat] || '') + ' ' : ''}{cat}
              </button>
            ))}
          </div>
          <button onClick={findNearby} disabled={locating} className="btn-primary" style={{ marginLeft: 'auto' }}>
            {locating ? <><span className="spinner"></span> Locating...</> : '📍 Find Nearest NGOs'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
          <div className="map-container">
            <MapComponent ngos={filtered} userLocation={userLocation} onNGOSelect={setSelectedNgo} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingBottom: 8 }}>{filtered.length} NGO{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
                <p style={{ color: 'var(--text-muted)' }}>No NGOs found. Try a different category or location.</p>
              </div>
            ) : (
              filtered.map(ngo => (
                <div key={ngo._id} className="card" style={{ padding: 16, cursor: 'pointer', borderColor: selectedNgo?._id === ngo._id ? 'var(--accent)' : 'var(--border)' }} onClick={() => setSelectedNgo(ngo)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤝</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ngo.organizationName || ngo.name}</div>
                      {ngo.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>📞 {ngo.phone}</div>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(ngo.categories || []).map((cat: string) => (
                          <span key={cat} style={{ fontSize: 11, background: 'rgba(168,85,247,0.1)', color: 'var(--purple)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 999, padding: '2px 8px' }}>
                            {donationCategories[cat] || ''} {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedNgo && (
          <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border-active)', borderRadius: 16, padding: '20px 28px', maxWidth: 500, width: '90%', boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{selectedNgo.organizationName || selectedNgo.name}</h3>
                {selectedNgo.email && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>✉️ {selectedNgo.email}</p>}
                {selectedNgo.phone && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>📞 {selectedNgo.phone}</p>}
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Want to donate? Contact this NGO directly.</p>
              </div>
              <button onClick={() => setSelectedNgo(null)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
