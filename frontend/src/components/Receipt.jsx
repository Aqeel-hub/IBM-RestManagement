import { money } from '../api';

export default function Receipt({ bill, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="receipt" onClick={(e) => e.stopPropagation()}>
        <h3>Restaurant Desk</h3>
        <p className="muted small">Receipt {bill.receiptNo} · Table {bill.tableNumber}<br />
          {new Date(bill.paidAt || bill.createdAt).toLocaleString('en-IN')}</p>
        <hr />
        {bill.items.map((i, k) => (
          <div className="row" key={k}><span>{i.qty} × {i.name}</span><span>{money(i.qty * i.price)}</span></div>
        ))}
        <hr />
        <div className="row"><span>Subtotal</span><span>{money(bill.subtotal)}</span></div>
        {bill.discount > 0 && <div className="row"><span>Discount</span><span>−{money(bill.discount)}</span></div>}
        <div className="row"><span>Tax ({bill.taxRate}%)</span><span>{money(bill.tax)}</span></div>
        <div className="row total"><span>Total</span><span>{money(bill.total)}</span></div>
        <p className="muted small">{bill.status === 'paid' ? `Paid by ${bill.paymentMethod.toUpperCase()}` : 'Payment pending'}</p>
        <div className="no-print actions">
          <button onClick={() => window.print()}>Print</button>
          <button className="ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
