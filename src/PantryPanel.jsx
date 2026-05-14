import { useState } from "react";
import { useStore, actions, genId, now, badgeClass, CATS, T } from "../shared/store";

const Badge = ({ label }) => <span className={`badge ${badgeClass(label)}`}>{label}</span>;

/* ── Login Screen ── */
function VendorLogin({ onLogin }) {
  const [vendorId, setVendorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = () => {
    if (!vendorId.trim() || !password.trim()) { setError("Please enter both Vendor ID and password"); return; }
    setLoading(true);
    setTimeout(() => {
      const ok = actions.vendorLogin(vendorId.trim().toUpperCase(), password.trim().toUpperCase());
      setLoading(false);
      if (!ok) setError("Invalid credentials or account suspended");
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28, color: "#fff" }}>
            <i className="ti ti-building-store" />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: T.text, marginBottom: 4 }}>Railway Pantry</h1>
          <p style={{ fontSize: ".78rem", color: T.textSub }}>Pantry Vendor Portal</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
          <h2 style={{ fontSize: ".9rem", fontWeight: 700, color: T.text, marginBottom: 1.5 + "rem" }}>Sign in to your account</h2>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 12px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <i className="ti ti-alert-circle" style={{ color: T.red, flexShrink: 0 }} />
              <span style={{ fontSize: ".74rem", color: T.red }}>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Vendor ID</label>
            <input
              className="field-input"
              placeholder="VND-XXXX"
              value={vendorId}
              onChange={(e) => { setVendorId(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ textTransform: "uppercase", fontFamily: "monospace", letterSpacing: 1 }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="field-input"
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                style={{ paddingRight: 40, textTransform: "uppercase", fontFamily: "monospace" }}
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textSub, fontSize: 18, display: "flex", alignItems: "center" }}
              >
                <i className={showPw ? "ti ti-eye-off" : "ti ti-eye"} />
              </button>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: ".7rem", fontSize: ".87rem" }}
          >
            {loading ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Signing in…</> : <><i className="ti ti-login" /> Sign In</>}
          </button>

          <div style={{ marginTop: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: ".65rem", color: T.textSub, lineHeight: 1.5 }}>
              <i className="ti ti-info-circle" style={{ marginRight: 5, color: T.textSub }} />
              Credentials are provided by the Railway Pantry commercial department. Contact your supervisor if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Menu Management ── */
function MenuManager({ vendor }) {
  const menus = useStore((s) => s.menus);
  const vendorMenu = menus[vendor.id] || [];
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const filtered = vendorMenu.filter((i) => filterCat === "All" || i.cat === filterCat);

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATS.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: "4px 12px", borderRadius: 99, border: `1.5px solid ${filterCat === c ? T.primary : "#e2e8f0"}`, background: filterCat === c ? "#eff6ff" : "#fff", color: filterCat === c ? T.primary : T.textSub, fontSize: ".7rem", fontWeight: 600, cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => { setEditItem(null); setShowAdd(true); }}>
          <i className="ti ti-plus" /> Add Item
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        {filtered.map((item) => (
          <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: item.veg ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-salad" style={{ color: item.veg ? T.green : T.red, fontSize: 18 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: ".85rem", color: T.text }}>{item.name}</span>
                <span style={{ fontSize: ".58rem", fontWeight: 700, padding: "1px 6px", background: "#f1f5f9", color: T.textSub, borderRadius: 4 }}>{item.cat}</span>
                {!item.available && <span className="badge b-red" style={{ fontSize: ".55rem", padding: "1px 6px" }}>Unavailable</span>}
              </div>
              <p style={{ fontSize: ".68rem", color: T.textSub }}>{item.desc}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontWeight: 700, fontSize: ".95rem", color: T.primary }}>₹{item.price}</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: ".65rem" }}
                onClick={() => { setEditItem(item); setShowAdd(true); }}>
                <i className="ti ti-edit" />
              </button>
              <button
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: ".65rem", color: item.available ? T.yellow : T.green }}
                onClick={() => { actions.updateMenuItem(vendor.id, item.id, { available: !item.available }); showToast(`${item.name} ${item.available ? "marked unavailable" : "marked available"}`); }}
              >
                <i className={item.available ? "ti ti-eye-off" : "ti ti-eye"} />
              </button>
              <button className="btn-danger" style={{ padding: "4px 8px", fontSize: ".65rem" }}
                onClick={() => { actions.deleteMenuItem(vendor.id, item.id); showToast("Item removed"); }}>
                <i className="ti ti-trash" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: T.textLight, background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
            <i className="ti ti-clipboard-x" style={{ fontSize: 32, display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: ".85rem" }}>No menu items yet. Add your first item.</p>
          </div>
        )}
      </div>

      {showAdd && <MenuItemModal vendor={vendor} item={editItem} onClose={() => { setShowAdd(false); setEditItem(null); }} onSave={(msg) => showToast(msg)} />}
    </div>
  );
}

