import { useState } from "react";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./store";
import RealQR from './RealQR';

const SESSION_KEY = "irctc_vendor_session";

const saveSession  = (v) => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch {} };
const loadSession  = ()  => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
const clearSession = ()  => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} };

const loadVendors = async () => {
  try {
    const snap = await getDocs(collection(db, "vendors"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

const MiniQR = ({ trainNo, size = 130 }) => {
  const seed  = trainNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng   = (n) => { let x = seed * 9301 + n * 49297; return ((x % 233280) / 233280); };
  const cells = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      if ((r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)) return true;
      return rng(r * 7 + c) > 0.45;
    })
  );
  const cell = size / 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="#fff" rx={6} />
      {[[0,0],[0,6],[6,0]].map(([r,c], i) => (
        <g key={i}>
          <rect x={cell*(c+1)-1} y={cell*(r+1)-1} width={cell*3+2} height={cell*3+2} fill="#1e3a5f" rx={2}/>
          <rect x={cell*(c+1)+3} y={cell*(r+1)+3} width={cell*3-6}  height={cell*3-6}  fill="#fff"    rx={1}/>
          <rect x={cell*(c+1)+6} y={cell*(r+1)+6} width={cell*3-12} height={cell*3-12} fill="#1e3a5f" rx={1}/>
        </g>
      ))}
      {cells.map((row, r) => row.map((on, c) => {
        if ((r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)) return null;
        return on
          ? <rect key={`${r}${c}`} x={cell*(c+1)} y={cell*(r+1)} width={cell-1} height={cell-1} fill="#1e3a5f" rx={1}/>
          : null;
      }))}
    </svg>
  );
};

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
      background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: "'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.03)", top:-100, right:-100 }}/>
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.03)", bottom:-80, left:-80 }}/>
      <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.04)", top:"40%", left:"10%" }}/>

      <div style={{ width:"100%", maxWidth:420, animation:"vl-up 0.45s cubic-bezier(.22,.68,0,1.2)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            width:70, height:70, borderRadius:20,
            background:"rgba(255,255,255,0.1)",
            border:"1.5px solid rgba(255,255,255,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"2rem", margin:"0 auto 14px",
            boxShadow:"0 8px 24px rgba(0,0,0,0.2)",
          }}>🚂</div>
          <div style={{ fontSize:"1.5rem", fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>
            IRCTC Pantry
          </div>
          <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.55)", marginTop:5 }}>
            Vendor Portal · NGP Division
          </div>
        </div>

        <div style={{
          background:"#fff", borderRadius:20, padding:"28px 24px",
          boxShadow:"0 30px 80px rgba(0,0,0,0.4)",
          animation: shake ? "vl-shake 0.4s ease" : "none",
        }}>
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:"1rem", fontWeight:800, color:"#0f172a" }}>Vendor Login</div>
            <div style={{ fontSize:"0.7rem", color:"#64748b", marginTop:3 }}>
              Enter credentials provided by your railway admin
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Vendor ID</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>🪪</span>
              <input
                style={{ ...inp, paddingLeft:38, letterSpacing:"2px", fontFamily:"monospace", textTransform:"uppercase", ...(error ? errInp : {}) }}
                placeholder="V1234"
                value={vendorId}
                onChange={e => { setVendorId(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={onKey}
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inp, paddingLeft:38, paddingRight:44, letterSpacing:"3px", fontFamily:"monospace", textTransform:"uppercase", ...(error ? errInp : {}) }}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={onKey}
                autoComplete="off"
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:"1rem", color:"#94a3b8", padding:0 }}
              >{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>

          {error && (
            <div style={{
              background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:8,
              padding:"10px 12px", fontSize:"0.72rem", color:"#dc2626",
              marginBottom:16, display:"flex", gap:8, alignItems:"flex-start",
              animation:"vl-up 0.2s ease",
            }}>
              <span style={{ flexShrink:0 }}>❌</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width:"100%", padding:"13px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
              color:"#fff", border:"none", borderRadius:10,
              fontSize:"0.92rem", fontWeight:700, cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 16px rgba(29,78,216,0.35)",
              transition:"opacity 0.15s",
            }}
          >
            {loading ? (
              <><Spinner /> Verifying credentials...</>
            ) : (
              "Login to Vendor Panel →"
            )}
          </button>

          <div style={{ textAlign:"center", marginTop:14, fontSize:"0.65rem", color:"#94a3b8" }}>
            Forgot credentials? Contact your railway admin.
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:18, fontSize:"0.62rem", color:"rgba(255,255,255,0.3)" }}>
          IRCTC Pantry Management System · NGP Division · v2.0
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
        background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",
        padding:"10px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, flexWrap:"wrap", gap:8,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:"rgba(255,255,255,0.18)",
            border:"1px solid rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.1rem", flexShrink:0,
          }}>👤</div>
          <div>
            <div style={{ fontSize:"0.88rem", fontWeight:800, color:"#fff" }}>{vendor.name}</div>
            <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.7)" }}>
              ID: <span style={{ fontFamily:"monospace", letterSpacing:"1px", color:"#93c5fd" }}>{vendor.id}</span>
              &nbsp;·&nbsp; 🚂 Train {vendor.trainNo || vendor.train} — {vendor.trainName}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={() => setShowQR(true)}
            style={{
              padding:"6px 14px", borderRadius:8,
              background:"rgba(255,255,255,0.15)",
              border:"1px solid rgba(255,255,255,0.25)",
              color:"#fff", fontSize:"0.75rem", fontWeight:700,
              cursor:"pointer", display:"flex", alignItems:"center", gap:5,
            }}
          >📲 My QR</button>
          <button
            onClick={onLogout}
            style={{
              padding:"6px 14px", borderRadius:8,
              background:"rgba(255,255,255,0.1)",
              border:"1px solid rgba(255,255,255,0.2)",
              color:"rgba(255,255,255,0.85)", fontSize:"0.75rem",
              fontWeight:700, cursor:"pointer",
            }}
          >Logout →</button>
        </div>
      </div>

      {showQR && (
        <div
          onClick={() => setShowQR(false)}
          style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
            zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"#fff", borderRadius:20, padding:28,
              width:"100%", maxWidth:340,
              boxShadow:"0 30px 80px rgba(0,0,0,0.3)",
              animation:"vl-up 0.3s ease",
              textAlign:"center",
            }}
          >
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#94a3b8", letterSpacing:"1.5px", marginBottom:4 }}>YOUR TRAIN QR CODE</div>
            <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#0f172a" }}>
              Train {vendor.trainNo || vendor.train}
            </div>
            <div style={{ fontSize:"0.78rem", color:"#64748b", marginBottom:18 }}>{vendor.trainName}</div>

            <div
              data-qr-vendor-header
              style={{
                display:"inline-block", padding:16,
                background:"#f8fafc", borderRadius:16,
                border:"2px solid #e2e8f0",
                boxShadow:"0 4px 20px rgba(0,0,0,0.08)",
                marginBottom:14,
              }}>
              <RealQR
                url={`${window.location.origin}/app?train=${vendor.trainNo || vendor.train}`}
                size={160}
                darkColor="#1e3a5f"
              />
            </div>

            <div style={{ fontSize:"0.7rem", color:"#64748b", marginBottom:6 }}>
              Passengers scan this to order food
            </div>
            <div style={{
              fontSize:"0.62rem", fontFamily:"monospace",
              background:"#f1f5f9", padding:"5px 12px",
              borderRadius:6, color:"#1d4ed8",
              border:"1px solid #dbeafe", display:"inline-block",
              marginBottom:20,
            }}>
              {window.location.origin}/app?train={vendor.trainNo || vendor.train}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={downloadQR}
                style={{
                  flex:1, padding:"11px",
                  background:"#f0fdf4",
                  color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:10,
                  fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
                }}
              >⬇ Download PNG</button>
              <button
                onClick={() => setShowQR(false)}
                style={{
                  flex:1, padding:"11px",
                  background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",
                  color:"#fff", border:"none", borderRadius:10,
                  fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 12px rgba(29,78,216,0.3)",
                }}
              >Done ✓</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function VendorLogin({ children }) {
  const [vendor, setVendor] = useState(() => loadSession());

  const handleLogin  = (v) => { saveSession(v); setVendor(v); };
  const handleLogout = ()  => { clearSession(); setVendor(null); };

  if (!vendor) return <LoginForm onSuccess={handleLogin} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <VendorHeader vendor={vendor} onLogout={handleLogout} />
      <div style={{ flex:1, overflowY:"auto" }}>
        {typeof children === "function"
          ? children(vendor, handleLogout)
          : children}
      </div>
    </div>
  );
}

const lbl    = { display:"block", fontSize:"0.68rem", fontWeight:700, color:"#374151", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:5, fontFamily:"sans-serif" };
const inp    = { width:"100%", padding:"11px 12px", border:"1.5px solid #e5e7eb", borderRadius:9, fontSize:"0.85rem", color:"#111827", background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"sans-serif", transition:"border-color 0.15s, box-shadow 0.15s" };
const errInp = { borderColor:"#fca5a5", background:"#fff5f5" };

const Spinner = () => (
  <span style={{ width:15, height:15, border:"2.5px solid rgba(255,255,255,0.35)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"vl-spin 0.7s linear infinite" }}/>
);