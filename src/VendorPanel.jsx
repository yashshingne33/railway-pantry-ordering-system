/**
 * VendorPanel.jsx
 * Indian Railway Pantry Management System — Pantry Panel
 * Fixed: blue row hover, working QR download, live stats, renamed to Pantry
 */

import { useState, useEffect, useRef } from "react";
import { useStore, actions } from "./store";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "./store";
import VendorMenuEditor from './VendorMenuEditor';

/* ── Professional SVG Icons ─────────────────────────────────────────────── */
const Icons = {
  Train: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/>
      <path d="M8 17l-2 4"/><path d="M18 21l-2-4"/>
    </svg>
  ),
  Revenue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Qr: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Copy: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Download: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

/* ── Status colors ────────────────────────────────────────────────────────── */
const STATUS_COLOR = { Pending: "#ca8a04", Preparing: "#1d4ed8", Packed: "#7c3aed", Delivered: "#16a34a" };
const STATUS_BG    = { Pending: "#fef3c7", Preparing: "#dbeafe", Packed: "#ede9fe", Delivered: "#dcfce7" };
const STATUS_BD    = { Pending: "#fde68a", Preparing: "#bfdbfe", Packed: "#c4b5fd", Delivered: "#6ee7b7" };
const C_COLOR      = { Open: "#dc2626", "In Progress": "#ca8a04", Resolved: "#16a34a" };
const C_BG         = { Open: "#fef2f2", "In Progress": "#fef3c7", Resolved: "#f0fdf4" };
const C_BD         = { Open: "#fecaca", "In Progress": "#fde68a", Resolved: "#bbf7d0" };

let _id = 10;
const genId  = () => `ORD-${String(++_id).padStart(3, "0")}`;
const nowStr = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
};

/* ── QR Placeholder ──────────────────────────────────────────────────────── */
function QRPlaceholder({ data, size = 180 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const cell = Math.floor(size / 25);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    let hash = 0;
    for (let i = 0; i < data.length; i++) { hash = ((hash << 5) - hash) + data.charCodeAt(i); hash |= 0; }
    const rng = (x, y) => { let v = Math.sin(hash * 9301 + x * 49297 + y * 233) * 49979; return v - Math.floor(v); };
    for (let r = 0; r < 25; r++) {
      for (let c = 0; c < 25; c++) {
        const inFinder = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
        if (inFinder) {
          const inInner  = (r >= 2 && r <= 4 && c >= 2 && c <= 4) || (r >= 2 && r <= 4 && c >= 20 && c <= 22) || (r >= 20 && r <= 22 && c >= 2 && c <= 4);
          const isBorder = (r === 0 || r === 6 || c === 0 || c === 6) && r < 7 && c < 7;
          ctx.fillStyle  = (isBorder || inInner) ? "#0a1628" : "#fff";
          ctx.fillRect(c * cell, r * cell, cell, cell);
        } else if (rng(r, c) > 0.45) {
          ctx.fillStyle = "#0a1628";
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    }
  }, [data, size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 4 }} />;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const StatusBadge = ({ s }) => (
  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: STATUS_BG[s] || "#f1f5f9", color: STATUS_COLOR[s] || "#475569", border: `1px solid ${STATUS_BD[s] || "#e2e8f0"}`, whiteSpace: "nowrap" }}>{s}</span>
);

const CBadge = ({ s }) => (
  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C_BG[s] || "#f1f5f9", color: C_COLOR[s] || "#475569", border: `1px solid ${C_BD[s] || "#e2e8f0"}`, whiteSpace: "nowrap" }}>{s}</span>
);

const Pill = ({ children, color = "gray" }) => {
  const map = { gray: ["#f1f5f9", "#374151"], blue: ["#dbeafe", "#1e40af"], green: ["#dcfce7", "#15803d"], yellow: ["#fef3c7", "#92400e"] };
  const [bg, tc] = map[color] || map.gray;
  return <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 10, background: bg, color: tc, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
};

