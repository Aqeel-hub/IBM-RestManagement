require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Table.deleteMany(), MenuItem.deleteMany()]);

  const hash = (p) => bcrypt.hash(p, 10);
  await User.create([
    { name: 'Admin', username: 'admin', password: await hash('admin123'), role: 'admin' },
    { name: 'Ravi (Waiter)', username: 'waiter', password: await hash('waiter123'), role: 'waiter' },
    { name: 'Meena (Biller)', username: 'biller', password: await hash('biller123'), role: 'biller' },
  ]);

  await Table.insertMany(Array.from({ length: 8 }, (_, i) => ({ number: i + 1, seats: i < 4 ? 2 : 4 })));

  await MenuItem.insertMany([
    { name: 'Veg Samosa', category: 'Starters', price: 60 },
    { name: 'Paneer Tikka', category: 'Starters', price: 220 },
    { name: 'Chicken 65', category: 'Starters', price: 240 },
    { name: 'Butter Chicken', category: 'Mains', price: 320 },
    { name: 'Paneer Butter Masala', category: 'Mains', price: 280 },
    { name: 'Veg Biryani', category: 'Mains', price: 200 },
    { name: 'Chicken Biryani', category: 'Mains', price: 260 },
    { name: 'Butter Naan', category: 'Breads', price: 45 },
    { name: 'Parotta', category: 'Breads', price: 30 },
    { name: 'Filter Coffee', category: 'Drinks', price: 40 },
    { name: 'Fresh Lime Soda', category: 'Drinks', price: 70 },
    { name: 'Gulab Jamun', category: 'Desserts', price: 80 },
  ]);

  console.log('Seeded. Logins: admin/admin123, waiter/waiter123, biller/biller123');
  process.exit(0);
})();
