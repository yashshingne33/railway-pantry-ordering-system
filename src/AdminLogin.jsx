/**
 * AdminLogin.jsx
 * ─────────────────────────────────────────────────────────
 * Standalone login page for the Admin Dashboard.
 * Default credentials are stored in localStorage under "irctc_admin_creds".
 * On first run, hardcoded defaults are used:
 *   Admin ID : ADMIN
 *   Password : ADMIN1234
 *
 * Usage in App.jsx:
 *
 *   import AdminLogin from './AdminLogin';
 *
 *   <Route path="/app/admin" element={
 *     <AdminLogin>
 *       {(admin, logout) => <AdminDashboard admin={admin} onLogout={logout} />}
 *     </AdminLogin>
 *   } />
 * ─────────────────────────────────────────────────────────
 */

import { useState } from "react";

/* ── Session / credential helpers ────────────────────────────────────────── */
const SESSION_KEY = "irctc_admin_session";
const CREDS_KEY   = "irctc_admin_creds";

/* Default admin account — change via localStorage to override */
const DEFAULT_CREDS = { id: "ADMIN", password: "ADMIN1234", name: "Station Admin", division: "NGP Division" };

const loadCreds  = () => { try { return JSON.parse(localStorage.getItem(CREDS_KEY) || "null") || DEFAULT_CREDS; } catch { return DEFAULT_CREDS; } };
const saveSession  = (v) => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch {} };
const loadSession  = ()  => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
const clearSession = ()  => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} };

/* ── Animated lock icon SVG ───────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M16 3L5 7.5V15c0 6.08 4.65 11.76 11 13 6.35-1.24 11-6.92 11-13V7.5L16 3Z"
      fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
    <rect x="11" y="14" width="10" height="8" rx="2" fill="rgba(255,255,255,0.9)"/>
    <circle cx="16" cy="13" r="3" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8"/>
    <circle cx="16" cy="18" r="1" fill="#1e3a5f"/>
  </svg>
);

/* ── Background grid pattern ─────────────────────────────────────────────── */
const GridBg = () => (
  <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, pointerEvents:"none" }}
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
  </svg>
);

