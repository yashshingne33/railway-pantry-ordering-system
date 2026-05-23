// import { useState, useEffect, useRef } from "react";

// /* ─── Google Font ─────────────────────────────────────────────────────────── */
// const FontLink = () => (
//   <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Poppins:wght@600;700;800&display=swap');`}</style>
// );

// /* ─── Data ────────────────────────────────────────────────────────────────── */
// const MENU = [
//   { id:1,  name:"Veg Thali",        price:120, cat:"Meal",      emoji:"🍱", popular:true,  veg:true,  desc:"Dal, sabzi, roti, rice & pickle",   rating:4.8, time:"15 min" },
//   { id:2,  name:"Non-Veg Thali",    price:150, cat:"Meal",      emoji:"🍗", popular:true,  veg:false, desc:"Chicken curry, roti, rice & salad",  rating:4.7, time:"18 min" },
//   { id:3,  name:"Paneer Thali",     price:140, cat:"Meal",      emoji:"🧀", popular:false, veg:true,  desc:"Paneer masala, 3 rotis & rice",      rating:4.6, time:"15 min" },
//   { id:4,  name:"Samosa (2 pcs)",   price:30,  cat:"Snack",     emoji:"🥟", popular:true,  veg:true,  desc:"Crispy fried with mint chutney",     rating:4.9, time:"5 min"  },
//   { id:5,  name:"Vada Pav",         price:25,  cat:"Snack",     emoji:"🥙", popular:true,  veg:true,  desc:"Mumbai style with garlic chutney",   rating:4.8, time:"5 min"  },
//   { id:6,  name:"Bread Omelette",   price:50,  cat:"Snack",     emoji:"🍳", popular:false, veg:false, desc:"2 eggs, butter toast & ketchup",     rating:4.5, time:"8 min"  },
//   { id:7,  name:"Poha",             price:40,  cat:"Breakfast", emoji:"🍚", popular:true,  veg:true,  desc:"Flattened rice with onion & peanuts",rating:4.7, time:"8 min"  },
//   { id:8,  name:"Upma",             price:45,  cat:"Breakfast", emoji:"🥣", popular:false, veg:true,  desc:"Semolina with veggies & mustard",    rating:4.4, time:"10 min" },
//   { id:9,  name:"Idli Sambhar",     price:55,  cat:"Breakfast", emoji:"🫓", popular:false, veg:true,  desc:"3 idlis with hot sambhar & chutney", rating:4.6, time:"10 min" },
//   { id:10, name:"Tea",              price:15,  cat:"Beverage",  emoji:"☕", popular:true,  veg:true,  desc:"Masala chai — ginger & cardamom",    rating:4.9, time:"3 min"  },
//   { id:11, name:"Cold Coffee",      price:60,  cat:"Beverage",  emoji:"🥤", popular:false, veg:true,  desc:"Chilled with milk & sugar",          rating:4.5, time:"5 min"  },
//   { id:12, name:"Water Bottle 1L",  price:20,  cat:"Beverage",  emoji:"💧", popular:false, veg:true,  desc:"Bisleri sealed 1 litre bottle",      rating:5.0, time:"1 min"  },
// ];

// const COACHES  = ["A1","A2","B1","B2","B3","B4","S1","S2","S3","S4","S5","S6","SL","3A","2A","1A"];
// const STATIONS = ["Nagpur (NGP)","Mumbai CST (CSMT)","Pune (PUNE)","Nashik Rd (NK)","Bhusawal (BSL)","Wardha (WR)","Sewagram (SEGM)","Igatpuri (IGP)","Kalyan (KYN)","Akola (AK)"];
// const CATS     = ["All","Meal","Snack","Breakfast","Beverage"];

// const SMART_FEATURES = [
//   { icon:"🕐", title:"Real-Time Tracking",    desc:"Live order status from kitchen to your seat" },
//   { icon:"📍", title:"GPS Station Detection", desc:"Auto-detects your current station stop" },
//   { icon:"♿", title:"Senior/PH Priority",    desc:"Elderly & disabled passengers get priority delivery" },
//   { icon:"🌡️", title:"Food Safety Assured",   desc:"Temperature-checked meals with hygiene ratings" },
//   { icon:"🗣️", title:"Multi-Language",        desc:"Hindi, Marathi, English support for all passengers" },
//   { icon:"⚡", title:"Express Delivery",       desc:"Guaranteed delivery before next major station" },
// ];

// /* ─── Helpers ─────────────────────────────────────────────────────────────── */
// const getURLParams = () => {
//   try {
//     const p = new URLSearchParams(window.location.search);
//     return { train: p.get("train")||"", coach: p.get("coach")||"", seat: p.get("seat")||"", station: p.get("station")||"" };
//   } catch { return { train:"", coach:"", seat:"", station:"" }; }
// };

// const getSaved = () => {
//   try { return JSON.parse(localStorage.getItem("Indian Railway_passenger") || "null"); } catch { return null; }
// };

// const saveData = (d) => {
//   try { localStorage.setItem("Indian Railway_passenger", JSON.stringify(d)); } catch {}
// };

// const randomETA = () => ["~12 min","~18 min","~8 min","~22 min","~14 min"][Math.floor(Math.random()*5)];
// const genOrderId = () => "Indian Railway-" + Math.floor(10000 + Math.random()*90000);

// /* ─── Shared style atoms ──────────────────────────────────────────────────── */
// const fld    = { marginBottom:14 };
// const lbl    = { display:"block", fontSize:"0.68rem", fontWeight:800, color:"#374151", letterSpacing:"0.5px", marginBottom:5, fontFamily:"Nunito, sans-serif", textTransform:"uppercase" };
// const inp    = { width:"100%", padding:"12px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:"0.85rem", color:"#111827", background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"Nunito, sans-serif", transition:"border-color 0.15s, box-shadow 0.15s" };
// const errInp = { borderColor:"#fca5a5", background:"#fff5f5" };
// const errTxt = { fontSize:"0.62rem", color:"#dc2626", marginTop:3, display:"block", fontFamily:"Nunito, sans-serif" };
// const payCard       = { border:"1.5px solid #e5e7eb", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", background:"#f9fafb", transition:"all 0.15s" };
// const payCardActive = { borderColor:"#e65c00", background:"#fff7ed" };

