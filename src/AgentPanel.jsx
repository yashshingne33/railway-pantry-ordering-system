import { useState } from "react";
import { useStore, actions, T } from "./store";
import { Badge, Chip, StatCard, TabBar } from "./store";

export default function AgentPanel() {
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
        <StatCard icon="📦" label="Ready to Pick" value={ready.length}   accent="orange" delay={0}/>
        <StatCard icon="🚶" label="En Route"       value={enroute.length} accent="blue"   delay={60}/>
        <StatCard icon="✅" label="Delivered"       value={done.length}   accent="green"  delay={120}/>
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
}