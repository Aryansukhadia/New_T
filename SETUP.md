# 🚀 Project Setup Guide

Complete setup guide for the Tailoring Management System with Backend (Node.js + PostgreSQL) and Frontend (React + TypeScript).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Aiven PostgreSQL)](#database-setup-aiven-postgresql)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Seeding the Database](#seeding-the-database)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Aiven PostgreSQL** account - [Sign up](https://aiven.io/)

---

## 🗄️ Database Setup (Aiven PostgreSQL)

### Step 1: Create Aiven PostgreSQL Service

1. Go to [Aiven Console](https://console.aiven.io/)
2. Create a new PostgreSQL service
3. Wait for the service to be ready (usually 2-5 minutes)

### Step 2: Get Connection String

From the Aiven Console → Your Service → Overview:

Find the **Service URI** which looks like:
```
postgres://avnadmin:PASSWORD@your-service.aivencloud.com:12345/defaultdb?sslmode=require
```

**Copy this entire connection string** - you'll need it for the `.env` file.

### Step 3: Whitelist Your IP (if needed)

1. Go to "Allowed IP Addresses" in Aiven Console
2. Add your public IP or use `0.0.0.0/0` for testing (not recommended for production)

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# Paste your complete Service URI from Aiven Console here
DATABASE_URL="postgresql://avnadmin:YOUR_PASSWORD@your-service.aivencloud.com:12345/defaultdb?sslmode=require"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URLs (comma-separated, no spaces)
FRONTEND_URLS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

**Important Notes:**
- **DATABASE_URL**: Copy the complete Service URI from Aiven Console (Step 2)
- Make sure `?sslmode=require` is at the end of DATABASE_URL
- **JWT_SECRET**: Use a strong, random string (generate with a password manager)
- **FRONTEND_URLS**: Add all domains that should access your API (comma-separated)

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Run Database Migrations

```bash
npx prisma migrate dev
```

This will:
- Create all tables in your database
- Apply the schema from `prisma/schema.prisma`

### Step 6: Seed the Database (Create SuperAdmin)

```bash
npx prisma db seed
```

or

```bash
npm run seed
```

This creates a SuperAdmin account:
- **Email**: `superadmin@gmail.com`
- **Password**: `SuperAdmin@123`
- **Role**: `superAdmin`

**⚠️ Important**: Change this password after first login!

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../Frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)

If your backend runs on a different port or host, create `.env` in the `Frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

**Default**: The frontend expects the backend at `http://localhost:3000`

---

## ▶️ Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Option 2: Run Everything Concurrently (Backend Only)

From the Backend directory:

```bash
npm run dev:all
```

This runs:
- Backend server (nodemon)
- Frontend dev server (Vite)
- Prisma Studio (database GUI)

### Access Points:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Prisma Studio**: http://localhost:5555

---

## 🌱 Seeding the Database

### Run Seed Script

```bash
cd Backend
npx prisma db seed
```

or

```bash
npm run seed
```

### What Gets Created:

The seed script creates a SuperAdmin user:

```
✅ SuperAdmin created successfully!
📧 Email: superadmin@gmail.com
🔑 Password: SuperAdmin@123
👤 Role: superAdmin
```

### Login with SuperAdmin:

1. Go to http://localhost:5173
2. Click "Login"
3. Enter:
   - **Email**: `superadmin@gmail.com`
   - **Password**: `SuperAdmin@123`
4. **Change password** on first login (resetPassword flag is set to true)

---

## 🐛 Troubleshooting

### Database Connection Issues

#### Error: "DATABASE_URL environment variable is required"

**Solution**: Add DATABASE_URL to your `.env` file:

```env
DATABASE_URL="postgresql://avnadmin:PASSWORD@host:port/defaultdb?sslmode=require"
```

Copy the complete Service URI from Aiven Console.

#### Error: "Connection refused" or "Connection timeout"

**Solutions**:
- ✅ Verify your Aiven service is running (not paused in Aiven Console)
- ✅ Check if your IP is whitelisted in Aiven Console → Allowed IP Addresses
- ✅ Verify DATABASE_URL is correct (copy from Aiven Console Service URI)
- ✅ Ensure DATABASE_URL includes `?sslmode=require` at the end

#### Error: "password authentication failed"

**Solutions**:
- ✅ Copy the complete Service URI directly from Aiven Console
- ✅ Ensure no extra spaces in DATABASE_URL
- ✅ Check that password in DATABASE_URL matches Aiven
- ✅ If password contains special characters (@, :, /, etc.), they should be URL-encoded

### Prisma Issues

#### Error: "Prisma Client is not generated"

**Solution**:
```bash
cd Backend
npx prisma generate
```

#### Error: "Migration failed"

**Solution**:
```bash
# Reset the database (⚠️ WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name init
```

### Frontend Issues

#### Error: "Cannot connect to backend API"

**Solutions**:
- ✅ Ensure backend is running on port 3000
- ✅ Check if `VITE_API_URL` is set correctly
- ✅ Verify CORS is enabled in backend (already configured)

#### Error: "Module not found" or TypeScript errors

**Solution**:
```bash
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

**Backend (Port 3000)**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Frontend (Port 5173)**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Quick Command Reference

### Backend Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
npm run seed

# Open Prisma Studio
npx prisma studio

# Run all (backend + frontend + prisma studio)
npm run dev:all
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🔐 Default Credentials

**SuperAdmin Account** (created by seed script):
- **Email**: `superadmin@gmail.com`
- **Password**: `SuperAdmin@123`
- **Role**: `superAdmin`

**⚠️ Security Note**: 
- Change the SuperAdmin password immediately after first login
- Update `JWT_SECRET` in `.env` before production
- Never commit `.env` files to version control
- Use strong, unique passwords

---

## 🎯 Next Steps

After successful setup:

1. ✅ Login with SuperAdmin credentials
2. ✅ Change default password
3. ✅ Create additional users and roles
4. ✅ Configure your tailoring products
5. ✅ Add inventory items
6. ✅ Start managing orders

---

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Material-UI Docs**: https://mui.com/
- **Aiven Docs**: https://docs.aiven.io/

---

## 🆘 Need Help?

If you encounter any issues not covered in this guide:

1. Check the error message carefully
2. Verify all environment variables are correct
3. Ensure all prerequisites are installed
4. Check that services (database, backend) are running
5. Review the troubleshooting section

---

## 📄 Project Structure

```
New_T/
├── Backend/
│   ├── dbConnect/
│   │   ├── database.js       # PostgreSQL connection (uses DATABASE_URL)
│   │   └── prismaClient.js   # Prisma client instance
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Database seeder
│   ├── routes/               # API routes
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth, validation, etc.
│   ├── uploads/              # File uploads directory
│   ├── .env                  # Environment variables (create this)
│   ├── index.js              # Server entry point
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── Components/       # Reusable components
│   │   ├── Pages/            # Page components
│   │   ├── Services/         # API services
│   │   ├── Context/          # React context
│   │   ├── Utils/            # Utility functions
│   │   └── main.tsx          # App entry point
│   ├── .env                  # Frontend config (optional)
│   ├── package.json
│   └── vite.config.ts
│
├── SETUP.md                  # This file - complete setup guide
├── README.md                 # Project overview
└── QUICK_START.md            # Quick reference guide
```

---

**🎉 You're all set! Happy coding!**

