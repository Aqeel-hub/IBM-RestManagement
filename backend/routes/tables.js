const router = require('express').Router();
const Table = require('../models/Table');
const { auth } = require('../middleware/auth');

router.get('/', auth(), async (req, res) => res.json(await Table.find().sort('number')));

router.post('/', auth('admin'), async (req, res) => {
  if (await Table.findOne({ number: req.body.number })) return res.status(400).json({ message: 'Table number already exists' });
  res.status(201).json(await Table.create(req.body));
});

router.delete('/:id', auth('admin'), async (req, res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
