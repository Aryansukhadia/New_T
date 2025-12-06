# 👔 Tailoring Management System

A comprehensive full-stack application for managing tailoring business operations including orders, inventory, measurements, and work pieces.

## 🚀 Quick Start

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### Prerequisites
- Node.js v18+
- Aiven PostgreSQL account

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd New_T

# 2. Setup Backend
cd Backend
npm install
# Create .env file (see SETUP.md)
npx prisma generate
npx prisma migrate dev
npm run seed  # Creates SuperAdmin account

# 3. Setup Frontend
cd ../Frontend
npm install

# 4. Run the application
cd ../Backend
npm run dev:all  # Runs backend, frontend, and Prisma Studio
```

## 📦 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **PostgreSQL** (Aiven) - Database
- **Prisma ORM** - Database management
- **JWT** - Authentication
- **Swagger** - API documentation
- **Multer** - File uploads

### Frontend
- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Redux Toolkit** - State management
- **Axios** - HTTP client

## 🔑 Default Credentials

**SuperAdmin Account** (created by seed script):
```
Email: superadmin@gmail.com
Password: SuperAdmin@123
```
⚠️ **Change password after first login!**

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Prisma Studio**: http://localhost:5555

## 📝 Available Scripts

### Backend (`Backend/` directory)
```bash
npm run dev       # Start development server with nodemon
npm start         # Start production server
npm run seed      # Seed database with SuperAdmin
npm run dev:all   # Run backend + frontend + Prisma Studio
npx prisma studio # Open database GUI
```

### Frontend (`Frontend/` directory)
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## 🏗️ Project Structure

```
New_T/
├── Backend/
│   ├── dbConnect/         # Database configuration with SSL
│   ├── prisma/           # Database schema and seeds
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/       # Authentication, validation
│   ├── uploads/          # File storage
│   └── docs/             # Swagger documentation
│
├── Frontend/
│   ├── src/
│   │   ├── Components/   # Reusable UI components
│   │   ├── Pages/        # Page components
│   │   ├── Services/     # API services
│   │   ├── Context/      # React context providers
│   │   └── Utils/        # Utility functions
│   └── public/           # Static assets
│
└── SETUP.md              # Detailed setup guide
```

## 🎯 Features

### User Management
- Role-based access control (SuperAdmin, Admin, Tailor, Staff)
- User authentication with JWT
- Password management and reset functionality

### Customer Management
- Customer profiles with measurements
- Top and bottom measurements tracking
- Custom measurement management

### Product Management
- Product catalog with variants
- Product items and specifications
- Image upload and management

### Inventory Management
- Fabric inventory tracking
- Accessory inventory management
- Ready-made inventory system

### Order Management
- Order creation and tracking
- Custom tailoring orders
- Work piece assignment and status tracking
- Order details and history

### Work Piece Management
- Individual work piece tracking
- Status updates and progress monitoring
- Tailor assignment
- Detailed work piece information

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based route protection
- SSL/TLS encrypted database connections
- Secure file upload handling

## 📚 Documentation

- **Full Setup Guide**: [SETUP.md](./SETUP.md)
- **API Documentation**: Available at http://localhost:3000/api-docs when server is running
- **Database Schema**: See `Backend/prisma/schema.prisma`

## 🐛 Troubleshooting

For common issues and solutions, refer to the [Troubleshooting section in SETUP.md](./SETUP.md#-troubleshooting).

### Quick Fixes

**Database connection issues:**
```bash
# Verify DATABASE_URL is set in .env
cat Backend/.env | grep DATABASE_URL

# Regenerate Prisma Client
cd Backend
npx prisma generate
```

**Frontend connection issues:**
```bash
# Check if backend is running
curl http://localhost:3000

# Restart frontend
cd Frontend
npm run dev
```

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For detailed setup instructions and troubleshooting, please refer to [SETUP.md](./SETUP.md).

---

**Made with ❤️ for tailoring businesses**

