/**
 * AdminLogin.jsx
 * ─────────────────────────────────────────────────────────
 * Admin login page — Indian Railway Pantry Management System
 * Blue theme, professional, fully responsive
 *
 * Default credentials:
 *   Admin ID : ADMIN
 *   Password : ADMIN1234
 */

import { useState } from "react";

const SESSION_KEY = "ir_admin_session";
const CREDS_KEY   = "ir_admin_creds";

const DEFAULT_CREDS = {
  id: "ADMIN",
  password: "ADMIN1234",
  name: "Station Admin",
  division: "NGP Division",
};

const loadCreds    = () => { try { return JSON.parse(localStorage.getItem(CREDS_KEY) || "null") || DEFAULT_CREDS; } catch { return DEFAULT_CREDS; } };
const saveSession  = (v) => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch {} };
const loadSession  = ()  => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } };
const clearSession = ()  => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} };

/* ── SVG Icons ────────────────────────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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

/* ── Spinner ─────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <span style={{
    width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "al-spin 0.7s linear infinite",
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

    const session = {
      id: creds.id,
      name: creds.name,
      division: creds.division,
      loginAt: new Date().toLocaleTimeString("en-IN"),
    };
    saveSession(session);
    onSuccess(session);
  };

  const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(145deg, #0a1628 0%, #0d2147 40%, #0f2d63 70%, #1a3a8f 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none" }}>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#fff" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* Glow accents */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,90,230,0.14) 0%, transparent 70%)", top: -150, right: -150, pointerEvents: "none" }}/>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", animation: "al-up 0.5s cubic-bezier(.22,.68,0,1.2)" }}>

        {/* Header badge */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
<div style={{ width: 80, height: 80, borderRadius: 22, background: "#fff", padding: 8, margin: "0 auto 16px", boxShadow: "0 0 0 10px rgba(30,90,230,0.06), 0 16px 40px rgba(0,0,0,0.3)", boxSizing: "border-box" }}>
  <img src="/logo.png" alt="Railway Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
</div>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            Admin Portal
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: 6, letterSpacing: "2.5px", textTransform: "uppercase" }}>
            Indian Railway Pantry · NGP Division
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(147,197,253,0.4))" }}/>
            <span style={{ fontSize: "0.58rem", color: "rgba(147,197,253,0.7)", letterSpacing: "3px", fontWeight: 700 }}>RESTRICTED ACCESS</span>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(147,197,253,0.4))" }}/>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 20,
          padding: "clamp(20px, 4vw, 32px)",
          boxShadow: "0 0 0 1px rgba(147,197,253,0.15), 0 32px 80px rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
          animation: shake ? "al-shake 0.4s ease" : "none",
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: "1.08rem", fontWeight: 800, color: "#0a1628" }}>Sign in to Dashboard</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>Authorised railway personnel only</div>
          </div>

          {/* Admin ID */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Admin ID</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                <UserIcon />
              </span>
              <input
                style={{ ...inp, paddingLeft: 42, letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", ...(error ? errInp : {}) }}
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

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10,
              padding: "10px 14px", fontSize: "0.74rem", color: "#dc2626",
              marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start",
              animation: "al-up 0.2s ease",
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
              <span>{error}</span>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading
                ? "linear-gradient(135deg,#93c5fd,#60a5fa)"
                : "linear-gradient(135deg,#0a1628 0%,#0d2147 50%,#1d4ed8 100%)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: "0.92rem", fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 4px 20px rgba(13,31,60,0.45)",
              transition: "opacity 0.15s, transform 0.1s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            {loading ? <><Spinner /> Authenticating…</> : "Access Admin Dashboard"}
          </button>

          <div style={{ textAlign: "center", marginTop: 14, fontSize: "0.63rem", color: "#94a3b8" }}>
            Default: <span style={{ fontFamily: "monospace", color: "#64748b" }}>ADMIN</span>
            {" / "}
            <span style={{ fontFamily: "monospace", color: "#64748b" }}>ADMIN1234</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 22, fontSize: "0.6rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.4px" }}>
          Indian Railway Pantry Management System · NGP Division · v2.0
          <br/>
          <span style={{ color: "rgba(255,255,255,0.13)" }}>Unauthorised access is a criminal offence under IT Act 2000</span>
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
══════════════════════════════════════════════════════════════════════════ */
function AdminHeader({ admin, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg,#0a1628 0%,#0d2147 60%,#1d4ed8 100%)",
        padding: "10px clamp(12px, 3vw, 24px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, flexWrap: "wrap", gap: 8,
        borderBottom: "1px solid rgba(147,197,253,0.18)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.28)",
      }}>
        {/* Left: admin info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(147,197,253,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#93c5fd", flexShrink: 0,
          }}>
            <ShieldIcon />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 7 }}>
              {admin.name}
              <span style={{
                fontSize: "0.52rem", fontWeight: 700, letterSpacing: "1.5px",
                background: "rgba(147,197,253,0.18)", color: "#93c5fd",
                padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(147,197,253,0.25)",
              }}>ADMIN</span>
            </div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)" }}>
              ID: <span style={{ fontFamily: "monospace", letterSpacing: "1px", color: "#93c5fd" }}>{admin.id}</span>
              <span style={{ margin: "0 5px", opacity: 0.4 }}>·</span>{admin.division}
              <span style={{ margin: "0 5px", opacity: 0.4 }}>·</span>Logged in {admin.loginAt}
            </div>
          </div>
        </div>

        {/* Right: session + logout */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowInfo(true)}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff", fontSize: "0.75rem", fontWeight: 600,
              cursor: "pointer",
            }}
          >Session</button>
          <button
            onClick={onLogout}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(220,38,38,0.18)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#fca5a5", fontSize: "0.75rem",
              fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.18)"; }}
          >Logout</button>
        </div>
      </div>

      {/* Session info modal */}
      {showInfo && (
        <div onClick={() => setShowInfo(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: 28,
            width: "100%", maxWidth: 340,
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            animation: "al-up 0.3s ease",
          }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "1.5px", marginBottom: 4 }}>ACTIVE SESSION</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0a1628" }}>{admin.name}</div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2147)", borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "ADMIN ID",   value: admin.id,       color: "#93c5fd" },
                  { label: "DIVISION",   value: admin.division, color: "#6ee7b7" },
                  { label: "LOGIN TIME", value: admin.loginAt,  color: "#fde68a" },
                  { label: "ROLE",       value: "Superuser",    color: "#c4b5fd" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: item.color, fontFamily: "monospace" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowInfo(false)} style={{
                flex: 1, padding: "11px",
                background: "linear-gradient(135deg,#0a1628,#1d4ed8)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              }}>Close</button>
              <button onClick={() => { setShowInfo(false); onLogout(); }} style={{
                padding: "11px 18px",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, fontSize: "0.82rem",
                fontWeight: 700, color: "#dc2626", cursor: "pointer",
              }}>Logout</button>
            </div>
          </div>
          <style>{`@keyframes al-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function AdminLogin({ children }) {
  const [admin, setAdmin] = useState(() => loadSession());

  const handleLogin  = (a) => { saveSession(a); setAdmin(a); };
  const handleLogout = ()  => { clearSession(); setAdmin(null); };

  if (!admin) return <LoginForm onSuccess={handleLogin} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <AdminHeader admin={admin} onLogout={handleLogout} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {typeof children === "function"
          ? children(admin, handleLogout)
          : children}
      </div>
    </div>
  );
}

/* ── Shared style atoms ─────────────────────────────────────────────────── */
const lbl    = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6, fontFamily: "sans-serif" };
const inp    = { width: "100%", padding: "11px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: "0.85rem", color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif", transition: "border-color 0.15s, box-shadow 0.15s" };
const errInp = { borderColor: "#fca5a5", background: "#fff5f5" };