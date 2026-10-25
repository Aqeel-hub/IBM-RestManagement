import { useState } from 'react';
import { getUser, clearSession } from './api';
import Login from './pages/Login.jsx';
import Waiter from './pages/Waiter.jsx';
import Biller from './pages/Biller.jsx';
import Admin from './pages/Admin.jsx';

const screens = { waiter: Waiter, biller: Biller, admin: Admin };

export default function App() {
  const [user, setUser] = useState(getUser());
  if (!user) return <Login onLogin={setUser} />;
  const Screen = screens[user.role];

  return (
    <>
      <header className="topbar">
        <strong className="brand">Restaurant Desk</strong>
        <span className="who">{user.name} · {user.role}</span>
        <button className="ghost" onClick={() => { clearSession(); setUser(null); }}>Log out</button>
      </header>
      <main><Screen /></main>
    </>
  );
}
