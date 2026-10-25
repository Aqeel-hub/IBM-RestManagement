const router = require('express').Router();
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Table = require('../models/Table');
const { auth } = require('../middleware/auth');

const round2 = (n) => Math.round(n * 100) / 100;

router.get('/', auth('biller'), async (req, res) => {
  const q = req.query.status ? { status: req.query.status } : {};
  res.json(await Bill.find(q).populate('biller', 'name').sort('-createdAt').limit(100));
});

// Generate a bill for an order the waiter sent to billing
router.post('/', auth('biller'), async (req, res) => {
  const order = await Order.findById(req.body.orderId).populate('table', 'number');
  if (!order || order.status !== 'billing') return res.status(400).json({ message: 'Order is not ready for billing' });

  const subtotal = round2(order.items.reduce((s, i) => s + i.price * i.qty, 0));
  const discount = Math.min(Math.max(Number(req.body.discount) || 0, 0), subtotal);
  const taxRate = Number(process.env.TAX_RATE ?? 5);
  const tax = round2(((subtotal - discount) * taxRate) / 100);
  const total = round2(subtotal - discount + tax);
  const count = await Bill.countDocuments();

  const bill = await Bill.create({
    receiptNo: 'R' + String(count + 1).padStart(5, '0'),
    order: order._id,
    tableNumber: order.table.number,
    items: order.items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
    subtotal, discount, taxRate, tax, total,
    biller: req.user.id,
  });
  order.status = 'billed';
  await order.save();
  res.status(201).json(bill);
});

// Settle: record payment and free the table
router.put('/:id/settle', auth('biller'), async (req, res) => {
  const { paymentMethod } = req.body;
  if (!['cash', 'card', 'upi'].includes(paymentMethod)) return res.status(400).json({ message: 'Choose a payment method' });
  const bill = await Bill.findById(req.params.id);
  if (!bill || bill.status === 'paid') return res.status(400).json({ message: 'Bill not found or already paid' });
  bill.status = 'paid';
  bill.paymentMethod = paymentMethod;
  bill.paidAt = new Date();
  bill.biller = req.user.id;
  await bill.save();
  await Table.findOneAndUpdate({ number: bill.tableNumber }, { status: 'free' });
  res.json(bill);
});

module.exports = router;
