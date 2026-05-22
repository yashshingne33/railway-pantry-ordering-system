/**
 * VendorLogin.jsx
 * Vendor login portal — Indian Railway Pantry Management System
 * Blue theme, professional, fully responsive
 */

import { useState } from "react";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./store";
import RealQR from './RealQR';

const SESSION_KEY = "ir_vendor_session";

const saveSession  = (v) => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch {} };
const loadSession  = ()  => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
const clearSession = ()  => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} };

const loadVendors = async () => {
  try {
    const snap = await getDocs(collection(db, "vendors"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

/* ── SVG Icons ────────────────────────────────────────────────────────────── */
const TrainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2"/>
    <path d="M4 11h16"/><path d="M12 3v8"/>
    <path d="M8 19l-2 3"/><path d="M18 22l-2-3"/>
    <circle cx="8.5" cy="14.5" r="0.5" fill="currentColor"/>
    <circle cx="15.5" cy="14.5" r="0.5" fill="currentColor"/>
  </svg>
);

const IdIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const QrIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
    <path d="M14 14h3v3h-3z" fill="currentColor" stroke="none"/>
    <path d="M14 18h3"/><path d="M18 14v7"/><path d="M18 17h3"/>
  </svg>
);

const Spinner = () => (
  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "vl-spin 0.7s linear infinite" }}/>
);

