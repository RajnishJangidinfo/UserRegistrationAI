# UserRegistrationAI

A full-stack user registration and management system built with Next.js and ASP.NET Core.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **ASP.NET Core 9.0** - Web API
- **Entity Framework Core 9.0** - ORM
- **SQL Server LocalDB** - Database
- **BCrypt.Net** - Password hashing

## Project Structure

```
UserRegistrationAI/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/
│   │   └── UsersController.cs
│   ├── Models/
│   │   └── User.cs
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   ├── DTOs/
│   │   └── UserDtos.cs
│   └── Program.cs
├── src/                        # Next.js Frontend
│   ├── app/
│   │   ├── dashboard/
│   │   ├── register/
│   │   └── users/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   └── lib/
│       └── api.ts
└── package.json
```

## Features

- ✅ User registration with validation
- ✅ Password hashing with BCrypt
- ✅ User list display
- ✅ Dashboard with charts
- ✅ Responsive sidebar navigation
- ✅ Glassmorphism UI design
- ✅ SQL Server database persistence
- ✅ CORS-enabled API

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 9.0 SDK
- SQL Server LocalDB (included with Visual Studio)

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
dotnet restore
```

### Running the Application

#### Start Backend (Terminal 1)
```bash
cd backend
dotnet run
```
Backend runs on: **http://localhost:5159**

#### Start Frontend (Terminal 2)
```bash
npm run dev
```
Frontend runs on: **http://localhost:3000**

## API Endpoints

### POST /api/users/register
Register a new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "USER"
}
```

### GET /api/users
Get all users (passwords excluded)

## Database

The application uses SQL Server LocalDB with automatic database creation on first run.

**Database Name**: `UserManagementDb`

**Connection String**: 
```
Server=(localdb)\\mssqllocaldb;Database=UserManagementDb;Trusted_Connection=true;TrustServerCertificate=true
```

## Pages

- `/` - Home page
- `/dashboard` - Analytics dashboard with charts
- `/register` - User registration form
- `/users` - User list display

## Development

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd backend
dotnet build
```

## Environment

- Frontend: Next.js development server (port 3000)
- Backend: ASP.NET Core Kestrel (port 5159)
- Database: SQL Server LocalDB

## License

This project is created for demonstration purposes.
