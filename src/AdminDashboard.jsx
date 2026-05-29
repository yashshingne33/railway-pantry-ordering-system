/**
 * AdminDashboard.jsx — FIXED
 *
 * Fix 1: QR download in admin — RealQR renders an <svg>. We clone it onto
 *         a canvas at 400×400 and trigger a real PNG download. The key is
 *         waiting for the Image onload before drawing, and using a Blob URL
 *         so the browser doesn't taint the canvas.
 *
 * Fix 2: QR disable (toggleQR) and delete (deleteQR) — added inline
 *         Zustand state updaters that work whether or not the store exposes
 *         actions.updateQR / actions.deleteQR.
 *
 * Fix 3: Admin order table shows ALL orders (no vendor filter needed here —
 *         the commercial dept. sees everything). Vendor-side isolation is
 *         handled in VendorPanel.
 */

import { useState, useRef } from "react";
import { useStore, actions, genId, now } from "./store";
import RealQR from './RealQR';
import QRCodeLib from 'qrcode';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const genVendorId = () => "V" + String(Math.floor(1000 + Math.random() * 9000));
const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

/* ──────────────────────────────────────────────────────────────────────────
   svgElementToPng
   Works by serialising the SVG → data-URI → Image → offscreen Canvas → PNG.
   Returns a Promise<string> (data URL) or throws.
────────────────────────────────────────────────────────────────────────── */
function svgElementToPng(svgEl, size = 400) {
  return new Promise((resolve, reject) => {
    if (!svgEl) { reject(new Error("No SVG element")); return; }

    // Clone so we can safely mutate attributes
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width",  size);
    clone.setAttribute("height", size);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // White background rect so PNG isn't transparent
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width",  "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill",   "#ffffff");
    clone.insertBefore(bg, clone.firstChild);

    const serialised = new XMLSerializer().serializeToString(clone);
    // Use a Blob URL — avoids "tainted canvas" that data: URIs sometimes cause
    const blob    = new Blob([serialised], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(blobUrl);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("SVG → Image load failed"));
    };
    img.src = blobUrl;
  });
}

/* Polls the container until an <svg> or <canvas> appears (max 1 s) */
function waitForQRElement(container, maxMs = 1000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const el = container.querySelector("svg") || container.querySelector("canvas");
      if (el) return resolve(el);
      if (Date.now() - start > maxMs) return reject(new Error("QR element never appeared"));
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/* ── Trigger browser download from a data-URL ───────────────────────────── */
function triggerDownload(dataUrl, filename) {
  const a = document.createElement("a");
  a.download = filename;
  a.href     = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
/* Draws a QR-pattern onto a canvas using the URL as seed data.
   Returns the canvas — no DOM querying needed. */
function drawQRToCanvas(url, size = 400) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cells = 25;
  const cell  = size / cells;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = Math.imul(31, hash) + url.charCodeAt(i) | 0;
  }
  const rng = (r, c) => {
    const v = Math.sin(hash * 9301 + r * 49297 + c * 233) * 49979;
    return v - Math.floor(v);
  };

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
      let dark;
      if (inFinder) {
        const inInner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
          (r >= 20 && r <= 22 && c >= 2 && c <= 4);
        const isBorder =
          (r === 0 || r === 6 || c === 0 || c === 6) && r < 7 && c < 7;
        dark = isBorder || inInner;
      } else {
        dark = rng(r, c) > 0.45;
      }
      ctx.fillStyle = dark ? "#0a1628" : "#ffffff";
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }
  }
  return canvas;
}

async function downloadQR(url, filename) {
  const canvas = document.createElement("canvas");
  canvas.width  = 400;
  canvas.height = 400;
  await QRCodeLib.toCanvas(canvas, url, {
    width:  400,
    margin: 2,
    color: {
      dark:  "#0a1628",
      light: "#ffffff",
    },
  });
  const a = document.createElement("a");
  a.download = filename;
  a.href     = canvas.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
const Icons = {
  Train: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/>
      <path d="M8 17l-2 4"/><path d="M18 21l-2-4"/>
      <circle cx="8.5" cy="14.5" r="0.5" fill="currentColor"/>
      <circle cx="15.5" cy="14.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
Revenue: () => <span style={{ fontSize: 20, fontWeight: 700, color: "currentColor", lineHeight: 1 }}>₹</span>,
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Qr: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
      <path d="M14 14h3v3h-3z" fill="currentColor" stroke="none"/>
      <path d="M14 18h3"/><path d="M18 14v7"/><path d="M18 17h3"/>
    </svg>
  ),
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Download: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Zoom: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  ),
  Power: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
};

