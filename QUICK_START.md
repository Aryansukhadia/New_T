# ⚡ Quick Reference Card

## 🚀 Setup in 5 Minutes

### 1. Install Dependencies
```bash
# Backend
cd Backend && npm install

# Frontend  
cd ../Frontend && npm install
```

### 2. Configure Environment
Create `Backend/.env`:
```env
PORT=3000
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=12345
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your-password
DATABASE_URL="postgresql://avnadmin:password@host:port/defaultdb?sslmode=require"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Setup Database
```bash
cd Backend
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 4. Run Application
```bash
npm run dev:all
```

---

## 📋 Essential Commands

### Database Operations
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create SuperAdmin
npm run seed

# Open database GUI
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset
```

### Server Commands
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Run everything (backend + frontend + DB GUI)
npm run dev:all
```

---

## 🔑 Default Login

```
URL: http://localhost:5173
Email: superadmin@gmail.com
Password: SuperAdmin@123
```

**⚠️ Change password after first login!**

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| API Docs | http://localhost:3000/api-docs |
| Prisma Studio | http://localhost:5555 |

---

## 🐛 Common Issues

### "Cannot connect to database"
```bash
# Check CA certificate exists
ls Backend/dbConnect/ca.pem

# Verify .env credentials
cat Backend/.env
```

### "Prisma Client not generated"
```bash
cd Backend
npx prisma generate
```

### "Port already in use"
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Project Tech Stack

**Backend:** Node.js + Express + PostgreSQL + Prisma  
**Frontend:** React + TypeScript + MUI + Vite  
**Database:** Aiven PostgreSQL (Cloud)  
**Auth:** JWT + bcrypt

---

## 🎯 Quick Workflow

1. ✅ Setup environment (`.env`)
2. ✅ Install dependencies (`npm install`)
3. ✅ Generate Prisma Client (`npx prisma generate`)
4. ✅ Run migrations (`npx prisma migrate dev`)
5. ✅ Seed database (`npm run seed`)
6. ✅ Start server (`npm run dev:all`)
7. ✅ Login with SuperAdmin
8. ✅ Change default password
9. ✅ Start using the app!

---

**Need more details?** → See [SETUP.md](./SETUP.md)

