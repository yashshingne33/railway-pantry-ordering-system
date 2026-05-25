import { useState, useEffect, useRef } from "react";
import { Badge, QtyCtrl } from "./store";
import { useStore, actions, MENU, CATS, COACH_GROUPS, TRAIN_NAMES, T, genId, now, stars, useTrainMenu } from "./store";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Indian Railways Premium Theme
   Navy Blue + Gold + Ivory
═══════════════════════════════════════════════════════════ */
const IR = {
  navy:        '#1a2a6c',
  navyDark:    '#0f1a4a',
  navyMid:     '#233080',
  navyLight:   '#2d3e9e',
  gold:        '#c9a84c',
  goldLight:   '#e8c97a',
  goldDark:    '#a07830',
  ivory:       '#fdf8f0',
  ivoryDark:   '#f5eedc',
  white:       '#ffffff',
  text:        '#1a1a2e',
  textMid:     '#374160',
  textSub:     '#5a6480',
  textLight:   '#8a93b0',
  green:       '#1a7a4a',
  greenLight:  '#e8f5ee',
  red:         '#c0392b',
  redLight:    '#fdf0ee',
  border:      '#dde3f0',
  borderLight: '#eef1f8',
  surface:     '#f8f9fd',
  orange:      '#e07b39',
  purple:      '#5c3d9e',
};

