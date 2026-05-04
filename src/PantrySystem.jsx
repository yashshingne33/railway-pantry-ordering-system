import React, { useState } from 'react';
import PassengerQR from './PassengerQR';

// ── Data ──────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 1, name: 'Veg Thali',       price: 120, category: 'Meal',      emoji: '🍱' },
  { id: 2, name: 'Non-Veg Thali',   price: 150, category: 'Meal',      emoji: '🍗' },
  { id: 3, name: 'Samosa (2 pcs)',  price: 30,  category: 'Snack',     emoji: '🥟' },
  { id: 4, name: 'Bread Omelette',  price: 50,  category: 'Snack',     emoji: '🍳' },
  { id: 5, name: 'Tea',             price: 15,  category: 'Beverage',  emoji: '☕' },
  { id: 6, name: 'Water Bottle 1L', price: 20,  category: 'Beverage',  emoji: '💧' },
  { id: 7, name: 'Cold Coffee',     price: 60,  category: 'Beverage',  emoji: '🥤' },
  { id: 8, name: 'Upma',            price: 45,  category: 'Breakfast', emoji: '🥣' },
];

const INIT_ORDERS = [
  { id: 'ORD-001', seat: 'B2-45', coach: 'B2', items: [{ name: 'Veg Thali', qty: 2, price: 120 }], total: 240, status: 'Delivered', time: '09:15 AM', payment: 'UPI' },
  { id: 'ORD-002', seat: 'S4-12', coach: 'S4', items: [{ name: 'Tea', qty: 3, price: 15 }, { name: 'Samosa (2 pcs)', qty: 2, price: 30 }], total: 105, status: 'Preparing', time: '09:42 AM', payment: 'Cash' },
  { id: 'ORD-003', seat: 'A1-3',  coach: 'A1', items: [{ name: 'Non-Veg Thali', qty: 1, price: 150 }], total: 150, status: 'Pending', time: '10:05 AM', payment: 'UPI' },
  { id: 'ORD-004', seat: 'B1-22', coach: 'B1', items: [{ name: 'Water Bottle 1L', qty: 4, price: 20 }, { name: 'Cold Coffee', qty: 2, price: 60 }], total: 200, status: 'Delivered', time: '10:18 AM', payment: 'UPI' },
  { id: 'ORD-005', seat: 'S2-7',  coach: 'S2', items: [{ name: 'Upma', qty: 2, price: 45 }, { name: 'Tea', qty: 2, price: 15 }], total: 120, status: 'Preparing', time: '10:30 AM', payment: 'Cash' },
];

const INIT_VENDORS = [
  { id: 'V001', name: 'Ramesh Kumar', train: '12139', sales: 4500, orders: 38, rating: 4.2, status: 'Active' },
  { id: 'V002', name: 'Suresh Patel', train: '12140', sales: 3200, orders: 29, rating: 3.8, status: 'Active' },
  { id: 'V003', name: 'Meena Devi',   train: '22105', sales: 5100, orders: 44, rating: 4.6, status: 'Active' },
  { id: 'V004', name: 'Ajay Singh',   train: '12139', sales: 1800, orders: 16, rating: 3.2, status: 'Suspended' },
];

// ── Badge helper ──────────────────────────────────────────────────────────────
const badge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'active')   return 'b-active';
  if (s === 'preparing')                      return 'b-preparing';
  if (s === 'pending')                        return 'b-pending';
  if (s === 'suspended')                      return 'b-suspended';
  return 'b-pending';
};