// /* ─── VEG DOT ─────────────────────────────────────────────────────────────── */
// const VegDot = ({ veg }) => (
//   <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, border:`1.5px solid ${veg?"#16a34a":"#dc2626"}`, borderRadius:2, flexShrink:0 }}>
//     <span style={{ width:7, height:7, borderRadius:"50%", background: veg?"#16a34a":"#dc2626" }} />
//   </span>
// );

// /* ─── QTY CONTROL ─────────────────────────────────────────────────────────── */
// const QtyCtrl = ({ item, cart, onAdd, onRem, small }) => {
//   const qty = cart[item.id] || 0;
//   if (!qty) return (
//     <button onClick={() => onAdd(item)} style={{ padding: small ? "4px 12px" : "6px 16px", background:"#fff", color:"#e65c00", border:"1.5px solid #e65c00", borderRadius:20, fontWeight:800, fontSize: small ? "0.68rem" : "0.75rem", cursor:"pointer", fontFamily:"Nunito, sans-serif", transition:"all 0.15s", whiteSpace:"nowrap" }}>+ ADD</button>
//   );
//   return (
//     <div style={{ display:"flex", alignItems:"center", background:"#e65c00", borderRadius:20, overflow:"hidden", border:"1.5px solid #e65c00" }}>
//       <button onClick={() => onRem(item)} style={{ width: small?26:30, height: small?26:30, border:"none", background:"transparent", color:"#fff", fontSize:"1rem", fontWeight:800, cursor:"pointer" }}>−</button>
//       <span style={{ padding:"0 8px", color:"#fff", fontWeight:800, fontSize: small?"0.72rem":"0.82rem", minWidth:20, textAlign:"center", fontFamily:"Nunito, sans-serif" }}>{qty}</span>
//       <button onClick={() => onAdd(item)} style={{ width: small?26:30, height: small?26:30, border:"none", background:"transparent", color:"#fff", fontSize:"1rem", fontWeight:800, cursor:"pointer" }}>+</button>
//     </div>
//   );
// };

// /* ─── STEPS BAR ───────────────────────────────────────────────────────────── */
// const Steps = ({ step }) => {
//   const labels = ["Login","Menu","Cart","Pay","Track"];
//   return (
//     <div style={{ display:"flex", alignItems:"center", padding:"10px 12px", background:"#fff", borderBottom:"1px solid #f3f4f6", flexShrink:0, width:"100%", overflow:"hidden" }}>
//       {labels.map((l,i) => (
//         <div key={l} style={{ display:"flex", alignItems:"center", flex: i < labels.length-1 ? 1 : "none" }}>
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
//             <div style={{ width:22, height:22, borderRadius:"50%", background: i <= step ? "#e65c00" : "#e5e7eb", color: i <= step ? "#fff" : "#9ca3af", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.58rem", fontWeight:900, fontFamily:"Nunito, sans-serif", boxShadow: i === step ? "0 0 0 3px rgba(230,92,0,0.18)" : "none", transition:"all 0.3s" }}>
//               {i < step ? "✓" : i+1}
//             </div>
//             <span style={{ fontSize:"0.52rem", fontWeight: i === step ? 800 : 600, color: i <= step ? "#e65c00" : "#9ca3af", whiteSpace:"nowrap", fontFamily:"Nunito, sans-serif" }}>{l}</span>
//           </div>
//           {i < labels.length-1 && (
//             <div style={{ flex:1, height:2, margin:"0 3px", marginBottom:14, background: i < step ? "#e65c00" : "#e5e7eb", transition:"background 0.3s" }} />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ─── Radio button ────────────────────────────────────────────────────────── */
// const Radio = ({ active }) => (
//   <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, border:`2px solid ${active?"#e65c00":"#d1d5db"}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.15s" }}>
//     {active && <div style={{ width:10, height:10, borderRadius:"50%", background:"#e65c00" }} />}
//   </div>
// );

// /* ─── Spinner ─────────────────────────────────────────────────────────────── */
// const Spinner = () => (
//   <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
// );

// /* ══════════════════════════════════════════════════════════════════════════════
//    LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════ */
// const LoginScreen = ({ onNext }) => {
//   const params  = getURLParams();
//   const saved   = getSaved();
//   const isReturn = !!saved;

//   const [form, setForm] = useState({
//     train:    params.train    || saved?.train    || "",
//     station:  params.station  || saved?.station  || "",
//     platform: saved?.platform || "",
//     coach:    params.coach    || saved?.coach    || "",
//     seat:     params.seat     || saved?.seat     || "",
//   });
//   const [errors, setErrors] = useState({});
//   const [shake,  setShake]  = useState(false);

//   const set = k => e => { setForm(f => ({...f, [k]: e.target.value})); setErrors(er => ({...er, [k]:""})); };

//   const submit = () => {
//     const e = {};
//     if (!form.train.trim())  e.train   = "Required";
//     if (!form.station)       e.station = "Required";
//     if (!form.coach)         e.coach   = "Required";
//     if (!form.seat.trim())   e.seat    = "Required";
//     if (Object.keys(e).length) { setErrors(e); setShake(true); setTimeout(()=>setShake(false),500); return; }
//     saveData(form);
//     onNext(form);
//   };

