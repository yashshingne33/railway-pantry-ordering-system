import { useState, useEffect, useRef } from "react";
import { useStore, actions } from "./store";
import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./store";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRAINS_ASSIGNED = [
  { no: "12139", name: "Sewagram Express", from: "Nagpur",     to: "Mumbai CST" },
  { no: "12140", name: "Vidarbha Express", from: "Mumbai CST", to: "Nagpur"     },
];

const MENU = [
  { id:1,  name:"Upma",           emoji:"🫕", cat:"Breakfast", price:40  },
  { id:2,  name:"Poha",           emoji:"🍚", cat:"Breakfast", price:35  },
  { id:3,  name:"Veg Thali",      emoji:"🍱", cat:"Lunch",     price:120 },
  { id:4,  name:"Non-Veg Thali",  emoji:"🍗", cat:"Lunch",     price:150 },
  { id:5,  name:"Tea",            emoji:"☕",  cat:"Beverage",  price:20  },
  { id:6,  name:"Coffee",         emoji:"☕",  cat:"Beverage",  price:25  },
  { id:7,  name:"Samosa (2 pcs)", emoji:"🥟", cat:"Snacks",    price:30  },
  { id:8,  name:"Biscuits",       emoji:"🍪", cat:"Snacks",    price:15  },
  { id:9,  name:"Mineral Water",  emoji:"💧", cat:"Beverage",  price:20  },
  { id:10, name:"Bread Omelette", emoji:"🍳", cat:"Breakfast", price:55  },
];

const STATUS_COLOR = { Pending:"#f59e0b", Preparing:"#3b82f6", Packed:"#8b5cf6", Delivered:"#10b981" };
const STATUS_BG    = { Pending:"#fef3c7", Preparing:"#dbeafe", Packed:"#ede9fe", Delivered:"#d1fae5" };

const C_COLOR = { Open:"#dc2626", "In Progress":"#f59e0b", Resolved:"#10b981" };
const C_BG    = { Open:"#fee2e2", "In Progress":"#fef3c7", Resolved:"#d1fae5" };

let _id = 10;
const genId  = () => `ORD-${String(++_id).padStart(3,"0")}`;
const nowStr = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")} ${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}`;
};

