import { useState } from "react";
import { useStore, actions, T, genId, now } from "./store";
import { Badge, Chip, StatCard, TabBar, Section, QRCode } from "./store";

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

  const TRAIN_NAMES = { "12139":"Sewagram Express","12140":"Maharashtra Express","22105":"Vidarbha Express","12859":"Gitanjali Express","12809":"Mumbai Mail" };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

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
        <StatCard icon="🚂" label="Active Trains"  value={3}                                                          accent="blue"   delay={0}/>
        <StatCard icon="💰" label="Revenue Today"   value={`₹${totalRev.toLocaleString('en-IN')}`}                    accent="green"  delay={60}/>
        <StatCard icon="📦" label="Total Orders"    value={orders.length}                                              accent="orange" delay={120}/>
        <StatCard icon="✅" label="Delivered"        value={delivered} sub={`${Math.round(delivered/orders.length*100)}% rate`} accent="green" delay={180}/>
        <StatCard icon="⏳" label="Pending"          value={pending}                                                    accent="yellow" delay={240}/>
        <StatCard icon="⚠️" label="Open Complaints" value={open}                                                       accent="red"    delay={300}/>
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
}