//   return (
//     <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
//       {/* Hero */}
//       <div style={{ background:"linear-gradient(135deg,#c2410c 0%,#e65c00 60%,#f9a825 100%)", padding:"22px 20px 30px", position:"relative", overflow:"hidden" }}>
//         <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
//         <div style={{ position:"absolute", right:30, bottom:-40, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
//         <div style={{ fontSize:"0.65rem", fontWeight:800, color:"rgba(255,255,255,0.75)", letterSpacing:"2px", fontFamily:"Nunito, sans-serif", marginBottom:6 }}>Indian Railway PANTRY SYSTEM</div>
//         {/* <div style={{ fontSize:"1.55rem", fontWeight:900, color:"#fff", fontFamily:"Poppins, sans-serif", lineHeight:1.25 }}>Hot Food,<br/>Right to Your Seat 🍽️</div> */}
//         {/* <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.85)", marginTop:8, fontFamily:"Nunito, sans-serif" }}>Order in 30 seconds · Delivered before next stop</div> */}
//         {/* <div style={{ display:"flex", gap:8, marginTop:14 }}>
//           {["⚡ Express","🔒 Secure","🌡️ Fresh & Hot"].map(tag => (
//             <span key={tag} style={{ fontSize:"0.62rem", fontWeight:700, padding:"3px 10px", background:"rgba(255,255,255,0.18)", color:"#fff", borderRadius:99, border:"1px solid rgba(255,255,255,0.28)", fontFamily:"Nunito, sans-serif" }}>{tag}</span>
//           ))}
//         </div> */}
//       </div>

//       {/* Auto-fill notice */}
//       {isReturn && (
//         <div style={{ margin:"14px 16px 0", padding:"12px 14px", background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, display:"flex", gap:10, alignItems:"center" }}>
//           <span style={{ fontSize:"1.2rem" }}>👋</span>
//           <div>
//             <div style={{ fontSize:"0.75rem", fontWeight:800, color:"#9a3412", fontFamily:"Nunito, sans-serif" }}>Welcome back!</div>
//             <div style={{ fontSize:"0.68rem", color:"#c2410c", fontFamily:"Nunito, sans-serif" }}>Your last trip details are pre-filled. Just verify & tap View Menu.</div>
//           </div>
//         </div>
//       )}

//       {/* Form */}
//       <div style={{ padding:"16px", flex:1, ...(shake ? { animation:"shake 0.4s ease" } : {}) }}>
//         <div style={fld}>
//           <label style={lbl}>🚂 Train Number *</label>
//           <input style={{...inp, ...(errors.train?errInp:{})}} placeholder="e.g. 12139 — Sewagram Express" value={form.train} onChange={set("train")} />
//           {errors.train && <span style={errTxt}>{errors.train}</span>}
//         </div>

//         <div style={fld}>
//           <label style={lbl}>📍 Current Station / Stop *</label>
//           <select style={{...inp, ...(errors.station?errInp:{})}} value={form.station} onChange={set("station")}>
//             <option value="">Select your current stop</option>
//             {STATIONS.map(s => <option key={s}>{s}</option>)}
//           </select>
//           {errors.station && <span style={errTxt}>{errors.station}</span>}
//         </div>

//         <div style={fld}>
//           <label style={lbl}>🅿️ Platform No <span style={{color:"#94a3b8", textTransform:"none", fontWeight:600}}>(optional)</span></label>
//           <input style={inp} placeholder="e.g. 2" value={form.platform} onChange={set("platform")} />
//         </div>

//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
//           <div style={fld}>
//             <label style={lbl}>🚃 Coach *</label>
//             <select style={{...inp, ...(errors.coach?errInp:{})}} value={form.coach} onChange={set("coach")}>
//               <option value="">Select</option>
//               {COACHES.map(c => <option key={c}>{c}</option>)}
//             </select>
//             {errors.coach && <span style={errTxt}>{errors.coach}</span>}
//           </div>
//           <div style={fld}>
//             <label style={lbl}>💺 Seat No *</label>
//             <input style={{...inp, ...(errors.seat?errInp:{})}} placeholder="e.g. 45" value={form.seat} onChange={set("seat")} />
//             {errors.seat && <span style={errTxt}>{errors.seat}</span>}
//           </div>
//         </div>

//         {/* Why use it */}
//         <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px", marginTop:4, border:"1px solid #f3f4f6" }}>
//           <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#374151", fontFamily:"Poppins, sans-serif", marginBottom:10 }}>WHY ORDER WITH US?</div>
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
//             {[["🚀","Fast Delivery","Hot food at your seat"],["💯","Indian Railway Certified","Verified vendors only"],["📱","Easy Payment","UPI & Cash accepted"],["🌿","Veg & Non-Veg","Wide menu choice"]].map(([icon, title, sub]) => (
//               <div key={title} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
//                 <span style={{ fontSize:"1rem" }}>{icon}</span>
//                 <div>
//                   <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif" }}>{title}</div>
//                   <div style={{ fontSize:"0.6rem", color:"#6b7280", fontFamily:"Nunito, sans-serif" }}>{sub}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div style={{ padding:"14px 16px 20px", background:"#fff", borderTop:"1px solid #f3f4f6", flexShrink:0 }}>
//         <button onClick={submit} style={{ width:"100%", padding:"15px", background:"linear-gradient(135deg,#e65c00,#f9a825)", color:"#fff", border:"none", borderRadius:12, fontSize:"0.95rem", fontWeight:800, cursor:"pointer", fontFamily:"Poppins, sans-serif", boxShadow:"0 4px 18px rgba(230,92,0,0.35)", letterSpacing:"0.3px" }}>
//           View Menu →
//         </button>
//         <div style={{ textAlign:"center", marginTop:8, fontSize:"0.63rem", color:"#9ca3af", fontFamily:"Nunito, sans-serif" }}>
//           🔒 Your data is saved locally for faster future orders
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════════════════════
//    MENU SCREEN
// ══════════════════════════════════════════════════════════════════════════════ */
// const MenuScreen = ({ userInfo, cart, onAdd, onRem, onNext }) => {
//   const [cat, setCat]         = useState("All");
//   const [vegOnly, setVegOnly] = useState(false);
//   const [search, setSearch]   = useState("");