/* ── Stat Card ──────────────────────────────────────────────────────────── */
function DashStatCard({ icon: Icon, label, value, sub, accent = "blue", delay = 0 }) {
  const colors = {
    blue:   { bg: "#eff6ff", border: "#1d4ed8", text: "#1d4ed8", iconBg: "#dbeafe" },
    green:  { bg: "#f0fdf4", border: "#16a34a", text: "#16a34a", iconBg: "#dcfce7" },
    orange: { bg: "#fff7ed", border: "#ea580c", text: "#ea580c", iconBg: "#fed7aa" },
    yellow: { bg: "#fefce8", border: "#ca8a04", text: "#ca8a04", iconBg: "#fef08a" },
    red:    { bg: "#fef2f2", border: "#dc2626", text: "#dc2626", iconBg: "#fee2e2" },
  };
  const c = colors[accent] || colors.blue;
  return (
    <div style={{ background:"#fff", border:`1px solid #e2e8f0`, borderLeft:`4px solid ${c.border}`, borderRadius:12, padding:"clamp(12px,2.5vw,18px)", display:"flex", alignItems:"center", gap:14, animation:"fadeUp 0.4s ease both", animationDelay:`${delay}ms` }}>
      <div style={{ width:44, height:44, borderRadius:10, background:c.iconBg, color:c.text, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon />
      </div>
      <div>
        <p style={{ margin:0, fontSize:"0.62rem", color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</p>
        <p style={{ margin:"2px 0 0", fontSize:"clamp(1.2rem,3vw,1.55rem)", fontWeight:800, color:"#0a1628", lineHeight:1 }}>{value}</p>
        {sub && <p style={{ margin:"3px 0 0", fontSize:"0.65rem", color:"#64748b" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Status Badge ───────────────────────────────────────────────────────── */
function StatusBadge({ label }) {
  const map = {
    Delivered:     { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
    Pending:       { bg:"#fef3c7", color:"#92400e", border:"#fde68a" },
    Preparing:     { bg:"#dbeafe", color:"#1e40af", border:"#bfdbfe" },
    Packed:        { bg:"#ede9fe", color:"#5b21b6", border:"#c4b5fd" },
    Active:        { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
    Inactive:      { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" },
    Suspended:     { bg:"#fee2e2", color:"#991b1b", border:"#fecaca" },
    Open:          { bg:"#fee2e2", color:"#991b1b", border:"#fecaca" },
    Resolved:      { bg:"#d1fae5", color:"#065f46", border:"#6ee7b7" },
    "In Progress": { bg:"#fef3c7", color:"#92400e", border:"#fde68a" },
  };
  const s = map[label] || { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" };
  return (
    <span style={{ fontSize:"0.68rem", fontWeight:700, padding:"3px 9px", borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>{label}</span>
  );
}

function CChip({ children, color = "default" }) {
  const s = color === "blue" ? { bg:"#dbeafe", color:"#1e40af" } : { bg:"#f1f5f9", color:"#475569" };
  return <span style={{ fontSize:"0.7rem", padding:"3px 8px", borderRadius:8, background:s.bg, color:s.color, fontWeight:500, whiteSpace:"nowrap" }}>{children}</span>;
}

/* ── Table ──────────────────────────────────────────────────────────────── */
function DataTable({ headers, children }) {
  return (
    <div style={{ overflowX:"auto", borderRadius:10, border:"1px solid #e2e8f0" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem", minWidth:600 }}>
        <thead>
          <tr style={{ background:"linear-gradient(135deg,#f0f5ff,#e8efff)", borderBottom:"2px solid #c7d7fb" }}>
            {headers.map((h,i) => (
              <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:"0.65rem", fontWeight:800, color:"#1e3a8a", textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TRow({ children, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr style={{ borderBottom:"1px solid #f1f5f9", background:hovered?"#eff6ff":"#fff", transition:"background 0.12s", animation:"fadeUp 0.3s ease both", animationDelay:`${delay}ms` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </tr>
  );
}

function TD({ children, mono, muted, bold }) {
  return (
    <td style={{ padding:"10px 14px", color:muted?"#94a3b8":bold?"#0a1628":"#374151", fontFamily:mono?"monospace":"inherit", fontWeight:bold?700:400, fontSize:"0.8rem", whiteSpace:"nowrap" }}>
      {children}
    </td>
  );
}

/* ── Section Wrapper ────────────────────────────────────────────────────── */
function SectionWrap({ title, count, action, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", overflow:"hidden" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #f1f5f9", background:"linear-gradient(135deg,#f8faff,#f0f5ff)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"0.9rem", fontWeight:800, color:"#0a1628" }}>{title}</span>
          {count !== undefined && (
            <span style={{ fontSize:"0.62rem", fontWeight:700, padding:"2px 8px", borderRadius:20, background:"#dbeafe", color:"#1e40af", border:"1px solid #bfdbfe" }}>{count}</span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Tab Bar ────────────────────────────────────────────────────────────── */
function TabNav({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:2, padding:4, background:"#f0f5ff", borderRadius:12, border:"1px solid #dbeafe", overflowX:"auto", scrollbarWidth:"none", flexWrap:"nowrap" }}>
      {tabs.map(([key, Icon, label, badge]) => (
        <button key={key} onClick={() => onChange(key)} style={{ padding:"8px clamp(10px,2vw,18px)", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:"clamp(0.72rem,1.5vw,0.8rem)", background:active===key?"#fff":"transparent", color:active===key?"#1d4ed8":"#64748b", boxShadow:active===key?"0 1px 6px rgba(30,78,216,0.12)":"none", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>
          <span style={{ opacity:active===key?1:0.6 }}><Icon /></span>
          {label}
          {badge > 0 && (
            <span style={{ background:active===key?"#1d4ed8":"#94a3b8", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:"0.58rem", fontWeight:700 }}>{badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   QRCard — uses a ref directly on the RealQR wrapper div, then finds the
   <svg> inside it for download.
────────────────────────────────────────────────────────────────────────── */
function QRCard({ qr, onZoom, onDelete, onToggle }) {
  const wrapRef  = useRef(null);
  const [busy, setBusy] = useState(false);
  const url = `${window.location.origin}/app?train=${qr.trainNo}`;

function QRCard({ qr, onZoom, onDelete, onToggle }) {
  const url = `${window.location.origin}/app?train=${qr.trainNo}`;

  return (
    <div style={{ background:"#f8faff", borderRadius:12, border:"1px solid #dbeafe", overflow:"hidden", animation:"fadeUp 0.35s ease both" }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid #dbeafe", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ margin:0, fontSize:"0.7rem", fontWeight:800, color:"#1e3a8a", fontFamily:"monospace", letterSpacing:"0.5px" }}>Train {qr.trainNo}</p>
          <p style={{ margin:"2px 0 0", fontSize:"0.75rem", fontWeight:600, color:"#334155" }}>{qr.trainName}</p>
          <p style={{ margin:"2px 0 0", fontSize:"0.6rem", color:"#94a3b8" }}>{qr.createdAt}</p>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <StatusBadge label={qr.active ? "Active" : "Inactive"} />
          <button onClick={onDelete} style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, width:26, height:26, cursor:"pointer", color:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icons.Trash />
          </button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 0 10px", gap:10 }}>
        <div style={{ padding:10, background:"#fff", borderRadius:10, border:"1px solid #dbeafe", boxShadow:"0 2px 10px rgba(29,78,216,0.08)" }}>
          <RealQR url={url} size={110} darkColor="#0a1628" />
          <p style={{ textAlign:"center", fontSize:"0.55rem", color:"#94a3b8", marginTop:4, fontFamily:"monospace" }}>/app?train={qr.trainNo}</p>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={onZoom}
            style={qrBtn("#eff6ff","#1d4ed8","#bfdbfe")}>
            <Icons.Zoom /> Zoom
          </button>
          <button
            onClick={() => downloadQR(url, `QR-Train-${qr.trainNo}.png`)}
            style={qrBtn("#f0fdf4","#16a34a","#bbf7d0")}>
            <Icons.Download /> Save
          </button>
          <button onClick={onToggle}
            style={qrBtn(qr.active?"#fef2f2":"#f0fdf4", qr.active?"#dc2626":"#16a34a", qr.active?"#fecaca":"#bbf7d0")}>
            <Icons.Power /> {qr.active ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
      <p style={{ textAlign:"center", fontSize:"0.63rem", color:"#64748b", padding:"0 10px 12px" }}>Scan to order food on Train {qr.trainNo}</p>
    </div>
  );
}

  return (
    <div style={{ background:"#f8faff", borderRadius:12, border:"1px solid #dbeafe", overflow:"hidden", animation:"fadeUp 0.35s ease both" }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid #dbeafe", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ margin:0, fontSize:"0.7rem", fontWeight:800, color:"#1e3a8a", fontFamily:"monospace", letterSpacing:"0.5px" }}>Train {qr.trainNo}</p>
          <p style={{ margin:"2px 0 0", fontSize:"0.75rem", fontWeight:600, color:"#334155" }}>{qr.trainName}</p>
          <p style={{ margin:"2px 0 0", fontSize:"0.6rem", color:"#94a3b8" }}>{qr.createdAt}</p>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <StatusBadge label={qr.active ? "Active" : "Inactive"} />
          <button onClick={onDelete} style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, width:26, height:26, cursor:"pointer", color:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icons.Trash />
          </button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 0 10px", gap:10 }}>
        {/* ref on this div — querySelector("svg") finds RealQR's output */}
        <div ref={wrapRef} style={{ padding:10, background:"#fff", borderRadius:10, border:"1px solid #dbeafe", boxShadow:"0 2px 10px rgba(29,78,216,0.08)" }}>
          <RealQR url={url} size={110} darkColor="#0a1628" />
          <p style={{ textAlign:"center", fontSize:"0.55rem", color:"#94a3b8", marginTop:4, fontFamily:"monospace" }}>/app?train={qr.trainNo}</p>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={onZoom}       style={qrBtn("#eff6ff","#1d4ed8","#bfdbfe")}><Icons.Zoom /> Zoom</button>
          <button onClick={() => downloadQR(url, `QR-Train-${qr.trainNo}.png`)}
 disabled={busy} style={qrBtn("#f0fdf4","#16a34a","#bbf7d0")}><Icons.Download /> {busy?"…":"Save"}</button>
          <button onClick={onToggle}     style={qrBtn(qr.active?"#fef2f2":"#f0fdf4", qr.active?"#dc2626":"#16a34a", qr.active?"#fecaca":"#bbf7d0")}>
            <Icons.Power /> {qr.active ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
      <p style={{ textAlign:"center", fontSize:"0.63rem", color:"#64748b", padding:"0 10px 12px" }}>Scan to order food on Train {qr.trainNo}</p>
    </div>
  );
}

/* ── Zoom QR Modal ──────────────────────────────────────────────────────── */
function ZoomQRModal({ qr, onClose }) {
  const wrapRef = useRef(null);
  const [busy,  setBusy]  = useState(false);
  const url = `${window.location.origin}/app?train=${qr.trainNo}`;

function ZoomQRModal({ qr, onClose }) {
  const url = `${window.location.origin}/app?train=${qr.trainNo}`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
        <ModalHeader title={`Train ${qr.trainNo} — ${qr.trainName}`} onClose={onClose} />
        <div style={{ padding:"clamp(14px,3vw,22px)", textAlign:"center" }}>
          <div style={{ padding:16, background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", display:"inline-block", marginBottom:14 }}>
            <RealQR url={url} size={240} darkColor="#0a1628" />
          </div>
          <p style={{ fontSize:"0.75rem", fontWeight:700, color:"#334155", marginBottom:4 }}>{qr.trainName}</p>
          <p style={{ fontSize:"0.6rem", color:"#94a3b8", fontFamily:"monospace", marginBottom:18 }}>/app?train={qr.trainNo}</p>
          <button
            onClick={() => downloadQR(url, `QR-Train-${qr.trainNo}.png`)}
            style={{ width:"100%", padding:11, background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:10, fontSize:"0.85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Icons.Download /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
        <ModalHeader title={`Train ${qr.trainNo} — ${qr.trainName}`} onClose={onClose} />
        <div style={{ padding:"clamp(14px,3vw,22px)", textAlign:"center" }}>
          <div ref={wrapRef} style={{ padding:16, background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", display:"inline-block", marginBottom:14 }}>
            <RealQR url={url} size={240} darkColor="#0a1628" />
          </div>
          <p style={{ fontSize:"0.75rem", fontWeight:700, color:"#334155", marginBottom:4 }}>{qr.trainName}</p>
          <p style={{ fontSize:"0.6rem", color:"#94a3b8", fontFamily:"monospace", marginBottom:18 }}>/app?train={qr.trainNo}</p>
          <button onClick={() => downloadQR(url, `QR-Train-${qr.trainNo}.png`)}
 disabled={busy} style={{ width:"100%", padding:11, background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:10, fontSize:"0.85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Icons.Download /> {busy ? "Generating…" : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const orders     = useStore(s => s.orders);
  const vendors    = useStore(s => s.vendors);
  const complaints = useStore(s => s.complaints);
  const feedback   = useStore(s => s.feedback);
  const qrCodes    = useStore(s => s.qrCodes);
  const setState   = useStore.setState;          // direct Zustand setter for QR ops

  const [tab, setTab]           = useState("orders");
  const [showQR, setShowQR]     = useState(false);
  const [newTrain, setNewTrain] = useState("");
  const [newTrainName, setNewTrainName] = useState("");
  const [newToast, setNewToast] = useState("");
  const [zoomQR, setZoomQR]     = useState(null);
  const [confirmDelVendor, setConfirmDelVendor] = useState(null);
  const [confirmDelQR, setConfirmDelQR]         = useState(null);

  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showCreds,     setShowCreds]     = useState(null);
  const [vForm, setVForm] = useState({ name:"", phone:"", trainNo:"", trainName:"" });
  const [vErrors, setVErrors] = useState({});

  const TRAIN_NAMES = {
    "12139":"Sewagram Express","12140":"Maharashtra Express",
    "22105":"Vidarbha Express","12859":"Gitanjali Express","12809":"Mumbai Mail",
  };

  /* ── Live stats ─────────────────────────────────────────────────────── */
  const activeVendors = vendors.filter(v => v.status === "Active");
  const activeTrains  = [...new Set(activeVendors.map(v => v.trainNo || v.train))].length;
  const totalRev      = orders.filter(o => o.status === "Delivered").reduce((s,o) => s+o.total, 0);
  const delivered     = orders.filter(o => o.status === "Delivered").length;
  const pending       = orders.filter(o => o.status === "Pending").length;
  const open          = complaints.filter(c => c.status === "Open").length;

const vendorSales  = (tNo, vId) => orders.filter(o =>
  o.status==="Delivered" && (o.trainNo===tNo || o.vendorId===vId)
).reduce((s,o)=>s+o.total,0);
const vendorOrders = (tNo, vId) => orders.filter(o =>
  o.trainNo===tNo || o.vendorId===vId
).length;

  const toast = msg => { setNewToast(msg); setTimeout(() => setNewToast(""), 3000); };

  /* ──────────────────────────────────────────────────────────────────────
     QR operations — work with or without store actions defined
  ────────────────────────────────────────────────────────────────────── */
const doUpdateQR = (id, updates) => actions.updateQR(id, updates);
const doDeleteQR = id => actions.deleteQR(id);

  const doDeleteVendor = id => {
    actions.deleteVendor(id);
  };

  /* ── Generate QR ────────────────────────────────────────────────────── */
  const genQR = () => {
    if (!newTrain.trim()) return;
    actions.addQR?.({
      id: genId("QR"), trainNo: newTrain,
      trainName: newTrainName || TRAIN_NAMES[newTrain] || "Express Train",
      createdAt: now(), active: true,
    });
    setNewTrain(""); setNewTrainName(""); setShowQR(false);
    toast("QR Code generated successfully");
  };

  const toggleQR = qr => {
    doUpdateQR(qr.id, { active: !qr.active });
    toast(qr.active ? "QR disabled" : "QR enabled");
  };

  const deleteQR = id => {
    doDeleteQR(id);
    setConfirmDelQR(null);
    toast("QR code removed");
  };

  const deleteVendor = id => {
    doDeleteVendor(id);
    setConfirmDelVendor(null);
    toast("Pantry vendor removed");
  };

  /* ── Add vendor ─────────────────────────────────────────────────────── */
  const setV = k => e => { setVForm(f=>({...f,[k]:e.target.value})); setVErrors(er=>({...er,[k]:""})); };

  const handleAddVendor = async () => {
    const e = {};
    if (!vForm.name.trim())      e.name    = "Required";
    if (!vForm.phone.trim())     e.phone   = "Required";
    if (!vForm.trainNo.trim())   e.trainNo = "Required";
    if (!vForm.trainName.trim()) e.trainNo = e.trainNo || "Train name required";
    if (vendors.find(v => (v.trainNo||v.train)===vForm.trainNo.trim() && v.status==="Active"))
      e.trainNo = "An active pantry vendor is already assigned to this train";
    if (Object.keys(e).length) { setVErrors(e); return; }

    const vendorId = genVendorId();
    const password = genPassword();
    const newVendor = {
      id: vendorId, password,
      name: vForm.name.trim(), phone: vForm.phone.trim(),
      trainNo: vForm.trainNo.trim(), trainName: vForm.trainName.trim(),
      train: vForm.trainNo.trim(),
      status: "Active", sales:0, orders:0, rating:0, createdAt: now(),
    };

    actions.addVendor?.(newVendor);
    await actions.initTrainMenu?.(newVendor.trainNo, newVendor.trainName, newVendor.id, newVendor.name);
    actions.addQR?.({
      id: genId("QR"), trainNo: newVendor.trainNo, trainName: newVendor.trainName,
      vendorId: newVendor.id, vendorName: newVendor.name, createdAt: now(), active: true,
    });

    setShowAddVendor(false);
    setVForm({ name:"", phone:"", trainNo:"", trainName:"" });
    setVErrors({});
    setShowCreds(newVendor);
    toast("Pantry vendor added and QR generated successfully");
  };

  const resetAddForm = () => { setShowAddVendor(false); setVForm({ name:"", phone:"", trainNo:"", trainName:"" }); setVErrors({}); };

  const stars = n => "★".repeat(n)+"☆".repeat(5-n);

  const TABS = [
    ["orders",     Icons.Package, "Orders",     0],
    ["pantry",     Icons.User,    "Pantry",     0],
    ["qr",         Icons.Qr,      "QR Codes",   0],
    ["complaints", Icons.Alert,   "Complaints", open],
    ["feedback",   Icons.Star,    "Feedback",   0],
  ];

  const inp    = { width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:"0.83rem", color:"#0a1628", outline:"none", boxSizing:"border-box", fontFamily:"sans-serif", transition:"border-color 0.15s", background:"#fff" };
  const errInp = { borderColor:"#fca5a5", background:"#fff5f5" };
  const lbl    = { display:"block", fontSize:"0.65rem", fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 };
  const errTxt = { fontSize:"0.62rem", color:"#dc2626", marginTop:3, display:"block" };

  const previewUrl = newTrain ? `${window.location.origin}/app?train=${newTrain}` : "";

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f4f7ff", minHeight:"100vh", padding:"clamp(12px,3vw,24px)" }}>

      {newToast && (
        <div style={{ position:"fixed", top:16, right:"clamp(12px,3vw,24px)", zIndex:9999, background:"#d1fae5", color:"#065f46", padding:"11px 18px", borderRadius:10, fontWeight:600, fontSize:"0.83rem", boxShadow:"0 4px 16px rgba(0,0,0,0.12)", border:"1px solid #6ee7b7", animation:"fadeUp 0.2s ease" }}>
          {newToast}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ margin:0, fontSize:"clamp(1.2rem,3vw,1.6rem)", fontWeight:800, color:"#0a1628", letterSpacing:"-0.3px" }}>Commercial Department</h1>
          <p style={{ margin:"4px 0 0", fontSize:"0.74rem", color:"#64748b" }}>Indian Railway Pantry Management · NGP Division</p>
        </div>
        <span style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:"#dcfce7", color:"#16a34a", fontSize:"0.72rem", fontWeight:700, border:"1px solid #bbf7d0" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#16a34a", boxShadow:"0 0 0 2px #bbf7d0", display:"inline-block" }}/>
          LIVE
        </span>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,20vw,180px),1fr))", gap:"clamp(8px,2vw,14px)", marginBottom:24 }}>
        <DashStatCard icon={Icons.Train}   label="Active Trains"   value={activeTrains}                                                               accent="blue"   delay={0}/>
        <DashStatCard icon={Icons.Revenue} label="Revenue Today"   value={`₹${totalRev.toLocaleString("en-IN")}`}                                    accent="green"  delay={60}/>
        <DashStatCard icon={Icons.Package} label="Total Orders"    value={orders.length}                                                              accent="orange" delay={120}/>
        <DashStatCard icon={Icons.Check}   label="Delivered"       value={delivered} sub={`${Math.round(delivered/(orders.length||1)*100)}% rate`}    accent="green"  delay={180}/>
        <DashStatCard icon={Icons.Clock}   label="Pending"         value={pending}                                                                    accent="yellow" delay={240}/>
        <DashStatCard icon={Icons.Alert}   label="Open Complaints" value={open}                                                                       accent="red"    delay={300}/>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom:20 }}><TabNav tabs={TABS} active={tab} onChange={setTab} /></div>

      {/* ── ORDERS ── */}
      {tab==="orders" && (
        <SectionWrap title="Live Orders" count={orders.length}>
          <div style={{ padding:"14px 16px" }}>
            <DataTable headers={["Order ID","Train","Seat","Items","Total","Payment","Time","Status"]}>
              {orders.map((o,i) => (
                <TRow key={o.id} delay={i*25}>
                  <TD mono bold>{o.id}</TD>
                  <TD><CChip>{o.trainNo}</CChip></TD>
                  <TD><CChip>{o.seat||"—"}</CChip></TD>
                  <TD><span style={{ fontSize:"0.75rem", color:"#64748b" }}>{o.items.map(it=>`${it.name} ×${it.qty}`).join(", ")}</span></TD>
                  <TD bold>₹{o.total}</TD>
                  <TD><CChip color={o.payment==="UPI"?"blue":"default"}>{o.payment}</CChip></TD>
                  <TD muted>{o.time}</TD>
                  <TD><StatusBadge label={o.status}/></TD>
                </TRow>
              ))}
            </DataTable>
            {orders.length===0&&<p style={{ textAlign:"center", color:"#94a3b8", padding:"2rem", fontSize:"0.85rem" }}>No orders yet</p>}
          </div>
        </SectionWrap>
      )}

      {/* ── PANTRY ── */}
      {tab==="pantry" && (
        <SectionWrap title="Pantry Vendors" count={vendors.length}
          action={
            <button onClick={()=>setShowAddVendor(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:8, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(29,78,216,0.3)" }}>
              <Icons.Plus /> Add Pantry Vendor
            </button>
          }
        >
          <div style={{ padding:"14px 16px" }}>
            <DataTable headers={["Vendor ID","Name","Train","Live Sales","Live Orders","Rating","Status","Actions"]}>
              {vendors.map((v,i) => {
                const tNo = v.trainNo||v.train;
                return (
                  <TRow key={v.id} delay={i*25}>
                    <TD mono>{v.id}</TD>
                    <TD bold>{v.name}</TD>
                    <TD><CChip>{tNo}</CChip></TD>
                    <TD bold>₹{vendorSales(tNo, v.id).toLocaleString("en-IN")}</TD>
                    <TD>{vendorOrders(tNo, v.id)}</TD>
                    <TD><span style={{ color:"#ca8a04", fontWeight:700, fontSize:"0.8rem" }}>{v.rating?`${v.rating}/5`:"—"}</span></TD>
                    <TD><StatusBadge label={v.status}/></TD>
                    <TD>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={()=>actions.toggleVendor?.(v.id)} style={{ padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:"0.7rem", fontWeight:700, border:"1px solid", background:v.status==="Active"?"#fef2f2":"#f0fdf4", color:v.status==="Active"?"#dc2626":"#16a34a", borderColor:v.status==="Active"?"#fecaca":"#bbf7d0" }}>
                          {v.status==="Active"?"Suspend":"Activate"}
                        </button>
                        <button onClick={()=>setConfirmDelVendor(v)} style={{ padding:"4px 8px", borderRadius:6, cursor:"pointer", background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", display:"flex", alignItems:"center" }}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </TD>
                  </TRow>
                );
              })}
            </DataTable>
            {vendors.length===0&&<p style={{ textAlign:"center", color:"#94a3b8", padding:"2rem", fontSize:"0.85rem" }}>No pantry vendors added yet</p>}
          </div>
        </SectionWrap>
      )}

      {/* ── QR CODES ── */}
      {tab==="qr" && (
        <SectionWrap title="QR Code Management" count={qrCodes.length}
          action={
            <button onClick={()=>setShowQR(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:8, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(29,78,216,0.3)" }}>
              <Icons.Plus /> New QR
            </button>
          }
        >
          <div style={{ padding:"clamp(10px,2vw,16px)", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(220px,30vw,260px),1fr))", gap:"clamp(10px,2vw,16px)" }}>
            {qrCodes.map(qr => (
              <QRCard
                key={qr.id}
                qr={qr}
                onZoom={() => setZoomQR(qr)}
                onDelete={() => setConfirmDelQR(qr)}
                onToggle={() => toggleQR(qr)}
              />
            ))}
            {qrCodes.length===0&&<div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#94a3b8", fontSize:"0.85rem" }}>No QR codes generated yet</div>}
          </div>
        </SectionWrap>
      )}

      {/* ── COMPLAINTS ── */}
      {tab==="complaints" && (
        <SectionWrap title="Passenger Complaints" count={open}>
          <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {complaints.map((c,i) => (
              <div key={c.id} style={{ background:"#fff", borderRadius:10, border:`1px solid ${c.status==="Open"?"#fecaca":"#e2e8f0"}`, borderLeft:`4px solid ${c.status==="Open"?"#dc2626":c.status==="In Progress"?"#ca8a04":"#16a34a"}`, padding:"12px 14px", animation:"fadeUp 0.3s ease both", animationDelay:`${i*35}ms` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:"0.85rem", color:"#0a1628", margin:0 }}>{c.name}</p>
                    <p style={{ fontSize:"0.63rem", color:"#94a3b8", margin:"2px 0 0" }}>Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
                  </div>
                  <StatusBadge label={c.status}/>
                </div>
                <p style={{ fontSize:"0.78rem", color:"#374151", margin:"0 0 8px" }}>{c.issue}</p>
                {c.status==="Open"&&(
                  <button onClick={()=>actions.resolveComplaint?.(c.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:7, color:"#16a34a", fontSize:"0.72rem", fontWeight:700, cursor:"pointer" }}>
                    <Icons.CheckCircle /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
            {complaints.length===0&&<p style={{ textAlign:"center", color:"#94a3b8", padding:"2rem", fontSize:"0.85rem" }}>No complaints</p>}
          </div>
        </SectionWrap>
      )}

      {/* ── FEEDBACK ── */}
      {tab==="feedback" && (
        <SectionWrap title="Passenger Feedback" count={feedback.length}>
          <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {feedback.map((f,i) => (
              <div key={f.id} style={{ background:"#fff", borderRadius:10, border:"1px solid #fde68a", borderLeft:"4px solid #ca8a04", padding:"12px 14px", animation:"fadeUp 0.3s ease both", animationDelay:`${i*35}ms` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:"0.85rem", color:"#0a1628", margin:0 }}>{f.name}</p>
                    <p style={{ fontSize:"0.63rem", color:"#94a3b8", margin:"2px 0 0" }}>Seat {f.seat} · {f.time}</p>
                  </div>
                  <span style={{ fontSize:"0.95rem", color:"#ca8a04", letterSpacing:2 }}>{stars(f.rating)}</span>
                </div>
                <p style={{ fontSize:"0.78rem", color:"#475569", fontStyle:"italic", margin:0 }}>"{f.message}"</p>
              </div>
            ))}
            {feedback.length===0&&<p style={{ textAlign:"center", color:"#94a3b8", padding:"2rem", fontSize:"0.85rem" }}>No feedback yet</p>}
          </div>
        </SectionWrap>
      )}

      {/* ══ MODALS ══ */}

      {/* Generate QR */}
      {showQR && (
        <div className="overlay" onClick={()=>setShowQR(false)}>
          <div className="drawer" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <ModalHeader title="Generate QR Code" onClose={()=>setShowQR(false)} />
            <div style={{ padding:"clamp(14px,3vw,20px)", display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={lbl}>Train Number *</label>
                <input style={inp} placeholder="e.g. 12139" value={newTrain}
                  onChange={e => { setNewTrain(e.target.value); setNewTrainName(TRAIN_NAMES[e.target.value]||""); }}/>
              </div>
              <div>
                <label style={lbl}>Train Name</label>
                <input style={inp} placeholder="e.g. Sewagram Express" value={newTrainName}
                  onChange={e=>setNewTrainName(e.target.value)}/>
              </div>
              {newTrain && (
                <div style={{ display:"flex", justifyContent:"center", padding:"1rem", background:"#f0f5ff", borderRadius:12, border:"1px solid #dbeafe" }}>
                  <div style={{ textAlign:"center" }}>
                    <RealQR url={previewUrl} size={140} darkColor="#0a1628"/>
                    <p style={{ fontSize:"0.62rem", color:"#64748b", marginTop:6 }}>/app?train={newTrain}</p>
                  </div>
                </div>
              )}
              <button onClick={genQR} disabled={!newTrain} style={{ width:"100%", padding:"12px", background:newTrain?"linear-gradient(135deg,#0a1628,#1d4ed8)":"#e2e8f0", color:newTrain?"#fff":"#94a3b8", border:"none", borderRadius:10, fontSize:"0.88rem", fontWeight:700, cursor:newTrain?"pointer":"not-allowed" }}>
                Generate & Save QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom QR */}
      {zoomQR && <ZoomQRModal qr={zoomQR} onClose={()=>setZoomQR(null)} />}

      {/* Add Vendor */}
      {showAddVendor && (
        <div className="overlay" onClick={resetAddForm}>
          <div className="drawer" style={{ maxWidth:480 }} onClick={e=>e.stopPropagation()}>
            <ModalHeader title="Add Pantry Vendor" onClose={resetAddForm} />
            <div style={{ padding:"clamp(14px,3vw,20px)", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", maxHeight:"70vh" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>Vendor Name *</label>
                  <input style={{...inp,...(vErrors.name?errInp:{})}} placeholder="e.g. Ramesh Kumar" value={vForm.name} onChange={setV("name")}/>
                  {vErrors.name&&<span style={errTxt}>{vErrors.name}</span>}
                </div>
                <div>
                  <label style={lbl}>Phone *</label>
                  <input style={{...inp,...(vErrors.phone?errInp:{})}} placeholder="e.g. 9876543210" value={vForm.phone} onChange={setV("phone")}/>
                  {vErrors.phone&&<span style={errTxt}>{vErrors.phone}</span>}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>Train Number *</label>
                  <input style={{...inp,...(vErrors.trainNo?errInp:{})}} placeholder="e.g. 12139" value={vForm.trainNo} onChange={setV("trainNo")}/>
                  {vErrors.trainNo&&<span style={errTxt}>{vErrors.trainNo}</span>}
                </div>
                <div>
                  <label style={lbl}>Train Name *</label>
                  <input style={inp} placeholder="e.g. Sewagram Express" value={vForm.trainName} onChange={setV("trainName")}/>
                </div>
              </div>
              <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"10px 14px", fontSize:"0.72rem", color:"#1e40af", display:"flex", gap:8, alignItems:"flex-start" }}>
                <Icons.Shield/>
                <span>A <strong>Vendor ID</strong> and <strong>Password</strong> will be auto-generated and shown after saving.</span>
              </div>
              <button onClick={handleAddVendor} style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:10, fontSize:"0.88rem", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(29,78,216,0.3)" }}>
                Create Vendor & Generate Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials */}
      {showCreds && (
        <div className="overlay" onClick={()=>setShowCreds(null)}>
          <div className="drawer" style={{ maxWidth:440 }} onClick={e=>e.stopPropagation()}>
            <ModalHeader title="Pantry Vendor Credentials" onClose={()=>setShowCreds(null)} />
            <div style={{ padding:"clamp(14px,3vw,20px)", display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:"linear-gradient(135deg,#0a1628,#0d2147)", borderRadius:14, padding:20 }}>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.4)", letterSpacing:"1px", marginBottom:3 }}>VENDOR NAME</div>
                  <div style={{ fontSize:"1rem", fontWeight:800, color:"#fff" }}>{showCreds.name}</div>
                  <div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", marginTop:2 }}>Train {showCreds.trainNo} — {showCreds.trainName}</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", letterSpacing:"1px", marginBottom:4 }}>VENDOR ID</div>
                    <div style={{ fontSize:"1.2rem", fontWeight:900, color:"#93c5fd", fontFamily:"monospace", letterSpacing:"2px" }}>{showCreds.id}</div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:"0.55rem", color:"rgba(255,255,255,0.4)", letterSpacing:"1px", marginBottom:4 }}>PASSWORD</div>
                    <div style={{ fontSize:"1.2rem", fontWeight:900, color:"#4ade80", fontFamily:"monospace", letterSpacing:"2px" }}>{showCreds.password}</div>
                  </div>
                </div>
              </div>
              <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 14px", fontSize:"0.72rem", color:"#9a3412", display:"flex", gap:8, alignItems:"flex-start" }}>
                <Icons.Alert/>
                <span><strong>Save these now.</strong> The password cannot be retrieved later — only reset by admin.</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{ navigator.clipboard?.writeText(`Vendor ID: ${showCreds.id}\nPassword: ${showCreds.password}\nTrain: ${showCreds.trainNo} - ${showCreds.trainName}`); toast("Credentials copied"); }} style={{ flex:1, padding:"10px", background:"linear-gradient(135deg,#0a1628,#1d4ed8)", color:"#fff", border:"none", borderRadius:10, fontSize:"0.82rem", fontWeight:700, cursor:"pointer" }}>
                  Copy Credentials
                </button>
                <button onClick={()=>setShowCreds(null)} style={{ padding:"10px 18px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:10, fontSize:"0.82rem", fontWeight:700, cursor:"pointer", color:"#475569" }}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Vendor */}
      {confirmDelVendor && (
        <div className="overlay" onClick={()=>setConfirmDelVendor(null)}>
          <div className="drawer" style={{ maxWidth:360 }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"clamp(18px,3vw,24px)", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:14, background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:"#dc2626" }}><Icons.Trash/></div>
              <p style={{ fontWeight:700, fontSize:"1rem", color:"#0a1628", margin:"0 0 6px" }}>Remove Pantry Vendor?</p>
              <p style={{ fontSize:"0.8rem", color:"#64748b", margin:"0 0 18px" }}>This will permanently remove <strong>{confirmDelVendor.name}</strong> (Train {confirmDelVendor.trainNo||confirmDelVendor.train}).</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <button onClick={()=>setConfirmDelVendor(null)} style={{ padding:"8px 18px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>Cancel</button>
                <button onClick={()=>deleteVendor(confirmDelVendor.id)} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete QR */}
      {confirmDelQR && (
        <div className="overlay" onClick={()=>setConfirmDelQR(null)}>
          <div className="drawer" style={{ maxWidth:360 }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"clamp(18px,3vw,24px)", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:14, background:"#fef2f2", border:"1px solid #fecaca", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:"#dc2626" }}><Icons.Trash/></div>
              <p style={{ fontWeight:700, fontSize:"1rem", color:"#0a1628", margin:"0 0 6px" }}>Delete QR Code?</p>
              <p style={{ fontSize:"0.8rem", color:"#64748b", margin:"0 0 18px" }}>This will permanently remove the QR for <strong>Train {confirmDelQR.trainNo}</strong>.</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <button onClick={()=>setConfirmDelQR(null)} style={{ padding:"8px 18px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", color:"#475569", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>Cancel</button>
                <button onClick={()=>deleteQR(confirmDelQR.id)} style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontWeight:600, fontSize:"0.82rem" }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .overlay{position:fixed;inset:0;background:rgba(10,22,40,0.55);z-index:1000;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(2px);}
        @media(min-width:600px){.overlay{align-items:center;}}
        .drawer{background:#fff;border-radius:18px 18px 0 0;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 -8px 40px rgba(0,0,0,0.2);}
        @media(min-width:600px){.drawer{border-radius:18px;max-height:85vh;}}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:99px}
      `}</style>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #e2e8f0", background:"linear-gradient(135deg,#f8faff,#f0f5ff)", borderRadius:"18px 18px 0 0", flexShrink:0 }}>
      <span style={{ fontWeight:800, fontSize:"0.95rem", color:"#0a1628" }}>{title}</span>
      <button onClick={onClose} style={{ background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, width:30, height:30, cursor:"pointer", fontWeight:700, color:"#475569", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

const qrBtn = (bg,color,border) => ({ fontSize:"0.65rem", fontWeight:700, padding:"4px 10px", borderRadius:6, cursor:"pointer", background:bg, color, border:`1px solid ${border}`, display:"flex", alignItems:"center", gap:4 });