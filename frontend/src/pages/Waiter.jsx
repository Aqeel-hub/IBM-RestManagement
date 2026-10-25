import { useEffect, useState } from 'react';
import { api, money } from '../api';

export default function Waiter() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState({});
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [t, m, o] = await Promise.all([api('/tables'), api('/menu'), api('/orders?status=open')]);
    setTables(t); setMenu(m.filter((i) => i.available)); setOrders(o);
  };
  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  const table = tables.find((t) => t._id === selected);
  const order = orders.find((o) => o.table._id === selected);
  const cartItems = Object.entries(cart).filter(([, q]) => q > 0);
  const categories = [...new Set(menu.map((i) => i.category))];

  const run = async (fn, ok) => {
    try { await fn(); setMsg(ok); setCart({}); await load(); } catch (e) { setMsg(e.message); }
  };
  const change = (id, d) => setCart({ ...cart, [id]: Math.max(0, (cart[id] || 0) + d) });

  const place = () => run(
    () => api('/orders', 'POST', { tableId: selected, items: cartItems.map(([menuItemId, qty]) => ({ menuItemId, qty })) }),
    'Order sent to the kitchen'
  );

  return (
    <div className="split">
      <section className="panel">
        <h2>Tables</h2>
        <div className="tables">
          {tables.map((t) => (
            <button key={t._id} className={`table ${t.status} ${selected === t._id ? 'sel' : ''}`}
              onClick={() => { setSelected(t._id); setCart({}); setMsg(''); }}>
              <b>{t.number}</b>
              <span>{t.status === 'free' ? `${t.seats} seats` : t.status}</span>
            </button>
          ))}
        </div>
        {!tables.length && <p className="muted">No tables yet. Ask an admin to add some.</p>}
      </section>

      <section className="panel">
        {!table ? <p className="muted">Pick a table to start an order.</p> : (
          <>
            <h2>Table {table.number}</h2>
            {msg && <p className="notice">{msg}</p>}

            {order && (
              <div className="box">
                <h3>Current order</h3>
                {order.items.map((i) => (
                  <div className="row" key={i.menuItem}>
                    <span>{i.qty} × {i.name}</span>
                    <span>{money(i.qty * i.price)}
                      <button className="link" onClick={() => run(() => api(`/orders/${order._id}/items/${i.menuItem}`, 'DELETE'), 'Item removed')}>Remove</button>
                    </span>
                  </div>
                ))}
                <div className="row total"><span>Subtotal</span><span>{money(order.items.reduce((s, i) => s + i.qty * i.price, 0))}</span></div>
                <button onClick={() => run(() => api(`/orders/${order._id}/send-to-billing`, 'PUT'), 'Sent to the biller')}>Send to billing</button>
              </div>
            )}

            {table.status !== 'billing' ? (
              <>
                <h3>Add items</h3>
                {categories.map((c) => (
                  <div key={c} className="cat">
                    <h4>{c}</h4>
                    {menu.filter((i) => i.category === c).map((i) => (
                      <div className="row" key={i._id}>
                        <span>{i.name} <span className="muted">{money(i.price)}</span></span>
                        <span className="qty">
                          <button className="ghost" onClick={() => change(i._id, -1)}>−</button>
                          <b>{cart[i._id] || 0}</b>
                          <button className="ghost" onClick={() => change(i._id, 1)}>+</button>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                <button disabled={!cartItems.length} onClick={place}>
                  {order ? 'Add to order' : 'Place order'} ({cartItems.reduce((s, [, q]) => s + q, 0)} items)
                </button>
              </>
            ) : <p className="muted">This table is with the biller.</p>}
          </>
        )}
      </section>
    </div>
  );
}
