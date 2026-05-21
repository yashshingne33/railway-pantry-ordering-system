import { useStore, GLOBAL_STYLES } from "./store";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from './assets/logo.png';

export default function PantrySystem() {
  const complaints = useStore(s => s.complaints);
  const open = complaints.filter(c => c.status === 'Open').length;
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'admin',     path: '/app/admin',  label: 'Admin',      icon: '🖥️' },
    { id: 'vendor',    path: '/app/vendor', label: 'Vendor',     icon: '👤' },
    { id: 'passenger', path: '/app',        label: 'PassengerApp', icon: '📱' },
  ];

  const isPassenger = location.pathname === '/app';

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLES}</style>

      <nav className="top-nav">
        <div className="nav-brand">
          <img
            src={logo}
            alt="Railway Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain', marginRight: '10px' }}
          />
          <div>
            <p className="brand-name">Indian Railway Pantry System</p>
            <p className="brand-sub">NGP Division</p>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map(n => (
            <button
              key={n.id}
              className={`nav-link ${location.pathname === n.path ? 'nav-link-active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              <span className="nav-link-icon">{n.icon}</span>
              <span className="nav-link-text">{n.label}</span>
              {n.id === 'admin' && open > 0 && <span className="nav-notif">{open}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className={`main-content ${isPassenger ? 'main-passenger' : ''}`}>
        {isPassenger ? (
          <div className="passenger-shell">
            <Outlet />
          </div>
        ) : (
          <div className="inner-content">
            <Outlet />
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {navItems.map(n => (
          <button
            key={n.id}
            className={`bottom-tab ${location.pathname === n.path ? 'bottom-tab-active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            <span className="bottom-tab-icon">{n.icon}</span>
            <span className="bottom-tab-label">{n.label}</span>
            {n.id === 'admin' && open > 0 && (
              <span className="nav-notif" style={{ position: 'absolute', top: 4, right: 'calc(50% - 14px)' }}>{open}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}


//when we need url based routing, we can wrap the app in pantry system and use outlet to render the child components. for now we can just render the passenger app directly.

// import { useStore, GLOBAL_STYLES } from "./store";
// import { Outlet, useLocation } from "react-router-dom";
// import logo from './assets/logo.png';

// export default function PantrySystem() {
//   const complaints = useStore(s => s.complaints);
//   const open = complaints.filter(c => c.status === 'Open').length;
//   const location = useLocation();
//   const isPassenger = location.pathname === '/app';

//   return (
//     <div className="app-root">
//       <style>{GLOBAL_STYLES}</style>

//       <main className={`main-content ${isPassenger ? 'main-passenger' : ''}`}>
//         {isPassenger ? (
//           <div className="passenger-shell">
//             <Outlet />
//           </div>
//         ) : (
//           <div className="inner-content">
//             <Outlet />
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }