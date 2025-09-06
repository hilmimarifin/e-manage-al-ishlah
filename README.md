# RBAC Starter Application

A complete Role-Based Access Control (RBAC) starter application built with Next.js 15, featuring JWT authentication, user management, and granular permission control.

## Features

- 🔐 **JWT Authentication** - Secure login/register with access and refresh tokens
- 👥 **User Management** - Complete CRUD operations for user accounts
- 🛡️ **Role-Based Access Control** - Granular permissions system
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🗄️ **Database** - PostgreSQL with Prisma ORM
- ⚡ **Performance** - React Query for efficient data fetching
- 🔄 **State Management** - Zustand for global state

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your database URL and JWT secrets:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/rbac_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   REFRESH_SECRET="your-super-secret-refresh-key-here"
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed the database with initial data
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Default Credentials

After seeding the database, you can use these default accounts:

- **Admin Account**: 
  - Email: `admin@example.com`
  - Password: `admin123`

- **User Account**:
  - Email: `user@example.com` 
  - Password: `user123`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── users/            # User management page
│   ├── roles/            # Role management page
│   └── menus/            # Menu management page
├── components/            # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── store/                # Zustand stores
└── prisma/               # Database schema and migrations
```

## Database Schema

The application uses a clean RBAC model:

- **Users**: System users with email, username, and assigned role
- **Roles**: User roles (admin, user, etc.) with descriptions
- **Menus**: Navigation menu items with hierarchy support
- **RoleMenus**: Junction table for role-to-menu permissions (CRUD)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Roles (Admin only)  
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role

### Menus
- `GET /api/menus` - List menus (all for admin, user's menus for others)
- `POST /api/menus` - Create menu (admin only)
- `PUT /api/menus/[id]` - Update menu (admin only)
- `DELETE /api/menus/[id]` - Delete menu (admin only)

## Customization

### Adding New Roles
1. Use the admin interface to create new roles
2. Assign appropriate menu permissions
3. Users with the new role will see only authorized menus

### Adding New Menu Items
1. Create menu items through the admin interface
2. Set appropriate icons from the available Lucide icons
3. Assign permissions to roles as needed

### Extending Permissions
The RoleMenu model supports four permission types:
- `canRead` - View access
- `canWrite` - Create access  
- `canUpdate` - Edit access
- `canDelete` - Delete access

## Security Features

- JWT token-based authentication with refresh token rotation
- Password hashing with bcrypt
- Protected API routes with role validation
- HTTP-only cookies for refresh tokens
- Client-side route protection

## Development Commands

```bash
# Database operations
npm run db:migrate     # Run database migrations
npm run db:generate    # Generate Prisma client
npm run db:seed        # Seed database with initial data
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database (careful!)

# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this starter for your projects!