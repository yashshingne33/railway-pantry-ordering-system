import { useState } from "react";
import { useStore, actions, T, genId, now } from "./store";
import { Badge, Chip, StatCard, TabBar, Section, QRCode } from "./store";

/* ── Helpers for vendor credentials (localStorage, no backend needed) ─────── */
const genVendorId = () => "V" + String(Math.floor(1000 + Math.random() * 9000));
const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
const saveVendors = (v) => { try { localStorage.setItem("irctc_vendors", JSON.stringify(v)); } catch {} };
const loadVendors = ()  => { try { return JSON.parse(localStorage.getItem("irctc_vendors") || "[]"); } catch { return []; } };

/* ── Mini QR for credential modal ─────────────────────────────────────────── */
const MiniQR = ({ trainNo, size = 100 }) => {
  const seed = trainNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng  = (n) => { let x = seed * 9301 + n * 49297; return ((x % 233280) / 233280); };
  const cells = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      if ((r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)) return true;
      return rng(r * 7 + c) > 0.45;
    })
  );
  const cell = size / 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="#fff" rx={4} />
      {[[0,0],[0,6],[6,0]].map(([r,c], i) => (
        <g key={i}>
          <rect x={cell*(c+1)-1} y={cell*(r+1)-1} width={cell*3+2} height={cell*3+2} fill="#1a1a2e" rx={2}/>
          <rect x={cell*(c+1)+3} y={cell*(r+1)+3} width={cell*3-6} height={cell*3-6} fill="#fff" rx={1}/>
          <rect x={cell*(c+1)+6} y={cell*(r+1)+6} width={cell*3-12} height={cell*3-12} fill="#1a1a2e" rx={1}/>
        </g>
      ))}
      {cells.map((row, r) => row.map((on, c) => {
        if ((r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)) return null;
        return on ? <rect key={`${r}${c}`} x={cell*(c+1)} y={cell*(r+1)} width={cell-1} height={cell-1} fill="#1a1a2e" rx={1}/> : null;
      }))}
    </svg>
  );
};

