// import React, { useState } from 'react';
// import PassengerQR from './PassengerQR';

// // ── Data ──────────────────────────────────────────────────────────────────────
// const MENU_ITEMS = [
//   { id: 1, name: 'Veg Thali',       price: 120, category: 'Meal',      emoji: '🍱' },
//   { id: 2, name: 'Non-Veg Thali',   price: 150, category: 'Meal',      emoji: '🍗' },
//   { id: 3, name: 'Samosa (2 pcs)',  price: 30,  category: 'Snack',     emoji: '🥟' },
//   { id: 4, name: 'Bread Omelette',  price: 50,  category: 'Snack',     emoji: '🍳' },
//   { id: 5, name: 'Tea',             price: 15,  category: 'Beverage',  emoji: '☕' },
//   { id: 6, name: 'Water Bottle 1L', price: 20,  category: 'Beverage',  emoji: '💧' },
//   { id: 7, name: 'Cold Coffee',     price: 60,  category: 'Beverage',  emoji: '🥤' },
//   { id: 8, name: 'Upma',            price: 45,  category: 'Breakfast', emoji: '🥣' },
// ];

// const INIT_ORDERS = [
//   { id: 'ORD-001', seat: 'B2-45', coach: 'B2', items: [{ name: 'Veg Thali', qty: 2, price: 120 }], total: 240, status: 'Delivered', time: '09:15 AM', payment: 'UPI' },
//   { id: 'ORD-002', seat: 'S4-12', coach: 'S4', items: [{ name: 'Tea', qty: 3, price: 15 }, { name: 'Samosa (2 pcs)', qty: 2, price: 30 }], total: 105, status: 'Preparing', time: '09:42 AM', payment: 'Cash' },
//   { id: 'ORD-003', seat: 'A1-3',  coach: 'A1', items: [{ name: 'Non-Veg Thali', qty: 1, price: 150 }], total: 150, status: 'Pending', time: '10:05 AM', payment: 'UPI' },
//   { id: 'ORD-004', seat: 'B1-22', coach: 'B1', items: [{ name: 'Water Bottle 1L', qty: 4, price: 20 }, { name: 'Cold Coffee', qty: 2, price: 60 }], total: 200, status: 'Delivered', time: '10:18 AM', payment: 'UPI' },
//   { id: 'ORD-005', seat: 'S2-7',  coach: 'S2', items: [{ name: 'Upma', qty: 2, price: 45 }, { name: 'Tea', qty: 2, price: 15 }], total: 120, status: 'Preparing', time: '10:30 AM', payment: 'Cash' },
// ];

// const INIT_VENDORS = [
//   { id: 'V001', name: 'Ramesh Kumar', train: '12139', sales: 4500, orders: 38, rating: 4.2, status: 'Active' },
//   { id: 'V002', name: 'Suresh Patel', train: '12140', sales: 3200, orders: 29, rating: 3.8, status: 'Active' },
//   { id: 'V003', name: 'Meena Devi',   train: '22105', sales: 5100, orders: 44, rating: 4.6, status: 'Active' },
//   { id: 'V004', name: 'Ajay Singh',   train: '12139', sales: 1800, orders: 16, rating: 3.2, status: 'Suspended' },
// ];

// // ── Badge helper ──────────────────────────────────────────────────────────────
// const badge = (status) => {
//   const s = (status || '').toLowerCase();
//   if (s === 'delivered' || s === 'active')   return 'b-active';
//   if (s === 'preparing')                      return 'b-preparing';
//   if (s === 'pending')                        return 'b-pending';
//   if (s === 'suspended')                      return 'b-suspended';
//   return 'b-pending';
// };

// // ── 1. ADMIN DASHBOARD ────────────────────────────────────────────────────────
// const AdminDashboard = () => {
//   const [tab, setTab]         = useState('orders');
//   const [vendors, setVendors] = useState(INIT_VENDORS);

//   const totalRevenue = INIT_ORDERS.reduce((s, o) => s + o.total, 0);
//   const delivered    = INIT_ORDERS.filter(o => o.status === 'Delivered').length;
//   const pending      = INIT_ORDERS.filter(o => o.status !== 'Delivered').length;

//   const toggleVendor = (id) =>
//     setVendors(v => v.map(x => x.id === id ? { ...x, status: x.status === 'Active' ? 'Suspended' : 'Active' } : x));

//   const cards = [
//     { title: 'Active Trains',   value: 3,                                                 icon: '🚂', change: '+1',   positive: true,  sub: 'vs yesterday'   },
//     { title: "Today's Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`,        icon: '💰', change: '+12%', positive: true,  sub: 'vs last week'   },
//     { title: 'Total Orders',    value: INIT_ORDERS.length,                                icon: '📦', change: `+${INIT_ORDERS.length}`, positive: true, sub: 'today' },
//     { title: 'Active Vendors',  value: vendors.filter(v => v.status === 'Active').length, icon: '👤', change: '+0',   positive: true,  sub: 'on duty'        },
//     { title: 'Delivered',       value: delivered,                                         icon: '✅', change: `${Math.round(delivered / INIT_ORDERS.length * 100)}%`, positive: true, sub: 'completion' },
//     { title: 'Pending',         value: pending,                                           icon: '⏳', change: `${pending}`, positive: false, sub: 'needs attention' },
//   ];

//   return (
//     <div className="view">
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Pantry Admin Dashboard</h1>
//           <span className="page-sub">Indian Railway — NGP Division</span>
//         </div>
//         <span className="live-pill">🟢 LIVE · Train 12139</span>
//       </div>

//       <div className="cards-grid">
//         {cards.map((c, i) => (
//           <div key={c.title} className="card" style={{ animationDelay: `${i * 55}ms` }}>
//             <div className="card-left">
//               <div className="card-icon">{c.icon}</div>
//               <div>
//                 <p className="card-label">{c.title}</p>
//                 <p className="card-val">{c.value}</p>
//               </div>
//             </div>
//             <div className="card-right">
//               <span className={`delta ${c.positive ? 'up' : 'down'}`}>{c.positive ? '↑' : '↓'} {c.change}</span>
//               <span className="delta-sub">{c.sub}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="tab-bar">
//         {[['orders','📦 Orders'],['vendors','👤 Vendors'],['complaints','⚠️ Complaints']].map(([id, label]) => (
//           <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>{label}</button>
//         ))}
//       </div>

//       {tab === 'orders' && (
//         <div className="table-card">
//           <div className="table-header">
//             <span className="section-title">Live Orders</span>
//             <span className="count-pill">{INIT_ORDERS.length} orders</span>
//           </div>
//           <div className="tbl-wrap">
//             <table className="tbl">
//               <thead>
//                 <tr><th>Order ID</th><th>Seat</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th><th>Status</th></tr>
//               </thead>
//               <tbody>
//                 {INIT_ORDERS.map((o, i) => (
//                   <tr key={o.id} className="tbl-row" style={{ animationDelay: `${i * 35}ms` }}>
//                     <td className="td-id">{o.id}</td>
//                     <td><span className="chip chip-blue">{o.seat}</span></td>
//                     <td className="td-items">{o.items.map(it => `${it.name} ×${it.qty}`).join(', ')}</td>
//                     <td className="td-amt">₹{o.total}</td>
//                     <td><span className={`chip ${o.payment === 'UPI' ? 'chip-blue' : 'chip-soft'}`}>{o.payment === 'UPI' ? '📱' : '💵'} {o.payment}</span></td>
//                     <td className="td-time">{o.time}</td>
//                     <td><span className={`badge ${badge(o.status)}`}>{o.status}</span></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {tab === 'vendors' && (
//         <div className="table-card">
//           <div className="table-header">
//             <span className="section-title">Vendor Overview</span>
//             <span className="count-pill">{vendors.length} vendors</span>
//           </div>
//           <div className="tbl-wrap">
//             <table className="tbl">
//               <thead>
//                 <tr><th>ID</th><th>Name</th><th>Train</th><th>Sales</th><th>Orders</th><th>Rating</th><th>Status</th><th>Action</th></tr>
//               </thead>
//               <tbody>
//                 {vendors.map((v, i) => (
//                   <tr key={v.id} className="tbl-row" style={{ animationDelay: `${i * 35}ms` }}>
//                     <td className="td-id">{v.id}</td>
//                     <td className="td-name">{v.name}</td>
//                     <td><span className="chip chip-soft">{v.train}</span></td>
//                     <td className="td-amt">₹{v.sales.toLocaleString('en-IN')}</td>
//                     <td>{v.orders}</td>
//                     <td style={{ fontWeight: 700, color: '#1d4ed8' }}>⭐ {v.rating}</td>
//                     <td><span className={`badge ${badge(v.status)}`}>{v.status}</span></td>
//                     <td>
//                       <button className={`act-btn ${v.status === 'Active' ? 'act-mute' : 'act-ok'}`} onClick={() => toggleVendor(v.id)}>
//                         {v.status === 'Active' ? 'Suspend' : 'Activate'}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {tab === 'complaints' && (
//         <div className="table-card">
//           <div className="table-header">
//             <span className="section-title">Passenger Complaints</span>
//             <span className="count-pill">2 open</span>
//           </div>
//           <div className="complaint-list">
//             {[
//               { name: 'Rahul Sharma', seat: 'B2-12', issue: 'Food was cold and stale', status: 'Open',     time: '09:30 AM' },
//               { name: 'Priya Verma',  seat: 'S3-44', issue: 'Wrong order delivered',   status: 'Open',     time: '10:10 AM' },
//               { name: 'Amit Joshi',   seat: 'A1-7',  issue: 'Charged extra ₹20',       status: 'Resolved', time: '08:55 AM' },
//             ].map((c, i) => (
//               <div key={i} className="complaint-row">
//                 <div className="complaint-top">
//                   <div>
//                     <p className="complaint-name">{c.name}</p>
//                     <p className="complaint-meta">Seat {c.seat} · {c.time}</p>
//                   </div>
//                   <span className={`badge ${c.status === 'Open' ? 'b-suspended' : 'b-active'}`}>{c.status}</span>
//                 </div>
//                 <p className="complaint-issue">{c.issue}</p>
//                 {c.status === 'Open' && (
//                   <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.28rem 0.75rem', fontSize: '0.72rem' }}>
//                     Mark Resolved
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ── 2. VENDOR PANEL ───────────────────────────────────────────────────────────
// const VendorPanel = () => {
//   const [tab, setTab]             = useState('all');
//   const [orders, setOrders]       = useState(INIT_ORDERS);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [cart, setCart]           = useState({});
//   const [coach, setCoach]         = useState('');
//   const [seat, setSeat]           = useState('');
//   const [toast, setToast]         = useState('');

//   const totalSales   = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
//   const pendingCount = orders.filter(o => o.status !== 'Delivered').length;

//   const addItem  = (item) => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
//   const remItem  = (item) => setCart(c => { const n = { ...c }; if (n[item.id] > 1) n[item.id]--; else delete n[item.id]; return n; });
//   const cartTotal = Object.entries(cart).reduce((s, [id, qty]) => s + (MENU_ITEMS.find(m => m.id === +id)?.price || 0) * qty, 0);
//   const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

//   const markStatus = (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

//   const placeOrder = () => {
//     if (!coach || !seat || cartCount === 0) return;
//     const o = {
//       id: `ORD-00${orders.length + 1}`,
//       seat: `${coach}-${seat}`, coach,
//       items: Object.entries(cart).map(([id, qty]) => {
//         const it = MENU_ITEMS.find(m => m.id === +id);
//         return { name: it.name, qty, price: it.price };
//       }),
//       total: cartTotal, status: 'Pending',
//       time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
//       payment: 'UPI',
//     };
//     setOrders(p => [o, ...p]);
//     setCart({}); setCoach(''); setSeat(''); setModalOpen(false);
//     setToast('Order placed successfully!');
//     setTimeout(() => setToast(''), 3000);
//   };

//   const visible = orders.filter(o =>
//     tab === 'all' ? true : tab === 'pending' ? o.status !== 'Delivered' : o.status === 'Delivered'
//   );

//   return (
//     <div className="view">
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Vendor Panel</h1>
//           <span className="page-sub">Welcome, Ramesh Kumar · Train 12139</span>
//         </div>
//         <button className="btn-primary" onClick={() => setModalOpen(true)}>➕ New Order</button>
//       </div>

//       {toast && <div className="toast">{toast}</div>}

//       <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
//         {[
//           { title: "Today's Sales", value: `₹${totalSales.toLocaleString('en-IN')}`, icon: '💰' },
//           { title: 'Total Orders',  value: orders.length,                             icon: '📦' },
//           { title: 'Pending',       value: pendingCount,                              icon: '⏳' },
//         ].map((c, i) => (
//           <div key={c.title} className="card" style={{ animationDelay: `${i * 55}ms` }}>
//             <div className="card-left">
//               <div className="card-icon">{c.icon}</div>
//               <div>
//                 <p className="card-label">{c.title}</p>
//                 <p className="card-val">{c.value}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="tab-bar">
//         {[['all','🏠 All'],['pending','⏳ Pending'],['done','✅ Completed']].map(([id, label]) => (
//           <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
//             {label}
//             {id === 'pending' && pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
//           </button>
//         ))}
//       </div>

//       <div className="order-grid">
//         {visible.map((o, i) => (
//           <div key={o.id} className="order-card" style={{ animationDelay: `${i * 45}ms` }}>
//             <div className="order-top">
//               <div>
//                 <p className="td-id" style={{ margin: 0 }}>{o.id}</p>
//                 <div style={{ display: 'flex', gap: '0.35rem', marginTop: '4px' }}>
//                   <span className="chip chip-blue">{o.seat}</span>
//                   <span className={`chip ${o.payment === 'UPI' ? 'chip-blue' : 'chip-soft'}`}>{o.payment}</span>
//                 </div>
//               </div>
//               <span className={`badge ${badge(o.status)}`}>{o.status}</span>
//             </div>
//             <p className="order-items">{o.items.map(it => `${it.name} ×${it.qty}`).join(' · ')}</p>
//             <div className="order-footer">
//               <span className="order-total">₹{o.total}</span>
//               <div style={{ display: 'flex', gap: '0.35rem' }}>
//                 {o.status === 'Pending'   && <button className="act-btn act-ok"   onClick={() => markStatus(o.id, 'Preparing')}>Start</button>}
//                 {o.status === 'Preparing' && <button className="act-btn act-ok"   onClick={() => markStatus(o.id, 'Delivered')}>✓ Delivered</button>}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* New Order Modal */}
//       {modalOpen && (
//         <div className="overlay" onClick={() => setModalOpen(false)}>
//           <div className="drawer" onClick={e => e.stopPropagation()}>
//             <div className="drawer-header">
//               <span className="section-title">New Order</span>
//               <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
//             </div>
//             <div className="drawer-body">
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
//                 <div>
//                   <label className="field-label">Coach No *</label>
//                   <select className="field-input" value={coach} onChange={e => setCoach(e.target.value)}>
//                     <option value="">Select</option>
//                     {['A1','A2','B1','B2','S1','S2','S3','S4'].map(c => <option key={c}>{c}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="field-label">Seat No *</label>
//                   <input className="field-input" placeholder="e.g. 45" value={seat} onChange={e => setSeat(e.target.value)} />
//                 </div>
//               </div>
//               <label className="field-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Items</label>
//               <div className="menu-list">
//                 {MENU_ITEMS.map(item => (
//                   <div key={item.id} className="menu-row">
//                     <div className="menu-info">
//                       <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
//                       <div>
//                         <p className="menu-name">{item.name}</p>
//                         <p className="menu-cat">{item.category}</p>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                       <span className="menu-price">₹{item.price}</span>
//                       {cart[item.id] ? (
//                         <div className="qty">
//                           <button onClick={() => remItem(item)}>−</button>
//                           <span>{cart[item.id]}</span>
//                           <button onClick={() => addItem(item)}>+</button>
//                         </div>
//                       ) : (
//                         <button className="add-btn" onClick={() => addItem(item)}>+ Add</button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="sticky-bar">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <p className="sticky-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
//                   <p className="sticky-total">₹{cartTotal}</p>
//                 </div>
//                 <button className="btn-primary" disabled={!coach || !seat || cartCount === 0} onClick={placeOrder}>
//                   Confirm Order
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ── ROOT ──────────────────────────────────────────────────────────────────────
// const PantrySystem = () => {
//   const [view, setView] = useState('passenger');

//   const navItems = [
//     { id: 'admin',     label: 'Admin',    icon: '🖥️',  desc: 'Dashboard' },
//     { id: 'vendor',    label: 'Vendor',   icon: '👤',  desc: 'Panel'     },
//     { id: 'passenger', label: 'Order',    icon: '📱',  desc: 'Food'      },
//   ];

//   const isPassenger = view === 'passenger';

