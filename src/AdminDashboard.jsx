import { useState } from "react";
import { useStore, actions, T, genId, now, TRAIN_NAMES } from "./store";
import { Badge, Chip, StatCard, TabBar, Section, QRCode } from "./store";

/* ── Password generator ─────────────────────────────────────────────────────── */
const genVendorId = () => "V" + String(Math.floor(1000 + Math.random() * 9000));
const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

/* ── Mini QR ─────────────────────────────────────────────────────────────────── */
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

/* ── Star renderer ───────────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 14 }) => (
  <span style={{ color: "#f59e0b", fontSize: size, letterSpacing: 1 }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

/* ── Rating distribution bar ─────────────────────────────────────────────────── */
const RatingBar = ({ count, total, color = "#f59e0b" }) => (
  <div style={{ height: 6, borderRadius: 99, background: "#e2e8f0", overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${total ? (count / total) * 100 : 0}%`, background: color, borderRadius: 99, transition: "width .5s" }} />
  </div>
);

export default function AdminDashboard() {
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

  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showCreds,     setShowCreds]     = useState(null);
  const [vForm, setVForm] = useState({ name:'', phone:'', trainNo:'', trainName:'' });
  const [vErrors, setVErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ── Revenue calculations ── */
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const totalRev        = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const pendingRev      = orders.filter(o => ['Pending','Preparing','Packed'].includes(o.status)).reduce((s,o) => s + o.total, 0);
  const delivered       = deliveredOrders.length;
  const open            = complaints.filter(c => c.status === 'Open').length;

  /* ── Rating analytics ── */
  const avgRating   = feedback.length ? (feedback.reduce((s,f) => s + f.rating, 0) / feedback.length).toFixed(1) : null;
  const fiveStars   = feedback.filter(f => f.rating === 5).length;

  const toast = (msg) => { setNewToast(msg); setTimeout(() => setNewToast(''), 3000); };

  /* ── QR generation ── */
  const genQR = async () => {
    if (!newTrain.trim()) return;
    await actions.addQR({
      id: genId('QR'), trainNo: newTrain,
      trainName: newTrainName || TRAIN_NAMES[newTrain] || 'Express Train',
      createdAt: now(), active: true,
    });
    setNewTrain(''); setNewTrainName(''); setShowQR(false);
    toast('QR Code generated successfully!');
  };

  /* ── Add vendor ── */
  const setV = (k) => (e) => { setVForm(f => ({ ...f, [k]: e.target.value })); setVErrors(er => ({ ...er, [k]: '' })); };

  const handleAddVendor = async () => {
    const e = {};
    if (!vForm.name.trim())      e.name    = "Required";
    if (!vForm.phone.trim())     e.phone   = "Required";
    if (!vForm.trainNo.trim())   e.trainNo = "Required";
    if (!vForm.trainName.trim()) e.trainNo = e.trainNo || "Train name required";
    if (vendors.find(v => v.train === vForm.trainNo.trim() && v.status === 'Active'))
      e.trainNo = "An active vendor is already assigned to this train";
    if (Object.keys(e).length) { setVErrors(e); return; }

    setSaving(true);
    const vendorId = genVendorId();
    const password = genPassword();
    const newVendor = {
      id: vendorId, password,
      name: vForm.name.trim(), phone: vForm.phone.trim(),
      train: vForm.trainNo.trim(), trainName: vForm.trainName.trim(),
      status: 'Active', sales: 0, orders: 0, rating: 0, createdAt: now(),
    };
    try {
      await actions.addVendor(newVendor);
      setShowAddVendor(false);
      setVForm({ name:'', phone:'', trainNo:'', trainName:'' });
      setVErrors({});
      setShowCreds(newVendor);
      toast('Vendor added successfully!');
    } catch (err) {
      console.error(err);
      toast('Failed to save vendor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => { setShowAddVendor(false); setVForm({ name:'', phone:'', trainNo:'', trainName:'' }); setVErrors({}); };

  const inp    = { width:'100%', padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:'0.83rem', color:'#111827', outline:'none', boxSizing:'border-box', fontFamily:'sans-serif', transition:'border-color 0.15s' };
  const errInp = { borderColor:'#fca5a5', background:'#fff5f5' };
  const lbl    = { display:'block', fontSize:'0.68rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 };
  const errTxt = { fontSize:'0.62rem', color:'#dc2626', marginTop:3, display:'block' };

  return (
    <div className="view">

      {/* PAGE HEADER */}
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

      {/* ── REVENUE HIGHLIGHT BANNER ── */}
      <div style={{
        background:'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)',
        borderRadius:14, padding:'16px 20px', display:'flex', gap:0, overflow:'hidden', position:'relative',
      }}>
        {/* Left: Total revenue */}
        <div style={{ flex:1, borderRight:'1px solid rgba(255,255,255,.15)', paddingRight:20 }}>
          <p style={{ margin:0, fontSize:'0.6rem', fontWeight:700, color:'rgba(255,255,255,.65)', letterSpacing:'1.5px', textTransform:'uppercase' }}>TOTAL REVENUE COLLECTED</p>
          <p style={{ margin:'4px 0 2px', fontSize:'2rem', fontWeight:900, color:'#fff', letterSpacing:'-1px', lineHeight:1 }}>
            ₹{totalRev.toLocaleString('en-IN')}
          </p>
          <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(255,255,255,.6)' }}>{delivered} orders delivered</p>
        </div>

        {/* Middle: Pending */}
        <div style={{ flex:1, borderRight:'1px solid rgba(255,255,255,.15)', padding:'0 20px' }}>
          <p style={{ margin:0, fontSize:'0.6rem', fontWeight:700, color:'rgba(255,255,255,.65)', letterSpacing:'1.5px', textTransform:'uppercase' }}>PENDING REVENUE</p>
          <p style={{ margin:'4px 0 2px', fontSize:'1.5rem', fontWeight:800, color:'#fde68a', letterSpacing:'-0.5px', lineHeight:1 }}>
            ₹{pendingRev.toLocaleString('en-IN')}
          </p>
          <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(255,255,255,.6)' }}>In kitchen / transit</p>
        </div>

        {/* Right: Avg rating */}
        <div style={{ flex:1, padding:'0 0 0 20px' }}>
          <p style={{ margin:0, fontSize:'0.6rem', fontWeight:700, color:'rgba(255,255,255,.65)', letterSpacing:'1.5px', textTransform:'uppercase' }}>PASSENGER RATING</p>
          <p style={{ margin:'4px 0 2px', fontSize:'1.5rem', fontWeight:800, color:'#fde68a', letterSpacing:'-0.5px', lineHeight:1 }}>
            {avgRating ? `⭐ ${avgRating}/5` : '—'}
          </p>
          <p style={{ margin:0, fontSize:'0.65rem', color:'rgba(255,255,255,.6)' }}>{feedback.length} reviews · {fiveStars} five-star</p>
        </div>

        {/* Decorative circles */}
        <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>
        <div style={{ position:'absolute', right:40, bottom:-30, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.04)' }}/>
      </div>

      {/* STAT CARDS */}
      <div className="cards-grid">
        <StatCard icon="🚂" label="Active Trains"   value={qrCodes.filter(q=>q.active).length}                        accent="blue"   delay={0}/>
        <StatCard icon="💰" label="Total Revenue"   value={`₹${totalRev.toLocaleString('en-IN')}`}  sub={`₹${pendingRev.toLocaleString('en-IN')} pending`} accent="green" delay={60}/>
        <StatCard icon="📦" label="Total Orders"    value={orders.length}                                              accent="orange" delay={120}/>
        <StatCard icon="✅" label="Delivered"        value={delivered} sub={orders.length ? `${Math.round(delivered/orders.length*100)}% rate` : '0% rate'} accent="green" delay={180}/>
        <StatCard icon="⭐" label="Avg Rating"       value={avgRating || '—'} sub={`${feedback.length} reviews`}       accent="yellow" delay={240}/>
        <StatCard icon="⚠️" label="Open Complaints" value={open}                                                       accent="red"    delay={300}/>
      </div>

      {/* TAB BAR */}
      <TabBar
        tabs={[
          ['orders','📦 Orders',0],
          ['vendors','👤 Vendors',0],
          ['qr','📲 QR Codes',0],
          ['complaints','⚠️ Complaints',open],
          ['feedback',`⭐ Ratings`,feedback.length],
        ]}
        active={tab} onChange={setTab}
      />

      {/* ORDERS TAB */}
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
                    <td className="td-items">{(o.items||[]).map(it=>`${it.name} ×${it.qty}`).join(', ')}</td>
                    <td className="td-amt">₹{o.total}</td>
                    <td><Chip color={o.payment==='UPI'?'blue':'soft'}>{o.payment==='UPI'?'📱':'💵'} {o.payment}</Chip></td>
                    <td className="td-time">{o.time}</td>
                    <td><Badge label={o.status}/></td>
                  </tr>
                ))}
                {orders.length===0 && (
                  <tr><td colSpan={8} style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* VENDORS TAB */}
      {tab==='vendors' && (
        <Section title="Vendor Overview" count={vendors.length}
          action={<button className="btn-primary" style={{fontSize:'0.72rem',padding:'4px 14px'}} onClick={()=>setShowAddVendor(true)}>➕ Add Vendor</button>}>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>ID</th><th>Name</th><th>Train</th><th>Sales</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {vendors.map((v,i) => {
                  // Live rating from feedback for this vendor's train
                  const vFeedback = feedback.filter(f => f.trainNo === v.train);
                  const liveRating = vFeedback.length ? (vFeedback.reduce((s,f)=>s+f.rating,0)/vFeedback.length).toFixed(1) : v.rating||0;
                  return (
                    <tr key={v.id} className="tbl-row" style={{animationDelay:`${i*30}ms`}}>
                      <td className="td-id">{v.id}</td>
                      <td className="td-name">{v.name}</td>
                      <td><Chip color="soft">{v.train}</Chip></td>
                      <td className="td-amt">₹{(v.sales||0).toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{display:'flex',flexDirection:'column',gap:1}}>
                          <Stars rating={liveRating} size={12}/>
                          <span style={{fontSize:'0.6rem',color:T.textSub,fontWeight:700}}>
                            {liveRating} <span style={{fontWeight:400}}>({vFeedback.length} reviews)</span>
                          </span>
                        </div>
                      </td>
                      <td><Badge label={v.status}/></td>
                      <td>
                        <button className={`act-btn ${v.status==='Active'?'act-mute':'act-ok'}`}
                          onClick={()=>actions.toggleVendor(v.id, v.status)}>
                          {v.status==='Active'?'Suspend':'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {vendors.length===0 && (
                  <tr><td colSpan={7} style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No vendors yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* QR TAB */}
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
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 12px 10px'}}>
                  <p style={{fontSize:'0.65rem',color:T.textSub}}>Scan to order on Train {qr.trainNo}</p>
                  <button className={`act-btn ${qr.active?'act-mute':'act-ok'}`} onClick={()=>actions.toggleQR(qr.id, qr.active)}>
                    {qr.active?'Deactivate':'Activate'}
                  </button>
                </div>
              </div>
            ))}
            {qrCodes.length===0 && <p style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>No QR codes yet</p>}
          </div>
        </Section>
      )}

      {/* COMPLAINTS TAB */}
      {tab==='complaints' && (
        <Section title="Passenger Complaints" count={open}>
          <div style={{padding:'0.85rem 1rem',display:'flex',flexDirection:'column',gap:'0.65rem'}}>
            {complaints.map((c,i) => (
              <div key={c.id} className="complaint-row" style={{animationDelay:`${i*40}ms`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:'0.83rem',color:T.text}}>{c.name}</p>
                    <p style={{fontSize:'0.65rem',color:T.textLight}}>Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
                    {c.vendorNote && (
                      <div style={{marginTop:4,display:'flex',alignItems:'center',gap:5}}>
                        <span style={{fontSize:'0.58rem',fontWeight:700,color:T.blue,padding:'1px 6px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:4}}>VENDOR NOTE</span>
                        <span style={{fontSize:'0.65rem',color:T.textMid}}>{c.vendorNote}</span>
                      </div>
                    )}
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

      {/* ════════════════════════════════════════
          RATINGS / FEEDBACK TAB — live from Firebase
      ════════════════════════════════════════ */}
      {tab==='feedback' && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          {/* Rating summary card */}
          {feedback.length > 0 && (
            <div style={{
              background:'linear-gradient(135deg,#fef9c3,#fffbeb)',
              border:'1px solid #fde68a', borderRadius:14, padding:'16px 20px',
              display:'flex', gap:20, alignItems:'center',
            }}>
              {/* Big number */}
              <div style={{textAlign:'center', flexShrink:0}}>
                <p style={{fontSize:'3rem',fontWeight:900,color:'#92400e',lineHeight:1,margin:0}}>{avgRating}</p>
                <Stars rating={parseFloat(avgRating)} size={16}/>
                <p style={{fontSize:'0.62rem',color:'#a16207',marginTop:4,fontWeight:600}}>{feedback.length} passenger reviews</p>
              </div>

              {/* Distribution */}
              <div style={{flex:1}}>
                {[5,4,3,2,1].map(star => {
                  const cnt = feedback.filter(f => f.rating === star).length;
                  return (
                    <div key={star} style={{display:'flex',gap:8,alignItems:'center',marginBottom:5}}>
                      <span style={{fontSize:'0.62rem',fontWeight:700,color:'#92400e',width:6}}>{star}</span>
                      <span style={{fontSize:'0.7rem',color:'#f59e0b'}}>★</span>
                      <RatingBar count={cnt} total={feedback.length}/>
                      <span style={{fontSize:'0.6rem',color:'#a16207',width:16,textAlign:'right',fontWeight:600}}>{cnt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Quick stats */}
              <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                {[
                  { label:'5 ⭐', val: feedback.filter(f=>f.rating===5).length, color:'#16a34a' },
                  { label:'≥4 ⭐', val: feedback.filter(f=>f.rating>=4).length, color:'#ca8a04' },
                  { label:'≤2 ⭐', val: feedback.filter(f=>f.rating<=2).length, color:'#dc2626' },
                ].map(s => (
                  <div key={s.label} style={{textAlign:'center',background:'rgba(255,255,255,.7)',borderRadius:8,padding:'5px 12px'}}>
                    <p style={{margin:0,fontSize:'1.1rem',fontWeight:800,color:s.color}}>{s.val}</p>
                    <p style={{margin:0,fontSize:'0.58rem',color:'#a16207',fontWeight:600}}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live feed */}
          <Section title="Live Rating Feed" count={feedback.length}>
            {/* Live indicator */}
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderBottom:'1px solid #f1f5f9',background:'#f8fafc'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#16a34a',boxShadow:'0 0 0 2px #bbf7d0',flexShrink:0}}/>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#16a34a'}}>Real-time · synced from passenger app</span>
            </div>

            <div style={{padding:'0.85rem 1rem',display:'flex',flexDirection:'column',gap:'0.65rem'}}>
              {[...feedback].reverse().map((f,i) => (
                <div key={f.id} className="complaint-row" style={{animationDelay:`${i*40}ms`,borderLeft:`3px solid ${f.rating>=4?'#16a34a':f.rating>=3?'#f59e0b':'#dc2626'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                        <p style={{fontWeight:700,fontSize:'0.83rem',color:T.text,margin:0}}>{f.name}</p>
                        <span style={{fontSize:'0.58rem',fontWeight:700,padding:'1px 6px',background:'#eff6ff',color:'#1d4ed8',borderRadius:4,border:'1px solid #bfdbfe'}}>
                          🚂 {f.trainNo}
                        </span>
                      </div>
                      <p style={{fontSize:'0.65rem',color:T.textLight,margin:0}}>Seat {f.seat} · {f.time}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <Stars rating={f.rating} size={14}/>
                      <p style={{fontSize:'0.6rem',fontWeight:700,color:T.textSub,margin:'2px 0 0'}}>{f.rating}/5</p>
                    </div>
                  </div>
                  {f.message && <p style={{fontSize:'0.76rem',color:T.textMid,fontStyle:'italic',margin:0}}>"{f.message}"</p>}
                </div>
              ))}
              {feedback.length===0 && (
                <p style={{textAlign:'center',color:T.textLight,padding:'2rem',fontSize:'0.85rem'}}>
                  No ratings yet — passengers will appear here in real-time ⭐
                </p>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* QR MODAL */}
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

      {/* ADD VENDOR MODAL */}
      {showAddVendor && (
        <div className="overlay" onClick={resetAddForm}>
          <div className="drawer" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">➕ Add New Vendor</span>
              <button className="close-btn" onClick={resetAddForm}>✕</button>
            </div>
            <div style={{padding:'1.1rem',display:'flex',flexDirection:'column',gap:'1rem',overflowY:'auto',maxHeight:'70vh'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lbl}>👤 Vendor Name *</label>
                  <input style={{...inp,...(vErrors.name?errInp:{})}} placeholder="e.g. Ramesh Kumar" value={vForm.name} onChange={setV('name')}/>
                  {vErrors.name && <span style={errTxt}>{vErrors.name}</span>}
                </div>
                <div>
                  <label style={lbl}>📱 Phone *</label>
                  <input style={{...inp,...(vErrors.phone?errInp:{})}} placeholder="e.g. 9876543210" value={vForm.phone} onChange={setV('phone')}/>
                  {vErrors.phone && <span style={errTxt}>{vErrors.phone}</span>}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={lbl}>🚂 Train Number *</label>
                  <input style={{...inp,...(vErrors.trainNo?errInp:{})}} placeholder="e.g. 12139" value={vForm.trainNo} onChange={setV('trainNo')}/>
                  {vErrors.trainNo && <span style={errTxt}>{vErrors.trainNo}</span>}
                </div>
                <div>
                  <label style={lbl}>🏷️ Train Name *</label>
                  <input style={inp} placeholder="e.g. Sewagram Express" value={vForm.trainName} onChange={setV('trainName')}/>
                </div>
              </div>
              <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'10px 12px',fontSize:'0.7rem',color:'#1e40af'}}>
                🔑 A <strong>Vendor ID</strong> and <strong>Password</strong> will be auto-generated.
              </div>
              <button className="btn-primary" onClick={handleAddVendor} disabled={saving} style={{width:'100%',padding:'12px',fontSize:'0.85rem'}}>
                {saving ? '⏳ Saving...' : '✅ Create Vendor & Generate Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS POPUP */}
      {showCreds && (
        <div className="overlay" onClick={()=>setShowCreds(null)}>
          <div className="drawer" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <span className="section-title">🔑 Vendor Credentials</span>
              <button className="close-btn" onClick={()=>setShowCreds(null)}>✕</button>
            </div>
            <div style={{padding:'1.1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:14,padding:20}}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.45)',letterSpacing:'1px',marginBottom:3}}>VENDOR NAME</div>
                  <div style={{fontSize:'1rem',fontWeight:800,color:'#fff'}}>{showCreds.name}</div>
                  <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.55)',marginTop:2}}>🚂 Train {showCreds.train} — {showCreds.trainName}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.45)',letterSpacing:'1px',marginBottom:4}}>VENDOR ID</div>
                    <div style={{fontSize:'1.15rem',fontWeight:900,color:'#60a5fa',fontFamily:'monospace',letterSpacing:'2px'}}>{showCreds.id}</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,0.45)',letterSpacing:'1px',marginBottom:4}}>PASSWORD</div>
                    <div style={{fontSize:'1.15rem',fontWeight:900,color:'#4ade80',fontFamily:'monospace',letterSpacing:'2px'}}>{showCreds.password}</div>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'center'}}>
                <div style={{padding:12,background:'#f8fafc',borderRadius:12,border:'1px solid #e2e8f0',textAlign:'center'}}>
                  <MiniQR trainNo={showCreds.train} size={110}/>
                  <div style={{fontSize:'0.6rem',color:'#94a3b8',marginTop:6,fontFamily:'monospace'}}>irctc.pantry/{showCreds.train}</div>
                </div>
              </div>
              <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:8,padding:'10px 12px',fontSize:'0.7rem',color:'#9a3412'}}>
                ⚠️ <strong>Save these now.</strong> The password cannot be retrieved later.
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-primary" style={{flex:1,padding:'10px'}}
                  onClick={()=>{ navigator.clipboard?.writeText(`Vendor ID: ${showCreds.id}\nPassword: ${showCreds.password}\nTrain: ${showCreds.train} - ${showCreds.trainName}`); toast('Copied!'); }}>
                  📋 Copy Credentials
                </button>
                <button onClick={()=>setShowCreds(null)}
                  style={{padding:'10px 16px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,fontSize:'0.8rem',fontWeight:700,cursor:'pointer'}}>
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