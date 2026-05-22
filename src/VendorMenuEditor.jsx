/**
 * VendorMenuEditor.jsx
 * Image upload replaces emoji — compressed to ~12KB thumbnail, stored as
 * base64 in Firestore item.image.  Falls back to item.emoji or 🍽️.
 */
import { useState, useEffect, useRef } from "react";
import { onSnapshot, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./store";

const CATS       = ["Meal", "Breakfast", "Snack", "Beverage"];
const BLANK_FORM = { name:"", image:null, price:"", cat:"Meal", desc:"", veg:true, popular:false };

const nowStr = () => {
  const d = new Date();
  return `${d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}, ${d.getDate().toString().padStart(2,"0")} ${d.toLocaleString("en-IN",{month:"short"})}`;
};

/* ── Compress uploaded image to 120×120 JPEG base64 (~12 KB) ─────────────── */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = 120;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        // Cover-crop: center the image
        const side = Math.min(img.width, img.height);
        const sx   = (img.width  - side) / 2;
        const sy   = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 120, 120);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Image uploader sub-component ────────────────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const inputRef   = useRef();
  const [drag, setDrag] = useState(false);

  const handle = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const b64 = await compressImage(file);
    onChange(b64);
  };

  return (
    <div>
      <label style={lbl}>Item Photo</label>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${drag ? "#1d4ed8" : "#cbd5e1"}`,
          borderRadius: 12,
          background: drag ? "#eff6ff" : "#f8fafc",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: value ? 8 : "20px 16px",
          transition: "all 0.15s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {value ? (
          /* Preview */
          <div style={{ position:"relative", display:"inline-block" }}>
            <img
              src={value}
              alt="preview"
              style={{ width:90, height:90, objectFit:"cover", borderRadius:10, display:"block", border:"1px solid #e2e8f0" }}
            />
            <button
              onClick={e => { e.stopPropagation(); onChange(null); }}
              style={{
                position:"absolute", top:-6, right:-6,
                width:22, height:22, borderRadius:"50%",
                background:"#dc2626", color:"#fff",
                border:"none", cursor:"pointer",
                fontSize:"0.7rem", fontWeight:800,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
              }}
            >✕</button>
            <div style={{ marginTop:6, fontSize:"0.62rem", color:"#94a3b8", textAlign:"center" }}>Click to change</div>
          </div>
        ) : (
          /* Upload prompt */
          <>
            <div style={{ fontSize:"2rem" }}>📷</div>
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Click or drag to upload</div>
            <div style={{ fontSize:"0.62rem", color:"#94a3b8" }}>JPG, PNG, WebP — auto-cropped to square</div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={e => handle(e.target.files[0])}
      />
    </div>
  );
}

/* ── Item thumbnail — used in the list ───────────────────────────────────── */
export function ItemThumb({ item, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      flexShrink: 0, overflow: "hidden",
      background: "linear-gradient(135deg,#fff7ed,#fef9c3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, border: "1px solid #f1f5f9",
    }}>
      {item.image
        ? <img src={item.image} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        : (item.emoji || "🍽️")}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function VendorMenuEditor({ vendor }) {
  const trainNo = vendor?.trainNo || vendor?.train;

  const [items,      setItems]      = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [menuMeta,   setMenuMeta]   = useState(null);
  const [dirty,      setDirty]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState(BLANK_FORM);
  const [formErr,    setFormErr]    = useState({});

  /* Real-time listener */
  useEffect(() => {
    if (!trainNo) return;
    const unsub = onSnapshot(doc(db, "trainMenus", trainNo), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setMenuMeta(data);
        setItems(data.items || []);
        setSavedItems(data.items || []);
        setDirty(false);
      } else {
        setMenuMeta(null); setItems([]); setSavedItems([]);
      }
    });
    return unsub;
  }, [trainNo]);

  useEffect(() => {
    setDirty(JSON.stringify(items) !== JSON.stringify(savedItems));
  }, [items, savedItems]);

  /* Save */
  const saveMenu = async () => {
    if (!trainNo) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "trainMenus", trainNo), {
        trainNo,
        trainName:      vendor?.trainName || menuMeta?.trainName || "",
        vendorId:       vendor?.id,
        vendorName:     vendor?.name,
        active:         menuMeta?.active !== false,
        items,
        lastUpdatedStr: nowStr(),
        _updatedAt:     serverTimestamp(),
      }, { merge: true });
      setSaved(true); setDirty(false); setSavedItems(items);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleAvail = idx =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, available: it.available === false } : it));

  const deleteItem = idx =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const moveUp = idx => {
    if (idx === 0) return;
    setItems(prev => { const n=[...prev]; [n[idx-1],n[idx]]=[n[idx],n[idx-1]]; return n; });
  };
  const moveDown = idx => {
    setItems(prev => {
      if (idx === prev.length-1) return prev;
      const n=[...prev]; [n[idx],n[idx+1]]=[n[idx+1],n[idx]]; return n;
    });
  };

  const addItem = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = "Valid price required";
    if (!form.image)        errs.image = "Please upload a photo";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setItems(prev => [...prev, {
      id:        String(Date.now()),
      name:      form.name.trim(),
      image:     form.image,
      price:     Number(form.price),
      cat:       form.cat,
      desc:      form.desc.trim(),
      veg:       form.veg,
      popular:   form.popular,
      available: true,
    }]);
    setForm(BLANK_FORM); setFormErr({}); setShowAdd(false);
  };

  const avail   = items.filter(i => i.available !== false).length;
  const unavail = items.filter(i => i.available === false).length;

  /* ── Render ── */
  return (
    <div style={{ fontFamily:"'Segoe UI',sans-serif", padding:"16px 20px", maxWidth:940, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ margin:0, fontSize:"1.05rem", fontWeight:800, color:"#0f172a", display:"flex", alignItems:"center", gap:8 }}>
            📋 Daily Menu
            {menuMeta?.active === false && (
              <span style={{ fontSize:"0.6rem", background:"#fee2e2", color:"#dc2626", padding:"2px 8px", borderRadius:4, fontWeight:700, border:"1px solid #fecaca" }}>
                INACTIVE — Admin disabled
              </span>
            )}
          </h2>
          <p style={{ margin:"4px 0 0", fontSize:"0.72rem", color:"#64748b" }}>
            🚂 Train {trainNo}{vendor?.trainName ? ` · ${vendor.trainName}` : ""} · {items.length} item{items.length!==1?"s":""}
            {menuMeta?.lastUpdatedStr && <span style={{ color:"#94a3b8" }}> · Updated {menuMeta.lastUpdatedStr}</span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {dirty && !saving && (
            <span style={{ fontSize:"0.62rem", color:"#f59e0b", fontWeight:700, background:"#fef3c7", padding:"3px 9px", borderRadius:6, border:"1px solid #fde68a" }}>● Unsaved changes</span>
          )}
          {saved && (
            <span style={{ fontSize:"0.62rem", color:"#16a34a", fontWeight:700, background:"#d1fae5", padding:"3px 9px", borderRadius:6, border:"1px solid #6ee7b7" }}>✓ Saved & live!</span>
          )}
          <button onClick={() => { setForm(BLANK_FORM); setFormErr({}); setShowAdd(true); }}
            style={{ padding:"7px 14px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, fontSize:"0.78rem", fontWeight:700, cursor:"pointer", color:"#334155" }}>
            + Add Item
          </button>
          <button onClick={saveMenu} disabled={saving || !dirty}
            style={{ padding:"7px 16px", border:"none", borderRadius:8, fontSize:"0.78rem", fontWeight:700,
              cursor: saving||!dirty ? "not-allowed" : "pointer",
              background: saving||!dirty ? "#e2e8f0" : "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
              color: saving||!dirty ? "#94a3b8" : "#fff" }}>
            {saving ? "💾 Saving…" : "💾 Save Menu"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          {[
            { label:"Total",   value:items.length,                     color:"#1d4ed8", bg:"#eff6ff" },
            { label:"Available",value:avail,                           color:"#16a34a", bg:"#f0fdf4" },
            { label:"Hidden",  value:unavail,                          color:"#dc2626", bg:"#fef2f2" },
            { label:"Veg",     value:items.filter(i=>i.veg).length,    color:"#16a34a", bg:"#f0fdf4" },
            { label:"Popular", value:items.filter(i=>i.popular).length,color:"#d97706", bg:"#fefce8" },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg, borderRadius:8, padding:"8px 14px", minWidth:64 }}>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"0.58rem", color:"#64748b", fontWeight:600, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !showAdd && (
        <div style={{ textAlign:"center", padding:"4rem 2rem", background:"#fff", borderRadius:14, border:"1px dashed #e2e8f0" }}>
          <p style={{ fontSize:"3rem", margin:"0 0 12px" }}>🍽️</p>
          <p style={{ fontWeight:800, fontSize:"1rem", color:"#0f172a", margin:"0 0 6px" }}>No menu items yet</p>
          <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:"0 0 20px" }}>
            Add items with photos — passengers see them live when scanning the QR
          </p>
          <button onClick={() => setShowAdd(true)}
            style={{ padding:"10px 24px", background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:"0.82rem" }}>
            + Add First Item
          </button>
        </div>
      )}

      {/* Item list grouped by category */}
      {items.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {CATS.filter(cat => items.some(i => i.cat === cat)).map(cat => (
            <div key={cat} style={{ marginBottom:10 }}>
              <div style={{ fontSize:"0.6rem", fontWeight:800, color:"#94a3b8", letterSpacing:"1.5px", marginBottom:6, paddingLeft:2 }}>
                {cat.toUpperCase()} · {items.filter(i=>i.cat===cat).length} items
              </div>
              {items.map((item, idx) => item.cat !== cat ? null : (
                <div key={item.id||idx} style={{
                  background:"#fff", borderRadius:10, padding:"10px 14px",
                  border:`1px solid ${item.available===false?"#fecaca":"#e2e8f0"}`,
                  borderLeft:`3px solid ${item.available===false?"#fca5a5":item.veg?"#4ade80":"#f87171"}`,
                  display:"flex", alignItems:"center", gap:12, marginBottom:6,
                  opacity:item.available===false?0.6:1, transition:"all 0.15s",
                }}>
                  {/* Thumbnail */}
                  <ItemThumb item={item} size={52} />

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#0f172a", textDecoration:item.available===false?"line-through":"none" }}>{item.name}</span>
                      {item.popular && <span style={{ fontSize:"0.55rem", background:"#fef3c7", color:"#d97706", padding:"1px 5px", borderRadius:4, fontWeight:800 }}>🔥 HOT</span>}
                      <span style={{ fontSize:"0.58rem", fontWeight:700, padding:"1px 6px", borderRadius:4,
                        background:item.veg?"#f0fdf4":"#fff1f2", color:item.veg?"#16a34a":"#be123c",
                        border:`1px solid ${item.veg?"#bbf7d0":"#fecdd3"}` }}>
                        {item.veg?"VEG":"NON-VEG"}
                      </span>
                      {item.available===false && (
                        <span style={{ fontSize:"0.58rem", background:"#fee2e2", color:"#dc2626", padding:"1px 6px", borderRadius:4, fontWeight:700, border:"1px solid #fecaca" }}>HIDDEN</span>
                      )}
                    </div>
                    {item.desc && <div style={{ fontSize:"0.68rem", color:"#94a3b8", marginTop:2, lineHeight:1.4 }}>{item.desc}</div>}
                    <div style={{ fontSize:"0.92rem", fontWeight:800, color:"#1d4ed8", marginTop:3 }}>₹{item.price}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                    <button onClick={() => moveUp(idx)}   style={iconBtn} title="Up">↑</button>
                    <button onClick={() => moveDown(idx)} style={iconBtn} title="Down">↓</button>
<button onClick={() => toggleAvail(idx)}
  style={{
    padding:'4px 8px', borderRadius:6, cursor:'pointer', fontWeight:700,
    fontSize:'0.65rem', border:'1px solid', minWidth:62,
    background:  item.available===false ? "#d1fae5" : "#fee2e2",
    color:       item.available===false ? "#16a34a" : "#dc2626",
    borderColor: item.available===false ? "#6ee7b7" : "#fecaca",
  }}
  title={item.available===false ? "Enable item" : "Disable item"}>
  {item.available===false ? "✓ Enable" : "✕ Disable"}
</button>
                    <button onClick={() => deleteItem(idx)}
                      style={{ ...iconBtn, background:"#fef2f2", color:"#dc2626", borderColor:"#fecaca" }}
                      title="Delete">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div style={{ marginTop:14, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"10px 14px", fontSize:"0.7rem", color:"#1e40af", lineHeight:1.5 }}>
          💡 <strong>✕</strong> hides an item from passengers without deleting it. Hit <strong>💾 Save Menu</strong> to push changes live.
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {showAdd && (
        <div onClick={() => { setShowAdd(false); setFormErr({}); }}
          style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:480, boxShadow:"0 20px 60px rgba(0,0,0,0.22)", display:"flex", flexDirection:"column", maxHeight:"92vh" }}>

            {/* Modal header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #e2e8f0", flexShrink:0 }}>
              <span style={{ fontWeight:700, fontSize:"1rem", color:"#0f172a" }}>Add Menu Item</span>
              <button onClick={() => { setShowAdd(false); setFormErr({}); }}
                style={{ background:"#f1f5f9", border:"none", borderRadius:6, width:28, height:28, cursor:"pointer", fontWeight:700, color:"#475569" }}>✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", flex:1 }}>

              {/* Image upload */}
              <div>
                <ImageUploader value={form.image} onChange={img => { setForm(f=>({...f,image:img})); setFormErr(e=>({...e,image:null})); }}/>
                {formErr.image && <span style={errTxt}>{formErr.image}</span>}
              </div>

              {/* Name + Price */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={lbl}>Item Name *</label>
                  <input style={{ ...inp, ...(formErr.name?errInp:{}) }} placeholder="e.g. Veg Thali"
                    value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} autoFocus/>
                  {formErr.name && <span style={errTxt}>{formErr.name}</span>}
                </div>
                <div>
                  <label style={lbl}>Price (₹) *</label>
                  <input style={{ ...inp, ...(formErr.price?errInp:{}) }} type="number" min={1} placeholder="e.g. 120"
                    value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))}/>
                  {formErr.price && <span style={errTxt}>{formErr.price}</span>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={lbl}>Category</label>
                <div style={{ display:"flex", gap:6 }}>
                  {CATS.map(c => (
                    <button key={c} onClick={() => setForm(f=>({...f,cat:c}))}
                      style={{ flex:1, padding:"7px 4px", borderRadius:7, border:`1.5px solid ${form.cat===c?"#1d4ed8":"#e2e8f0"}`, background:form.cat===c?"#eff6ff":"#fff", color:form.cat===c?"#1d4ed8":"#475569", fontSize:"0.72rem", fontWeight:700, cursor:"pointer" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>Description <span style={{ color:"#94a3b8", fontWeight:400, textTransform:"none" }}>(optional)</span></label>
                <input style={inp} placeholder="e.g. Dal, sabzi, roti, rice & pickle"
                  value={form.desc} onChange={e => setForm(f=>({...f,desc:e.target.value}))}/>
              </div>

              {/* Veg / Popular */}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setForm(f=>({...f,veg:!f.veg}))}
                  style={{ flex:1, padding:"9px", borderRadius:8, border:`1.5px solid ${form.veg?"#16a34a":"#be123c"}`, background:form.veg?"#f0fdf4":"#fff1f2", color:form.veg?"#16a34a":"#be123c", fontWeight:700, cursor:"pointer", fontSize:"0.78rem" }}>
                  {form.veg?"🟢 Vegetarian":"🔴 Non-Vegetarian"}
                </button>
                <button onClick={() => setForm(f=>({...f,popular:!f.popular}))}
                  style={{ flex:1, padding:"9px", borderRadius:8, border:`1.5px solid ${form.popular?"#d97706":"#e2e8f0"}`, background:form.popular?"#fef3c7":"#fff", color:form.popular?"#d97706":"#64748b", fontWeight:700, cursor:"pointer", fontSize:"0.78rem" }}>
                  {form.popular?"🔥 Popular":"☆ Mark Popular"}
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding:"12px 18px", borderTop:"1px solid #e2e8f0", flexShrink:0 }}>
              <button onClick={addItem}
                style={{ width:"100%", padding:"11px", background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>
                ✅ Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl    = { display:"block", fontSize:"0.65rem", fontWeight:700, color:"#374151", letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:5 };
const inp    = { width:"100%", padding:"9px 11px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:"0.83rem", color:"#0f172a", outline:"none", boxSizing:"border-box", fontFamily:"sans-serif", transition:"border-color 0.15s" };
const errInp = { borderColor:"#fca5a5", background:"#fff5f5" };
const errTxt = { fontSize:"0.62rem", color:"#dc2626", marginTop:3, display:"block" };
const iconBtn = { padding:"4px 8px", borderRadius:6, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#475569", cursor:"pointer", fontSize:"0.72rem", fontWeight:700 };