//   return (
//     <div className="app-root">
//       {/* ── Top Nav (desktop) ── */}
//       <nav className="top-nav">
//         <div className="nav-brand">
//           <span className="nav-brand-icon">🚂</span>
//           <div>
//             <p className="brand-name">IRCTC Pantry System</p>
//             <p className="brand-sub">{view === 'passenger' ? 'Passenger Food Ordering' : view === 'vendor' ? 'Vendor Panel' : 'Admin Dashboard'}</p>
//           </div>
//         </div>
//         <div className="nav-links">
//           {navItems.map(n => (
//             <button key={n.id} className={`nav-link ${view === n.id ? 'nav-link-active' : ''}`} onClick={() => setView(n.id)}>
//               <span className="nav-link-icon">{n.icon}</span>
//               <span className="nav-link-text">{n.label}</span>
//               <span className="nav-link-desc">{n.desc}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       {/* ── Main content ── */}
//       <main className={`main-content ${isPassenger ? 'main-passenger' : ''}`}>
//         {isPassenger ? (
//           <div className="passenger-shell">
//             <PassengerQR />
//           </div>
//         ) : (
//           <div className="inner-content">
//             {view === 'admin'  && <AdminDashboard />}
//             {view === 'vendor' && <VendorPanel />}
//           </div>
//         )}
//       </main>

//       {/* ── Bottom Tab Nav (mobile) ── */}
//       <nav className="bottom-nav">
//         {navItems.map(n => (
//           <button key={n.id} className={`bottom-tab ${view === n.id ? 'bottom-tab-active' : ''}`} onClick={() => setView(n.id)}>
//             <span className="bottom-tab-icon">{n.icon}</span>
//             <span className="bottom-tab-label">{n.label}</span>
//           </button>
//         ))}
//       </nav>

//       <style>{`
//         /* ── Reset ── */
//         *, *::before, *::after { box-sizing: border-box; font-family: sans-serif !important; margin: 0; padding: 0; }
//         html, body, #root { height: 100%; overflow: hidden; }

//         /* ── App shell: full viewport, nothing overflows ── */
//         .app-root {
//           display: flex;
//           flex-direction: column;
//           height: 100vh;
//           max-height: 100vh;
//           overflow: hidden;
//           background: #f0f4f8;
//         }

//         /* ────────────── TOP NAV ────────────── */
//         .top-nav {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           padding: 0 1.25rem;
//           height: 56px;
//           min-height: 56px;
//           background: #fff;
//           border-bottom: 1px solid #dde3ed;
//           box-shadow: 0 1px 4px rgba(0,0,0,0.06);
//           flex-shrink: 0;
//           z-index: 100;
//           overflow: hidden;
//         }
//         .nav-brand {
//           display: flex;
//           align-items: center;
//           gap: 0.6rem;
//           padding-right: 1rem;
//           border-right: 1px solid #dde3ed;
//           flex-shrink: 0;
//         }
//         .nav-brand-icon { font-size: 1.3rem; line-height: 1; }
//         .brand-name { font-size: 0.85rem; font-weight: 800; color: #0f172a; white-space: nowrap; }
//         .brand-sub  { font-size: 0.6rem; color: #94a3b8; white-space: nowrap; }
//         .nav-links  { display: flex; gap: 0.25rem; flex-shrink: 0; }
//         .nav-link {
//           display: flex; flex-direction: column; align-items: flex-start;
//           padding: 0.32rem 0.8rem; border-radius: 8px;
//           border: 1px solid transparent; background: none; cursor: pointer;
//           transition: all 0.15s; flex-shrink: 0;
//         }
//         .nav-link:hover      { background: #f1f5f9; border-color: #dde3ed; }
//         .nav-link-active     { background: #eff6ff; border-color: #bfdbfe; }
//         .nav-link-icon       { font-size: 0.85rem; line-height: 1; }
//         .nav-link-text       { font-size: 0.75rem; font-weight: 700; color: #374151; white-space: nowrap; }
//         .nav-link-active .nav-link-text { color: #1d4ed8; }
//         .nav-link-desc       { font-size: 0.55rem; color: #94a3b8; }
//         .nav-link-active .nav-link-desc { color: #93c5fd; }

//         /* ────────────── MAIN AREA ────────────── */
//         .main-content {
//           flex: 1;
//           min-height: 0;          /* critical for flex children to shrink */
//           overflow-y: auto;
//           overflow-x: hidden;
//           -webkit-overflow-scrolling: touch;
//         }

//         /* Passenger: no scroll on outer, let inner manage it */
//         .main-passenger {
//           overflow: hidden;
//           display: flex;
//           flex-direction: column;
//         }

//         /* Desktop/tablet: centre the passenger phone card */
//         @media (min-width: 641px) {
//           .main-passenger {
//             align-items: center;
//             justify-content: flex-start;
//             background: #e5e7eb;
//             padding: 24px 0 24px;
//             overflow-y: auto;
//           }
//           .passenger-shell {
//             width: 390px;
//             height: calc(100vh - 56px - 48px);   /* viewport minus nav minus padding */
//             max-height: 820px;
//             border-radius: 20px;
//             box-shadow: 0 8px 40px rgba(0,0,0,0.18);
//             overflow: hidden;
//             display: flex;
//             flex-direction: column;
//             background: #f9fafb;
//             flex-shrink: 0;
//           }
//         }

//         /* Mobile: fill all remaining space */
//         @media (max-width: 640px) {
//           .passenger-shell {
//             width: 100%;
//             height: 100%;
//             display: flex;
//             flex-direction: column;
//             background: #f9fafb;
//             overflow: hidden;
//           }
//         }

//         /* Dashboard / vendor pages */
//         .inner-content {
//           padding: 1.25rem;
//           max-width: 1400px;
//           margin: 0 auto;
//           width: 100%;
//         }

//         /* ────────────── BOTTOM NAV (mobile only) ────────────── */
//         .bottom-nav { display: none; flex-shrink: 0; }

//         @media (max-width: 640px) {
//           .nav-links  { display: none; }
//           .top-nav {
//             padding: 0 1rem;
//             height: 50px;
//             min-height: 50px;
//             justify-content: space-between;
//           }
//           .nav-brand { border-right: none; padding-right: 0; }

//           .bottom-nav {
//             display: flex;
//             background: #fff;
//             border-top: 1px solid #e5e7eb;
//             box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
//             z-index: 100;
//             flex-shrink: 0;
//           }
//           .bottom-tab {
//             flex: 1;
//             display: flex; flex-direction: column;
//             align-items: center; justify-content: center;
//             padding: 7px 4px 9px;
//             border: none; background: none; cursor: pointer; gap: 2px;
//           }
//           .bottom-tab:active { background: #f9fafb; }
//           .bottom-tab-icon  { font-size: 1.2rem; line-height: 1; }
//           .bottom-tab-label { font-size: 0.6rem; font-weight: 700; color: #9ca3af; }
//           .bottom-tab-active .bottom-tab-label { color: #1d4ed8; }

//           .inner-content { padding: 1rem; }
//         }

//         /* ────────────── VIEW / PAGE HEADER ────────────── */
//         .view       { display: flex; flex-direction: column; gap: 1.1rem; }
//         .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #dde3ed; }
//         .page-title  { font-size: 1.2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
//         .page-sub    { font-size: 0.73rem; color: #94a3b8; font-weight: 500; }
//         .live-pill   { font-size: 0.62rem; font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 99px; border: 1px solid #bfdbfe; white-space: nowrap; }

//         /* ────────────── CARDS ────────────── */
//         .cards-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 0.65rem; }
//         @media(max-width:1100px){ .cards-grid { grid-template-columns: repeat(3,1fr); } }
//         @media(max-width:640px) { .cards-grid { grid-template-columns: repeat(2,1fr); } }

//         .card       { background:#fff; border:1px solid #dde3ed; border-left:3px solid #3b82f6; border-radius:8px; padding:0.8rem; display:flex; align-items:center; justify-content:space-between; gap:0.6rem; box-shadow:0 1px 2px rgba(0,0,0,0.04); animation:fadeUp 0.35s ease both; }
//         .card:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(59,130,246,0.1); }
//         .card-left  { display:flex; align-items:center; gap:0.55rem; min-width:0; }
//         .card-icon  { width:32px; height:32px; border-radius:7px; background:#eff6ff; display:flex; align-items:center; justify-content:center; font-size:0.9rem; flex-shrink:0; }
//         .card-label { font-size:0.59rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.4px; white-space:nowrap; }
//         .card-val   { font-size:1.15rem; font-weight:800; color:#0f172a; line-height:1.15; letter-spacing:-0.4px; }
//         .card-right { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; }
//         .delta      { font-size:0.62rem; font-weight:700; padding:2px 5px; border-radius:4px; }
//         .delta.up   { color:#1d4ed8; background:#eff6ff; }
//         .delta.down { color:#1e40af; background:#dbeafe; }
//         .delta-sub  { font-size:0.56rem; color:#94a3b8; text-align:right; }

//         /* ────────────── TABS ────────────── */
//         .tab-bar   { display:flex; gap:0.25rem; border-bottom:2px solid #dde3ed; overflow-x:auto; }
//         .tab       { padding:0.45rem 0.85rem; border:none; background:none; cursor:pointer; font-size:0.76rem; font-weight:600; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.15s; white-space:nowrap; display:flex; align-items:center; gap:0.3rem; flex-shrink:0; }
//         .tab:hover { color:#1d4ed8; }
//         .tab-active { color:#1d4ed8; border-bottom-color:#1d4ed8; }
//         .tab-count  { background:#1d4ed8; color:#fff; font-size:0.57rem; font-weight:700; padding:1px 5px; border-radius:99px; }

//         /* ────────────── TABLE ────────────── */
//         .table-card   { background:#fff; border:1px solid #dde3ed; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
//         .table-header { display:flex; align-items:center; gap:0.6rem; padding:0.85rem 1.1rem; border-bottom:1px solid #f1f5f9; }
//         .section-title { font-size:0.85rem; font-weight:700; color:#0f172a; }
//         .count-pill   { font-size:0.62rem; font-weight:700; background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:99px; border:1px solid #bfdbfe; }
//         .tbl-wrap     { overflow-x:auto; -webkit-overflow-scrolling:touch; }
//         .tbl          { width:100%; border-collapse:collapse; font-size:0.78rem; }
//         .tbl th       { padding:0.5rem 0.85rem; text-align:left; font-weight:700; color:#64748b; text-transform:uppercase; font-size:0.58rem; letter-spacing:0.05em; background:#f8fafc; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
//         .tbl td       { padding:0.6rem 0.85rem; border-bottom:1px solid #f1f5f9; color:#374151; }
//         .tbl tr:hover td { background:#f8fafc; }
//         .tbl-row      { animation:fadeUp 0.22s ease both; }
//         .td-id    { font-weight:600; color:#1d4ed8; white-space:nowrap; }
//         .td-name  { font-weight:600; color:#0f172a; }
//         .td-amt   { font-weight:700; color:#0f172a; }
//         .td-items { font-size:0.7rem; color:#64748b; max-width:160px; }
//         .td-time  { font-size:0.7rem; color:#94a3b8; white-space:nowrap; }

//         /* ────────────── CHIPS / BADGES ────────────── */
//         .chip      { font-size:0.63rem; font-weight:700; padding:2px 7px; border-radius:5px; display:inline-block; white-space:nowrap; }
//         .chip-blue { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
//         .chip-soft { background:#f8fafc; color:#475569; border:1px solid #e2e8f0; }
//         .badge     { padding:2px 8px; border-radius:99px; font-size:0.61rem; font-weight:700; display:inline-block; white-space:nowrap; }
//         .b-active    { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
//         .b-preparing { background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; }
//         .b-pending   { background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc; }
//         .b-suspended { background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; }

//         /* ────────────── BUTTONS ────────────── */
//         .btn-primary          { padding:0.42rem 1rem; background:#1d4ed8; color:#fff; border:none; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:background 0.15s; }
//         .btn-primary:hover    { background:#1e40af; }
//         .btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
//         .act-btn        { padding:3px 9px; background:transparent; border:1px solid #dde3ed; border-radius:5px; cursor:pointer; font-size:0.68rem; font-weight:600; transition:all 0.15s; }
//         .act-ok:hover   { background:#1d4ed8; color:#fff; border-color:#1d4ed8; }
//         .act-ok         { color:#1d4ed8; border-color:#bfdbfe; }
//         .act-mute       { color:#64748b; border-color:#cbd5e1; }
//         .act-mute:hover { background:#64748b; color:#fff; }

//         /* ────────────── QTY ────────────── */
//         .qty            { display:flex; align-items:center; border:1px solid #bfdbfe; border-radius:6px; overflow:hidden; }
//         .qty button     { width:26px; height:26px; border:none; background:#eff6ff; color:#1d4ed8; font-size:0.9rem; font-weight:700; cursor:pointer; }
//         .qty button:hover { background:#1d4ed8; color:#fff; }
//         .qty span       { padding:0 6px; font-size:0.76rem; font-weight:700; color:#0f172a; min-width:20px; text-align:center; }
//         .add-btn        { padding:3px 9px; background:#1d4ed8; color:#fff; border:none; border-radius:5px; font-size:0.68rem; font-weight:700; cursor:pointer; }

//         /* ────────────── ORDER GRID ────────────── */
//         .order-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:0.7rem; }
//         @media(max-width:640px) { .order-grid { grid-template-columns:1fr; } }
//         .order-card  { background:#fff; border:1px solid #dde3ed; border-radius:10px; padding:0.85rem; box-shadow:0 1px 3px rgba(0,0,0,0.04); animation:fadeUp 0.28s ease both; }
//         .order-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem; }
//         .order-items { font-size:0.71rem; color:#64748b; margin:0.4rem 0; line-height:1.4; }
//         .order-footer { display:flex; justify-content:space-between; align-items:center; margin-top:0.45rem; }
//         .order-total  { font-weight:800; font-size:0.92rem; color:#0f172a; }

//         /* ────────────── MODAL ────────────── */
//         .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
//         @media(min-width:641px){ .overlay { align-items:center; } }
//         .drawer  { background:#fff; width:100%; max-width:480px; max-height:92vh; border-radius:16px 16px 0 0; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 -8px 40px rgba(0,0,0,0.18); animation:slideUp 0.25s ease; }
//         @media(min-width:641px){ .drawer { border-radius:16px; max-height:88vh; } }
//         .drawer-header { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1.1rem; border-bottom:1px solid #dde3ed; flex-shrink:0; }
//         .close-btn     { background:none; border:none; cursor:pointer; font-size:1rem; color:#94a3b8; padding:2px 6px; border-radius:4px; }
//         .drawer-body   { flex:1; overflow-y:auto; padding:1rem; -webkit-overflow-scrolling:touch; }
//         .sticky-bar    { flex-shrink:0; padding:0.75rem 1.1rem; border-top:1px solid #dde3ed; background:#fff; }
//         .sticky-count  { font-size:0.66rem; color:#94a3b8; }
//         .sticky-total  { font-weight:800; font-size:1rem; color:#0f172a; }

//         /* ────────────── FORM ────────────── */
//         .field-label { font-size:0.66rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.4px; display:block; margin-bottom:4px; }
//         .field-input { width:100%; padding:0.46rem 0.7rem; border:1px solid #dde3ed; border-radius:6px; font-size:0.8rem; color:#0f172a; background:#f8fafc; outline:none; }
//         .field-input:focus { border-color:#3b82f6; background:#fff; }

//         /* ────────────── MENU LIST (modal) ────────────── */
//         .menu-list { display:flex; flex-direction:column; gap:0.38rem; }
//         .menu-row  { display:flex; align-items:center; justify-content:space-between; padding:0.52rem 0.7rem; border:1px solid #dde3ed; border-radius:8px; background:#f8fafc; }
//         .menu-row:hover { border-color:#bfdbfe; background:#eff6ff; }
//         .menu-info  { display:flex; align-items:center; gap:0.5rem; }
//         .menu-name  { font-size:0.78rem; font-weight:600; color:#0f172a; }
//         .menu-cat   { font-size:0.63rem; color:#94a3b8; }
//         .menu-price { font-size:0.78rem; font-weight:700; color:#1d4ed8; margin-right:0.4rem; }

//         /* ────────────── COMPLAINT ────────────── */
//         .complaint-list  { display:flex; flex-direction:column; gap:0.65rem; padding:0.85rem 1.1rem; }
//         .complaint-row   { border:1px solid #dde3ed; border-radius:8px; padding:0.75rem; background:#f8fafc; }
//         .complaint-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.32rem; }
//         .complaint-name  { font-weight:700; font-size:0.81rem; color:#0f172a; }
//         .complaint-meta  { font-size:0.66rem; color:#94a3b8; margin-top:2px; }
//         .complaint-issue { font-size:0.76rem; color:#374151; }

//         /* ────────────── TOAST ────────────── */
//         .toast { background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; padding:0.52rem 1rem; border-radius:8px; font-size:0.78rem; font-weight:600; text-align:center; animation:fadeUp 0.3s ease; }