// ── 1. ADMIN DASHBOARD ────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab]         = useState('orders');
  const [vendors, setVendors] = useState(INIT_VENDORS);

  const totalRevenue = INIT_ORDERS.reduce((s, o) => s + o.total, 0);
  const delivered    = INIT_ORDERS.filter(o => o.status === 'Delivered').length;
  const pending      = INIT_ORDERS.filter(o => o.status !== 'Delivered').length;

  const toggleVendor = (id) =>
    setVendors(v => v.map(x => x.id === id ? { ...x, status: x.status === 'Active' ? 'Suspended' : 'Active' } : x));

  const cards = [
    { title: 'Active Trains',   value: 3,                                                 icon: '🚂', change: '+1',   positive: true,  sub: 'vs yesterday'   },
    { title: "Today's Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`,        icon: '💰', change: '+12%', positive: true,  sub: 'vs last week'   },
    { title: 'Total Orders',    value: INIT_ORDERS.length,                                icon: '📦', change: `+${INIT_ORDERS.length}`, positive: true, sub: 'today' },
    { title: 'Active Vendors',  value: vendors.filter(v => v.status === 'Active').length, icon: '👤', change: '+0',   positive: true,  sub: 'on duty'        },
    { title: 'Delivered',       value: delivered,                                         icon: '✅', change: `${Math.round(delivered / INIT_ORDERS.length * 100)}%`, positive: true, sub: 'completion' },
    { title: 'Pending',         value: pending,                                           icon: '⏳', change: `${pending}`, positive: false, sub: 'needs attention' },
  ];

  return (
    <div className="view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pantry Admin Dashboard</h1>
          <span className="page-sub">Indian Railway — NGP Division</span>
        </div>
        <span className="live-pill">🟢 LIVE · Train 12139</span>
      </div>

      <div className="cards-grid">
        {cards.map((c, i) => (
          <div key={c.title} className="card" style={{ animationDelay: `${i * 55}ms` }}>
            <div className="card-left">
              <div className="card-icon">{c.icon}</div>
              <div>
                <p className="card-label">{c.title}</p>
                <p className="card-val">{c.value}</p>
              </div>
            </div>
            <div className="card-right">
              <span className={`delta ${c.positive ? 'up' : 'down'}`}>{c.positive ? '↑' : '↓'} {c.change}</span>
              <span className="delta-sub">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {[['orders','📦 Orders'],['vendors','👤 Vendors'],['complaints','⚠️ Complaints']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="table-card">
          <div className="table-header">
            <span className="section-title">Live Orders</span>
            <span className="count-pill">{INIT_ORDERS.length} orders</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Order ID</th><th>Seat</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {INIT_ORDERS.map((o, i) => (
                  <tr key={o.id} className="tbl-row" style={{ animationDelay: `${i * 35}ms` }}>
                    <td className="td-id">{o.id}</td>
                    <td><span className="chip chip-blue">{o.seat}</span></td>
                    <td className="td-items">{o.items.map(it => `${it.name} ×${it.qty}`).join(', ')}</td>
                    <td className="td-amt">₹{o.total}</td>
                    <td><span className={`chip ${o.payment === 'UPI' ? 'chip-blue' : 'chip-soft'}`}>{o.payment === 'UPI' ? '📱' : '💵'} {o.payment}</span></td>
                    <td className="td-time">{o.time}</td>
                    <td><span className={`badge ${badge(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'vendors' && (
        <div className="table-card">
          <div className="table-header">
            <span className="section-title">Vendor Overview</span>
            <span className="count-pill">{vendors.length} vendors</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Train</th><th>Sales</th><th>Orders</th><th>Rating</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {vendors.map((v, i) => (
                  <tr key={v.id} className="tbl-row" style={{ animationDelay: `${i * 35}ms` }}>
                    <td className="td-id">{v.id}</td>
                    <td className="td-name">{v.name}</td>
                    <td><span className="chip chip-soft">{v.train}</span></td>
                    <td className="td-amt">₹{v.sales.toLocaleString('en-IN')}</td>
                    <td>{v.orders}</td>
                    <td style={{ fontWeight: 700, color: '#1d4ed8' }}>⭐ {v.rating}</td>
                    <td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td>
                    <td>
                      <button className={`act-btn ${v.status === 'Active' ? 'act-mute' : 'act-ok'}`} onClick={() => toggleVendor(v.id)}>
                        {v.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'complaints' && (
        <div className="table-card">
          <div className="table-header">
            <span className="section-title">Passenger Complaints</span>
            <span className="count-pill">2 open</span>
          </div>
          <div className="complaint-list">
            {[
              { name: 'Rahul Sharma', seat: 'B2-12', issue: 'Food was cold and stale', status: 'Open',     time: '09:30 AM' },
              { name: 'Priya Verma',  seat: 'S3-44', issue: 'Wrong order delivered',   status: 'Open',     time: '10:10 AM' },
              { name: 'Amit Joshi',   seat: 'A1-7',  issue: 'Charged extra ₹20',       status: 'Resolved', time: '08:55 AM' },
            ].map((c, i) => (
              <div key={i} className="complaint-row">
                <div className="complaint-top">
                  <div>
                    <p className="complaint-name">{c.name}</p>
                    <p className="complaint-meta">Seat {c.seat} · {c.time}</p>
                  </div>
                  <span className={`badge ${c.status === 'Open' ? 'b-suspended' : 'b-active'}`}>{c.status}</span>
                </div>
                <p className="complaint-issue">{c.issue}</p>
                {c.status === 'Open' && (
                  <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.28rem 0.75rem', fontSize: '0.72rem' }}>
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── 2. VENDOR PANEL ───────────────────────────────────────────────────────────
const VendorPanel = () => {
  const [tab, setTab]             = useState('all');
  const [orders, setOrders]       = useState(INIT_ORDERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart]           = useState({});
  const [coach, setCoach]         = useState('');
  const [seat, setSeat]           = useState('');
  const [toast, setToast]         = useState('');

  const totalSales   = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status !== 'Delivered').length;

  const addItem  = (item) => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
  const remItem  = (item) => setCart(c => { const n = { ...c }; if (n[item.id] > 1) n[item.id]--; else delete n[item.id]; return n; });
  const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => s + (MENU_ITEMS.find(m => m.id === +id)?.price || 0) * qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const markStatus = (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const placeOrder = () => {
    if (!coach || !seat || cartCount === 0) return;
    const o = {
      id: `ORD-00${orders.length + 1}`,
      seat: `${coach}-${seat}`, coach,
      items: Object.entries(cart).map(([id, qty]) => {
        const it = MENU_ITEMS.find(m => m.id === +id);
        return { name: it.name, qty, price: it.price };
      }),
      total: cartTotal, status: 'Pending',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      payment: 'UPI',
    };
    setOrders(p => [o, ...p]);
    setCart({}); setCoach(''); setSeat(''); setModalOpen(false);
    setToast('Order placed successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const visible = orders.filter(o =>
    tab === 'all' ? true : tab === 'pending' ? o.status !== 'Delivered' : o.status === 'Delivered'
  );

  return (
    <div className="view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Panel</h1>
          <span className="page-sub">Welcome, Ramesh Kumar · Train 12139</span>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>➕ New Order</button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { title: "Today's Sales", value: `₹${totalSales.toLocaleString('en-IN')}`, icon: '💰' },
          { title: 'Total Orders',  value: orders.length,                             icon: '📦' },
          { title: 'Pending',       value: pendingCount,                              icon: '⏳' },
        ].map((c, i) => (
          <div key={c.title} className="card" style={{ animationDelay: `${i * 55}ms` }}>
            <div className="card-left">
              <div className="card-icon">{c.icon}</div>
              <div>
                <p className="card-label">{c.title}</p>
                <p className="card-val">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {[['all','🏠 All'],['pending','⏳ Pending'],['done','✅ Completed']].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
            {label}
            {id === 'pending' && pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
          </button>
        ))}
      </div>

      <div className="order-grid">
        {visible.map((o, i) => (
          <div key={o.id} className="order-card" style={{ animationDelay: `${i * 45}ms` }}>
            <div className="order-top">
              <div>
                <p className="td-id" style={{ margin: 0 }}>{o.id}</p>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '4px' }}>
                  <span className="chip chip-blue">{o.seat}</span>
                  <span className={`chip ${o.payment === 'UPI' ? 'chip-blue' : 'chip-soft'}`}>{o.payment}</span>
                </div>
              </div>
              <span className={`badge ${badge(o.status)}`}>{o.status}</span>
            </div>
            <p className="order-items">{o.items.map(it => `${it.name} ×${it.qty}`).join(' · ')}</p>
            <div className="order-footer">
              <span className="order-total">₹{o.total}</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {o.status === 'Pending'   && <button className="act-btn act-ok"   onClick={() => markStatus(o.id, 'Preparing')}>Start</button>}
                {o.status === 'Preparing' && <button className="act-btn act-ok"   onClick={() => markStatus(o.id, 'Delivered')}>✓ Delivered</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {modalOpen && (
        <div className="overlay" onClick={() => setModalOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">New Order</span>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="field-label">Coach No *</label>
                  <select className="field-input" value={coach} onChange={e => setCoach(e.target.value)}>
                    <option value="">Select</option>
                    {['A1','A2','B1','B2','S1','S2','S3','S4'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Seat No *</label>
                  <input className="field-input" placeholder="e.g. 45" value={seat} onChange={e => setSeat(e.target.value)} />
                </div>
              </div>
              <label className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Items</label>
              <div className="menu-list">
                {MENU_ITEMS.map(item => (
                  <div key={item.id} className="menu-row">
                    <div className="menu-info">
                      <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                      <div>
                        <p className="menu-name">{item.name}</p>
                        <p className="menu-cat">{item.category}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="menu-price">₹{item.price}</span>
                      {cart[item.id] ? (
                        <div className="qty">
                          <button onClick={() => remItem(item)}>−</button>
                          <span>{cart[item.id]}</span>
                          <button onClick={() => addItem(item)}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => addItem(item)}>+ Add</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky-bar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="sticky-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                  <p className="sticky-total">₹{cartTotal}</p>
                </div>
                <button className="btn-primary" disabled={!coach || !seat || cartCount === 0} onClick={placeOrder}>
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
const PantrySystem = () => {
  const [view, setView] = useState('passenger');

  const navItems = [
    { id: 'admin',     label: 'Admin',    icon: '🖥️',  desc: 'Dashboard' },
    { id: 'vendor',    label: 'Vendor',   icon: '👤',  desc: 'Panel'     },
    { id: 'passenger', label: 'Order',    icon: '📱',  desc: 'Food'      },
  ];

  const isPassenger = view === 'passenger';

  return (
    <div className="app-root">
      {/* ── Top Nav (desktop) ── */}
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="nav-brand-icon">🚂</span>
          <div>
            <p className="brand-name">IRCTC Pantry System</p>
            <p className="brand-sub">{view === 'passenger' ? 'Passenger Food Ordering' : view === 'vendor' ? 'Vendor Panel' : 'Admin Dashboard'}</p>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
            <button key={n.id} className={`nav-link ${view === n.id ? 'nav-link-active' : ''}`} onClick={() => setView(n.id)}>
              <span className="nav-link-icon">{n.icon}</span>
              <span className="nav-link-text">{n.label}</span>
              <span className="nav-link-desc">{n.desc}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className={`main-content ${isPassenger ? 'main-passenger' : ''}`}>
        {isPassenger ? (
          <div className="passenger-shell">
            <PassengerQR />
          </div>
        ) : (
          <div className="inner-content">
            {view === 'admin'  && <AdminDashboard />}
            {view === 'vendor' && <VendorPanel />}
          </div>
        )}
      </main>

      {/* ── Bottom Tab Nav (mobile) ── */}
      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.id} className={`bottom-tab ${view === n.id ? 'bottom-tab-active' : ''}`} onClick={() => setView(n.id)}>
            <span className="bottom-tab-icon">{n.icon}</span>
            <span className="bottom-tab-label">{n.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; font-family: sans-serif !important; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }

        /* ── App shell: full viewport, nothing overflows ── */
        .app-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          background: #f0f4f8;
        }

        /* ────────────── TOP NAV ────────────── */
        .top-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 1.25rem;
          height: 56px;
          min-height: 56px;
          background: #fff;
          border-bottom: 1px solid #dde3ed;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          flex-shrink: 0;
          z-index: 100;
          overflow: hidden;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-right: 1rem;
          border-right: 1px solid #dde3ed;
          flex-shrink: 0;
        }
        .nav-brand-icon { font-size: 1.3rem; line-height: 1; }
        .brand-name { font-size: 0.85rem; font-weight: 800; color: #0f172a; white-space: nowrap; }
        .brand-sub  { font-size: 0.6rem; color: #94a3b8; white-space: nowrap; }
        .nav-links  { display: flex; gap: 0.25rem; flex-shrink: 0; }
        .nav-link {
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 0.32rem 0.8rem; border-radius: 8px;
          border: 1px solid transparent; background: none; cursor: pointer;
          transition: all 0.15s; flex-shrink: 0;
        }
        .nav-link:hover      { background: #f1f5f9; border-color: #dde3ed; }
        .nav-link-active     { background: #eff6ff; border-color: #bfdbfe; }
        .nav-link-icon       { font-size: 0.85rem; line-height: 1; }
        .nav-link-text       { font-size: 0.75rem; font-weight: 700; color: #374151; white-space: nowrap; }
        .nav-link-active .nav-link-text { color: #1d4ed8; }
        .nav-link-desc       { font-size: 0.55rem; color: #94a3b8; }
        .nav-link-active .nav-link-desc { color: #93c5fd; }

        /* ────────────── MAIN AREA ────────────── */
        .main-content {
          flex: 1;
          min-height: 0;          /* critical for flex children to shrink */
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* Passenger: no scroll on outer, let inner manage it */
        .main-passenger {
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Desktop/tablet: centre the passenger phone card */
        @media (min-width: 641px) {
          .main-passenger {
            align-items: center;
            justify-content: flex-start;
            background: #e5e7eb;
            padding: 24px 0 24px;
            overflow-y: auto;
          }
          .passenger-shell {
            width: 390px;
            height: calc(100vh - 56px - 48px);   /* viewport minus nav minus padding */
            max-height: 820px;
            border-radius: 20px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.18);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: #f9fafb;
            flex-shrink: 0;
          }
        }

        /* Mobile: fill all remaining space */
        @media (max-width: 640px) {
          .passenger-shell {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #f9fafb;
            overflow: hidden;
          }
        }

        /* Dashboard / vendor pages */
        .inner-content {
          padding: 1.25rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* ────────────── BOTTOM NAV (mobile only) ────────────── */
        .bottom-nav { display: none; flex-shrink: 0; }

        @media (max-width: 640px) {
          .nav-links  { display: none; }
          .top-nav {
            padding: 0 1rem;
            height: 50px;
            min-height: 50px;
            justify-content: space-between;
          }
          .nav-brand { border-right: none; padding-right: 0; }

          .bottom-nav {
            display: flex;
            background: #fff;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
            z-index: 100;
            flex-shrink: 0;
          }
          .bottom-tab {
            flex: 1;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 7px 4px 9px;
            border: none; background: none; cursor: pointer; gap: 2px;
          }
          .bottom-tab:active { background: #f9fafb; }
          .bottom-tab-icon  { font-size: 1.2rem; line-height: 1; }
          .bottom-tab-label { font-size: 0.6rem; font-weight: 700; color: #9ca3af; }
          .bottom-tab-active .bottom-tab-label { color: #1d4ed8; }

          .inner-content { padding: 1rem; }
        }

        /* ────────────── VIEW / PAGE HEADER ────────────── */
        .view       { display: flex; flex-direction: column; gap: 1.1rem; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #dde3ed; }
        .page-title  { font-size: 1.2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
        .page-sub    { font-size: 0.73rem; color: #94a3b8; font-weight: 500; }
        .live-pill   { font-size: 0.62rem; font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 99px; border: 1px solid #bfdbfe; white-space: nowrap; }

        /* ────────────── CARDS ────────────── */
        .cards-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 0.65rem; }
        @media(max-width:1100px){ .cards-grid { grid-template-columns: repeat(3,1fr); } }
        @media(max-width:640px) { .cards-grid { grid-template-columns: repeat(2,1fr); } }

        .card       { background:#fff; border:1px solid #dde3ed; border-left:3px solid #3b82f6; border-radius:8px; padding:0.8rem; display:flex; align-items:center; justify-content:space-between; gap:0.6rem; box-shadow:0 1px 2px rgba(0,0,0,0.04); animation:fadeUp 0.35s ease both; }
        .card:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(59,130,246,0.1); }
        .card-left  { display:flex; align-items:center; gap:0.55rem; min-width:0; }
        .card-icon  { width:32px; height:32px; border-radius:7px; background:#eff6ff; display:flex; align-items:center; justify-content:center; font-size:0.9rem; flex-shrink:0; }
        .card-label { font-size:0.59rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.4px; white-space:nowrap; }
        .card-val   { font-size:1.15rem; font-weight:800; color:#0f172a; line-height:1.15; letter-spacing:-0.4px; }
        .card-right { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
        .delta      { font-size:0.62rem; font-weight:700; padding:2px 5px; border-radius:4px; }
        .delta.up   { color:#1d4ed8; background:#eff6ff; }
        .delta.down { color:#1e40af; background:#dbeafe; }
        .delta-sub  { font-size:0.56rem; color:#94a3b8; text-align:right; }

        /* ────────────── TABS ────────────── */
        .tab-bar   { display:flex; gap:0.25rem; border-bottom:2px solid #dde3ed; overflow-x:auto; }
        .tab       { padding:0.45rem 0.85rem; border:none; background:none; cursor:pointer; font-size:0.76rem; font-weight:600; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.15s; white-space:nowrap; display:flex; align-items:center; gap:0.3rem; flex-shrink:0; }
        .tab:hover { color:#1d4ed8; }
        .tab-active { color:#1d4ed8; border-bottom-color:#1d4ed8; }
        .tab-count  { background:#1d4ed8; color:#fff; font-size:0.57rem; font-weight:700; padding:1px 5px; border-radius:99px; }

        /* ────────────── TABLE ────────────── */
        .table-card   { background:#fff; border:1px solid #dde3ed; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .table-header { display:flex; align-items:center; gap:0.6rem; padding:0.85rem 1.1rem; border-bottom:1px solid #f1f5f9; }
        .section-title { font-size:0.85rem; font-weight:700; color:#0f172a; }
        .count-pill   { font-size:0.62rem; font-weight:700; background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:99px; border:1px solid #bfdbfe; }
        .tbl-wrap     { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .tbl          { width:100%; border-collapse:collapse; font-size:0.78rem; }
        .tbl th       { padding:0.5rem 0.85rem; text-align:left; font-weight:700; color:#64748b; text-transform:uppercase; font-size:0.58rem; letter-spacing:0.05em; background:#f8fafc; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
        .tbl td       { padding:0.6rem 0.85rem; border-bottom:1px solid #f1f5f9; color:#374151; }
        .tbl tr:hover td { background:#f8fafc; }
        .tbl-row      { animation:fadeUp 0.22s ease both; }
        .td-id    { font-weight:600; color:#1d4ed8; white-space:nowrap; }
        .td-name  { font-weight:600; color:#0f172a; }
        .td-amt   { font-weight:700; color:#0f172a; }
        .td-items { font-size:0.7rem; color:#64748b; max-width:160px; }
        .td-time  { font-size:0.7rem; color:#94a3b8; white-space:nowrap; }

        /* ────────────── CHIPS / BADGES ────────────── */
        .chip      { font-size:0.63rem; font-weight:700; padding:2px 7px; border-radius:5px; display:inline-block; white-space:nowrap; }
        .chip-blue { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .chip-soft { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
        .badge     { padding:2px 8px; border-radius:99px; font-size:0.61rem; font-weight:700; display:inline-block; white-space:nowrap; }
        .b-active    { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .b-preparing { background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; }
        .b-pending   { background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; }
        .b-suspended { background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; }

        /* ────────────── BUTTONS ────────────── */
        .btn-primary          { padding:0.42rem 1rem; background:#1d4ed8; color:#fff; border:none; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:background 0.15s; }
        .btn-primary:hover    { background:#1e40af; }
        .btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
        .act-btn        { padding:3px 9px; background:transparent; border:1px solid #dde3ed; border-radius:5px; cursor:pointer; font-size:0.68rem; font-weight:600; transition:all 0.15s; }
        .act-ok:hover   { background:#1d4ed8; color:#fff; border-color:#1d4ed8; }
        .act-ok         { color:#1d4ed8; border-color:#bfdbfe; }
        .act-mute       { color:#64748b; border-color:#cbd5e1; }
        .act-mute:hover { background:#64748b; color:#fff; }

        /* ────────────── QTY ────────────── */
        .qty            { display:flex; align-items:center; border:1px solid #bfdbfe; border-radius:6px; overflow:hidden; }
        .qty button     { width:26px; height:26px; border:none; background:#eff6ff; color:#1d4ed8; font-size:0.9rem; font-weight:700; cursor:pointer; }
        .qty button:hover { background:#1d4ed8; color:#fff; }
        .qty span       { padding:0 6px; font-size:0.76rem; font-weight:700; color:#0f172a; min-width:20px; text-align:center; }
        .add-btn        { padding:3px 9px; background:#1d4ed8; color:#fff; border:none; border-radius:5px; font-size:0.68rem; font-weight:700; cursor:pointer; }

        /* ────────────── ORDER GRID ────────────── */
        .order-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:0.7rem; }
        @media(max-width:640px) { .order-grid { grid-template-columns:1fr; } }
        .order-card  { background:#fff; border:1px solid #dde3ed; border-radius:10px; padding:0.85rem; box-shadow:0 1px 3px rgba(0,0,0,0.04); animation:fadeUp 0.28s ease both; }
        .order-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; }
        .order-items { font-size:0.71rem; color:#64748b; margin:0.4rem 0; line-height:1.4; }
        .order-footer { display:flex; justify-content:space-between; align-items:center; margin-top:0.45rem; }
        .order-total  { font-weight:800; font-size:0.92rem; color:#0f172a; }

        /* ────────────── MODAL ────────────── */
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
        @media(min-width:641px){ .overlay { align-items:center; } }
        .drawer  { background:#fff; width:100%; max-width:480px; max-height:92vh; border-radius:16px 16px 0 0; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 -8px 40px rgba(0,0,0,0.18); animation:slideUp 0.25s ease; }
        @media(min-width:641px){ .drawer { border-radius:16px; max-height:88vh; } }
        .drawer-header { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1.1rem; border-bottom:1px solid #dde3ed; flex-shrink:0; }
        .close-btn     { background:none; border:none; cursor:pointer; font-size:1rem; color:#94a3b8; padding:2px 6px; border-radius:4px; }
        .drawer-body   { flex:1; overflow-y:auto; padding:1rem; -webkit-overflow-scrolling:touch; }
        .sticky-bar    { flex-shrink:0; padding:0.75rem 1.1rem; border-top:1px solid #dde3ed; background:#fff; }
        .sticky-count  { font-size:0.66rem; color:#94a3b8; }
        .sticky-total  { font-weight:800; font-size:1rem; color:#0f172a; }

        /* ────────────── FORM ────────────── */
        .field-label { font-size:0.66rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.4px; display:block; margin-bottom:4px; }
        .field-input { width:100%; padding:0.46rem 0.7rem; border:1px solid #dde3ed; border-radius:6px; font-size:0.8rem; color:#0f172a; background:#f8fafc; outline:none; }
        .field-input:focus { border-color:#3b82f6; background:#fff; }

        /* ────────────── MENU LIST (modal) ────────────── */
        .menu-list { display:flex; flex-direction:column; gap:0.38rem; }
        .menu-row  { display:flex; align-items:center; justify-content:space-between; padding:0.52rem 0.7rem; border:1px solid #dde3ed; border-radius:8px; background:#f8fafc; }
        .menu-row:hover { border-color:#bfdbfe; background:#eff6ff; }
        .menu-info  { display:flex; align-items:center; gap:0.5rem; }
        .menu-name  { font-size:0.78rem; font-weight:600; color:#0f172a; }
        .menu-cat   { font-size:0.63rem; color:#94a3b8; }
        .menu-price { font-size:0.78rem; font-weight:700; color:#1d4ed8; margin-right:0.4rem; }

        /* ────────────── COMPLAINT ────────────── */
        .complaint-list  { display:flex; flex-direction:column; gap:0.65rem; padding:0.85rem 1.1rem; }
        .complaint-row   { border:1px solid #dde3ed; border-radius:8px; padding:0.75rem; background:#f8fafc; }
        .complaint-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.32rem; }
        .complaint-name  { font-weight:700; font-size:0.81rem; color:#0f172a; }
        .complaint-meta  { font-size:0.66rem; color:#94a3b8; margin-top:2px; }
        .complaint-issue { font-size:0.76rem; color:#374151; }

        /* ────────────── TOAST ────────────── */
        .toast { background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:0.52rem 1rem; border-radius:8px; font-size:0.78rem; font-weight:600; text-align:center; animation:fadeUp 0.3s ease; }

        /* ────────────── ANIMATIONS ────────────── */
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default PantrySystem;