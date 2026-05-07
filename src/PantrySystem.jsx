import { useStore, GLOBAL_STYLES } from "./store";
import AdminDashboard from "./AdminDashboard";
import VendorPanel from "./VendorPanel";
import AgentPanel from "./AgentPanel";
import PassengerApp from "./PassengerApp";
import { useState } from "react";

export default function PantrySystem() {
  const [view, setView] = useState('passenger');
  const complaints = useStore(s => s.complaints);
  const open = complaints.filter(c => c.status === 'Open').length;

  const navItems = [
    { id:'admin',     label:'Admin',  icon:'🖥️' },
    { id:'vendor',    label:'Vendor', icon:'👤' },
    { id:'agent',     label:'Agent',  icon:'🚶' },
    { id:'passenger', label:'Order',  icon:'📱' },
  ];

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLES}</style>

      <nav className="top-nav">
        <div className="nav-brand">
          <span style={{fontSize:'1.3rem'}}>🚂</span>
          <div>
            <p className="brand-name">IRCTC Pantry System</p>
            <p className="brand-sub">NGP Division</p>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
            <button key={n.id} className={`nav-link ${view===n.id?'nav-link-active':''}`} onClick={()=>setView(n.id)}>
              <span className="nav-link-icon">{n.icon}</span>
              <span className="nav-link-text">{n.label}</span>
              {n.id==='admin' && open>0 && <span className="nav-notif">{open}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className={`main-content ${view==='passenger'?'main-passenger':''}`}>
        {view==='passenger' ? (
          <div className="passenger-shell">
            <PassengerApp prefillTrain="12139"/>
          </div>
        ) : (
          <div className="inner-content">
            {view==='admin'  && <AdminDashboard/>}
            {view==='vendor' && <VendorPanel/>}
            {view==='agent'  && <AgentPanel/>}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.id} className={`bottom-tab ${view===n.id?'bottom-tab-active':''}`} onClick={()=>setView(n.id)}>
            <span className="bottom-tab-icon">{n.icon}</span>
            <span className="bottom-tab-label">{n.label}</span>
            {n.id==='admin' && open>0 && <span className="nav-notif" style={{position:'absolute',top:4,right:'calc(50% - 14px)'}}>{open}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}