/* ══════════════════════════════════════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════════════════════════════════════ */
function LoginForm({ onSuccess }) {
  const [vendorId, setVendorId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleLogin = async () => {
    if (!vendorId.trim() || !password.trim()) {
      setError("Please enter both Vendor ID and Password.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");

    const vendors = await loadVendors();
    const match = vendors.find(
      v => v.id === vendorId.trim().toUpperCase() &&
           v.password === password.trim().toUpperCase()
    );

    setLoading(false);

    if (!match) {
      setError("Invalid Vendor ID or Password. Please check your credentials.");
      triggerShake();
      return;
    }
    if (match.status === "Suspended") {
      setError("Your account has been suspended. Please contact the railway admin.");
      triggerShake();
      return;
    }

    saveSession(match);
    onSuccess(match);
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(145deg, #0a1628 0%, #0d2147 45%, #0f2d63 70%, #1a4088 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none" }}>
        <defs>
          <pattern id="vgrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#fff" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vgrid)"/>
      </svg>

      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,90,230,0.12) 0%, transparent 70%)", top: -120, right: -120, pointerEvents: "none" }}/>
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", bottom: -80, left: -80, pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 420, animation: "vl-up 0.45s cubic-bezier(.22,.68,0,1.2)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
            color: "#93c5fd",
          }}>
            <TrainIcon />
          </div>
          <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Vendor Portal
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: 6, letterSpacing: "2px", textTransform: "uppercase" }}>
            Indian Railway Pantry · NGP Division
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 20, padding: "clamp(20px,4vw,30px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          animation: shake ? "vl-shake 0.4s ease" : "none",
        }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "#0a1628" }}>Vendor Sign In</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>
              Enter credentials provided by your railway admin
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Vendor ID</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <IdIcon />
              </span>
              <input
                style={{ ...inp, paddingLeft: 42, letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", ...(error ? errInp : {}) }}
                placeholder="V1234"
                value={vendorId}
                onChange={e => { setVendorId(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={onKey}
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <LockIcon />
              </span>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inp, paddingLeft: 42, paddingRight: 48, letterSpacing: "3px", fontFamily: "monospace", textTransform: "uppercase", ...(error ? errInp : {}) }}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={onKey}
                autoComplete="off"
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10,
              padding: "10px 14px", fontSize: "0.74rem", color: "#dc2626",
              marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg,#0a1628,#1d4ed8)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: "0.92rem", fontWeight: 700, cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 16px rgba(29,78,216,0.35)",
              transition: "opacity 0.15s",
            }}
          >
            {loading ? <><Spinner /> Verifying credentials…</> : "Login to Vendor Panel"}
          </button>

          <div style={{ textAlign: "center", marginTop: 14, fontSize: "0.65rem", color: "#94a3b8" }}>
            Forgot credentials? Contact your railway admin.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>
          Indian Railway Pantry Management System · NGP Division · v2.0
        </div>
      </div>

      <style>{`
        @keyframes vl-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vl-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes vl-spin  { to{transform:rotate(360deg)} }
        input:focus { border-color:#1d4ed8 !important; box-shadow:0 0 0 3px rgba(29,78,216,0.12) !important; outline:none; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VENDOR HEADER BAR
══════════════════════════════════════════════════════════════════════════ */
function VendorHeader({ vendor, onLogout }) {
  const [showQR, setShowQR] = useState(false);

  const downloadQR = () => {
    const wrapper = document.querySelector('[data-qr-vendor-header]');
    if (!wrapper) return;
    const svg = wrapper.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement('a');
      a.download = `QR-Train-${vendor.trainNo || vendor.train}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg,#0a1628,#1d4ed8)",
        padding: "10px clamp(12px,3vw,24px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, flexWrap: "wrap", gap: 8,
        boxShadow: "0 2px 14px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0,
          }}>
            <TrainIcon />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>{vendor.name}</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.65)" }}>
              ID: <span style={{ fontFamily: "monospace", letterSpacing: "1px", color: "#93c5fd" }}>{vendor.id}</span>
              <span style={{ margin: "0 5px", opacity: 0.4 }}>·</span>Train {vendor.trainNo || vendor.train} — {vendor.trainName}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowQR(true)}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <QrIcon /> My QR
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.85)", fontSize: "0.75rem",
              fontWeight: 600, cursor: "pointer",
            }}
          >Logout</button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div onClick={() => setShowQR(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "clamp(20px,4vw,28px)",
            width: "100%", maxWidth: 340,
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
            animation: "vl-up 0.3s ease",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "1.5px", marginBottom: 4 }}>YOUR TRAIN QR CODE</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0a1628" }}>
              Train {vendor.trainNo || vendor.train}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 18 }}>{vendor.trainName}</div>

            <div data-qr-vendor-header style={{
              display: "inline-block", padding: 16,
              background: "#f8fafc", borderRadius: 16,
              border: "2px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              marginBottom: 14,
            }}>
              <RealQR
                url={`${window.location.origin}/app?train=${vendor.trainNo || vendor.train}`}
                size={160}
                darkColor="#0a1628"
              />
            </div>

            <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 6 }}>
              Passengers scan this to order food
            </div>
            <div style={{
              fontSize: "0.62rem", fontFamily: "monospace",
              background: "#f1f5f9", padding: "5px 12px",
              borderRadius: 6, color: "#1d4ed8",
              border: "1px solid #dbeafe", display: "inline-block",
              marginBottom: 20,
            }}>
              {window.location.origin}/app?train={vendor.trainNo || vendor.train}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadQR} style={{
                flex: 1, padding: "11px",
                background: "#f0fdf4",
                color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 10,
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              }}>Download PNG</button>
              <button onClick={() => setShowQR(false)} style={{
                flex: 1, padding: "11px",
                background: "linear-gradient(135deg,#0a1628,#1d4ed8)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
              }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function VendorLogin({ children }) {
  const [vendor, setVendor] = useState(() => loadSession());

  const handleLogin  = (v) => { saveSession(v); setVendor(v); };
  const handleLogout = ()  => { clearSession(); setVendor(null); };

  if (!vendor) return <LoginForm onSuccess={handleLogin} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <VendorHeader vendor={vendor} onLogout={handleLogout} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {typeof children === "function"
          ? children(vendor, handleLogout)
          : children}
      </div>
    </div>
  );
}

const lbl    = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6, fontFamily: "sans-serif" };
const inp    = { width: "100%", padding: "11px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: "0.85rem", color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" };
const errInp = { borderColor: "#fca5a5", background: "#fff5f5" };