export default function AdminDashboard() {
  const orders     = useStore(s => s.orders);
  const vendors    = useStore(s => s.vendors);
  const complaints = useStore(s => s.complaints);
  const feedback   = useStore(s => s.feedback);
  const qrCodes    = useStore(s => s.qrCodes);

  // ── original state ──────────────────────────────────────────────────────────
  const [tab, setTab]           = useState('orders');
  const [showQR, setShowQR]     = useState(false);
  const [newTrain, setNewTrain] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newToast, setNewToast] = useState('');

  // ── new: add vendor state ───────────────────────────────────────────────────
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showCreds,     setShowCreds]     = useState(null);   // vendor obj after creation
  const [localVendors,  setLocalVendors]  = useState(loadVendors);
  const [vForm, setVForm] = useState({ name:'', phone:'', trainNo:'', trainName:'' });
  const [vErrors, setVErrors] = useState({});

  const TRAIN_NAMES = { "12139":"Sewagram Express","12140":"Maharashtra Express","22105":"Vidarbha Express","12859":"Gitanjali Express","12809":"Mumbai Mail" };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

  const totalRev  = orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.total,0);
  const delivered = orders.filter(o=>o.status==='Delivered').length;
  const pending   = orders.filter(o=>o.status==='Pending').length;
  const open      = complaints.filter(c=>c.status==='Open').length;

  const toast = (msg) => { setNewToast(msg); setTimeout(()=>setNewToast(''),3000); };

  // ── QR generation (original) ────────────────────────────────────────────────
  const genQR = () => {
    if (!newTrain.trim()) return;
    actions.addQR({ id:genId('QR'), trainNo:newTrain, trainName:newTrainName||TRAIN_NAMES[newTrain]||'Express Train', createdAt:now(), active:true });
    setNewTrain(''); setNewTrainName(''); setShowQR(false);
    toast('QR Code generated successfully!');
  };

  // ── Add vendor logic ────────────────────────────────────────────────────────
  const setV = (k) => (e) => { setVForm(f => ({...f, [k]: e.target.value})); setVErrors(er => ({...er, [k]:''})); };

  const handleAddVendor = () => {
    const e = {};
    if (!vForm.name.trim())     e.name    = "Required";
    if (!vForm.phone.trim())    e.phone   = "Required";
    if (!vForm.trainNo.trim())  e.trainNo = "Required";
    if (!vForm.trainName.trim()) e.trainNo = e.trainNo || "Train name required";
    // one active vendor per train
    if (localVendors.find(v => v.trainNo === vForm.trainNo.trim() && v.status === 'Active'))
      e.trainNo = "An active vendor is already assigned to this train";
    if (Object.keys(e).length) { setVErrors(e); return; }

    const vendorId = genVendorId();
    const password = genPassword();
    const newVendor = {
      id: vendorId, password,
      name: vForm.name.trim(), phone: vForm.phone.trim(),
      trainNo: vForm.trainNo.trim(), trainName: vForm.trainName.trim(),
      train: vForm.trainNo.trim(),   // also set train for store compatibility
      status: 'Active', sales: 0, orders: 0, rating: 0,
      createdAt: now(),
    };

    const updated = [newVendor, ...localVendors];
    setLocalVendors(updated);
    saveVendors(updated);

    // push into store so vendor table updates immediately
    actions.addVendor?.(newVendor);

    // ── AUTO-GENERATE QR for this vendor's train ──────────────────────────
    actions.addQR?.({
      id:        genId('QR'),
      trainNo:   newVendor.trainNo,
      trainName: newVendor.trainName,
      vendorId:  newVendor.id,
      vendorName:newVendor.name,
      createdAt: now(),
      active:    true,
    });

    setShowAddVendor(false);
    setVForm({ name:'', phone:'', trainNo:'', trainName:'' });
    setVErrors({});
    setShowCreds(newVendor);   // show credentials popup
    toast('Vendor added & QR generated successfully!');
  };

  const resetAddForm = () => {
    setShowAddVendor(false);
    setVForm({ name:'', phone:'', trainNo:'', trainName:'' });
    setVErrors({});
  };

  // ── inline styles (scoped, don't touch global CSS) ──────────────────────────
  const inp    = { width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:'0.83rem', color:'#111827', outline:'none', boxSizing:'border-box', fontFamily:'sans-serif', transition:'border-color 0.15s' };
  const errInp = { borderColor:'#fca5a5', background:'#fff5f5' };
  const lbl    = { display:'block', fontSize:'0.68rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 };
  const errTxt = { fontSize:'0.62rem', color:'#dc2626', marginTop:3, display:'block' };

  return (
    <div className="view">

      {/* ── PAGE HEADER — original, unchanged ── */}
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

      {/* ── STAT CARDS — original, unchanged ── */}
      <div className="cards-grid">
        <StatCard icon="🚂" label="Active Trains"  value={3}                                                          accent="blue"   delay={0}/>
        <StatCard icon="💰" label="Revenue Today"   value={`₹${totalRev.toLocaleString('en-IN')}`}                    accent="green"  delay={60}/>
        <StatCard icon="📦" label="Total Orders"    value={orders.length}                                              accent="orange" delay={120}/>
        <StatCard icon="✅" label="Delivered"        value={delivered} sub={`${Math.round(delivered/orders.length*100)}% rate`} accent="green" delay={180}/>
        <StatCard icon="⏳" label="Pending"          value={pending}                                                    accent="yellow" delay={240}/>
        <StatCard icon="⚠️" label="Open Complaints" value={open}                                                       accent="red"    delay={300}/>
      </div>

      {/* ── TAB BAR — original, unchanged ── */}
      <TabBar
        tabs={[['orders','📦 Orders',0],['vendors','👤 Vendors',0],['qr','📲 QR Codes',0],['complaints','⚠️ Complaints',open],['feedback','⭐ Feedback',0]]}
        active={tab} onChange={setTab}
      />

      {/* ── ORDERS TAB — original, unchanged ── */}
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

      {/* ── VENDORS TAB — original table + NEW "Add Vendor" button on top ── */}
      {tab==='vendors' && (
        <Section
          title="Vendor Overview"
          count={vendors.length}
          action={
            <button
              className="btn-primary"
              style={{fontSize:'0.72rem', padding:'4px 14px'}}
              onClick={()=>setShowAddVendor(true)}
            >
              ➕ Add Vendor
            </button>
          }
        >
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

      {/* ── QR TAB — original, unchanged ── */}
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

      {/* ── COMPLAINTS TAB — original, unchanged ── */}
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

      {/* ── FEEDBACK TAB — original, unchanged ── */}
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

      {/* ── ORIGINAL QR MODAL — unchanged ── */}
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

      {/* ══ NEW: ADD VENDOR MODAL ══════════════════════════════════════════════ */}
      {showAddVendor && (
        <div className="overlay" onClick={resetAddForm}>
          <div className="drawer" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">➕ Add New Vendor</span>
              <button className="close-btn" onClick={resetAddForm}>✕</button>
            </div>

            <div style={{padding:'1.1rem', display:'flex', flexDirection:'column', gap:'1rem', overflowY:'auto', maxHeight:'70vh'}}>

              {/* Name + Phone */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={lbl}>👤 Vendor Name *</label>
                  <input style={{...inp, ...(vErrors.name ? errInp : {})}}
                    placeholder="e.g. Ramesh Kumar"
                    value={vForm.name} onChange={setV('name')} />
                  {vErrors.name && <span style={errTxt}>{vErrors.name}</span>}
                </div>
                <div>
                  <label style={lbl}>📱 Phone *</label>
                  <input style={{...inp, ...(vErrors.phone ? errInp : {})}}
                    placeholder="e.g. 9876543210"
                    value={vForm.phone} onChange={setV('phone')} />
                  {vErrors.phone && <span style={errTxt}>{vErrors.phone}</span>}
                </div>
              </div>

              {/* Train No + Train Name side by side */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div>
                  <label style={lbl}>🚂 Train Number *</label>
                  <input style={{...inp, ...(vErrors.trainNo ? errInp : {})}}
                    placeholder="e.g. 12139"
                    value={vForm.trainNo} onChange={setV('trainNo')} />
                  {vErrors.trainNo && <span style={errTxt}>{vErrors.trainNo}</span>}
                </div>
                <div>
                  <label style={lbl}>🏷️ Train Name *</label>
                  <input style={inp}
                    placeholder="e.g. Sewagram Express"
                    value={vForm.trainName} onChange={setV('trainName')} />
                </div>
              </div>

              {/* Info note */}
              <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'10px 12px', fontSize:'0.7rem', color:'#1e40af'}}>
                🔑 A <strong>Vendor ID</strong> and <strong>Password</strong> will be auto-generated. Show them to the vendor after saving.
              </div>

              <button className="btn-primary" onClick={handleAddVendor}
                style={{width:'100%', padding:'12px', fontSize:'0.85rem'}}>
                ✅ Create Vendor & Generate Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ NEW: CREDENTIALS POPUP (shown after vendor is created) ════════════ */}
      {showCreds && (
        <div className="overlay" onClick={()=>setShowCreds(null)}>
          <div className="drawer" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">🔑 Vendor Credentials</span>
              <button className="close-btn" onClick={()=>setShowCreds(null)}>✕</button>
            </div>

            <div style={{padding:'1.1rem', display:'flex', flexDirection:'column', gap:'1rem'}}>

              {/* Dark credential card */}
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius:14, padding:20}}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:'0.58rem', color:'rgba(255,255,255,0.45)', letterSpacing:'1px', marginBottom:3}}>VENDOR NAME</div>
                  <div style={{fontSize:'1rem', fontWeight:800, color:'#fff'}}>{showCreds.name}</div>
                  <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.55)', marginTop:2}}>🚂 Train {showCreds.trainNo} — {showCreds.trainName}</div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  <div style={{background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 12px'}}>
                    <div style={{fontSize:'0.58rem', color:'rgba(255,255,255,0.45)', letterSpacing:'1px', marginBottom:4}}>VENDOR ID</div>
                    <div style={{fontSize:'1.15rem', fontWeight:900, color:'#60a5fa', fontFamily:'monospace', letterSpacing:'2px'}}>{showCreds.id}</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 12px'}}>
                    <div style={{fontSize:'0.58rem', color:'rgba(255,255,255,0.45)', letterSpacing:'1px', marginBottom:4}}>PASSWORD</div>
                    <div style={{fontSize:'1.15rem', fontWeight:900, color:'#4ade80', fontFamily:'monospace', letterSpacing:'2px'}}>{showCreds.password}</div>
                  </div>
                </div>
              </div>

              {/* QR preview */}
              <div style={{display:'flex', justifyContent:'center'}}>
                <div style={{padding:12, background:'#f8fafc', borderRadius:12, border:'1px solid #e2e8f0', textAlign:'center'}}>
                  <MiniQR trainNo={showCreds.trainNo} size={110}/>
                  <div style={{fontSize:'0.6rem', color:'#94a3b8', marginTop:6, fontFamily:'monospace'}}>irctc.pantry/{showCreds.trainNo}</div>
                </div>
              </div>

              <div style={{background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:'10px 12px', fontSize:'0.7rem', color:'#9a3412'}}>
                ⚠️ <strong>Save these now.</strong> The password cannot be retrieved later — only reset by admin.
              </div>

              <div style={{display:'flex', gap:8}}>
                <button className="btn-primary" style={{flex:1, padding:'10px'}}
                  onClick={()=>{ navigator.clipboard?.writeText(`Vendor ID: ${showCreds.id}\nPassword: ${showCreds.password}\nTrain: ${showCreds.trainNo} - ${showCreds.trainName}`); toast('Copied!'); }}>
                  📋 Copy Credentials
                </button>
                <button onClick={()=>setShowCreds(null)}
                  style={{padding:'10px 16px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:8, fontSize:'0.8rem', fontWeight:700, cursor:'pointer'}}>
                  Done ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}