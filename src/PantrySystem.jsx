import { useStore, GLOBAL_STYLES } from "./store";
import AdminDashboard from "./AdminDashboard";
import VendorPanel from "./VendorPanel";
import PassengerApp from "./PassengerApp";
import { useState } from "react";
import logo from './assets/logo.png';

export default function PantrySystem() {
  const [view, setView] = useState('passenger');
  const complaints = useStore(s => s.complaints);
  const open = complaints.filter(c => c.status === 'Open').length;

  const navItems = [
    { id:'admin',     label:'Admin',  icon:'🖥️' },
    { id:'vendor',    label:'Vendor', icon:'👤' },
    { id:'passenger', label:'PassengerApp',  icon:'📱' },
  ];

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLES}</style>

      <nav className="top-nav">
        <div className="nav-brand">
          <img
            src={logo}
            alt="Railway Logo"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              marginRight: '10px'
            }}
          />
          
          <div>
            <p className="brand-name">Indian Railway Pantry System</p>
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