//   const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
//   const cartTotal = Object.entries(cart).reduce((s,[id,qty])=>s+(MENU.find(m=>m.id===+id)?.price||0)*qty,0);

//   const popular  = MENU.filter(m => m.popular);
//   const filtered = MENU.filter(m =>
//     (cat==="All" || m.cat===cat) &&
//     (!vegOnly || m.veg) &&
//     (!search || m.name.toLowerCase().includes(search.toLowerCase()))
//   );

//   return (
//     <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
//       {/* Sticky top controls */}
//       <div style={{ background:"#fff", flexShrink:0, borderBottom:"1px solid #f3f4f6" }}>
//         <div style={{ padding:"8px 16px", background:"#fff7ed", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//           <span style={{ fontSize:"0.72rem", color:"#c2410c", fontWeight:800, fontFamily:"Nunito, sans-serif" }}>
//             🚂 {userInfo.train} &nbsp;·&nbsp; Coach {userInfo.coach} · Seat {userInfo.seat}
//           </span>
//           <span style={{ fontSize:"0.65rem", color:"#9a3412", fontFamily:"Nunito, sans-serif" }}>{userInfo.station?.split("(")[0]?.trim()}</span>
//         </div>

//         <div style={{ padding:"10px 16px 0" }}>
//           <div style={{ position:"relative" }}>
//             <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"0.9rem" }}>🔍</span>
//             <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food items..." style={{ ...inp, paddingLeft:36, background:"#f9fafb", marginBottom:0 }} />
//           </div>
//         </div>

//         <div style={{ display:"flex", alignItems:"center", padding:"8px 16px", gap:6, overflowX:"auto" }}>
//           {CATS.map(c => (
//             <button key={c} onClick={()=>{setCat(c);setSearch("");}} style={{ padding:"5px 14px", borderRadius:99, border:"none", cursor:"pointer", fontSize:"0.7rem", fontWeight:700, whiteSpace:"nowrap", fontFamily:"Nunito, sans-serif", transition:"all 0.15s", background: cat===c?"#e65c00":"#f3f4f6", color: cat===c?"#fff":"#6b7280" }}>{c}</button>
//           ))}
//           <button onClick={()=>setVegOnly(v=>!v)} style={{ marginLeft:"auto", flexShrink:0, padding:"5px 10px", borderRadius:99, border:`1.5px solid ${vegOnly?"#16a34a":"#d1d5db"}`, background: vegOnly?"#f0fdf4":"#fff", color: vegOnly?"#16a34a":"#9ca3af", fontSize:"0.7rem", fontWeight:800, cursor:"pointer", fontFamily:"Nunito, sans-serif", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}>
//             <span style={{ width:8, height:8, borderRadius:"50%", background: vegOnly?"#16a34a":"#d1d5db" }} /> VEG
//           </button>
//         </div>
//       </div>

//       {/* Scrollable content */}
//       <div style={{ flex:1, overflowY:"auto" }}>
//         {/* Popular horizontal scroll */}
//         {cat==="All" && !search && (
//           <div style={{ padding:"14px 16px 0" }}>
//             <div style={{ fontSize:"0.8rem", fontWeight:800, color:"#111827", fontFamily:"Poppins, sans-serif", marginBottom:10 }}>⭐ Most Ordered</div>
//             <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:6 }}>
//               {popular.map(item => (
//                 <div key={item.id} style={{ flexShrink:0, width:128, background:"#fff", borderRadius:14, border:"1px solid #f3f4f6", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
//                   <div style={{ height:68, background:"linear-gradient(135deg,#fff7ed,#fef3c7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.2rem" }}>{item.emoji}</div>
//                   <div style={{ padding:"8px 8px 10px" }}>
//                     <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:2 }}>
//                       <VegDot veg={item.veg} />
//                       <span style={{ fontSize:"0.68rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif", lineHeight:1.2 }}>{item.name}</span>
//                     </div>
//                     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
//                       <span style={{ fontSize:"0.82rem", fontWeight:900, color:"#e65c00", fontFamily:"Nunito, sans-serif" }}>₹{item.price}</span>
//                       <span style={{ fontSize:"0.58rem", color:"#9ca3af", fontFamily:"Nunito, sans-serif" }}>⏱ {item.time}</span>
//                     </div>
//                     <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem} small />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Full menu list */}
//         <div style={{ padding:"14px 16px 0" }}>
//           {!search && (
//             <div style={{ fontSize:"0.8rem", fontWeight:800, color:"#111827", fontFamily:"Poppins, sans-serif", marginBottom:10 }}>
//               {cat==="All" ? "🍽️ Full Menu" : `🍽️ ${cat}`}
//             </div>
//           )}
//           {filtered.length === 0 && (
//             <div style={{ textAlign:"center", padding:"32px 0", color:"#9ca3af", fontSize:"0.85rem", fontFamily:"Nunito, sans-serif" }}>No items found 😕</div>
//           )}
//           <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//             {filtered.map((item, i) => (
//               <div key={item.id} style={{ background:"#fff", borderRadius:14, border:"1px solid #f3f4f6", padding:"12px", display:"flex", gap:12, alignItems:"flex-start", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", animation:`fadeUp 0.25s ease both`, animationDelay:`${i*25}ms` }}>
//                 <div style={{ width:66, height:66, borderRadius:12, flexShrink:0, background:"linear-gradient(135deg,#fff7ed,#fef9c3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.1rem", boxShadow:"0 2px 6px rgba(0,0,0,0.06)" }}>
//                   {item.emoji}
//                 </div>
//                 <div style={{ flex:1, minWidth:0 }}>
//                   <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
//                     <VegDot veg={item.veg} />
//                     <span style={{ fontSize:"0.85rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif" }}>{item.name}</span>
//                     {item.popular && <span style={{ fontSize:"0.55rem", fontWeight:800, padding:"1px 6px", background:"#fef3c7", color:"#d97706", borderRadius:4, letterSpacing:"0.3px", fontFamily:"Nunito, sans-serif" }}>POPULAR</span>}
//                   </div>
//                   <div style={{ fontSize:"0.68rem", color:"#6b7280", marginBottom:8, fontFamily:"Nunito, sans-serif", lineHeight:1.35 }}>{item.desc}</div>
//                   <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//                     <div>
//                       <span style={{ fontSize:"0.98rem", fontWeight:900, color:"#e65c00", fontFamily:"Nunito, sans-serif" }}>₹{item.price}</span>
//                       <span style={{ fontSize:"0.6rem", color:"#9ca3af", marginLeft:6, fontFamily:"Nunito, sans-serif" }}>⭐{item.rating} · ⏱{item.time}</span>
//                     </div>
//                     <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div style={{ height: cartCount>0?"80px":"16px" }} />
//       </div>

