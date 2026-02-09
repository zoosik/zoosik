import { Outlet } from 'react-router-dom';
import BottomNav from '../componets/BottomNav';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