const Stars = ({ rating, size = 14 }) => (
  <span style={{ color: "#ca8a04", fontSize: size, letterSpacing: 1 }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

const RatingBar = ({ count, total }) => (
  <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${total ? (count / total) * 100 : 0}%`, background: "#ca8a04", borderRadius: 99, transition: "width .5s" }}/>
  </div>
);

function useNewRatingCount(feedback, myTrains) {
  const prevLen = useRef(feedback.filter(f => myTrains.includes(f.trainNo)).length);
  const [newCount, setNewCount] = useState(0);
  useEffect(() => {
    const current = feedback.filter(f => myTrains.includes(f.trainNo)).length;
    if (current > prevLen.current) setNewCount(c => c + (current - prevLen.current));
    prevLen.current = current;
  }, [feedback, myTrains]);
  return [newCount, () => setNewCount(0)];
}

/* ── QR Download helper ──────────────────────────────────────────────────── */
function downloadSVG(svgElement, filename) {
  if (!svgElement) return;
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  canvas.width = 400; canvas.height = 400;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(img, 0, 0, 400, 400);
    const a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
  img.onerror = () => {
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = filename.replace(".png", ".svg");
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function VendorPanel({ vendor }) {
  const orders     = useStore(s => s.orders);
  const complaints = useStore(s => s.complaints) || [];
  const feedback   = useStore(s => s.feedback)   || [];

  const [tab, setTab]               = useState("active");
  const [showNew, setShowNew]       = useState(false);
  const [qrOrder, setQrOrder]       = useState(null);
  const [showQR, setShowQR]         = useState(null);
  const [editOrder, setEditOrder]   = useState(null);
  const [editItems, setEditItems]   = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const [cart, setCart]             = useState({});
  const [pay, setPay]               = useState("UPI");
  const [toast, setToast]           = useState("");
  const [filter, setFilter]         = useState("All");
  const [menuCat, setMenuCat]       = useState("All");
  const [cNote, setCNote]           = useState({});
  const [cLoading, setCLoading]     = useState({});
  const [ratingFilter, setRatingFilter] = useState("All");
  const [menuItems, setMenuItems]   = useState([]);
  const qrModalRef = useRef(null);

  /* ── Derive from vendor session ──────────────────────────────────────── */
  const vendorTrainNo   = vendor?.trainNo || vendor?.train || "";
  const vendorTrainName = vendor?.trainName || "";
  const TRAINS_ASSIGNED = vendorTrainNo
    ? [{ no: vendorTrainNo, name: vendorTrainName, from: "", to: "" }]
    : [];
  const [selTrain] = useState(vendorTrainNo);

  /* ── Load menu from Firestore ────────────────────────────────────────── */
  useEffect(() => {
    if (!vendorTrainNo) return;
    const unsubscribe = actions.subscribeTrainMenu?.(vendorTrainNo, (items) => {
      setMenuItems(items || []);
    });
    return () => unsubscribe?.();
  }, [vendorTrainNo]);

  const showToast = (m, type = "green") => { setToast({ m, type }); setTimeout(() => setToast(""), 2800); };

  const myTrains     = TRAINS_ASSIGNED.map(t => t.no).filter(Boolean);
  const myComplaints = complaints.filter(c => myTrains.includes(c.trainNo));
  const myFeedback   = feedback.filter(f => myTrains.includes(f.trainNo));
  const openCnt      = myComplaints.filter(c => c.status === "Open").length;
  const inProgCnt    = myComplaints.filter(c => c.status === "In Progress").length;

  /* ── Live stats — always computed from store orders ──────────────────── */
  const myOrders     = orders.filter(o => myTrains.includes(o.trainNo));
  const totalSales   = myOrders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.total, 0);
  const pendingCnt   = myOrders.filter(o => o.status === "Pending").length;
  const preparingCnt = myOrders.filter(o => o.status === "Preparing").length;
  const packedCnt    = myOrders.filter(o => o.status === "Packed").length;

  const avgRating = myFeedback.length
    ? (myFeedback.reduce((s, f) => s + f.rating, 0) / myFeedback.length).toFixed(1)
    : null;

  const [newRatingCount, clearNewRatings] = useNewRatingCount(feedback, myTrains);

  const MENU = menuItems.length > 0 ? menuItems.filter(i => i.available !== false) : [];
  const CATS = ["All", ...new Set(MENU.map(m => m.cat))];
  const filteredMenu = menuCat === "All" ? MENU : MENU.filter(m => m.cat === menuCat);

  /* ── Cart helpers ────────────────────────────────────────────────────── */
  const addItem  = (item) => setCart(c => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
  const remItem  = (item) => setCart(c => { const n = { ...c }; if (n[item.id] > 1) n[item.id]--; else delete n[item.id]; return n; });

  const editCartTotal = editItems.reduce((s, it) => s + it.price * (cart[it.id] ?? it.qty), 0);
  const editCartCount = editItems.reduce((s, it) => s + (cart[it.id] ?? 0), 0);
  const cartTotal     = editOrder ? editCartTotal : Object.entries(cart).reduce((s, [id, q]) => s + (MENU.find(m => m.id === id || m.id === +id)?.price || 0) * q, 0);
  const cartCount     = editOrder ? editCartCount : Object.values(cart).reduce((a, b) => a + b, 0);

  const resetForm = () => { setCart({}); setPay("UPI"); };

  /* ── QR Download handler (ref-based) ─────────────────────────────────── */
  const handleQRDownload = (trainNo) => {
    const svg = qrModalRef.current?.querySelector("svg");
    downloadSVG(svg, `QR-Order-${trainNo}.png`);
  };

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const placeOrder = async () => {
    if (cartCount === 0) return;
    const train = TRAINS_ASSIGNED.find(t => t.no === selTrain);
    const newOrder = {
      id: genId(), trainNo: selTrain, trainName: train?.name || vendorTrainName,
      seat: "", coach: "",
      items: Object.entries(cart).map(([id, qty]) => {
        const m = MENU.find(m => m.id === id || m.id === +id);
        return { id, name: m?.name, qty, price: m?.price };
      }),
      total: cartTotal, status: "Pending", time: nowStr(), payment: pay, passengerName: "", vendorOrder: true,
    };
    await actions.addOrder(newOrder);
    resetForm(); setShowNew(false); setQrOrder(newOrder);
    showToast("Order created — show QR to passenger");
  };

  const saveEdit = async () => {
    if (!editOrder) return;
    const updatedItems = editItems.map(it => ({ ...it, qty: cart[it.id] ?? it.qty })).filter(it => it.qty > 0);
    if (updatedItems.length === 0) return;
    const newTotal = updatedItems.reduce((s, it) => s + it.price * it.qty, 0);
    await actions.updateOrder(editOrder.id, { items: updatedItems, total: newTotal });
    setEditOrder(null); setEditItems([]); setCart({});
    showToast("Order updated");
  };

  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setConfirmDel(null);
    showToast("Order removed", "red");
  };

  const markStatus = async (id, status) => {
    await actions.updateOrder(id, { status });
    showToast(`Order ${id} → ${status}`);
  };

  const openEdit = (order) => {
    const c = {};
    order.items.forEach(it => { c[it.id] = it.qty; });
    setCart(c); setEditItems(order.items); setEditOrder(order); setMenuCat("All");
  };

  const addEditItem = (it) => setCart(c => ({ ...c, [it.id]: (c[it.id] || 0) + 1 }));
  const remEditItem = (it) => setCart(c => { const n = { ...c }; if ((n[it.id] || 0) > 1) n[it.id]--; else n[it.id] = 0; return n; });

  const updateComplaint = async (complaint, newStatus) => {
    setCLoading(l => ({ ...l, [complaint.id]: true }));
    try {
      await actions.updateComplaint(complaint.id, {
        status: newStatus,
        vendorNote: cNote[complaint.id] || "",
        vendorAction: newStatus === "Resolved" ? "Resolved by pantry" : "Pantry acknowledged",
        updatedAt: nowStr(),
        ...(newStatus === "Resolved" ? { resolvedAt: nowStr() } : {}),
      });
      showToast(newStatus === "Resolved" ? "Complaint resolved" : "Marked In Progress");
    } catch {
      showToast("Failed to update complaint", "red");
    }
    setCLoading(l => ({ ...l, [complaint.id]: false }));
  };

  /* ── Filtered orders ─────────────────────────────────────────────────── */
  const trainFiltered = filter === "All" ? orders : orders.filter(o => o.trainNo === filter);
  const visible = trainFiltered.filter(o =>
    tab === "active"  ? ["Pending", "Preparing"].includes(o.status) :
    tab === "packed"  ? o.status === "Packed" :
    tab === "done"    ? o.status === "Delivered" : false
  );

  const filteredRatings = ratingFilter === "All"
    ? myFeedback
    : myFeedback.filter(f => f.rating === parseInt(ratingFilter));

  const activeQR = qrOrder || showQR;

  const TABS = [
    ["active",     Icons.CheckCircle, "Active",     pendingCnt + preparingCnt],
    ["packed",     Icons.Package,     "Packed",     packedCnt],
    ["done",       Icons.CheckCircle, "Done",       0],
    ["complaints", Icons.Alert,       "Complaints", openCnt + inProgCnt],
    ["ratings",    Icons.Star,        "Ratings",    newRatingCount],
    ["menu",       Icons.Menu,        "Menu",       0],
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f7ff", minHeight: "100vh", padding: "clamp(12px,3vw,22px)" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: "clamp(12px,3vw,24px)", zIndex: 9999, background: toast.type === "red" ? "#fef2f2" : "#d1fae5", color: toast.type === "red" ? "#991b1b" : "#065f46", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: "0.83rem", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: `1px solid ${toast.type === "red" ? "#fecaca" : "#6ee7b7"}` }}>
          {toast.m}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.1rem,3vw,1.45rem)", fontWeight: 800, color: "#0a1628", letterSpacing: "-0.3px" }}>Pantry Panel</h1>
          <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
            {vendor?.name} · {vendorTrainName || `Train ${vendorTrainNo}`} · NGP Division
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {myTrains.length > 1 && (
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #dbeafe", background: "#fff", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <option value="All">All Trains</option>
              {TRAINS_ASSIGNED.map(t => <option key={t.no} value={t.no}>{t.no} – {t.name}</option>)}
            </select>
          )}
          <button onClick={() => setShowNew(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "linear-gradient(135deg,#0a1628,#1d4ed8)", color: "#fff", border: "none", borderRadius: 9, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(29,78,216,0.3)" }}>
            <Icons.Plus /> New Order
          </button>
        </div>
      </div>

      {/* Stat Cards — all live from store */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(120px,18vw,160px),1fr))", gap: "clamp(8px,2vw,12px)", marginBottom: 20 }}>
        {[
          { icon: Icons.Revenue,  label: "Sales Today",  value: `₹${totalSales.toLocaleString("en-IN")}`, color: "#16a34a", bg: "#dcfce7", border: "#16a34a" },
          { icon: Icons.Package,  label: "Total Orders", value: myOrders.length,                           color: "#1d4ed8", bg: "#dbeafe", border: "#1d4ed8" },
          { icon: Icons.Clock,    label: "Pending",      value: pendingCnt,                                color: "#ca8a04", bg: "#fef3c7", border: "#ca8a04" },
          { icon: Icons.Star,     label: "Avg Rating",   value: avgRating || "—",                          color: "#ca8a04", bg: "#fef3c7", border: "#ca8a04" },
          { icon: Icons.Alert,    label: "Open Issues",  value: openCnt + inProgCnt,                       color: "#dc2626", bg: "#fef2f2", border: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "clamp(10px,2vw,15px)", border: "1px solid #e2e8f0", borderLeft: `4px solid ${s.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontWeight: 800, color: "#0a1628", lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ marginBottom: 18, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 2, padding: 4, background: "#e8f0ff", borderRadius: 12, border: "1px solid #bfdbfe", width: "fit-content", minWidth: "100%" }}>
          {TABS.map(([key, Icon, label, cnt]) => (
            <button key={key}
              onClick={() => { setTab(key); if (key === "ratings") clearNewRatings(); }}
              style={{ padding: "7px clamp(8px,2vw,16px)", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: "clamp(0.7rem,1.5vw,0.78rem)", background: tab === key ? "#fff" : "transparent", color: tab === key ? "#1d4ed8" : "#64748b", boxShadow: tab === key ? "0 1px 6px rgba(29,78,216,0.12)" : "none", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}
            >
              <span style={{ opacity: tab === key ? 1 : 0.6 }}><Icon /></span>
              {label}
              {cnt > 0 && (
                <span style={{ background: tab === key ? (key === "complaints" ? "#dc2626" : key === "ratings" ? "#ca8a04" : "#1d4ed8") : "#94a3b8", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: "0.58rem", fontWeight: 700, animation: key === "ratings" && cnt > 0 ? "pulse .8s ease infinite" : "none" }}>{cnt}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── RATINGS TAB ── */}
      {tab === "ratings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myFeedback.length > 0 ? (
            <div style={{ background: "linear-gradient(135deg,#fefce8,#fffbeb)", border: "1px solid #fde68a", borderRadius: 14, padding: "clamp(14px,3vw,20px)", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: "3rem", fontWeight: 900, color: "#92400e", lineHeight: 1 }}>{avgRating}</p>
                <Stars rating={parseFloat(avgRating)} size={18}/>
                <p style={{ margin: "6px 0 0", fontSize: "0.62rem", color: "#a16207", fontWeight: 600 }}>{myFeedback.length} reviews</p>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const cnt = myFeedback.filter(f => f.rating === star).length;
                  return (
                    <button key={star} onClick={() => setRatingFilter(ratingFilter === String(star) ? "All" : String(star))} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, width: "100%", background: ratingFilter === String(star) ? "#fef3c7" : "transparent", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6 }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#92400e", width: 8, textAlign: "right" }}>{star}</span>
                      <span style={{ fontSize: "0.7rem", color: "#ca8a04" }}>★</span>
                      <RatingBar count={cnt} total={myFeedback.length}/>
                      <span style={{ fontSize: "0.62rem", color: "#a16207", width: 20, textAlign: "right", fontWeight: 600 }}>{cnt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0a1628", margin: "0 0 4px" }}>No ratings yet</p>
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>Passenger ratings will appear here in real-time</p>
            </div>
          )}
          {myFeedback.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "#f8faff", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 0 2px #dcfce7", flexShrink: 0 }}/>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0a1628" }}>Passenger Ratings</span>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#16a34a", padding: "1px 7px", background: "#dcfce7", borderRadius: 99, border: "1px solid #6ee7b7" }}>Live · {myFeedback.length}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {["All", "5", "4", "3", "2", "1"].map(r => (
                    <button key={r} onClick={() => setRatingFilter(r)} style={{ padding: "3px 8px", borderRadius: 99, border: "1.5px solid", cursor: "pointer", fontSize: "0.62rem", fontWeight: 700, background: ratingFilter === r ? "#0a1628" : "#fff", color: ratingFilter === r ? "#fff" : "#64748b", borderColor: ratingFilter === r ? "#0a1628" : "#e2e8f0" }}>
                      {r === "All" ? "All" : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {[...filteredRatings].reverse().map((f, i) => (
                  <div key={f.id} style={{ borderRadius: 10, padding: "12px 14px", border: `1px solid ${f.rating >= 4 ? "#bbf7d0" : f.rating >= 3 ? "#fde68a" : "#fecaca"}`, background: f.rating >= 4 ? "#f0fdf4" : f.rating >= 3 ? "#fefce8" : "#fef2f2", borderLeft: `4px solid ${f.rating >= 4 ? "#16a34a" : f.rating >= 3 ? "#ca8a04" : "#dc2626"}`, animation: "fadeUp .25s ease both", animationDelay: `${i * 30}ms` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#0a1628" }}>{f.name}</p>
                          <Pill color="blue">Train {f.trainNo}</Pill>
                          <Pill>Seat {f.seat}</Pill>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.62rem", color: "#94a3b8" }}>{f.time}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Stars rating={f.rating} size={15}/>
                        <p style={{ margin: "3px 0 0", fontSize: "0.65rem", fontWeight: 700, color: "#64748b" }}>{f.rating}/5</p>
                      </div>
                    </div>
                    {f.message && (
                      <div style={{ background: "rgba(255,255,255,.7)", borderRadius: 7, padding: "7px 10px", fontSize: "0.78rem", color: "#374151", fontStyle: "italic" }}>"{f.message}"</div>
                    )}
                  </div>
                ))}
                {filteredRatings.length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem", fontSize: "0.82rem" }}>No {ratingFilter}★ ratings</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLAINTS TAB ── */}
      {tab === "complaints" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
            {[
              { label: "Open",        count: myComplaints.filter(c => c.status === "Open").length,        color: "#dc2626" },
              { label: "In Progress", count: myComplaints.filter(c => c.status === "In Progress").length, color: "#ca8a04" },
              { label: "Resolved",    count: myComplaints.filter(c => c.status === "Resolved").length,    color: "#16a34a" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color }}>{s.count}</span>
              </div>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#94a3b8" }}>Syncs to commercial dept. in real-time</span>
          </div>
          {myComplaints.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.85rem", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>No complaints on your trains</div>}
          {myComplaints.map(c => (
            <div key={c.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", borderLeft: `4px solid ${C_COLOR[c.status] || "#e2e8f0"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0a1628" }}>{c.name}</p>
                    <CBadge s={c.status}/>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Pill color="blue">Train {c.trainNo}</Pill>
                    <Pill>Seat {c.seat}</Pill>
                    <Pill>{c.time}</Pill>
                  </div>
                </div>
              </div>
              <div style={{ background: "#f8faff", borderRadius: 8, padding: "10px 12px", marginBottom: 10, border: "1px solid #dbeafe" }}>
                <p style={{ margin: 0, fontSize: "0.63rem", color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>PASSENGER COMPLAINT</p>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#0a1628" }}>{c.issue}</p>
              </div>
              {c.vendorNote && (
                <div style={{ background: "#eff6ff", borderRadius: 8, padding: "8px 12px", marginBottom: 10, border: "1px solid #bfdbfe" }}>
                  <p style={{ margin: 0, fontSize: "0.63rem", color: "#1d4ed8", fontWeight: 600, marginBottom: 2 }}>YOUR NOTE</p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#0a1628" }}>{c.vendorNote}</p>
                </div>
              )}
              {c.status !== "Resolved" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <textarea placeholder="Add a note for commercial dept. (optional)…" value={cNote[c.id] || ""} onChange={e => setCNote(n => ({ ...n, [c.id]: e.target.value }))} rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#0a1628", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}/>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {c.status === "Open" && (
                      <button disabled={cLoading[c.id]} onClick={() => updateComplaint(c, "In Progress")} style={{ flex: 1, minWidth: 120, padding: "8px 12px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", opacity: cLoading[c.id] ? 0.6 : 1 }}>
                        {cLoading[c.id] ? "Updating…" : "Mark In Progress"}
                      </button>
                    )}
                    <button disabled={cLoading[c.id]} onClick={() => updateComplaint(c, "Resolved")} style={{ flex: 1, minWidth: 120, padding: "8px 12px", background: "#dcfce7", color: "#15803d", border: "1px solid #6ee7b7", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", opacity: cLoading[c.id] ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Icons.CheckCircle /> {cLoading[c.id] ? "Updating…" : "Mark Resolved"}
                    </button>
                  </div>
                </div>
              )}
              {c.status === "Resolved" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#dcfce7", borderRadius: 8, border: "1px solid #6ee7b7" }}>
                  <Icons.CheckCircle />
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>Resolved {c.resolvedAt ? `at ${c.resolvedAt}` : ""} — visible to commercial dept.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MENU TAB ── */}
      {tab === "menu" && <VendorMenuEditor vendor={vendor} />}

      {/* ── ORDER GRID ── */}
      {!["complaints", "ratings", "menu"].includes(tab) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(260px,35vw,300px),1fr))", gap: "clamp(8px,2vw,14px)" }}>
          {visible.map(o => (
            <div key={o.id} style={{ background: "#fff", borderRadius: 12, padding: "clamp(12px,2vw,16px)", border: "1px solid #e2e8f0", borderTop: `3px solid ${STATUS_COLOR[o.status] || "#1d4ed8"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "#0a1628", fontFamily: "monospace" }}>{o.id}</p>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {o.seat ? <Pill color="blue">{o.seat}</Pill> : <Pill>Train {o.trainNo}</Pill>}
                    <Pill>{o.payment}</Pill>
                    {o.vendorOrder && !o.seat && <Pill color="green">Awaiting scan</Pill>}
                  </div>
                </div>
                <StatusBadge s={o.status}/>
              </div>
              <div style={{ background: "#f8faff", borderRadius: 8, padding: "7px 10px", marginBottom: 8, border: "1px solid #dbeafe" }}>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "#1e40af", fontWeight: 600 }}>Train {o.trainNo} · {o.trainName}</p>
                <p style={{ margin: 0, fontSize: "0.63rem", color: "#94a3b8" }}>{o.passengerName || "Awaiting passenger"} · {o.time}</p>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: "0.72rem", color: "#64748b", lineHeight: 1.6 }}>{o.items.map(it => `${it.name} ×${it.qty}`).join(" · ")}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0a1628" }}>₹{o.total}</span>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {o.status !== "Delivered" && (
                    <button onClick={() => openEdit(o)} style={iconActBtn("#eff6ff", "#1d4ed8", "#bfdbfe")}><Icons.Edit /></button>
                  )}
                  {o.status === "Pending" && (
                    <button onClick={() => setConfirmDel(o.id)} style={iconActBtn("#fef2f2", "#dc2626", "#fecaca")}><Icons.Trash /></button>
                  )}
                  {o.status === "Pending"   && <button onClick={() => markStatus(o.id, "Preparing")} style={actBtn("#1d4ed8")}>Start</button>}
                  {o.status === "Preparing" && <button onClick={() => markStatus(o.id, "Packed")}    style={actBtn("#7c3aed")}>Pack</button>}
                  {o.status === "Packed"    && <button onClick={() => markStatus(o.id, "Delivered")} style={actBtn("#16a34a")}>Deliver</button>}
                </div>
              </div>
            </div>
          ))}
          {visible.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.85rem" }}>No orders here</div>}
        </div>
      )}

      {/* ── New / Edit Drawer ── */}
      {(showNew || editOrder) && (
        <Overlay onClose={() => { if (showNew) { setShowNew(false); resetForm(); } else { setEditOrder(null); setEditItems([]); setCart({}); } }}>
          <DrawerHeader title={editOrder ? "Edit Order" : "New Order"} onClose={() => { if (showNew) { setShowNew(false); resetForm(); } else { setEditOrder(null); setEditItems([]); setCart({}); } }} />
          <div style={{ overflowY: "auto", flex: 1, padding: "0 clamp(14px,3vw,20px) 16px" }}>
            <div style={{ marginBottom: 12, paddingTop: 14 }}>
              <label style={labelSt}>Assigned Train</label>
              <div style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #dbeafe", background: "#f8faff", fontSize: "0.82rem", color: "#0a1628", fontWeight: 600 }}>
                {vendorTrainNo} — {vendorTrainName}
              </div>
            </div>
            {!editOrder && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Payment Method</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["UPI", "Cash"].map(m => (
                    <button key={m} onClick={() => setPay(m)} style={{ flex: 1, padding: "8px", borderRadius: 7, border: `1.5px solid ${pay === m ? "#1d4ed8" : "#e2e8f0"}`, background: pay === m ? "#eff6ff" : "#fff", color: pay === m ? "#1d4ed8" : "#64748b", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>{m}</button>
                  ))}
                </div>
              </div>
            )}
            {!editOrder && CATS.length > 1 && (
              <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setMenuCat(c)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, background: menuCat === c ? "#1d4ed8" : "#fff", color: menuCat === c ? "#fff" : "#64748b", borderColor: menuCat === c ? "#1d4ed8" : "#e2e8f0" }}>{c}</button>
                ))}
              </div>
            )}
            {MENU.length === 0 && <div style={{ textAlign: "center", padding: "2rem", background: "#f8faff", borderRadius: 10, border: "1px solid #dbeafe", color: "#64748b", fontSize: "0.82rem" }}>No menu items available. Add items in the Menu tab.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(editOrder ? editItems : filteredMenu).map(item => {
                const qty = editOrder ? (cart[item.id] ?? item.qty) : (cart[item.id] || 0);
                return (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 7, border: "1px solid #e2e8f0" }}/>
                        : <span style={{ fontSize: "1.3rem" }}>{item.emoji || "🍽️"}</span>}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.8rem", color: "#0a1628" }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: "0.65rem", color: "#94a3b8" }}>₹{item.price}{!editOrder && ` · ${item.cat}`}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#475569" }}>₹{item.price}</span>
                      {qty > 0
                        ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button onClick={() => editOrder ? remEditItem(item) : remItem(item)} style={qtyBtn("#dc2626")}>−</button>
                            <span style={{ fontWeight: 700, minWidth: 18, textAlign: "center", fontSize: "0.85rem" }}>{qty}</span>
                            <button onClick={() => editOrder ? addEditItem(item) : addItem(item)} style={qtyBtn("#16a34a")}>+</button>
                          </div>
                        : <button onClick={() => addItem(item)} style={{ background: "#0a1628", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}>Add</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "12px clamp(14px,3vw,20px)", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "#94a3b8" }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem", color: "#0a1628" }}>₹{cartTotal}</p>
              </div>
              <button disabled={!editOrder && cartCount === 0} onClick={editOrder ? saveEdit : placeOrder} style={{ background: (!editOrder && cartCount === 0) ? "#e2e8f0" : "linear-gradient(135deg,#0a1628,#1d4ed8)", color: (!editOrder && cartCount === 0) ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: (!editOrder && cartCount === 0) ? "none" : "0 4px 12px rgba(29,78,216,0.3)" }}>
                {editOrder ? "Save Changes" : "Confirm & Show QR"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── QR Modal ── */}
      {activeQR && (
        <Overlay onClose={() => { setShowQR(null); setQrOrder(null); }} centered>
          <DrawerHeader title={qrOrder ? "Show QR to Passenger" : "Order QR Code"} onClose={() => { setShowQR(null); setQrOrder(null); }}/>
          <div style={{ padding: "clamp(16px,3vw,20px)", textAlign: "center" }}>
            <div ref={qrModalRef} style={{ background: "#fff", borderRadius: 12, padding: 16, display: "inline-block", border: "2px solid #dbeafe", marginBottom: 14, boxShadow: "0 4px 20px rgba(29,78,216,0.1)" }}>
              <QRPlaceholder data={activeQR.id} size={190}/>
            </div>
            <div style={{ background: "#f8faff", borderRadius: 10, padding: "10px 16px", border: "1px solid #dbeafe", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontWeight: 900, fontSize: "1.15rem", color: "#0a1628", letterSpacing: "2px", fontFamily: "monospace" }}>{activeQR.id}</span>
              <button onClick={() => navigator.clipboard?.writeText(activeQR.id)} style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 6, padding: "3px 9px", fontSize: "0.68rem", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Icons.Copy /> Copy
              </button>
            </div>
            <div style={{ background: "#f8faff", borderRadius: 10, padding: "12px 16px", border: "1px solid #dbeafe", textAlign: "left", marginBottom: 14 }}>
              <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "#1e40af", fontWeight: 600 }}>Train {activeQR.trainNo} – {activeQR.trainName}</p>
              <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "#475569" }}>{activeQR.items.map(i => `${i.name} ×${i.qty}`).join("  ·  ")}</p>
              <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: "0.95rem", color: "#0a1628" }}>₹{activeQR.total}</p>
            </div>
            {/* Working download button */}
            <button onClick={() => handleQRDownload(activeQR.trainNo)} style={{ width: "100%", padding: "10px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 9, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icons.Download /> Download QR
            </button>
          </div>
        </Overlay>
      )}

      {/* ── Confirm Delete ── */}
      {confirmDel && (
        <Overlay onClose={() => setConfirmDel(null)} centered small>
          <div style={{ padding: "clamp(18px,3vw,24px)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#dc2626" }}>
              <Icons.Trash />
            </div>
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0a1628", margin: "0 0 6px" }}>Delete Order?</p>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 18px" }}>This will permanently remove <strong>{confirmDel}</strong>.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setConfirmDel(null)} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>Cancel</button>
              <button onClick={() => deleteOrder(confirmDel)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>Delete</button>
            </div>
          </div>
        </Overlay>
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:99px}
      `}</style>
    </div>
  );
}

/* ── Layout helpers ──────────────────────────────────────────────────────── */
function Overlay({ children, onClose, centered, small }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 1000, display: "flex", alignItems: centered ? "center" : "flex-end", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: centered ? "14px" : "14px 14px 0 0", width: centered ? (small ? 320 : 440) : "100%", maxWidth: centered ? 440 : 580, maxHeight: centered ? "auto" : "90vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}>
        {children}
      </div>
    </div>
  );
}

function DrawerHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px clamp(14px,3vw,20px)", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(135deg,#f8faff,#f0f5ff)", borderRadius: "14px 14px 0 0", flexShrink: 0 }}>
      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0a1628" }}>{title}</span>
      <button onClick={onClose} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, width: 30, height: 30, cursor: "pointer", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

const labelSt    = { display: "block", fontSize: "0.65rem", fontWeight: 600, color: "#64748b", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" };
const actBtn     = (c) => ({ background: c, color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600 });
const iconActBtn = (bg, color, border) => ({ background: bg, color, border: `1px solid ${border}`, borderRadius: 6, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" });
const qtyBtn     = (c) => ({ background: c, color: "#fff", border: "none", borderRadius: 5, width: 22, height: 22, cursor: "pointer", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" });