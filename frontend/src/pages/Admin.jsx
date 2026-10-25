import { useEffect, useState } from 'react';
import { api, money } from '../api';

const tabs = ['Reports', 'Menu', 'Tables', 'Staff'];

export default function Admin() {
  const [tab, setTab] = useState('Reports');
  return (
    <div className="stack">
      <nav className="tabs">
        {tabs.map((t) => <button key={t} className={t === tab ? 'active' : 'ghost'} onClick={() => setTab(t)}>{t}</button>)}
      </nav>
      {tab === 'Reports' && <Reports />}
      {tab === 'Menu' && <Menu />}
      {tab === 'Tables' && <Tables />}
      {tab === 'Staff' && <Staff />}
    </div>
  );
}

function Reports() {
  const [days, setDays] = useState(7);
  const [r, setR] = useState(null);
  useEffect(() => { api(`/reports/sales?days=${days}`).then(setR); }, [days]);
  if (!r) return <p className="muted">Loading…</p>;
  const max = Math.max(1, ...r.byDay.map((d) => d.revenue));

  return (
    <section className="panel">
      <div className="row">
        <h2>Sales</h2>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>Today</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option>
        </select>
      </div>
      <div className="stats">
        <div className="stat"><span>Revenue</span><b>{money(r.totals.revenue)}</b></div>
        <div className="stat"><span>Bills paid</span><b>{r.totals.bills}</b></div>
        <div className="stat"><span>Tax collected</span><b>{money(r.totals.tax)}</b></div>
        <div className="stat"><span>Average bill</span><b>{money(r.totals.bills ? r.totals.revenue / r.totals.bills : 0)}</b></div>
      </div>
      <div className="cards">
        <div className="box">
          <h3>Revenue by day</h3>
          {!r.byDay.length && <p className="muted">No paid bills in this period.</p>}
          {r.byDay.map((d) => (
            <div className="bar" key={d._id}>
              <span>{d._id.slice(5)}</span>
              <i style={{ width: `${(d.revenue / max) * 100}%` }} />
              <span>{money(d.revenue)}</span>
            </div>
          ))}
        </div>
        <div className="box">
          <h3>Best sellers</h3>
          {r.topItems.map((i) => <div className="row" key={i._id}><span>{i._id}</span><span>{i.qty} sold · {money(i.revenue)}</span></div>)}
          <h3>Payments</h3>
          {r.byPayment.map((p) => <div className="row" key={p._id}><span>{p._id}</span><span>{p.bills} bills · {money(p.revenue)}</span></div>)}
        </div>
      </div>
    </section>
  );
}

function Menu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: '' });
  const [err, setErr] = useState('');
  const load = () => api('/menu').then(setItems);
  useEffect(() => { load(); }, []);
  const guard = async (fn) => { try { setErr(''); await fn(); await load(); } catch (e) { setErr(e.message); } };

  return (
    <section className="panel">
      <h2>Menu</h2>
      {err && <p className="error">{err}</p>}
      <div className="form-row">
        <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button onClick={() => guard(async () => { await api('/menu', 'POST', { ...form, price: Number(form.price) }); setForm({ name: '', category: '', price: '' }); })}>Add item</button>
      </div>
      <table className="grid">
        <thead><tr><th>Item</th><th>Category</th><th>Price (₹)</th><th>Available</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i._id}>
              <td>{i.name}</td><td>{i.category}</td>
              <td><input className="price" type="number" defaultValue={i.price}
                onBlur={(e) => Number(e.target.value) !== i.price && guard(() => api(`/menu/${i._id}`, 'PUT', { price: Number(e.target.value) }))} /></td>
              <td><input type="checkbox" checked={i.available} onChange={(e) => guard(() => api(`/menu/${i._id}`, 'PUT', { available: e.target.checked }))} /></td>
              <td><button className="link" onClick={() => window.confirm(`Delete ${i.name}?`) && guard(() => api(`/menu/${i._id}`, 'DELETE'))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Tables() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ number: '', seats: 4 });
  const [err, setErr] = useState('');
  const load = () => api('/tables').then(setTables);
  useEffect(() => { load(); }, []);
  const guard = async (fn) => { try { setErr(''); await fn(); await load(); } catch (e) { setErr(e.message); } };

  return (
    <section className="panel">
      <h2>Tables</h2>
      {err && <p className="error">{err}</p>}
      <div className="form-row">
        <input placeholder="Table number" type="number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        <input placeholder="Seats" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
        <button onClick={() => guard(async () => { await api('/tables', 'POST', { number: Number(form.number), seats: Number(form.seats) }); setForm({ number: '', seats: 4 }); })}>Add table</button>
      </div>
      <div className="tables">
        {tables.map((t) => (
          <div key={t._id} className={`table ${t.status}`}>
            <b>{t.number}</b><span>{t.seats} seats</span>
            <button className="link" onClick={() => guard(() => api(`/tables/${t._id}`, 'DELETE'))}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Staff() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'waiter' });
  const [err, setErr] = useState('');
  const load = () => api('/users').then(setUsers);
  useEffect(() => { load(); }, []);
  const guard = async (fn) => { try { setErr(''); await fn(); await load(); } catch (e) { setErr(e.message); } };

  return (
    <section className="panel">
      <h2>Staff accounts</h2>
      {err && <p className="error">{err}</p>}
      <div className="form-row">
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="waiter">Waiter</option><option value="biller">Biller</option><option value="admin">Admin</option>
        </select>
        <button onClick={() => guard(async () => { await api('/users', 'POST', form); setForm({ name: '', username: '', password: '', role: 'waiter' }); })}>Create account</button>
      </div>
      <table className="grid">
        <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.username}</td><td>{u.role}</td>
              <td><input type="checkbox" checked={u.active} onChange={(e) => guard(() => api(`/users/${u._id}`, 'PUT', { active: e.target.checked }))} /></td>
              <td><button className="link" onClick={() => window.confirm(`Delete ${u.name}?`) && guard(() => api(`/users/${u._id}`, 'DELETE'))}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