function MenuItemModal({ vendor, item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price || "",
    cat: item?.cat || "Meal",
    veg: item?.veg ?? true,
    desc: item?.desc || "",
    available: item?.available ?? true,
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: "" })); };

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price required";
    if (!form.desc.trim()) e.desc = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }

    if (item) {
      actions.updateMenuItem(vendor.id, item.id, { ...form, price: Number(form.price) });
      onSave("Item updated");
    } else {
      actions.addMenuItem(vendor.id, { id: genId("M"), ...form, price: Number(form.price) });
      onSave("Item added to menu");
    }
    onClose();
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="section-title"><i className="ti ti-clipboard-list" style={{ marginRight: 6, color: T.primary }} />{item ? "Edit Item" : "Add Menu Item"}</span>
          <button className="close-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="field-label">Item Name *</label>
              <input className="field-input" placeholder="e.g. Veg Thali" value={form.name} onChange={set("name")} />
              {errors.name && <span style={{ fontSize: ".62rem", color: T.red, display: "block", marginTop: 3 }}>{errors.name}</span>}
            </div>
            <div>
              <label className="field-label">Price (₹) *</label>
              <input className="field-input" type="number" placeholder="120" value={form.price} onChange={set("price")} />
              {errors.price && <span style={{ fontSize: ".62rem", color: T.red, display: "block", marginTop: 3 }}>{errors.price}</span>}
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={form.cat} onChange={set("cat")}>
                {["Meal", "Snack", "Breakfast", "Beverage"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="field-label">Description *</label>
              <input className="field-input" placeholder="Brief description of the item" value={form.desc} onChange={set("desc")} />
              {errors.desc && <span style={{ fontSize: ".62rem", color: T.red, display: "block", marginTop: 3 }}>{errors.desc}</span>}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: ".8rem", fontWeight: 600, color: T.textMid }}>
              <input type="radio" name="veg" checked={form.veg === true} onChange={() => setForm((f) => ({ ...f, veg: true }))} />
              <span style={{ width: 12, height: 12, borderRadius: 3, border: "2px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {form.veg && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />}
              </span>
              Vegetarian
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: ".8rem", fontWeight: 600, color: T.textMid }}>
              <input type="radio" name="veg" checked={form.veg === false} onChange={() => setForm((f) => ({ ...f, veg: false }))} />
              <span style={{ width: 12, height: 12, borderRadius: 3, border: "2px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!form.veg && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />}
              </span>
              Non-Vegetarian
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}><i className="ti ti-check" /> {item ? "Save Changes" : "Add Item"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Orders Panel ── */
function OrdersPanel({ vendor }) {
  const allOrders = useStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.vendorId === vendor.id);
  const [tab, setTab] = useState("active");
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const visible = orders.filter((o) =>
    tab === "active" ? ["Pending", "Preparing"].includes(o.status) : o.status === "Delivered"
  );

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}
      <div className="tab-bar">
        {[["active", "Active", orders.filter((o) => ["Pending", "Preparing"].includes(o.status)).length], ["done", "Delivered", 0]].map(([id, label, count]) => (
          <button key={id} className={`tab ${tab === id ? "tab-active" : ""}`} onClick={() => setTab(id)}>
            {label} {count > 0 && <span className="tab-badge">{count}</span>}
          </button>
        ))}
      </div>
      <div className="order-grid">
        {visible.map((o) => (
          <div key={o.id} className="order-card" style={{ borderLeftColor: o.status === "Pending" ? T.yellow : T.primary }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ fontFamily: "monospace", fontWeight: 600, color: T.primary, fontSize: ".72rem" }}>{o.id}</p>
                <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                  <span className="chip chip-blue">{o.coach}</span>
                  <span className="chip">Seat {o.seat}</span>
                  <span className="chip">{o.payment}</span>
                </div>
                <p style={{ fontSize: ".65rem", color: T.textLight, marginTop: 4 }}>{o.passengerName} · {o.time}</p>
              </div>
              <Badge label={o.status} />
            </div>
            <p style={{ fontSize: ".72rem", color: T.textSub, marginBottom: 8 }}>{o.items.map((i) => `${i.name} ×${i.qty}`).join(" · ")}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: ".9rem", color: T.text }}>₹{o.total}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {o.status === "Pending" && (
                  <button className="btn-primary" style={{ fontSize: ".68rem", padding: "4px 10px" }} onClick={() => { actions.updateOrder(o.id, { status: "Preparing" }); showToast("Order moved to Preparing"); }}>
                    <i className="ti ti-chef-hat" /> Start
                  </button>
                )}
                {o.status === "Preparing" && (
                  <button className="btn-primary" style={{ fontSize: ".68rem", padding: "4px 10px" }} onClick={() => { actions.updateOrder(o.id, { status: "Delivered" }); showToast("Order marked delivered"); }}>
                    <i className="ti ti-check" /> Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: T.textLight }}>
            <i className="ti ti-package-off" style={{ fontSize: 32, display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: ".85rem" }}>No orders here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Root Vendor Panel ── */
export default function PantryPanel() {
  const currentVendor = useStore((s) => s.currentVendor);
  const [activeTab, setActiveTab] = useState("orders");

  if (!currentVendor) return <VendorLogin />;

  const pendingOrders = useStore((s) => s.orders.filter((o) => o.vendorId === currentVendor.id && ["Pending", "Preparing"].includes(o.status)).length);

  return (
    <div className="inner-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pantry Panel</h1>
          <p className="page-sub">{currentVendor.name} · Train {currentVendor.assignedTrain} — {currentVendor.trainName}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 99, padding: "3px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
            <span style={{ fontSize: ".62rem", fontWeight: 700, color: T.green }}>On Duty</span>
          </div>
          <button className="btn-secondary" onClick={actions.vendorLogout} style={{ fontSize: ".72rem" }}>
            <i className="ti ti-logout" /> Sign Out
          </button>
        </div>
      </div>

      <div className="tab-bar">
        {[["orders", "ti ti-package", "Orders", pendingOrders], ["menu", "ti ti-clipboard-list", "Menu", 0]].map(([id, icon, label, count]) => (
          <button key={id} className={`tab ${activeTab === id ? "tab-active" : ""}`} onClick={() => setActiveTab(id)}>
            <i className={icon} style={{ fontSize: 15 }} /> {label}
            {count > 0 && <span className="tab-badge">{count}</span>}
          </button>
        ))}
      </div>

      {activeTab === "orders" && <OrdersPanel vendor={currentVendor} />}
      {activeTab === "menu" && <MenuManager vendor={currentVendor} />}
    </div>
  );
}