/* ── Spinner ─────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <span style={{
    width:15, height:15,
    border:"2.5px solid rgba(255,255,255,0.3)",
    borderTopColor:"#fff",
    borderRadius:"50%",
    display:"inline-block",
    animation:"al-spin 0.7s linear infinite",
  }}/>
);

/* ══════════════════════════════════════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════════════════════════════════════ */
function LoginForm({ onSuccess }) {
  const [adminId,  setAdminId]  = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleLogin = async () => {
    if (!adminId.trim() || !password.trim()) {
      setError("Please enter both Admin ID and Password.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");

    await new Promise(r => setTimeout(r, 900));

    const creds = loadCreds();
    const match =
      creds.id       === adminId.trim().toUpperCase() &&
      creds.password === password.trim().toUpperCase();

    setLoading(false);

    if (!match) {
      setError("Invalid Admin ID or Password. Access denied.");
      triggerShake();
      return;
    }

    const session = { id: creds.id, name: creds.name, division: creds.division, loginAt: new Date().toLocaleTimeString("en-IN") };
    saveSession(session);
    onSuccess(session);
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:"linear-gradient(160deg, #0a0f1e 0%, #0d1f3c 40%, #0f2952 70%, #102a5c 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, fontFamily:"'Segoe UI', sans-serif",
      overflow:"hidden",
    }}>
      <GridBg />

      {/* Radial glow accents */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%)", top:-100, right:-100, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)", bottom:-80, left:-80, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", top:"38%", right:"8%", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:440, position:"relative", animation:"al-up 0.5s cubic-bezier(.22,.68,0,1.2)" }}>

        {/* Top badge */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          {/* Emblem */}
          <div style={{
            width:76, height:76, borderRadius:22,
            background:"linear-gradient(135deg, rgba(29,78,216,0.35), rgba(14,165,233,0.2))",
            border:"1.5px solid rgba(99,179,237,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 14px",
            boxShadow:"0 0 0 8px rgba(29,78,216,0.08), 0 12px 32px rgba(0,0,0,0.35)",
          }}>
            <ShieldIcon />
          </div>
          <div style={{ fontSize:"1.6rem", fontWeight:900, color:"#fff", letterSpacing:"-0.5px", lineHeight:1 }}>
            Admin Portal
          </div>
          <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.45)", marginTop:6, letterSpacing:"2px", textTransform:"uppercase" }}>
            IRCTC Pantry · NGP Division
          </div>
          {/* Authority stripe */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12 }}>
            <div style={{ height:1, width:40, background:"linear-gradient(to right, transparent, rgba(99,179,237,0.4))" }}/>
            <span style={{ fontSize:"0.6rem", color:"rgba(99,179,237,0.7)", letterSpacing:"3px", fontWeight:700 }}>RESTRICTED ACCESS</span>
            <div style={{ height:1, width:40, background:"linear-gradient(to left, transparent, rgba(99,179,237,0.4))" }}/>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.96)",
          borderRadius:20,
          padding:"28px 26px",
          boxShadow:"0 0 0 1px rgba(99,179,237,0.2), 0 32px 80px rgba(0,0,0,0.5)",
          backdropFilter:"blur(12px)",
          animation: shake ? "al-shake 0.4s ease" : "none",
        }}>
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:"1.05rem", fontWeight:800, color:"#0a0f1e" }}>Sign in to Dashboard</div>
            <div style={{ fontSize:"0.7rem", color:"#64748b", marginTop:3 }}>
              Authorised railway personnel only
            </div>
          </div>

          {/* Admin ID */}
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Admin ID</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>🛡️</span>
              <input
                style={{ ...inp, paddingLeft:40, letterSpacing:"2px", fontFamily:"monospace", textTransform:"uppercase", ...(error ? errInp : {}) }}
                placeholder="ADMIN"
                value={adminId}
                onChange={e => { setAdminId(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={onKey}
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>🔐</span>
              <input
                type={showPass ? "text" : "password"}
                style={{ ...inp, paddingLeft:40, paddingRight:46, letterSpacing:"3px", fontFamily:"monospace", textTransform:"uppercase", ...(error ? errInp : {}) }}
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

          {/* Error */}
          {error && (
            <div style={{
              background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:8,
              padding:"10px 12px", fontSize:"0.72rem", color:"#dc2626",
              marginBottom:16, display:"flex", gap:8, alignItems:"flex-start",
              animation:"al-up 0.2s ease",
            }}>
              <span style={{ flexShrink:0 }}>⛔</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width:"100%", padding:"13px",
              background: loading
                ? "linear-gradient(135deg,#93c5fd,#60a5fa)"
                : "linear-gradient(135deg,#0a0f1e 0%,#0d1f3c 50%,#1d4ed8 100%)",
              color:"#fff", border:"none", borderRadius:10,
              fontSize:"0.92rem", fontWeight:700,
              cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 20px rgba(13,31,60,0.5)",
              transition:"opacity 0.15s, transform 0.1s",
              letterSpacing:"0.3px",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; }}
          >
            {loading ? (
              <><Spinner /> Authenticating...</>
            ) : (
              <>🔓 Access Admin Dashboard</>
            )}
          </button>

          <div style={{ textAlign:"center", marginTop:14, fontSize:"0.63rem", color:"#94a3b8" }}>
            Default: <span style={{ fontFamily:"monospace", color:"#64748b" }}>ADMIN</span>
            {" / "}
            <span style={{ fontFamily:"monospace", color:"#64748b" }}>ADMIN1234</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:20, fontSize:"0.6rem", color:"rgba(255,255,255,0.22)", letterSpacing:"0.5px" }}>
          IRCTC Pantry Management System · NGP Division · v2.0
          <br/>
          <span style={{ color:"rgba(255,255,255,0.14)" }}>Unauthorised access is a criminal offence under IT Act 2000</span>
        </div>
      </div>

      <style>{`
        @keyframes al-up    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes al-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-9px)} 40%{transform:translateX(9px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes al-spin  { to{transform:rotate(360deg)} }
        input:focus { border-color:#1d4ed8 !important; box-shadow:0 0 0 3px rgba(29,78,216,0.14) !important; outline:none; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN HEADER BAR
   Shown above AdminDashboard once logged in
══════════════════════════════════════════════════════════════════════════ */
function AdminHeader({ admin, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div style={{
        background:"linear-gradient(135deg,#0a0f1e 0%,#0d1f3c 60%,#1d4ed8 100%)",
        padding:"10px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexShrink:0, flexWrap:"wrap", gap:8,
        borderBottom:"1px solid rgba(99,179,237,0.2)",
        boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
      }}>
        {/* Left: admin info */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background:"rgba(255,255,255,0.12)",
            border:"1px solid rgba(99,179,237,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.1rem", flexShrink:0,
          }}>🛡️</div>
          <div>
            <div style={{ fontSize:"0.88rem", fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
              {admin.name}
              <span style={{
                fontSize:"0.52rem", fontWeight:700, letterSpacing:"1.5px",
                background:"rgba(99,179,237,0.2)", color:"#93c5fd",
                padding:"2px 6px", borderRadius:4, border:"1px solid rgba(99,179,237,0.25)",
              }}>ADMIN</span>
            </div>
            <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.55)" }}>
              ID: <span style={{ fontFamily:"monospace", letterSpacing:"1px", color:"#93c5fd" }}>{admin.id}</span>
              &nbsp;·&nbsp; {admin.division}
              &nbsp;·&nbsp; Logged in {admin.loginAt}
            </div>
          </div>
        </div>

        {/* Right: info + logout */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={() => setShowInfo(true)}
            style={{
              padding:"6px 14px", borderRadius:8,
              background:"rgba(255,255,255,0.1)",
              border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", fontSize:"0.75rem", fontWeight:700,
              cursor:"pointer", display:"flex", alignItems:"center", gap:5,
            }}
          >⚙️ Session</button>
          <button
            onClick={onLogout}
            style={{
              padding:"6px 14px", borderRadius:8,
              background:"rgba(220,38,38,0.2)",
              border:"1px solid rgba(248,113,113,0.3)",
              color:"#fca5a5", fontSize:"0.75rem",
              fontWeight:700, cursor:"pointer",
              transition:"all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(220,38,38,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(220,38,38,0.2)"; }}
          >⏻ Logout</button>
        </div>
      </div>

      {/* Session info modal */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
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
              boxShadow:"0 30px 80px rgba(0,0,0,0.35)",
              animation:"al-up 0.3s ease",
            }}
          >
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:"0.64rem", fontWeight:700, color:"#94a3b8", letterSpacing:"1.5px", marginBottom:4 }}>ACTIVE SESSION</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#0a0f1e" }}>{admin.name}</div>
            </div>
            <div style={{
              background:"linear-gradient(135deg,#0a0f1e,#0d1f3c)",
              borderRadius:12, padding:16, marginBottom:16,
            }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { label:"ADMIN ID",   value:admin.id,       color:"#93c5fd" },
                  { label:"DIVISION",   value:admin.division, color:"#6ee7b7" },
                  { label:"LOGIN TIME", value:admin.loginAt,  color:"#fde68a" },
                  { label:"ROLE",       value:"Superuser",    color:"#c4b5fd" },
                ].map(item => (
                  <div key={item.label} style={{ background:"rgba(255,255,255,0.07)", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.35)", letterSpacing:"1px", marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:"0.82rem", fontWeight:700, color:item.color, fontFamily:"monospace" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  flex:1, padding:"11px",
                  background:"linear-gradient(135deg,#0a0f1e,#1d4ed8)",
                  color:"#fff", border:"none", borderRadius:10,
                  fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 12px rgba(13,31,60,0.35)",
                }}
              >Close ✓</button>
              <button
                onClick={() => { setShowInfo(false); onLogout(); }}
                style={{
                  padding:"11px 18px",
                  background:"#fef2f2", border:"1px solid #fecaca",
                  borderRadius:10, fontSize:"0.82rem",
                  fontWeight:700, color:"#dc2626", cursor:"pointer",
                }}
              >⏻ Logout</button>
            </div>
          </div>
          <style>{`@keyframes al-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — AdminLogin wrapper
   Wraps AdminDashboard with login gate + admin header bar.

   Usage (render prop):
     <AdminLogin>
       {(admin, logout) => <AdminDashboard admin={admin} onLogout={logout} />}
     </AdminLogin>

   Usage (children):
     <AdminLogin><AdminDashboard /></AdminLogin>
══════════════════════════════════════════════════════════════════════════ */
export default function AdminLogin({ children }) {
  const [admin, setAdmin] = useState(() => loadSession());

  const handleLogin  = (a) => { saveSession(a); setAdmin(a); };
  const handleLogout = ()  => { clearSession(); setAdmin(null); };

  if (!admin) return <LoginForm onSuccess={handleLogin} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <AdminHeader admin={admin} onLogout={handleLogout} />
      <div style={{ flex:1, overflowY:"auto" }}>
        {typeof children === "function"
          ? children(admin, handleLogout)
          : children}
      </div>
    </div>
  );
}

/* ── Shared style atoms ─────────────────────────────────────────────────── */
const lbl    = { display:"block", fontSize:"0.68rem", fontWeight:700, color:"#374151", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:5, fontFamily:"sans-serif" };
const inp    = { width:"100%", padding:"11px 12px", border:"1.5px solid #e5e7eb", borderRadius:9, fontSize:"0.85rem", color:"#111827", background:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"sans-serif", transition:"border-color 0.15s, box-shadow 0.15s" };
const errInp = { borderColor:"#fca5a5", background:"#fff5f5" };