const router = require('express').Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');

const populate = (q) => q.populate('table', 'number').populate('waiter', 'name');

router.get('/', auth(), async (req, res) => {
  const q = {};
  if (req.query.status) q.status = { $in: req.query.status.split(',') };
  res.json(await populate(Order.find(q)).sort('-createdAt'));
});

// Place an order. If the table already has an open order, items are added to it.
router.post('/', auth('waiter'), async (req, res) => {
  const { tableId, items, note } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'Add at least one item' });
  const table = await Table.findById(tableId);
  if (!table) return res.status(404).json({ message: 'Table not found' });
  if (table.status === 'billing') return res.status(400).json({ message: 'This table is already with the biller' });

  const menu = await MenuItem.find({ _id: { $in: items.map((i) => i.menuItemId) }, available: true });
  let order = await Order.findOne({ table: table._id, status: 'open' });
  if (!order) order = new Order({ table: table._id, waiter: req.user.id, items: [] });

  for (const i of items) {
    const m = menu.find((x) => x.id === i.menuItemId);
    if (!m || !(i.qty > 0)) continue;
    const existing = order.items.find((x) => String(x.menuItem) === m.id);
    if (existing) existing.qty += i.qty;
    else order.items.push({ menuItem: m._id, name: m.name, price: m.price, qty: i.qty });
  }
  if (!order.items.length) return res.status(400).json({ message: 'None of those items are available' });
  if (note) order.note = note;
  await order.save();
  table.status = 'occupied';
  await table.save();
  res.status(201).json(order);
});

router.delete('/:id/items/:menuItemId', auth('waiter'), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, status: 'open' });
  if (!order) return res.status(404).json({ message: 'Open order not found' });
  order.items = order.items.filter((i) => String(i.menuItem) !== req.params.menuItemId);
  if (!order.items.length) {
    await order.deleteOne();
    await Table.findByIdAndUpdate(order.table, { status: 'free' });
    return res.json({ deleted: true });
  }
  await order.save();
  res.json(order);
});

router.put('/:id/send-to-billing', auth('waiter'), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, status: 'open' });
  if (!order) return res.status(404).json({ message: 'Open order not found' });
  order.status = 'billing';
  await order.save();
  await Table.findByIdAndUpdate(order.table, { status: 'billing' });
  res.json(order);
});

module.exports = router;
