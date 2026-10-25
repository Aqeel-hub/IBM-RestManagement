const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.use(auth('admin'));

router.get('/', async (req, res) => res.json(await User.find().select('-password').sort('role name')));

router.post('/', async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) return res.status(400).json({ message: 'All fields are required' });
  if (await User.findOne({ username: username.toLowerCase() })) return res.status(400).json({ message: 'Username already taken' });
  const user = await User.create({ name, username, role, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ ...user.toObject(), password: undefined });
});

router.put('/:id', async (req, res) => {
  const update = {};
  ['name', 'role', 'active'].forEach((k) => req.body[k] !== undefined && (update[k] = req.body[k]));
  if (req.body.password) update.password = await bcrypt.hash(req.body.password, 10);
  res.json(await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password'));
});

router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
