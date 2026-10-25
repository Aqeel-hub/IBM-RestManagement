# Restaurant Desk: a simple MERN restaurant management system

Roles
- **Waiter**: sees live table status, places orders, adds or removes items, sends a table to billing.
- **Biller**: generates bills (with discount and tax), settles by cash / card / UPI, prints receipts.
- **Admin**: manages menu and prices, tables, staff accounts, and views sales reports. Admin can also use every role's API.

Flow: Waiter places order (table = occupied) → Waiter sends to billing (table = billing) → Biller generates bill → Biller settles (table = free) → Admin sees it in reports.

## Run it

Requirements: Node 18+ and MongoDB running locally (or an Atlas URI in `backend/.env`).

```bash
# 1. backend
cd backend
npm install
npm run seed      # creates demo users, 8 tables, sample menu
npm run dev       # http://localhost:5000

# 2. frontend (new terminal)
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Demo logins: `admin/admin123`, `waiter/waiter123`, `biller/biller123`

Config lives in `backend/.env` (`MONGO_URI`, `JWT_SECRET`, `TAX_RATE`). Change the secret and the demo passwords before deploying.

## API summary
| Route | Who |
|---|---|
| POST /api/auth/login | all |
| /api/users (CRUD) | admin |
| /api/menu (GET all, write admin) | all / admin |
| /api/tables (GET all, write admin) | all / admin |
| POST /api/orders, DELETE /api/orders/:id/items/:itemId, PUT /api/orders/:id/send-to-billing | waiter |
| GET /api/orders?status=open,billing | all |
| POST /api/bills, PUT /api/bills/:id/settle, GET /api/bills | biller |
| GET /api/reports/sales?days=7 | admin |