//         /* ────────────── ANIMATIONS ────────────── */
//         @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
//       `}</style>
//     </div>
//   );
// };

// export default PantrySystem;




















import { useState, useEffect, useRef, useCallback } from "react";
import logo from './assets/logo.png';
/* ══════════════════════════════════════════════════════════════
   SHARED STORE — real-time pub/sub
══════════════════════════════════════════════════════════════ */
let _state = {
  orders: [
    { id:'ORD-001', trainNo:'12139', seat:'B2-45', coach:'B2', items:[{name:'Veg Thali',qty:2,price:120}], total:240, status:'Delivered', time:'09:15 AM', payment:'UPI', vendorId:'V001', agentId:'D001', passengerName:'Rahul S.' },
    { id:'ORD-002', trainNo:'12139', seat:'S4-12', coach:'S4', items:[{name:'Tea',qty:3,price:15},{name:'Samosa (2 pcs)',qty:2,price:30}], total:105, status:'Preparing', time:'09:42 AM', payment:'Cash', vendorId:'V002', agentId:null, passengerName:'Priya V.' },
    { id:'ORD-003', trainNo:'12139', seat:'A1-3',  coach:'A1', items:[{name:'Non-Veg Thali',qty:1,price:150}], total:150, status:'Pending', time:'10:05 AM', payment:'UPI', vendorId:null, agentId:null, passengerName:'Amit J.' },
    { id:'ORD-004', trainNo:'12139', seat:'B1-22', coach:'B1', items:[{name:'Water Bottle 1L',qty:4,price:20},{name:'Cold Coffee',qty:2,price:60}], total:200, status:'Delivered', time:'10:18 AM', payment:'UPI', vendorId:'V001', agentId:'D002', passengerName:'Sunita R.' },
    { id:'ORD-005', trainNo:'12139', seat:'S2-7',  coach:'S2', items:[{name:'Upma',qty:2,price:45},{name:'Tea',qty:2,price:15}], total:120, status:'Preparing', time:'10:30 AM', payment:'Cash', vendorId:'V002', agentId:null, passengerName:'Vikram S.' },
  ],
  complaints: [
    { id:'C001', name:'Rahul Sharma', seat:'B2-12', trainNo:'12139', issue:'Food was cold and stale', status:'Open', time:'09:30 AM' },
    { id:'C002', name:'Priya Verma',  seat:'S3-44', trainNo:'12139', issue:'Wrong order delivered',   status:'Open', time:'10:10 AM' },
    { id:'C003', name:'Amit Joshi',   seat:'A1-7',  trainNo:'12139', issue:'Charged extra ₹20',       status:'Resolved', time:'08:55 AM' },
  ],
  feedback: [
    { id:'F001', name:'Sunita Rao',   seat:'B1-5',  trainNo:'12139', rating:5, message:'Excellent food! Very hot and tasty.', time:'10:00 AM' },
    { id:'F002', name:'Vikram Singh', seat:'S2-18', trainNo:'12139', rating:4, message:'Good food, slight delay but acceptable.', time:'10:45 AM' },
  ],
  qrCodes: [
    { id:'QR001', trainNo:'12139', trainName:'Sewagram Express',  createdAt:'08:00 AM', active:true },
    { id:'QR002', trainNo:'22105', trainName:'Vidarbha Express',  createdAt:'07:30 AM', active:true },
  ],
  vendors: [
    { id:'V001', name:'Ramesh Kumar', train:'12139', sales:4500, rating:4.2, status:'Active' },
    { id:'V002', name:'Suresh Patel', train:'12139', sales:3200, rating:3.8, status:'Active' },
    { id:'V003', name:'Meena Devi',   train:'22105', sales:5100, rating:4.6, status:'Active' },
    { id:'V004', name:'Ajay Singh',   train:'12139', sales:1800, rating:3.2, status:'Suspended' },
  ],
  agents: [
    { id:'D001', name:'Raju Yadav', train:'12139', status:'Active', deliveries:22 },
    { id:'D002', name:'Mohan Das',  train:'12139', status:'Active', deliveries:18 },
  ],
};

const _listeners = new Set();
const notify = () => _listeners.forEach(fn => fn({ ..._state }));
const subscribe = (fn) => { _listeners.add(fn); return () => _listeners.delete(fn); };
const getState = () => _state;

const actions = {
  addOrder:        (order) => { _state = { ..._state, orders:[order,..._state.orders] }; notify(); },
  updateOrder:     (id, patch) => { _state = { ..._state, orders:_state.orders.map(o=>o.id===id?{...o,...patch}:o) }; notify(); },
  resolveComplaint:(id) => { _state = { ..._state, complaints:_state.complaints.map(c=>c.id===id?{...c,status:'Resolved'}:c) }; notify(); },
  addComplaint:    (c) => { _state = { ..._state, complaints:[c,..._state.complaints] }; notify(); },
  addFeedback:     (f) => { _state = { ..._state, feedback:[f,..._state.feedback] }; notify(); },
  addQR:           (qr) => { _state = { ..._state, qrCodes:[qr,..._state.qrCodes] }; notify(); },
  toggleVendor:    (id) => { _state = { ..._state, vendors:_state.vendors.map(v=>v.id===id?{...v,status:v.status==='Active'?'Suspended':'Active'}:v) }; notify(); },
};

function useStore(selector) {
  const [val, setVal] = useState(() => selector(getState()));
  useEffect(() => {
    setVal(selector(getState()));
    return subscribe((s) => setVal(selector(s)));
  }, []);
  return val;
}

/* ══════════════════════════════════════════════════════════════
   MENU DATA
══════════════════════════════════════════════════════════════ */
const MENU = [
  { id:1,  name:"Veg Thali",       price:120, cat:"Meal",      emoji:"🍱", popular:true,  veg:true,  desc:"Dal, sabzi, roti, rice & pickle" },
  { id:2,  name:"Non-Veg Thali",   price:150, cat:"Meal",      emoji:"🍗", popular:true,  veg:false, desc:"Chicken curry, roti, rice & salad" },
  { id:3,  name:"Paneer Thali",    price:140, cat:"Meal",      emoji:"🧀", popular:false, veg:true,  desc:"Paneer masala, 3 rotis & rice" },
  { id:4,  name:"Samosa (2 pcs)",  price:30,  cat:"Snack",     emoji:"🥟", popular:true,  veg:true,  desc:"Crispy fried with mint chutney" },
  { id:5,  name:"Vada Pav",        price:25,  cat:"Snack",     emoji:"🥙", popular:true,  veg:true,  desc:"Mumbai style with garlic chutney" },
  { id:6,  name:"Bread Omelette",  price:50,  cat:"Snack",     emoji:"🍳", popular:false, veg:false, desc:"2 eggs, butter toast & ketchup" },
  { id:7,  name:"Poha",            price:40,  cat:"Breakfast", emoji:"🍚", popular:true,  veg:true,  desc:"Flattened rice with onion & peanuts" },
  { id:8,  name:"Upma",            price:45,  cat:"Breakfast", emoji:"🥣", popular:false, veg:true,  desc:"Semolina with veggies & mustard" },
  { id:9,  name:"Tea",             price:15,  cat:"Beverage",  emoji:"☕", popular:true,  veg:true,  desc:"Masala chai — ginger & cardamom" },
  { id:10, name:"Cold Coffee",     price:60,  cat:"Beverage",  emoji:"🥤", popular:false, veg:true,  desc:"Chilled with milk & sugar" },
  { id:11, name:"Water Bottle 1L", price:20,  cat:"Beverage",  emoji:"💧", popular:false, veg:true,  desc:"Bisleri sealed 1 litre bottle" },
  { id:12, name:"Idli Sambhar",    price:55,  cat:"Breakfast", emoji:"🫓", popular:false, veg:true,  desc:"3 idlis with hot sambhar & chutney" },
];

const COACH_GROUPS = [
  { label:'AC Classes', coaches:['1A','2A','3A'] },
  { label:'Sleeper',    coaches:['SL'] },
  { label:'General',   coaches:['S1','S2','S3','S4','S5','S6'] },
  { label:'Reserved',  coaches:['A1','A2','B1','B2','B3','B4'] },
];
const ALL_COACHES = COACH_GROUPS.flatMap(g => g.coaches);
const SEAT_ROWS = [
  [1,2,3,4,5,6,7,8],[9,10,11,12,13,14,15,16],[17,18,19,20,21,22,23,24],
  [25,26,27,28,29,30,31,32],[33,34,35,36,37,38,39,40],[41,42,43,44,45,46,47,48],
  [49,50,51,52,53,54,55,56],[57,58,59,60,61,62,63,64],[65,66,67,68,69,70,71,72],
];
const CATS       = ["All","Meal","Snack","Breakfast","Beverage"];
const TRAIN_NAMES = { "12139":"Sewagram Express","12140":"Maharashtra Express","22105":"Vidarbha Express","12859":"Gitanjali Express","12809":"Mumbai Mail" };

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const T = {
  orange:'#e65c00', orangeLight:'#fff7ed', orangeBorder:'#fed7aa',
  blue:'#1d4ed8',   blueLight:'#eff6ff',   blueBorder:'#bfdbfe',
  green:'#16a34a',  greenLight:'#f0fdf4',  greenBorder:'#bbf7d0',
  red:'#dc2626',    redLight:'#fef2f2',    redBorder:'#fecaca',
  purple:'#7c3aed', purpleLight:'#f5f3ff', purpleBorder:'#ddd6fe',
  gray:'#6b7280',   grayLight:'#f9fafb',   grayBorder:'#e5e7eb',
  text:'#111827', textMid:'#374151', textSub:'#6b7280', textLight:'#9ca3af',
  white:'#ffffff', bg:'#f0f4f8',
};

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const badgeCls = (s) => {
  const m = { delivered:'b-green', active:'b-green', preparing:'b-blue', pending:'b-yellow',
    suspended:'b-red', open:'b-red', resolved:'b-green', 'out for delivery':'b-purple', packed:'b-blue' };
  return m[(s||'').toLowerCase()] || 'b-yellow';
};
const genId = (prefix) => prefix + '-' + Math.floor(1000 + Math.random()*9000);
const now   = () => new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

/* ══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════ */
const Badge = ({ label, status }) => (
  <span className={`badge ${badgeCls(status||label)}`}>{label}</span>
);

const Chip = ({ children, color='blue' }) => (
  <span className={`chip chip-${color}`}>{children}</span>
);

const Card = ({ icon, label, value, sub, accent='blue', delay=0 }) => (
  <div className={`stat-card accent-${accent}`} style={{animationDelay:`${delay}ms`}}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <p className="stat-val">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div className="tab-bar">
    {tabs.map(([id,label,count]) => (
      <button key={id} className={`tab ${active===id?'tab-active':''}`} onClick={()=>onChange(id)}>
        {label}
        {count>0 && <span className="tab-badge">{count}</span>}
      </button>
    ))}
  </div>
);

const Section = ({ title, count, children, action }) => (
  <div className="section-card">
    <div className="section-head">
      <span className="section-title">{title}</span>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        {count!=null && <span className="count-pill">{count}</span>}
        {action}
      </div>
    </div>
    {children}
  </div>
);

