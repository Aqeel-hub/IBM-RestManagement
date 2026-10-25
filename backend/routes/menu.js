const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');

router.get('/', auth(), async (req, res) => res.json(await MenuItem.find().sort('category name')));
router.post('/', auth('admin'), async (req, res) => res.status(201).json(await MenuItem.create(req.body)));
router.put('/:id', auth('admin'), async (req, res) =>
  res.json(await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/:id', auth('admin'), async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
