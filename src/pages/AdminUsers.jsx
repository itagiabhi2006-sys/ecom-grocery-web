import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserX, Search, UserCheck } from 'lucide-react';
import api from '../Api';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch {
      // handle silently or show a toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDisable = async (email) => {
    if (!window.confirm(`Disable ${email}?`)) return;
    try {
      await api.get(`/admin/users/disable/${email}`);
      await fetchUsers();
    } catch {
      alert('Failed');
    }
  };

  const activeNow = users.filter(u => u.isActiveNow).length;
  const activeAcc = users.filter(u => u.isActive).length;

  const filtered = users.filter(u => {
    const q  = search.toLowerCase();
    const ms = !search
      || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
      || (u.email || '').toLowerCase().includes(q);
    const mf =
      filter === 'All'      ||
      (filter === 'Active'   && u.isActive)    ||
      (filter === 'Disabled' && !u.isActive)   ||
      (filter === 'Online'   && u.isActiveNow);
    return ms && mf;
  });

  return (
    <div style={{ padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#0f1f5c', margin: 0 }}>Users</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>{users.length} registered accounts</p>
        </div>

        {/* Stat badges */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            [UserCheck, '#16a34a', '#dcfce7', 'Online',   activeNow],
            [Users,     '#1d4ed8', '#dbeafe', 'Active',   activeAcc],
            [UserX,     '#dc2626', '#fee2e2', 'Disabled', users.filter(u => !u.isActive).length],
          ].map(([Icon, color, bg, label, val]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: bg }}>
              <Icon size={15} color={color} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 10, color, opacity: 0.7, fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', padding: '8px 12px 8px 33px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>
        {['All', 'Online', 'Active', 'Disabled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: filter === f ? '#1d4ed8' : '#fff', color: filter === f ? '#fff' : '#64748b', borderColor: filter === f ? '#1d4ed8' : '#e2e8f0' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 16px rgba(15,31,92,0.07)', border: '1px solid rgba(15,31,92,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>Loading users…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['User', 'Email', 'Gender', 'DOB', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                          <img src={u.imageURL || '/assets/default-avatar.svg'} alt={u.firstName}
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                          {u.isActiveNow && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{u.firstName} {u.lastName}</div>
                          {u.isActiveNow && <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>● Online</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 20px', fontSize: 13, color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '10px 20px', fontSize: 13, color: '#475569' }}>{u.gender || '—'}</td>
                    <td style={{ padding: '10px 20px', fontSize: 12, color: '#64748b' }}>{u.dob || '—'}</td>
                    <td style={{ padding: '10px 20px' }}>
                      <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{u.roles}</span>
                    </td>
                    <td style={{ padding: '10px 20px' }}>
                      <span style={{ background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#b91c1c', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 20px' }}>
                      {u.isActive ? (
                        <button onClick={() => handleDisable(u.email)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#fee2e2', color: '#b91c1c', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          <UserX size={12} /> Disable
                        </button>
                      ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 14 }}>No users match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}