const QtyCtrl = ({ item, cart, onAdd, onRem }) => {
  const q = cart[item.id] || 0;
  if (!q) return <button className="add-btn" onClick={()=>onAdd(item)}>+ ADD</button>;
  return (
    <div className="qty-ctrl">
      <button onClick={()=>onRem(item)}>−</button>
      <span>{q}</span>
      <button onClick={()=>onAdd(item)}>+</button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   QR CODE SVG COMPONENT
══════════════════════════════════════════════════════════════ */
const QRCode = ({ trainNo, size=120, color='#1d4ed8' }) => {
  const cells = [];
  for (let r=0; r<21; r++) for (let c=0; c<21; c++) {
    const inFinder = (r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);
    const data = !inFinder && ((r+c+parseInt(trainNo||'0',10))%3!==0);
    if (inFinder||data) cells.push(<rect key={`${r}-${c}`} x={c*4} y={r*4} width={3.5} height={3.5} fill={color} rx={0.5}/>);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 84 84">
      <rect width={84} height={84} fill="white" rx={6}/>
      {cells}
      <rect x={31} y={31} width={22} height={22} fill={color} rx={3}/>
      <rect x={34} y={34} width={16} height={16} fill="white" rx={2}/>
      <text x={42} y={46} textAnchor="middle" fontSize={8} fontWeight="bold" fill={color}>IR</text>
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════
   1. ADMIN DASHBOARD
══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const orders     = useStore(s => s.orders);
  const vendors    = useStore(s => s.vendors);
  const complaints = useStore(s => s.complaints);
  const feedback   = useStore(s => s.feedback);
  const qrCodes    = useStore(s => s.qrCodes);
  const [tab, setTab]           = useState('orders');
  const [showQR, setShowQR]     = useState(false);
  const [newTrain, setNewTrain] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newToast, setNewToast] = useState('');

  const totalRev  = orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.total,0);
  const delivered = orders.filter(o=>o.status==='Delivered').length;
  const pending   = orders.filter(o=>o.status==='Pending').length;
  const open      = complaints.filter(c=>c.status==='Open').length;

  const toast = (msg) => { setNewToast(msg); setTimeout(()=>setNewToast(''),3000); };

  const genQR = () => {
    if (!newTrain.trim()) return;
    actions.addQR({ id:genId('QR'), trainNo:newTrain, trainName:newTrainName||TRAIN_NAMES[newTrain]||'Express Train', createdAt:now(), active:true });
    setNewTrain(''); setNewTrainName(''); setShowQR(false);
    toast('QR Code generated successfully!');
  };

  return (
    <div className="view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <span className="page-sub">NGP Division · Indian Railways</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span className="live-pill">🟢 LIVE</span>
          <button className="btn-primary" onClick={()=>setShowQR(true)}>📲 Generate QR</button>
        </div>
      </div>

      {newToast && <div className="toast toast-green">{newToast}</div>}

      <div className="cards-grid">
        <Card icon="🚂" label="Active Trains"   value={3}                                                     accent="blue"   delay={0}   />
        <Card icon="💰" label="Revenue Today"    value={`₹${totalRev.toLocaleString('en-IN')}`}               accent="green"  delay={60}  />
        <Card icon="📦" label="Total Orders"     value={orders.length}                                         accent="orange" delay={120} />
        <Card icon="✅" label="Delivered"         value={delivered} sub={`${Math.round(delivered/orders.length*100)}% rate`} accent="green" delay={180} />
        <Card icon="⏳" label="Pending"           value={pending}                                               accent="yellow" delay={240} />
        <Card icon="⚠️" label="Open Complaints"  value={open}                                                  accent="red"    delay={300} />
      </div>

      <TabBar
        tabs={[['orders','📦 Orders',0],['vendors','👤 Vendors',0],['qr','📲 QR Codes',0],['complaints','⚠️ Complaints',open],['feedback','⭐ Feedback',0]]}
        active={tab} onChange={setTab}
      />

      {tab==='orders' && (
        <Section title="Live Orders" count={orders.length}>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Order ID</th><th>Train</th><th>Seat</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o,i) => (
                  <tr key={o.id} className="tbl-row" style={{animationDelay:`${i*30}ms`}}>
                    <td className="td-id">{o.id}</td>
                    <td><Chip color="soft">🚂 {o.trainNo}</Chip></td>
                    <td><Chip>{o.seat}</Chip></td>
                    <td className="td-items">{o.items.map(it=>`${it.name} ×${it.qty}`).join(', ')}</td>
                    <td className="td-amt">₹{o.total}</td>
                    <td><Chip color={o.payment==='UPI'?'blue':'soft'}>{o.payment==='UPI'?'📱':'💵'} {o.payment}</Chip></td>
                    <td className="td-time">{o.time}</td>
                    <td><Badge label={o.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab==='vendors' && (
        <Section title="Vendor Overview" count={vendors.length}>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>ID</th><th>Name</th><th>Train</th><th>Sales</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {vendors.map((v,i) => (
                  <tr key={v.id} className="tbl-row" style={{animationDelay:`${i*30}ms`}}>
                    <td className="td-id">{v.id}</td>
                    <td className="td-name">{v.name}</td>
                    <td><Chip color="soft">{v.train}</Chip></td>
                    <td className="td-amt">₹{v.sales.toLocaleString('en-IN')}</td>
                    <td style={{fontWeight:700,color:T.blue}}>⭐ {v.rating}</td>
                    <td><Badge label={v.status}/></td>
                    <td>
                      <button className={`act-btn ${v.status==='Active'?'act-mute':'act-ok'}`} onClick={()=>actions.toggleVendor(v.id)}>
                        {v.status==='Active'?'Suspend':'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab==='qr' && (
        <Section title="QR Code Management" count={qrCodes.length}
          action={<button className="btn-primary" style={{fontSize:'0.72rem',padding:'4px 12px'}} onClick={()=>setShowQR(true)}>+ New QR</button>}>
          <div style={{padding:'1rem',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'1rem'}}>
            {qrCodes.map((qr,i) => (
              <div key={qr.id} className="qr-card" style={{animationDelay:`${i*60}ms`}}>
                <div className="qr-header">
                  <div>
                    <p className="td-id">Train {qr.trainNo}</p>
                    <p style={{fontSize:'0.75rem',fontWeight:600,color:T.textMid}}>{qr.trainName}</p>
                    <p style={{fontSize:'0.62rem',color:T.textLight,marginTop:2}}>Created {qr.createdAt}</p>
                  </div>
                  <Badge label={qr.active?'Active':'Inactive'} status={qr.active?'active':'suspended'}/>
                </div>
                <div style={{display:'flex',justifyContent:'center',padding:'12px 0'}}>
                  <div style={{padding:10,background:'#fff',borderRadius:8,border:`1px solid ${T.grayBorder}`,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                    <QRCode trainNo={qr.trainNo} size={110}/>
                    <p style={{textAlign:'center',fontSize:'0.58rem',color:T.textLight,marginTop:4,fontFamily:'monospace'}}>irctc.pantry/{qr.trainNo}</p>
                  </div>
                </div>
                <p style={{textAlign:'center',fontSize:'0.65rem',color:T.textSub,padding:'0 8px 8px'}}>Scan to order food on Train {qr.trainNo}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab==='complaints' && (
        <Section title="Passenger Complaints" count={open}>
          <div style={{padding:'0.85rem 1rem',display:'flex',flexDirection:'column',gap:'0.65rem'}}>
            {complaints.map((c,i) => (
              <div key={c.id} className="complaint-row" style={{animationDelay:`${i*40}ms`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:'0.83rem',color:T.text}}>{c.name}</p>
                    <p style={{fontSize:'0.65rem',color:T.textLight}}>Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
                  </div>
                  <Badge label={c.status}/>
                </div>
                <p style={{fontSize:'0.76rem',color:T.textMid}}>{c.issue}</p>
                {c.status==='Open' && (
                  <button className="btn-primary" style={{marginTop:8,padding:'4px 12px',fontSize:'0.7rem'}} onClick={()=>actions.resolveComplaint(c.id)}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            ))}
            {complaints.length===0 && <p style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No complaints 🎉</p>}
          </div>
        </Section>
      )}

      {tab==='feedback' && (
        <Section title="Passenger Feedback" count={feedback.length}>
          <div style={{padding:'0.85rem 1rem',display:'flex',flexDirection:'column',gap:'0.65rem'}}>
            {feedback.map((f,i) => (
              <div key={f.id} className="complaint-row" style={{animationDelay:`${i*40}ms`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:'0.83rem',color:T.text}}>{f.name}</p>
                    <p style={{fontSize:'0.65rem',color:T.textLight}}>Seat {f.seat} · {f.time}</p>
                  </div>
                  <span style={{fontSize:'1rem',color:'#f59e0b',letterSpacing:2}}>{stars(f.rating)}</span>
                </div>
                <p style={{fontSize:'0.76rem',color:T.textMid,fontStyle:'italic'}}>"{f.message}"</p>
              </div>
            ))}
            {feedback.length===0 && <p style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No feedback yet</p>}
          </div>
        </Section>
      )}

      {showQR && (
        <div className="overlay" onClick={()=>setShowQR(false)}>
          <div className="drawer" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">📲 Generate QR Code</span>
              <button className="close-btn" onClick={()=>setShowQR(false)}>✕</button>
            </div>
            <div style={{padding:'1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label className="field-label">Train Number *</label>
                <input className="field-input" placeholder="e.g. 12139" value={newTrain}
                  onChange={e=>{setNewTrain(e.target.value);setNewTrainName(TRAIN_NAMES[e.target.value]||'');}}/>
              </div>
              <div>
                <label className="field-label">Train Name</label>
                <input className="field-input" placeholder="e.g. Sewagram Express" value={newTrainName} onChange={e=>setNewTrainName(e.target.value)}/>
              </div>
              {newTrain && (
                <div style={{display:'flex',justifyContent:'center',padding:'1rem',background:T.grayLight,borderRadius:12,border:`1px solid ${T.grayBorder}`}}>
                  <div style={{textAlign:'center'}}>
                    <QRCode trainNo={newTrain} size={140}/>
                    <p style={{fontSize:'0.65rem',color:T.textSub,marginTop:6}}>irctc.pantry/{newTrain}</p>
                  </div>
                </div>
              )}
              <button className="btn-primary" disabled={!newTrain} onClick={genQR} style={{width:'100%',padding:'12px',fontSize:'0.85rem'}}>
                Generate & Save QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   2. VENDOR PANEL
══════════════════════════════════════════════════════════════ */
const VendorPanel = () => {
  const orders = useStore(s => s.orders.filter(o => o.trainNo === '12139'));
  const [tab, setTab]         = useState('active');
  const [showNew, setShowNew] = useState(false);
  const [cart, setCart]       = useState({});
  const [coach, setCoach]     = useState('');
  const [seat, setSeat]       = useState('');
  const [pname, setPname]     = useState('');
  const [pay, setPay]         = useState('UPI');
  const [toast, setToast]     = useState('');

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''),3000); };

  const totalSales = orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.total,0);
  const pending    = orders.filter(o=>o.status==='Pending').length;
  const preparing  = orders.filter(o=>o.status==='Preparing').length;

  const addItem = (item) => setCart(c=>({...c,[item.id]:(c[item.id]||0)+1}));
  const remItem = (item) => setCart(c=>{const n={...c};if(n[item.id]>1)n[item.id]--;else delete n[item.id];return n;});
  const cartTotal = Object.entries(cart).reduce((s,[id,q])=>s+(MENU.find(m=>m.id===+id)?.price||0)*q,0);
  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);

  const placeOrder = () => {
    if (!coach||!seat||cartCount===0) return;
    const o = {
      id:genId('ORD'), trainNo:'12139', seat:`${coach}-${seat}`, coach,
      items:Object.entries(cart).map(([id,qty])=>({name:MENU.find(m=>m.id===+id).name,qty,price:MENU.find(m=>m.id===+id).price})),
      total:cartTotal, status:'Pending', time:now(), payment:pay, vendorId:'V001', agentId:null, passengerName:pname||'Guest',
    };
    actions.addOrder(o);
    setCart({}); setCoach(''); setSeat(''); setPname(''); setShowNew(false);
    showToast('✅ Order placed successfully!');
  };

  const markStatus = (id, status, patch={}) => {
    actions.updateOrder(id,{status,...patch});
    showToast(`Order ${id} → ${status}`);
  };

  const visible = orders.filter(o =>
    tab==='active'  ? ['Pending','Preparing'].includes(o.status) :
    tab==='packed'  ? o.status==='Packed' :
    o.status==='Delivered'
  );

  return (
    <div className="view">
      <div className="page-header">
        <div><h1 className="page-title">Vendor Panel</h1><span className="page-sub">Ramesh Kumar · Train 12139</span></div>
        <button className="btn-primary" onClick={()=>setShowNew(true)}>➕ New Order</button>
      </div>
      {toast && <div className="toast toast-green">{toast}</div>}
      <div className="cards-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <Card icon="💰" label="Sales Today"  value={`₹${totalSales.toLocaleString('en-IN')}`} accent="green"  delay={0}/>
        <Card icon="📦" label="Total Orders" value={orders.length}                             accent="blue"   delay={60}/>
        <Card icon="⏳" label="Pending"      value={pending}                                   accent="yellow" delay={120}/>
        <Card icon="🍳" label="Preparing"    value={preparing}                                 accent="orange" delay={180}/>
      </div>
      <TabBar
        tabs={[['active','🔥 Active',pending+preparing],['packed','📦 Packed',orders.filter(o=>o.status==='Packed').length],['done','✅ Done',0]]}
        active={tab} onChange={setTab}
      />
      <div className="order-grid">
        {visible.map((o,i) => (
          <div key={o.id} className="order-card" style={{animationDelay:`${i*45}ms`}}>
            <div className="order-top">
              <div>
                <p className="td-id">{o.id}</p>
                <div style={{display:'flex',gap:4,marginTop:4,flexWrap:'wrap'}}>
                  <Chip>{o.seat}</Chip>
                  <Chip color={o.payment==='UPI'?'blue':'soft'}>{o.payment==='UPI'?'📱':'💵'} {o.payment}</Chip>
                </div>
                <p style={{fontSize:'0.65rem',color:T.textLight,marginTop:3}}>{o.passengerName} · {o.time}</p>
              </div>
              <Badge label={o.status}/>
            </div>
            <p className="order-items">{o.items.map(it=>`${it.name} ×${it.qty}`).join(' · ')}</p>
            <div className="order-footer">
              <span className="order-total">₹{o.total}</span>
              <div style={{display:'flex',gap:6}}>
                {o.status==='Pending'   && <button className="act-btn act-ok"    onClick={()=>markStatus(o.id,'Preparing')}>Start</button>}
                {o.status==='Preparing' && <button className="act-btn act-ok"    onClick={()=>markStatus(o.id,'Packed')}>📦 Pack</button>}
                {o.status==='Packed'    && <span style={{fontSize:'0.68rem',color:T.textSub}}>Awaiting agent</span>}
              </div>
            </div>
          </div>
        ))}
        {visible.length===0 && <p style={{color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No orders here</p>}
      </div>

      {showNew && (
        <div className="overlay" onClick={()=>setShowNew(false)}>
          <div className="drawer" onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">New Order</span>
              <button className="close-btn" onClick={()=>setShowNew(false)}>✕</button>
            </div>
            <div className="drawer-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                <div>
                  <label className="field-label">Coach *</label>
                  <select className="field-input" value={coach} onChange={e=>setCoach(e.target.value)}>
                    <option value="">Select</option>
                    {ALL_COACHES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Seat *</label>
                  <input className="field-input" placeholder="45" value={seat} onChange={e=>setSeat(e.target.value)}/>
                </div>
                <div>
                  <label className="field-label">Payment</label>
                  <select className="field-input" value={pay} onChange={e=>setPay(e.target.value)}>
                    <option>UPI</option><option>Cash</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label className="field-label">Passenger Name</label>
                <input className="field-input" placeholder="Optional" value={pname} onChange={e=>setPname(e.target.value)}/>
              </div>
              <label className="field-label" style={{marginBottom:8,display:'block'}}>Items</label>
              <div className="menu-list">
                {MENU.map(item => (
                  <div key={item.id} className="menu-row">
                    <div className="menu-info">
                      <span style={{fontSize:'1.2rem'}}>{item.emoji}</span>
                      <div><p className="menu-name">{item.name}</p><p className="menu-cat">{item.cat}</p></div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className="menu-price">₹{item.price}</span>
                      <QtyCtrl item={item} cart={cart} onAdd={addItem} onRem={remItem}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky-bar">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontSize:'0.63rem',color:T.textLight}}>{cartCount} items</p>
                  <p style={{fontWeight:800,fontSize:'1rem',color:T.text}}>₹{cartTotal}</p>
                </div>
                <button className="btn-primary" disabled={!coach||!seat||cartCount===0} onClick={placeOrder}>
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

/* ══════════════════════════════════════════════════════════════
   3. DELIVERY AGENT PANEL
══════════════════════════════════════════════════════════════ */
const AgentPanel = () => {
  const orders    = useStore(s => s.orders.filter(o => o.trainNo === '12139'));
  const [tab, setTab]     = useState('ready');
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''),3000); };

  const ready   = orders.filter(o=>o.status==='Packed');
  const enroute = orders.filter(o=>o.status==='Out for Delivery' && o.agentId==='D001');
  const done    = orders.filter(o=>o.status==='Delivered' && o.agentId==='D001');

  const pickUp  = (id) => { actions.updateOrder(id,{status:'Out for Delivery',agentId:'D001'}); showToast('Picked up — now out for delivery!'); };
  const deliver = (id) => { actions.updateOrder(id,{status:'Delivered'}); showToast('✅ Delivered successfully!'); };

  const visible = tab==='ready' ? ready : tab==='enroute' ? enroute : done;

  return (
    <div className="view">
      <div className="page-header">
        <div><h1 className="page-title">Delivery Agent</h1><span className="page-sub">Raju Yadav · Train 12139</span></div>
        <span className="live-pill" style={{background:'#f0fdf4',color:T.green,border:`1px solid ${T.greenBorder}`}}>🟢 ON DUTY</span>
      </div>
      {toast && <div className="toast toast-green">{toast}</div>}
      <div className="cards-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <Card icon="📦" label="Ready to Pick" value={ready.length}   accent="orange" delay={0}/>
        <Card icon="🚶" label="En Route"       value={enroute.length} accent="blue"   delay={60}/>
        <Card icon="✅" label="Delivered"       value={done.length}   accent="green"  delay={120}/>
      </div>
      <TabBar
        tabs={[['ready','📦 Ready',ready.length],['enroute','🚶 En Route',enroute.length],['done','✅ Done',0]]}
        active={tab} onChange={setTab}
      />
      <div className="order-grid">
        {visible.map((o,i) => (
          <div key={o.id} className="order-card" style={{animationDelay:`${i*45}ms`,borderLeft:`3px solid ${tab==='ready'?T.orange:tab==='enroute'?T.blue:T.green}`}}>
            <div className="order-top">
              <div>
                <p className="td-id">{o.id}</p>
                <div style={{display:'flex',gap:4,marginTop:4}}>
                  <Chip color="blue">🚃 {o.coach}</Chip>
                  <Chip>{o.seat}</Chip>
                </div>
                <p style={{fontSize:'0.65rem',color:T.textLight,marginTop:3}}>{o.passengerName||'Passenger'} · {o.time}</p>
              </div>
              <Badge label={o.status}/>
            </div>
            <p className="order-items">{o.items.map(it=>`${it.name} ×${it.qty}`).join(' · ')}</p>
            <div className="order-footer">
              <div>
                <span className="order-total">₹{o.total}</span>
                {o.payment==='Cash' && <span style={{fontSize:'0.65rem',color:T.red,marginLeft:6,fontWeight:700}}>💵 Collect Cash</span>}
              </div>
              <div style={{display:'flex',gap:6}}>
                {tab==='ready'   && <button className="act-btn act-ok"    onClick={()=>pickUp(o.id)}>🚶 Pick Up</button>}
                {tab==='enroute' && <button className="act-btn act-green" onClick={()=>deliver(o.id)}>✅ Delivered</button>}
              </div>
            </div>
          </div>
        ))}
        {visible.length===0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'3rem 0',color:T.textLight}}>
            <p style={{fontSize:'2rem',marginBottom:8}}>{tab==='ready'?'📭':'🎉'}</p>
            <p style={{fontSize:'0.85rem'}}>{tab==='ready'?'No orders ready for pickup':'All caught up!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   4. PASSENGER APP — now with 5 tabs: Order | My Orders | Feedback | Complaint | Help
══════════════════════════════════════════════════════════════ */
const PassengerApp = ({ prefillTrain='' }) => {
  const [passengerTab, setPassengerTab] = useState('order'); // 'order' | 'myorders' | 'feedback' | 'complaint' | 'help'
  const [step, setStep]           = useState(0);
  const [userInfo, setUserInfo]   = useState({ train:prefillTrain, coach:'', seat:'', name:'' });
  const [cart, setCart]           = useState({});
  const [orderInfo, setOrderInfo] = useState({});
  const [payMethod, setPayMethod] = useState('upi');
  const [sessionOrderId, setSessionOrderId] = useState(null);

  const addItem = item => setCart(c => ({...c,[item.id]:(c[item.id]||0)+1}));
  const remItem = item => setCart(c => {const n={...c};if(n[item.id]>1)n[item.id]--;else delete n[item.id];return n;});

  const resetOrder = () => { setStep(0); setCart({}); setSessionOrderId(null); };

  const passengerTabs = [
    { id:'order',     icon:'🍽️', label:'Order' },
    { id:'feedback',  icon:'⭐', label:'Rate' },
    { id:'complaint', icon:'⚠️', label:'Complaint' },
    { id:'help',      icon:'❓', label:'Help' },
  ];

  return (
    <div style={{height:'100%',width:'100%',display:'flex',flexDirection:'column',background:'#f9fafb',overflow:'hidden'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(230,92,0,.4)}50%{box-shadow:0 0 0 8px rgba(230,92,0,0)}}
        @keyframes bounceIn{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
      `}</style>

      {/* Passenger top tab bar */}
      <div style={{display:'flex',background:'#fff',borderBottom:'2px solid #f3f4f6',flexShrink:0,zIndex:10}}>
        {passengerTabs.map(t => (
          <button key={t.id} onClick={()=>setPassengerTab(t.id)}
            style={{flex:1,border:'none',background:'none',padding:'9px 4px 7px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,borderBottom:`2px solid ${passengerTab===t.id?T.orange:'transparent'}`,marginBottom:-2,transition:'all .2s'}}>
            <span style={{fontSize:'1rem'}}>{t.icon}</span>
            <span style={{fontSize:'0.58rem',fontWeight:passengerTab===t.id?800:600,color:passengerTab===t.id?T.orange:'#9ca3af',whiteSpace:'nowrap'}}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        {passengerTab==='order' && (
          <>
            {step===0 && <PLocationSelect prefillTrain={prefillTrain} onNext={info=>{setUserInfo(info);setStep(1);}}/>}
            {step===1 && <PMenu    userInfo={userInfo} cart={cart} onAdd={addItem} onRem={remItem} onNext={()=>setStep(2)} onBack={()=>setStep(0)}/>}
            {step===2 && <PCart    cart={cart} onAdd={addItem} onRem={remItem} onBack={()=>setStep(1)} onNext={(t,e)=>{setOrderInfo({total:t,eta:e});setStep(3);}}/>}
            {step===3 && <PPay     total={orderInfo.total} eta={orderInfo.eta} onBack={()=>setStep(2)} onNext={m=>{setPayMethod(m);setStep(4);}}/>}
            {step===4 && <PTrack   userInfo={userInfo} orderInfo={orderInfo} payMethod={payMethod} cart={cart}
                           onSetOrderId={setSessionOrderId}
                           onFeedback={()=>setPassengerTab('feedback')}
                           onComplaint={()=>setPassengerTab('complaint')}
                           onReset={resetOrder}/>}
          </>
        )}
        {passengerTab==='feedback'  && <PFeedback  userInfo={userInfo} orderInfo={orderInfo} onDone={()=>setPassengerTab('order')}/>}
        {passengerTab==='complaint' && <PComplaint userInfo={userInfo} orderInfo={orderInfo} onDone={()=>setPassengerTab('order')}/>}
        {passengerTab==='help'      && <PHelpPage onContact={()=>setPassengerTab('complaint')}/>}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PASSENGER: LOCATION SELECT (Coach + Seat FIRST, then name)
   Replaces the old multi-step login flow
══════════════════════════════════════════════════════════════ */
const PLocationSelect = ({ prefillTrain, onNext }) => {
  const [subStep, setSubStep] = useState(0); // 0=train, 1=coach, 2=seat, 3=name
  const [train, setTrain]     = useState(prefillTrain || '');
  const [coach, setCoach]     = useState('');
  const [seat,  setSeat]      = useState('');
  const [name,  setName]      = useState('');
  const [trainErr, setTrainErr] = useState('');
  const locked = !!prefillTrain;

  const subSteps = [
    { label:'Train',  icon:'🚂' },
    { label:'Coach',  icon:'🚃' },
    { label:'Seat',   icon:'💺' },
    { label:'Name',   icon:'👤' },
  ];

  const canNext = [
    train.trim().length >= 4,
    !!coach,
    !!seat,
    true,
  ][subStep];

  const next = () => {
    if (subStep === 0 && train.trim().length < 4) { setTrainErr('Enter a valid train number'); return; }
    if (subStep < 3) { setSubStep(s => s+1); return; }
    onNext({ train, coach, seat: String(seat), name });
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#c2410c,#e65c00,#f9a825)',padding:'14px 18px 16px',flexShrink:0,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-24,top:-24,width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,.07)'}}/>
        <div style={{fontSize:'0.55rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>INDIAN RAILWAY PANTRY</div>
        <div style={{fontSize:'1.2rem',fontWeight:900,color:'#fff',lineHeight:1.2}}>Hot Food, Right at Your Seat 🍽️</div>
        {locked && <div style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:5,background:'rgba(255,255,255,.2)',padding:'3px 10px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,color:'#fff'}}>🔒 Train {prefillTrain} — QR Verified</div>}
      </div>

      {/* Sub-step progress */}
      <div style={{background:'#fff',borderBottom:'1px solid #f3f4f6',padding:'8px 14px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center'}}>
          {subSteps.map((s,i) => (
            <div key={s.label} style={{display:'flex',alignItems:'center',flex:i<subSteps.length-1?1:'none'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,cursor:i<subStep?'pointer':'default'}} onClick={()=>i<subStep&&setSubStep(i)}>
                <div style={{width:26,height:26,borderRadius:'50%',background:i<subStep?T.green:i===subStep?T.orange:'#e5e7eb',color:i<=subStep?'#fff':'#9ca3af',display:'flex',alignItems:'center',justifyContent:'center',fontSize:i<subStep?'0.75rem':'0.78rem',fontWeight:900,transition:'all .25s'}}>
                  {i<subStep?'✓':s.icon}
                </div>
                <span style={{fontSize:'0.5rem',fontWeight:i===subStep?800:600,color:i<subStep?T.green:i===subStep?T.orange:'#9ca3af',whiteSpace:'nowrap'}}>{s.label}</span>
              </div>
              {i<subSteps.length-1 && <div style={{flex:1,height:2,margin:'0 3px',marginBottom:12,background:i<subStep?T.green:'#e5e7eb',transition:'background .3s'}}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 16px 0'}}>

        {/* STEP 0: Train */}
        {subStep===0 && (
          <div style={{animation:'fadeUp .25s ease'}}>
            <p style={{fontWeight:800,fontSize:'0.85rem',color:T.text,marginBottom:3}}>Enter Train Number</p>
            <p style={{fontSize:'0.68rem',color:T.textSub,marginBottom:12}}>Type your train number to get started</p>
            <div style={{position:'relative',marginBottom:10}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:'1.1rem'}}>🚂</span>
              <input value={train} onChange={e=>{setTrain(e.target.value);setTrainErr('');}} readOnly={locked}
                placeholder="e.g. 12139" maxLength={6}
                style={{width:'100%',padding:'13px 13px 13px 42px',border:`1.5px solid ${trainErr?T.red:train.length>=4?T.green:'#e5e7eb'}`,borderRadius:10,fontSize:'1.05rem',fontWeight:700,color:T.text,background:locked?'#f9fafb':'#fff',outline:'none',boxSizing:'border-box',letterSpacing:4}}/>
              {train.length>=4&&!trainErr && <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:T.green,fontSize:'1rem'}}>✓</span>}
            </div>
            {trainErr && <p style={{fontSize:'0.68rem',color:T.red,marginBottom:8}}>{trainErr}</p>}
            {train.length>=4 && TRAIN_NAMES[train] && (
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'8px 12px',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
                <span>🚆</span>
                <span style={{fontSize:'0.78rem',fontWeight:700,color:T.green}}>{TRAIN_NAMES[train]}</span>
              </div>
            )}
            <p style={{fontSize:'0.62rem',fontWeight:700,color:T.textLight,marginBottom:8,letterSpacing:'.5px'}}>POPULAR TRAINS</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {Object.entries(TRAIN_NAMES).map(([no,n]) => (
                <button key={no} onClick={()=>{setTrain(no);setTrainErr('');}}
                  style={{padding:'6px 10px',borderRadius:8,border:`1.5px solid ${train===no?T.orange:'#e5e7eb'}`,background:train===no?'#fff7ed':'#f9fafb',color:train===no?T.orange:T.textMid,fontSize:'0.7rem',fontWeight:700,cursor:'pointer'}}>
                  <span style={{display:'block',fontSize:'0.58rem',color:T.textLight}}>{no}</span>
                  {n.split(' ').slice(0,2).join(' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Coach */}
        {subStep===1 && (
          <div style={{animation:'fadeUp .25s ease'}}>
            <p style={{fontWeight:800,fontSize:'0.85rem',color:T.text,marginBottom:3}}>Select Your Coach / Buggy</p>
            <p style={{fontSize:'0.68rem',color:T.textSub,marginBottom:12}}>Tap your coach number from the list below</p>

            {/* Horizontal train diagram */}
            <div style={{background:'linear-gradient(135deg,#fff7ed,#fef9c3)',borderRadius:10,padding:'10px 12px',marginBottom:14,border:'1px solid #fed7aa'}}>
              <p style={{fontSize:'0.58rem',fontWeight:800,color:'#9a3412',marginBottom:6,letterSpacing:'.5px'}}>🚂 TRAIN {train} — COACH MAP</p>
              <div style={{display:'flex',gap:3,overflowX:'auto',paddingBottom:4,alignItems:'center'}}>
                <div style={{flexShrink:0,width:44,height:28,borderRadius:4,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:800,color:'#fff'}}>🚂 Eng</div>
                {ALL_COACHES.map((c) => (
                  <div key={c} onClick={()=>setCoach(c)}
                    style={{flexShrink:0,minWidth:38,height:28,borderRadius:4,background:coach===c?T.orange:'#fff',border:`1.5px solid ${coach===c?T.orange:'#e5e7eb'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:800,color:coach===c?'#fff':T.textMid,cursor:'pointer',boxShadow:coach===c?'0 2px 8px rgba(230,92,0,.3)':'none',transition:'all .15s'}}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {COACH_GROUPS.map(grp => (
              <div key={grp.label} style={{marginBottom:14}}>
                <p style={{fontSize:'0.6rem',fontWeight:800,color:T.textLight,letterSpacing:'.5px',marginBottom:7}}>{grp.label}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {grp.coaches.map(c => (
                    <button key={c} onClick={()=>setCoach(c)}
                      style={{width:54,height:42,borderRadius:10,border:`2px solid ${coach===c?T.orange:'#e5e7eb'}`,background:coach===c?'#fff7ed':'#f9fafb',color:coach===c?T.orange:T.textMid,fontSize:'0.82rem',fontWeight:800,cursor:'pointer',boxShadow:coach===c?`0 0 0 3px rgba(230,92,0,.15)`:'none',transition:'all .15s'}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {coach && (
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8,marginTop:4}}>
                <span>🚃</span>
                <span style={{fontSize:'0.78rem',fontWeight:700,color:T.green}}>Coach <strong>{coach}</strong> selected ✓</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Seat */}
        {subStep===2 && (
          <div style={{animation:'fadeUp .25s ease'}}>
            <p style={{fontWeight:800,fontSize:'0.85rem',color:T.text,marginBottom:3}}>Select Your Seat Number</p>
            <p style={{fontSize:'0.68rem',color:T.textSub,marginBottom:10}}>Coach <strong style={{color:T.orange}}>{coach}</strong> — tap your seat number</p>

            {/* Type seat directly */}
            <div style={{marginBottom:12}}>
              <label className="field-label">Type seat number directly</label>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <input type="number" min={1} max={72} placeholder="e.g. 45"
                  value={typeof seat==='number'?seat:''}
                  onChange={e=>setSeat(Number(e.target.value))}
                  style={{width:90,padding:'10px 12px',border:`1.5px solid ${seat?T.orange:'#e5e7eb'}`,borderRadius:8,fontSize:'1rem',fontWeight:700,color:T.text,outline:'none',textAlign:'center'}}/>
                {seat && (
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,flex:1}}>
                    <span style={{fontSize:'0.75rem',fontWeight:700,color:T.green}}>💺 Seat {seat}, Coach {coach}</span>
                  </div>
                )}
              </div>
            </div>

            <p style={{fontSize:'0.62rem',fontWeight:700,color:T.textLight,marginBottom:8,letterSpacing:'.5px'}}>OR TAP FROM SEAT GRID</p>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{background:'#f8fafc',padding:'5px 10px',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:'0.58rem',fontWeight:700,color:T.textLight}}>WINDOW ← → AISLE</span>
                <span style={{fontSize:'0.58rem',color:T.textLight}}>Coach {coach} · 72 seats</span>
              </div>
              <div style={{padding:'8px',display:'flex',flexDirection:'column',gap:3}}>
                {SEAT_ROWS.map((row,ri) => (
                  <div key={ri} style={{display:'flex',gap:3,justifyContent:'center',alignItems:'center'}}>
                    {row.map((n,ci) => {
                      const isSel = seat===n;
                      return (
                        <div key={n} style={{display:'flex',alignItems:'center'}}>
                          {ci===4 && <div style={{width:6}}/>}
                          <button onClick={()=>setSeat(n)}
                            style={{width:28,height:26,borderRadius:5,border:`1.5px solid ${isSel?T.orange:'#e5e7eb'}`,background:isSel?'#fff7ed':'#f9fafb',color:isSel?T.orange:T.textMid,fontSize:'0.58rem',fontWeight:isSel?900:600,cursor:'pointer',boxShadow:isSel?`0 0 0 2px rgba(230,92,0,.2)`:'none',transition:'all .1s'}}>
                            {n}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {seat && (
              <div style={{marginTop:10,background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:'1.1rem'}}>💺</span>
                <span style={{fontSize:'0.78rem',fontWeight:700,color:T.orange}}>Seat {seat} · Coach {coach} confirmed ✓</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Name */}
        {subStep===3 && (
          <div style={{animation:'fadeUp .25s ease'}}>
            <p style={{fontWeight:800,fontSize:'0.85rem',color:T.text,marginBottom:3}}>Your Name <span style={{color:T.textLight,fontWeight:500,fontSize:'0.75rem'}}>(optional)</span></p>
            <p style={{fontSize:'0.68rem',color:T.textSub,marginBottom:12}}>Helps the vendor identify you when delivering</p>
            <div style={{position:'relative',marginBottom:14}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:'1rem'}}>👤</span>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rahul Sharma"
                style={{width:'100%',padding:'13px 13px 13px 40px',border:'1.5px solid #e5e7eb',borderRadius:10,fontSize:'0.92rem',color:T.text,background:'#fff',outline:'none',boxSizing:'border-box'}}/>
            </div>

            {/* Summary card */}
            <div style={{background:'linear-gradient(135deg,#fff7ed,#fef9c3)',border:'1px solid #fed7aa',borderRadius:12,padding:'14px',marginBottom:8}}>
              <p style={{fontSize:'0.6rem',fontWeight:800,color:'#9a3412',marginBottom:10,letterSpacing:'.5px'}}>✅ BOOKING SUMMARY</p>
              {[['🚂','Train',`${train}${TRAIN_NAMES[train]?' — '+TRAIN_NAMES[train]:''}`],['🚃','Coach',coach],['💺','Seat',seat],['👤','Name',name||'—']].map(([icon,label,val]) => (
                <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{fontSize:'0.7rem',color:'#9a3412',display:'flex',gap:5,alignItems:'center'}}><span>{icon}</span>{label}</span>
                  <span style={{fontWeight:800,fontSize:'0.76rem',color:'#c2410c',maxWidth:'55%',textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{val}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:'0.65rem',color:T.textSub,textAlign:'center'}}>🍽️ Next step: Browse & select your food items</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{padding:'10px 14px 14px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <div style={{display:'flex',gap:8}}>
          {subStep>0 && (
            <button onClick={()=>setSubStep(s=>s-1)} style={{padding:'11px 14px',background:'#f3f4f6',border:'none',borderRadius:10,color:T.textMid,fontWeight:700,cursor:'pointer',fontSize:'0.8rem'}}>← Back</button>
          )}
          <button onClick={next} disabled={!canNext}
            style={{flex:1,padding:12,background:canNext?'linear-gradient(135deg,#e65c00,#f9a825)':'#e5e7eb',color:canNext?'#fff':T.textSub,border:'none',borderRadius:10,fontSize:'0.88rem',fontWeight:800,cursor:canNext?'pointer':'not-allowed',transition:'all .2s'}}>
            {subStep===3?'🍽️ Browse Menu →':subStep===2?(seat?`Seat ${seat} — Continue →`:'Select a seat first'):subStep===1?(coach?`Coach ${coach} — Continue →`:'Tap a coach first'):'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Menu ── */
const PMenu = ({ userInfo, cart, onAdd, onRem, onNext, onBack }) => {
  const [cat, setCat]         = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch]   = useState('');

  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
  const cartTotal = Object.entries(cart).reduce((s,[id,q])=>s+(MENU.find(m=>m.id===+id)?.price||0)*q,0);
  const filtered  = MENU.filter(m=>(cat==='All'||m.cat===cat)&&(!vegOnly||m.veg)&&(!search||m.name.toLowerCase().includes(search.toLowerCase())));
  const popular   = MENU.filter(m=>m.popular);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'#fff',flexShrink:0,borderBottom:'1px solid #f3f4f6'}}>
        {/* Location bar */}
        <div style={{padding:'6px 14px',background:'linear-gradient(90deg,#fff7ed,#fef9c3)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'0.68rem',color:'#c2410c',fontWeight:800}}>🚂 {userInfo.train} · 🚃 {userInfo.coach} · 💺 {userInfo.seat}</span>
          <button onClick={onBack} style={{fontSize:'0.62rem',color:'#9a3412',background:'none',border:'1px solid #fed7aa',borderRadius:5,padding:'2px 8px',cursor:'pointer',fontWeight:700}}>✏️ Edit</button>
        </div>
        <div style={{padding:'7px 14px 0'}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:'0.85rem'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food…"
              style={{width:'100%',padding:'8px 12px 8px 30px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.78rem',background:'#f9fafb',outline:'none',boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',padding:'7px 14px',gap:5,overflowX:'auto'}}>
          {CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)}
              style={{padding:'4px 10px',borderRadius:99,border:'none',cursor:'pointer',fontSize:'0.68rem',fontWeight:700,whiteSpace:'nowrap',background:cat===c?T.orange:'#f3f4f6',color:cat===c?'#fff':'#6b7280'}}>
              {c}
            </button>
          ))}
          <button onClick={()=>setVegOnly(v=>!v)}
            style={{marginLeft:'auto',flexShrink:0,padding:'4px 9px',borderRadius:99,border:`1.5px solid ${vegOnly?T.green:'#d1d5db'}`,background:vegOnly?'#f0fdf4':'#fff',color:vegOnly?T.green:'#9ca3af',fontSize:'0.68rem',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',gap:3}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:vegOnly?T.green:'#d1d5db'}}/> VEG
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto'}}>
        {cat==='All'&&!search && (
          <div style={{padding:'10px 14px 0'}}>
            <p style={{fontWeight:800,fontSize:'0.78rem',color:T.text,marginBottom:7}}>⭐ Most Ordered</p>
            <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:6}}>
              {popular.map(item => (
                <div key={item.id} style={{flexShrink:0,width:112,background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,.05)'}}>
                  <div style={{height:54,background:'linear-gradient(135deg,#fff7ed,#fef3c7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem'}}>{item.emoji}</div>
                  <div style={{padding:'6px 8px 8px'}}>
                    <p style={{fontSize:'0.66rem',fontWeight:800,color:T.text,marginBottom:3}}>{item.name}</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                      <span style={{fontWeight:900,color:T.orange,fontSize:'0.78rem'}}>₹{item.price}</span>
                    </div>
                    <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{padding:'10px 14px 0'}}>
          <p style={{fontWeight:800,fontSize:'0.78rem',color:T.text,marginBottom:7}}>🍽️ {cat==='All'?'All Items':cat}</p>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {filtered.map((item,i) => (
              <div key={item.id} style={{background:'#fff',borderRadius:10,border:'1px solid #f3f4f6',padding:9,display:'flex',gap:9,alignItems:'flex-start',boxShadow:'0 1px 3px rgba(0,0,0,.04)',animation:'fadeUp .22s ease both',animationDelay:`${i*20}ms`}}>
                <div style={{width:54,height:54,borderRadius:9,flexShrink:0,background:'linear-gradient(135deg,#fff7ed,#fef9c3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem'}}>{item.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
                    <span style={{fontSize:'0.81rem',fontWeight:800,color:T.text}}>{item.name}</span>
                    {item.popular && <span style={{fontSize:'0.52rem',fontWeight:800,padding:'1px 5px',background:'#fef3c7',color:'#d97706',borderRadius:4}}>HOT</span>}
                    <span style={{marginLeft:'auto',flexShrink:0,width:8,height:8,borderRadius:2,border:`2px solid ${item.veg?T.green:T.red}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{width:4,height:4,borderRadius:'50%',background:item.veg?T.green:T.red}}/>
                    </span>
                  </div>
                  <p style={{fontSize:'0.62rem',color:T.textSub,marginBottom:5,lineHeight:1.3}}>{item.desc}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'0.92rem',fontWeight:900,color:T.orange}}>₹{item.price}</span>
                    <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:cartCount>0?68:14}}/>
      </div>

      {cartCount>0 && (
        <div style={{padding:'7px 13px 11px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
          <button onClick={onNext} style={{width:'100%',padding:'10px 13px',background:'linear-gradient(135deg,#e65c00,#f9a825)',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 4px 14px rgba(230,92,0,.28)'}}>
            <span style={{background:'rgba(255,255,255,.25)',padding:'2px 8px',borderRadius:99,fontSize:'0.68rem',fontWeight:800}}>{cartCount} items</span>
            <span style={{fontWeight:800,fontSize:'0.86rem'}}>View Cart →</span>
            <span style={{fontWeight:900,fontSize:'0.9rem'}}>₹{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Cart ── */
const PCart = ({ cart, onAdd, onRem, onBack, onNext }) => {
  const items = Object.entries(cart).map(([id,qty])=>({item:MENU.find(m=>m.id===+id),qty})).filter(x=>x.item);
  const total = items.reduce((s,{item,qty})=>s+item.price*qty,0);
  const eta   = useRef(['~12 min','~18 min','~8 min','~22 min','~14 min'][Math.floor(Math.random()*5)]).current;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px 0'}}>
        <div style={{background:'linear-gradient(135deg,#fff7ed,#fef9c3)',borderRadius:10,padding:'11px 13px',marginBottom:11,border:'1px solid #fed7aa',display:'flex',gap:9,alignItems:'center'}}>
          <span style={{fontSize:'1.3rem'}}>⚡</span>
          <div>
            <div style={{fontWeight:800,fontSize:'0.76rem',color:'#9a3412'}}>Delivery in {eta}</div>
            <div style={{fontSize:'0.63rem',color:'#c2410c'}}>After payment confirmed</div>
          </div>
        </div>
        <p style={{fontWeight:800,fontSize:'0.83rem',color:T.text,marginBottom:9}}>Your Order</p>
        {items.map(({item,qty}) => (
          <div key={item.id} style={{background:'#fff',borderRadius:9,border:'1px solid #f3f4f6',padding:9,display:'flex',gap:9,alignItems:'center',marginBottom:7}}>
            <div style={{width:40,height:40,borderRadius:7,background:'linear-gradient(135deg,#fff7ed,#fef9c3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0}}>{item.emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:800,fontSize:'0.78rem',color:T.text}}>{item.name}</p>
              <p style={{fontSize:'0.62rem',color:T.textSub}}>₹{item.price} × {qty}</p>
            </div>
            <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
            <span style={{fontWeight:800,color:T.orange,fontSize:'0.83rem',minWidth:36,textAlign:'right'}}>₹{item.price*qty}</span>
          </div>
        ))}
        <div style={{background:'#f9fafb',borderRadius:10,padding:11,marginTop:3,border:'1px solid #f3f4f6'}}>
          {[['Item Total',`₹${total}`],['Delivery','FREE ✓'],['IRCTC Fee','Included']].map(([k,v]) => (
            <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:'0.73rem',color:T.textSub}}>
              <span>{k}</span><span style={{fontWeight:700,color:v==='FREE ✓'?T.green:T.textMid}}>{v}</span>
            </div>
          ))}
          <div style={{borderTop:'1px dashed #e5e7eb',paddingTop:7,marginTop:1,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>Total Payable</span>
            <span style={{fontWeight:900,fontSize:'1.05rem',color:T.orange}}>₹{total}</span>
          </div>
        </div>
        <div style={{height:14}}/>
      </div>
      <div style={{padding:'9px 13px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',display:'flex',gap:7}}>
        <button onClick={onBack} style={{padding:'10px 13px',background:'#f3f4f6',border:'none',borderRadius:8,color:T.textMid,fontWeight:700,cursor:'pointer',fontSize:'0.78rem'}}>← Back</button>
        <button onClick={()=>onNext(total,eta)} style={{flex:1,padding:10,background:'linear-gradient(135deg,#e65c00,#f9a825)',color:'#fff',border:'none',borderRadius:8,fontWeight:800,cursor:'pointer',fontSize:'0.8rem'}}>Pay ₹{total} →</button>
      </div>
    </div>
  );
};

/* ── Pay ── */
const PPay = ({ total, eta, onBack, onNext }) => {
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const pay = () => { setPaying(true); setTimeout(()=>onNext(method),1800); };

  const card = (id, icon, title, sub) => (
    <div onClick={()=>setMethod(id)}
      style={{border:`1.5px solid ${method===id?T.orange:'#e5e7eb'}`,borderRadius:10,padding:'11px 13px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',background:method===id?'#fff7ed':'#f9fafb',marginBottom:8}}>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <span style={{fontSize:'1.5rem'}}>{icon}</span>
        <div><div style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>{title}</div><div style={{fontSize:'0.63rem',color:T.textSub}}>{sub}</div></div>
      </div>
      <div style={{width:17,height:17,borderRadius:'50%',border:`2px solid ${method===id?T.orange:'#d1d5db'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {method===id && <div style={{width:8,height:8,borderRadius:'50%',background:T.orange}}/>}
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'14px'}}>
        <div style={{textAlign:'center',padding:'18px 0 16px'}}>
          <div style={{fontSize:'0.6rem',fontWeight:800,color:T.textLight,letterSpacing:'1.5px',marginBottom:4}}>AMOUNT TO PAY</div>
          <div style={{fontSize:'2.4rem',fontWeight:900,color:T.text,lineHeight:1}}>₹{total}</div>
          <div style={{fontSize:'0.68rem',color:T.textLight,marginTop:4}}>Est. delivery {eta}</div>
        </div>
        <p style={{fontSize:'0.63rem',fontWeight:800,color:T.textMid,marginBottom:9,letterSpacing:'.5px'}}>SELECT PAYMENT</p>
        {card('upi','📱','UPI Payment','GPay · PhonePe · BHIM')}
        {card('cod','💵','Cash on Delivery','Pay when food arrives')}
        {method==='cod' && <div style={{background:'#f0fdf4',borderRadius:8,padding:'7px 11px',border:'1px solid #bbf7d0',fontSize:'0.65rem',color:'#166534',display:'flex',gap:7}}><span>💡</span><span>Keep ₹{total} ready. Vendor collects on delivery.</span></div>}
      </div>
      <div style={{padding:'9px 13px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',display:'flex',gap:7}}>
        <button onClick={onBack} disabled={paying} style={{padding:'10px 13px',background:'#f3f4f6',border:'none',borderRadius:8,color:T.textMid,fontWeight:700,cursor:'pointer',fontSize:'0.78rem'}}>← Back</button>
        <button onClick={pay} disabled={paying}
          style={{flex:1,padding:10,background:paying?'#fed7aa':'linear-gradient(135deg,#e65c00,#f9a825)',color:'#fff',border:'none',borderRadius:8,fontWeight:800,cursor:paying?'wait':'pointer',fontSize:'0.8rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
          {paying
            ? <><span style={{width:11,height:11,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Processing...</>
            : method==='upi' ? `✅ Pay ₹${total}` : `🛵 Place Order`}
        </button>
      </div>
    </div>
  );
};

/* ── Track ── */
const PTRACK = [
  { label:'Order Placed',      icon:'📋', sub:'Received your order' },
  { label:'Vendor Assigned',   icon:'👨‍🍳', sub:'Preparing your food' },
  { label:'Preparing',         icon:'🍳', sub:'Being freshly made' },
  { label:'Out for Delivery',  icon:'🚶', sub:'On the way to your seat' },
  { label:'Delivered',         icon:'✅', sub:'Enjoy your meal! 🍽️' },
];

const PTrack = ({ userInfo, orderInfo, payMethod, cart, onSetOrderId, onFeedback, onComplaint, onReset }) => {
  const [cur, setCur]   = useState(0);
  const [orderId]       = useState(()=>genId('IRCTC'));
  const done = cur === PTRACK.length - 1;

  useEffect(() => {
    const delays = [0,3000,7500,13000,19000];
    const timers = delays.map((d,i)=>setTimeout(()=>setCur(i),d));
    const items  = Object.entries(cart).map(([id,qty])=>({name:MENU.find(m=>m.id===+id)?.name||'',qty,price:MENU.find(m=>m.id===+id)?.price||0}));
    const total  = items.reduce((s,it)=>s+it.price*it.qty,0);
    actions.addOrder({ id:orderId, trainNo:userInfo.train, seat:`${userInfo.coach}-${userInfo.seat}`, coach:userInfo.coach, items, total, status:'Pending', time:now(), payment:payMethod==='upi'?'UPI':'Cash', vendorId:'V001', agentId:null, passengerName:userInfo.name||'Passenger' });
    if (onSetOrderId) onSetOrderId(orderId);
    return ()=>timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        <div style={{background:'linear-gradient(135deg,#c2410c,#e65c00,#f9a825)',borderRadius:12,padding:'13px',color:'#fff',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:9}}>
            <div><div style={{fontSize:'0.56rem',opacity:.8}}>ORDER ID</div><div style={{fontWeight:900,fontSize:'0.88rem'}}>{orderId}</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:'0.56rem',opacity:.8}}>TOTAL</div><div style={{fontWeight:900,fontSize:'0.96rem'}}>₹{orderInfo.total}</div></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',background:'rgba(255,255,255,.12)',borderRadius:8,padding:'6px 10px'}}>
            {[['COACH',userInfo.coach],['SEAT',userInfo.seat],['ETA',orderInfo.eta],['PAY',payMethod==='upi'?'📱 UPI':'💵 Cash']].map(([k,v]) => (
              <div key={k}><div style={{fontSize:'0.52rem',opacity:.75}}>{k}</div><div style={{fontWeight:800,fontSize:'0.7rem'}}>{v}</div></div>
            ))}
          </div>
        </div>

        <p style={{fontSize:'0.66rem',fontWeight:800,color:T.textMid,marginBottom:9,letterSpacing:'.5px'}}>🔴 LIVE TRACKING</p>
        <div style={{background:'#fff',borderRadius:12,padding:'13px',border:'1px solid #f3f4f6',marginBottom:12}}>
          {PTRACK.map((step,i) => {
            const isDone=i<cur, isActive=i===cur;
            return (
              <div key={i} style={{display:'flex',gap:9,paddingBottom:i<PTRACK.length-1?16:0,position:'relative'}}>
                {i<PTRACK.length-1 && <div style={{position:'absolute',left:14,top:32,width:2,height:'calc(100% - 16px)',background:isDone?T.orange:'#f3f4f6',transition:'background .5s'}}/>}
                <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,zIndex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:isDone?'0.72rem':'0.88rem',background:isDone||isActive?T.orange:'#f9fafb',border:`2px solid ${isDone||isActive?T.orange:'#e5e7eb'}`,transition:'all .4s',color:isDone||isActive?'#fff':'#9ca3af',fontWeight:800}}>
                  {isDone?'✓':step.icon}
                </div>
                <div style={{paddingTop:3}}>
                  <div style={{fontSize:'0.78rem',fontWeight:800,color:isDone||isActive?T.text:'#9ca3af',display:'flex',alignItems:'center',gap:5}}>
                    {step.label}
                    {isActive && <span style={{fontSize:'0.52rem',fontWeight:800,background:'#fff7ed',color:T.orange,padding:'1px 6px',borderRadius:99,border:'1px solid #fed7aa'}}>NOW</span>}
                  </div>
                  {(isDone||isActive) && <div style={{fontSize:'0.63rem',color:T.textSub,marginTop:1}}>{step.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {done && (
          <div style={{background:'linear-gradient(135deg,#fff7ed,#fef9c3)',borderRadius:12,padding:'18px',textAlign:'center',border:'1px solid #fed7aa',marginBottom:12}}>
            <div style={{fontSize:'2.2rem',marginBottom:5}}>🎉</div>
            <div style={{fontWeight:900,color:'#c2410c',fontSize:'1.05rem',marginBottom:3}}>Order Delivered!</div>
            <p style={{fontSize:'0.68rem',color:'#9a3412',marginBottom:11}}>Hope you enjoy your meal 🍽️</p>
            {payMethod==='cod' && <div style={{marginBottom:11,padding:'7px 11px',background:'#fff',borderRadius:8,border:'1px solid #fed7aa',fontSize:'0.68rem',color:'#9a3412',fontWeight:700}}>💵 Please pay ₹{orderInfo.total} to the delivery agent</div>}
            <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:9}}>
              <button onClick={onFeedback} style={{padding:'9px 16px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:8,fontWeight:800,cursor:'pointer',fontSize:'0.76rem'}}>⭐ Rate Order</button>
              <button onClick={onComplaint} style={{padding:'9px 13px',background:'#fff',color:T.red,border:`1.5px solid ${T.red}`,borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.76rem'}}>⚠️ Complaint</button>
            </div>
            <button onClick={onReset} style={{padding:'7px 18px',background:'#f3f4f6',color:T.textMid,border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>↺ Order Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PASSENGER FEEDBACK PORTAL (standalone tab)
══════════════════════════════════════════════════════════════ */
const PFeedback = ({ userInfo, orderInfo, onDone }) => {
  const allFeedback = useStore(s => s.feedback);
  const [mode, setMode]           = useState('list'); // 'list' | 'form'
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [msg, setMsg]             = useState('');
  const [category, setCategory]   = useState('');
  const [nameInput, setNameInput] = useState(userInfo?.name || '');
  const [seatInput, setSeatInput] = useState(userInfo?.seat ? `${userInfo.coach}-${userInfo.seat}` : '');
  const [submitting, setSub]      = useState(false);
  const [done, setDone]           = useState(false);

  const categories = ['Food Quality','Delivery Speed','Packaging','Vendor Behavior','Value for Money'];
  const avgRating  = allFeedback.length ? (allFeedback.reduce((s,f)=>s+f.rating,0)/allFeedback.length).toFixed(1) : '—';

  const reset = () => { setRating(0);setMsg('');setCategory('');setDone(false);setMode('list'); };

  const submit = () => {
    if (!rating) return;
    setSub(true);
    setTimeout(() => {
      actions.addFeedback({ id:genId('F'), name:nameInput||'Passenger', seat:seatInput||'—', trainNo:userInfo?.train||'—', rating, message:msg||'No comment', time:now() });
      setSub(false); setDone(true);
    }, 1200);
  };

  if (done) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
      <div style={{width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',marginBottom:14}}>⭐</div>
      <h2 style={{fontSize:'1.05rem',fontWeight:900,color:T.text,marginBottom:7}}>Thank You!</h2>
      <p style={{fontSize:'0.78rem',color:T.textSub,marginBottom:20,lineHeight:1.6}}>Your feedback helps us improve for all passengers.</p>
      <button onClick={reset} style={{padding:'11px 26px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontSize:'0.86rem'}}>Back to Feedback</button>
    </div>
  );

  if (mode === 'form') return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',padding:'14px 18px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:6}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:7,padding:'5px 9px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700}}>← Back</button>
          <div>
            <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px'}}>RATE YOUR EXPERIENCE</p>
            <p style={{fontSize:'0.96rem',fontWeight:900,color:'#fff'}}>How was your order? ⭐</p>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px'}}>
        {/* Name + Seat */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div>
            <label className="field-label">Your Name</label>
            <input className="field-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/>
          </div>
          <div>
            <label className="field-label">Seat (Coach-No)</label>
            <input className="field-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/>
          </div>
        </div>

        {/* Star rating */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'18px',textAlign:'center',marginBottom:12,boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
          <p style={{fontSize:'0.76rem',fontWeight:800,color:T.text,marginBottom:11}}>Overall Rating *</p>
          <div style={{display:'flex',justifyContent:'center',gap:9,marginBottom:9}}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={()=>setRating(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                style={{fontSize:'2rem',cursor:'pointer',transition:'transform .15s',transform:(hover||rating)>=n?'scale(1.25)':'scale(1)',filter:(hover||rating)>=n?'none':'grayscale(1)',userSelect:'none'}}>
                ⭐
              </span>
            ))}
          </div>
          {rating>0 && <div style={{fontSize:'0.83rem',fontWeight:800,color:T.purple}}>{['','😟 Terrible','😕 Bad','😐 Okay','😊 Good','🤩 Excellent!'][rating]}</div>}
        </div>

        {/* Category tags */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12,boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
          <p style={{fontSize:'0.73rem',fontWeight:800,color:T.text,marginBottom:9}}>What aspect? <span style={{color:T.textLight,fontWeight:500}}>(optional)</span></p>
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {categories.map(c => (
              <button key={c} onClick={()=>setCategory(prev=>prev===c?'':c)}
                style={{padding:'5px 11px',borderRadius:99,border:`1.5px solid ${category===c?T.purple:'#e5e7eb'}`,background:category===c?T.purpleLight:'#f9fafb',color:category===c?T.purple:T.textMid,fontSize:'0.7rem',fontWeight:700,cursor:'pointer'}}>
                {category===c?'✓ ':''}{c}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12,boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
          <p style={{fontSize:'0.73rem',fontWeight:800,color:T.text,marginBottom:7}}>Add a comment <span style={{color:T.textLight,fontWeight:500}}>(optional)</span></p>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            placeholder="Tell us about food quality, delivery time, packaging…"
            style={{width:'100%',padding:'9px 11px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.8rem',color:T.text,background:'#f9fafb',outline:'none',resize:'none',minHeight:76,boxSizing:'border-box',fontFamily:'sans-serif',lineHeight:1.5}}/>
        </div>

        {/* Quick phrases */}
        <div style={{marginBottom:14}}>
          <p style={{fontSize:'0.62rem',fontWeight:700,color:T.textLight,marginBottom:7,letterSpacing:'.5px'}}>QUICK PHRASES</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {['Food was hot 🔥','Delivered fast ⚡','Great packaging 📦','Friendly vendor 😊','Good value 💰'].map(p => (
              <button key={p} onClick={()=>setMsg(prev=>prev?prev+'. '+p:p)}
                style={{padding:'4px 9px',borderRadius:7,border:'1px solid #e5e7eb',background:'#f9fafb',color:T.textMid,fontSize:'0.66rem',fontWeight:600,cursor:'pointer'}}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:'9px 14px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <button onClick={submit} disabled={!rating||submitting}
          style={{width:'100%',padding:12,background:!rating?'#e5e7eb':`linear-gradient(135deg,${T.purple},#a855f7)`,color:!rating?T.textSub:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:!rating?'not-allowed':'pointer',fontSize:'0.86rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
          {submitting
            ? <><span style={{width:11,height:11,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Submitting…</>
            : '⭐ Submit Feedback'}
        </button>
      </div>
    </div>
  );

  // LIST MODE
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>FEEDBACK PORTAL</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:10}}>Passenger Reviews ⭐</p>
        <div style={{display:'flex',gap:10}}>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.6rem',fontWeight:900,color:'#fff'}}>{avgRating}</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Avg Rating</div>
          </div>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.6rem',fontWeight:900,color:'#fff'}}>{allFeedback.length}</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Total Reviews</div>
          </div>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.6rem',fontWeight:900,color:'#fff'}}>{allFeedback.filter(f=>f.rating>=4).length}</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Happy ⭐4+</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <p style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>Recent Reviews</p>
          <button onClick={()=>setMode('form')}
            style={{padding:'6px 13px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>
            ✏️ Write Review
          </button>
        </div>

        {allFeedback.length === 0 && (
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>⭐</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:T.text,marginBottom:4}}>No reviews yet</p>
            <p style={{fontSize:'0.73rem',color:T.textSub,marginBottom:14}}>Be the first to share your experience!</p>
            <button onClick={()=>setMode('form')} style={{padding:'10px 20px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:9,fontWeight:800,cursor:'pointer',fontSize:'0.8rem'}}>Write a Review</button>
          </div>
        )}

        {allFeedback.map((f,i) => (
          <div key={f.id} style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'12px',marginBottom:9,boxShadow:'0 1px 3px rgba(0,0,0,.04)',animation:'fadeUp .25s ease both',animationDelay:`${i*35}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              <div>
                <p style={{fontWeight:800,fontSize:'0.82rem',color:T.text}}>{f.name}</p>
                <p style={{fontSize:'0.62rem',color:T.textLight}}>Seat {f.seat} · {f.time}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'0.9rem',color:'#f59e0b',letterSpacing:1}}>{stars(f.rating)}</div>
                <div style={{fontSize:'0.6rem',fontWeight:700,color:T.textLight}}>{f.rating}/5</div>
              </div>
            </div>
            <p style={{fontSize:'0.74rem',color:T.textMid,fontStyle:'italic',lineHeight:1.4}}>"{f.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PASSENGER COMPLAINT PORTAL (standalone tab)
══════════════════════════════════════════════════════════════ */
const PComplaint = ({ userInfo, orderInfo, onDone }) => {
  const allComplaints = useStore(s => s.complaints);
  const [mode, setMode]           = useState('list'); // 'list' | 'form'
  const [issue, setIssue]         = useState('');
  const [custom, setCustom]       = useState('');
  const [priority, setPriority]   = useState('');
  const [nameInput, setNameInput] = useState(userInfo?.name || '');
  const [seatInput, setSeatInput] = useState(userInfo?.seat ? `${userInfo.coach}-${userInfo.seat}` : '');
  const [submitting, setSub]      = useState(false);
  const [done, setDone]           = useState(false);
  const [ticketId]                = useState(()=>genId('TKT'));

  const issues = [
    { label:'Food was cold or stale',     icon:'🥶' },
    { label:'Wrong item delivered',        icon:'❌' },
    { label:'Overcharged / extra amount',  icon:'💸' },
    { label:'Delayed delivery',            icon:'⏰' },
    { label:'Unhygienic packaging',        icon:'🧴' },
    { label:'Vendor was rude',             icon:'😠' },
    { label:'Item missing from order',     icon:'📦' },
    { label:'Other issue',                 icon:'📝' },
  ];
  const priorities = ['Low — Just letting you know','Medium — Please look into it','High — Needs immediate attention'];

  const myComplaints = allComplaints.filter(c =>
    seatInput ? c.seat === seatInput : true
  );

  const reset = () => { setIssue('');setCustom('');setPriority('');setDone(false);setMode('list'); };

  const submit = () => {
    const text = issue==='Other issue' ? custom : issue;
    if (!text) return;
    setSub(true);
    setTimeout(() => {
      actions.addComplaint({ id:genId('C'), name:nameInput||'Passenger', seat:seatInput||'—', trainNo:userInfo?.train||'—', issue:text+(priority?` [${priority.split('—')[0].trim()}]`:''), status:'Open', time:now() });
      setSub(false); setDone(true);
    }, 1200);
  };

  if (done) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
      <div style={{width:70,height:70,borderRadius:'50%',background:'#fef2f2',border:'2px solid #fecaca',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',marginBottom:14}}>📋</div>
      <h2 style={{fontSize:'1.05rem',fontWeight:900,color:T.text,marginBottom:7}}>Complaint Filed!</h2>
      <p style={{fontSize:'0.78rem',color:T.textSub,marginBottom:8,lineHeight:1.6}}>Our team will resolve it shortly.</p>
      <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'9px 15px',marginBottom:20}}>
        <p style={{fontSize:'0.62rem',color:'#9b2c2c',fontWeight:700}}>TICKET ID</p>
        <p style={{fontSize:'1rem',fontWeight:900,color:T.red}}>{ticketId}</p>
      </div>
      <button onClick={reset} style={{padding:'11px 26px',background:'linear-gradient(135deg,#e65c00,#f9a825)',color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontSize:'0.86rem'}}>Back to Complaints</button>
    </div>
  );

  if (mode === 'form') return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#991b1b,#dc2626)',padding:'14px 18px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:6}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:7,padding:'5px 9px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700}}>← Back</button>
          <div>
            <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px'}}>FILE A COMPLAINT</p>
            <p style={{fontSize:'0.96rem',fontWeight:900,color:'#fff'}}>We'll resolve it ASAP ⚡</p>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px'}}>
        {/* Name + Seat */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div>
            <label className="field-label">Your Name</label>
            <input className="field-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/>
          </div>
          <div>
            <label className="field-label">Seat (Coach-No)</label>
            <input className="field-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/>
          </div>
        </div>

        {/* Issue selection */}
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12,boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
          <p style={{fontSize:'0.76rem',fontWeight:800,color:T.text,marginBottom:9}}>What's the issue? *</p>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {issues.map(({label,icon}) => (
              <div key={label} onClick={()=>setIssue(label)}
                style={{padding:'9px 11px',border:`1.5px solid ${issue===label?T.red:'#e5e7eb'}`,borderRadius:8,cursor:'pointer',background:issue===label?T.redLight:'#f9fafb',display:'flex',alignItems:'center',gap:9}}>
                <span style={{fontSize:'1rem'}}>{icon}</span>
                <span style={{fontSize:'0.78rem',fontWeight:issue===label?700:500,color:issue===label?T.red:T.textMid,flex:1}}>{label}</span>
                {issue===label && <span style={{color:T.red,fontSize:'0.78rem',fontWeight:800}}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {issue==='Other issue' && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12}}>
            <p style={{fontSize:'0.73rem',fontWeight:800,color:T.text,marginBottom:7}}>Describe your issue</p>
            <textarea value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Please describe the issue in detail…"
              style={{width:'100%',padding:'9px 11px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.8rem',color:T.text,background:'#f9fafb',outline:'none',resize:'none',minHeight:76,boxSizing:'border-box',fontFamily:'sans-serif'}}/>
          </div>
        )}

        {issue && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12}}>
            <p style={{fontSize:'0.73rem',fontWeight:800,color:T.text,marginBottom:9}}>Priority <span style={{color:T.textLight,fontWeight:500}}>(optional)</span></p>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {priorities.map((p,i) => {
                const colors=['#16a34a','#f59e0b','#dc2626'];
                return (
                  <div key={p} onClick={()=>setPriority(p)}
                    style={{padding:'7px 11px',border:`1.5px solid ${priority===p?colors[i]:'#e5e7eb'}`,borderRadius:8,cursor:'pointer',background:priority===p?`${colors[i]}15`:'#f9fafb',display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:colors[i],flexShrink:0}}/>
                    <span style={{fontSize:'0.73rem',fontWeight:priority===p?700:500,color:priority===p?colors[i]:T.textMid}}>{p}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'9px 11px',marginBottom:14,display:'flex',gap:7}}>
          <span>ℹ️</span>
          <p style={{fontSize:'0.66rem',color:'#1e40af',lineHeight:1.5}}>Our INDIAN RAILWAY team reviews complaints within 2 hours. Urgent: call <strong>1800-111-139</strong></p>
        </div>
      </div>

      <div style={{padding:'9px 14px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <button onClick={submit} disabled={!issue||(issue==='Other issue'&&!custom)||submitting}
          style={{width:'100%',padding:12,background:!issue?'#e5e7eb':`linear-gradient(135deg,${T.red},#f97316)`,color:!issue?T.textSub:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:!issue?'not-allowed':'pointer',fontSize:'0.86rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
          {submitting
            ? <><span style={{width:11,height:11,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Submitting…</>
            : '⚠️ Submit Complaint'}
        </button>
      </div>
    </div>
  );

  // LIST MODE
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#991b1b,#dc2626)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>COMPLAINT PORTAL</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:10}}>Your Complaints ⚠️</p>
        <div style={{display:'flex',gap:10}}>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:900,color:'#fff'}}>{allComplaints.filter(c=>c.status==='Open').length}</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Open</div>
          </div>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:900,color:'#fff'}}>{allComplaints.filter(c=>c.status==='Resolved').length}</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Resolved</div>
          </div>
          <div style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:900,color:'#fff'}}>2h</div>
            <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>Avg Resolve</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <p style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>All Complaints</p>
          <button onClick={()=>setMode('form')}
            style={{padding:'6px 13px',background:'linear-gradient(135deg,#dc2626,#f97316)',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>
            + File Complaint
          </button>
        </div>

        {allComplaints.length === 0 && (
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>🎉</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:T.text,marginBottom:4}}>No complaints!</p>
            <p style={{fontSize:'0.73rem',color:T.textSub,marginBottom:14}}>Everything seems great. File one if you have an issue.</p>
            <button onClick={()=>setMode('form')} style={{padding:'10px 20px',background:'linear-gradient(135deg,#dc2626,#f97316)',color:'#fff',border:'none',borderRadius:9,fontWeight:800,cursor:'pointer',fontSize:'0.8rem'}}>File a Complaint</button>
          </div>
        )}

        {allComplaints.map((c,i) => (
          <div key={c.id} style={{background:'#fff',borderRadius:12,border:`1px solid ${c.status==='Open'?T.redBorder:T.greenBorder}`,padding:'12px',marginBottom:9,boxShadow:'0 1px 3px rgba(0,0,0,.04)',animation:'fadeUp .25s ease both',animationDelay:`${i*35}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              <div>
                <p style={{fontWeight:800,fontSize:'0.82rem',color:T.text}}>{c.name}</p>
                <p style={{fontSize:'0.62rem',color:T.textLight}}>Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
              </div>
              <Badge label={c.status}/>
            </div>
            <p style={{fontSize:'0.73rem',color:T.textMid,lineHeight:1.4}}>{c.issue}</p>
            {c.status==='Open' && (
              <div style={{marginTop:7,display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:'0.6rem',color:T.orange}}>⏱</span>
                <span style={{fontSize:'0.62rem',color:T.orange,fontWeight:600}}>Under review — expected within 2 hours</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PASSENGER HELP PAGE
══════════════════════════════════════════════════════════════ */
const PHelpPage = ({ onContact }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q:'How do I order food?', a:'Tap the "Order" tab → select your train, coach & seat → browse the menu → add items to cart → pay via UPI or cash on delivery.' },
    { q:'Can I change my order after placing it?', a:'Once confirmed, orders cannot be modified. Please contact the vendor directly or file a complaint if there is an issue.' },
    { q:'How long does delivery take?', a:'Typically 8–22 minutes after order confirmation, depending on preparation time and your coach location.' },
    { q:'Is cash on delivery available?', a:'Yes! Select "Cash on Delivery" at checkout. Keep the exact amount ready for the delivery agent.' },
    { q:'What if my food is cold or wrong?', a:'Tap the Complaint tab and file a complaint with details. Our team responds within 2 hours.' },
    { q:'How do I rate my experience?', a:'After delivery, tap the ⭐ Rate tab and submit your rating and comments.' },
    { q:'Are the prices fixed by INDIAN RAILWAY?', a:'Yes, all prices displayed are official INDIAN RAILWAY-approved rates. Any overcharging should be reported immediately.' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#0f4c81,#1d4ed8)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>HELP & SUPPORT</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff'}}>How can we help? ❓</p>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        {/* Quick actions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
          {[
            { icon:'📞', title:'Helpline', sub:'1800-111-139', bg:'#eff6ff', border:'#bfdbfe', color:T.blue },
            { icon:'⚠️', title:'File Complaint', sub:'Quick & easy', bg:'#fef2f2', border:'#fecaca', color:T.red, action:onContact },
            { icon:'📱', title:'UPI Support', sub:'GPay / PhonePe', bg:'#f0fdf4', border:'#bbf7d0', color:T.green },
            { icon:'🕐', title:'Timings', sub:'6 AM – 10 PM', bg:'#fefce8', border:'#fde047', color:'#ca8a04' },
          ].map(({icon,title,sub,bg,border,color,action}) => (
            <div key={title} onClick={action} style={{background:bg,border:`1px solid ${border}`,borderRadius:12,padding:'12px',display:'flex',alignItems:'center',gap:9,cursor:action?'pointer':'default'}}>
              <span style={{fontSize:'1.5rem'}}>{icon}</span>
              <div>
                <p style={{fontWeight:800,fontSize:'0.76rem',color}}>{title}</p>
                <p style={{fontSize:'0.63rem',color:T.textSub}}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{fontWeight:800,fontSize:'0.8rem',color:T.text,marginBottom:10}}>Frequently Asked Questions</p>
        {faqs.map((faq,i) => (
          <div key={i} style={{background:'#fff',borderRadius:10,border:'1px solid #f3f4f6',marginBottom:7,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{width:'100%',padding:'11px 13px',background:'none',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:9,textAlign:'left'}}>
              <span style={{fontSize:'0.78rem',fontWeight:700,color:T.text,lineHeight:1.3}}>{faq.q}</span>
              <span style={{fontSize:'0.7rem',color:T.textSub,flexShrink:0,transform:openFaq===i?'rotate(180deg)':'none',transition:'transform .2s'}}>▼</span>
            </button>
            {openFaq===i && (
              <div style={{padding:'0 13px 12px',animation:'fadeUp .18s ease'}}>
                <p style={{fontSize:'0.73rem',color:T.textMid,lineHeight:1.5,borderTop:'1px solid #f3f4f6',paddingTop:9}}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        {/* Emergency */}
        <div style={{background:'linear-gradient(135deg,#fef2f2,#fff7ed)',border:'1px solid #fecaca',borderRadius:12,padding:'13px',marginTop:6,marginBottom:14}}>
          <p style={{fontWeight:800,fontSize:'0.78rem',color:T.red,marginBottom:6}}>🚨 Emergency Contacts</p>
          {[['IRCTC Catering Helpline','1800-111-139'],['Railway General Helpline','139'],['Women Safety Helpline','182']].map(([label,num]) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:'0.72rem'}}>
              <span style={{color:T.textMid}}>{label}</span>
              <span style={{fontWeight:800,color:T.red}}>{num}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════ */
export default function PantrySystem() {
  const [view, setView]       = useState('passenger');
  const [scanTrain]           = useState('12139');
  const complaints = useStore(s=>s.complaints);
  const open = complaints.filter(c=>c.status==='Open').length;

  const navItems = [
    { id:'admin',     label:'Admin',  icon:'🖥️' },
    { id:'vendor',    label:'Vendor', icon:'👤' },
    { id:'agent',     label:'Agent',  icon:'🚶' },
    { id:'passenger', label:'Order',  icon:'📱' },
  ];

  return (
    <div className="app-root">
      <nav className="top-nav">
        <div className="nav-brand">
          <img 
            src={logo}
            alt="Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />

          <div>
            <p className="brand-name">INDIAN RAILWAY PANTRY SYSTEM</p>
            <p className="brand-sub">NGP Division</p>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
            <button key={n.id} className={`nav-link ${view===n.id?'nav-link-active':''}`} onClick={()=>setView(n.id)}>
              <span className="nav-link-icon">{n.icon}</span>
              <span className="nav-link-text">{n.label}</span>
              {n.id==='admin'&&open>0 && <span className="nav-notif">{open}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className={`main-content ${view==='passenger'?'main-passenger':''}`}>
        {view==='passenger' ? (
          <div className="passenger-shell">
            <PassengerApp prefillTrain={scanTrain} key={scanTrain}/>
          </div>
        ) : (
          <div className="inner-content">
            {view==='admin'  && <AdminDashboard/>}
            {view==='vendor' && <VendorPanel/>}
            {view==='agent'  && <AgentPanel/>}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.id} className={`bottom-tab ${view===n.id?'bottom-tab-active':''}`} onClick={()=>setView(n.id)}>
            <span className="bottom-tab-icon">{n.icon}</span>
            <span className="bottom-tab-label">{n.label}</span>
            {n.id==='admin'&&open>0 && <span className="nav-notif" style={{position:'absolute',top:4,right:'calc(50% - 14px)'}}>{open}</span>}
          </button>
        ))}
      </nav>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;font-family:sans-serif!important;margin:0;padding:0}
        html,body,#root{height:100%;overflow:hidden}
        .app-root{display:flex;flex-direction:column;height:100vh;max-height:100vh;overflow:hidden;background:#f0f4f8}
        .top-nav{display:flex;align-items:center;gap:1rem;padding:0 1.25rem;height:54px;min-height:54px;background:#fff;border-bottom:1px solid #dde3ed;box-shadow:0 1px 4px rgba(0,0,0,.06);flex-shrink:0;z-index:100;overflow:hidden}
        .nav-brand{display:flex;align-items:center;gap:.55rem;padding-right:1rem;border-right:1px solid #dde3ed;flex-shrink:0}
        .brand-name{font-size:.82rem;font-weight:800;color:#0f172a;white-space:nowrap}
        .brand-sub{font-size:.58rem;color:#94a3b8;white-space:nowrap}
        .nav-links{display:flex;gap:.2rem;flex-shrink:0}
        .nav-link{display:flex;align-items:center;gap:.35rem;padding:.3rem .75rem;border-radius:8px;border:1px solid transparent;background:none;cursor:pointer;transition:all .15s;flex-shrink:0;position:relative}
        .nav-link:hover{background:#f1f5f9;border-color:#dde3ed}
        .nav-link-active{background:#eff6ff;border-color:#bfdbfe}
        .nav-link-icon{font-size:.85rem;line-height:1}
        .nav-link-text{font-size:.74rem;font-weight:700;color:#374151;white-space:nowrap}
        .nav-link-active .nav-link-text{color:#1d4ed8}
        .nav-notif{background:#dc2626;color:#fff;font-size:.52rem;font-weight:800;padding:1px 5px;border-radius:99px;line-height:1.4}
        .main-content{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
        .main-passenger{overflow:hidden;display:flex;flex-direction:column}
        @media(min-width:641px){
          .main-passenger{align-items:center;justify-content:flex-start;background:#e5e7eb;padding:20px 0;overflow-y:auto}
          .passenger-shell{width:390px;height:calc(100vh - 54px - 40px);max-height:820px;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden;display:flex;flex-direction:column;background:#f9fafb;flex-shrink:0}
        }
        @media(max-width:640px){.passenger-shell{width:100%;height:100%;display:flex;flex-direction:column;background:#f9fafb;overflow:hidden}}
        .inner-content{padding:1.25rem;max-width:1400px;margin:0 auto;width:100%}
        .bottom-nav{display:none;flex-shrink:0}
        @media(max-width:640px){
          .nav-links{display:none}
          .top-nav{padding:0 1rem;height:48px;min-height:48px;justify-content:space-between}
          .nav-brand{border-right:none;padding-right:0}
          .bottom-nav{display:flex;background:#fff;border-top:1px solid #e5e7eb;box-shadow:0 -2px 12px rgba(0,0,0,.08);z-index:100}
          .bottom-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7px 4px 9px;border:none;background:none;cursor:pointer;gap:2px;position:relative}
          .bottom-tab-icon{font-size:1.2rem;line-height:1}
          .bottom-tab-label{font-size:.58rem;font-weight:700;color:#9ca3af}
          .bottom-tab-active .bottom-tab-label{color:#1d4ed8}
          .inner-content{padding:1rem}
        }
        .view{display:flex;flex-direction:column;gap:1rem}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding-bottom:.75rem;border-bottom:1px solid #dde3ed}
        .page-title{font-size:1.2rem;font-weight:800;color:#0f172a;letter-spacing:-.3px}
        .page-sub{font-size:.71rem;color:#94a3b8;font-weight:500}
        .live-pill{font-size:.6rem;font-weight:700;background:#eff6ff;color:#1d4ed8;padding:3px 10px;border-radius:99px;border:1px solid #bfdbfe;white-space:nowrap}
        .cards-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:.6rem}
        @media(max-width:1100px){.cards-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:640px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
        .stat-card{background:#fff;border:1px solid #dde3ed;border-radius:8px;padding:.75rem;display:flex;align-items:center;gap:.6rem;box-shadow:0 1px 2px rgba(0,0,0,.04);animation:fadeUp .35s ease both;transition:transform .2s,box-shadow .2s}
        .stat-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)}
        .accent-blue{border-left:3px solid #3b82f6}.accent-green{border-left:3px solid #16a34a}.accent-orange{border-left:3px solid #e65c00}.accent-yellow{border-left:3px solid #f59e0b}.accent-red{border-left:3px solid #dc2626}.accent-purple{border-left:3px solid #7c3aed}
        .stat-icon{width:30px;height:30px;border-radius:7px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:.88rem;flex-shrink:0}
        .stat-body{min-width:0}
        .stat-label{font-size:.57rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}
        .stat-val{font-size:1.1rem;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-.4px}
        .stat-sub{font-size:.58rem;color:#94a3b8;margin-top:1px}
        .tab-bar{display:flex;gap:.2rem;border-bottom:2px solid #dde3ed;overflow-x:auto}
        .tab{padding:.42rem .8rem;border:none;background:none;cursor:pointer;font-size:.74rem;font-weight:600;color:#64748b;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:.3rem;flex-shrink:0}
        .tab:hover{color:#1d4ed8}
        .tab-active{color:#1d4ed8;border-bottom-color:#1d4ed8}
        .tab-badge{background:#1d4ed8;color:#fff;font-size:.55rem;font-weight:700;padding:1px 5px;border-radius:99px}
        .section-card{background:#fff;border:1px solid #dde3ed;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
        .section-head{display:flex;align-items:center;gap:.6rem;padding:.8rem 1rem;border-bottom:1px solid #f1f5f9}
        .section-title{font-size:.84rem;font-weight:700;color:#0f172a}
        .count-pill{font-size:.6rem;font-weight:700;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:99px;border:1px solid #bfdbfe}
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .tbl{width:100%;border-collapse:collapse;font-size:.76rem}
        .tbl th{padding:.48rem .8rem;text-align:left;font-weight:700;color:#64748b;text-transform:uppercase;font-size:.57rem;letter-spacing:.05em;background:#f8fafc;border-bottom:1px solid #e2e8f0;white-space:nowrap}
        .tbl td{padding:.55rem .8rem;border-bottom:1px solid #f1f5f9;color:#374151}
        .tbl tr:hover td{background:#f8fafc}
        .tbl-row{animation:fadeUp .22s ease both}
        .td-id{font-weight:600;color:#1d4ed8;white-space:nowrap}.td-name{font-weight:600;color:#0f172a}.td-amt{font-weight:700;color:#0f172a}.td-items{font-size:.68rem;color:#64748b;max-width:160px}.td-time{font-size:.68rem;color:#94a3b8;white-space:nowrap}
        .chip{font-size:.62rem;font-weight:700;padding:2px 7px;border-radius:5px;display:inline-block;white-space:nowrap}
        .chip-blue{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}.chip-soft{background:#f8fafc;color:#475569;border:1px solid #e2e8f0}
        .badge{padding:2px 8px;border-radius:99px;font-size:.6rem;font-weight:700;display:inline-block;white-space:nowrap}
        .b-green{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}.b-blue{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}.b-yellow{background:#fefce8;color:#ca8a04;border:1px solid #fde047}.b-red{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}.b-purple{background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe}.b-orange{background:#fff7ed;color:#ea580c;border:1px solid #fed7aa}
        .btn-primary{padding:.4rem .9rem;background:#1d4ed8;color:#fff;border:none;border-radius:6px;font-size:.74rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .15s}
        .btn-primary:hover{background:#1e40af}.btn-primary:disabled{opacity:.45;cursor:not-allowed}
        .act-btn{padding:3px 9px;background:transparent;border:1px solid #dde3ed;border-radius:5px;cursor:pointer;font-size:.67rem;font-weight:600;transition:all .15s}
        .act-ok{color:#1d4ed8;border-color:#bfdbfe}.act-ok:hover{background:#1d4ed8;color:#fff;border-color:#1d4ed8}
        .act-green{color:#16a34a;border-color:#bbf7d0}.act-green:hover{background:#16a34a;color:#fff}
        .act-mute{color:#64748b;border-color:#cbd5e1}.act-mute:hover{background:#64748b;color:#fff}
        .qty-ctrl{display:flex;align-items:center;border:1.5px solid #e65c00;border-radius:6px;overflow:hidden}
        .qty-ctrl button{width:26px;height:26px;border:none;background:#fff7ed;color:#e65c00;font-size:.9rem;font-weight:800;cursor:pointer}
        .qty-ctrl button:hover{background:#e65c00;color:#fff}
        .qty-ctrl span{padding:0 6px;font-size:.74rem;font-weight:800;color:#0f172a;min-width:18px;text-align:center}
        .add-btn{padding:4px 10px;background:#e65c00;color:#fff;border:none;border-radius:5px;font-size:.68rem;font-weight:700;cursor:pointer}
        .order-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(256px,1fr));gap:.65rem}
        @media(max-width:640px){.order-grid{grid-template-columns:1fr}}
        .order-card{background:#fff;border:1px solid #dde3ed;border-radius:10px;padding:.8rem;box-shadow:0 1px 3px rgba(0,0,0,.04);animation:fadeUp .28s ease both}
        .order-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem}
        .order-items{font-size:.69rem;color:#64748b;margin:.35rem 0;line-height:1.4}
        .order-footer{display:flex;justify-content:space-between;align-items:center;margin-top:.42rem}
        .order-total{font-weight:800;font-size:.9rem;color:#0f172a}
        .qr-card{background:#fff;border:1px solid #dde3ed;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.04);animation:fadeUp .35s ease both}
        .qr-header{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 14px;border-bottom:1px solid #f1f5f9}
        .complaint-row{border:1px solid #dde3ed;border-radius:8px;padding:.72rem;background:#f8fafc;animation:fadeUp .28s ease both}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:flex;align-items:flex-end;justify-content:center}
        @media(min-width:641px){.overlay{align-items:center}}
        .drawer{background:#fff;width:100%;max-width:480px;max-height:92vh;border-radius:16px 16px 0 0;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 -8px 40px rgba(0,0,0,.18);animation:slideUp .25s ease}
        @media(min-width:641px){.drawer{border-radius:16px;max-height:88vh}}
        .drawer-header{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1rem;border-bottom:1px solid #dde3ed;flex-shrink:0}
        .close-btn{background:none;border:none;cursor:pointer;font-size:1rem;color:#94a3b8;padding:2px 6px;border-radius:4px}
        .drawer-body{flex:1;overflow-y:auto;padding:1rem}
        .sticky-bar{flex-shrink:0;padding:.7rem 1rem;border-top:1px solid #dde3ed;background:#fff}
        .field-label{font-size:.64rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px}
        .field-input{width:100%;padding:.44rem .68rem;border:1px solid #dde3ed;border-radius:6px;font-size:.8rem;color:#0f172a;background:#f8fafc;outline:none}
        .field-input:focus{border-color:#3b82f6;background:#fff}
        .menu-list{display:flex;flex-direction:column;gap:.35rem}
        .menu-row{display:flex;align-items:center;justify-content:space-between;padding:.48rem .65rem;border:1px solid #dde3ed;border-radius:8px;background:#f8fafc}
        .menu-row:hover{border-color:#bfdbfe;background:#eff6ff}
        .menu-info{display:flex;align-items:center;gap:.45rem}
        .menu-name{font-size:.76rem;font-weight:600;color:#0f172a}
        .menu-cat{font-size:.6rem;color:#94a3b8}
        .menu-price{font-size:.76rem;font-weight:700;color:#1d4ed8;margin-right:.35rem}
        .toast{padding:.48rem 1rem;border-radius:8px;font-size:.76rem;font-weight:600;text-align:center;animation:fadeUp .3s ease;margin-bottom:.25rem}
        .toast-green{background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a}
        .toast-blue{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounceIn{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(230,92,0,.4)}50%{box-shadow:0 0 0 8px rgba(230,92,0,0)}}
      `}</style>
    </div>
  );
}