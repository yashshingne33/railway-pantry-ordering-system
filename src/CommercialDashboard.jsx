import { useState, useMemo } from "react";
import { useStore, actions, genId, genPassword, now, badgeClass, T } from "../shared/store";

/* ── Helpers ── */
const Badge = ({ label }) => <span className={`badge ${badgeClass(label)}`}>{label}</span>;

const StatCard = ({ icon, label, value, sub, accent = "blue", onClick }) => {
  const colors = { blue: "#1d4ed8", green: "#16a34a", red: "#dc2626", yellow: "#ca8a04", purple: "#7c3aed" };
  const bgs    = { blue: "#eff6ff", green: "#f0fdf4", red: "#fef2f2", yellow: "#fefce8", purple: "#f5f3ff" };
  return (
    <div
      className="stat-card"
      style={{ borderLeftColor: colors[accent] || colors.blue, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="stat-icon" style={{ color: colors[accent] || colors.blue, background: bgs[accent] || bgs.blue }}>
        <i className={icon} aria-hidden="true" />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-val">{value}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
};

/* ── Tiny donut bar ── */
const MiniBar = ({ pct, color = "#1d4ed8" }) => (
  <div style={{ height: 5, borderRadius: 99, background: "#e2e8f0", overflow: "hidden", marginTop: 4 }}>
    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: "width .5s" }} />
  </div>
);

/* ── Train lookup ── */
async function fetchTrainInfo(trainNo) {
  try {
    const res = await fetch(`https://indian-railway-api.cyclic.app/trains/${trainNo}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    return data?.train_name || null;
  } catch {
    const fallback = {
      "12139": "Sewagram Express",  "12140": "Maharashtra Express",
      "22105": "Vidarbha Express",  "12859": "Gitanjali Express",
      "12809": "Mumbai Mail",       "12025": "Shatabdi Express",
      "12951": "Mumbai Rajdhani",   "12301": "Howrah Rajdhani",
    };
    return fallback[trainNo] || null;
  }
}

/* ── Add Vendor Modal ── */
function AddVendorModal({ onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", trainNo: "", trainName: "" });
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: "" })); };

  const lookupTrain = async () => {
    if (!form.trainNo.trim()) return;
    setFetching(true);
    const name = await fetchTrainInfo(form.trainNo.trim());
    setFetching(false);
    if (name) setForm((f) => ({ ...f, trainName: name }));
    else setErrors((er) => ({ ...er, trainNo: "Train not found. Enter name manually." }));
  };

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim() || form.phone.length < 10) e.phone = "Valid 10-digit number required";
    if (!form.trainNo.trim()) e.trainNo = "Required";
    if (!form.trainName.trim()) e.trainName = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }

    const id       = `VND-${1001 + Math.floor(Math.random() * 900)}`;
    const password = genPassword(form.trainNo.trim());
    actions.addVendor({
      id, name: form.name.trim(), phone: form.phone.trim(),
      email: form.email.trim(), password,
      assignedTrain: form.trainNo.trim(), trainName: form.trainName.trim(),
      status: "Active", createdAt: new Date().toISOString().split("T")[0],
      sales: 0, rating: 0,
    });
    setGeneratedCreds({ id, password });
  };

  if (generatedCreds) return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <span className="section-title"><i className="ti ti-check" style={{ color: T.green, marginRight: 6 }} />Vendor Created</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28, color: T.green }}>
            <i className="ti ti-user-check" />
          </div>
          <p style={{ fontWeight: 700, fontSize: ".95rem", color: T.text, marginBottom: 4 }}>Vendor registered successfully</p>
          <p style={{ fontSize: ".72rem", color: T.textSub, marginBottom: "1.5rem" }}>Share these credentials with the vendor</p>
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "1rem", textAlign: "left" }}>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: ".6rem", fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>Vendor ID</p>
              <p style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: T.primary, letterSpacing: 1 }}>{generatedCreds.id}</p>
            </div>
            <div>
              <p style={{ fontSize: ".6rem", fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 3 }}>Password</p>
              <p style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: T.primary, letterSpacing: 1 }}>{generatedCreds.password}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="section-title"><i className="ti ti-user-plus" style={{ marginRight: 6, color: T.primary }} />Add Vendor</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="field-label">Full Name *</label>
              <input className="field-input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={set("name")} />
              {errors.name && <span style={{ fontSize: ".62rem", color: T.red, marginTop: 3, display: "block" }}>{errors.name}</span>}
            </div>
            <div>
              <label className="field-label">Phone *</label>
              <input className="field-input" placeholder="10-digit mobile" value={form.phone} onChange={set("phone")} />
              {errors.phone && <span style={{ fontSize: ".62rem", color: T.red, marginTop: 3, display: "block" }}>{errors.phone}</span>}
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" placeholder="Optional" value={form.email} onChange={set("email")} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label className="field-label">Train Number *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="field-input" placeholder="e.g. 12139" value={form.trainNo} onChange={set("trainNo")} style={{ flex: 1 }} />
              <button className="btn-secondary" onClick={lookupTrain} disabled={fetching} style={{ whiteSpace: "nowrap" }}>
                {fetching ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Looking up…</> : <><i className="ti ti-search" /> Lookup</>}
              </button>
            </div>
            {errors.trainNo && <span style={{ fontSize: ".62rem", color: T.red, marginTop: 3, display: "block" }}>{errors.trainNo}</span>}
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="field-label">Train Name *</label>
            <input className="field-input" placeholder="Auto-filled or enter manually" value={form.trainName} onChange={set("trainName")} />
            {errors.trainName && <span style={{ fontSize: ".62rem", color: T.red, marginTop: 3, display: "block" }}>{errors.trainName}</span>}
          </div>
          <div style={{ marginTop: 14, background: T.primaryLight, border: `1px solid ${T.primaryBorder}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <i className="ti ti-info-circle" style={{ color: T.primary, marginTop: 2 }} />
              <div style={{ fontSize: ".68rem", color: "#1e40af", lineHeight: 1.5 }}>
                Vendor ID and password are auto-generated after submission. Password format: <strong>TRAIN + train number</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}><i className="ti ti-check" /> Create Vendor</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   VENDOR DETAIL PANEL (slide-in drawer)
══════════════════════════════════════════ */
function VendorDetailPanel({ vendor, orders, complaints, feedback, onClose, onToggle, onShowCreds }) {
  const [innerTab, setInnerTab] = useState("overview");

  const vendorOrders     = useMemo(() => orders.filter(o => o.trainNo === vendor.assignedTrain), [orders, vendor]);
  const vendorComplaints = useMemo(() => complaints.filter(c => c.trainNo === vendor.assignedTrain), [complaints, vendor]);
  const vendorFeedback   = useMemo(() => feedback.filter(f => f.trainNo === vendor.assignedTrain), [feedback, vendor]);

  const totalRev       = vendorOrders.filter(o => o.status === "Delivered").reduce((s, o) => s + o.total, 0);
  const pendingRev     = vendorOrders.filter(o => o.status === "Pending" || o.status === "Preparing").reduce((s, o) => s + o.total, 0);
  const deliveredCount = vendorOrders.filter(o => o.status === "Delivered").length;
  const openComplaints = vendorComplaints.filter(c => c.status === "Open").length;
  const avgRating      = vendorFeedback.length
    ? (vendorFeedback.reduce((s, f) => s + f.rating, 0) / vendorFeedback.length).toFixed(1)
    : vendor.rating || "—";

  /* Item-level breakdown */
  const itemMap = {};
  vendorOrders.filter(o => o.status === "Delivered").forEach(o =>
    o.items.forEach(i => {
      itemMap[i.name] = (itemMap[i.name] || 0) + i.qty * (i.price || 0);
    })
  );
  const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxItemRev = topItems[0]?.[1] || 1;

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={i < Math.round(n) ? "ti ti-star-filled" : "ti ti-star"}
      style={{ fontSize: 13, color: i < Math.round(n) ? "#f59e0b" : "#d1d5db" }} />
  ));

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.45)",
          backdropFilter: "blur(2px)", zIndex: 200,
          animation: "fadeIn .2s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(600px, 96vw)",
        background: "#fff", zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,.18)",
        animation: "slideInRight .28s cubic-bezier(.22,.61,.36,1)",
        overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{ padding: "1.1rem 1.25rem .9rem", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,.18)", border: "1.5px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>
                <i className="ti ti-user" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", margin: 0 }}>{vendor.name}</p>
                <p style={{ fontSize: ".68rem", color: "rgba(255,255,255,.72)", margin: 0 }}>
                  {vendor.id} · Train {vendor.assignedTrain} · {vendor.trainName}
                </p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}
              style={{ color: "#fff", background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <i className="ti ti-x" />
            </button>
          </div>

          {/* Quick badges */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { icon: "ti ti-currency-rupee", label: `₹${totalRev.toLocaleString("en-IN")} earned` },
              { icon: "ti ti-package",        label: `${deliveredCount} delivered` },
              { icon: "ti ti-star-filled",    label: `${avgRating} rating`, star: true },
              { icon: "ti ti-alert-triangle", label: `${openComplaints} complaints`, warn: openComplaints > 0 },
            ].map((b, i) => (
              <div key={i} style={{
                display: "flex", gap: 5, alignItems: "center",
                background: b.warn ? "rgba(239,68,68,.25)" : b.star ? "rgba(245,158,11,.2)" : "rgba(255,255,255,.15)",
                border: b.warn ? "1px solid rgba(239,68,68,.4)" : "1px solid rgba(255,255,255,.2)",
                borderRadius: 99, padding: "3px 10px",
                color: b.warn ? "#fca5a5" : "#e0eaff", fontSize: ".66rem", fontWeight: 600,
              }}>
                <i className={b.icon} style={{ fontSize: 11 }} />
                {b.label}
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={onShowCreds} style={{
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)",
                borderRadius: 8, color: "#fff", fontSize: ".65rem", fontWeight: 600,
                padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}><i className="ti ti-key" /> Credentials</button>
              <button onClick={onToggle} style={{
                background: vendor.status === "Active" ? "rgba(239,68,68,.25)" : "rgba(16,185,129,.25)",
                border: vendor.status === "Active" ? "1px solid rgba(239,68,68,.4)" : "1px solid rgba(16,185,129,.4)",
                borderRadius: 8,
                color: vendor.status === "Active" ? "#fca5a5" : "#6ee7b7",
                fontSize: ".65rem", fontWeight: 600,
                padding: "4px 10px", cursor: "pointer",
              }}>
                {vendor.status === "Active" ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Inner Tabs ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", background: "#f8fafc", flexShrink: 0 }}>
          {[["overview","ti ti-chart-bar","Overview"],["orders","ti ti-package","Orders"],["complaints","ti ti-alert-triangle","Complaints"],["feedback","ti ti-star","Feedback"]].map(([id, icon, label]) => (
            <button key={id}
              onClick={() => setInnerTab(id)}
              style={{
                flex: 1, padding: "9px 6px", border: "none", background: "none", cursor: "pointer",
                borderBottom: innerTab === id ? "2px solid #1d4ed8" : "2px solid transparent",
                color: innerTab === id ? "#1d4ed8" : T.textSub,
                fontSize: ".67rem", fontWeight: 600, display: "flex", gap: 4, alignItems: "center", justifyContent: "center",
                transition: "color .15s",
              }}>
              <i className={icon} style={{ fontSize: 13 }} /> {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>

          {/* OVERVIEW */}
          {innerTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Revenue cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Total Revenue", val: `₹${totalRev.toLocaleString("en-IN")}`, sub: "Delivered orders", color: "#16a34a", bg: "#f0fdf4", icon: "ti ti-currency-rupee" },
                  { label: "Pending Revenue", val: `₹${pendingRev.toLocaleString("en-IN")}`, sub: "In-progress orders", color: "#ca8a04", bg: "#fefce8", icon: "ti ti-clock" },
                  { label: "Orders Delivered", val: deliveredCount, sub: `of ${vendorOrders.length} total`, color: "#1d4ed8", bg: "#eff6ff", icon: "ti ti-package" },
                  { label: "Avg. Rating", val: avgRating, sub: `${vendorFeedback.length} reviews`, color: "#f59e0b", bg: "#fffbeb", icon: "ti ti-star" },
                ].map((c, i) => (
                  <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}22`, borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={c.icon} style={{ color: c.color, fontSize: 17 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: ".6rem", color: T.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".3px", margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: "1.05rem", fontWeight: 800, color: c.color, margin: "1px 0" }}>{c.val}</p>
                      <p style={{ fontSize: ".58rem", color: T.textLight, margin: 0 }}>{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top selling items */}
              {topItems.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                  <p style={{ fontWeight: 700, fontSize: ".8rem", color: T.text, marginBottom: 12 }}>
                    <i className="ti ti-trending-up" style={{ color: "#1d4ed8", marginRight: 6 }} />Top Selling Items
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {topItems.map(([name, rev], i) => (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: ".72rem", fontWeight: 600, color: T.text }}>
                            <span style={{ color: T.textLight, marginRight: 6 }}>#{i + 1}</span>{name}
                          </span>
                          <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#16a34a" }}>₹{rev.toLocaleString("en-IN")}</span>
                        </div>
                        <MiniBar pct={(rev / maxItemRev) * 100} color={["#1d4ed8","#7c3aed","#16a34a","#ca8a04","#dc2626"][i]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order status breakdown */}
              {vendorOrders.length > 0 && (() => {
                const statusGroups = {};
                vendorOrders.forEach(o => { statusGroups[o.status] = (statusGroups[o.status] || 0) + 1; });
                const statusColors = { Delivered: "#16a34a", Preparing: "#ca8a04", Pending: "#1d4ed8", Cancelled: "#dc2626" };
                return (
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                    <p style={{ fontWeight: 700, fontSize: ".8rem", color: T.text, marginBottom: 12 }}>
                      <i className="ti ti-chart-donut" style={{ color: "#7c3aed", marginRight: 6 }} />Order Status Breakdown
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(statusGroups).map(([status, count]) => (
                        <div key={status} style={{
                          flex: "1 1 calc(50% - 4px)", minWidth: 110,
                          background: `${statusColors[status] || "#64748b"}10`,
                          border: `1px solid ${statusColors[status] || "#64748b"}30`,
                          borderRadius: 10, padding: "10px 12px",
                        }}>
                          <p style={{ fontSize: "1.3rem", fontWeight: 800, color: statusColors[status] || "#64748b", margin: 0 }}>{count}</p>
                          <p style={{ fontSize: ".65rem", color: T.textSub, margin: 0, fontWeight: 600 }}>{status}</p>
                          <MiniBar pct={(count / vendorOrders.length) * 100} color={statusColors[status] || "#64748b"} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Vendor profile info */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px" }}>
                <p style={{ fontWeight: 700, fontSize: ".8rem", color: T.text, marginBottom: 10 }}>
                  <i className="ti ti-id-badge" style={{ color: "#1d4ed8", marginRight: 6 }} />Vendor Profile
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["Phone", vendor.phone, "ti ti-phone"],
                    ["Email", vendor.email || "—", "ti ti-mail"],
                    ["Joined", vendor.createdAt, "ti ti-calendar"],
                    ["Status", vendor.status, "ti ti-circle-check"],
                  ].map(([label, val, icon]) => (
                    <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 2 }}>
                        <i className={icon} style={{ fontSize: 11, color: T.textSub }} />
                        <span style={{ fontSize: ".58rem", fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".3px" }}>{label}</span>
                      </div>
                      <p style={{ fontSize: ".78rem", fontWeight: 600, color: T.text, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {vendorOrders.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: T.textLight, fontSize: ".78rem" }}>
                  <i className="ti ti-package-off" style={{ fontSize: 32, display: "block", marginBottom: 8 }} />
                  No orders yet for this vendor's train
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {innerTab === "orders" && (
            <div>
              {vendorOrders.length === 0
                ? <p style={{ textAlign: "center", color: T.textLight, padding: "2rem", fontSize: ".78rem" }}>No orders for train {vendor.assignedTrain}</p>
                : vendorOrders.map(o => (
                  <div key={o.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", marginBottom: 10, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: T.primary, fontSize: ".74rem" }}>{o.id}</span>
                      <Badge label={o.status} />
                    </div>
                    <p style={{ fontWeight: 600, fontSize: ".82rem", color: T.text, margin: "0 0 2px" }}>{o.passengerName}</p>
                    <p style={{ fontSize: ".65rem", color: T.textSub, margin: "0 0 8px" }}>Coach {o.coach} · Seat {o.seat} · {o.payment} · {o.time}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: ".68rem", color: T.textMid }}>{o.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</span>
                      <span style={{ fontWeight: 800, color: "#16a34a", fontSize: ".9rem" }}>₹{o.total}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* COMPLAINTS */}
          {innerTab === "complaints" && (
            <div>
              {vendorComplaints.length === 0
                ? <p style={{ textAlign: "center", color: T.textLight, padding: "2rem", fontSize: ".78rem" }}>No complaints for this vendor's train</p>
                : vendorComplaints.map(c => (
                  <div key={c.id} className="complaint-row fade-up" style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: ".83rem", color: T.text, margin: 0 }}>{c.passengerName}</p>
                        <p style={{ fontSize: ".65rem", color: T.textLight, margin: 0 }}>Coach {c.coach} · Seat {c.seat} · {c.time}</p>
                      </div>
                      <Badge label={c.status} />
                    </div>
                    <p style={{ fontSize: ".76rem", color: T.textMid, marginBottom: c.status === "Open" ? 8 : 0 }}>{c.issue}</p>
                    {c.status === "Open" && (
                      <button className="btn-primary" style={{ padding: "4px 12px", fontSize: ".68rem" }}
                        onClick={() => actions.resolveComplaint(c.id)}>
                        <i className="ti ti-check" /> Mark Resolved
                      </button>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {/* FEEDBACK */}
          {innerTab === "feedback" && (
            <div>
              {/* Avg rating summary */}
              {vendorFeedback.length > 0 && (
                <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "1px solid #fde68a", borderRadius: 12, padding: "14px", marginBottom: 12, display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "2.2rem", fontWeight: 900, color: "#92400e", margin: 0, lineHeight: 1 }}>{avgRating}</p>
                    <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 4 }}>{stars(avgRating)}</div>
                    <p style={{ fontSize: ".6rem", color: "#a16207", margin: "4px 0 0", fontWeight: 600 }}>{vendorFeedback.length} reviews</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => {
                      const cnt = vendorFeedback.filter(f => f.rating === star).length;
                      return (
                        <div key={star} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: ".6rem", fontWeight: 700, color: "#a16207", width: 6 }}>{star}</span>
                          <i className="ti ti-star-filled" style={{ fontSize: 10, color: "#f59e0b" }} />
                          <div style={{ flex: 1, height: 5, borderRadius: 99, background: "#fde68a", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${vendorFeedback.length ? (cnt / vendorFeedback.length) * 100 : 0}%`, background: "#f59e0b", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: ".6rem", color: "#a16207", width: 14, textAlign: "right" }}>{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {vendorFeedback.length === 0
                ? <p style={{ textAlign: "center", color: T.textLight, padding: "2rem", fontSize: ".78rem" }}>No feedback for this vendor's train</p>
                : vendorFeedback.map(f => (
                  <div key={f.id} className="complaint-row fade-up" style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: ".83rem", color: T.text, margin: 0 }}>{f.passengerName}</p>
                        <p style={{ fontSize: ".65rem", color: T.textLight, margin: 0 }}>Coach {f.coach} · Seat {f.seat} · {f.time}</p>
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>{stars(f.rating)}</div>
                    </div>
                    <p style={{ fontSize: ".76rem", color: T.textMid, fontStyle: "italic", margin: 0 }}>"{f.message}"</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN COMMERCIAL DASHBOARD
══════════════════════════════════════════ */
export default function CommercialDashboard() {
  const vendors    = useStore((s) => s.vendors);
  const orders     = useStore((s) => s.orders);
  const complaints = useStore((s) => s.complaints);
  const feedback   = useStore((s) => s.feedback);

  const [tab,             setTab]             = useState("vendors");
  const [showAdd,         setShowAdd]         = useState(false);
  const [toast,           setToast]           = useState("");
  const [showCredentials, setShowCredentials] = useState(null);
  const [selectedVendor,  setSelectedVendor]  = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  /* ── Global Revenue Analytics ── */
  const deliveredOrders  = orders.filter(o => o.status === "Delivered");
  const totalRev         = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const pendingRev       = orders.filter(o => o.status === "Pending" || o.status === "Preparing").reduce((s, o) => s + o.total, 0);
  const openComplaints   = complaints.filter(c => c.status === "Open").length;
  const activeVendors    = vendors.filter(v => v.status === "Active").length;

  /* Per-vendor revenue (derived from orders by matching trainNo) */
  const vendorRevMap = useMemo(() => {
    const m = {};
    orders.filter(o => o.status === "Delivered").forEach(o => {
      const v = vendors.find(v => v.assignedTrain === o.trainNo);
      if (v) m[v.id] = (m[v.id] || 0) + o.total;
    });
    return m;
  }, [orders, vendors]);

  const maxVendorRev = Math.max(...Object.values(vendorRevMap), 1);

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={i < n ? "ti ti-star-filled" : "ti ti-star"}
      style={{ fontSize: 13, color: i < n ? "#f59e0b" : "#d1d5db" }} />
  ));

  return (
    <div className="inner-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Commercial Department</h1>
          <p className="page-sub">Railway Pantry · NGP Division</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 99, padding: "3px 10px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
            <span style={{ fontSize: ".62rem", fontWeight: 700, color: T.green }}>Live</span>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <i className="ti ti-user-plus" /> Add Vendor
          </button>
        </div>
      </div>

      {toast && <div className="toast" style={{ animation: "fadeUp .3s ease" }}>{toast}</div>}

      {/* ── Stat Cards ── */}
      <div className="cards-grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        <StatCard icon="ti ti-users"           label="Active Vendors"    value={activeVendors}                                                          accent="blue"   />
        <StatCard icon="ti ti-currency-rupee"  label="Revenue (Earned)"  value={`₹${totalRev.toLocaleString("en-IN")}`}     sub="Delivered orders"     accent="green"  />
        <StatCard icon="ti ti-clock"           label="Revenue (Pending)" value={`₹${pendingRev.toLocaleString("en-IN")}`}   sub="In-progress orders"   accent="yellow" />
        <StatCard icon="ti ti-package"         label="Total Orders"      value={orders.length}                               sub={`${deliveredOrders.length} delivered`} accent="blue" />
        <StatCard icon="ti ti-alert-triangle"  label="Open Complaints"   value={openComplaints}                                                         accent={openComplaints > 0 ? "red" : "green"} />
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar">
        {[
          ["vendors",    "ti ti-users",          "Vendors"],
          ["orders",     "ti ti-package",         "Orders"],
          ["complaints", "ti ti-alert-triangle",  "Complaints", openComplaints],
          ["feedback",   "ti ti-star",            "Feedback"],
          ["revenue",    "ti ti-chart-bar",       "Revenue"],
        ].map(([id, icon, label, count]) => (
          <button key={id} className={`tab ${tab === id ? "tab-active" : ""}`} onClick={() => setTab(id)}>
            <i className={icon} style={{ fontSize: 15 }} /> {label}
            {count > 0 && <span className="tab-badge">{count}</span>}
          </button>
        ))}
      </div>

      {/* ══ VENDORS TAB ══ */}
      {tab === "vendors" && (
        <div className="section-card">
          <div className="section-head">
            <span className="section-title">Vendor Registry</span>
            <span className="count-pill">{vendors.length}</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Vendor ID</th><th>Name</th><th>Phone</th><th>Assigned Train</th>
                  <th>Revenue</th><th>Rating</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const vRev = vendorRevMap[v.id] || 0;
                  return (
                    <tr key={v.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedVendor(v)}
                    >
                      <td onClick={e => e.stopPropagation()}>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: T.primary }}>{v.id}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: T.text }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontSize: 13 }}>
                            <i className="ti ti-user" />
                          </div>
                          {v.name}
                        </div>
                      </td>
                      <td style={{ color: T.textSub }}>{v.phone}</td>
                      <td>
                        <div style={{ fontSize: ".75rem", fontWeight: 600, color: T.text }}>{v.assignedTrain}</div>
                        <div style={{ fontSize: ".65rem", color: T.textSub }}>{v.trainName}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#16a34a" }}>₹{vRev.toLocaleString("en-IN")}</span>
                        <MiniBar pct={(vRev / maxVendorRev) * 100} color="#16a34a" />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 1 }}>{stars(Math.round(v.rating))}</div>
                        <span style={{ fontSize: ".62rem", color: T.textSub }}>{v.rating || "—"}</span>
                      </td>
                      <td><Badge label={v.status} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-secondary" style={{ fontSize: ".65rem", padding: "3px 8px" }}
                            onClick={() => setShowCredentials(v)} title="View credentials">
                            <i className="ti ti-key" />
                          </button>
                          <button
                            onClick={() => { actions.toggleVendor(v.id); showToast(`${v.name} ${v.status === "Active" ? "suspended" : "activated"}`); }}
                            className={v.status === "Active" ? "btn-danger" : "btn-secondary"}
                            style={{ fontSize: ".65rem", padding: "3px 8px" }}>
                            {v.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: ".65rem", color: T.textSub, padding: ".5rem 1rem", borderTop: "1px solid #f1f5f9" }}>
            <i className="ti ti-hand-click" style={{ marginRight: 4 }} />Click any row to view vendor details and revenue breakdown
          </p>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {tab === "orders" && (
        <div className="section-card">
          <div className="section-head">
            <span className="section-title">All Orders</span>
            <span className="count-pill">{orders.length}</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Order ID</th><th>Train</th><th>Coach / Seat</th><th>Passenger</th><th>Items</th><th>Total</th><th>Payment</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: "monospace", fontWeight: 600, color: T.primary, fontSize: ".72rem" }}>{o.id}</span></td>
                    <td><span className="chip chip-blue">{o.trainNo}</span></td>
                    <td><span className="chip">{o.coach}-{o.seat}</span></td>
                    <td style={{ fontWeight: 500, color: T.text }}>{o.passengerName}</td>
                    <td style={{ fontSize: ".68rem", color: T.textSub, maxWidth: 140 }}>{o.items.map(i => `${i.name} ×${i.qty}`).join(", ")}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                    <td><span className="chip">{o.payment}</span></td>
                    <td style={{ fontSize: ".68rem", color: T.textLight }}>{o.time}</td>
                    <td><Badge label={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ COMPLAINTS TAB ══ */}
      {tab === "complaints" && (
        <div className="section-card">
          <div className="section-head">
            <span className="section-title">Passenger Complaints</span>
            <span className="count-pill">{openComplaints} open</span>
          </div>
          <div style={{ padding: ".85rem 1rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {complaints.map(c => (
              <div key={c.id} className="complaint-row fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".83rem", color: T.text }}>{c.passengerName}</p>
                    <p style={{ fontSize: ".65rem", color: T.textLight }}>Coach {c.coach} · Seat {c.seat} · Train {c.trainNo} · {c.time}</p>
                  </div>
                  <Badge label={c.status} />
                </div>
                <p style={{ fontSize: ".76rem", color: T.textMid, marginBottom: c.status === "Open" ? 8 : 0 }}>{c.issue}</p>
                {c.status === "Open" && (
                  <button className="btn-primary" style={{ padding: "4px 12px", fontSize: ".68rem" }}
                    onClick={() => { actions.resolveComplaint(c.id); showToast("Complaint resolved"); }}>
                    <i className="ti ti-check" /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
            {complaints.length === 0 && <p style={{ textAlign: "center", color: T.textLight, padding: "2rem" }}>No complaints</p>}
          </div>
        </div>
      )}

      {/* ══ FEEDBACK TAB ══ */}
      {tab === "feedback" && (
        <div className="section-card">
          <div className="section-head">
            <span className="section-title">Passenger Feedback</span>
            <span className="count-pill">{feedback.length}</span>
          </div>
          <div style={{ padding: ".85rem 1rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {feedback.map(f => (
              <div key={f.id} className="complaint-row fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: ".83rem", color: T.text }}>{f.passengerName}</p>
                    <p style={{ fontSize: ".65rem", color: T.textLight }}>Coach {f.coach} · Seat {f.seat} · {f.time}</p>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={i < f.rating ? "ti ti-star-filled" : "ti ti-star"}
                        style={{ fontSize: 14, color: i < f.rating ? "#f59e0b" : "#d1d5db" }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: ".76rem", color: T.textMid, fontStyle: "italic" }}>"{f.message}"</p>
              </div>
            ))}
            {feedback.length === 0 && <p style={{ textAlign: "center", color: T.textLight, padding: "2rem" }}>No feedback yet</p>}
          </div>
        </div>
      )}

      {/* ══ REVENUE TAB ══ */}
      {tab === "revenue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Gross Revenue", val: `₹${(totalRev + pendingRev).toLocaleString("en-IN")}`, sub: "All orders combined", color: "#1d4ed8", bg: "#eff6ff", icon: "ti ti-report-money" },
              { label: "Collected (Delivered)", val: `₹${totalRev.toLocaleString("en-IN")}`, sub: `${deliveredOrders.length} delivered orders`, color: "#16a34a", bg: "#f0fdf4", icon: "ti ti-circle-check" },
              { label: "Outstanding (Pending)", val: `₹${pendingRev.toLocaleString("en-IN")}`, sub: "In kitchen / in-transit", color: "#ca8a04", bg: "#fefce8", icon: "ti ti-clock" },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}22`, borderRadius: 14, padding: "16px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={c.icon} style={{ color: c.color, fontSize: 20 }} />
                </div>
                <div>
                  <p style={{ fontSize: ".6rem", color: T.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".3px", margin: 0 }}>{c.label}</p>
                  <p style={{ fontSize: "1.15rem", fontWeight: 900, color: c.color, margin: "2px 0" }}>{c.val}</p>
                  <p style={{ fontSize: ".6rem", color: T.textLight, margin: 0 }}>{c.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vendor-wise revenue leaderboard */}
          <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="section-head" style={{ padding: "14px 16px" }}>
              <span className="section-title"><i className="ti ti-trophy" style={{ color: "#ca8a04", marginRight: 6 }} />Vendor Revenue Leaderboard</span>
              <span className="count-pill">{vendors.length} vendors</span>
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              {vendors
                .map(v => ({ ...v, vRev: vendorRevMap[v.id] || 0 }))
                .sort((a, b) => b.vRev - a.vRev)
                .map((v, rank) => (
                  <div key={v.id}
                    onClick={() => { setSelectedVendor(v); setTab("vendors"); }}
                    style={{
                      display: "flex", gap: 12, alignItems: "center",
                      padding: "12px 12px", marginBottom: 8,
                      background: rank === 0 ? "linear-gradient(90deg,#fef9c3,#fefce8)" : "#f8fafc",
                      border: rank === 0 ? "1px solid #fde047" : "1px solid #e2e8f0",
                      borderRadius: 12, cursor: "pointer",
                      transition: "box-shadow .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.1)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: rank === 0 ? "#ca8a04" : rank === 1 ? "#94a3b8" : rank === 2 ? "#b45309" : "#e2e8f0",
                      color: rank < 3 ? "#fff" : T.textSub,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: ".8rem", flexShrink: 0,
                    }}>
                      {rank < 3 ? <i className="ti ti-trophy" /> : rank + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: ".82rem", color: T.text }}>{v.name}</span>
                          <span style={{ fontSize: ".65rem", color: T.textSub, marginLeft: 8 }}>Train {v.assignedTrain} · {v.trainName}</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: ".92rem", color: "#16a34a" }}>₹{v.vRev.toLocaleString("en-IN")}</span>
                      </div>
                      <MiniBar pct={(v.vRev / maxVendorRev) * 100} color={rank === 0 ? "#ca8a04" : "#1d4ed8"} />
                    </div>
                    <Badge label={v.status} />
                    <i className="ti ti-chevron-right" style={{ color: T.textSub, fontSize: 14 }} />
                  </div>
                ))
              }
            </div>
          </div>

          {/* Payment method breakdown */}
          {orders.length > 0 && (() => {
            const payMap = {};
            orders.filter(o => o.status === "Delivered").forEach(o => {
              payMap[o.payment] = (payMap[o.payment] || 0) + o.total;
            });
            return (
              <div className="section-card" style={{ padding: "14px 16px" }}>
                <p style={{ fontWeight: 700, fontSize: ".85rem", color: T.text, marginBottom: 12 }}>
                  <i className="ti ti-credit-card" style={{ color: "#7c3aed", marginRight: 6 }} />Revenue by Payment Method
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {Object.entries(payMap).map(([method, rev]) => (
                    <div key={method} style={{ flex: "1 1 140px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: "12px 14px" }}>
                      <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "#7c3aed", margin: 0 }}>₹{rev.toLocaleString("en-IN")}</p>
                      <p style={{ fontSize: ".68rem", color: T.textSub, margin: "2px 0 0", fontWeight: 600 }}>{method}</p>
                      <MiniBar pct={(rev / totalRev) * 100} color="#7c3aed" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} />}

      {showCredentials && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <span className="section-title"><i className="ti ti-key" style={{ marginRight: 6, color: T.primary }} />Vendor Credentials</span>
              <button className="close-btn" onClick={() => setShowCredentials(null)}><i className="ti ti-x" /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>{showCredentials.name}</p>
              <p style={{ fontSize: ".72rem", color: T.textSub, marginBottom: 16 }}>Train {showCredentials.assignedTrain} · {showCredentials.trainName}</p>
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "1rem" }}>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: ".6rem", fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Vendor ID</p>
                  <p style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: T.primary }}>{showCredentials.id}</p>
                </div>
                <div>
                  <p style={{ fontSize: ".6rem", fontWeight: 700, color: T.textSub, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Password</p>
                  <p style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: T.primary }}>{showCredentials.password}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowCredentials(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Vendor Detail Drawer ── */}
      {selectedVendor && (
        <VendorDetailPanel
          vendor={selectedVendor}
          orders={orders}
          complaints={complaints}
          feedback={feedback}
          onClose={() => setSelectedVendor(null)}
          onToggle={() => {
            actions.toggleVendor(selectedVendor.id);
            showToast(`${selectedVendor.name} ${selectedVendor.status === "Active" ? "suspended" : "activated"}`);
          }}
          onShowCreds={() => { setShowCredentials(selectedVendor); setSelectedVendor(null); }}
        />
      )}
    </div>
  );
}