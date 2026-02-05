# TaskPro - Project Management Frontend

A modern, full-featured project management application built with React, TypeScript, and Vite. TaskPro provides an intuitive interface for managing projects, tasks, and team collaboration.

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 📊 **Dashboard** - Overview of all projects and tasks
- 📁 **Project Management** - Create, edit, and manage multiple projects
- ✅ **Task Management** - Organize tasks with drag-and-drop functionality
- 👥 **Collaboration** - Add collaborators and manage project teams
- 💬 **Task Comments** - Communication and discussion on tasks
- 👤 **User Profiles** - Manage user settings and change passwords
- 🎨 **Theme Support** - Light/dark mode toggle
- 🔒 **Protected Routes** - Secure access control for authenticated users

## Tech Stack

- **React 19.2** - Modern UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.2** - Fast build tool and dev server
- **React Router 7.13** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Icons** - Icon library
- **Font Awesome** - Additional icon support
- **React Toastify** - Toast notifications
- **CSS Modules** - Scoped component styling

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── common/       # Shared components (modals, protected routes)
│   ├── layout/       # Layout components (sidebar)
│   ├── projects/     # Project-related components
│   └── tasks/        # Task-related components
├── contexts/         # React context providers
│   ├── AuthContext   # Authentication state management
│   └── ThemeContext  # Theme state management
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Auth/         # Login and registration
│   ├── Dashboard/    # Dashboard, home, and project list
│   └── ProjectDetail/# Project detail view
├── services/         # API service layer
│   ├── api.ts        # Base API configuration
│   ├── authService   # Authentication API calls
│   ├── projectService# Project API calls
│   └── taskService   # Task API calls
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd TaskPro-Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the root directory and add your API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3001` (default port configured in `vite.config.ts`)

## Configuration

### Environment Variables

TaskPro uses Vite's environment variable system. Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080/api
```

**Important Notes:**

- All environment variables must be prefixed with `VITE_` to be exposed to the client-side code
- The `.env` file should never be committed to version control (already in `.gitignore`)
- For production, configure these variables in your hosting platform (Vercel, Netlify, etc.)
- Access environment variables in code using `import.meta.env.VITE_API_BASE_URL`

### Vite Configuration

The `vite.config.ts` file contains the build and development server configuration:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()], // Uses SWC for fast refresh
  server: {
    port: 3001, // Development server port
  },
});
```

**Configuration Options:**

- `plugins: [react()]` - Enables React with SWC compiler for faster builds and hot module replacement (HMR)
- `server.port: 3001` - Sets the development server to run on port 3001 instead of the default 5173
- You can customize additional options like `server.host`, `server.open`, `build.outDir`, etc.

**Common Customizations:**

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true, // Automatically open browser on server start
    host: true, // Expose to network
  },
  build: {
    outDir: "dist", // Output directory for production build
    sourcemap: false, // Disable source maps in production
  },
});
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Key Components

### Authentication

- Login and registration with form validation
- JWT token-based authentication
- Persistent session management

### Project Management

- Create and edit projects
- Manage project collaborators
- View project details and statistics

### Task Management

- Create, edit, and delete tasks
- Task status tracking (To Do, In Progress, Done)
- Task comments and discussions
- Task assignment to team members

### UI/UX Features

- Responsive design for all screen sizes
- Modal-based forms for better UX
- Toast notifications for user feedback
- Theme switching (light/dark mode)
- Protected routes for authenticated pages

## Development

This project uses:

- **ESLint** for code linting
- **TypeScript** for type checking
- **CSS Modules** for component-scoped styling
- **SWC** for fast refresh during development

## Building for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the PerScholas Course Projects.

---

Built with ❤️ using React + TypeScript + Vite
