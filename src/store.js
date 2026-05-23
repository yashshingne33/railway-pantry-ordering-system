import { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc,
  onSnapshot, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ══════════════════════════════════════════════════════════════
   FIREBASE INIT
══════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyCaGHYSOh3uzcpev3nclZ1WJe9i8PJS3vw",
  authDomain: "pantry-system-65f29.firebaseapp.com",
  projectId: "pantry-system-65f29",
  storageBucket: "pantry-system-65f29.firebasestorage.app",
  messagingSenderId: "1033682509419",
  appId: "1:1033682509419:web:e15846daaf24d808361b2e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* ══════════════════════════════════════════════════════════════
   SEED DATA — written to Firestore once if collections empty
══════════════════════════════════════════════════════════════ */
const SEED = {
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
  agents: [
    { id:'D001', name:'Raju Yadav', train:'12139', status:'Active', deliveries:22 },
    { id:'D002', name:'Mohan Das',  train:'12139', status:'Active', deliveries:18 },
  ],
};

/* Seed Firestore once — uses fixed doc IDs so re-running is idempotent */
async function seedIfEmpty() {
  for (const [colName, docs] of Object.entries(SEED)) {
    const colRef = collection(db, colName);
    // peek at first doc — if it exists, skip seeding this collection
    const snap = await new Promise(resolve => {
      const unsub = onSnapshot(query(colRef, orderBy("__name__")), s => { unsub(); resolve(s); });
    });
    if (!snap.empty) continue;
    for (const d of docs) {
      const { id, ...rest } = d;
      await setDoc(doc(db, colName, id), { ...rest, _seeded: true });
    }
  }
}
seedIfEmpty();

/* ══════════════════════════════════════════════════════════════
   REAL-TIME STORE HOOK
   useFirestore(colName) → live array of docs, sorted by createdAt desc
══════════════════════════════════════════════════════════════ */
export function useFirestore(colName) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const colRef = collection(db, colName);
    const unsub = onSnapshot(colRef, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDocs(data);
      setLoading(false);
    });
    return unsub;
  }, [colName]);

  return { docs, loading };
}

export function useTrainMenu(trainNo) {
  const [menu,    setMenu]    = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!trainNo) return;
    const unsub = onSnapshot(doc(db, 'trainMenus', trainNo), snap => {
      setMenu(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [trainNo]);
  return { menu, loading };
}

/* ══════════════════════════════════════════════════════════════
   LEGACY useStore COMPATIBILITY
   Components using useStore(s => s.orders) etc. still work.
══════════════════════════════════════════════════════════════ */
let _state = { orders:[], complaints:[], feedback:[], qrCodes:[], vendors:[], agents:[] };
const _listeners = new Set();
export const notify    = () => _listeners.forEach(fn => fn({ ..._state }));
export const subscribe = (fn) => { _listeners.add(fn); return () => _listeners.delete(fn); };
export const getState  = () => _state;

// Keep _state in sync with Firestore for legacy consumers
const COLLECTIONS = ['orders','complaints','feedback','qrCodes','vendors','agents'];
// Map Firestore collection names (qrCodes stored as 'qrCodes')
const COL_MAP = { orders:'orders', complaints:'complaints', feedback:'feedback', qrCodes:'qrCodes', vendors:'vendors', agents:'agents' };

COLLECTIONS.forEach(key => {
  onSnapshot(collection(db, COL_MAP[key]), snap => {
    _state = { ..._state, [key]: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    notify();
  });
});

export function useStore(selector) {
  const [val, setVal] = useState(() => selector(getState()));

  useEffect(() => {
    setVal(selector(getState()));

    const unsubscribe = subscribe((s) => {
      setVal(selector(s));
    });

    return unsubscribe;
  }, [selector]);

  return val;
}

/* ══════════════════════════════════════════════════════════════
   ACTIONS — all write to Firestore
══════════════════════════════════════════════════════════════ */
export const actions = {

  /* Orders */
  addOrder: async (order) => {
    const { id, ...rest } = order;
    await setDoc(doc(db, 'orders', id), { ...rest, _createdAt: serverTimestamp() });
  },

  updateOrder: async (id, patch) => {
    await updateDoc(doc(db, 'orders', id), patch);
  },

  deleteOrder: async (id) => {
    await deleteDoc(doc(db, 'orders', id));
  },

  /* Complaints */
  addComplaint: async (c) => {
    const { id, ...rest } = c;
    await setDoc(doc(db, 'complaints', id), { ...rest, _createdAt: serverTimestamp() });
  },

  resolveComplaint: async (id) => {
    await updateDoc(doc(db, 'complaints', id), { status: 'Resolved' });
  },

  updateComplaint: async (id, patch) => {
    await updateDoc(doc(db, 'complaints', id), patch);
  },

  /* Feedback */
  addFeedback: async (f) => {
    const { id, ...rest } = f;
    await setDoc(doc(db, 'feedback', id), { ...rest, _createdAt: serverTimestamp() });
  },

  /* QR Codes */
  addQR: async (qr) => {
    const { id, ...rest } = qr;
    await setDoc(doc(db, 'qrCodes', id), { ...rest, _createdAt: serverTimestamp() });
  },

  toggleQR: async (id, current) => {
    await updateDoc(doc(db, 'qrCodes', id), { active: !current });
  },

  /* Vendors */
  addVendor: async (vendor) => {
    const { id, ...rest } = vendor;
    await setDoc(doc(db, 'vendors', id), { ...rest, _createdAt: serverTimestamp() });
  },

  toggleVendor: async (id, currentStatus) => {
    // Accept current status as param OR look it up from _state for backwards compat
    const status = currentStatus
      ?? (_state.vendors.find(v => v.id === id)?.status);
    await updateDoc(doc(db, 'vendors', id), {
      status: status === 'Active' ? 'Suspended' : 'Active'
    });
  },

  updateVendor: async (id, patch) => {
    await updateDoc(doc(db, 'vendors', id), patch);
  },

  deleteVendor: async (id) => {
    await deleteDoc(doc(db, 'vendors', id));
  },

  /* Agents */
  addAgent: async (agent) => {
    const { id, ...rest } = agent;
    await setDoc(doc(db, 'agents', id), { ...rest, _createdAt: serverTimestamp() });
  },

  toggleAgent: async (id) => {
    const agent = _state.agents.find(a => a.id === id);
    if (!agent) return;
    await updateDoc(doc(db, 'agents', id), {
      status: agent.status === 'Active' ? 'Inactive' : 'Active'
    });
  },

  /* Train Menus */
  initTrainMenu: async (trainNo, trainName, vendorId, vendorName) => {
    await setDoc(doc(db, 'trainMenus', trainNo), {
      trainNo, trainName, vendorId, vendorName,
      active: true, items: [],
      _createdAt: serverTimestamp(),
    }, { merge: true });
  },
  toggleTrainMenuActive: async (trainNo, active) => {
    await updateDoc(doc(db, 'trainMenus', trainNo), { active });
  },
  // In your store actions, add:
updateQR: async (id, updates) => {
  try {
    await updateDoc(doc(db, "qrCodes", id), updates);
  } catch (e) {
    console.error("updateQR failed", e);
  }
},

deleteQR: async (id) => {
  try {
    await deleteDoc(doc(db, "qrCodes", id));
  } catch (e) {
    console.error("deleteQR failed", e);
  }
},
};

/* ══════════════════════════════════════════════════════════════
   MENU DATA  (static — no DB needed)
══════════════════════════════════════════════════════════════ */
export const MENU = [
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

export const CATS = ["All","Meal","Snack","Breakfast","Beverage"];
export const TRAIN_NAMES = { "12139":"Sewagram Express","12140":"Maharashtra Express","22105":"Vidarbha Express","12859":"Gitanjali Express","12809":"Mumbai Mail" };

export const COACH_LAYOUT = {
  bays: 9,
  berths: ['L','M','U','L','M','U','SL','SU'],
  seatTypes: {
    L:  { label:'Lower',      color:'#22c55e', shortColor:'#dcfce7' },
    M:  { label:'Middle',     color:'#f59e0b', shortColor:'#fef3c7' },
    U:  { label:'Upper',      color:'#3b82f6', shortColor:'#dbeafe' },
    SL: { label:'Side Lower', color:'#a855f7', shortColor:'#f3e8ff' },
    SU: { label:'Side Upper', color:'#ec4899', shortColor:'#fce7f3' },
  }
};

export function generateCoachSeats() {
  const seats = [];
  for (let bay = 1; bay <= 9; bay++) {
    const base = (bay - 1) * 8;
    seats.push({ no: base+1, bay, type:'L',  label:`${base+1} L`  });
    seats.push({ no: base+2, bay, type:'M',  label:`${base+2} M`  });
    seats.push({ no: base+3, bay, type:'U',  label:`${base+3} U`  });
    seats.push({ no: base+4, bay, type:'L',  label:`${base+4} L`  });
    seats.push({ no: base+5, bay, type:'M',  label:`${base+5} M`  });
    seats.push({ no: base+6, bay, type:'U',  label:`${base+6} U`  });
    seats.push({ no: base+7, bay, type:'SL', label:`${base+7} SL` });
    seats.push({ no: base+8, bay, type:'SU', label:`${base+8} SU` });
  }
  return seats;
}

export const COACH_GROUPS = [
  { label:'AC 1st Class', coaches:['1A'], color:'#7c3aed' },
  { label:'AC 2 Tier',    coaches:['2A'], color:'#2563eb' },
  { label:'AC 3 Tier',    coaches:['3A','B1','B2','B3','B4'], color:'#0891b2' },
  { label:'Sleeper',      coaches:['S1','S2','S3','S4','S5','S6'], color:'#16a34a' },
  { label:'General',      coaches:['GS','GN'], color:'#6b7280' },
];
export const ALL_COACHES = COACH_GROUPS.flatMap(g => g.coaches);

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
export const T = {
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
export const badgeCls = (s) => {
  const m = { delivered:'b-green', active:'b-green', preparing:'b-blue', pending:'b-yellow',
    suspended:'b-red', open:'b-red', resolved:'b-green', 'out for delivery':'b-purple', packed:'b-blue' };
  return m[(s||'').toLowerCase()] || 'b-yellow';
};
export const genId = (prefix) => prefix + '-' + Math.floor(1000 + Math.random()*9000);
export const now   = () => new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

/* ══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════ */
export const Badge = ({ label, status }) => (
  <span className={`badge ${badgeCls(status||label)}`}>{label}</span>
);

export const Chip = ({ children, color='blue' }) => (
  <span className={`chip chip-${color}`}>{children}</span>
);

export const StatCard = ({ icon, label, value, sub, accent='blue', delay=0 }) => (
  <div className={`stat-card accent-${accent}`} style={{animationDelay:`${delay}ms`}}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <p className="stat-val">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

export const TabBar = ({ tabs, active, onChange }) => (
  <div className="tab-bar">
    {tabs.map(([id,label,count]) => (
      <button key={id} className={`tab ${active===id?'tab-active':''}`} onClick={()=>onChange(id)}>
        {label}
        {count>0 && <span className="tab-badge">{count}</span>}
      </button>
    ))}
  </div>
);

export const Section = ({ title, count, children, action }) => (
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

export const QtyCtrl = ({ item, cart, onAdd, onRem }) => {
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

export const QRCode = ({ trainNo, size=120, color='#1d4ed8' }) => {
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
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
export const GLOBAL_STYLES = `
  *,*::before,*::after{box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif!important;margin:0;padding:0}
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
`;