// ─── QR Generator ─────────────────────────────────────────────────────────────
function QRPlaceholder({ data, size = 180 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx  = canvasRef.current.getContext("2d");
    const cell = Math.floor(size / 25);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    let hash = 0;
    for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
    const rng = (x, y) => { let v = Math.sin(hash * 9301 + x * 49297 + y * 233) * 49979; return v - Math.floor(v); };
    for (let r = 0; r < 25; r++) {
      for (let c = 0; c < 25; c++) {
        const inFinder = (r<7&&c<7)||(r<7&&c>17)||(r>17&&c<7);
        if (inFinder) {
          const inInner  = (r>=2&&r<=4&&c>=2&&c<=4)||(r>=2&&r<=4&&c>=20&&c<=22)||(r>=20&&r<=22&&c>=2&&c<=4);
          const isBorder = (r===0||r===6||c===0||c===6)&&r<7&&c<7;
          ctx.fillStyle  = (isBorder || inInner) ? "#111" : "#fff";
          ctx.fillRect(c * cell, r * cell, cell, cell);
        } else if (rng(r, c) > 0.45) {
          ctx.fillStyle = "#111";
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    }
  }, [data, size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 4 }} />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Badge = ({ s }) => (
  <span style={{ fontSize:"0.68rem", fontWeight:600, padding:"3px 8px", borderRadius:20,
    background: STATUS_BG[s] || "#f3f4f6", color: STATUS_COLOR[s] || "#6b7280" }}>{s}</span>
);
const CBadge = ({ s }) => (
  <span style={{ fontSize:"0.68rem", fontWeight:600, padding:"3px 8px", borderRadius:20,
    background: C_BG[s] || "#f3f4f6", color: C_COLOR[s] || "#6b7280" }}>{s}</span>
);
const Pill = ({ children, color = "gray" }) => {
  const map = { gray:["#f3f4f6","#374151"], blue:["#dbeafe","#1d4ed8"], green:["#d1fae5","#065f46"] };
  const [bg, tc] = map[color] || map.gray;
  return <span style={{ fontSize:"0.65rem", padding:"2px 7px", borderRadius:12, background:bg, color:tc, fontWeight:500 }}>{children}</span>;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VendorPanel() {
  const orders     = useStore(s => s.orders);
  const complaints = useStore(s => s.complaints) || [];

  const [tab, setTab]               = useState("active");
  const [showNew, setShowNew]       = useState(false);
  const [qrOrder, setQrOrder]       = useState(null);
  const [showQR, setShowQR]         = useState(null);
  const [editOrder, setEditOrder]   = useState(null);
  const [editItems, setEditItems]   = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const [cart, setCart]             = useState({});
  const [selTrain, setSelTrain]     = useState(TRAINS_ASSIGNED[0].no);
  const [pay, setPay]               = useState("UPI");
  const [toast, setToast]           = useState("");
  const [filter, setFilter]         = useState("All");
  const [menuCat, setMenuCat]       = useState("All");
  const [cNote, setCNote]           = useState({});   // { [complaintId]: noteText }
  const [cLoading, setCLoading]     = useState({});   // { [complaintId]: bool }

  const showToast = (m, type = "green") => { setToast({ m, type }); setTimeout(() => setToast(""), 2800); };

  // This vendor's trains
  const myTrains     = TRAINS_ASSIGNED.map(t => t.no);
  const myComplaints = complaints.filter(c => myTrains.includes(c.trainNo));
  const openCnt      = myComplaints.filter(c => c.status === "Open").length;
  const inProgCnt    = myComplaints.filter(c => c.status === "In Progress").length;

  const totalSales   = orders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.total, 0);
  const pendingCnt   = orders.filter(o => o.status === "Pending").length;
  const preparingCnt = orders.filter(o => o.status === "Preparing").length;
  const packedCnt    = orders.filter(o => o.status === "Packed").length;

  const addItem  = (item) => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
  const remItem  = (item) => setCart(c => { const n = { ...c }; if (n[item.id] > 1) n[item.id]--; else delete n[item.id]; return n; });

  const editCartTotal = editItems.reduce((s, it) => s + it.price * (cart[it.id] ?? it.qty), 0);
  const editCartCount = editItems.reduce((s, it) => s + (cart[it.id] ?? 0), 0);
  const cartTotal = editOrder
    ? editCartTotal
    : Object.entries(cart).reduce((s, [id, q]) => s + (MENU.find(m => m.id === +id)?.price || 0) * q, 0);
  const cartCount = editOrder
    ? editCartCount
    : Object.values(cart).reduce((a, b) => a + b, 0);

  const resetForm = () => { setCart({}); setPay("UPI"); };

  // ── placeOrder ────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cartCount === 0) return;
    const train = TRAINS_ASSIGNED.find(t => t.no === selTrain);
    const newOrder = {
      id:            genId(),
      trainNo:       selTrain,
      trainName:     train.name,
      seat:          "",
      coach:         "",
      items: Object.entries(cart).map(([id, qty]) => {
        const m = MENU.find(m => m.id === +id);
        return { id: +id, name: m.name, qty, price: m.price };
      }),
      total:         cartTotal,
      status:        "Pending",
      time:          nowStr(),
      payment:       pay,
      passengerName: "",
      vendorOrder:   true,
    };
    await actions.addOrder(newOrder);
    resetForm();
    setShowNew(false);
    setQrOrder(newOrder);
    showToast("✅ Order created — show QR to passenger!");
  };

  // ── saveEdit ──────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editOrder) return;
    const updatedItems = editItems
      .map(it => ({ ...it, qty: cart[it.id] ?? it.qty }))
      .filter(it => it.qty > 0);
    if (updatedItems.length === 0) return;
    const newTotal = updatedItems.reduce((s, it) => s + it.price * it.qty, 0);
    await actions.updateOrder(editOrder.id, { items: updatedItems, total: newTotal });
    setEditOrder(null); setEditItems([]); setCart({});
    showToast("✏️ Order updated!");
  };

  // ── deleteOrder ───────────────────────────────────────────────────────────
  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setConfirmDel(null);
    showToast("🗑️ Order removed", "red");
  };

  // ── markStatus ────────────────────────────────────────────────────────────
  const markStatus = async (id, status) => {
    await actions.updateOrder(id, { status });
    showToast(`Order ${id} → ${status}`);
  };

  // ── openEdit ──────────────────────────────────────────────────────────────
  const openEdit = (order) => {
    const c = {};
    order.items.forEach(it => { c[it.id] = it.qty; });
    setCart(c);
    setEditItems(order.items);
    setEditOrder(order);
    setMenuCat("All");
  };

  const addEditItem = (it) => setCart(c => ({ ...c, [it.id]: (c[it.id] || 0) + 1 }));
  const remEditItem = (it) => setCart(c => {
    const n = { ...c };
    if ((n[it.id] || 0) > 1) n[it.id]--;
    else n[it.id] = 0;
    return n;
  });

  // ── Complaint actions — write to Firestore so admin sees updates ──────────
  const updateComplaint = async (complaint, newStatus) => {
    setCLoading(l => ({ ...l, [complaint.id]: true }));
    try {
      await actions.updateComplaint(complaint.id, {
        status:       newStatus,
        vendorNote:   cNote[complaint.id] || "",
        vendorAction: newStatus === "Resolved" ? "Resolved by vendor" : "Vendor acknowledged — working on it",
        updatedAt:    nowStr(),
        ...(newStatus === "Resolved" ? { resolvedAt: nowStr() } : {}),
      });
      showToast(newStatus === "Resolved" ? "✅ Complaint resolved — admin notified" : "📋 Marked In Progress — admin notified");
    } catch {
      showToast("Failed to update complaint", "red");
    }
    setCLoading(l => ({ ...l, [complaint.id]: false }));
  };

  const trainFiltered = filter === "All" ? orders : orders.filter(o => o.trainNo === filter);
  const visible = trainFiltered.filter(o =>
    tab === "active"     ? ["Pending","Preparing"].includes(o.status) :
    tab === "packed"     ? o.status === "Packed" :
    tab === "done"       ? o.status === "Delivered" : false
  );

  const CATS      = ["All", ...new Set(MENU.map(m => m.cat))];
  const menuItems = menuCat === "All" ? MENU : MENU.filter(m => m.cat === menuCat);
  const activeQR  = qrOrder || showQR;

  const TABS = [
    ["active",      "🔥 Active",     pendingCnt + preparingCnt],
    ["packed",      "📦 Packed",     packedCnt],
    ["done",        "✅ Done",       0],
    ["complaints",  "⚠️ Complaints", openCnt + inProgCnt],
  ];

  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh", padding:"20px 24px", maxWidth:1100, margin:"0 auto", position:"relative" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:9999,
          background: toast.type === "red" ? "#fee2e2" : "#d1fae5",
          color:      toast.type === "red" ? "#991b1b" : "#065f46",
          padding:"10px 18px", borderRadius:10, fontWeight:600, fontSize:"0.85rem",
          boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
          border:`1px solid ${toast.type === "red" ? "#fca5a5" : "#6ee7b7"}`}}>
          {toast.m}
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"#1e3a5f", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:"0.8rem" }}>VP</div>
          <div>
            <h1 style={{ margin:0, fontSize:"1.3rem", fontWeight:700, color:"#0f172a" }}>Vendor Panel</h1>
            <p style={{ margin:0, fontSize:"0.72rem", color:"#64748b" }}>Ramesh Kumar · NGP Division</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding:"7px 12px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", fontSize:"0.8rem", color:"#334155", cursor:"pointer" }}>
            <option value="All">All Trains</option>
            {TRAINS_ASSIGNED.map(t => <option key={t.no} value={t.no}>{t.no} – {t.name}</option>)}
          </select>
          <button onClick={() => setShowNew(true)}
            style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:600, fontSize:"0.82rem", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ➕ Generate Order QR
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { icon:"💳", label:"Sales Today",  value:`₹${totalSales.toLocaleString("en-IN")}`, color:"#10b981", bg:"#ecfdf5" },
          { icon:"📋", label:"Total Orders", value:orders.length,                             color:"#3b82f6", bg:"#eff6ff" },
          { icon:"🕒", label:"Pending",      value:pendingCnt,                                color:"#f59e0b", bg:"#fffbeb" },
          { icon:"🚨", label:"Open Issues",  value:openCnt + inProgCnt,                       color:"#dc2626", bg:"#fee2e2" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"14px 16px", border:`1px solid ${s.bg}`, borderLeft:`4px solid ${s.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, fontSize:"0.65rem", color:"#94a3b8", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>{s.label}</p>
                <p style={{ margin:"4px 0 0", fontSize:"1.5rem", fontWeight:700, color:"#0f172a" }}>{s.value}</p>
              </div>
              <span style={{ fontSize:"1.6rem" }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16, background:"#f1f5f9", borderRadius:10, padding:4, width:"fit-content" }}>
        {TABS.map(([key, label, cnt]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer", fontWeight:600, fontSize:"0.8rem",
              background: tab === key ? "#fff" : "transparent",
              color:      tab === key ? "#1e3a5f" : "#64748b",
              boxShadow:  tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              display:"flex", alignItems:"center", gap:5 }}>
            {label}
            {cnt > 0 && (
              <span style={{
                background: tab === key ? (key === "complaints" ? "#dc2626" : "#1e3a5f") : "#94a3b8",
                color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:"0.6rem" }}>
                {cnt}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── COMPLAINTS TAB ────────────────────────────────────────────────── */}
      {tab === "complaints" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Summary row */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:4 }}>
            {[
              { label:"Open",        count: myComplaints.filter(c => c.status === "Open").length,        color:"#dc2626", bg:"#fee2e2" },
              { label:"In Progress", count: myComplaints.filter(c => c.status === "In Progress").length, color:"#f59e0b", bg:"#fef3c7" },
              { label:"Resolved",    count: myComplaints.filter(c => c.status === "Resolved").length,    color:"#10b981", bg:"#d1fae5" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, background:"#fff",
                border:`1px solid ${s.bg}`, borderRadius:10, padding:"8px 14px" }}>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:s.color }}>{s.label}</span>
                <span style={{ fontSize:"1.1rem", fontWeight:800, color:s.color }}>{s.count}</span>
              </div>
            ))}
            <span style={{ marginLeft:"auto", fontSize:"0.68rem", color:"#94a3b8" }}>🔄 Syncs to admin in real-time</span>
          </div>

          {myComplaints.length === 0 && (
            <div style={{ textAlign:"center", padding:"3rem", color:"#94a3b8", fontSize:"0.85rem",
              background:"#fff", borderRadius:12, border:"1px solid #e2e8f0" }}>
              🎉 No complaints on your trains
            </div>
          )}

          {myComplaints.map(c => (
            <div key={c.id} style={{ background:"#fff", borderRadius:12, padding:16,
              border:"1px solid #e2e8f0", borderLeft:`4px solid ${C_COLOR[c.status] || "#e2e8f0"}` }}>

              {/* Card header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:"0.9rem", color:"#0f172a" }}>{c.name}</p>
                    <CBadge s={c.status} />
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Pill color="blue">🚂 {c.trainNo}</Pill>
                    <Pill>💺 Seat {c.seat}</Pill>
                    <Pill>🕐 {c.time}</Pill>
                  </div>
                </div>
                <span style={{ fontSize:"1.6rem" }}>
                  {c.status === "Open" ? "🔴" : c.status === "In Progress" ? "🟡" : "🟢"}
                </span>
              </div>

              {/* Issue text */}
              <div style={{ background:"#f8fafc", borderRadius:8, padding:"10px 12px", marginBottom:10, border:"1px solid #e2e8f0" }}>
                <p style={{ margin:0, fontSize:"0.65rem", color:"#94a3b8", fontWeight:600, marginBottom:3 }}>PASSENGER COMPLAINT</p>
                <p style={{ margin:0, fontSize:"0.82rem", color:"#0f172a" }}>{c.issue}</p>
              </div>

              {/* Previous vendor note */}
              {c.vendorNote && (
                <div style={{ background:"#eff6ff", borderRadius:8, padding:"8px 12px", marginBottom:10, border:"1px solid #bfdbfe" }}>
                  <p style={{ margin:0, fontSize:"0.65rem", color:"#1d4ed8", fontWeight:600, marginBottom:2 }}>YOUR NOTE</p>
                  <p style={{ margin:0, fontSize:"0.78rem", color:"#1e3a5f" }}>{c.vendorNote}</p>
                  {c.updatedAt && <p style={{ margin:"4px 0 0", fontSize:"0.62rem", color:"#94a3b8" }}>Updated {c.updatedAt}</p>}
                </div>
              )}

              {/* Action area */}
              {c.status !== "Resolved" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <textarea
                    placeholder="Add a note for admin (optional)..."
                    value={cNote[c.id] || ""}
                    onChange={e => setCNote(n => ({ ...n, [c.id]: e.target.value }))}
                    rows={2}
                    style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #e2e8f0",
                      fontSize:"0.78rem", color:"#0f172a", resize:"vertical", fontFamily:"inherit",
                      boxSizing:"border-box", outline:"none" }}
                  />
                  <div style={{ display:"flex", gap:8 }}>
                    {c.status === "Open" && (
                      <button
                        disabled={cLoading[c.id]}
                        onClick={() => updateComplaint(c, "In Progress")}
                        style={{ flex:1, padding:"8px 12px", background:"#fef3c7", color:"#92400e",
                          border:"1px solid #fde68a", borderRadius:8, fontWeight:600, fontSize:"0.78rem",
                          cursor:"pointer", opacity: cLoading[c.id] ? 0.6 : 1 }}>
                        {cLoading[c.id] ? "Updating..." : "🟡 Mark In Progress"}
                      </button>
                    )}
                    <button
                      disabled={cLoading[c.id]}
                      onClick={() => updateComplaint(c, "Resolved")}
                      style={{ flex:1, padding:"8px 12px", background:"#d1fae5", color:"#065f46",
                        border:"1px solid #6ee7b7", borderRadius:8, fontWeight:600, fontSize:"0.78rem",
                        cursor:"pointer", opacity: cLoading[c.id] ? 0.6 : 1 }}>
                      {cLoading[c.id] ? "Updating..." : "✅ Mark Resolved"}
                    </button>
                  </div>
                </div>
              )}

              {/* Resolved stamp */}
              {c.status === "Resolved" && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
                  background:"#d1fae5", borderRadius:8, border:"1px solid #6ee7b7" }}>
                  <span>✅</span>
                  <p style={{ margin:0, fontSize:"0.75rem", color:"#065f46", fontWeight:600 }}>
                    Resolved {c.resolvedAt ? `at ${c.resolvedAt}` : ""} — visible to admin
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ORDER GRID ────────────────────────────────────────────────────── */}
      {tab !== "complaints" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
          {visible.map(o => (
            <div key={o.id} style={{ background:"#fff", borderRadius:12, padding:"14px 16px", border:"1px solid #e2e8f0", position:"relative" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:"0.85rem", color:"#0f172a" }}>{o.id}</p>
                  <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                    {o.seat ? <Pill color="blue">{o.seat}</Pill> : <Pill>🚂 {o.trainNo}</Pill>}
                    <Pill>{o.payment === "UPI" ? "📱" : "💵"} {o.payment}</Pill>
                    {o.vendorOrder && !o.seat && <Pill color="green">📋 Awaiting scan</Pill>}
                  </div>
                </div>
                <Badge s={o.status} />
              </div>

              <div style={{ background:"#f8fafc", borderRadius:7, padding:"6px 10px", marginBottom:8, border:"1px solid #e2e8f0" }}>
                <p style={{ margin:0, fontSize:"0.68rem", color:"#475569", fontWeight:600 }}>🚂 {o.trainNo} · {o.trainName}</p>
                <p style={{ margin:0, fontSize:"0.63rem", color:"#94a3b8" }}>{o.passengerName || "Awaiting passenger"} · {o.time}</p>
              </div>

              <p style={{ margin:"0 0 8px", fontSize:"0.72rem", color:"#64748b", lineHeight:1.5 }}>
                {o.items.map(it => `${it.name} ×${it.qty}`).join(" · ")}
              </p>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                <span style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a" }}>₹{o.total}</span>
                <div style={{ display:"flex", gap:5 }}>
                  {o.status !== "Delivered" && (
                    <button onClick={() => openEdit(o)} title="Edit order"
                      style={{ background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6, padding:"4px 8px", fontSize:"0.7rem", cursor:"pointer", fontWeight:600 }}>
                      ✏️
                    </button>
                  )}
                  {o.status === "Pending" && (
                    <button onClick={() => setConfirmDel(o.id)} title="Delete order"
                      style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:6, padding:"4px 8px", fontSize:"0.7rem", cursor:"pointer", fontWeight:600 }}>
                      🗑️
                    </button>
                  )}
                  {o.status === "Pending"   && <button onClick={() => markStatus(o.id, "Preparing")} style={actBtn("#3b82f6")}>Start</button>}
                  {o.status === "Preparing" && <button onClick={() => markStatus(o.id, "Packed")}    style={actBtn("#8b5cf6")}>📦 Pack</button>}
                  {o.status === "Packed"    && <button onClick={() => markStatus(o.id, "Delivered")} style={actBtn("#10b981")}>✅ Deliver</button>}
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#94a3b8", fontSize:"0.85rem" }}>
              No orders here
            </div>
          )}
        </div>
      )}

      {/* ── New / Edit Drawer ─────────────────────────────────────────────── */}
      {(showNew || editOrder) && (
        <Overlay onClose={() => {
          if (showNew) { setShowNew(false); resetForm(); }
          else { setEditOrder(null); setEditItems([]); setCart({}); }
        }}>
          <DrawerHeader
            title={editOrder ? "Edit Order" : "New Pantry Order"}
            onClose={() => {
              if (showNew) { setShowNew(false); resetForm(); }
              else { setEditOrder(null); setEditItems([]); setCart({}); }
            }}
          />
          <div style={{ overflowY:"auto", flex:1, padding:"0 20px 16px" }}>

            {/* Train */}
            <div style={{ marginBottom:12, paddingTop:14 }}>
              <label style={labelSt}>Assigned Train *</label>
              <select style={inputSt} value={editOrder ? editOrder.trainNo : selTrain}
                onChange={e => !editOrder && setSelTrain(e.target.value)} disabled={!!editOrder}>
                {TRAINS_ASSIGNED.map(t => <option key={t.no} value={t.no}>{t.no} – {t.name} ({t.from} → {t.to})</option>)}
              </select>
            </div>

            {/* Payment — new only */}
            {!editOrder && (
              <div style={{ marginBottom:14 }}>
                <label style={labelSt}>Payment Method</label>
                <div style={{ display:"flex", gap:8 }}>
                  {["UPI","Cash"].map(m => (
                    <button key={m} onClick={() => setPay(m)}
                      style={{ flex:1, padding:"8px", borderRadius:7, border:`1.5px solid ${pay===m?"#1e3a5f":"#e2e8f0"}`,
                        background: pay===m ? "#1e3a5f" : "#fff", color: pay===m ? "#fff" : "#64748b",
                        fontWeight:600, fontSize:"0.78rem", cursor:"pointer" }}>
                      {m === "UPI" ? "📱 UPI" : "💵 Cash"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category filter — new only */}
            {!editOrder && (
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setMenuCat(c)}
                    style={{ padding:"4px 12px", borderRadius:20, border:"1px solid", cursor:"pointer", fontSize:"0.72rem", fontWeight:600,
                      background:  menuCat===c ? "#1e3a5f" : "#fff",
                      color:       menuCat===c ? "#fff" : "#64748b",
                      borderColor: menuCat===c ? "#1e3a5f" : "#e2e8f0" }}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            {/* EDIT MODE — order's own items */}
            {editOrder && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {editItems.map(it => {
                  const qty = cart[it.id] ?? it.qty;
                  return (
                    <div key={it.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"8px 10px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:"1.3rem" }}>{it.emoji || "🍽️"}</span>
                        <div>
                          <p style={{ margin:0, fontWeight:600, fontSize:"0.8rem", color:"#0f172a" }}>{it.name}</p>
                          <p style={{ margin:0, fontSize:"0.65rem", color:"#94a3b8" }}>₹{it.price} each</p>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontWeight:700, fontSize:"0.82rem", color:"#475569" }}>₹{it.price}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <button onClick={() => remEditItem(it)} style={qtyBtn("#dc2626")}>−</button>
                          <span style={{ fontWeight:700, minWidth:18, textAlign:"center", fontSize:"0.85rem" }}>{qty}</span>
                          <button onClick={() => addEditItem(it)} style={qtyBtn("#10b981")}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NEW ORDER MODE — full menu */}
            {!editOrder && (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {menuItems.map(item => (
                  <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"8px 10px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:"1.3rem" }}>{item.emoji}</span>
                      <div>
                        <p style={{ margin:0, fontWeight:600, fontSize:"0.8rem", color:"#0f172a" }}>{item.name}</p>
                        <p style={{ margin:0, fontSize:"0.65rem", color:"#94a3b8" }}>{item.cat}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:700, fontSize:"0.82rem", color:"#475569" }}>₹{item.price}</span>
                      {cart[item.id]
                        ? <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <button onClick={() => remItem(item)} style={qtyBtn("#dc2626")}>−</button>
                            <span style={{ fontWeight:700, minWidth:18, textAlign:"center", fontSize:"0.85rem" }}>{cart[item.id]}</span>
                            <button onClick={() => addItem(item)} style={qtyBtn("#10b981")}>+</button>
                          </div>
                        : <button onClick={() => addItem(item)}
                            style={{ background:"#1e3a5f", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:"0.72rem", cursor:"pointer", fontWeight:600 }}>
                            Add
                          </button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky footer */}
          <div style={{ padding:"12px 20px", borderTop:"1px solid #e2e8f0", background:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, fontSize:"0.65rem", color:"#94a3b8" }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                <p style={{ margin:0, fontWeight:800, fontSize:"1.1rem", color:"#0f172a" }}>₹{cartTotal}</p>
              </div>
              <button
                disabled={!editOrder && cartCount === 0}
                onClick={editOrder ? saveEdit : placeOrder}
                style={{ background: (!editOrder && cartCount === 0) ? "#94a3b8" : "#1e3a5f",
                  color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>
                {editOrder ? "💾 Save Changes" : "✅ Confirm & Show QR"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── QR Modal ─────────────────────────────────────────────────────── */}
      {activeQR && (
        <Overlay onClose={() => { setShowQR(null); setQrOrder(null); }} centered>
          <DrawerHeader
            title={qrOrder ? "🎉 Show QR to Passenger" : "Order QR Code"}
            onClose={() => { setShowQR(null); setQrOrder(null); }}
          />
          <div style={{ padding:"20px", textAlign:"center" }}>
            <div style={{ background:"#fff", borderRadius:12, padding:16, display:"inline-block", border:"2px solid #e2e8f0", marginBottom:14 }}>
              <QRPlaceholder data={activeQR.id} size={190} />
            </div>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"10px 16px", border:"1px solid #e2e8f0", marginBottom:12,
              display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontWeight:900, fontSize:"1.15rem", color:"#0f172a", letterSpacing:"2px" }}>{activeQR.id}</span>
              <button onClick={() => navigator.clipboard?.writeText(activeQR.id)}
                style={{ background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6,
                  padding:"3px 9px", fontSize:"0.68rem", cursor:"pointer", fontWeight:700 }}>
                Copy
              </button>
            </div>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", border:"1px solid #e2e8f0", textAlign:"left", marginBottom:12 }}>
              <p style={{ margin:"0 0 5px", fontSize:"0.72rem", color:"#475569", fontWeight:600 }}>🚂 {activeQR.trainNo} – {activeQR.trainName}</p>
              <p style={{ margin:"0 0 4px", fontSize:"0.72rem", color:"#475569" }}>
                {activeQR.items.map(i => `${i.name} ×${i.qty}`).join("  ·  ")}
              </p>
              <p style={{ margin:"4px 0 0", fontWeight:700, fontSize:"0.95rem", color:"#0f172a" }}>₹{activeQR.total}</p>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      {confirmDel && (
        <Overlay onClose={() => setConfirmDel(null)} centered small>
          <div style={{ padding:"24px 20px", textAlign:"center" }}>
            <p style={{ fontSize:"2rem", margin:"0 0 8px" }}>🗑️</p>
            <p style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a", margin:"0 0 6px" }}>Delete Order?</p>
            <p style={{ fontSize:"0.8rem", color:"#64748b", margin:"0 0 18px" }}>This will permanently remove <strong>{confirmDel}</strong>.</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button onClick={() => setConfirmDel(null)}
                style={{ padding:"8px 18px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>
                Cancel
              </button>
              <button onClick={() => deleteOrder(confirmDel)}
                style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>
                Delete
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
function Overlay({ children, onClose, centered, small }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:1000,
      display:"flex", alignItems: centered ? "center" : "flex-end", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:"#fff", borderRadius: centered ? "14px" : "14px 14px 0 0",
          width: centered ? (small ? 320 : 420) : "100%", maxWidth: centered ? 420 : 560,
          maxHeight: centered ? "auto" : "90vh",
          display:"flex", flexDirection:"column",
          boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        {children}
      </div>
    </div>
  );
}
function DrawerHeader({ title, onClose }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #e2e8f0" }}>
      <span style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a" }}>{title}</span>
      <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", fontWeight:700, fontSize:"1rem", color:"#475569" }}>✕</button>
    </div>
  );
}

const labelSt = { display:"block", fontSize:"0.65rem", fontWeight:600, color:"#64748b", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.04em" };
const inputSt = { width:"100%", padding:"7px 10px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:"0.82rem", color:"#0f172a", background:"#fff", boxSizing:"border-box" };
const actBtn  = (c) => ({ background:c, color:"#fff", border:"none", borderRadius:6, padding:"5px 10px", fontSize:"0.7rem", cursor:"pointer", fontWeight:600 });
const qtyBtn  = (c) => ({ background:c, color:"#fff", border:"none", borderRadius:5, width:22, height:22, cursor:"pointer", fontWeight:700, fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center" });