//       {/* Sticky cart CTA */}
//       {cartCount > 0 && (
//         <div style={{ padding:"10px 16px 14px", background:"#fff", borderTop:"1px solid #f3f4f6", flexShrink:0, animation:"slideUp 0.2s ease" }}>
//           <button onClick={onNext} style={{ width:"100%", padding:"13px 16px", background:"linear-gradient(135deg,#e65c00,#f9a825)", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 4px 16px rgba(230,92,0,0.32)", fontFamily:"Nunito, sans-serif" }}>
//             <span style={{ background:"rgba(255,255,255,0.25)", padding:"3px 10px", borderRadius:99, fontSize:"0.72rem", fontWeight:800 }}>{cartCount} item{cartCount!==1?"s":""}</span>
//             <span style={{ fontWeight:800, fontSize:"0.9rem" }}>View Cart →</span>
//             <span style={{ fontWeight:900, fontSize:"0.95rem" }}>₹{cartTotal}</span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════════════════════
//    CART SCREEN
// ══════════════════════════════════════════════════════════════════════════════ */
// const CartScreen = ({ cart, onAdd, onRem, onBack, onNext }) => {
//   const items = Object.entries(cart).map(([id,qty])=>({ item:MENU.find(m=>m.id===+id), qty })).filter(x=>x.item);
//   const total = items.reduce((s,{item,qty})=>s+item.price*qty,0);
//   const eta   = useRef(randomETA()).current;

//   return (
//     <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
//       <div style={{ flex:1, overflowY:"auto" }}>
//         <div style={{ margin:"14px 16px 0", padding:"12px 14px", background:"linear-gradient(135deg,#fff7ed,#fef9c3)", borderRadius:12, border:"1px solid #fed7aa", display:"flex", gap:10, alignItems:"center" }}>
//           <span style={{ fontSize:"1.5rem" }}>⚡</span>
//           <div>
//             <div style={{ fontSize:"0.78rem", fontWeight:800, color:"#9a3412", fontFamily:"Poppins, sans-serif" }}>Estimated Delivery: {eta}</div>
//             <div style={{ fontSize:"0.67rem", color:"#c2410c", fontFamily:"Nunito, sans-serif" }}>After your payment is confirmed</div>
//           </div>
//         </div>

//         <div style={{ padding:"14px 16px 0" }}>
//           <div style={{ fontSize:"0.85rem", fontWeight:800, color:"#111827", fontFamily:"Poppins, sans-serif", marginBottom:10 }}>Your Order</div>
//           <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//             {items.map(({item,qty}) => (
//               <div key={item.id} style={{ background:"#fff", borderRadius:12, border:"1px solid #f3f4f6", padding:"12px", display:"flex", gap:10, alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
//                 <div style={{ width:46, height:46, borderRadius:10, background:"linear-gradient(135deg,#fff7ed,#fef9c3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", flexShrink:0 }}>{item.emoji}</div>
//                 <div style={{ flex:1, minWidth:0 }}>
//                   <div style={{ fontSize:"0.83rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif" }}>{item.name}</div>
//                   <div style={{ fontSize:"0.67rem", color:"#9ca3af", fontFamily:"Nunito, sans-serif" }}>₹{item.price} × {qty}</div>
//                 </div>
//                 <QtyCtrl item={item} cart={cart} onAdd={onAdd} onRem={onRem} small />
//                 <div style={{ fontWeight:800, color:"#e65c00", fontSize:"0.88rem", minWidth:40, textAlign:"right", fontFamily:"Nunito, sans-serif" }}>₹{item.price*qty}</div>
//               </div>
//             ))}
//           </div>

//           {/* Bill summary */}
//           <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px", marginTop:14, border:"1px solid #f3f4f6" }}>
//             <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#374151", fontFamily:"Poppins, sans-serif", marginBottom:10, letterSpacing:"0.5px" }}>BILL SUMMARY</div>
//             {[["Item Total",`₹${total}`],["Delivery Charge","FREE ✓"],["Indian Railway Service Fee","Included"]].map(([k,v]) => (
//               <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7, fontSize:"0.78rem", color:"#6b7280", fontFamily:"Nunito, sans-serif" }}>
//                 <span>{k}</span>
//                 <span style={{ fontWeight:700, color: v==="FREE ✓"?"#16a34a":"#374151" }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ borderTop:"1px dashed #e5e7eb", paddingTop:10, marginTop:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//               <span style={{ fontWeight:800, fontSize:"0.85rem", color:"#111827", fontFamily:"Poppins, sans-serif" }}>Total Payable</span>
//               <span style={{ fontWeight:900, fontSize:"1.15rem", color:"#e65c00", fontFamily:"Poppins, sans-serif" }}>₹{total}</span>
//             </div>
//           </div>

