// import PantrySystem from './PantrySystem';
// function App() { return <PantrySystem />; }
// export default App;




// import { Routes, Route, Navigate } from 'react-router-dom';
// import PantrySystem from './PantrySystem';
// import AdminDashboard from './AdminDashboard';
// import VendorPanel from './VendorPanel';
// import PassengerApp from './PassengerApp';

// export default function App() {
//   return (
//     <Routes>
//       <Route element={<PantrySystem />}>
//         <Route path="/app" element={<PassengerApp prefillTrain="12139" />} />
//         <Route path="/app/admin" element={<AdminDashboard />} />
//         <Route path="/app/vendor" element={<VendorPanel />} />
//       </Route>
//       <Route path="/" element={<Navigate to="/app" replace />} />
//     </Routes>
//   );
// }










import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import PantrySystem from './PantrySystem';
import AdminDashboard from './AdminDashboard';
import VendorPanel from './VendorPanel';
import PassengerApp from './PassengerApp';
import VendorLogin from './VendorLogin';
import AdminLogin from './AdminLogin';


function PassengerRoute() {
  const [searchParams] = useSearchParams();
  const train = searchParams.get('train') || '12139';
  return <PassengerApp prefillTrain={train} />;
}


export default function App() {
  return (
    <Routes>
      <Route element={<PantrySystem />}>
        {/* <Route path="/app"        element={<PassengerApp prefillTrain="12139" />} /> */}
        <Route path="/app" element={<PassengerRoute />} />
        <Route path="/app/admin" element={
          <AdminLogin>
            {(admin, logout) => <AdminDashboard admin={admin} onLogout={logout} />}
          </AdminLogin>
        } />
        <Route path="/app/vendor" element={
          <VendorLogin>
            {(vendor, logout) => <VendorPanel vendor={vendor} onLogout={logout} />}
          </VendorLogin>
        } />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}