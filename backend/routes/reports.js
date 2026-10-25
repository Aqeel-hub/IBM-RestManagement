const router = require('express').Router();
const Bill = require('../models/Bill');
const { auth } = require('../middleware/auth');

router.get('/sales', auth('admin'), async (req, res) => {
  const days = Number(req.query.days) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);
  const match = { status: 'paid', paidAt: { $gte: since } };

  const [totals] = await Bill.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: '$total' }, tax: { $sum: '$tax' }, bills: { $sum: 1 } } },
  ]);
  const byDay = await Bill.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$total' }, bills: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const byPayment = await Bill.aggregate([
    { $match: match },
    { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, bills: { $sum: 1 } } },
  ]);
  const topItems = await Bill.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
    { $sort: { qty: -1 } },
    { $limit: 5 },
  ]);

  res.json({ days, totals: totals || { revenue: 0, tax: 0, bills: 0 }, byDay, byPayment, topItems });
});

module.exports = router;