//           <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginTop:12, padding:"10px 12px", background:"#eff6ff", borderRadius:10, border:"1px solid #dbeafe" }}>
//             <span>ℹ️</span>
//             <span style={{ fontSize:"0.67rem", color:"#1e40af", fontFamily:"Nunito, sans-serif" }}>All food is freshly prepared by Indian Railway certified vendors. Hygiene rating: ⭐⭐⭐⭐⭐</span>
//           </div>
//           <div style={{ height:16 }} />
//         </div>
//       </div>

//       <div style={{ padding:"12px 16px 16px", background:"#fff", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, flexShrink:0 }}>
//         <button onClick={onBack} style={{ padding:"13px 16px", background:"#f3f4f6", border:"none", borderRadius:10, color:"#374151", fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif", fontSize:"0.82rem" }}>← Back</button>
//         <button onClick={()=>onNext(total,eta)} style={{ flex:1, padding:"13px", background:"linear-gradient(135deg,#e65c00,#f9a825)", color:"#fff", border:"none", borderRadius:10, fontWeight:800, cursor:"pointer", fontFamily:"Poppins, sans-serif", fontSize:"0.85rem", boxShadow:"0 4px 14px rgba(230,92,0,0.3)" }}>
//           Pay ₹{total} →
//         </button>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════════════════════
//    PAY SCREEN
// ══════════════════════════════════════════════════════════════════════════════ */
// const PayScreen = ({ total, eta, onBack, onNext }) => {
//   const [method, setMethod] = useState("upi");
//   const [paying, setPaying] = useState(false);
//   const [upiId,  setUpiId]  = useState("");

//   const pay = () => { setPaying(true); setTimeout(()=>onNext(method), 1800); };

//   return (
//     <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
//       <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
//         <div style={{ textAlign:"center", padding:"20px 0 18px" }}>
//           <div style={{ fontSize:"0.65rem", fontWeight:800, color:"#9ca3af", letterSpacing:"1.5px", fontFamily:"Nunito, sans-serif", marginBottom:4 }}>AMOUNT TO PAY</div>
//           <div style={{ fontSize:"2.8rem", fontWeight:900, color:"#111827", fontFamily:"Poppins, sans-serif", lineHeight:1 }}>₹{total}</div>
//           <div style={{ fontSize:"0.72rem", color:"#9ca3af", marginTop:5, fontFamily:"Nunito, sans-serif" }}>Est. delivery {eta} after payment</div>
//         </div>

//         <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#374151", marginBottom:10, letterSpacing:"0.5px", fontFamily:"Nunito, sans-serif" }}>SELECT PAYMENT METHOD</div>

//         <div onClick={()=>setMethod("upi")} style={{ ...payCard, ...(method==="upi"?payCardActive:{}) }}>
//           <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//             <span style={{ fontSize:"1.8rem" }}>📱</span>
//             <div>
//               <div style={{ fontSize:"0.85rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif" }}>UPI Payment</div>
//               <div style={{ fontSize:"0.67rem", color:"#6b7280", fontFamily:"Nunito, sans-serif" }}>GPay · PhonePe · Paytm · BHIM</div>
//             </div>
//           </div>
//           <Radio active={method==="upi"} />
//         </div>

//         {method==="upi" && (
//           <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px", marginTop:10, border:"1px solid #f3f4f6", animation:"fadeUp 0.2s ease" }}>
//             <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
//               <div style={{ padding:10, background:"#fff", borderRadius:10, boxShadow:"0 2px 8px rgba(0,0,0,0.07)", border:"1px solid #f3f4f6" }}>
//                 <svg width="110" height="110" viewBox="0 0 130 130">
//                   <rect width="130" height="130" fill="white"/>
//                   <rect x="8"  y="8"  width="32" height="32" rx="3" fill="#e65c00"/>
//                   <rect x="13" y="13" width="22" height="22" rx="2" fill="white"/>
//                   <rect x="17" y="17" width="14" height="14" rx="1" fill="#e65c00"/>
//                   <rect x="90" y="8"  width="32" height="32" rx="3" fill="#e65c00"/>
//                   <rect x="95" y="13" width="22" height="22" rx="2" fill="white"/>
//                   <rect x="99" y="17" width="14" height="14" rx="1" fill="#e65c00"/>
//                   <rect x="8"  y="90" width="32" height="32" rx="3" fill="#e65c00"/>
//                   <rect x="13" y="95" width="22" height="22" rx="2" fill="white"/>
//                   <rect x="17" y="99" width="14" height="14" rx="1" fill="#e65c00"/>
//                   {[48,54,60,66,72,78].flatMap(x=>[48,54,60,66,72,78].map(y=>((x+y)%12<7)?<rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" fill="#e65c00"/>:null))}
//                 </svg>
//                 <div style={{ fontSize:"0.62rem", color:"#9ca3af", textAlign:"center", marginTop:5, fontFamily:"Nunito, sans-serif" }}>Indian Railway@upi · ₹{total}</div>
//               </div>
//             </div>
//             <div style={{ fontSize:"0.68rem", color:"#9ca3af", textAlign:"center", marginBottom:8, fontFamily:"Nunito, sans-serif" }}>— or enter UPI ID manually —</div>
//             <input style={inp} placeholder="yourname@upi" value={upiId} onChange={e=>setUpiId(e.target.value)} />
//           </div>
//         )}

//         <div onClick={()=>setMethod("cod")} style={{ ...payCard, marginTop:10, ...(method==="cod"?payCardActive:{}) }}>
//           <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//             <span style={{ fontSize:"1.8rem" }}>💵</span>
//             <div>
//               <div style={{ fontSize:"0.85rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif" }}>Cash on Delivery</div>
//               <div style={{ fontSize:"0.67rem", color:"#6b7280", fontFamily:"Nunito, sans-serif" }}>Pay when food arrives at your seat</div>
//             </div>
//           </div>
//           <Radio active={method==="cod"} />
//         </div>

