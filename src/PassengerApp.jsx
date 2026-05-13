import { useState, useEffect, useRef } from "react";
import { useStore, actions, MENU, CATS, COACH_GROUPS, TRAIN_NAMES, T, genId, now, stars } from "./store";
import { Badge, QtyCtrl } from "./store";

/* ══════════════════════════════════════════════════════════════
   PASSENGER APP — Train fixed from QR, no train selection
══════════════════════════════════════════════════════════════ */
export default function PassengerApp({ prefillTrain = '12139' }) {
  const [passengerTab, setPassengerTab] = useState('order');
  const [step, setStep]           = useState(0);
  const [userInfo, setUserInfo]   = useState({ train: prefillTrain, coach:'', seat:'', name:'' });
  const [cart, setCart]           = useState({});
  const [orderInfo, setOrderInfo] = useState({});
  const [payMethod, setPayMethod] = useState('upi');
  const [setSessionOrderId] = useState(null);

  const addItem = item => setCart(c => ({...c,[item.id]:(c[item.id]||0)+1}));
  const remItem = item => setCart(c => {const n={...c};if(n[item.id]>1)n[item.id]--;else delete n[item.id];return n;});
  const resetOrder = () => { setStep(0); setCart({}); setSessionOrderId(null); };

  const passengerTabs = [
    { id:'order',     icon:'🍽️', label:'Order' },
    { id:'feedback',  icon:'⭐',  label:'Rate' },
    { id:'complaint', icon:'⚠️', label:'Complaint' },
    { id:'help',      icon:'❓', label:'Help' },
  ];

  return (
    <div style={{height:'100%',width:'100%',display:'flex',flexDirection:'column',background:'#f9fafb',overflow:'hidden'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounceIn{0%{opacity:0;transform:scale(.8)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}

        /* Train berth layout styles */
        .berth-compartment{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:8px;margin-bottom:8px}
        .berth-compartment-label{font-size:0.55rem;font-weight:800;color:#9ca3af;letter-spacing:.5px;margin-bottom:6px;text-transform:uppercase}
        .berth-main-row{display:grid;grid-template-columns:1fr 1fr 8px 1fr 1fr;gap:3px;margin-bottom:3px;align-items:center}
        .berth-side-row{display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px;padding-top:4px;border-top:1px dashed #f3f4f6}
        .berth-seat{border-radius:6px;padding:5px 3px;text-align:center;cursor:pointer;transition:all .15s;border:1.5px solid transparent;position:relative}
        .berth-seat:hover{transform:scale(1.05)}
        .berth-seat-no{font-size:0.62rem;font-weight:800;display:block}
        .berth-seat-type{font-size:0.48rem;font-weight:700;display:block;margin-top:1px;opacity:.8}
        .berth-aisle{width:8px;height:100%;background:repeating-linear-gradient(to bottom,#f3f4f6 0,#f3f4f6 4px,transparent 4px,transparent 8px);border-radius:2px}
      `}</style>

      {/* Tab bar */}
      <div style={{display:'flex',background:'#fff',borderBottom:'2px solid #f3f4f6',flexShrink:0,zIndex:10}}>
        {passengerTabs.map(t => (
          <button key={t.id} onClick={()=>setPassengerTab(t.id)}
            style={{flex:1,border:'none',background:'none',padding:'9px 4px 7px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,
              borderBottom:`2px solid ${passengerTab===t.id?T.orange:'transparent'}`,marginBottom:-2,transition:'all .2s'}}>
            <span style={{fontSize:'1rem'}}>{t.icon}</span>
            <span style={{fontSize:'0.58rem',fontWeight:passengerTab===t.id?800:600,color:passengerTab===t.id?T.orange:'#9ca3af',whiteSpace:'nowrap'}}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        {passengerTab==='order' && (
          <>
            {step===0 && <PCoachSeatSelect trainNo={prefillTrain} onNext={info=>{setUserInfo({...userInfo,...info});setStep(1);}}/>}
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
        {passengerTab==='feedback'  && <PFeedback  userInfo={userInfo} onDone={()=>setPassengerTab('order')}/>}
        {passengerTab==='complaint' && <PComplaint userInfo={userInfo} onDone={()=>setPassengerTab('order')}/>}
        {passengerTab==='help'      && <PHelpPage  onContact={()=>setPassengerTab('complaint')}/>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STEP 0: Coach + Seat selector — REAL TRAIN LAYOUT
   Train is already known from QR, just pick coach & berth
══════════════════════════════════════════════════════════════ */
function PCoachSeatSelect({ trainNo, onNext }) {
  const [station, setStation] = useState('');
  const [platform, setPlatform] = useState('');
  const [coach, setCoach] = useState('');
  const [seat, setSeat] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  const trainName = TRAIN_NAMES[trainNo] || 'Express Train';

  const validate = () => {
    const e = {};
    if (!station) e.station = true;
    if (!coach)   e.coach   = true;
    if (!seat)    e.seat    = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext({ coach, seat: String(seat), name });
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
    border: `1.5px solid ${errors[field] ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: 8, fontSize: '0.9rem', color: T.text,
    background: errors[field] ? '#fef2f2' : '#fff', outline: 'none',
  });

  const selectStyle = (field) => ({
    ...inputStyle(field),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28,
  });

  const STATIONS = ['Nagpur','Wardha','Sewagram','Bhusawal','Igatpuri','Kalyan','Mumbai CSMT'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#c2410c,#e65c00)',padding:'12px 16px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:'1.4rem'}}>🚂</span>
            <div>
              <div style={{fontSize:'0.56rem',color:'rgba(255,255,255,.7)',fontWeight:700,letterSpacing:'1px'}}>TRAIN</div>
              <div style={{fontSize:'1rem',fontWeight:900,color:'#fff',lineHeight:1.1}}>{trainNo}</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:'0.75rem',fontWeight:800,color:'#fff'}}>{trainName}</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(255,255,255,.2)',padding:'2px 9px',borderRadius:99,marginTop:4}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80'}}/>
              <span style={{fontSize:'0.58rem',fontWeight:800,color:'#fff'}}>QR Verified · On Board</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 14px 0'}}>

        {/* Train Number */}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>🚂 TRAIN NUMBER *</label>
          <input value={trainNo} readOnly style={{...inputStyle(null),background:'#f3f4f6',color:T.textMid,cursor:'not-allowed'}}/>
        </div>

        {/* Station */}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>📍 CURRENT STATION / STOP *</label>
          <select value={station} onChange={e=>{setStation(e.target.value);setErrors(p=>({...p,station:false}))}} style={selectStyle('station')}>
            <option value="">Select your current stop</option>
            {STATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.station && <div style={{fontSize:'0.62rem',color:'#ef4444',marginTop:3}}>Required</div>}
        </div>

        {/* Platform */}
        {/* <div style={{marginBottom:12}}>
          <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
            🅿️ PLATFORM NO <span style={{fontWeight:400,color:T.textLight}}>(optional)</span>
          </label>
          <input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="e.g. 2" style={{...inputStyle(null),width:120}}/>
        </div> */}

        {/* Coach + Seat */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          <div>
            <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>🚃 COACH *</label>
            <select value={coach} onChange={e=>{setCoach(e.target.value);setErrors(p=>({...p,coach:false}))}} style={selectStyle('coach')}>
              <option value="">Select</option>
              {COACH_GROUPS.map(grp => (
                <optgroup key={grp.label} label={grp.label}>
                  {grp.coaches.map(c => <option key={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
            {errors.coach && <div style={{fontSize:'0.62rem',color:'#ef4444',marginTop:3}}>Required</div>}
          </div>
          <div>
            <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>💺 SEAT NO *</label>
            <input type="number" min={1} max={72} value={seat} onChange={e=>{setSeat(e.target.value);setErrors(p=>({...p,seat:false}))}} placeholder="e.g. 45" style={inputStyle('seat')}/>
            {errors.seat && <div style={{fontSize:'0.62rem',color:'#ef4444',marginTop:3}}>Required</div>}
          </div>
        </div>

        {/* Name (optional) */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
            👤 NAME <span style={{fontWeight:400,color:T.textLight}}>(optional)</span>
          </label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rahul Sharma" style={inputStyle(null)}/>
        </div>

        {/* Benefits */}
        <div style={{marginBottom:6}}>
          <div style={{fontSize:'0.62rem',fontWeight:800,color:T.textMid,letterSpacing:'.5px',marginBottom:8}}>WHY ORDER WITH US?</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
            {[['🚀','Fast Delivery','Hot food at your seat'],['💯','Indian Railway Certified','Verified vendors only'],['📱','Easy Payment','UPI & Cash accepted'],['🌿','Veg & Non-Veg','Wide menu choice']].map(([icon,title,sub])=>(
              <div key={title} style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:8,padding:'10px 11px',display:'flex',alignItems:'flex-start',gap:9}}>
                <span style={{fontSize:'1.2rem',flexShrink:0}}>{icon}</span>
                <div>
                  <div style={{fontSize:'0.72rem',fontWeight:800,color:T.text}}>{title}</div>
                  <div style={{fontSize:'0.62rem',color:T.textSub}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'10px 14px 14px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <button onClick={handleNext}
          style={{width:'100%',padding:13,background:'linear-gradient(135deg,#e65c00,#f9a825)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.9rem',fontWeight:800,cursor:'pointer'}}>
          🍽️ View Menu →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MENU
══════════════════════════════════════════════════════════════ */
function PMenu({ userInfo, cart, onAdd, onRem, onNext, onBack }) {
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
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
function PCart({ cart, onAdd, onRem, onBack, onNext }) {
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
          {[['Item Total',`₹${total}`],['Delivery','FREE ✓'],['Indian Railway Catering Fee','Included']].map(([k,v]) => (
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
}

/* ══════════════════════════════════════════════════════════════
   PAYMENT
══════════════════════════════════════════════════════════════ */
function PPay({ total, eta, onBack, onNext }) {
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
}

/* ══════════════════════════════════════════════════════════════
   TRACKING
══════════════════════════════════════════════════════════════ */
const PTRACK = [
  { label:'Order Placed',      icon:'📋', sub:'Received your order' },
  { label:'Vendor Assigned',   icon:'👨‍🍳', sub:'Preparing your food' },
  { label:'Preparing',         icon:'🍳', sub:'Being freshly made' },
  { label:'Out for Delivery',  icon:'🚶', sub:'On the way to your seat' },
  { label:'Delivered',         icon:'✅', sub:'Enjoy your meal! 🍽️' },
];

/* ══════════════════════════════════════════════════════════════
   STEP 4 — TRACKING  (Firebase-aware version)
   
   Replace your existing PTrack function with this one.
   
   Changes vs original:
   ─ Steps 0→1→2 still auto-advance on timers (unchanged)
   ─ Step 3 "Out for Delivery" → waits for vendor to click "📦 Pack"
     (Firestore status becomes "Packed")
   ─ Step 4 "Delivered"        → waits for vendor to click "✅ Deliver"
     (Firestore status becomes "Delivered")
   ─ useStore(s => s.orders) is already wired to onSnapshot in your
     store.js, so this reacts to vendor changes in real-time.
   ─ actions.addOrder is async — awaited properly.
   ─ Nothing else changed (UI, styles, buttons are identical).
══════════════════════════════════════════════════════════════ */

function PTrack({ userInfo, orderInfo, payMethod, cart, onSetOrderId, onFeedback, onComplaint, onReset }) {
  const [cur, setCur]     = useState(0);
  const [orderId]         = useState(() => genId('IRCTC'));
  const [orderReady, setOrderReady] = useState(false); // true after addOrder resolves
  const done = cur === PTRACK.length - 1;

  // Subscribe to live orders from Firestore (via your store's onSnapshot bridge)
  const storeOrders = useStore(s => s.orders);

  const onSetOrderIdRef = useRef(onSetOrderId);
  useEffect(() => { onSetOrderIdRef.current = onSetOrderId; }, [onSetOrderId]);

  // ── Place order in Firestore + start timers for steps 0-2 ──
  useEffect(() => {
    const items = Object.entries(cart).map(([id, qty]) => ({
      name:  MENU.find(m => m.id === +id)?.name  || '',
      qty,
      price: MENU.find(m => m.id === +id)?.price || 0,
    }));
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);

    // Write to Firestore (async — fire and don't block UI)
    actions.addOrder({
      id:            orderId,
      trainNo:       userInfo.train,
      seat:          `${userInfo.coach}-${userInfo.seat}`,
      coach:         userInfo.coach,
      items,
      total,
      status:        'Pending',
      time:          now(),
      payment:       payMethod === 'upi' ? 'UPI' : 'Cash',
      vendorId:      'V001',
      agentId:       null,
      passengerName: userInfo.name || 'Passenger',
    }).then(() => {
      setOrderReady(true);
      if (onSetOrderIdRef.current) onSetOrderIdRef.current(orderId);
    });

    // Auto-advance steps 0 → 1 → 2 (timers, same as before)
    const t0 = setTimeout(() => setCur(0), 0);
    const t1 = setTimeout(() => setCur(1), 3000);
    const t2 = setTimeout(() => setCur(2), 7500);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Watch Firestore for vendor status changes → advance steps 3 & 4 ──
  useEffect(() => {
    if (!orderReady) return; // wait until our doc is in Firestore
    const order = storeOrders.find(o => o.id === orderId);
    if (!order) return;

    if ((order.status === 'Packed' || order.status === 'Delivered') && cur < 3) {
      setCur(3); // vendor clicked "📦 Pack" → Out for Delivery
    }
    if (order.status === 'Delivered' && cur < 4) {
      setCur(4); // vendor clicked "✅ Deliver" → Delivered
    }
  }, [storeOrders, orderId, orderReady, cur]);

  // ── UI — identical to your original ──
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>

        {/* Order summary card */}
        <div style={{background:'linear-gradient(135deg,#c2410c,#e65c00,#f9a825)',borderRadius:12,padding:'13px',color:'#fff',marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:9}}>
            <div>
              <div style={{fontSize:'0.56rem',opacity:.8}}>ORDER ID</div>
              <div style={{fontWeight:900,fontSize:'0.88rem'}}>{orderId}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'0.56rem',opacity:.8}}>TOTAL</div>
              <div style={{fontWeight:900,fontSize:'0.96rem'}}>₹{orderInfo.total}</div>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',background:'rgba(255,255,255,.12)',borderRadius:8,padding:'6px 10px'}}>
            {[
              ['COACH', userInfo.coach],
              ['BERTH', userInfo.seat],
              ['ETA',   orderInfo.eta],
              ['PAY',   payMethod === 'upi' ? '📱 UPI' : '💵 Cash'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{fontSize:'0.52rem',opacity:.75}}>{k}</div>
                <div style={{fontWeight:800,fontSize:'0.7rem'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live tracking steps */}
        <p style={{fontSize:'0.66rem',fontWeight:800,color:T.textMid,marginBottom:9,letterSpacing:'.5px'}}>🔴 LIVE TRACKING</p>
        <div style={{background:'#fff',borderRadius:12,padding:'13px',border:'1px solid #f3f4f6',marginBottom:12}}>
          {PTRACK.map((step, i) => {
            const isDone   = i < cur;
            const isActive = i === cur;
            // Steps 3 & 4 not yet reached — show a "waiting for vendor" hint
            const waitingForVendor = i >= 3 && cur < i;

            return (
              <div key={i} style={{display:'flex',gap:9,paddingBottom:i < PTRACK.length - 1 ? 16 : 0,position:'relative'}}>
                {/* Connector line */}
                {i < PTRACK.length - 1 && (
                  <div style={{
                    position:'absolute',left:14,top:32,width:2,
                    height:'calc(100% - 16px)',
                    background: isDone ? T.orange : '#f3f4f6',
                    transition:'background .5s',
                  }}/>
                )}

                {/* Step circle */}
                <div style={{
                  width:30,height:30,borderRadius:'50%',flexShrink:0,zIndex:1,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize: isDone ? '0.72rem' : '0.88rem',
                  background: isDone || isActive ? T.orange : '#f9fafb',
                  border: `2px solid ${isDone || isActive ? T.orange : '#e5e7eb'}`,
                  transition:'all .4s',
                  color: isDone || isActive ? '#fff' : '#9ca3af',
                  fontWeight:800,
                }}>
                  {isDone ? '✓' : step.icon}
                </div>

                {/* Step label */}
                <div style={{paddingTop:3}}>
                  <div style={{fontSize:'0.78rem',fontWeight:800,color: isDone || isActive ? T.text : '#9ca3af',display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                    {step.label}

                    {isActive && (
                      <span style={{fontSize:'0.52rem',fontWeight:800,background:'#fff7ed',color:T.orange,padding:'1px 6px',borderRadius:99,border:'1px solid #fed7aa'}}>
                        NOW
                      </span>
                    )}

                    {/* Waiting hints — only shown before vendor acts */}
                    {waitingForVendor && i === 3 && (
                      <span style={{fontSize:'0.52rem',fontWeight:700,background:'#f3f4f6',color:'#9ca3af',padding:'1px 6px',borderRadius:99}}>
                        ⏳ Vendor packing
                      </span>
                    )}
                    {waitingForVendor && i === 4 && (
                      <span style={{fontSize:'0.52rem',fontWeight:700,background:'#f3f4f6',color:'#9ca3af',padding:'1px 6px',borderRadius:99}}>
                        ⏳ Awaiting delivery
                      </span>
                    )}
                  </div>

                  {(isDone || isActive) && (
                    <div style={{fontSize:'0.63rem',color:T.textSub,marginTop:1}}>{step.sub}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivered celebration card */}
        {done && (
          <div style={{background:'linear-gradient(135deg,#fff7ed,#fef9c3)',borderRadius:12,padding:'18px',textAlign:'center',border:'1px solid #fed7aa',marginBottom:12}}>
            <div style={{fontSize:'2.2rem',marginBottom:5}}>🎉</div>
            <div style={{fontWeight:900,color:'#c2410c',fontSize:'1.05rem',marginBottom:3}}>Order Delivered!</div>
            <p style={{fontSize:'0.68rem',color:'#9a3412',marginBottom:11}}>Hope you enjoy your meal 🍽️</p>
            {payMethod === 'cod' && (
              <div style={{marginBottom:11,padding:'7px 11px',background:'#fff',borderRadius:8,border:'1px solid #fed7aa',fontSize:'0.68rem',color:'#9a3412',fontWeight:700}}>
                💵 Please pay ₹{orderInfo.total} to the delivery agent
              </div>
            )}
            <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:9}}>
              <button onClick={onFeedback}
                style={{padding:'9px 16px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:8,fontWeight:800,cursor:'pointer',fontSize:'0.76rem'}}>
                ⭐ Rate Order
              </button>
              <button onClick={onComplaint}
                style={{padding:'9px 13px',background:'#fff',color:T.red,border:`1.5px solid ${T.red}`,borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.76rem'}}>
                ⚠️ Complaint
              </button>
            </div>
            <button onClick={onReset}
              style={{padding:'7px 18px',background:'#f3f4f6',color:T.textMid,border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>
              ↺ Order Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEEDBACK
══════════════════════════════════════════════════════════════ */
function PFeedback({ userInfo }) {
  const allFeedback = useStore(s => s.feedback);
  const [mode, setMode]           = useState('list');
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
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:7,padding:'5px 9px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700}}>← Back</button>
          <div>
            <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px'}}>RATE YOUR EXPERIENCE</p>
            <p style={{fontSize:'0.96rem',fontWeight:900,color:'#fff'}}>How was your order? ⭐</p>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div><label className="field-label">Your Name</label><input className="field-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/></div>
          <div><label className="field-label">Seat</label><input className="field-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/></div>
        </div>

        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'18px',textAlign:'center',marginBottom:12}}>
          <p style={{fontSize:'0.76rem',fontWeight:800,color:T.text,marginBottom:11}}>Overall Rating *</p>
          <div style={{display:'flex',justifyContent:'center',gap:9,marginBottom:9}}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={()=>setRating(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                style={{fontSize:'2rem',cursor:'pointer',transition:'transform .15s',transform:(hover||rating)>=n?'scale(1.25)':'scale(1)',filter:(hover||rating)>=n?'none':'grayscale(1)',userSelect:'none'}}>⭐</span>
            ))}
          </div>
          {rating>0 && <div style={{fontSize:'0.83rem',fontWeight:800,color:T.purple}}>{['','😟 Terrible','😕 Bad','😐 Okay','😊 Good','🤩 Excellent!'][rating]}</div>}
        </div>

        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12}}>
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

        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12}}>
          <p style={{fontSize:'0.73rem',fontWeight:800,color:T.text,marginBottom:7}}>Add a comment</p>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Tell us about food quality, delivery time…"
            style={{width:'100%',padding:'9px 11px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.8rem',color:T.text,background:'#f9fafb',outline:'none',resize:'none',minHeight:76,boxSizing:'border-box',fontFamily:'sans-serif',lineHeight:1.5}}/>
        </div>

        <div style={{marginBottom:14}}>
          <p style={{fontSize:'0.62rem',fontWeight:700,color:T.textLight,marginBottom:7,letterSpacing:'.5px'}}>QUICK PHRASES</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
            {['Food was hot 🔥','Delivered fast ⚡','Great packaging 📦','Friendly vendor 😊','Good value 💰'].map(p => (
              <button key={p} onClick={()=>setMsg(prev=>prev?prev+'. '+p:p)}
                style={{padding:'4px 9px',borderRadius:7,border:'1px solid #e5e7eb',background:'#f9fafb',color:T.textMid,fontSize:'0.66rem',fontWeight:600,cursor:'pointer'}}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:'9px 14px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <button onClick={submit} disabled={!rating||submitting}
          style={{width:'100%',padding:12,background:!rating?'#e5e7eb':`linear-gradient(135deg,${T.purple},#a855f7)`,color:!rating?T.textSub:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:!rating?'not-allowed':'pointer',fontSize:'0.86rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
          {submitting ? <><span style={{width:11,height:11,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Submitting…</> : '⭐ Submit Feedback'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#7c3aed,#a855f7)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>FEEDBACK PORTAL</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:10}}>Passenger Reviews ⭐</p>
        <div style={{display:'flex',gap:10}}>
          {[['Avg','⭐ '+avgRating],['Reviews',allFeedback.length],['Happy 4+',allFeedback.filter(f=>f.rating>=4).length]].map(([label,val]) => (
            <div key={label} style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
              <div style={{fontSize:'1.4rem',fontWeight:900,color:'#fff'}}>{val}</div>
              <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <p style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>Recent Reviews</p>
          <button onClick={()=>setMode('form')} style={{padding:'6px 13px',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>✏️ Write Review</button>
        </div>
        {allFeedback.length===0 && (
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>⭐</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:T.text,marginBottom:4}}>No reviews yet</p>
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
}

/* ══════════════════════════════════════════════════════════════
   COMPLAINT
══════════════════════════════════════════════════════════════ */
function PComplaint({ userInfo }) {
  const allComplaints = useStore(s => s.complaints);
  const [mode, setMode]           = useState('list');
  const [issue, setIssue]         = useState('');
  const [custom, setCustom]       = useState('');
  const [priority, setPriority]   = useState('');
  const [nameInput, setNameInput] = useState(userInfo?.name || '');
  const [seatInput, setSeatInput] = useState(userInfo?.seat ? `${userInfo.coach}-${userInfo.seat}` : '');
  const [submitting, setSub]      = useState(false);
  const [done, setDone]           = useState(false);
  const [ticketId]                = useState(()=>genId('TKT'));

  const issues = [
    { label:'Food was cold or stale',    icon:'🥶' },
    { label:'Wrong item delivered',       icon:'❌' },
    { label:'Overcharged / extra amount', icon:'💸' },
    { label:'Delayed delivery',           icon:'⏰' },
    { label:'Unhygienic packaging',       icon:'🧴' },
    { label:'Vendor was rude',            icon:'😠' },
    { label:'Item missing from order',    icon:'📦' },
    { label:'Other issue',                icon:'📝' },
  ];
  const priorities = ['Low — Just letting you know','Medium — Please look into it','High — Needs immediate attention'];

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
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',borderRadius:7,padding:'5px 9px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700}}>← Back</button>
          <div>
            <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px'}}>FILE A COMPLAINT</p>
            <p style={{fontSize:'0.96rem',fontWeight:900,color:'#fff'}}>We'll resolve it ASAP ⚡</p>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div><label className="field-label">Your Name</label><input className="field-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/></div>
          <div><label className="field-label">Seat</label><input className="field-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/></div>
        </div>
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #f3f4f6',padding:'13px',marginBottom:12}}>
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
            {priorities.map((p,i) => {
              const colors=['#16a34a','#f59e0b','#dc2626'];
              return (
                <div key={p} onClick={()=>setPriority(p)}
                  style={{padding:'7px 11px',border:`1.5px solid ${priority===p?colors[i]:'#e5e7eb'}`,borderRadius:8,cursor:'pointer',background:priority===p?`${colors[i]}15`:'#f9fafb',display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:colors[i],flexShrink:0}}/>
                  <span style={{fontSize:'0.73rem',fontWeight:priority===p?700:500,color:priority===p?colors[i]:T.textMid}}>{p}</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'9px 11px',marginBottom:14,display:'flex',gap:7}}>
          <span>ℹ️</span>
          <p style={{fontSize:'0.66rem',color:'#1e40af',lineHeight:1.5}}>Our Indian Railway team reviews complaints within 2 hours. Urgent: call <strong>1800-111-139</strong></p>
        </div>
      </div>
      <div style={{padding:'9px 14px 13px',background:'#fff',borderTop:'1px solid #f3f4f6',flexShrink:0}}>
        <button onClick={submit} disabled={!issue||(issue==='Other issue'&&!custom)||submitting}
          style={{width:'100%',padding:12,background:!issue?'#e5e7eb':`linear-gradient(135deg,${T.red},#f97316)`,color:!issue?T.textSub:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:!issue?'not-allowed':'pointer',fontSize:'0.86rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
          {submitting ? <><span style={{width:11,height:11,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Submitting…</> : '⚠️ Submit Complaint'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#991b1b,#dc2626)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>COMPLAINT PORTAL</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:10}}>Your Complaints ⚠️</p>
        <div style={{display:'flex',gap:10}}>
          {[['Open',allComplaints.filter(c=>c.status==='Open').length],['Resolved',allComplaints.filter(c=>c.status==='Resolved').length],['Avg Resolve','2h']].map(([label,val]) => (
            <div key={label} style={{background:'rgba(255,255,255,.18)',borderRadius:10,padding:'8px 12px',flex:1,textAlign:'center'}}>
              <div style={{fontSize:'1.4rem',fontWeight:900,color:'#fff'}}>{val}</div>
              <div style={{fontSize:'0.58rem',color:'rgba(255,255,255,.75)'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <p style={{fontWeight:800,fontSize:'0.8rem',color:T.text}}>All Complaints</p>
          <button onClick={()=>setMode('form')} style={{padding:'6px 13px',background:'linear-gradient(135deg,#dc2626,#f97316)',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem'}}>+ File Complaint</button>
        </div>
        {allComplaints.length===0 && (
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>🎉</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:T.text,marginBottom:4}}>No complaints!</p>
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
}

/* ══════════════════════════════════════════════════════════════
   HELP
══════════════════════════════════════════════════════════════ */
function PHelpPage({ onContact }) {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q:'How do I order food?', a:'Tap the "Order" tab → select your coach & berth → browse the menu → add items to cart → pay via UPI or cash on delivery.' },
    { q:'Can I change my order after placing it?', a:'Once confirmed, orders cannot be modified. Please contact the vendor directly or file a complaint if there is an issue.' },
    { q:'How long does delivery take?', a:'Typically 8–22 minutes after order confirmation, depending on preparation time and your coach location.' },
    { q:'Is cash on delivery available?', a:'Yes! Select "Cash on Delivery" at checkout. Keep the exact amount ready for the delivery agent.' },
    { q:'What if my food is cold or wrong?', a:'Tap the Complaint tab and file a complaint with details. Our team responds within 2 hours.' },
    { q:'How do I rate my experience?', a:'After delivery, tap the ⭐ Rate tab and submit your rating and comments.' },
    { q:'Are the prices fixed by IRCTC?', a:'Yes, all prices displayed are official IRCTC-approved rates. Any overcharging should be reported immediately.' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#0f4c81,#1d4ed8)',padding:'14px 18px',flexShrink:0}}>
        <p style={{fontSize:'0.56rem',fontWeight:800,color:'rgba(255,255,255,.7)',letterSpacing:'2px',marginBottom:2}}>HELP & SUPPORT</p>
        <p style={{fontSize:'1.1rem',fontWeight:900,color:'#fff'}}>How can we help? ❓</p>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
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
        <div style={{background:'linear-gradient(135deg,#fef2f2,#fff7ed)',border:'1px solid #fecaca',borderRadius:12,padding:'13px',marginTop:6,marginBottom:14}}>
          <p style={{fontWeight:800,fontSize:'0.78rem',color:T.red,marginBottom:6}}>🚨 Emergency Contacts</p>
          {[['Indian Railway Catering Helpline','1800-111-139'],['Railway General Helpline','139'],['Women Safety Helpline','182']].map(([label,num]) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:'0.72rem'}}>
              <span style={{color:T.textMid}}>{label}</span>
              <span style={{fontWeight:800,color:T.red}}>{num}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}