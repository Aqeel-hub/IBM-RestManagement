import { useEffect, useState } from 'react';
import { api, money } from '../api';
import Receipt from '../components/Receipt.jsx';

export default function Biller() {
  const [orders, setOrders] = useState([]);
  const [pending, setPending] = useState([]);
  const [paid, setPaid] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [o, p, d] = await Promise.all([api('/orders?status=billing'), api('/bills?status=pending'), api('/bills?status=paid')]);
    setOrders(o); setPending(p); setPaid(d.slice(0, 15));
  };
  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  const run = async (fn, ok) => {
    try { const r = await fn(); setMsg(ok); await load(); return r; } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="stack">
      {msg && <p className="notice">{msg}</p>}

      <section className="panel">
        <h2>Waiting for a bill</h2>
        {!orders.length && <p className="muted">No tables are waiting right now.</p>}
        <div className="cards">
          {orders.map((o) => (
            <div className="box" key={o._id}>
              <h3>Table {o.table.number}</h3>
              {o.items.map((i) => <div className="row" key={i.menuItem}><span>{i.qty} × {i.name}</span><span>{money(i.qty * i.price)}</span></div>)}
              <div className="row total"><span>Subtotal</span><span>{money(o.items.reduce((s, i) => s + i.qty * i.price, 0))}</span></div>
              <input type="number" min="0" placeholder="Discount (₹)" value={discounts[o._id] || ''}
                onChange={(e) => setDiscounts({ ...discounts, [o._id]: e.target.value })} />
              <button onClick={() => run(() => api('/bills', 'POST', { orderId: o._id, discount: discounts[o._id] }), 'Bill generated')}>Generate bill</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Bills to settle</h2>
        {!pending.length && <p className="muted">Nothing to settle.</p>}
        <div className="cards">
          {pending.map((b) => (
            <div className="box" key={b._id}>
              <h3>Table {b.tableNumber} · {money(b.total)}</h3>
              <p className="muted small">Subtotal {money(b.subtotal)} · Discount {money(b.discount)} · Tax {money(b.tax)}</p>
              <div className="actions">
                {['cash', 'card', 'upi'].map((m) => (
                  <button key={m} onClick={() => run(async () => {
                    const bill = await api(`/bills/${b._id}/settle`, 'PUT', { paymentMethod: m });
                    setReceipt(bill);
                  }, `Paid by ${m}. Table is free.`)}>Paid by {m}</button>
                ))}
              </div>
              <button className="link" onClick={() => setReceipt(b)}>Preview bill</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Recent settlements</h2>
        <table className="grid">
          <thead><tr><th>Receipt</th><th>Table</th><th>Total</th><th>Method</th><th>Time</th><th></th></tr></thead>
          <tbody>
            {paid.map((b) => (
              <tr key={b._id}>
                <td>{b.receiptNo}</td><td>{b.tableNumber}</td><td>{money(b.total)}</td><td>{b.paymentMethod}</td>
                <td>{new Date(b.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td><button className="link" onClick={() => setReceipt(b)}>Receipt</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {receipt && <Receipt bill={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