//         {method==="cod" && (
//           <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginTop:10, padding:"10px 12px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0", animation:"fadeUp 0.2s ease" }}>
//             <span>💡</span>
//             <span style={{ fontSize:"0.68rem", color:"#166534", fontFamily:"Nunito, sans-serif" }}>Please keep ₹{total} ready. Our vendor will collect cash when delivering to your seat.</span>
//           </div>
//         )}
//         <div style={{ height:16 }} />
//       </div>

//       <div style={{ padding:"12px 16px 16px", background:"#fff", borderTop:"1px solid #f3f4f6", display:"flex", gap:10, flexShrink:0 }}>
//         <button onClick={onBack} disabled={paying} style={{ padding:"13px 16px", background:"#f3f4f6", border:"none", borderRadius:10, color:"#374151", fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif", fontSize:"0.82rem" }}>← Back</button>
//         <button onClick={pay} disabled={paying} style={{ flex:1, padding:"13px", background: paying?"#fed7aa":"linear-gradient(135deg,#e65c00,#f9a825)", color:"#fff", border:"none", borderRadius:10, fontWeight:800, cursor: paying?"wait":"pointer", fontFamily:"Poppins, sans-serif", fontSize:"0.85rem", boxShadow:"0 4px 14px rgba(230,92,0,0.28)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
//           {paying ? <><Spinner /> Processing...</> : method==="upi" ? `✅ Pay ₹${total}` : `🛵 Place Order`}
//         </button>
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════════════════════
//    TRACK SCREEN
// ══════════════════════════════════════════════════════════════════════════════ */
// const TRACK_STEPS = [
//   { label:"Order Placed",     icon:"📋", sub:"We've received your order successfully" },
//   { label:"Vendor Assigned",  icon:"👨‍🍳", sub:"Ramesh Kumar is preparing your order" },
//   { label:"Preparing",        icon:"🍳", sub:"Your food is being freshly prepared" },
//   { label:"Out for Delivery", icon:"🚶", sub:"Vendor is walking to your coach" },
//   { label:"Delivered",        icon:"✅", sub:"Enjoy your meal! Bon appétit 🍽️" },
// ];

// const TrackScreen = ({ userInfo, orderInfo, payMethod }) => {
//   const [cur, setCur] = useState(0);
//   const [orderId]     = useState(genOrderId);

//   useEffect(()=>{
//     const delays = [0, 3500, 8000, 14000, 21000];
//     const timers = delays.map((d,i)=>setTimeout(()=>setCur(i),d));
//     return ()=>timers.forEach(clearTimeout);
//   },[]);

//   const done = cur === TRACK_STEPS.length - 1;

//   return (
//     <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
//       <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
//         {/* Order summary card */}
//         <div style={{ background:"linear-gradient(135deg,#c2410c,#e65c00,#f9a825)", borderRadius:14, padding:"16px", color:"#fff", marginBottom:14 }}>
//           <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
//             <div>
//               <div style={{ fontSize:"0.6rem", opacity:0.8, fontFamily:"Nunito, sans-serif" }}>ORDER ID</div>
//               <div style={{ fontWeight:900, fontSize:"0.95rem", fontFamily:"Poppins, sans-serif" }}>{orderId}</div>
//             </div>
//             <div style={{ textAlign:"right" }}>
//               <div style={{ fontSize:"0.6rem", opacity:0.8, fontFamily:"Nunito, sans-serif" }}>TOTAL AMOUNT</div>
//               <div style={{ fontWeight:900, fontFamily:"Poppins, sans-serif", fontSize:"1rem" }}>₹{orderInfo.total}</div>
//             </div>
//           </div>
//           <div style={{ display:"flex", justifyContent:"space-between", background:"rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 12px" }}>
//             {[["SEAT",`${userInfo.coach}-${userInfo.seat}`],["PAYMENT",payMethod==="upi"?"📱 UPI":"💵 Cash"],["ETA",orderInfo.eta]].map(([k,v])=>(
//               <div key={k}>
//                 <div style={{ fontSize:"0.57rem", opacity:0.75, fontFamily:"Nunito, sans-serif" }}>{k}</div>
//                 <div style={{ fontWeight:800, fontSize:"0.78rem", fontFamily:"Nunito, sans-serif" }}>{v}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Live tracking */}
//         <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#374151", marginBottom:12, letterSpacing:"0.5px", fontFamily:"Nunito, sans-serif" }}>🔴 LIVE ORDER TRACKING</div>
//         <div style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1px solid #f3f4f6", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
//           {TRACK_STEPS.map((step,i)=>{
//             const isDone   = i < cur;
//             const isActive = i === cur;
//             return (
//               <div key={i} style={{ display:"flex", gap:12, paddingBottom: i<TRACK_STEPS.length-1?"20px":"0", position:"relative" }}>
//                 {i < TRACK_STEPS.length-1 && (
//                   <div style={{ position:"absolute", left:17, top:38, width:2, height:"calc(100% - 20px)", transition:"background 0.5s", background: isDone?"#e65c00":"#f3f4f6" }} />
//                 )}
//                 <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, zIndex:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize: isDone?"0.8rem":"1rem", background: isDone||isActive?"#e65c00":"#f9fafb", border:`2px solid ${isDone||isActive?"#e65c00":"#e5e7eb"}`, animation: isActive?"pulse 1.5s infinite":"none", transition:"all 0.4s", color: isDone?"#fff": isActive?"#fff":"#9ca3af", fontWeight:800 }}>
//                   {isDone ? "✓" : step.icon}
//                 </div>
//                 <div style={{ paddingTop:3 }}>
//                   <div style={{ fontSize:"0.83rem", fontWeight:800, fontFamily:"Nunito, sans-serif", color: isDone||isActive?"#111827":"#9ca3af", transition:"color 0.4s", display:"flex", alignItems:"center", gap:8 }}>
//                     {step.label}
//                     {isActive && <span style={{ fontSize:"0.58rem", fontWeight:800, background:"#fff7ed", color:"#e65c00", padding:"2px 8px", borderRadius:99, border:"1px solid #fed7aa" }}>CURRENT</span>}
//                   </div>
//                   {(isDone||isActive) && (
//                     <div style={{ fontSize:"0.68rem", color:"#6b7280", marginTop:2, fontFamily:"Nunito, sans-serif", animation:"fadeUp 0.3s ease" }}>{step.sub}</div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Delivered */}
//         {done && (
//           <div style={{ background:"linear-gradient(135deg,#fff7ed,#fef9c3)", borderRadius:14, padding:"22px 20px", textAlign:"center", marginTop:14, border:"1px solid #fed7aa", animation:"bounceIn 0.5s ease" }}>
//             <div style={{ fontSize:"3rem", marginBottom:6 }}>🎉</div>
//             <div style={{ fontWeight:900, color:"#c2410c", fontSize:"1.15rem", fontFamily:"Poppins, sans-serif" }}>Order Delivered!</div>
//             <div style={{ fontSize:"0.72rem", color:"#9a3412", marginTop:4, fontFamily:"Nunito, sans-serif" }}>Thank you for ordering with Indian Railway Pantry</div>
//             {payMethod==="cod" && (
//               <div style={{ marginTop:10, padding:"9px 14px", background:"#fff", borderRadius:8, border:"1px solid #fed7aa", fontSize:"0.72rem", color:"#9a3412", fontFamily:"Nunito, sans-serif", fontWeight:700 }}>
//                 💵 Please pay ₹{orderInfo.total} to the vendor
//               </div>
//             )}
//             <button onClick={()=>window.location.reload()} style={{ marginTop:14, padding:"10px 26px", background:"#e65c00", color:"#fff", border:"none", borderRadius:99, fontWeight:800, cursor:"pointer", fontFamily:"Nunito, sans-serif", fontSize:"0.78rem", boxShadow:"0 4px 14px rgba(230,92,0,0.3)" }}>
//               Order Again ↺
//             </button>
//           </div>
//         )}

