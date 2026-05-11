import { useState } from "react";
import { useStore, actions, MENU, ALL_COACHES, T, genId, now } from "./store";
import { Badge, Chip, StatCard, TabBar, QtyCtrl } from "./store";

export default function VendorPanel() {
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

  const markStatus = (id, status) => {
    actions.updateOrder(id,{status});
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
        <StatCard icon="💰" label="Sales Today"  value={`₹${totalSales.toLocaleString('en-IN')}`} accent="green"  delay={0}/>
        <StatCard icon="📦" label="Total Orders" value={orders.length}                             accent="blue"   delay={60}/>
        <StatCard icon="⏳" label="Pending"      value={pending}                                   accent="yellow" delay={120}/>
        <StatCard icon="🍳" label="Preparing"    value={preparing}                                 accent="orange" delay={180}/>
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
                {o.status==='Pending'   && <button className="act-btn act-ok"  onClick={()=>markStatus(o.id,'Preparing')}>Start</button>}
                {o.status==='Preparing' && <button className="act-btn act-ok"  onClick={()=>markStatus(o.id,'Packed')}>📦 Pack</button>}
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
}