/* ═══════════════════════════════════════════════════════════
   SHARED STYLES
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Nunito:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes bounceIn { 0%{opacity:0;transform:scale(.85)} 60%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.6} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .ir-passenger { font-family:'Nunito',sans-serif; background:#f8f9fd; }

  /* Tab bar */
  .ir-tab-bar { display:flex; background:#1a2a6c; border-bottom:2px solid #c9a84c; flex-shrink:0; position:relative; z-index:20; }
  .ir-tab-btn { flex:1; border:none; background:none; padding:10px 4px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; position:relative; transition:all .2s; }
  .ir-tab-btn.active::after { content:''; position:absolute; bottom:-2px; left:10%; right:10%; height:2px; background:#c9a84c; border-radius:2px 2px 0 0; }
  .ir-tab-icon { font-size:0.9rem; font-weight:900; font-family:'Rajdhani',sans-serif; line-height:1; }
  .ir-tab-label { font-size:0.6rem; font-weight:800; letter-spacing:.5px; text-transform:uppercase; white-space:nowrap; }

  /* IR Header */
  .ir-header { background:linear-gradient(135deg,#0f1a4a 0%,#233080 60%,#2d3e9e 100%); position:relative; overflow:hidden; flex-shrink:0; }
  .ir-header::before { content:''; position:absolute; top:-30px; right:-30px; width:120px; height:120px; border-radius:50%; border:2px solid rgba(201,168,76,.15); }
  .ir-header::after  { content:''; position:absolute; top:-10px; right:-10px; width:70px; height:70px; border-radius:50%; border:1px solid rgba(201,168,76,.1); }

  /* Train badge */
  .ir-train-badge { background:rgba(255,255,255,.1); border:1px solid rgba(201,168,76,.3); border-radius:10px; padding:7px 11px; display:flex; align-items:center; gap:9px; }
  .ir-train-no { font-family:'Rajdhani',sans-serif; font-size:1.3rem; font-weight:700; color:#c9a84c; line-height:1; }
  .ir-train-name { font-size:0.7rem; font-weight:800; color:#fff; }
  .ir-verified-pill { display:inline-flex; align-items:center; gap:4px; background:rgba(26,122,74,.4); border:1px solid rgba(26,200,100,.3); padding:2px 8px; border-radius:99px; margin-top:3px; }

  /* Gold separator */
  .ir-gold-line { height:2px; background:linear-gradient(90deg,transparent,#c9a84c,transparent); }

  /* Info bar */
  .ir-info-bar { background:#fdf8f0; border-bottom:1px solid #f5eedc; padding:6px 14px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .ir-info-chips { display:flex; gap:5px; align-items:center; flex-wrap:wrap; }
  .ir-chip { display:inline-flex; align-items:center; gap:4px; background:#2d3e9e; color:#fff; padding:3px 9px; border-radius:5px; font-size:0.6rem; font-weight:800; letter-spacing:.3px; }

  /* Input / Select */
  .ir-input { width:100%; padding:10px 13px; border:1.5px solid #dde3f0; border-radius:9px; font-size:0.88rem; font-family:'Nunito',sans-serif; color:#1a1a2e; background:#fff; outline:none; transition:border-color .2s,box-shadow .2s; }
  .ir-input:focus { border-color:#2d3e9e; box-shadow:0 0 0 3px rgba(45,62,158,.1); }
  .ir-input.error { border-color:#c0392b; background:#fdf0ee; }
  .ir-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%231a2a6c' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 11px center; padding-right:30px; }

  /* Buttons */
  .ir-btn-primary { width:100%; padding:13px; background:linear-gradient(135deg,#0f1a4a,#2d3e9e); color:#fff; border:none; border-radius:10px; font-family:'Nunito',sans-serif; font-size:0.9rem; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; position:relative; overflow:hidden; transition:opacity .2s; }
  .ir-btn-primary::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent); transition:left .5s; }
  .ir-btn-primary:hover::before { left:100%; }
  .ir-btn-primary .btn-gold-accent { background:#c9a84c; color:#0f1a4a; padding:2px 10px; border-radius:99px; font-size:0.68rem; font-weight:900; }
  .ir-btn-secondary { padding:10px 14px; background:#fff; border:1.5px solid #dde3f0; border-radius:9px; font-family:'Nunito',sans-serif; color:#374160; font-weight:700; cursor:pointer; font-size:0.78rem; transition:all .2s; }
  .ir-btn-secondary:hover { border-color:#2d3e9e; color:#1a2a6c; }

  /* Cards */
  .ir-card { background:#fff; border-radius:12px; border:1px solid #eef1f8; box-shadow:0 2px 10px rgba(26,42,108,.06); }
  .ir-card-navy { background:linear-gradient(135deg,#0f1a4a,#233080); border-radius:12px; color:#fff; }

  /* Section label */
  .ir-section-label { font-size:0.62rem; font-weight:800; color:#8a93b0; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .ir-section-label::before { content:''; display:inline-block; width:3px; height:14px; background:#c9a84c; border-radius:2px; }

  /* Category pills */
  .ir-cat-pill { padding:5px 12px; border-radius:7px; border:none; cursor:pointer; font-size:0.68rem; font-weight:700; white-space:nowrap; transition:all .18s; font-family:'Nunito',sans-serif; }
  .ir-cat-pill.active { background:#1a2a6c; color:#fff; }
  .ir-cat-pill.inactive { background:#fff; color:#374160; border:1px solid #dde3f0; }
  .ir-cat-pill:hover:not(.active) { border-color:#2d3e9e; color:#1a2a6c; }

  /* Veg toggle */
  .ir-veg-btn { padding:5px 11px; border-radius:7px; font-size:0.68rem; font-weight:800; cursor:pointer; font-family:'Nunito',sans-serif; display:flex; align-items:center; gap:5px; transition:all .18s; flex-shrink:0; }

  /* Menu item card */
  .ir-menu-item { background:#fff; border-radius:11px; border:1px solid #eef1f8; padding:10px; display:flex; gap:10px; align-items:flex-start; box-shadow:0 1px 4px rgba(26,42,108,.05); transition:box-shadow .2s; }
  .ir-menu-item:hover { box-shadow:0 4px 14px rgba(26,42,108,.1); }
  .ir-menu-thumb { width:58px; height:58px; border-radius:9px; flex-shrink:0; background:#f5eedc; display:flex; align-items:center; justify-content:center; overflow:hidden; }

  /* Popular card */
  .ir-pop-card { flex-shrink:0; width:115px; background:#fff; border-radius:12px; border:1px solid #eef1f8; overflow:hidden; box-shadow:0 2px 8px rgba(26,42,108,.07); }
  .ir-pop-thumb { height:58px; background:#f5eedc; display:flex; align-items:center; justify-content:center; overflow:hidden; }

  /* Popular row — horizontal scroll, no visible scrollbar */
  .ir-pop-row { display:flex; gap:9px; overflow-x:auto; padding-bottom:4px; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; }
  .ir-pop-row::-webkit-scrollbar { display:none; }

  /* Filter bar — horizontal scroll, no visible scrollbar */
  .ir-filter-bar { display:flex; align-items:center; padding:8px 13px; gap:6px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; }
  .ir-filter-bar::-webkit-scrollbar { display:none; }

  /* Hot badge */
  .ir-hot { font-size:0.5rem; font-weight:900; padding:2px 6px; background:linear-gradient(135deg,#e07b39,#f9a825); color:#fff; border-radius:4px; letter-spacing:.3px; }
  .ir-new { font-size:0.5rem; font-weight:900; padding:2px 6px; background:linear-gradient(135deg,#2d3e9e,#1a2a6c); color:#fff; border-radius:4px; }

  /* Veg/NonVeg dot */
  .ir-veg-dot { width:9px; height:9px; border-radius:2px; border:2px solid; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ir-veg-dot.veg { border-color:#1a7a4a; }
  .ir-veg-dot.nonveg { border-color:#c0392b; }
  .ir-veg-dot::after { content:''; width:4px; height:4px; border-radius:50%; }
  .ir-veg-dot.veg::after { background:#1a7a4a; }
  .ir-veg-dot.nonveg::after { background:#c0392b; }

  /* Tracking steps */
  .ir-track-step { display:flex; gap:10px; position:relative; }
  .ir-track-circle { width:34px; height:34px; border-radius:50%; flex-shrink:0; z-index:1; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-family:'Rajdhani',sans-serif; font-weight:700; letter-spacing:.5px; transition:all .4s; }
  .ir-track-circle.done { background:#1a7a4a; border:2px solid #1a7a4a; color:#fff; font-size:0.82rem; font-weight:900; }
  .ir-track-circle.active { background:#1a2a6c; border:2px solid #c9a84c; color:#c9a84c; box-shadow:0 0 0 4px rgba(201,168,76,.2); }
  .ir-track-circle.pending { background:#fff; border:2px solid #dde3f0; color:#8a93b0; }

  /* Benefits grid */
  .ir-benefit { background:#f8f9fd; border:1px solid #eef1f8; border-radius:9px; padding:10px 12px; display:flex; align-items:flex-start; gap:9px; }
  .ir-benefit-icon { font-size:1.3rem; flex-shrink:0; }

  /* Star rating */
  .ir-star { font-size:1.9rem; cursor:pointer; transition:transform .15s; user-select:none; }
  .ir-star.lit { filter:none; transform:scale(1.2); }
  .ir-star.dim { filter:grayscale(1) opacity(.5); }

  /* FAQ */
  .ir-faq-item { background:#fff; border-radius:10px; border:1px solid #eef1f8; margin-bottom:7px; overflow:hidden; }
  .ir-faq-btn { width:100%; padding:11px 13px; background:none; border:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:9px; text-align:left; font-family:'Nunito',sans-serif; }

  /* Pay card */
  .ir-pay-option { border:1.5px solid #dde3f0; border-radius:11px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:#fff; margin-bottom:9px; transition:all .2s; }
  .ir-pay-option.selected { border-color:#1a2a6c; background:#fdf8f0; box-shadow:0 2px 10px rgba(26,42,108,.1); }
  .ir-pay-radio { width:18px; height:18px; border-radius:50%; border:2px solid #dde3f0; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color .2s; }
  .ir-pay-radio.selected { border-color:#1a2a6c; }

  /* Complaint issue */
  .ir-issue-opt { padding:10px 12px; border:1.5px solid #dde3f0; border-radius:9px; cursor:pointer; background:#fff; display:flex; align-items:center; gap:10px; margin-bottom:5px; transition:all .2s; }
  .ir-issue-opt.selected { border-color:#c0392b; background:#fdf0ee; }

  /* Override QtyCtrl Add button — force navy theme */
  .qty-add-btn, [class*="qty"] button, button[class*="add"] {
    background: #1a2a6c !important;
    color: #fff !important;
    border-color: #1a2a6c !important;
  }
  .ir-passenger button[style*="e65c00"],
  .ir-passenger button[style*="f9a825"],
  .ir-passenger button[style*="orange"] {
    background: #1a2a6c !important;
    border-color: #1a2a6c !important;
  }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#dde3f0; border-radius:3px; }

  /* Footer bar */
  .ir-footer-bar { padding:10px 14px 16px; background:#fff; border-top:1px solid #eef1f8; flex-shrink:0; }
  .ir-footer-bar.safe-bottom { padding-bottom:max(16px,env(safe-area-inset-bottom)); }

  /* Feedback review card */
  .ir-review-card { background:#fff; border-radius:12px; border:1px solid #eef1f8; padding:13px; margin-bottom:9px; box-shadow:0 1px 4px rgba(26,42,108,.04); }

  /* Error message */
  .ir-err { font-size:0.62rem; color:#c0392b; margin-top:3px; font-weight:700; }

  /* Responsive */
  @media(min-width:480px) {
    .ir-cat-pill { font-size:0.72rem; padding:5px 14px; }
    .ir-menu-thumb { width:64px; height:64px; }
    .ir-pop-card { width:128px; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   PASSENGER APP
═══════════════════════════════════════════════════════════ */
export default function PassengerApp({ prefillTrain = '12139' }) {
  const [passengerTab, setPassengerTab] = useState('order');
  const [step, setStep]           = useState(0);
  const [userInfo, setUserInfo]   = useState({ train: prefillTrain, coach:'', seat:'', name:'' });
  const [cart, setCart]           = useState({});
  const [orderInfo, setOrderInfo] = useState({});
  const [payMethod, setPayMethod] = useState('upi');
  const [setSessionOrderId] = useState(null);

  const { menu: trainMenu } = useTrainMenu(prefillTrain);

  const addItem = item => setCart(c => ({...c,[item.id]:(c[item.id]||0)+1}));
  const remItem = item => setCart(c => {const n={...c};if(n[item.id]>1)n[item.id]--;else delete n[item.id];return n;});
  const resetOrder = () => { setStep(0); setCart({}); setSessionOrderId(null); };

  const passengerTabs = [
    { id:'order',     icon:'◈', label:'Order' },
    { id:'feedback',  icon:'◆',  label:'Rate' },
    { id:'complaint', icon:'▲', label:'Complaint' },
    { id:'help',      icon:'?', label:'Help' },
  ];

  return (
    <div className="ir-passenger" style={{height:'100%',width:'100%',display:'flex',flexDirection:'column',overflow:'hidden',maxWidth:'100vw'}}>
      <style>{GLOBAL_CSS}</style>

      {/* Tab bar */}
      <div className="ir-tab-bar">
        {passengerTabs.map(t => (
          <button key={t.id} onClick={()=>setPassengerTab(t.id)} className={`ir-tab-btn${passengerTab===t.id?' active':''}`}>
            <span className="ir-tab-icon">{t.icon}</span>
            <span className="ir-tab-label" style={{color:passengerTab===t.id?IR.gold:'rgba(255,255,255,.55)'}}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        {passengerTab==='order' && (
          <>
            {step===0 && <PCoachSeatSelect trainNo={prefillTrain} onNext={info=>{setUserInfo({...userInfo,...info});setStep(1);}}/>}
            {step===1 && <PMenu trainMenu={trainMenu} userInfo={userInfo} cart={cart} onAdd={addItem} onRem={remItem} onNext={()=>setStep(2)} onBack={()=>setStep(0)}/>}
            {step===2 && <PCart cart={cart} onAdd={addItem} onRem={remItem} onBack={()=>setStep(1)} onNext={(t,e)=>{setOrderInfo({total:t,eta:e});setStep(3);}}/>}
            {step===3 && <PPay total={orderInfo.total} eta={orderInfo.eta} onBack={()=>setStep(2)} onNext={m=>{setPayMethod(m);setStep(4);}}/>}
            {step===4 && <PTrack userInfo={userInfo} orderInfo={orderInfo} payMethod={payMethod} cart={cart}
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

/* ═══════════════════════════════════════════════════════════
   STEP 0: Coach + Seat Select
═══════════════════════════════════════════════════════════ */
function PCoachSeatSelect({ trainNo, onNext }) {
  const [coach, setCoach]   = useState('');
  const [seat, setSeat]     = useState('');
  const [name, setName]     = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});

  const trainName = TRAIN_NAMES[trainNo] || 'Express Train';

  const validate = () => {
    const e = {};
    if (!coach)                              e.coach  = true;
    if (!seat)                               e.seat   = true;
    if (!name.trim())                        e.name   = true;
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) e.mobile = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* Hero Header */}
      <div className="ir-header" style={{padding:'14px 16px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,position:'relative',zIndex:1}}>
          <div className="ir-train-badge">
            <div style={{width:32,height:32,borderRadius:6,background:IR.gold,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'0.65rem',fontWeight:700,color:IR.navyDark,letterSpacing:'.5px',lineHeight:1,textAlign:'center'}}>IR<br/>RAIL</span>
            </div>
            <div>
              <div style={{fontSize:'0.52rem',color:IR.goldLight,fontWeight:800,letterSpacing:'1.5px'}}>TRAIN NO.</div>
              <div className="ir-train-no">{trainNo}</div>
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="ir-train-name">{trainName}</div>
            <div className="ir-verified-pill">
              <span style={{width:5,height:5,borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
              <span style={{fontSize:'0.55rem',fontWeight:900,color:'#fff',letterSpacing:'.5px'}}>QR VERIFIED · ON BOARD</span>
            </div>
          </div>
          <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,.12)',border:`2px solid ${IR.gold}60`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'0.58rem',fontWeight:700,color:IR.gold,textAlign:'center',lineHeight:1.2}}>भारत<br/>रेल</span>
          </div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',padding:'14px 14px 0'}}>

        {/* Train Number (readonly) */}
        <div style={{marginBottom:13}}>
          <div className="ir-section-label">Train Number</div>
          <input readOnly value={trainNo} className="ir-input" style={{background:IR.surface,color:IR.textSub,cursor:'not-allowed',fontWeight:700}}/>
        </div>

        {/* Coach + Seat */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:13}}>
          <div>
            <div className="ir-section-label">Coach <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900}}>*</span></div>
            <select value={coach} onChange={e=>{setCoach(e.target.value);setErrors(p=>({...p,coach:false}))}}
              className={`ir-input ir-select${errors.coach?' error':''}`} style={{fontSize:'0.82rem'}}>
              <option value="">Select</option>
              {COACH_GROUPS.map(grp=>(
                <optgroup key={grp.label} label={grp.label}>
                  {grp.coaches.map(c=><option key={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
            {errors.coach && <div className="ir-err">Required</div>}
          </div>
          <div>
            <div className="ir-section-label">Seat No <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900}}>*</span></div>
            <input type="number" min={1} max={72} value={seat} placeholder="e.g. 45"
              onChange={e=>{setSeat(e.target.value);setErrors(p=>({...p,seat:false}))}}
              className={`ir-input${errors.seat?' error':''}`}/>
            {errors.seat && <div className="ir-err">Required</div>}
          </div>
        </div>

        {/* Name — required */}
        <div style={{marginBottom:12}}>
          <div className="ir-section-label">Passenger Name <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900,marginLeft:2}}>*</span></div>
          <input value={name} onChange={e=>{setName(e.target.value);setErrors(p=>({...p,name:false}))}}
            placeholder="e.g. Rahul Sharma" className={`ir-input${errors.name?' error':''}`}/>
          {errors.name && <div className="ir-err">Please enter your name</div>}
        </div>

        {/* Mobile — required */}
        <div style={{marginBottom:16}}>
          <div className="ir-section-label">Mobile Number <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900,marginLeft:2}}>*</span></div>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:'0.82rem',fontWeight:800,color:IR.textMid,pointerEvents:'none'}}>+91</span>
            <input type="tel" maxLength={10} value={mobile}
              onChange={e=>{setMobile(e.target.value.replace(/\D/g,''));setErrors(p=>({...p,mobile:false}))}}
              placeholder="Enter 10-digit number"
              className={`ir-input${errors.mobile?' error':''}`} style={{paddingLeft:42}}/>
          </div>
          {errors.mobile && <div className="ir-err">Enter a valid 10-digit mobile number</div>}
        </div>

        {/* Benefits */}
        <div style={{marginBottom:6}}>
          <div className="ir-section-label">Why Order With Us?</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
            {[
              ['⚡','Fast Delivery','Hot food at your seat'],
              ['✦','IR Certified','Verified vendors only'],
              ['◈','Easy Payment','UPI & Cash accepted'],
              ['≋','Veg & Non-Veg','Wide menu choice'],
            ].map(([icon,title,sub])=>(
              <div key={title} className="ir-benefit">
                <span className="ir-benefit-icon" style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:IR.navy}}>{icon}</span>
                <div>
                  <div style={{fontSize:'0.72rem',fontWeight:800,color:IR.text}}>{title}</div>
                  <div style={{fontSize:'0.61rem',color:IR.textSub,lineHeight:1.3}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ir-footer-bar safe-bottom">
        <button className="ir-btn-primary" onClick={()=>{if(validate())onNext({coach,seat:String(seat),name,mobile})}}>
          <span className="btn-gold-accent">STEP 1</span>
          View Menu →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1: Menu
═══════════════════════════════════════════════════════════ */
function PMenu({ userInfo, cart, onAdd, onRem, onNext, onBack, trainMenu }) {
  const [cat, setCat]         = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch]   = useState('');

  const liveItems  = trainMenu?.items?.filter(i => i.available !== false) ?? null;
  const menuSource = liveItems ?? MENU;
  const catsSource = liveItems
    ? ['All', ...Array.from(new Set(liveItems.map(m => m.cat).filter(Boolean)))]
    : CATS;

  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
  const cartTotal = Object.entries(cart).reduce((s,[id,q])=>s+(menuSource.find(m=>m.id===+id||m.id===String(id))?.price||0)*q,0);
  const filtered  = menuSource.filter(m=>(cat==='All'||m.cat===cat)&&(!vegOnly||m.veg)&&(!search||m.name.toLowerCase().includes(search.toLowerCase())));
  const popular   = menuSource.filter(m=>m.popular);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* Info Bar */}
      <div className="ir-info-bar">
        <div className="ir-info-chips">
          <span className="ir-chip">Train {userInfo.train}</span>
          <span className="ir-chip">Coach {userInfo.coach}</span>
          <span className="ir-chip">Berth {userInfo.seat}</span>
        </div>
        <button onClick={onBack} style={{fontSize:'0.62rem',color:IR.navyLight,background:IR.ivory,border:`1px solid ${IR.border}`,borderRadius:6,padding:'3px 9px',cursor:'pointer',fontWeight:800,fontFamily:'Nunito,sans-serif'}}>Edit</button>
      </div>

      {/* Search + Filters */}
      <div style={{background:'#fff',borderBottom:`1px solid ${IR.borderLight}`,flexShrink:0}}>
        <div style={{padding:'8px 13px 0'}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:'0.75rem',color:IR.textLight,fontWeight:700,pointerEvents:'none'}}>&#9906;</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food items…"
              className="ir-input" style={{paddingLeft:33,fontSize:'0.8rem',background:IR.surface}}/>
          </div>
        </div>
        {/* ── Filter bar: horizontal scroll, scrollbar hidden ── */}
        <div className="ir-filter-bar">
          {catsSource.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`ir-cat-pill${cat===c?' active':' inactive'}`}>{c}</button>
          ))}
          <button onClick={()=>setVegOnly(v=>!v)} className="ir-veg-btn"
            style={{background:vegOnly?IR.greenLight:'#fff',color:vegOnly?IR.green:IR.textMid,border:`1.5px solid ${vegOnly?IR.green:IR.border}`,marginLeft:'auto',flexShrink:0}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:vegOnly?IR.green:IR.border,display:'inline-block'}}/>
            VEG
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
        {/* Popular */}
        {cat==='All'&&!search&&(
          <div style={{padding:'12px 13px 0'}}>
            <div className="ir-section-label">Most Ordered</div>
            {/* ── Popular row: horizontal scroll, scrollbar hidden ── */}
            <div className="ir-pop-row">
              {popular.map(item=>(
                <div key={item.id} className="ir-pop-card">
                  <div className="ir-pop-thumb">
                    {item.image
                      ? <img src={item.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={item.name}/>
                      : <span style={{fontSize:'1.9rem'}}>{item.emoji||'🍽️'}</span>}
                  </div>
                  <div style={{padding:'7px 8px 9px'}}>
                    <p style={{fontSize:'0.65rem',fontWeight:800,color:IR.text,marginBottom:3,lineHeight:1.3}}>{item.name}</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontWeight:900,color:IR.navy,fontSize:'0.8rem'}}>₹{item.price}</span>
                      <div className={`ir-veg-dot ${item.veg?'veg':'nonveg'}`}/>
                    </div>
                    <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Items */}
        <div style={{padding:'10px 13px 0'}}>
          <div className="ir-section-label">{cat==='All'?'All Items':cat}</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {filtered.map((item,i)=>(
              <div key={item.id} className="ir-menu-item" style={{animation:'fadeUp .22s ease both',animationDelay:`${i*18}ms`}}>
                <div className="ir-menu-thumb">
                  {item.image
                    ? <img src={item.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={item.name}/>
                    : <span style={{fontSize:'2rem'}}>{item.emoji||'🍽️'}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2,flexWrap:'wrap'}}>
                    <span style={{fontSize:'0.82rem',fontWeight:800,color:IR.text,lineHeight:1.3}}>{item.name}</span>
                    {item.popular && <span className="ir-hot">HOT</span>}
                    <div className={`ir-veg-dot ${item.veg?'veg':'nonveg'}`} style={{marginLeft:'auto'}}/>
                  </div>
                  <p style={{fontSize:'0.62rem',color:IR.textSub,marginBottom:6,lineHeight:1.4}}>{item.desc}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'0.95rem',fontWeight:900,color:IR.navy}}>₹{item.price}</span>
                    <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:cartCount>0?72:16}}/>
      </div>

      {cartCount>0 && (
        <div className="ir-footer-bar safe-bottom" style={{padding:'8px 13px max(14px,env(safe-area-inset-bottom))'}}>
          <button onClick={onNext}
            style={{width:'100%',padding:'11px 14px',background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:'#fff',border:'none',borderRadius:10,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:`0 4px 16px rgba(26,42,108,.28)`,fontFamily:'Nunito,sans-serif'}}>
            <span style={{background:IR.gold,color:IR.navyDark,padding:'2px 9px',borderRadius:99,fontSize:'0.66rem',fontWeight:900}}>{cartCount} items</span>
            <span style={{fontWeight:900,fontSize:'0.88rem'}}>View Cart →</span>
            <span style={{fontWeight:900,fontSize:'0.92rem',color:IR.gold}}>₹{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2: Cart
═══════════════════════════════════════════════════════════ */
function PCart({ cart, onAdd, onRem, onBack, onNext }) {
  const items = Object.entries(cart).map(([id,qty])=>({item:MENU.find(m=>m.id===+id),qty})).filter(x=>x.item);
  const total = items.reduce((s,{item,qty})=>s+item.price*qty,0);
  const eta   = useRef(['~12 min','~18 min','~8 min','~22 min','~14 min'][Math.floor(Math.random()*5)]).current;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'13px 13px 0'}}>

        {/* ETA card */}
        <div className="ir-card-navy" style={{padding:'12px 14px',marginBottom:12,display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:36,height:36,borderRadius:8,background:IR.gold,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1rem',fontWeight:700,color:IR.navyDark}}>ETA</span>
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:'0.82rem',color:IR.gold}}>Delivery in {eta}</div>
            <div style={{fontSize:'0.63rem',color:'rgba(255,255,255,.7)',marginTop:2}}>After payment confirmation</div>
          </div>
          <div style={{marginLeft:'auto',textAlign:'right'}}>
            <div style={{fontSize:'0.56rem',color:'rgba(255,255,255,.6)',letterSpacing:'.5px'}}>TOTAL</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.4rem',fontWeight:700,color:IR.gold}}>₹{total}</div>
          </div>
        </div>

        <div className="ir-section-label">Your Order</div>

        {items.map(({item,qty})=>(
          <div key={item.id} className="ir-card" style={{padding:'10px',display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
            <div style={{width:44,height:44,borderRadius:8,background:IR.ivoryDark,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${IR.border}`}}>
              <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'0.6rem',fontWeight:700,color:IR.textMid,textAlign:'center',lineHeight:1.2}}>{item.veg?'VEG':'N-V'}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:800,fontSize:'0.8rem',color:IR.text}}>{item.name}</p>
              <p style={{fontSize:'0.63rem',color:IR.textSub}}>₹{item.price} × {qty}</p>
            </div>
            <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem}/>
            <span style={{fontWeight:900,color:IR.navy,fontSize:'0.86rem',minWidth:40,textAlign:'right'}}>₹{item.price*qty}</span>
          </div>
        ))}

        {/* Bill summary */}
        <div className="ir-card" style={{padding:12,marginTop:4}}>
          {[['Item Total',`₹${total}`],['Delivery','FREE ✓'],['Indian Railway Catering Fee','Included']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'0.73rem',color:IR.textSub}}>
              <span>{k}</span>
              <span style={{fontWeight:700,color:v==='FREE ✓'?IR.green:IR.textMid}}>{v}</span>
            </div>
          ))}
          <div style={{borderTop:`1.5px dashed ${IR.border}`,paddingTop:8,marginTop:2,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:800,fontSize:'0.82rem',color:IR.text}}>Total Payable</span>
            <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1.15rem',color:IR.navy}}>₹{total}</span>
          </div>
        </div>
        <div style={{height:14}}/>
      </div>

      <div className="ir-footer-bar safe-bottom" style={{display:'flex',gap:8}}>
        <button onClick={onBack} className="ir-btn-secondary">← Back</button>
        <button onClick={()=>onNext(total,eta)}
          style={{flex:1,padding:11,background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontSize:'0.82rem',fontFamily:'Nunito,sans-serif'}}>
          Proceed to Pay ₹{total} →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3: Payment
═══════════════════════════════════════════════════════════ */
function PPay({ total, eta, onBack, onNext }) {
  const [method, setMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const pay = () => { setPaying(true); setTimeout(()=>onNext(method),1800); };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'14px'}}>

        {/* Amount hero */}
        <div className="ir-card-navy" style={{padding:'20px',textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:'0.58rem',letterSpacing:'2px',color:'rgba(255,255,255,.6)',marginBottom:4}}>AMOUNT TO PAY</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'2.8rem',fontWeight:700,color:IR.gold,lineHeight:1}}>{`₹${total}`}</div>
          <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,.6)',marginTop:5}}>Est. delivery {eta}</div>
        </div>

        <div className="ir-section-label">Select Payment Method</div>

        {/* UPI */}
        <div className={`ir-pay-option${method==='upi'?' selected':''}`} onClick={()=>setMethod('upi')}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:40,height:40,borderRadius:8,background:'#eff6ff',border:'1px solid #bfdbfe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'0.72rem',fontWeight:700,color:'#1d4ed8',letterSpacing:'.5px'}}>UPI</span>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:'0.82rem',color:IR.text}}>UPI Payment</div>
              <div style={{fontSize:'0.63rem',color:IR.textSub}}>GPay · PhonePe · BHIM · Paytm</div>
            </div>
          </div>
          <div className={`ir-pay-radio${method==='upi'?' selected':''}`}>
            {method==='upi'&&<div style={{width:9,height:9,borderRadius:'50%',background:IR.navy}}/>}
          </div>
        </div>

        {/* Cash */}
        <div className={`ir-pay-option${method==='cod'?' selected':''}`} onClick={()=>setMethod('cod')}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:40,height:40,borderRadius:8,background:IR.greenLight,border:`1px solid ${IR.green}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'0.72rem',fontWeight:700,color:IR.green,letterSpacing:'.5px'}}>CASH</span>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:'0.82rem',color:IR.text}}>Cash on Delivery</div>
              <div style={{fontSize:'0.63rem',color:IR.textSub}}>Pay when food arrives</div>
            </div>
          </div>
          <div className={`ir-pay-radio${method==='cod'?' selected':''}`}>
            {method==='cod'&&<div style={{width:9,height:9,borderRadius:'50%',background:IR.navy}}/>}
          </div>
        </div>

        {method==='cod' && (
          <div style={{background:IR.greenLight,borderRadius:9,padding:'8px 12px',border:`1px solid ${IR.green}40`,fontSize:'0.65rem',color:IR.green,display:'flex',gap:7,alignItems:'flex-start',fontWeight:600,marginTop:4}}>
            <span>💡</span>
            <span>Keep ₹{total} ready. Vendor will collect on delivery.</span>
          </div>
        )}

        {/* Security note */}
        <div style={{marginTop:12,display:'flex',alignItems:'center',gap:7,padding:'8px 11px',background:IR.ivory,borderRadius:8,border:`1px solid ${IR.ivoryDark}`}}>
          <span style={{fontSize:'1rem'}}>🔒</span>
          <p style={{fontSize:'0.63rem',color:IR.textSub,lineHeight:1.4}}>All transactions are secured and encrypted by Indian Railways payment gateway.</p>
        </div>
      </div>

      <div className="ir-footer-bar safe-bottom" style={{display:'flex',gap:8}}>
        <button onClick={onBack} disabled={paying} className="ir-btn-secondary">← Back</button>
        <button onClick={pay} disabled={paying}
          style={{flex:1,padding:11,background:paying?'#9aa5c8':`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:paying?'wait':'pointer',fontSize:'0.82rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7,fontFamily:'Nunito,sans-serif',transition:'background .3s'}}>
          {paying
            ? <><span style={{width:12,height:12,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/> Processing…</>
            : method==='upi' ? `✅ Pay ₹${total}` : `🛵 Place Order`}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4: Tracking
═══════════════════════════════════════════════════════════ */
const PTRACK = [
  { label:'Order Placed',     icon:'01', sub:'We received your order' },
  { label:'Vendor Assigned',  icon:'02', sub:'Preparing your food' },
  { label:'Being Prepared',   icon:'03', sub:'Freshly cooked for you' },
  { label:'Out for Delivery', icon:'04', sub:'On the way to your seat' },
  { label:'Delivered',        icon:'✓',  sub:'Enjoy your meal' },
];

function PTrack({ userInfo, orderInfo, payMethod, cart, onSetOrderId, onFeedback, onComplaint, onReset }) {
  const [cur, setCur]     = useState(0);
  const [orderId]         = useState(() => genId('Indian Railway'));
  const [orderReady, setOrderReady] = useState(false);
  const done = cur === PTRACK.length - 1;

  const storeOrders = useStore(s => s.orders);
  const onSetOrderIdRef = useRef(onSetOrderId);
  useEffect(() => { onSetOrderIdRef.current = onSetOrderId; }, [onSetOrderId]);

  useEffect(() => {
    const items = Object.entries(cart).map(([id,qty])=>({
      name:  MENU.find(m=>m.id===+id)?.name  || '',
      qty,
      price: MENU.find(m=>m.id===+id)?.price || 0,
    }));
    const total = items.reduce((s,it)=>s+it.price*it.qty,0);
    actions.addOrder({
      id: orderId, trainNo: userInfo.train, seat:`${userInfo.coach}-${userInfo.seat}`,
      coach: userInfo.coach, items, total, status:'Pending', time: now(),
      payment: payMethod==='upi'?'UPI':'Cash', vendorId:'V001', agentId:null,
      passengerName: userInfo.name||'Passenger',
    }).then(()=>{ setOrderReady(true); if(onSetOrderIdRef.current) onSetOrderIdRef.current(orderId); });
    const t0=setTimeout(()=>setCur(0),0);
    const t1=setTimeout(()=>setCur(1),3000);
    const t2=setTimeout(()=>setCur(2),7500);
    return()=>{clearTimeout(t0);clearTimeout(t1);clearTimeout(t2);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    if(!orderReady) return;
    const order=storeOrders.find(o=>o.id===orderId);
    if(!order) return;
    if((order.status==='Packed'||order.status==='Delivered')&&cur<3) setCur(3);
    if(order.status==='Delivered'&&cur<4) setCur(4);
  },[storeOrders,orderId,orderReady,cur]);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'13px'}}>

        {/* Order summary card */}
        <div className="ir-card-navy" style={{padding:'14px',marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{fontSize:'0.54rem',letterSpacing:'1.5px',color:'rgba(255,255,255,.6)'}}>ORDER ID</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1rem',color:IR.gold}}>{orderId}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'0.54rem',letterSpacing:'1.5px',color:'rgba(255,255,255,.6)'}}>TOTAL</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1.1rem',color:IR.gold}}>₹{orderInfo.total}</div>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',background:'rgba(255,255,255,.1)',borderRadius:8,padding:'7px 11px',gap:4}}>
            {[
              ['COACH',userInfo.coach],
              ['BERTH',userInfo.seat],
              ['ETA',orderInfo.eta],
              ['PAY',payMethod==='upi'?'📱 UPI':'💵 Cash'],
            ].map(([k,v])=>(
              <div key={k} style={{textAlign:'center'}}>
                <div style={{fontSize:'0.5rem',color:'rgba(255,255,255,.55)',letterSpacing:'.8px'}}>{k}</div>
                <div style={{fontWeight:800,fontSize:'0.68rem',color:'#fff',marginTop:1}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live tracking */}
        <div className="ir-section-label" style={{marginBottom:10}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#ef4444',display:'inline-block',animation:'pulse 1.5s ease-in-out infinite'}}/>
            Live Order Tracking
          </span>
        </div>

        <div className="ir-card" style={{padding:'14px',marginBottom:12}}>
          {PTRACK.map((step,i)=>{
            const isDone=i<cur;
            const isActive=i===cur;
            const waitingForVendor=i>=3&&cur<i;
            return (
              <div key={i} className="ir-track-step" style={{paddingBottom:i<PTRACK.length-1?18:0}}>
                {i<PTRACK.length-1 && (
                  <div style={{position:'absolute',left:16,top:36,width:2,height:'calc(100% - 18px)',background:isDone?IR.green:IR.borderLight,transition:'background .5s'}}/>
                )}
                <div className={`ir-track-circle${isDone?' done':isActive?' active':' pending'}`}>
                  {isDone?'✓':step.icon}
                </div>
                <div style={{paddingTop:5}}>
                  <div style={{fontSize:'0.8rem',fontWeight:800,color:isDone||isActive?IR.text:IR.textLight,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                    {step.label}
                    {isActive&&<span style={{fontSize:'0.52rem',fontWeight:900,background:IR.navy,color:IR.gold,padding:'1px 7px',borderRadius:99,letterSpacing:'.5px'}}>NOW</span>}
                    {waitingForVendor&&i===3&&<span style={{fontSize:'0.52rem',fontWeight:700,background:IR.surface,color:IR.textLight,padding:'1px 6px',borderRadius:99}}>⏳ Packing</span>}
                    {waitingForVendor&&i===4&&<span style={{fontSize:'0.52rem',fontWeight:700,background:IR.surface,color:IR.textLight,padding:'1px 6px',borderRadius:99}}>⏳ Awaiting</span>}
                  </div>
                  {(isDone||isActive)&&<div style={{fontSize:'0.63rem',color:IR.textSub,marginTop:1}}>{step.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivered celebration */}
        {done&&(
          <div style={{background:`linear-gradient(135deg,${IR.navyDark},${IR.navyMid})`,borderRadius:14,padding:'20px',textAlign:'center',marginBottom:12,animation:'bounceIn .5s ease',border:`1px solid ${IR.gold}40`}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:IR.gold,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',flexShrink:0}}>
            <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:IR.navyDark}}>DONE</span>
          </div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'1.3rem',color:IR.gold,marginBottom:4}}>Order Delivered</div>
            <p style={{fontSize:'0.68rem',color:'rgba(255,255,255,.7)',marginBottom:13}}>Thank you for ordering with Indian Railways</p>
            {payMethod==='cod'&&(
              <div style={{marginBottom:13,padding:'8px 12px',background:'rgba(255,255,255,.1)',borderRadius:8,fontSize:'0.68rem',color:IR.gold,fontWeight:700}}>
                💵 Please pay ₹{orderInfo.total} to the delivery agent
              </div>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:10}}>
              <button onClick={onFeedback}
                style={{padding:'9px 16px',background:IR.gold,color:IR.navyDark,border:'none',borderRadius:8,fontWeight:900,cursor:'pointer',fontSize:'0.76rem',fontFamily:'Nunito,sans-serif'}}>
                Rate Order
              </button>
              <button onClick={onComplaint}
                style={{padding:'9px 13px',background:'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.25)',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.76rem',fontFamily:'Nunito,sans-serif'}}>
                File Complaint
              </button>
            </div>
            <button onClick={onReset}
              style={{padding:'7px 20px',background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.7rem',fontFamily:'Nunito,sans-serif'}}>
              Order Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEEDBACK
═══════════════════════════════════════════════════════════ */
function PFeedback({ userInfo }) {
const allFeedbackRaw = useStore(s => s.feedback);
// Show only feedback from this passenger's seat on this train
const allFeedback = allFeedbackRaw.filter(f =>
  f.trainNo === userInfo?.train &&
  f.seat === (userInfo?.seat ? `${userInfo.coach}-${userInfo.seat}` : f.seat)
);
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
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeUp .3s ease'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:`linear-gradient(135deg,${IR.navy},${IR.navyLight})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',marginBottom:14,border:`2px solid ${IR.gold}`}}>⭐</div>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,color:IR.text,marginBottom:7,fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>Thank You!</h2>
      <p style={{fontSize:'0.78rem',color:IR.textSub,marginBottom:22,lineHeight:1.6}}>Your feedback helps us improve for all passengers.</p>
      <button onClick={reset} style={{padding:'12px 28px',background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:IR.gold,border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontSize:'0.86rem',fontFamily:'Nunito,sans-serif'}}>Back to Reviews</button>
    </div>
  );

  if (mode === 'form') return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      {/* Header */}
      <div className="ir-header" style={{padding:'13px 15px 14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,position:'relative',zIndex:1}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.15)',border:`1px solid rgba(255,255,255,.2)`,color:'#fff',borderRadius:7,padding:'5px 11px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700,fontFamily:'Nunito,sans-serif'}}>← Back</button>
          <div>
            <div style={{fontSize:'0.54rem',color:IR.goldLight,fontWeight:800,letterSpacing:'2px'}}>RATE YOUR EXPERIENCE</div>
            <div style={{fontSize:'0.95rem',fontWeight:900,color:'#fff'}}>How was your order? ⭐</div>
          </div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:13}}>
          <div>
            <div className="ir-section-label">Your Name</div>
            <input className="ir-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/>
          </div>
          <div>
            <div className="ir-section-label">Seat</div>
            <input className="ir-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/>
          </div>
        </div>

        <div className="ir-card" style={{padding:'18px',textAlign:'center',marginBottom:12}}>
          <div className="ir-section-label" style={{justifyContent:'center'}}>Overall Rating <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900,marginLeft:2}}>*</span></div>
          <div style={{display:'flex',justifyContent:'center',gap:9,margin:'10px 0 8px'}}>
            {[1,2,3,4,5].map(n=>(
              <span key={n} className={`ir-star${(hover||rating)>=n?' lit':' dim'}`}
                onClick={()=>setRating(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}>⭐</span>
            ))}
          </div>
          {rating>0&&<div style={{fontSize:'0.85rem',fontWeight:800,color:IR.navy}}>{['','😟 Terrible','😕 Bad','😐 Okay','😊 Good','🤩 Excellent!'][rating]}</div>}
        </div>

        <div className="ir-card" style={{padding:'13px',marginBottom:12}}>
          <div className="ir-section-label">What aspect? <span style={{fontWeight:400,color:IR.textLight,fontSize:'0.62rem',textTransform:'none',letterSpacing:0}}>(optional)</span></div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setCategory(prev=>prev===c?'':c)}
                style={{padding:'5px 11px',borderRadius:7,border:`1.5px solid ${category===c?IR.navy:IR.border}`,background:category===c?IR.navy:'#f9fafb',color:category===c?'#fff':IR.textMid,fontSize:'0.7rem',fontWeight:700,cursor:'pointer',fontFamily:'Nunito,sans-serif',transition:'all .15s'}}>
                {category===c?'✓ ':''}{c}
              </button>
            ))}
          </div>
        </div>

        <div className="ir-card" style={{padding:'13px',marginBottom:12}}>
          <div className="ir-section-label">Your Comment</div>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Tell us about food quality, delivery time…"
            style={{width:'100%',padding:'9px 11px',border:`1.5px solid ${IR.border}`,borderRadius:8,fontSize:'0.8rem',color:IR.text,background:IR.surface,outline:'none',resize:'none',minHeight:76,boxSizing:'border-box',fontFamily:'Nunito,sans-serif',lineHeight:1.5,marginTop:4}}/>
          <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:5}}>
            {['Food was hot 🔥','Fast delivery ⚡','Great packaging 📦','Friendly vendor 😊','Good value 💰'].map(p=>(
              <button key={p} onClick={()=>setMsg(prev=>prev?prev+'. '+p:p)}
                style={{padding:'4px 9px',borderRadius:6,border:`1px solid ${IR.border}`,background:IR.surface,color:IR.textSub,fontSize:'0.64rem',fontWeight:600,cursor:'pointer',fontFamily:'Nunito,sans-serif'}}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="ir-footer-bar safe-bottom">
        <button onClick={submit} disabled={!rating||submitting} className="ir-btn-primary"
          style={{background:!rating?'#c8cde0':`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,cursor:!rating?'not-allowed':'pointer'}}>
          {submitting?<><span style={{width:12,height:12,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>Submitting…</>:'⭐ Submit Feedback'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div className="ir-header" style={{padding:'14px 15px'}}>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:'0.54rem',color:IR.goldLight,fontWeight:800,letterSpacing:'2px',marginBottom:3}}>FEEDBACK PORTAL</div>
          <div style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:11}}>Passenger Reviews ⭐</div>
          <div style={{display:'flex',gap:9}}>
            {[['Avg','⭐ '+avgRating],['Reviews',allFeedback.length],['4+ Stars',allFeedback.filter(f=>f.rating>=4).length]].map(([label,val])=>(
              <div key={label} style={{background:'rgba(255,255,255,.12)',border:`1px solid rgba(201,168,76,.2)`,borderRadius:9,padding:'7px 10px',flex:1,textAlign:'center'}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.35rem',fontWeight:700,color:IR.gold}}>{val}</div>
                <div style={{fontSize:'0.56rem',color:'rgba(255,255,255,.65)',marginTop:1}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 13px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
          <div className="ir-section-label" style={{marginBottom:0}}>Recent Reviews</div>
          <button onClick={()=>setMode('form')}
            style={{padding:'6px 13px',background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:IR.gold,border:'none',borderRadius:7,fontWeight:800,cursor:'pointer',fontSize:'0.68rem',fontFamily:'Nunito,sans-serif'}}>✏️ Write Review</button>
        </div>
        {allFeedback.length===0&&(
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>⭐</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:IR.text,marginBottom:5}}>No reviews yet</p>
            <button onClick={()=>setMode('form')} style={{padding:'10px 22px',background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:IR.gold,border:'none',borderRadius:9,fontWeight:800,cursor:'pointer',fontSize:'0.8rem',fontFamily:'Nunito,sans-serif'}}>Write a Review</button>
          </div>
        )}
        {allFeedback.map((f,i)=>(
          <div key={f.id} className="ir-review-card" style={{animation:'fadeUp .25s ease both',animationDelay:`${i*35}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div>
                <p style={{fontWeight:800,fontSize:'0.82rem',color:IR.text}}>{f.name}</p>
                <p style={{fontSize:'0.62rem',color:IR.textLight}}>Seat {f.seat} · {f.time}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'0.85rem',color:'#f59e0b',letterSpacing:1}}>{stars(f.rating)}</div>
                <div style={{fontSize:'0.6rem',fontWeight:700,color:IR.textLight}}>{f.rating}/5</div>
              </div>
            </div>
            <p style={{fontSize:'0.74rem',color:IR.textMid,fontStyle:'italic',lineHeight:1.45,borderLeft:`3px solid ${IR.gold}`,paddingLeft:9}}>"{f.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPLAINT
═══════════════════════════════════════════════════════════ */
function PComplaint({ userInfo }) {
const allComplaintsRaw = useStore(s => s.complaints);
const allComplaints = allComplaintsRaw.filter(c =>
  c.trainNo === userInfo?.train &&
  c.seat === (userInfo?.seat ? `${userInfo.coach}-${userInfo.seat}` : c.seat)
);
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
    { label:'Food was cold or stale', icon:'🥶' },
    { label:'Wrong item delivered',   icon:'❌' },
    { label:'Overcharged',            icon:'💸' },
    { label:'Delayed delivery',       icon:'⏰' },
    { label:'Unhygienic packaging',   icon:'🧴' },
    { label:'Vendor was rude',        icon:'😠' },
    { label:'Item missing',           icon:'📦' },
    { label:'Other issue',            icon:'📝' },
  ];
  const priorities = ['Low — Just letting you know','Medium — Please look into it','High — Needs immediate attention'];
  const prColors = ['#16a34a','#f59e0b','#dc2626'];

  const reset = () => { setIssue('');setCustom('');setPriority('');setDone(false);setMode('list'); };
  const submit = () => {
    const text = issue==='Other issue'?custom:issue;
    if (!text) return;
    setSub(true);
    setTimeout(()=>{
      actions.addComplaint({ id:genId('C'), name:nameInput||'Passenger', seat:seatInput||'—', trainNo:userInfo?.train||'—', issue:text+(priority?` [${priority.split('—')[0].trim()}]`:''), status:'Open', time:now() });
      setSub(false); setDone(true);
    },1200);
  };

  if (done) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',animation:'fadeUp .3s ease'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:IR.ivoryDark,border:`2px solid ${IR.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',marginBottom:14}}>📋</div>
      <h2 style={{fontSize:'1.1rem',fontWeight:900,color:IR.text,marginBottom:7,fontFamily:'Rajdhani,sans-serif'}}>Complaint Filed!</h2>
      <p style={{fontSize:'0.78rem',color:IR.textSub,marginBottom:10,lineHeight:1.6}}>Our team will resolve it shortly.</p>
      <div style={{background:IR.redLight,border:`1px solid ${IR.red}30`,borderRadius:9,padding:'10px 18px',marginBottom:22}}>
        <p style={{fontSize:'0.62rem',color:IR.red,fontWeight:800,letterSpacing:'.5px'}}>TICKET ID</p>
        <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.1rem',fontWeight:700,color:IR.red}}>{ticketId}</p>
      </div>
      <button onClick={reset} style={{padding:'12px 28px',background:`linear-gradient(135deg,${IR.navyDark},${IR.navyLight})`,color:IR.gold,border:'none',borderRadius:10,fontWeight:800,cursor:'pointer',fontSize:'0.86rem',fontFamily:'Nunito,sans-serif'}}>Back to Complaints</button>
    </div>
  );

  if (mode === 'form') return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div className="ir-header" style={{padding:'13px 15px 14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,position:'relative',zIndex:1}}>
          <button onClick={()=>setMode('list')} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',borderRadius:7,padding:'5px 11px',cursor:'pointer',fontSize:'0.72rem',fontWeight:700,fontFamily:'Nunito,sans-serif'}}>← Back</button>
          <div>
            <div style={{fontSize:'0.54rem',color:IR.goldLight,fontWeight:800,letterSpacing:'2px'}}>FILE A COMPLAINT</div>
            <div style={{fontSize:'0.95rem',fontWeight:900,color:'#fff'}}>We'll resolve it ASAP ⚡</div>
          </div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:13}}>
          <div>
            <div className="ir-section-label">Your Name</div>
            <input className="ir-input" placeholder="Rahul S." value={nameInput} onChange={e=>setNameInput(e.target.value)}/>
          </div>
          <div>
            <div className="ir-section-label">Seat</div>
            <input className="ir-input" placeholder="B2-45" value={seatInput} onChange={e=>setSeatInput(e.target.value)}/>
          </div>
        </div>

        <div className="ir-card" style={{padding:'13px',marginBottom:12}}>
          <div className="ir-section-label">What's the issue? <span style={{color:IR.red,fontSize:'0.75rem',fontWeight:900,marginLeft:2}}>*</span></div>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:6}}>
            {issues.map(({label,icon})=>(
              <div key={label} onClick={()=>setIssue(label)}
                className={`ir-issue-opt${issue===label?' selected':''}`}>
                <span style={{fontSize:'1rem'}}>{icon}</span>
                <span style={{fontSize:'0.78rem',fontWeight:issue===label?700:500,color:issue===label?IR.red:IR.textMid,flex:1}}>{label}</span>
                {issue===label&&<span style={{color:IR.red,fontWeight:900,fontSize:'0.8rem'}}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {issue==='Other issue'&&(
          <div className="ir-card" style={{padding:'13px',marginBottom:12}}>
            <div className="ir-section-label">Describe the issue</div>
            <textarea value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Please describe in detail…"
              style={{width:'100%',padding:'9px 11px',border:`1.5px solid ${IR.border}`,borderRadius:8,fontSize:'0.8rem',color:IR.text,background:IR.surface,outline:'none',resize:'none',minHeight:76,boxSizing:'border-box',fontFamily:'Nunito,sans-serif',marginTop:4}}/>
          </div>
        )}

        {issue&&(
          <div className="ir-card" style={{padding:'13px',marginBottom:12}}>
            <div className="ir-section-label">Priority <span style={{fontWeight:400,color:IR.textLight,fontSize:'0.62rem',textTransform:'none',letterSpacing:0}}>(optional)</span></div>
            {priorities.map((p,i)=>(
              <div key={p} onClick={()=>setPriority(p)}
                style={{padding:'8px 11px',border:`1.5px solid ${priority===p?prColors[i]:IR.border}`,borderRadius:8,cursor:'pointer',background:priority===p?`${prColors[i]}15`:'#f9fafb',display:'flex',alignItems:'center',gap:8,marginBottom:5,transition:'all .15s'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:prColors[i],flexShrink:0}}/>
                <span style={{fontSize:'0.73rem',fontWeight:priority===p?700:500,color:priority===p?prColors[i]:IR.textMid}}>{p}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'9px 12px',marginBottom:14,display:'flex',gap:7,alignItems:'flex-start'}}>
          <span>ℹ️</span>
          <p style={{fontSize:'0.65rem',color:'#1e40af',lineHeight:1.5}}>Our team reviews complaints within 2 hours. For urgent issues call <strong>1800-111-139</strong></p>
        </div>
      </div>

      <div className="ir-footer-bar safe-bottom">
        <button onClick={submit} disabled={!issue||(issue==='Other issue'&&!custom)||submitting}
          style={{width:'100%',padding:13,background:!issue?'#c8cde0':`linear-gradient(135deg,#991b1b,#dc2626)`,color:!issue?IR.textSub:'#fff',border:'none',borderRadius:10,fontWeight:800,cursor:!issue?'not-allowed':'pointer',fontSize:'0.86rem',display:'flex',alignItems:'center',justifyContent:'center',gap:7,fontFamily:'Nunito,sans-serif'}}>
          {submitting?<><span style={{width:12,height:12,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite'}}/>Submitting…</>:'⚠️ Submit Complaint'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div className="ir-header" style={{padding:'14px 15px'}}>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:'0.54rem',color:IR.goldLight,fontWeight:800,letterSpacing:'2px',marginBottom:3}}>COMPLAINT PORTAL</div>
          <div style={{fontSize:'1.1rem',fontWeight:900,color:'#fff',marginBottom:11}}>Your Complaints ⚠️</div>
          <div style={{display:'flex',gap:9}}>
            {[['Open',allComplaints.filter(c=>c.status==='Open').length],['Resolved',allComplaints.filter(c=>c.status==='Resolved').length],['Avg Resolve','2h']].map(([label,val])=>(
              <div key={label} style={{background:'rgba(255,255,255,.12)',border:`1px solid rgba(201,168,76,.2)`,borderRadius:9,padding:'7px 10px',flex:1,textAlign:'center'}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:'1.35rem',fontWeight:700,color:IR.gold}}>{val}</div>
                <div style={{fontSize:'0.56rem',color:'rgba(255,255,255,.65)',marginTop:1}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 13px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
          <div className="ir-section-label" style={{marginBottom:0}}>All Complaints</div>
          <button onClick={()=>setMode('form')}
            style={{padding:'6px 13px',background:'linear-gradient(135deg,#dc2626,#f97316)',color:'#fff',border:'none',borderRadius:7,fontWeight:800,cursor:'pointer',fontSize:'0.68rem',fontFamily:'Nunito,sans-serif'}}>+ File Complaint</button>
        </div>
        {allComplaints.length===0&&(
          <div style={{textAlign:'center',padding:'2.5rem 1rem'}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>🎉</div>
            <p style={{fontSize:'0.85rem',fontWeight:700,color:IR.text,marginBottom:5}}>No complaints!</p>
            <button onClick={()=>setMode('form')} style={{padding:'10px 22px',background:'linear-gradient(135deg,#dc2626,#f97316)',color:'#fff',border:'none',borderRadius:9,fontWeight:800,cursor:'pointer',fontSize:'0.8rem',fontFamily:'Nunito,sans-serif'}}>File a Complaint</button>
          </div>
        )}
        {allComplaints.map((c,i)=>(
          <div key={c.id} className="ir-card" style={{padding:'12px',marginBottom:9,borderLeft:`3px solid ${c.status==='Open'?IR.red:IR.green}`,animation:'fadeUp .25s ease both',animationDelay:`${i*35}ms`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              <div>
                <p style={{fontWeight:800,fontSize:'0.82rem',color:IR.text}}>{c.name}</p>
                <p style={{fontSize:'0.62rem',color:IR.textLight}}>Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
              </div>
              <Badge label={c.status}/>
            </div>
            <p style={{fontSize:'0.73rem',color:IR.textMid,lineHeight:1.4}}>{c.issue}</p>
            {c.status==='Open'&&(
              <div style={{marginTop:6,display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:'0.6rem',color:IR.orange}}>⏱</span>
                <span style={{fontSize:'0.62rem',color:IR.orange,fontWeight:600}}>Under review — expected within 2 hours</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HELP
═══════════════════════════════════════════════════════════ */
function PHelpPage({ onContact }) {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q:'How do I order food?', a:'Tap the "Order" tab → select your coach & berth → browse the menu → add items to cart → pay via UPI or cash on delivery.' },
    { q:'Can I change my order after placing?', a:'Once confirmed, orders cannot be modified. Please contact the vendor directly or file a complaint if there is an issue.' },
    { q:'How long does delivery take?', a:'Typically 8–22 minutes after order confirmation, depending on preparation time and your coach location.' },
    { q:'Is cash on delivery available?', a:'Yes! Select "Cash on Delivery" at checkout. Keep the exact amount ready for the delivery agent.' },
    { q:'What if my food is cold or wrong?', a:'Tap the Complaint tab and file a complaint with details. Our team responds within 2 hours.' },
    { q:'How do I rate my experience?', a:'After delivery, tap the ⭐ Rate tab and submit your rating and comments.' },
    { q:'Are the prices Indian Railway-approved?', a:'Yes, all prices displayed are official Indian Railway-approved rates. Any overcharging should be reported immediately.' },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div className="ir-header" style={{padding:'14px 15px 15px'}}>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:'0.54rem',color:IR.goldLight,fontWeight:800,letterSpacing:'2px',marginBottom:3}}>HELP & SUPPORT</div>
          <div style={{fontSize:'1.1rem',fontWeight:900,color:'#fff'}}>How can we help? ❓</div>
        </div>
      </div>
      <div className="ir-gold-line"/>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'12px 13px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
          {[
            { icon:'📞', title:'IR Helpline', sub:'1800-111-139', bg:'#eff6ff', border:'#bfdbfe', color:'#1e40af' },
            { icon:'⚠️', title:'File Complaint', sub:'Quick & easy', bg:IR.redLight, border:`${IR.red}30`, color:IR.red, action:onContact },
            { icon:'📱', title:'UPI Support', sub:'GPay · PhonePe', bg:IR.greenLight, border:`${IR.green}30`, color:IR.green },
            { icon:'🕐', title:'Service Hours', sub:'6 AM – 10 PM', bg:IR.ivory, border:IR.ivoryDark, color:IR.goldDark },
          ].map(({icon,title,sub,bg,border,color,action})=>(
            <div key={title} onClick={action}
              style={{background:bg,border:`1px solid ${border}`,borderRadius:11,padding:'12px',display:'flex',alignItems:'center',gap:9,cursor:action?'pointer':'default',transition:'transform .15s'}}
              onMouseOver={e=>action&&(e.currentTarget.style.transform='scale(1.02)')}
              onMouseOut={e=>action&&(e.currentTarget.style.transform='none')}>
              <span style={{fontSize:'1.5rem'}}>{icon}</span>
              <div>
                <p style={{fontWeight:800,fontSize:'0.76rem',color}}>{title}</p>
                <p style={{fontSize:'0.63rem',color:IR.textSub}}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ir-section-label">Frequently Asked Questions</div>
        {faqs.map((faq,i)=>(
          <div key={i} className="ir-faq-item">
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="ir-faq-btn">
              <span style={{fontSize:'0.78rem',fontWeight:700,color:IR.text,lineHeight:1.3,flex:1}}>{faq.q}</span>
              <span style={{fontSize:'0.7rem',color:IR.textSub,flexShrink:0,transform:openFaq===i?'rotate(180deg)':'none',transition:'transform .2s',display:'inline-block'}}>▼</span>
            </button>
            {openFaq===i&&(
              <div style={{padding:'0 13px 12px',animation:'fadeUp .18s ease'}}>
                <p style={{fontSize:'0.73rem',color:IR.textMid,lineHeight:1.6,borderTop:`1px solid ${IR.borderLight}`,paddingTop:9}}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        <div style={{background:`linear-gradient(135deg,${IR.navyDark},${IR.navyMid})`,borderRadius:12,padding:'14px',marginTop:8,marginBottom:14}}>
          <p style={{fontWeight:900,fontSize:'0.78rem',color:IR.gold,marginBottom:9,fontFamily:'Rajdhani,sans-serif',letterSpacing:'.5px'}}>🚨 EMERGENCY CONTACTS</p>
          {[['IR Catering Helpline','1800-111-139'],['Railway General Helpline','139'],['Women Safety Helpline','182']].map(([label,num])=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'0.72rem',borderBottom:`1px solid rgba(255,255,255,.08)`,paddingBottom:6}}>
              <span style={{color:'rgba(255,255,255,.7)'}}>{label}</span>
              <span style={{fontWeight:800,color:IR.gold,fontFamily:'Rajdhani,sans-serif'}}>{num}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}