//         {/* Why Indian Railway Pantry */}
//         <div style={{ marginTop:16 }}>
//           <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#374151", marginBottom:10, letterSpacing:"0.5px", fontFamily:"Nunito, sans-serif" }}>WHY Indian Railway PANTRY?</div>
//           <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
//             {SMART_FEATURES.map(f=>(
//               <div key={f.title} style={{ background:"#fff", borderRadius:12, padding:"10px 10px", border:"1px solid #f3f4f6", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
//                 <div style={{ fontSize:"1.25rem", marginBottom:4 }}>{f.icon}</div>
//                 <div style={{ fontSize:"0.68rem", fontWeight:800, color:"#111827", fontFamily:"Nunito, sans-serif", marginBottom:2 }}>{f.title}</div>
//                 <div style={{ fontSize:"0.6rem", color:"#6b7280", fontFamily:"Nunito, sans-serif", lineHeight:1.3 }}>{f.desc}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div style={{ height:20 }} />
//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════════════════════════
//    ROOT
// ══════════════════════════════════════════════════════════════════════════════ */
// export default function PassengerQR() {
//   const [step,      setStep]      = useState(0);
//   const [userInfo,  setUserInfo]  = useState({});
//   const [orderInfo, setOrderInfo] = useState({});
//   const [payMethod, setPayMethod] = useState("upi");
//   const [cart,      setCart]      = useState({});

//   const addItem = item => setCart(c=>({...c,[item.id]:(c[item.id]||0)+1}));
//   const remItem = item => setCart(c=>{const n={...c};if(n[item.id]>1)n[item.id]--;else delete n[item.id];return n;});

//   return (
//     <>
//       <FontLink />
//       <style>{`
//         *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
//         @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
//         @keyframes spin     { to{transform:rotate(360deg)} }
//         @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(230,92,0,0.4)} 50%{box-shadow:0 0 0 8px rgba(230,92,0,0)} }
//         @keyframes bounceIn { 0%{opacity:0;transform:scale(0.8)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
//         input:focus, select:focus { border-color:#e65c00 !important; box-shadow:0 0 0 3px rgba(230,92,0,0.12) !important; }
//         ::-webkit-scrollbar { width:3px; }
//         ::-webkit-scrollbar-track { background:transparent; }
//         ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }
//         button:active { transform:scale(0.97); }
//       `}</style>

//       <div style={{ height:"100%", width:"100%", display:"flex", flexDirection:"column", fontFamily:"Nunito, sans-serif", background:"#f9fafb", overflow:"hidden", position:"relative" }}>
//         <Steps step={step} />
//         <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
//           {step===0 && <LoginScreen onNext={info=>{setUserInfo(info);setStep(1);}} />}
//           {step===1 && <MenuScreen userInfo={userInfo} cart={cart} onAdd={addItem} onRem={remItem} onNext={()=>setStep(2)} />}
//           {step===2 && <CartScreen cart={cart} onAdd={addItem} onRem={remItem} onBack={()=>setStep(1)} onNext={(t,e)=>{setOrderInfo({total:t,eta:e});setStep(3);}} />}
//           {step===3 && <PayScreen total={orderInfo.total} eta={orderInfo.eta} onBack={()=>setStep(2)} onNext={m=>{setPayMethod(m);setStep(4);}} />}
//           {step===4 && <TrackScreen userInfo={userInfo} orderInfo={orderInfo} payMethod={payMethod} />}
//         </div>
//       </div>
//     </>
//   );
// }